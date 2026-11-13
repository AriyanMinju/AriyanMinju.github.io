/**
 * Leads Expert — AI Lead Planner Worker (Cloudflare Workers + Workers AI)
 *
 * Powers the "AI Lead Planner" section of the website:
 *   POST /plan  { mode: "order", text: "I need 3,000 dentists in Texas..." }  -> { result: { leadCat, country, quantity, ... } }
 *   POST /plan  { mode: "icp",   text: "We sell POS software to restaurants" } -> { result: { summary, industries, titles, ... } }
 *
 * No API key needed: it uses Cloudflare's own Workers AI (free daily allowance).
 * Setup: see AI-PLANNER-SETUP.md (create Worker, paste this file, add a Workers AI binding named AI).
 *
 * The website checks and cleans every answer, and falls back to its built-in reader
 * if this Worker is slow or unavailable, so visitors always get a result.
 */

const ALLOWED_ORIGINS = [
  'https://ariyanminju.github.io',
  'https://kamruzzamanminju.com',
  'https://www.kamruzzamanminju.com',
];
const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MAX_REQUESTS_PER_MINUTE = 8;   // per visitor IP
const MAX_TEXT = 600;

const LEAD_CATS = [
  'Amazon Leads', 'Amazon Private Label', 'Lead Generation', 'Event Leads', 'Real Estate Leads', 'Ecommerce (Stripe / Gmail)',
  'Shopify Store Leads', 'Shopify + Mailchimp Users', 'Etsy Seller Leads', 'Otto Leads', 'Kaufland Leads', 'Venture Capital Leads',
  'Investor Leads', "Women's ERG Research", 'SPF/DMARC/DKIM & GA4/GTM Issue Leads', 'All Leads Categories You Want', 'Other (not listed)',
];
const AMAZON_COUNTRIES = ['USA', 'United Kingdom', 'Germany', 'Spain', 'Australia', 'France', 'Mexico'];
const AMAZON_CATEGORIES = [
  'Home & Kitchen', 'Beauty & Personal Care', 'Health & Household', 'Sports & Outdoors', 'Toys & Games', 'Pet Supplies', 'Electronics',
  'Clothing, Shoes & Jewelry', 'Grocery & Gourmet Food', 'Baby', 'Tools & Home Improvement', 'Patio, Lawn & Garden', 'Automotive',
  'Office Products', 'Arts, Crafts & Sewing',
];

const ORDER_PROMPT = `You turn a visitor's request for sales leads into a structured order for Minju's lead generation service.
Return ONLY JSON with these keys:
- leadCat: one of ${JSON.stringify(LEAD_CATS)}. Use "Amazon Private Label" for Amazon private label sellers, "Amazon Leads" for other Amazon sellers, "Lead Generation" for general B2B decision-makers or local businesses (dentists, restaurants, SaaS CEOs, agencies...).
- country: the country in English (use "USA" for the United States, "United Kingdom" for the UK). For Amazon categories it must be one of ${JSON.stringify(AMAZON_COUNTRIES)}. Use "Other" for worldwide or several countries. null if not mentioned.
- quantity: number of leads wanted as an integer, or null. Do NOT confuse revenue amounts with quantity.
- phone: true only if they want phone numbers.
- revenue: for Amazon only, monthly revenue in USD as {"min": number, "max": number or null}, else null.
- amazonCategory: for Amazon only, one of ${JSON.stringify(AMAZON_CATEGORIES)} or null.
- sellerTypes: for Amazon only, any of ["Private label","FBA","FBM","Reseller"], else [].
- category: for non-Amazon, a short description of WHO the leads are (e.g. "Dentists", "CEOs of SaaS companies"), max 60 characters, else "".
- location: for non-Amazon, a city/state/region if mentioned, else "".
- zip: ZIP or postal codes if given, else "".
- note: one friendly sentence (max 30 words) confirming what you understood, written as Minju ("I"). Never invent prices.`;

const ICP_PROMPT = `You are a B2B lead generation expert. A visitor describes their business. Work out who their best customers are, so they can buy a targeted lead list.
Return ONLY JSON with these keys:
- summary: one sentence describing their ideal customers (max 25 words).
- industries: 3-5 specific industries or customer types to target.
- titles: 3-5 job titles of the decision-makers to contact.
- companySize: short text, e.g. "10-200 employees".
- countries: 2-4 best countries to start with (use "USA" and "United Kingdom" for those two).
- leadCat: the best matching lead type, one of ${JSON.stringify(LEAD_CATS)}.
- quantity: suggested first order size as an integer between 1000 and 10000.
- tip: one practical outreach tip (max 25 words).`;

const SCHEMAS = {
  order: {
    type: 'object',
    properties: {
      leadCat: { type: 'string' }, country: { type: ['string', 'null'] }, quantity: { type: ['integer', 'null'] }, phone: { type: 'boolean' },
      revenue: { type: ['object', 'null'], properties: { min: { type: 'number' }, max: { type: ['number', 'null'] } } },
      amazonCategory: { type: ['string', 'null'] }, sellerTypes: { type: 'array', items: { type: 'string' } },
      category: { type: 'string' }, location: { type: 'string' }, zip: { type: 'string' }, note: { type: 'string' },
    },
    required: ['leadCat', 'country', 'quantity', 'phone', 'note'],
  },
  icp: {
    type: 'object',
    properties: {
      summary: { type: 'string' }, industries: { type: 'array', items: { type: 'string' } }, titles: { type: 'array', items: { type: 'string' } },
      companySize: { type: 'string' }, countries: { type: 'array', items: { type: 'string' } }, leadCat: { type: 'string' },
      quantity: { type: 'integer' }, tip: { type: 'string' },
    },
    required: ['summary', 'industries', 'titles', 'companySize', 'countries', 'leadCat', 'quantity'],
  },
};

// ---------------------------------------------------------------- helpers
function originOk(origin) {
  return ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
}
function cors(origin) {
  const ok = originOk(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, cors(origin)) });
}
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60000);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_REQUESTS_PER_MINUTE;
}
function parseAnswer(out) {
  let r = out && out.response !== undefined ? out.response : out;
  if (r && typeof r === 'object') return r;
  if (typeof r !== 'string') return null;
  const m = r.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

// ---------------------------------------------------------------- worker
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') return json({ ok: true, service: 'AI Lead Planner' }, 200, origin);
    if (request.method !== 'POST' || url.pathname !== '/plan') return json({ error: 'Not found' }, 404, origin);
    if (!originOk(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
    if (!env.AI) return json({ error: 'Workers AI binding "AI" is missing' }, 500, origin);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (limited(ip)) return json({ error: 'Too many requests, please wait a minute.' }, 429, origin);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400, origin); }
    const mode = body && body.mode === 'icp' ? 'icp' : 'order';
    const text = String((body && body.text) || '').trim().slice(0, MAX_TEXT);
    if (text.length < 4) return json({ error: 'Text is too short' }, 400, origin);

    try {
      const out = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: mode === 'icp' ? ICP_PROMPT : ORDER_PROMPT },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_schema', json_schema: SCHEMAS[mode] },
        max_tokens: 700,
        temperature: 0.2,
      });
      const result = parseAnswer(out);
      if (!result) return json({ error: 'AI gave no usable answer' }, 502, origin);
      return json({ result }, 200, origin);
    } catch (e) {
      return json({ error: 'AI request failed' }, 502, origin);
    }
  },
};
