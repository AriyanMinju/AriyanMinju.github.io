// Fade/slide in cards as they scroll into view (Portfolio, Reviews, Team, Pricing, Blog, etc.)
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.2 });
revealEls.forEach(el => revealObserver.observe(el));

// Chat demo — switchable scripted conversation examples (Contact page)
const conversations = {
  amazon: [
    { side: "client", text: "Hi, I'm looking for Amazon seller leads — specifically private label sellers." },
    { side: "minju", text: "Happy to help! What monthly revenue range are you targeting?" },
    { side: "client", text: "We need sellers doing $50K+ in monthly revenue." },
    { side: "minju", text: "Got it — private label, $50K+ monthly revenue. How many leads do you need, and in what batch size?" },
    { side: "client", text: "5,000 leads per batch. We'll also need personal phone numbers included, not just business lines." },
    { side: "minju", text: "Understood — 5,000 private label Amazon sellers, $50K+ monthly revenue, with personal phone numbers. I'll put together a free sample first so you can check quality before we run the full batch." },
    { side: "client", text: "Sounds great, let's do it." },
  ],
  ecommerce: [
    { side: "client", text: "Hi, we need custom Ecommerce leads — not Amazon specific." },
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

const chatBubblesEl = document.getElementById("chatBubbles");
const chatTabs = document.querySelectorAll(".chat-tab");
let chatRevealTimers = [];

function renderConversation(key) {
  chatRevealTimers.forEach(t => clearTimeout(t));
  chatRevealTimers = [];
  chatBubblesEl.innerHTML = "";

  conversations[key].forEach((msg) => {
    const row = document.createElement("div");
    row.className = `chat-bubble ${msg.side}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${msg.side === "client" ? "avatar-client" : "avatar-minju"}`;
    avatar.textContent = msg.side === "client" ? "C" : "M";

    const bubbleText = document.createElement("div");
    bubbleText.className = "bubble-text";
    bubbleText.textContent = msg.text;

    if (msg.side === "client") {
      row.appendChild(bubbleText);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubbleText);
    }

    chatBubblesEl.appendChild(row);
  });

  const bubbles = chatBubblesEl.querySelectorAll(".chat-bubble");
  bubbles.forEach((bubble, i) => {
    const t = setTimeout(() => bubble.classList.add("shown"), i * 380);
    chatRevealTimers.push(t);
  });
}

if (chatTabs.length) {
  chatTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      chatTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderConversation(tab.getAttribute("data-conv"));
    });
  });
}
if (chatBubblesEl) renderConversation("amazon");

// Count-up animation for numeric stats (Orders Delivered, Job Success, Years Experience)
const countEls = document.querySelectorAll('.num[data-count-to]');
function animateCount(el){
  const target = parseInt(el.getAttribute('data-count-to'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1600;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('en-US') + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString('en-US') + suffix;
    }
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
countEls.forEach(el => countObserver.observe(el));

// Global Reach bars — animate 0 to target width every time the section scrolls into view
const reachBars = document.querySelectorAll('.reach-bar');
const reachObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const bar = entry.target;
    const target = bar.getAttribute('data-width');
    if (entry.isIntersecting) {
      bar.classList.remove('pulse');
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;
      bar.style.transition = 'width 1.4s cubic-bezier(.16,.9,.3,1)';
      bar.style.width = target + '%';
      clearTimeout(bar._pulseTimeout);
      bar._pulseTimeout = setTimeout(() => bar.classList.add('pulse'), 1400);
    } else {
      bar.classList.remove('pulse');
      clearTimeout(bar._pulseTimeout);
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }
  });
}, { threshold: 0.4 });
reachBars.forEach(bar => reachObserver.observe(bar));

// Contact form slides in from the right when scrolled into view
const slideInEls = document.querySelectorAll('.slide-in-right');
const slideInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.25 });
slideInEls.forEach(el => slideInObserver.observe(el));

// Specialties panel grows in on scroll
const growInEls = document.querySelectorAll('.grow-in');
const growInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.25 });
growInEls.forEach(el => growInObserver.observe(el));

// Specialties — click-to-expand content panel (Services page)
const specialtyData = {
  leadgen: {
    title: "Lead Generation",
    items: [
      "B2B Lead Generation", "Amazon Seller Leads", "B2C Lead Generation", "LinkedIn Lead Generation",
      "Email Lead Generation", "Sales Prospecting", "Prospect List Building", "Contact List Building",
      "Email List Building", "Web Research", "Market Research", "Data Mining", "Data Collection",
      "Data Entry", "CRM Data Management", "CRM Data Cleaning", "Lead Qualification", "Cold Email Prospecting",
      "LinkedIn Outreach", "Influencer Research", "Company Research", "Decision Maker Research", "Skip Tracing",
      "Real Estate Lead Generation", "E-commerce Lead Generation", "Healthcare Lead Generation", "SaaS Lead Generation",
      "Financial Services Lead Generation", "Recruitment Lead Generation", "Local Business Lead Generation",
    ],
  },
  research: {
    title: "Research &amp; Data Collection",
    items: [
      "Web Research", "Market Research", "Company Research", "Competitor Research", "Product Research",
      "Internet Research", "Business Research", "Industry Research", "Academic Research", "Data Collection",
      "Data Mining", "Data Extraction", "Data Scraping (where permitted by website terms and applicable laws)",
      "Contact Research", "Email Research", "LinkedIn Research", "Prospect Research", "Lead Research",
      "Survey Research", "Keyword Research", "Influencer Research", "Real Estate Research", "Supplier Research",
      "Vendor Research", "Customer Research", "Pricing Research", "Statistical Data Research",
      "Public Records Research", "Online Database Research", "CRM Data Enrichment",
    ],
  },
  data: {
    title: "Data &amp; File Services",
    items: [
      "Data Entry", "Data Processing", "Data Cleaning", "Data Formatting", "Data Conversion", "Data Collection",
      "Data Extraction", "Data Mining", "PDF to Excel", "PDF to Word", "Image to Excel", "Image to Word",
      "Copy &amp; Paste Tasks", "Spreadsheet Management", "Microsoft Excel", "Google Sheets", "CSV File Management",
      "File Conversion", "File Organization", "Document Formatting", "OCR (Optical Character Recognition)",
      "Database Management", "CRM Data Entry", "CRM Data Cleanup", "Data Validation", "Data Annotation",
      "Data Labeling", "Catalog Data Entry", "Product Data Upload", "File Merging &amp; Splitting", "File Renaming",
      "Duplicate Data Removal", "Data Deduplication", "Data Enrichment", "Data Quality Assurance",
    ],
  },
};

const specialtyPanel = document.getElementById('specialtyPanel');
const specialtyTabs = document.querySelectorAll('.specialty-tab');

function renderSpecialty(key) {
  const data = specialtyData[key];
  if (!data || !specialtyPanel) return;
  const itemsHtml = data.items.map(i => `<li>${i}</li>`).join('');
  specialtyPanel.innerHTML = `
    <div class="specialty-panel-inner">
      <h3>${data.title}</h3>
      <ul>${itemsHtml}</ul>
    </div>
  `;
}

specialtyTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    specialtyTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderSpecialty(tab.getAttribute('data-spec'));
  });
});
if (specialtyPanel) renderSpecialty('leadgen');

// About section — type out paragraphs one character at a time when scrolled into view
const typewriterEls = document.querySelectorAll('.typewriter');
const typeSpeed = 14;

function typeParagraph(el, fullText, onDone) {
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  function step() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      i++;
      setTimeout(step, typeSpeed);
    } else {
      el.classList.remove('typing');
      if (onDone) onDone();
    }
  }
  step();
}

function typeSequence(els, index) {
  if (index >= els.length) return;
  const el = els[index];
  const text = el.getAttribute('data-typewriter-text');
  typeParagraph(el, text, () => typeSequence(els, index + 1));
}

let typewriterStarted = false;
const typewriterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !typewriterStarted) {
      typewriterStarted = true;
      typeSequence(Array.from(typewriterEls), 0);
      typewriterObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
if (typewriterEls.length) typewriterObserver.observe(typewriterEls[0]);

// Request Custom Leads — modal popup (available site-wide)
const leadModalOverlay = document.getElementById('leadModalOverlay');
const openLeadModalBtn = document.getElementById('openLeadModalBtn');
const closeLeadModalBtn = document.getElementById('closeLeadModalBtn');
const modalLeadType = document.getElementById('modalLeadType');
const modalOtherWrap = document.getElementById('modalOtherWrap');
const leadModalForm = document.getElementById('leadModalForm');
const modalSuccess = document.getElementById('modalSuccess');
const modalError = document.getElementById('modalError');

function openLeadModal(e){
  if (e) e.preventDefault();
  if (leadModalOverlay) leadModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLeadModal(){
  if (leadModalOverlay) leadModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (openLeadModalBtn) openLeadModalBtn.addEventListener('click', openLeadModal);
if (closeLeadModalBtn) closeLeadModalBtn.addEventListener('click', closeLeadModal);
if (leadModalOverlay) {
  leadModalOverlay.addEventListener('click', (e) => {
    if (e.target === leadModalOverlay) closeLeadModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && leadModalOverlay && leadModalOverlay.classList.contains('open')) closeLeadModal();
});

if (modalLeadType) {
  modalLeadType.addEventListener('change', () => {
    modalOtherWrap.style.display = modalLeadType.value === 'other' ? 'block' : 'none';
    document.getElementById('modalOtherType').required = modalLeadType.value === 'other';
  });
}

if (leadModalForm) {
  leadModalForm.addEventListener('submit', async function(e){
    e.preventDefault();
    modalError.style.display = 'none';
    try {
      const response = await fetch(leadModalForm.action, {
        method: 'POST',
        body: new FormData(leadModalForm),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        modalSuccess.style.display = 'block';
        leadModalForm.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
      } else {
        modalError.style.display = 'block';
      }
    } catch (err) {
      modalError.style.display = 'block';
    }
  });
}

// Main contact form (Contact page)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const contactSuccess = document.getElementById('contactSuccess');
  const contactError = document.getElementById('contactError');

  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    contactError.style.display = 'none';
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        contactSuccess.style.display = 'block';
        contactForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
      } else {
        contactError.style.display = 'block';
      }
    } catch (err) {
      contactError.style.display = 'block';
    }
  });
}
