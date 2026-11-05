/* ==========================================================================
   AESTHETURE - Main Interactive Scripts
   ========================================================================== */

// ============ MOBILE NAVIGATION & NAVBAR SCROLL ============
const hamburger = document.getElementById("hamburger");
const dark = document.getElementById("dark");
const navbar = document.getElementById("navbar");

function toggleOverlay() {
  if (!hamburger || !dark) return;
  dark.classList.toggle('active', hamburger.checked);
}

function handleScroll() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 10);

  // Floating Back-to-Top button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  }
}

if (hamburger) {
  hamburger.addEventListener('change', toggleOverlay);
  toggleOverlay();

  // Close hamburger menu when clicking a nav link
  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.checked = false;
      toggleOverlay();
    });
  });
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// Back to top click handler
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Body scroll locking helper
function setScrollLock(locked) {
  document.body.classList.toggle('no-scroll', locked);
}

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  if (question && answer) {
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          const q = openItem.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
          const ans = openItem.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = null;
        }
      });

      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  }
});

// ============ PRODUCT CATALOG (search, dropdown filters, sort, pagination) ============
const catalogGrid = document.getElementById('catalogGrid');

if (catalogGrid) {
  const cards = Array.from(catalogGrid.querySelectorAll('.product-card'));
  const searchInput = document.getElementById('productSearch');
  const categorySelect = document.getElementById('filterCategory');
  const priceSelect = document.getElementById('filterPrice');
  const sortSelect = document.getElementById('sortPopularity');
  const countLabel = document.getElementById('catalogCount');
  const emptyLabel = document.getElementById('catalogEmpty');
  const emptyResetContainer = document.getElementById('emptyResetContainer');
  const resetFilterBtn = document.getElementById('resetFilterBtn');
  const paginationEl = document.getElementById('pagination');
  const perPage = 6;
  let currentPage = 1;

  function matchesPrice(price, bucket) {
    if (bucket === 'all') return true;
    if (bucket === 'low') return price < 2000000;
    if (bucket === 'mid') return price >= 2000000 && price <= 3500000;
    if (bucket === 'high') return price > 3500000 && price <= 5000000;
    return true;
  }

  function getFiltered() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : 'all';
    const priceBucket = priceSelect ? priceSelect.value : 'all';

    let filtered = cards.filter((card) => {
      const titleEl = card.querySelector('h3');
      const name = titleEl ? titleEl.textContent.toLowerCase() : '';
      const cardCategory = card.dataset.category || '';
      const price = Number(card.dataset.price) || 0;
      const matchesSearch = !query || name.includes(query);
      const matchesCategory = category === 'all' || cardCategory === category;
      return matchesSearch && matchesCategory && matchesPrice(price, priceBucket);
    });

    const sortBy = sortSelect ? sortSelect.value : 'popular';
    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
      if (sortBy === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
      return Number(b.dataset.popularity || 0) - Number(a.dataset.popularity || 0);
    });

    return filtered;
  }

  function render() {
    cards.forEach((card) => { card.style.display = 'none'; });

    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    pageItems.forEach((card) => {
      card.style.display = '';
      card.classList.add('aos-animate');
      catalogGrid.appendChild(card);
    });

    if (countLabel) {
      countLabel.textContent = filtered.length
        ? `Menampilkan ${pageItems.length} dari ${filtered.length} produk pilihan (Maks. Rp 5 Juta)`
        : '';
    }
    if (emptyLabel) {
      emptyLabel.hidden = filtered.length !== 0;
    }
    if (emptyResetContainer) {
      emptyResetContainer.hidden = filtered.length !== 0;
    }

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.textContent = '‹';
    prev.setAttribute('aria-label', 'Halaman sebelumnya');
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => { currentPage -= 1; render(); });
    paginationEl.appendChild(prev);

    for (let i = 1; i <= totalPages; i += 1) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.setAttribute('aria-label', `Halaman ${i}`);
      btn.classList.toggle('active', i === currentPage);
      btn.addEventListener('click', () => { currentPage = i; render(); });
      paginationEl.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = '›';
    next.setAttribute('aria-label', 'Halaman selanjutnya');
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => { currentPage += 1; render(); });
    paginationEl.appendChild(next);
  }

  // Select inputs & search event listeners
  [searchInput, categorySelect, priceSelect, sortSelect].forEach((el) => {
    if (!el) return;
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => { currentPage = 1; render(); });
  });

  // Reset filter button
  function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';
    if (priceSelect) priceSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'popular';
    currentPage = 1;
    render();
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', resetAllFilters);
  }

  // Handle URL query parameter search / filtering if present (e.g. from Before-After hotspot CTA)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('id') || urlParams.get('search') || urlParams.get('q');
  if (searchParam && searchInput) {
    const idMap = {
      'sofa-bed': 'Sofa Bed Minimalis',
      'meja-kopi-bulat': 'Meja Kopi Bulat',
      'kursi-rotan': 'Kursi Makan Rotan',
      'meja-nakas': 'Meja Nakas Kayu',
      'ambalan-kayu': 'Ambalan & Meja Kerja',
      'cermin-bulat': 'Cermin Dinding',
      'bangku-selaras': 'Kursi Bar',
      'lampu-tripod': 'Lampu Sudut',
      'kursi-santai': 'Kursi Santai',
      'meja-tv': 'Meja TV Kayu',
      'meja-kerja-elektrik': 'Meja Kerja Elektrik',
      'kursi-kerja-ergonomis': 'Kursi Kerja Ergonomis'
    };
    searchInput.value = idMap[searchParam] || searchParam.replace(/-/g, ' ');
  }

  render();
}

// ============ QUICK VIEW MODAL (GLOBAL - Index & Product) ============
const modalOverlay = document.getElementById('modalOverlay');
let currentProduct = null;

function closeModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    setScrollLock(false);
  }
}

function updateWhatsAppLink() {
  const modalWaBtn = document.getElementById('modalWaBtn');
  if (!modalWaBtn) return;
  const activeVariantEl = modalOverlay ? modalOverlay.querySelector('.variant.active') : null;
  const variantText = activeVariantEl ? activeVariantEl.textContent.trim() : 'Standar';
  const name = currentProduct?.name || document.getElementById('modalTitle')?.textContent?.trim() || 'Furnitur Aestheture';
  const material = currentProduct?.material || document.getElementById('modalMaterial')?.textContent?.trim() || 'Kayu Solid';
  const dimension = currentProduct?.dimension || document.getElementById('modalDimension')?.textContent?.trim() || 'Standar';
  const price = currentProduct?.price || document.getElementById('modalPrice')?.textContent?.trim() || '-';
  const message = `Halo Aestheture, saya ingin berkonsultasi / memesan produk:\n\n*${name}*\n• Material: ${material}\n• Dimensi: ${dimension}\n• Pilihan Opsi: ${variantText}\n• Harga: ${price}\n\nApakah stok siap kirim atau bisa di-custom untuk ruangan saya? Terima kasih!`;
  modalWaBtn.href = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
}

function openModal(btn) {
  if (!modalOverlay) return;
  const modalClose = document.getElementById('modalClose');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalMaterial = document.getElementById('modalMaterial');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalDimension = document.getElementById('modalDimension');
  const modalFinish = document.getElementById('modalFinish');

  currentProduct = {
    name: btn.dataset.name || '',
    price: btn.dataset.price || '',
    material: btn.dataset.material || '',
    img: btn.dataset.img || '',
    desc: btn.dataset.desc || '',
    dimension: btn.dataset.dimension || 'Sesuai spesifikasi standar',
    finish: btn.dataset.finish || 'Natural Matte Oil / Satin'
  };

  if (modalImg) {
    modalImg.src = normalizeImagePath(currentProduct.img);
    modalImg.alt = currentProduct.name;
  }
  if (modalTitle) modalTitle.textContent = currentProduct.name;
  if (modalMaterial) modalMaterial.textContent = currentProduct.material;
  if (modalDesc) modalDesc.textContent = currentProduct.desc;
  if (modalPrice) modalPrice.textContent = currentProduct.price;
  if (modalDimension) modalDimension.textContent = currentProduct.dimension;
  if (modalFinish) modalFinish.textContent = currentProduct.finish;

  // Reset quantity input to 1
  const qtyInput = document.getElementById('modalQtyInput');
  if (qtyInput) qtyInput.value = 1;

  // Reset active variant to default (first variant)
  const variants = modalOverlay.querySelectorAll('.variant');
  variants.forEach((v, i) => v.classList.toggle('active', i === 0));

  updateWhatsAppLink();
  modalOverlay.classList.add('open');
  setScrollLock(true);
}

if (modalOverlay) {
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });

  modalOverlay.querySelectorAll('.variant').forEach((variant) => {
    variant.addEventListener('click', () => {
      modalOverlay.querySelectorAll('.variant').forEach((v) => v.classList.remove('active'));
      variant.classList.add('active');
      updateWhatsAppLink();
    });
  });
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.quick-view');
  if (btn) {
    e.preventDefault();
    openModal(btn);
  }
});

// ============ SHOPPING CART MANAGER ============
const CART_STORAGE_KEY = 'aestheture_cart';

function isInsidePagesDir() {
  const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
  return path.includes('/pages/') || path.endsWith('/pages') || document.querySelector('link[href^="../assets"]') !== null;
}

function normalizeImagePath(imgSrc) {
  if (!imgSrc) return '';
  const src = String(imgSrc).trim();
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('//')
  ) {
    return src;
  }
  const cleanPath = src.replace(/^(\.\.\/|\.\/|\/)+/, '');
  const inPages = isInsidePagesDir();
  return inPages ? '../' + cleanPath : cleanPath;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
  updateCartUI();
}

function parsePriceToNumber(price) {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d]/g, '');
  return Number(cleaned) || 0;
}

function formatPriceRupiah(amount) {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}

function addToCart(item, quantity = 1, variant = 'Standar') {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const cart = getCart();
  const numPrice = parsePriceToNumber(item.price);
  const formatted = formatPriceRupiah(numPrice);

  const existingIndex = cart.findIndex(
    (c) => c.name === item.name && (c.variant || 'Standar') === (variant || 'Standar')
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({
      name: item.name,
      price: numPrice,
      formattedPrice: formatted,
      img: item.img || '',
      variant: variant || 'Standar',
      material: item.material || '',
      quantity: qty
    });
  }

  saveCart(cart);
  showCartToast('Ditambahkan ke Keranjang', `${qty}x ${item.name} (${variant || 'Standar'})`);
  bumpCartBadge();
}

function updateCartItemQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
}

function removeCartItem(index) {
  const cart = getCart();
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function bumpCartBadge() {
  document.querySelectorAll('.nav-cart-badge').forEach((badge) => {
    badge.classList.remove('bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
  });
}

function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // 1. Update badges on all navbars
  document.querySelectorAll('.nav-cart-badge').forEach((badge) => {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  });

  // 2. Update drawer header count
  const cartHeaderCount = document.getElementById('cartHeaderCount');
  if (cartHeaderCount) {
    cartHeaderCount.textContent = `${totalCount} item`;
  }

  // 3. Update drawer total price
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  if (cartTotalPrice) {
    cartTotalPrice.textContent = formatPriceRupiah(totalPrice);
  }

  // 4. Update cart drawer body
  const cartBody = document.getElementById('cartBody');
  const cartFooter = document.getElementById('cartFooter');

  if (cartBody) {
    const isPages = isInsidePagesDir();
    const catalogHref = isPages ? 'product.html' : 'pages/product.html';
    const fallbackLogo = isPages ? '../assets/photo/logo.png' : 'assets/photo/logo.png';

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty-view">
          <div class="cart-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h4 class="cart-empty-title">Keranjang Anda Masih Kosong</h4>
          <p class="cart-empty-text">Temukan berbagai perabot kayu solid modern buatan pengrajin Jepara untuk rumah impian Anda.</p>
          <a href="${catalogHref}" class="btn-browse-catalog" onclick="closeCartDrawer()">Mulai Belanja</a>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      if (cartFooter) cartFooter.style.display = '';
      cartBody.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${normalizeImagePath(item.img) || fallbackLogo}" alt="${escapeHtml(item.name)}">
          </div>
          <div class="cart-item-info">
            <div>
              <div class="cart-item-title">${escapeHtml(item.name)}</div>
              <div class="cart-item-spec">Opsi: ${escapeHtml(item.variant || 'Standar')}</div>
            </div>
            <div class="cart-item-price">${formatPriceRupiah(item.price * item.quantity)}</div>
            <div class="cart-item-actions">
              <div class="cart-qty-control">
                <button type="button" class="cart-qty-btn btn-qty-minus" data-index="${idx}" aria-label="Kurangi kuantitas">&minus;</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button type="button" class="cart-qty-btn btn-qty-plus" data-index="${idx}" aria-label="Tambah kuantitas">&#43;</button>
              </div>
              <button type="button" class="cart-item-remove btn-item-remove" data-index="${idx}" aria-label="Hapus item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Hapus
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // 5. Update checkout WhatsApp button href
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  if (cartCheckoutBtn && cart.length > 0) {
    const orderLines = cart.map((it, i) => {
      const unitStr = it.quantity > 1 ? ` (${formatPriceRupiah(it.price)}/unit)` : '';
      return `${i + 1}. *${it.name}*\n   • Opsi: ${it.variant || 'Standar'}\n   • Jumlah: ${it.quantity} unit\n   • Subtotal: ${formatPriceRupiah(it.price * it.quantity)}${unitStr}`;
    }).join('\n\n');

    const msg = `Halo Aestheture, saya ingin melakukan pemesanan furnitur melalui keranjang website:\n\n${orderLines}\n\n*TOTAL PESANAN: ${formatPriceRupiah(totalPrice)}*\n(Gratis Ongkir & Perakitan se-Jabodetabek)\n\nMohon informasi stok, estimasi pengiriman, dan instruksi pembayarannya. Terima kasih!`;
    cartCheckoutBtn.href = `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
  }
}

// Drawer Controls
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');

function openCartDrawer() {
  if (!cartDrawer || !cartOverlay) return;
  updateCartUI();
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartOverlay.setAttribute('aria-hidden', 'false');
  setScrollLock(true);
}

function closeCartDrawer() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartOverlay.setAttribute('aria-hidden', 'true');
  setScrollLock(false);
}

// Toast Controls
let toastTimer = null;
function showCartToast(title, desc) {
  const toast = document.getElementById('cartToast');
  if (!toast) return;
  const titleEl = document.getElementById('toastTitle');
  const descEl = document.getElementById('toastDesc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Global Cart Event Listeners
document.addEventListener('click', (e) => {
  // 1. Open Cart Drawer button in nav
  const navCartBtn = e.target.closest('.nav-cart-btn');
  if (navCartBtn) {
    e.preventDefault();
    openCartDrawer();
    return;
  }

  // 2. Close Cart Drawer button
  if (e.target.closest('#cartCloseBtn') || e.target === cartOverlay) {
    closeCartDrawer();
    return;
  }

  // 3. Clear Cart button
  if (e.target.closest('#clearCartBtn')) {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh isi keranjang?')) {
      clearCart();
    }
    return;
  }

  // 4. Cart Drawer item qty +/- and remove
  const minusBtn = e.target.closest('.btn-qty-minus');
  if (minusBtn) {
    const idx = parseInt(minusBtn.dataset.index, 10);
    updateCartItemQuantity(idx, -1);
    return;
  }

  const plusBtn = e.target.closest('.btn-qty-plus');
  if (plusBtn) {
    const idx = parseInt(plusBtn.dataset.index, 10);
    updateCartItemQuantity(idx, 1);
    return;
  }

  const removeBtn = e.target.closest('.btn-item-remove');
  if (removeBtn) {
    const idx = parseInt(removeBtn.dataset.index, 10);
    removeCartItem(idx);
    return;
  }

  // 5. Toast "Lihat" button
  if (e.target.closest('#toastOpenCart')) {
    const toast = document.getElementById('cartToast');
    if (toast) toast.classList.remove('show');
    openCartDrawer();
    return;
  }

  // 6. Direct "Tambah ke Keranjang" button on product cards
  const addCartBtn = e.target.closest('.btn-add-cart');
  if (addCartBtn) {
    e.preventDefault();
    const card = addCartBtn.closest('.product-card');
    const quickViewBtn = card ? card.querySelector('.quick-view') : null;
    
    const name = addCartBtn.dataset.name || (quickViewBtn ? quickViewBtn.dataset.name : card?.querySelector('h3')?.textContent?.trim()) || 'Furnitur Modern';
    const price = addCartBtn.dataset.price || (quickViewBtn ? quickViewBtn.dataset.price : card?.dataset.price || card?.querySelector('.price')?.textContent?.trim()) || '0';
    const img = addCartBtn.dataset.img || (quickViewBtn ? quickViewBtn.dataset.img : card?.querySelector('.product-thumb img')?.getAttribute('src')) || '';
    const material = quickViewBtn?.dataset.material || '';

    addToCart({ name, price, img, material }, 1, 'Standar');
    return;
  }

  // 7. Modal "Tambah ke Keranjang" button
  const modalAddCartBtn = e.target.closest('#modalAddCartBtn');
  if (modalAddCartBtn) {
    e.preventDefault();
    const modalTitleEl = document.getElementById('modalTitle');
    const modalPriceEl = document.getElementById('modalPrice');
    const modalImgEl = document.getElementById('modalImg');
    const modalMaterialEl = document.getElementById('modalMaterial');

    const name = currentProduct?.name || modalTitleEl?.textContent?.trim() || 'Furnitur Modern';
    const price = currentProduct?.price || modalPriceEl?.textContent?.trim() || '0';
    const img = currentProduct?.img || modalImgEl?.getAttribute('src') || '';
    const material = currentProduct?.material || modalMaterialEl?.textContent?.trim() || '';

    const activeVariantEl = modalOverlay ? modalOverlay.querySelector('.variant.active') : null;
    const variantText = activeVariantEl ? activeVariantEl.textContent.trim() : 'Standar';
    const qtyInput = document.getElementById('modalQtyInput');
    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

    addToCart({ name, price, img, material }, qty, variantText);
    closeModal();
    return;
  }

  // 8. Modal Qty +/- buttons
  if (e.target.closest('#modalQtyMinus')) {
    const input = document.getElementById('modalQtyInput');
    if (input) {
      const val = parseInt(input.value, 10) || 1;
      if (val > 1) input.value = val - 1;
    }
    return;
  }

  if (e.target.closest('#modalQtyPlus')) {
    const input = document.getElementById('modalQtyInput');
    if (input) {
      const val = parseInt(input.value, 10) || 1;
      if (val < 99) input.value = val + 1;
    }
    return;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) {
    closeCartDrawer();
  }
});

// Run Cart UI initial update on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCartUI);
} else {
  updateCartUI();
}

// ============ GALLERY FILTER + LIGHTBOX ============
const masonryGrid = document.getElementById('masonryGrid');
const lightboxOverlay = document.getElementById('lightboxOverlay');

if (lightboxOverlay) {
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function getVisibleGalleryItems() {
    return Array.from(document.querySelectorAll('.masonry-item:not(.hidden), .ugc-item'));
  }

  function showCurrent() {
    const list = getVisibleGalleryItems();
    const item = list[currentIndex];
    if (!item) return;
    const imgSrc = item.dataset.img || item.querySelector('img')?.src;
    const caption = item.dataset.caption || item.querySelector('img')?.alt || 'Foto Galeri Aestheture';
    
    if (lightboxImg) {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = caption;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = caption;
    }
  }

  function openLightbox(item) {
    const list = getVisibleGalleryItems();
    currentIndex = list.indexOf(item);
    if (currentIndex < 0) currentIndex = 0;
    showCurrent();
    lightboxOverlay.classList.add('open');
    setScrollLock(true);
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('open');
    setScrollLock(false);
  }

  function step(direction) {
    const list = getVisibleGalleryItems();
    if (list.length === 0) return;
    currentIndex = (currentIndex + direction + list.length) % list.length;
    showCurrent();
  }

  // Filter Buttons
  const filterButtons = document.querySelectorAll('.gallery-filter');
  if (filterButtons.length && masonryGrid) {
    const masonryItems = Array.from(masonryGrid.querySelectorAll('.masonry-item'));
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        masonryItems.forEach((item) => {
          const show = filter === 'all' || item.dataset.filter === filter;
          item.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // Click triggers for lightbox
  document.querySelectorAll('.masonry-item, .ugc-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(item);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => step(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => step(1));
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
}

// ============ TESTIMONIAL CAROUSEL (TRACK, DOTS, CONTROLS & AUTOPLAY) ============
const track = document.getElementById('testimonialTrack');
const dotsContainer = document.getElementById('testimonialDots');

if (track && dotsContainer) {
  const cards = track.querySelectorAll('.testimonial-card');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  let autoPlayTimer = null;

  function getCardScrollPosition(card) {
    const trackPaddingLeft = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    return Math.max(0, card.offsetLeft - track.offsetLeft - trackPaddingLeft);
  }

  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `Testimoni ${i + 1}`);
    dot.addEventListener('click', () => {
      scrollToIndex(i);
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('span');

  function updateActiveDot() {
    let closestIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, i) => {
      const cardPos = getCardScrollPosition(card);
      const distance = Math.abs(cardPos - track.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === closestIndex));
    return closestIndex;
  }

  track.addEventListener('scroll', updateActiveDot, { passive: true });

  function scrollToIndex(index) {
    const target = (index + cards.length) % cards.length;
    const targetCard = cards[target];
    if (!targetCard) return;

    track.scrollTo({
      left: getCardScrollPosition(targetCard),
      behavior: 'smooth'
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const current = updateActiveDot();
      scrollToIndex(current - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const current = updateActiveDot();
      scrollToIndex(current + 1);
    });
  }

  // Autoplay (hanya scroll track horizontal tanpa menyeret halaman vertikal)
  let isIntersecting = true;

  function startAutoplay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      if (isIntersecting && !document.hidden) {
        const current = updateActiveDot();
        scrollToIndex(current + 1);
      }
    }, 5500);
  }

  function stopAutoplay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Pause saat hover/touch
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);
  track.addEventListener('touchstart', stopAutoplay, { passive: true });
  track.addEventListener('touchend', startAutoplay, { passive: true });

  // Pause autoplay jika section testimonial sedang di luar layar
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
      });
    }, { threshold: 0.2 });

    const testiSection = document.getElementById('testimoni') || track;
    sectionObserver.observe(testiSection);
  }

  startAutoplay();
}

// ============ NEWSLETTER FORM HANDLER ============
const newsletterForm = document.getElementById('newsletterForm');
const newsletterNote = document.getElementById('newsletterNote');

if (newsletterForm && newsletterNote) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterNote.textContent = '✓ Terima kasih! Kode voucher diskon 10% telah dikirim ke email Anda.';
    newsletterForm.reset();
    setTimeout(() => {
      newsletterNote.textContent = '';
    }, 6000);
  });
}

// ============ ANIMATE ON SCROLL (AOS) ============
function initAOS() {
  const aosElements = document.querySelectorAll('[data-aos]');
  if (!aosElements.length) return;

  if (!('IntersectionObserver' in window)) {
    aosElements.forEach((el) => el.classList.add('aos-animate'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    }
  );

  aosElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('aos-animate');
    } else {
      observer.observe(el);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAOS();
  });
} else {
  initAOS();
}


