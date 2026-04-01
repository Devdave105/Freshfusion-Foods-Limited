/* =====================================================
   FreshFusion Foods Limited – main.js
   ===================================================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const formatPrice = n => '&#8358;' + Number(n).toLocaleString();

/* ===================== NAVBAR SCROLL ===================== */
function initNavbar() {
  const nav = $('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });

  const ham = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if (ham && mobileMenu) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => {
      ham.classList.remove('open');
      mobileMenu.classList.remove('open');
    }));
  }

  // Mobile cart button
  const mobileCartBtn = $('.mobile-cart-btn');
  if (mobileCartBtn) {
    mobileCartBtn.addEventListener('click', openCart);
  }
  // Desktop cart button
  $('.nav-cart-btn')?.addEventListener('click', openCart);
}

/* ===================== HERO SLIDER ===================== */
function initHeroSlider() {
  const slides = $$('.hero-slide');
  const dots   = $$('.hero-dot');
  if (!slides.length) return;

  let current = 0, timer;

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function autoPlay() {
    timer = setInterval(() => goTo(current + 1), 5500);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(timer); goTo(i); autoPlay(); }));
  slides[0].classList.add('active');
  dots[0] && dots[0].classList.add('active');
  autoPlay();
}

/* ===================== PRODUCT IMAGE SLIDER ===================== */
function initProductSliders() {
  $$('.product-img-wrap').forEach(wrap => {
    const imgs = $$('img', wrap);
    const dots = $$('.img-dot', wrap);
    if (imgs.length < 2) return;

    let cur = 0, t;

    function goTo(i) {
      imgs[cur].classList.remove('active');
      dots[cur] && dots[cur].classList.remove('active');
      cur = (i + imgs.length) % imgs.length;
      imgs[cur].classList.add('active');
      dots[cur] && dots[cur].classList.add('active');
    }

    dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(t); goTo(i); startAuto(); }));

    function startAuto() { t = setInterval(() => goTo(cur + 1), 2800); }

    imgs[0].classList.add('active');
    dots[0] && dots[0].classList.add('active');
    startAuto();
  });
}

/* ===================== CART ===================== */
const CART_KEY = 'ff_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showCartToast(product);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
}

function updateCartUI() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);

  // Update all badges
  $$('.cart-badge').forEach(b => b.textContent = count);
  $$('.mobile-cart-count').forEach(b => b.textContent = count);

  const cartItems = $('.cart-items');
  const cartTotal = $('.cart-total strong');
  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p></div>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">&#8358;${Number(item.price * (item.qty || 1)).toLocaleString()} &times; ${item.qty || 1}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">&#215;</button>
      </div>
    `).join('');
    $$('.cart-item-remove', cartItems).forEach(btn =>
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id))
    );
  }

  if (cartTotal) cartTotal.innerHTML = '&#8358;' + Number(getCartTotal()).toLocaleString();
}

function openCart() {
  $('.cart-overlay')?.classList.add('open');
  $('.cart-sidebar')?.classList.add('open');
  // Do NOT lock scroll — user can still scroll
}

function closeCart() {
  $('.cart-overlay')?.classList.remove('open');
  $('.cart-sidebar')?.classList.remove('open');
}

/* ===================== CART TOAST (NON-INTERRUPTING) ===================== */
let toastTimer;

function showCartToast(product) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'cart-toast';
    toast.innerHTML = `
      <img class="cart-toast-img" src="" alt="">
      <div class="cart-toast-info">
        <div class="cart-toast-name"></div>
        <div class="cart-toast-sub">Added to cart</div>
        <button class="cart-toast-view">View cart</button>
      </div>
      <div class="cart-toast-price"></div>
    `;
    document.body.appendChild(toast);
    toast.querySelector('.cart-toast-view').addEventListener('click', () => {
      toast.classList.remove('show');
      openCart();
    });
  }

  toast.querySelector('.cart-toast-img').src = product.img || '';
  toast.querySelector('.cart-toast-name').textContent = product.name;
  toast.querySelector('.cart-toast-price').innerHTML = '&#8358;' + Number(product.price).toLocaleString();

  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function initCart() {
  updateCartUI();
  $('.cart-overlay')?.addEventListener('click', closeCart);
  $('.cart-close')?.addEventListener('click', closeCart);

  // Add to cart — products
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-cart');
    if (!btn) return;
    const card = btn.closest('[data-product]');
    if (!card) return;

    const sel = card.querySelector('.size-select');
    const selectedOpt = sel ? sel.options[sel.selectedIndex] : null;
    const name = card.dataset.name;
    const basePrice = parseFloat(card.dataset.price);
    const price = selectedOpt ? parseFloat(selectedOpt.dataset.price || basePrice) : basePrice;
    const size = selectedOpt ? selectedOpt.value : '';
    const img = card.querySelector('.product-img-wrap img')?.src || '';
    const id = (name + size).replace(/\s+/g, '_').toLowerCase();

    addToCart({ id, name: name + (size ? ' \u2013 ' + size : ''), price, img });
  });

  // Add to cart — bread
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-bread-cart');
    if (!btn) return;
    const card = btn.closest('.bread-card');
    if (!card) return;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const img = card.querySelector('img')?.src || '';
    const id = name.replace(/\s+/g, '_').toLowerCase();
    addToCart({ id, name, price, img });
  });
}

/* ===================== FAQ ACCORDION ===================== */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ===================== REVIEWS TOGGLE ===================== */
function initReviews() {
  const btn = $('.btn-toggle');
  if (!btn) return;
  const hidden = $$('.review-card.hidden');
  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;
    hidden.forEach(c => { c.style.display = expanded ? 'block' : 'none'; });
    btn.textContent = expanded ? 'Show Less' : 'Show More Reviews';
  });
}

/* ===================== COUNTDOWN ===================== */
function initCountdown() {
  const numEls = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };
  if (!numEls.d) return;
  const target = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { Object.values(numEls).forEach(el => el && (el.textContent = '00')); return; }
    const pad = n => String(Math.floor(n)).padStart(2, '0');
    numEls.d.textContent = pad(diff / 86400000);
    numEls.h.textContent = pad((diff % 86400000) / 3600000);
    numEls.m.textContent = pad((diff % 3600000) / 60000);
    numEls.s.textContent = pad((diff % 60000) / 1000);
  }
  tick();
  setInterval(tick, 1000);
}

/* ===================== BOOKING PAGE ===================== */
function initBooking() {
  const deliverySelect = document.getElementById('delivery-type');
  const alertBox = document.getElementById('delivery-alert');
  const form = document.getElementById('booking-form');
  const messages = {
    akwa_ibom: 'Delivery within Akwa Ibom is same day.',
    nationwide: 'Delivery takes 2\u20133 working days nationwide.',
    international: 'Delivery takes approximately 7 days internationally.',
  };

  if (deliverySelect && alertBox) {
    deliverySelect.addEventListener('change', () => {
      const val = deliverySelect.value;
      alertBox.textContent = messages[val] || '';
      alertBox.classList.toggle('show', !!messages[val]);
    });
  }

  // Order summary
  const summaryList = document.getElementById('order-summary-items');
  const summaryTotal = document.getElementById('order-summary-total');
  if (summaryList) {
    const cart = getCart();
    if (!cart.length) {
      summaryList.innerHTML = '<p class="order-empty">No items in cart. <a href="shop.html" style="color:var(--green);font-weight:600;">Browse products</a></p>';
    } else {
      summaryList.innerHTML = cart.map(item => `
        <div class="order-item">
          <span>${item.name} &times;${item.qty || 1}</span>
          <span>&#8358;${Number(item.price * (item.qty || 1)).toLocaleString()}</span>
        </div>
      `).join('');
      if (summaryTotal) summaryTotal.innerHTML = '&#8358;' + Number(getCartTotal()).toLocaleString();
    }
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('fullname'), phone = fd.get('phone');
      const delivery = fd.get('delivery'), address = fd.get('address'), busstop = fd.get('busstop');
      const cart = getCart();
      const itemsText = cart.length
        ? cart.map(i => `- ${i.name} x${i.qty || 1}: &#8358;${Number(i.price*(i.qty||1)).toLocaleString()}`).join('\n')
        : '(no items)';
      const deliveryLabel = { akwa_ibom: 'Akwa Ibom (Same Day)', nationwide: 'Nationwide (2\u20133 days)', international: 'International (~7 days)' }[delivery] || delivery;
      const msg = encodeURIComponent(`Hello FreshFusion Foods,\n\nI would like to place an order:\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nBus Stop: ${busstop}\nDelivery Type: ${deliveryLabel}\n\nItems:\n${itemsText}\n\nTotal: \u20a6${Number(getCartTotal()).toLocaleString()}\n\nThank you.`);
      window.open(`https://wa.me/2349031538922?text=${msg}`, '_blank');
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
function initAOS() {
  if (typeof AOS !== 'undefined') AOS.init({ duration: 700, once: true, offset: 60 });
}

/* ===================== BOOT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initProductSliders();
  initCart();
  initFAQ();
  initReviews();
  initCountdown();
  initBooking();
  initShopFilter();
  initAOS();
});