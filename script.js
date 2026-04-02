/* =====================================================
   FreshFusion Foods Limited – main.js
   ===================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const WA = '2347062724773';
const naira = n => '\u20a6' + Number(n).toLocaleString();

/* ===================== NAVBAR ===================== */
function initNavbar() {
  const nav = $('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  const ham = $('.hamburger');
  const mob = $('.mobile-menu');
  if (ham && mob) {
    ham.addEventListener('click', () => { ham.classList.toggle('open'); mob.classList.toggle('open'); });
    $$('a', mob).forEach(a => a.addEventListener('click', () => { ham.classList.remove('open'); mob.classList.remove('open'); }));
  }
  $('.mobile-cart-btn')?.addEventListener('click', openCart);
  $('.nav-cart-btn')?.addEventListener('click', openCart);
}

/* ===================== HERO SLIDER ===================== */
function initHeroSlider() {
  const slides = $$('.hero-slide');
  const dots   = $$('.hero-dot');
  if (!slides.length) return;
  let cur = 0, t;
  function goTo(i) {
    slides[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur]?.classList.add('active');
  }
  function auto() { t = setInterval(() => goTo(cur + 1), 5500); }
  dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(t); goTo(i); auto(); }));
  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  auto();
}

/* ===================== PRODUCT IMAGE SLIDER ===================== */
function initProductSliders() {
  $$('.product-img-wrap').forEach(wrap => {
    const imgs = $$('img', wrap);
    const dots = $$('.img-dot', wrap);
    if (imgs.length < 2) { imgs[0]?.classList.add('active'); return; }
    let cur = 0, t;
    function goTo(i) {
      imgs[cur].classList.remove('active');
      dots[cur]?.classList.remove('active');
      cur = (i + imgs.length) % imgs.length;
      imgs[cur].classList.add('active');
      dots[cur]?.classList.add('active');
    }
    dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(t); goTo(i); t = setInterval(() => goTo(cur + 1), 2800); }));
    imgs[0].classList.add('active');
    dots[0]?.classList.add('active');
    t = setInterval(() => goTo(cur + 1), 2800);
  });
}

/* ===================== CART STORE ===================== */
const CART_KEY = 'ff_cart_v2';
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCart(); }

function addToCart(product) {
  const cart = getCart();
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.qty = (ex.qty || 1) + 1;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showCartToast(product);
}

function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); }

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart(cart);
}

function clearCart() { saveCart([]); }

function getCartTotal() { return getCart().reduce((s, i) => s + i.price * (i.qty || 1), 0); }
function getCartCount() { return getCart().reduce((s, i) => s + (i.qty || 1), 0); }

/* ===================== CART RENDER ===================== */
function renderCart() {
  const cart  = getCart();
  const count = getCartCount();

  // badges
  $$('.cart-badge').forEach(b => { b.textContent = count; b.style.display = count ? 'flex' : 'flex'; });
  $$('.mobile-cart-count').forEach(b => b.textContent = count);

  const body  = $('.cart-items');
  const total = $('.cart-foot .cart-total-row strong');
  if (!body) return;

  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>Your cart is empty</p>
        <a href="shop.html" class="cart-browse-btn">Browse Products</a>
      </div>`;
  } else {
    body.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img-wrap">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${naira(item.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn qty-minus" data-id="${item.id}">&#8722;</button>
            <span class="qty-num">${item.qty || 1}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}">&#43;</button>
          </div>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-subtotal">${naira(item.price * (item.qty || 1))}</div>
          <button class="cart-item-remove" data-id="${item.id}" title="Remove">&#215;</button>
        </div>
      </div>`).join('');

    $$('.qty-minus', body).forEach(b => b.addEventListener('click', () => { changeQty(b.dataset.id, -1); }));
    $$('.qty-plus',  body).forEach(b => b.addEventListener('click', () => { changeQty(b.dataset.id,  1); }));
    $$('.cart-item-remove', body).forEach(b => b.addEventListener('click', () => { removeFromCart(b.dataset.id); }));
  }

  if (total) total.textContent = naira(getCartTotal());

  // update proceed button
  const goBtn = $('.btn-go-checkout');
  if (goBtn) goBtn.disabled = !cart.length;

  // update checkout btn (on checkout panel)
  const coBtn = $('.cart-wa-checkout');
  if (coBtn) coBtn.disabled = !cart.length;

  // summary line count
  const summary = $('.cart-summary-count');
  if (summary) summary.textContent = count + ' item' + (count !== 1 ? 's' : '');
}

/* ===================== CART OPEN/CLOSE ===================== */
function openCart() {
  renderCart();
  $('.cart-overlay')?.classList.add('open');
  $('.cart-sidebar')?.classList.add('open');
  showCartView('items'); // always start on items view
}
function closeCart() {
  $('.cart-overlay')?.classList.remove('open');
  $('.cart-sidebar')?.classList.remove('open');
  showCartView('items');
}

/* Toggle between items view and checkout view */
function showCartView(view) {
  const itemsView    = document.getElementById('cart-items-view');
  const checkoutView = document.getElementById('cart-checkout-view');
  if (!itemsView || !checkoutView) return;
  if (view === 'checkout') {
    itemsView.style.display    = 'none';
    checkoutView.style.display = 'flex';
    // populate order summary in checkout
    renderCheckoutSummary();
  } else {
    itemsView.style.display    = 'flex';
    checkoutView.style.display = 'none';
  }
}

function renderCheckoutSummary() {
  const list     = document.getElementById('co-item-list');
  const total    = document.getElementById('co-total');
  const subtotal = document.getElementById('co-subtotal');
  const grand    = document.getElementById('co-grand');
  const cart     = getCart();
  if (!list) return;
  list.innerHTML = cart.map(i => `
    <div class="co-item">
      <span class="co-item-name">${i.name} <span class="co-item-qty">x${i.qty||1}</span></span>
      <span class="co-item-price">${naira(i.price*(i.qty||1))}</span>
    </div>`).join('');
  const sub = getCartTotal();
  if (total)    total.textContent    = naira(sub);
  if (subtotal) subtotal.textContent = naira(sub);
  if (grand)    grand.textContent    = naira(sub); // no fee selected yet
  // reset delivery selector and fee
  const sel = document.getElementById('co-delivery');
  if (sel) sel.value = '';
  const feeEl = document.getElementById('co-fee');
  if (feeEl) feeEl.textContent = 'Select location';
  const infoEl = document.getElementById('co-delivery-info');
  if (infoEl) { infoEl.textContent = ''; infoEl.classList.remove('show'); }
}

function updateDeliveryFee() {
  const sel     = document.getElementById('co-delivery');
  const feeEl   = document.getElementById('co-fee');
  const grandEl = document.getElementById('co-grand');
  const subEl   = document.getElementById('co-subtotal');
  const infoEl  = document.getElementById('co-delivery-info');
  if (!sel || !feeEl) return;

  const fees  = { akwa_ibom: 0, nationwide: 2500, international: 5000 };
  const infos = {
    akwa_ibom:     'Same day delivery within Akwa Ibom – orders before 2PM.',
    nationwide:    'Delivery to all 36 states in Nigeria within 2–3 working days.',
    international: 'International shipping worldwide – approximately 7 days.',
  };

  const fee = fees[sel.value] ?? null;

  if (fee === null) {
    feeEl.textContent = 'Select location';
    if (infoEl) { infoEl.textContent = ''; infoEl.classList.remove('show'); }
    return;
  }

  feeEl.textContent = fee === 0 ? 'Free (same day)' : naira(fee);
  const sub = getCartTotal();
  if (subEl)   subEl.textContent  = naira(sub);
  if (grandEl) grandEl.textContent = naira(sub + fee);
  if (infoEl)  { infoEl.textContent = infos[sel.value]; infoEl.classList.add('show'); }
}

/* ===================== CART WHATSAPP CHECKOUT ===================== */
function cartCheckoutWhatsApp() {
  const cart = getCart();
  if (!cart.length) return;

  const name     = (document.getElementById('co-name')?.value    || '').trim();
  const phone    = (document.getElementById('co-phone')?.value   || '').trim();
  const delivery = document.getElementById('co-delivery')?.value || '';
  const address  = (document.getElementById('co-address')?.value || '').trim();
  const busstop  = (document.getElementById('co-busstop')?.value || '').trim();
  const note     = (document.getElementById('co-note')?.value    || '').trim();

  if (!name)  { alert('Please enter your full name.'); document.getElementById('co-name')?.focus(); return; }
  if (!phone) { alert('Please enter your phone number.'); document.getElementById('co-phone')?.focus(); return; }
  if (!delivery) { alert('Please select a delivery type.'); document.getElementById('co-delivery')?.focus(); return; }
  if (!address) { alert('Please enter your delivery address.'); document.getElementById('co-address')?.focus(); return; }

  const fees = { akwa_ibom: 0, nationwide: 2500, international: 5000 };
  const fee  = fees[delivery] ?? 0;
  const deliveryLabels = {
    akwa_ibom:     'Akwa Ibom – Same Day Delivery (Free)',
    nationwide:    'Nationwide – 2 to 3 Working Days (' + naira(2500) + ')',
    international: 'International – ~7 Days (' + naira(5000) + ')',
  };

  const itemLines = cart.map(i =>
    `  \u2022 ${i.name} \u00d7${i.qty||1}  =  ${naira(i.price*(i.qty||1))}`
  ).join('\n');

  const subtotal  = getCartTotal();
  const grand     = subtotal + fee;
  const itemCount = getCartCount();

  const msg =
`Hello FreshFusion Foods Limited,

I would like to place an order. Please find my details below:

\u2500\u2500\u2500 CUSTOMER DETAILS \u2500\u2500\u2500
Name:        ${name}
Phone:       ${phone}
Address:     ${address}${busstop ? '\nBus Stop:    ' + busstop : ''}

\u2500\u2500\u2500 DELIVERY \u2500\u2500\u2500
${deliveryLabels[delivery]}

\u2500\u2500\u2500 ORDER (${itemCount} item${itemCount!==1?'s':''}) \u2500\u2500\u2500
${itemLines}

\u2500\u2500\u2500 PAYMENT SUMMARY \u2500\u2500\u2500
Subtotal:    ${naira(subtotal)}
Delivery:    ${fee === 0 ? 'Free' : naira(fee)}
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
TOTAL:       ${naira(grand)}${note ? '\n\nNote: ' + note : ''}

Please confirm my order and send payment details.
Thank you.`;

  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ===================== CART INIT ===================== */
function initCart() {
  renderCart();

  $('.cart-overlay')?.addEventListener('click', closeCart);
  $('.cart-close')?.addEventListener('click', closeCart);

  // "Proceed to Checkout" — switch to checkout panel
  document.addEventListener('click', e => {
    if (e.target.closest('.cart-wa-checkout')) cartCheckoutWhatsApp();
    if (e.target.closest('.btn-go-checkout')) {
      if (!getCart().length) return;
      showCartView('checkout');
    }
    if (e.target.closest('.btn-back-to-cart')) showCartView('items');
  });

  // Delivery fee update
  document.addEventListener('change', e => {
    if (e.target.id === 'co-delivery') updateDeliveryFee();
  });

  // Clear cart
  $('.cart-clear')?.addEventListener('click', () => {
    if (confirm('Clear your entire cart?')) { clearCart(); showCartView('items'); }
  });

  // Product add to cart
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-cart:not(.btn-bread-cart)');
    if (!btn) return;
    const card = btn.closest('[data-product]');
    if (!card) return;
    const sel   = card.querySelector('.size-select');
    const opt   = sel ? sel.options[sel.selectedIndex] : null;
    const name  = card.dataset.name;
    const baseP = parseFloat(card.dataset.price);
    const price = opt ? parseFloat(opt.dataset.price || baseP) : baseP;
    const size  = opt ? opt.value : '';
    const img   = card.querySelector('.product-img-wrap img')?.src || '';
    const id    = (name + size).replace(/\s+/g, '_').toLowerCase();
    addToCart({ id, name: name + (size ? ' \u2013 ' + size : ''), price, img });
  });

  // Bread add to cart
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-bread-cart');
    if (!btn) return;
    const card = btn.closest('[data-name]');
    if (!card) return;
    const name  = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const img   = card.querySelector('img')?.src || '';
    const id    = name.replace(/\s+/g, '_').toLowerCase();
    addToCart({ id, name, price, img });
  });
}

/* ===================== CART TOAST ===================== */
let _toastTimer;
function showCartToast(product) {
  let toast = document.getElementById('ff-cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ff-cart-toast';
    toast.className = 'cart-toast';
    toast.innerHTML = `
      <img class="cart-toast-img" src="" alt="">
      <div class="cart-toast-body">
        <div class="cart-toast-label">Added to cart</div>
        <div class="cart-toast-name"></div>
        <div class="cart-toast-price"></div>
      </div>
      <button class="cart-toast-view">View Cart</button>`;
    document.body.appendChild(toast);
    toast.querySelector('.cart-toast-view').addEventListener('click', () => {
      toast.classList.remove('show');
      openCart();
    });
  }
  toast.querySelector('.cart-toast-img').src  = product.img || '';
  toast.querySelector('.cart-toast-name').textContent  = product.name;
  toast.querySelector('.cart-toast-price').textContent = naira(product.price);
  clearTimeout(_toastTimer);
  requestAnimationFrame(() => { toast.classList.add('show'); });
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ===================== FAQ ===================== */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* ===================== REVIEWS TOGGLE ===================== */
function initReviews() {
  const btn = $('.btn-toggle');
  if (!btn) return;
  const hidden = $$('.review-card.hidden');
  let exp = false;
  btn.addEventListener('click', () => {
    exp = !exp;
    hidden.forEach(c => c.style.display = exp ? 'block' : 'none');
    btn.textContent = exp ? 'Show Less' : 'Show More Reviews';
  });
}

/* ===================== COUNTDOWN ===================== */
function initCountdown() {
  const els = { d: document.getElementById('cd-days'), h: document.getElementById('cd-hours'), m: document.getElementById('cd-mins'), s: document.getElementById('cd-secs') };
  if (!els.d) return;
  const target = new Date(Date.now() + 3 * 86400000);
  const pad = n => String(Math.floor(n)).padStart(2, '0');
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { Object.values(els).forEach(e => e && (e.textContent = '00')); return; }
    els.d.textContent = pad(diff / 86400000);
    els.h.textContent = pad((diff % 86400000) / 3600000);
    els.m.textContent = pad((diff % 3600000) / 60000);
    els.s.textContent = pad((diff % 60000) / 1000);
  }
  tick(); setInterval(tick, 1000);
}

/* ===================== INLINE BOOKING FORM ===================== */
function initBookingForm() {
  const form = document.getElementById('booking-form-inline');
  const deliverySelect = document.getElementById('b-delivery');
  const alertBox = document.getElementById('booking-delivery-alert');
  const msgs = {
    akwa_ibom:     'FreshFusion Foods delivers within Akwa Ibom same day for orders before 2PM.',
    nationwide:    'FreshFusion Foods nationwide delivery takes 2\u20133 working days.',
    international: 'FreshFusion Foods international delivery takes approximately 7 days.',
  };
  if (deliverySelect && alertBox) {
    deliverySelect.addEventListener('change', () => {
      alertBox.textContent = msgs[deliverySelect.value] || '';
      alertBox.classList.toggle('show', !!msgs[deliverySelect.value]);
    });
  }
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name     = fd.get('fullname');
      const phone    = fd.get('phone');
      const delivery = fd.get('delivery');
      const address  = fd.get('address');
      const busstop  = fd.get('busstop');
      const email    = fd.get('email');
      const products = fd.get('products');
      const note     = fd.get('note');
      const dlabel   = { akwa_ibom: 'Akwa Ibom (Same Day)', nationwide: 'Nationwide (2\u20133 days)', international: 'International (~7 days)' }[delivery] || delivery;
      const msg = `Hello FreshFusion Foods Limited,\n\nI would like to place an order:\n\nName: ${name}\nPhone: ${phone}${email ? '\nEmail: ' + email : ''}\nDelivery Type: ${dlabel}\nAddress: ${address}${busstop ? '\nBus Stop: ' + busstop : ''}\n\nProducts Requested:\n${products}${note ? '\n\nNote: ' + note : ''}\n\nThank you.`;
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
}

/* ===================== SHOP FILTER ===================== */
function initShopFilter() {
  const btns = $$('.filter-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      $$('[data-category]').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });
}

/* ===================== AOS ===================== */
function initAOS() { if (typeof AOS !== 'undefined') AOS.init({ duration: 650, once: true, offset: 50 }); }

/* ===================== BOOT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initProductSliders();
  initCart();
  initFAQ();
  initReviews();
  initCountdown();
  initBookingForm();
  initShopFilter();
  initAOS();
});