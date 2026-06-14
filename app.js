/* =====================
   DONNÉES PRODUITS
   (modifie ici pour ajouter / changer tes PCs)
===================== */
const PCS = [
  {
    id: 1,
    name: "PC Bureau Polyvalent",
    type: "reconditionne",
    prix: 299,
    specs: "Intel i5-9400 · 16 Go RAM · SSD 512 Go · Windows 11",
    emoji: "🖥️"
  },
  {
    id: 2,
    name: "Tour Gaming Entrée",
    type: "occasion",
    prix: 450,
    specs: "Ryzen 5 3600 · 16 Go RAM · GTX 1660 · SSD 1 To",
    emoji: "🎮"
  },
  {
    id: 3,
    name: "Mini PC Compact",
    type: "reconditionne",
    prix: 180,
    specs: "Intel i3-8100T · 8 Go RAM · SSD 256 Go · Windows 11",
    emoji: "💻"
  },
  {
    id: 4,
    name: "Workstation Pro",
    type: "neuf",
    prix: 890,
    specs: "Intel i7-13700 · 32 Go RAM · RTX 3060 · NVMe 2 To",
    emoji: "🖧"
  },
  {
    id: 5,
    name: "PC Familial",
    type: "reconditionne",
    prix: 220,
    specs: "Intel i5-8400 · 8 Go RAM · HDD 1 To · Windows 10",
    emoji: "🏠"
  },
  {
    id: 6,
    name: "Gaming Mid-Range",
    type: "neuf",
    prix: 750,
    specs: "Ryzen 7 5700X · 32 Go RAM · RX 6700 XT · SSD 1 To",
    emoji: "🎮"
  }
];

/* =====================
   ÉTAT DU PANIER
===================== */
let cart = {};
let currentFilter = "tous";

/* =====================
   RENDU DU CATALOGUE
===================== */
function getTagLabel(type) {
  const labels = { neuf: "Neuf", reconditionne: "Reconditionné", occasion: "Occasion" };
  return labels[type] || type;
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const list = currentFilter === "tous"
    ? PCS
    : PCS.filter(p => p.type === currentFilter);

  if (!list.length) {
    grid.innerHTML = '<div class="empty">Aucun PC dans cette catégorie.</div>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="card">
      <div class="card-img">${p.emoji}</div>
      <span class="card-tag tag-${p.type}">${getTagLabel(p.type)}</span>
      <div class="card-name">${p.name}</div>
      <div class="card-specs">${p.specs}</div>
      <div class="card-bottom">
        <span class="card-price">${p.prix} €</span>
        <button class="add-btn" data-id="${p.id}">+ Ajouter</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

/* =====================
   FILTRES
===================== */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderGrid();
  });
});

/* =====================
   PANIER
===================== */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartCount();
  const p = PCS.find(x => x.id === id);
  showToast(`${p.name} ajouté au panier !`);
}

function updateCartCount() {
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById("cart-count").textContent = total;
}

function renderCartModal() {
  const el = document.getElementById("cart-items");
  const keys = Object.keys(cart).filter(k => cart[k] > 0);

  if (!keys.length) {
    el.innerHTML = '<div class="modal-empty">Votre panier est vide.</div>';
    document.getElementById("cart-total").textContent = "0 €";
    return;
  }

  el.innerHTML = keys.map(k => {
    const p = PCS.find(x => x.id == k);
    return `
      <div class="modal-item">
        <span class="modal-item-name">${p.name}</span>
        <div class="qty-ctrl">
          <button class="qty-btn" data-id="${k}" data-delta="-1">−</button>
          <span>${cart[k]}</span>
          <button class="qty-btn" data-id="${k}" data-delta="1">+</button>
        </div>
        <span>${p.prix * cart[k]} €</span>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const delta = Number(btn.dataset.delta);
      cart[id] = Math.max(0, (cart[id] || 0) + delta);
      updateCartCount();
      renderCartModal();
    });
  });

  const total = keys.reduce((s, k) => {
    const p = PCS.find(x => x.id == k);
    return s + p.prix * cart[k];
  }, 0);
  document.getElementById("cart-total").textContent = total + " €";
}

function openCart() {
  renderCartModal();
  document.getElementById("cart-modal").classList.add("open");
}

function closeCart() {
  document.getElementById("cart-modal").classList.remove("open");
}

document.getElementById("cart-open-btn").addEventListener("click", openCart);
document.getElementById("cart-close-btn").addEventListener("click", closeCart);

document.getElementById("checkout-btn").addEventListener("click", () => {
  closeCart();
  showToast("Redirection vers le paiement…");
  /* TODO: intégrer Stripe ou PayPal ici */
});

document.getElementById("cart-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("cart-modal")) closeCart();
});

/* =====================
   TOAST
===================== */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

/* =====================
   INIT
===================== */
renderGrid();
