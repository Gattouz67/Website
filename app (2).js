/* =====================
   FIREBASE CONFIG
===================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5-48Kev8hwHuEMchPS9Sc2eHkYHP1N1g",
  authDomain: "unboxing-chill.firebaseapp.com",
  projectId: "unboxing-chill",
  storageBucket: "unboxing-chill.firebasestorage.app",
  messagingSenderId: "257046671890",
  appId: "1:257046671890:web:4e252d6a23fe0638c29ecb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =====================
   ÉTAT
===================== */
let PCS = [];
let cart = {};
let currentFilter = "tous";

/* =====================
   CHARGEMENT FIREBASE
===================== */
function ecouterStock() {
  const stockRef = collection(db, "stock");
  onSnapshot(stockRef, (snapshot) => {
    PCS = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.qte > 0) { // afficher seulement si en stock
        PCS.push({ id: doc.id, ...data });
      }
    });
    renderGrid();
    updateCartCount();
  });
}

/* =====================
   RENDU CATALOGUE
===================== */
function getTagLabel(type) {
  return { neuf: "Neuf", reconditionne: "Reconditionné", occasion: "Occasion" }[type] || type;
}

function renderGrid() {
  const grid = document.getElementById("grid");

  if (PCS.length === 0) {
    grid.innerHTML = '<div class="empty">Chargement des PCs en cours...</div>';
    return;
  }

  const list = currentFilter === "tous"
    ? PCS
    : PCS.filter(p => p.type === currentFilter);

  if (!list.length) {
    grid.innerHTML = '<div class="empty">Aucun PC dans cette catégorie.</div>';
    return;
  }

  const emojis = { neuf: "🖥️", reconditionne: "💻", occasion: "🎮" };

  grid.innerHTML = list.map(p => `
    <div class="card">
      <div class="card-img">${emojis[p.type] || "🖥️"}</div>
      <span class="card-tag tag-${p.type}">${getTagLabel(p.type)}</span>
      <div class="card-name">${p.nom}</div>
      <div class="card-specs">${p.specs || ""}</div>
      <div class="card-bottom">
        <span class="card-price">${p.prix} €</span>
        <button class="add-btn" data-id="${p.id}">+ Ajouter</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
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
  showToast(`${p ? p.nom : "PC"} ajouté au panier !`);
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
    if (!p) return "";
    return `
      <div class="modal-item">
        <span class="modal-item-name">${p.nom}</span>
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
    return p ? s + p.prix * cart[k] : s;
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
ecouterStock();
