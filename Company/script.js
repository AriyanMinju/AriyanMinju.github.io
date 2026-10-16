/* =========================================================
   Leads Expert — shared site script
   ========================================================= */
(function(){
  'use strict';
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WEB3FORMS_KEY = '7df4e95a-d03c-424e-8ab6-084da23f16b3';
  const CHAT_WORKER_URL = 'https://minju-chatbot.kamruzzamanmju.workers.dev';

  /* ---------- Mobile menu ---------- */
  const toggle = $('.nav-toggle'), links = $('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', links).forEach((a) => a.addEventListener('click', () => { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
  }

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
    $$('.reveal').forEach((el) => io.observe(el));
  } else { $$('.reveal').forEach((el) => el.classList.add('in')); }

  /* ---------- Count-up numbers ---------- */
  function countUp(el){
    const to = parseInt(el.dataset.to, 10), suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = to.toLocaleString('en-US') + suffix; return; }
    const start = performance.now(), dur = 1600;
    (function tick(now){
      const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * to).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = to.toLocaleString('en-US') + suffix;
    })(start);
  }
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } }), { threshold: 0.5 });
    $$('[data-to]').forEach((el) => co.observe(el));
  } else { $$('[data-to]').forEach(countUp); }

  /* ---------- Global reach bars ---------- */
  if ('IntersectionObserver' in window) {
    const bo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.width + '%'; bo.unobserve(e.target); } }), { threshold: 0.4 });
    $$('.reach-bar').forEach((b) => bo.observe(b));
  } else { $$('.reach-bar').forEach((b) => { b.style.width = b.dataset.width + '%'; }); }

  /* ---------- Hero typing line ---------- */
  (function(){
    const el = $('#heroTyped');
    if (!el || reduceMotion) return;
    const words = ['Amazon seller leads', 'B2B decision-maker leads', 'Ecommerce store leads', 'LinkedIn prospect lists', 'Investor & VC contacts'];
    let w = 0, i = words[0].length, deleting = true;
    function tick(){
      const word = words[w];
      if (deleting) { i--; el.textContent = word.slice(0, i); if (i <= 0) { deleting = false; w = (w + 1) % words.length; } setTimeout(tick, 35); }
      else { const next = words[w]; i++; el.textContent = next.slice(0, i); if (i >= next.length) { deleting = true; setTimeout(tick, 1800); } else setTimeout(tick, 65); }
    }
    setTimeout(tick, 2200);
  })();

  /* ---------- Forms (Web3Forms) ---------- */
  function wireForm(form){
    const ok = $('.form-msg.ok', form), err = $('.form-msg.err', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (ok) ok.classList.remove('show'); if (err) err.classList.remove('show');
      const btn = $('button[type="submit"]', form); if (btn) btn.disabled = true;
      try {
        const data = new FormData(form);
        if (!data.get('access_key')) data.append('access_key', WEB3FORMS_KEY);
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('send failed');
        if (ok) ok.classList.add('show');
        $$('input, select, textarea, button', form).forEach((el) => { el.disabled = true; });
      } catch (x) { if (err) err.classList.add('show'); if (btn) btn.disabled = false; }
    });
  }
  $$('form.js-form').forEach(wireForm);

  /* ---------- "Request custom leads" pop-up ---------- */
  const modal = $('#leadModal');
  let lastFocus = null;
  function openModal(type, prefill){
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    const sel = $('#mType', modal), other = $('#mOtherWrap', modal);
    if (type && sel) { sel.value = Array.from(sel.options).some((o) => o.value === type) ? type : 'Other (not listed)'; }
    if (other && sel) other.hidden = sel.value !== 'Other (not listed)';
    if (prefill) $('#mDesc', modal).value = prefill;
    setTimeout(() => { const f = $('#mName', modal); if (f) f.focus(); }, 50);
  }
  function closeModal(){ if (!modal) return; modal.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $$('[data-open-lead]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openModal(b.dataset.leadType, b.dataset.prefill); }));
  if (modal) {
    $('.modal-close', modal).addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    const sel = $('#mType', modal), other = $('#mOtherWrap', modal);
    if (sel && other) sel.addEventListener('change', () => { other.hidden = sel.value !== 'Other (not listed)'; });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeLightbox(); } });

  /* ---------- Portfolio: lightbox + fallback icon if an image is missing ---------- */
  const lb = $('#lightbox'), lbImg = lb ? $('img', lb) : null;
  function closeLightbox(){ if (lb && lb.classList.contains('open')) { lb.classList.remove('open'); document.body.style.overflow = ''; } }
  const ICON = '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect x="12" y="14" width="40" height="36" rx="5" stroke="#1261FF" stroke-width="2"/><path d="M12 24h40M12 34h40M25 14v36M39 14v36" stroke="#1261FF" stroke-width="2"/><circle cx="46" cy="46" r="9" fill="#22D3EE"/><path d="m42 46 3 3 5-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $$('.work-thumb img').forEach((img) => {
    const fail = () => { const box = img.parentElement; if (box) { box.innerHTML = ICON; box.style.cursor = 'default'; } };
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail);
    img.addEventListener('click', () => { if (!lb) return; lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
  });
  if (lb) lb.addEventListener('click', closeLightbox);

  /* ---------- Services tabs ---------- */
  const specialtyData = {
    leadgen: { title: "Lead Generation", items: ["B2B Lead Generation","Amazon Seller Leads","B2C Lead Generation","LinkedIn Lead Generation","Email Lead Generation","Sales Prospecting","Prospect List Building","Contact List Building","Email List Building","Web Research","Market Research","Data Mining","Data Collection","Data Entry","CRM Data Management","CRM Data Cleaning","Lead Qualification","Cold Email Prospecting","LinkedIn Outreach","Influencer Research","Company Research","Decision Maker Research","Skip Tracing","Real Estate Lead Generation","E-commerce Lead Generation","Healthcare Lead Generation","SaaS Lead Generation","Financial Services Lead Generation","Recruitment Lead Generation","Local Business Lead Generation"] },
    research: { title: "Research &amp; Data Collection", items: ["Web Research","Market Research","Company Research","Competitor Research","Product Research","Internet Research","Business Research","Industry Research","Academic Research","Data Collection","Data Mining","Data Extraction","Contact Research","Email Research","LinkedIn Research","Prospect Research","Lead Research","Survey Research","Keyword Research","Influencer Research","Real Estate Research","Supplier Research","Vendor Research","Customer Research","Pricing Research","Statistical Data Research","Public Records Research","Online Database Research","CRM Data Enrichment"] },
    data: { title: "Data &amp; File Services", items: ["Data Entry","Data Processing","Data Cleaning","Data Formatting","Data Conversion","Data Collection","Data Extraction","Data Mining","PDF to Excel","PDF to Word","Image to Excel","Image to Word","Copy &amp; Paste Tasks","Spreadsheet Management","Microsoft Excel","Google Sheets","CSV File Management","File Conversion","File Organization","Document Formatting","OCR (Optical Character Recognition)","Database Management","CRM Data Entry","CRM Data Cleanup","Data Validation","Data Annotation","Data Labeling","Catalog Data Entry","Product Data Upload","File Merging &amp; Splitting","File Renaming","Duplicate Data Removal","Data Deduplication","Data Enrichment","Data Quality Assurance"] },
  };
  (function(){
    const panel = $('#tabPanel'), tabs = $$('.tab-btn');
    if (!panel || !tabs.length) return;
    function render(key){
      const data = specialtyData[key]; if (!data) return;
      const LIMIT = 12;
      const items = data.items.map((t, n) => '<li' + (n >= LIMIT ? ' class="extra" hidden' : '') + '>' + t + '</li>').join('');
      const more = data.items.length > LIMIT ? '<button type="button" class="more-btn">Show all ' + data.items.length + ' services</button>' : '';
      panel.innerHTML = '<div class="tab-panel-inner"><h3>' + data.title + '</h3><ul>' + items + '</ul>' + more + '</div>';
      const btn = $('.more-btn', panel);
      if (btn) btn.addEventListener('click', () => {
        const open = btn.dataset.open === '1';
        $$('.extra', panel).forEach((li) => { li.hidden = open; });
        btn.dataset.open = open ? '0' : '1';
        btn.textContent = open ? 'Show all ' + data.items.length + ' services' : 'Show fewer';
      });
    }
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('active'); t.setAttribute('aria-selected', 'true');
      render(t.dataset.spec);
    }));
    render(tabs[0].dataset.spec);
  })();

  /* ---------- "How a request works" chat demo ---------- */
  const conversations = {
    amazon: [
      { side: "client", text: "Hi Minju, I'm looking for Amazon seller leads — specifically private label sellers." },
      { side: "minju", text: "Happy to help! What monthly revenue range are you targeting?" },
      { side: "client", text: "We need sellers doing $50K+ in monthly revenue." },
      { side: "minju", text: "Got it — private label, $50K+ monthly revenue. How many leads do you need, and in what batch size?" },
      { side: "client", text: "5,000 leads per batch. We'll also need personal phone numbers included, not just business lines." },
      { side: "minju", text: "Understood — 5,000 private label Amazon sellers, $50K+ monthly revenue, with personal phone numbers. I'll put together a free sample first so you can check quality before we run the full batch." },
      { side: "client", text: "Sounds great, let's do it." },
    ],
    ecommerce: [
      { side: "client", text: "Hi Minju, we need custom Ecommerce leads — not Amazon specific." },
      { side: "minju", text: "Sure! Any particular tech stack or setup I should filter by?" },
      { side: "client", text: "Yes — we only want stores using Stripe for payments." },
      { side: "minju", text: "Got it, Stripe-powered stores. Anything else on the tech side?" },
      { side: "client", text: "They should also be sending email through Google's SMTP (smtp.google.com)." },
      { side: "minju", text: "Understood — Ecommerce leads filtered by Stripe payment processing and Google SMTP email setup. I'll prepare a free sample first." },
      { side: "client", text: "Perfect, let's move forward." },
    ],
    erg: [
      { side: "client", text: "We need research on Women's Employee Resource Groups (ERGs) — USA only." },
      { side: "minju", text: "Got it. Any exclusions I should apply?" },
      { side: "client", text: "Please exclude veteran or military ERGs, and skip anything in Spanish." },
      { side: "minju", text: "Understood. Should I include the source for each entry?" },
      { side: "client", text: "Yes, always include the source. Also, only one contact per Women's ERG." },
      { side: "minju", text: "Noted. One more check — I sometimes see general 'DEI' pages that are really about racial diversity, not women specifically. Skip those?" },
      { side: "client", text: "Yes, skip those. Also skip universities and healthcare systems entirely." },
      { side: "minju", text: "Got it — USA-only Women's ERGs, one contact each with source included, excluding veteran/military ERGs, Spanish-language pages, general DEI-only listings, universities, and healthcare systems. I'll get started and send a sample." },
    ],
    realestate: [
      { side: "client", text: "I need real estate leads — buyers and sellers in a specific market." },
      { side: "minju", text: "Sure! Which market, and are you after buyers, sellers, or both?" },
      { side: "client", text: "Both, focused on a mid-price range in that area." },
      { side: "minju", text: "Understood — buyers and sellers, filtered by market and price band. I'll send a free sample first." },
    ],
    shopify: [
      { side: "client", text: "We're looking for Ecommerce leads specifically on Shopify." },
      { side: "minju", text: "Got it. Any filters — store size, niche, or region?" },
      { side: "client", text: "Mid-size Shopify stores, US-based, any niche is fine." },
      { side: "minju", text: "Understood — mid-size, US Shopify stores. I'll prepare a sample batch." },
    ],
    otto: [
      { side: "client", text: "We need Otto marketplace seller leads for the German market." },
      { side: "minju", text: "Sure! Any category or revenue range to filter by?" },
      { side: "client", text: "No specific category, just active Otto sellers in Germany." },
      { side: "minju", text: "Got it — active Otto sellers, Germany. I'll send a free sample first." },
    ],
    kaufland: [
      { side: "client", text: "Can you source Kaufland marketplace seller leads?" },
      { side: "minju", text: "Yes — any particular category or seller size?" },
      { side: "client", text: "Mid-size sellers, general categories." },
      { side: "minju", text: "Understood — mid-size Kaufland sellers across categories. I'll get a sample ready." },
    ],
    etsy: [
      { side: "client", text: "We're looking for Etsy seller leads." },
      { side: "minju", text: "Sure! Any niche or shop size you're targeting?" },
      { side: "client", text: "Handmade goods shops with a decent sales history." },
      { side: "minju", text: "Got it — established handmade-goods Etsy sellers. I'll send a free sample first." },
    ],
    mailchimp: [
      { side: "client", text: "We need Shopify store leads, but specifically ones using Mailchimp for email marketing." },
      { side: "minju", text: "Understood — Shopify stores with Mailchimp integration. Any region or store size preference?" },
      { side: "client", text: "US-based, small to mid-size stores." },
      { side: "minju", text: "Got it — US Shopify + Mailchimp stores, small to mid-size. I'll prepare a sample batch." },
    ],
    vc: [
      { side: "client", text: "We need venture capital leads — partner-level contacts." },
      { side: "minju", text: "Sure! Any specific investment focus or stage (seed, Series A, etc.)?" },
      { side: "client", text: "Early-stage focused firms, any sector." },
      { side: "minju", text: "Understood — early-stage VC partners, verified contacts. I'll send a free sample first." },
    ],
    investor: [
      { side: "client", text: "Looking for investor leads — angels or private equity, not just VC." },
      { side: "minju", text: "Got it. Any sector or check-size preference?" },
      { side: "client", text: "Open to most sectors, mid-size check sizes." },
      { side: "minju", text: "Understood — angel and private equity investors, mid-size checks, open sector. I'll prepare a sample." },
    ],
    techissue: [
      { side: "client", text: "We help businesses fix email deliverability and analytics setup — can you find leads with SPF, DMARC, or DKIM issues?" },
      { side: "minju", text: "Yes — should I also flag GA4 or GTM tracking issues while researching?" },
      { side: "client", text: "Yes please, include those too if found." },
      { side: "minju", text: "Understood — leads flagged for SPF/DMARC/DKIM email authentication issues and GA4/GTM tracking gaps. I'll send a free sample first." },
    ],
  };
  (function(){
    const box = $('#chatBubbles'); if (!box) return;
    const tabs = $$('.chat-tab[data-conv]');
    let timers = [];
    function show(key){
      timers.forEach(clearTimeout); timers = []; box.innerHTML = '';
      (conversations[key] || []).forEach((m, i) => {
        const row = document.createElement('div'); row.className = 'bubble ' + m.side;
        const av = document.createElement('div'); av.className = 'av'; av.textContent = m.side === 'client' ? 'C' : 'LE';
        const tx = document.createElement('div'); tx.className = 'tx'; tx.textContent = m.text;
        row.appendChild(av); row.appendChild(tx); box.appendChild(row);
        timers.push(setTimeout(() => row.classList.add('shown'), reduceMotion ? 0 : i * 380));
      });
    }
    tabs.forEach((t) => t.addEventListener('click', () => { tabs.forEach((x) => x.classList.remove('active')); t.classList.add('active'); show(t.dataset.conv); }));
    const more = $('#chatMore');
    if (more) more.addEventListener('click', () => {
      const extra = $$('.chat-tab[data-extra]'); const open = more.dataset.open === '1';
      extra.forEach((t) => { t.hidden = open; });
      more.dataset.open = open ? '0' : '1'; more.textContent = open ? '+' + extra.length + ' more examples' : 'Show fewer';
    });
    show('amazon');
  })();

  /* ---------- Sample lead file (fictional rows) ---------- */
  (function(){
    const table = $('#sampleTable'); if (!table) return;
    const COLS = ['Company', 'Website', 'Decision-maker', 'Job title', 'Verified email', 'Direct phone', 'Country', 'Amazon category', 'Monthly revenue', 'Email status'];
    const ROWS = [
      ['Brightleaf Home Co.', 'brightleafhome.com', 'Sarah Mitchell', 'Founder & CEO', 'sarah@brightleafhome.com', '+1 (512) 555-0147', 'USA', 'Home & Kitchen', '$50K - $100K', 'Valid'],
      ['Nordkraft Outdoor GmbH', 'nordkraft-outdoor.de', 'Jonas Weber', 'Managing Director', 'j.weber@nordkraft-outdoor.de', '+49 89 5550 1234', 'Germany', 'Sports & Outdoors', '$100K+', 'Valid'],
      ['PeakPaws Ltd', 'peakpaws.co.uk', 'Emily Carter', 'Co-Founder & Director', 'emily@peakpaws.co.uk', '+44 161 555 0192', 'United Kingdom', 'Pet Supplies', '$25K - $50K', 'Valid'],
      ['Solmar Beauty S.L.', 'solmarbeauty.es', 'Lucía Romero', 'CEO', 'lucia.romero@solmarbeauty.es', '+34 91 555 0186', 'Spain', 'Beauty & Personal Care', '$50K - $100K', 'Valid'],
      ['Kookaburra Kids Pty Ltd', 'kookaburrakids.com.au', 'Liam Walsh', 'Owner', 'liam@kookaburrakids.com.au', '+61 2 5550 1173', 'Australia', 'Toys & Games', '$25K - $50K', 'Valid'],
      ['Maison Lumière SAS', 'maisonlumiere.fr', 'Camille Laurent', 'Fondatrice & CEO', 'c.laurent@maisonlumiere.fr', '+33 1 55 50 12 48', 'France', 'Home & Kitchen', '$100K+', 'Valid'],
      ['IronGrip Fitness LLC', 'irongripfitness.com', 'Marcus Hill', 'Founder', 'marcus@irongripfitness.com', '+1 (305) 555-0118', 'USA', 'Sports & Outdoors', '$10K - $25K', 'Valid'],
      ['Verde Vida Foods', 'verdevidafoods.com', 'Daniela Ortiz', 'Head of Ecommerce', 'daniela@verdevidafoods.com', '+52 55 5550 1290', 'Mexico', 'Grocery & Gourmet Food', '$50K - $100K', 'Valid']
    ];
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    table.innerHTML = '<thead><tr>' + COLS.map((c) => '<th scope="col">' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
      ROWS.slice(0, 6).map((r) => '<tr>' + r.map((v, i) => '<td' + (i === 9 ? ' class="ok"' : (i === 1 || i === 4 || i === 5) ? ' class="mono"' : '') + '>' + esc(i === 9 ? '✓ ' + v : v) + '</td>').join('') + '</tr>').join('') + '</tbody>';
    const dl = $('#sampleDownload');
    if (dl) dl.addEventListener('click', () => {
      const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      const csv = '﻿' + [COLS].concat(ROWS).map((r) => r.map(q).join(',')).join('\r\n') + '\r\n\r\n' + q('Fictional sample data for format preview only - Leads Expert') + '\r\n';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'leads-expert-sample.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  })();

  // ---------------- Hero lead finder animation (plays on its own; fictional sample data) ----------------
  (function(){
    const box = document.querySelector('.finder');
    if (!box) return;
    const EXAMPLES = [
      { q:'brightleafhome.com', company:'Brightleaf Home Co.', meta:'Home & Kitchen · Austin, USA', logo:'BH', person:'Sarah Mitchell', title:'Founder & CEO', av:'SM', role:'CEO', email:'sarah@brightleafhome.com', phone:'+1 (512) 555-0147' },
      { q:'nordkraft-outdoor.de', company:'Nordkraft Outdoor GmbH', meta:'Sports & Outdoors · Munich, Germany', logo:'NO', person:'Jonas Weber', title:'Managing Director', av:'JW', role:'MD', email:'j.weber@nordkraft-outdoor.de', phone:'+49 89 5550 1234' },
      { q:'peakpaws.co.uk', company:'PeakPaws Ltd', meta:'Pet Supplies · Manchester, UK', logo:'PP', person:'Emily Carter', title:'Co-Founder & Director', av:'EC', role:'Founder', email:'emily@peakpaws.co.uk', phone:'+44 161 555 0192' },
      { q:'solmarbeauty.es', company:'Solmar Beauty S.L.', meta:'Beauty & Personal Care · Madrid, Spain', logo:'SB', person:'Lucía Romero', title:'CEO', av:'LR', role:'CEO', email:'lucia.romero@solmarbeauty.es', phone:'+34 91 555 0186' }
    ];
    const $ = (id) => document.getElementById(id);
    const rows = box.querySelectorAll('.hd-row');
    const roleChip = box.querySelector('.hd-dm');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function fillStatic(ex){
      $('hdQuery').textContent = ex.q; $('hdLogo').textContent = ex.logo; $('hdAvatar').textContent = ex.av; roleChip.textContent = ex.role;
      $('hdCompany').textContent = ex.company; $('hdMeta').textContent = ex.meta; $('hdPerson').textContent = ex.person;
      $('hdTitle').textContent = ex.title; $('hdEmail').textContent = ex.email; $('hdPhone').textContent = ex.phone;
    }
    if (reduce) { fillStatic(EXAMPLES[0]); rows.forEach((r) => r.classList.add('show')); return; }
    let visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(box);
    async function type(el, text, speed){ for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(speed); } }
    async function erase(el){ while (el.textContent.length) { el.textContent = el.textContent.slice(0, -1); await wait(18); } }
    (async function loop(){
      let k = 0;
      await wait(900);
      while (true) {
        if (!visible) { await wait(500); continue; }
        const ex = EXAMPLES[k % EXAMPLES.length]; k++;
        rows.forEach((r) => r.classList.remove('show'));
        await wait(350);
        ['hdCompany','hdMeta','hdPerson','hdTitle','hdEmail','hdPhone'].forEach((id) => { $(id).textContent = ''; });
        await erase($('hdQuery'));
        await type($('hdQuery'), ex.q, 75);
        $('hdBtn').classList.add('press'); await wait(180); $('hdBtn').classList.remove('press');
        $('hdScan').classList.add('on'); await wait(1100); $('hdScan').classList.remove('on');
        $('hdLogo').textContent = ex.logo; $('hdAvatar').textContent = ex.av; roleChip.textContent = ex.role;
        rows[0].classList.add('show'); await type($('hdCompany'), ex.company, 22); $('hdMeta').textContent = ex.meta; await wait(550);
        rows[1].classList.add('show'); await type($('hdPerson'), ex.person, 40); $('hdTitle').textContent = ex.title; await wait(600);
        rows[2].classList.add('show'); await type($('hdEmail'), ex.email, 28); await wait(600);
        rows[3].classList.add('show'); await type($('hdPhone'), ex.phone, 42);
        await wait(3400);
      }
    })();
  })();



  /* ---------- Chat assistant (bottom-right) ---------- */
  (function(){
    if (!CHAT_WORKER_URL) return;
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<button id="faqBotLauncher" type="button" aria-label="Open chat assistant"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h16v12H7l-3 3V4Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="10" r="1" fill="#fff"/><circle cx="12" cy="10" r="1" fill="#fff"/><circle cx="15" cy="10" r="1" fill="#fff"/></svg></button>' +
      '<div id="faqBotWindow" role="dialog" aria-label="Chat assistant"><div class="fb-head"><div><b>Ask a quick question</b><small>AI-powered · usually replies in seconds</small></div><button type="button" class="fb-close" aria-label="Close chat">&times;</button></div>' +
      '<div class="fb-msgs" aria-live="polite"></div>' +
      '<div class="fb-quick"><button type="button">What kind of leads do you provide?</button><button type="button">Can I get a free sample first?</button><button type="button">How much does it cost?</button><button type="button">How long does delivery take?</button></div>' +
      '<div class="fb-input"><input type="text" placeholder="Type a question..." aria-label="Your question" autocomplete="off"><button type="button" aria-label="Send"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 8 14.5 1.5 10 8l4.5 6.5L1.5 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg></button></div></div>';
    document.body.appendChild(wrap);
    const launcher = $('#faqBotLauncher'), win = $('#faqBotWindow'), msgs = $('.fb-msgs', win), quick = $('.fb-quick', win), input = $('.fb-input input', win), send = $('.fb-input button', win);
    const history = []; let waiting = false;
    function add(text, who){ const d = document.createElement('div'); d.className = 'fb-msg ' + who; d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
    async function ask(text){
      if (!text.trim() || waiting) return;
      add(text, 'user'); history.push({ role: 'user', content: text }); input.value = '';
      waiting = true; send.disabled = true; quick.style.display = 'none';
      const typing = add('Typing...', 'typing');
      try {
        const res = await fetch(CHAT_WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history: history }) });
        const data = await res.json(); typing.remove();
        if (data.reply) { add(data.reply, 'bot'); history.push({ role: 'assistant', content: data.reply }); }
        else add('Sorry, something went wrong. Please use the contact form instead.', 'bot');
      } catch (x) { typing.remove(); add("Sorry, I couldn't connect right now. Please use the contact form instead.", 'bot'); }
      waiting = false; send.disabled = false;
    }
    launcher.addEventListener('click', () => { win.classList.toggle('open'); if (win.classList.contains('open')) input.focus(); });
    $('.fb-close', win).addEventListener('click', () => win.classList.remove('open'));
    send.addEventListener('click', () => ask(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(input.value); });
    $$('button', quick).forEach((b) => b.addEventListener('click', () => ask(b.textContent)));
  })();
})();
