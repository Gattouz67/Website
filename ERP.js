/* =====================
   DONNÉES INITIALES
   (remplacées par localStorage au fil du temps)
===================== */
const DEFAULT_STOCK = [
  { id: 1, nom: "PC Bureau Polyvalent", type: "reconditionne", prix: 299, qte: 3, specs: "Intel i5-9400 · 16 Go RAM · SSD 512 Go" },
  { id: 2, nom: "Tour Gaming Entrée",   type: "occasion",      prix: 450, qte: 2, specs: "Ryzen 5 3600 · GTX 1660 · SSD 1 To" },
  { id: 3, nom: "Mini PC Compact",      type: "reconditionne", prix: 180, qte: 1, specs: "Intel i3-8100T · 8 Go RAM · SSD 256 Go" },
  { id: 4, nom: "Workstation Pro",      type: "neuf",          prix: 890, qte: 2, specs: "Intel i7-13700 · 32 Go RAM · RTX 3060" },
  { id: 5, nom: "PC Familial",          type: "reconditionne", prix: 220, qte: 4, specs: "Intel i5-8400 · 8 Go RAM · HDD 1 To" },
  { id: 6, nom: "Gaming Mid-Range",     type: "neuf",          prix: 750, qte: 3, specs: "Ryzen 7 5700X · RX 6700 XT · SSD 1 To" }
];

const DEFAULT_CLIENTS = [
  { id: 1, prenom: "Marie",  nom: "Dupont",  email: "marie@email.fr",  tel: "06 12 34 56 78", type: "particulier", adresse: "12 rue des Lilas, Lille" },
  { id: 2, prenom: "Jean",   nom: "Martin",  email: "jean@email.fr",   tel: "06 98 76 54 32", type: "particulier", adresse: "8 av. Victor Hugo, Paris" },
  { id: 3, prenom: "Lucie",  nom: "Bernard", email: "lucie@email.fr",  tel: "07 11 22 33 44", type: "pro",         adresse: "Zone Industrielle, Lyon" },
  { id: 4, prenom: "Paul",   nom: "Leroy",   email: "paul@email.fr",   tel: "06 55 66 77 88", type: "particulier", adresse: "3 rue de la Paix, Bordeaux" }
];

const DEFAULT_COMMANDES = [
  { id: 1, clientId: 1, produitId: 1, montant: 299, livraison: "livraison",   paiement: "Stripe",   statut: "livree",    date: "2026-06-01" },
  { id: 2, clientId: 2, produitId: 6, montant: 750, livraison: "main propre", paiement: "Espèces",  statut: "en_cours",  date: "2026-06-10" },
  { id: 3, clientId: 3, produitId: 3, montant: 180, livraison: "livraison",   paiement: "PayPal",   statut: "preparee",  date: "2026-06-05" },
  { id: 4, clientId: 4, produitId: 4, montant: 890, livraison: "main propre", paiement: "Virement", statut: "en_attente",date: "2026-06-12" }
];

const DEFAULT_FACTURES = [
  { id: 1, clientId: 1, produitId: 1, montant: 299, date: "2026-06-01", echeance: "2026-06-15", paiement: "Stripe",   statut: "payee" },
  { id: 2, clientId: 3, produitId: 3, montant: 180, date: "2026-06-05", echeance: "2026-06-20", paiement: "PayPal",   statut: "payee" },
  { id: 3, clientId: 2, produitId: 6, montant: 750, date: "2026-06-10", echeance: "2026-06-25", paiement: "Espèces",  statut: "en_attente" },
  { id: 4, clientId: 4, produitId: 4, montant: 890, date: "2026-06-12", echeance: "2026-06-30", paiement: "Virement", statut: "impayee" }
];

/* =====================
   ÉTAT (localStorage)
===================== */
function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let stock     = load("erp_stock",     DEFAULT_STOCK);
let clients   = load("erp_clients",   DEFAULT_CLIENTS);
let commandes = load("erp_commandes", DEFAULT_COMMANDES);
let factures  = load("erp_factures",  DEFAULT_FACTURES);

let nextStockId    = Math.max(...stock.map(x => x.id), 0) + 1;
let nextClientId   = Math.max(...clients.map(x => x.id), 0) + 1;
let nextCmdId      = Math.max(...commandes.map(x => x.id), 0) + 1;
let nextFactureId  = Math.max(...factures.map(x => x.id), 0) + 1;

/* =====================
   NAVIGATION
===================== */
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("s-" + btn.dataset.section).classList.add("active");
    renderAll();
  });
});

/* =====================
   UTILITAIRES
===================== */
function clientName(id) {
  const c = clients.find(x => x.id === id);
  return c ? `${c.prenom} ${c.nom}` : "—";
}
function produitName(id) {
  const p = stock.find(x => x.id === id);
  return p ? p.nom : "—";
}
function typeLabel(t) {
  return { neuf: "Neuf", reconditionne: "Recon.", occasion: "Occasion" }[t] || t;
}
function typeBadge(t) {
  const cls = { neuf: "badge-success", reconditionne: "badge-info", occasion: "badge-warning" };
  return `<span class="badge ${cls[t] || 'badge-gray'}">${typeLabel(t)}</span>`;
}
function statutCmdBadge(s) {
  const map = {
    livree:      ["badge-success", "Livrée"],
    en_cours:    ["badge-warning", "En cours"],
    preparee:    ["badge-info",    "Préparée"],
    en_attente:  ["badge-danger",  "En attente"]
  };
  const [cls, label] = map[s] || ["badge-gray", s];
  return `<span class="badge ${cls}">${label}</span>`;
}
function statutFactBadge(s) {
  const map = {
    payee:       ["badge-success", "Payée"],
    en_attente:  ["badge-warning", "En attente"],
    impayee:     ["badge-danger",  "Impayée"]
  };
  const [cls, label] = map[s] || ["badge-gray", s];
  return `<span class="badge ${cls}">${label}</span>`;
}
function stockBar(qte) {
  const max = 5;
  const pct = Math.min(Math.round((qte / max) * 100), 100);
  const cls = qte <= 1 ? "low" : qte <= 2 ? "medium" : "high";
  return `<div class="stock-bar"><div class="stock-fill ${cls}" style="width:${pct}%"></div></div>`;
}
function formatDate(d) {
  if (!d) return "—";
  const [y, m, j] = d.split("-");
  return `${j}/${m}/${y}`;
}
function today() {
  return new Date().toISOString().split("T")[0];
}
function clientOptions(sel = null) {
  return clients.map(c =>
    `<option value="${c.id}" ${sel == c.id ? "selected" : ""}>${c.prenom} ${c.nom}</option>`
  ).join("");
}
function produitOptions(sel = null) {
  return stock.map(p =>
    `<option value="${p.id}" ${sel == p.id ? "selected" : ""}>${p.nom} (${p.prix} €)</option>`
  ).join("");
}

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
   MODAL
===================== */
let modalSaveCallback = null;

function openModal(title, bodyHTML, onSave) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = bodyHTML;
  modalSaveCallback = onSave;
  document.getElementById("modal").classList.add("open");
}
function closeModal() {
  document.getElementById("modal").classList.remove("open");
  modalSaveCallback = null;
}

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-cancel").addEventListener("click", closeModal);
document.getElementById("modal-save").addEventListener("click", () => {
  if (modalSaveCallback) modalSaveCallback();
});
document.getElementById("modal").addEventListener("click", e => {
  if (e.target === document.getElementById("modal")) closeModal();
});

/* =====================
   DASHBOARD
===================== */
function renderDashboard() {
  const ca = factures.filter(f => f.statut === "payee").reduce((s, f) => s + f.montant, 0);
  const enCours = commandes.filter(c => c.statut === "en_cours").length;
  const totalStock = stock.reduce((s, p) => s + p.qte, 0);
  const alertes = stock.filter(p => p.qte <= 1);

  document.getElementById("m-ca").textContent = ca.toLocaleString("fr-FR") + " €";
  document.getElementById("m-cmd").textContent = commandes.length;
  document.getElementById("m-cmd-sub").textContent = `En cours : ${enCours}`;
  document.getElementById("m-stock").textContent = totalStock;
  document.getElementById("m-stock-sub").textContent = `Alertes : ${alertes.length}`;
  document.getElementById("m-clients").textContent = clients.length;

  const alerteEl = document.getElementById("alerte-stock");
  if (alertes.length) {
    alerteEl.style.display = "block";
    alerteEl.textContent = "⚠ Stock faible : " + alertes.map(p => p.nom).join(", ");
  } else {
    alerteEl.style.display = "none";
  }

  const recent = [...commandes].sort((a, b) => b.id - a.id).slice(0, 5);
  document.getElementById("dash-commandes").innerHTML = recent.map(c => `
    <tr>
      <td>${clientName(c.clientId)}</td>
      <td>${produitName(c.produitId)}</td>
      <td>${c.montant} €</td>
      <td>${statutCmdBadge(c.statut)}</td>
    </tr>
  `).join("");
}

/* =====================
   STOCK
===================== */
function renderStock() {
  document.getElementById("stock-tbody").innerHTML = stock.map(p => `
    <tr>
      <td title="${p.nom}">${p.nom}</td>
      <td>${typeBadge(p.type)}</td>
      <td>${p.prix} €</td>
      <td>${p.qte}</td>
      <td>${stockBar(p.qte)}</td>
      <td>
        <button class="btn-icon" onclick="editStock(${p.id})">✏</button>
        <button class="btn-icon btn-danger" onclick="deleteStock(${p.id})">✕</button>
      </td>
    </tr>
  `).join("");
}

function stockForm(p = {}) {
  return `
    <div class="form-grid">
      <div class="form-group"><label>Nom du produit</label><input id="f-nom" type="text" value="${p.nom || ""}" placeholder="ex: PC Bureau i7"></div>
      <div class="form-group"><label>Type</label>
        <select id="f-type">
          <option value="neuf" ${p.type === "neuf" ? "selected" : ""}>Neuf</option>
          <option value="reconditionne" ${p.type === "reconditionne" ? "selected" : ""}>Reconditionné</option>
          <option value="occasion" ${p.type === "occasion" ? "selected" : ""}>Occasion</option>
        </select>
      </div>
      <div class="form-group"><label>Prix de vente (€)</label><input id="f-prix" type="number" value="${p.prix || ""}" placeholder="0"></div>
      <div class="form-group"><label>Quantité</label><input id="f-qte" type="number" value="${p.qte || 1}" min="0"></div>
      <div class="form-group full"><label>Specs techniques</label><textarea id="f-specs" placeholder="ex: Intel i7 · 16 Go RAM · SSD 512 Go">${p.specs || ""}</textarea></div>
    </div>
  `;
}

document.getElementById("btn-add-stock").addEventListener("click", () => {
  openModal("Ajouter un PC au stock", stockForm(), () => {
    const nom   = document.getElementById("f-nom").value.trim();
    const type  = document.getElementById("f-type").value;
    const prix  = Number(document.getElementById("f-prix").value);
    const qte   = Number(document.getElementById("f-qte").value);
    const specs = document.getElementById("f-specs").value.trim();
    if (!nom || !prix) { showToast("Remplis au moins le nom et le prix."); return; }
    stock.push({ id: nextStockId++, nom, type, prix, qte, specs });
    save("erp_stock", stock);
    closeModal();
    renderAll();
    showToast("PC ajouté au stock !");
  });
});

window.editStock = function(id) {
  const p = stock.find(x => x.id === id);
  openModal("Modifier le produit", stockForm(p), () => {
    p.nom   = document.getElementById("f-nom").value.trim();
    p.type  = document.getElementById("f-type").value;
    p.prix  = Number(document.getElementById("f-prix").value);
    p.qte   = Number(document.getElementById("f-qte").value);
    p.specs = document.getElementById("f-specs").value.trim();
    save("erp_stock", stock);
    closeModal();
    renderAll();
    showToast("Produit mis à jour !");
  });
};

window.deleteStock = function(id) {
  if (!confirm("Supprimer ce produit du stock ?")) return;
  stock = stock.filter(x => x.id !== id);
  save("erp_stock", stock);
  renderAll();
  showToast("Produit supprimé.");
};

/* =====================
   COMMANDES
===================== */
function renderCommandes() {
  document.getElementById("cmd-tbody").innerHTML = commandes.map(c => `
    <tr>
      <td>#${String(c.id).padStart(3,"0")}</td>
      <td>${clientName(c.clientId)}</td>
      <td>${produitName(c.produitId)}</td>
      <td>${c.montant} €</td>
      <td>${c.livraison}</td>
      <td>${c.paiement}</td>
      <td>${statutCmdBadge(c.statut)}</td>
      <td>
        <button class="btn-icon" onclick="editCmd(${c.id})">✏</button>
        <button class="btn-icon btn-danger" onclick="deleteCmd(${c.id})">✕</button>
      </td>
    </tr>
  `).join("");
}

function cmdForm(c = {}) {
  return `
    <div class="form-grid">
      <div class="form-group"><label>Client</label><select id="f-client">${clientOptions(c.clientId)}</select></div>
      <div class="form-group"><label>Produit</label><select id="f-produit">${produitOptions(c.produitId)}</select></div>
      <div class="form-group"><label>Livraison</label>
        <select id="f-livraison">
          <option value="livraison" ${c.livraison === "livraison" ? "selected" : ""}>Livraison</option>
          <option value="main propre" ${c.livraison === "main propre" ? "selected" : ""}>Remise en main propre</option>
        </select>
      </div>
      <div class="form-group"><label>Paiement</label>
        <select id="f-paiement">
          <option ${c.paiement === "Stripe" ? "selected" : ""}>Stripe</option>
          <option ${c.paiement === "PayPal" ? "selected" : ""}>PayPal</option>
          <option ${c.paiement === "Virement" ? "selected" : ""}>Virement</option>
          <option ${c.paiement === "Espèces" ? "selected" : ""}>Espèces</option>
        </select>
      </div>
      <div class="form-group"><label>Statut</label>
        <select id="f-statut">
          <option value="en_attente" ${c.statut === "en_attente" ? "selected" : ""}>En attente</option>
          <option value="en_cours"   ${c.statut === "en_cours"   ? "selected" : ""}>En cours</option>
          <option value="preparee"   ${c.statut === "preparee"   ? "selected" : ""}>Préparée</option>
          <option value="livree"     ${c.statut === "livree"     ? "selected" : ""}>Livrée</option>
        </select>
      </div>
      <div class="form-group"><label>Date</label><input id="f-date" type="date" value="${c.date || today()}"></div>
    </div>
  `;
}

document.getElementById("btn-add-cmd").addEventListener("click", () => {
  openModal("Nouvelle commande", cmdForm(), () => {
    const produitId = Number(document.getElementById("f-produit").value);
    const p = stock.find(x => x.id === produitId);
    commandes.push({
      id: nextCmdId++,
      clientId:  Number(document.getElementById("f-client").value),
      produitId,
      montant:   p ? p.prix : 0,
      livraison: document.getElementById("f-livraison").value,
      paiement:  document.getElementById("f-paiement").value,
      statut:    document.getElementById("f-statut").value,
      date:      document.getElementById("f-date").value
    });
    save("erp_commandes", commandes);
    closeModal();
    renderAll();
    showToast("Commande créée !");
  });
});

window.editCmd = function(id) {
  const c = commandes.find(x => x.id === id);
  openModal("Modifier la commande", cmdForm(c), () => {
    c.clientId  = Number(document.getElementById("f-client").value);
    c.produitId = Number(document.getElementById("f-produit").value);
    c.livraison = document.getElementById("f-livraison").value;
    c.paiement  = document.getElementById("f-paiement").value;
    c.statut    = document.getElementById("f-statut").value;
    c.date      = document.getElementById("f-date").value;
    save("erp_commandes", commandes);
    closeModal();
    renderAll();
    showToast("Commande mise à jour !");
  });
};

window.deleteCmd = function(id) {
  if (!confirm("Supprimer cette commande ?")) return;
  commandes = commandes.filter(x => x.id !== id);
  save("erp_commandes", commandes);
  renderAll();
  showToast("Commande supprimée.");
};

/* =====================
   CLIENTS
===================== */
function renderClients() {
  document.getElementById("clients-tbody").innerHTML = clients.map(c => `
    <tr>
      <td>${c.prenom} ${c.nom}</td>
      <td>${c.email}</td>
      <td>${c.tel}</td>
      <td><span class="badge ${c.type === "pro" ? "badge-success" : "badge-info"}">${c.type === "pro" ? "Pro" : "Particulier"}</span></td>
      <td>${commandes.filter(x => x.clientId === c.id).length}</td>
      <td>
        <button class="btn-icon" onclick="editClient(${c.id})">✏</button>
        <button class="btn-icon btn-danger" onclick="deleteClient(${c.id})">✕</button>
      </td>
    </tr>
  `).join("");
}

function clientForm(c = {}) {
  return `
    <div class="form-grid">
      <div class="form-group"><label>Prénom</label><input id="f-prenom" type="text" value="${c.prenom || ""}" placeholder="Prénom"></div>
      <div class="form-group"><label>Nom</label><input id="f-nom" type="text" value="${c.nom || ""}" placeholder="Nom"></div>
      <div class="form-group"><label>Email</label><input id="f-email" type="email" value="${c.email || ""}" placeholder="email@exemple.fr"></div>
      <div class="form-group"><label>Téléphone</label><input id="f-tel" type="tel" value="${c.tel || ""}" placeholder="06 00 00 00 00"></div>
      <div class="form-group"><label>Type</label>
        <select id="f-type">
          <option value="particulier" ${c.type === "particulier" ? "selected" : ""}>Particulier</option>
          <option value="pro" ${c.type === "pro" ? "selected" : ""}>Professionnel</option>
        </select>
      </div>
      <div class="form-group"><label>Adresse</label><input id="f-adresse" type="text" value="${c.adresse || ""}" placeholder="Adresse de livraison"></div>
    </div>
  `;
}

document.getElementById("btn-add-client").addEventListener("click", () => {
  openModal("Ajouter un client", clientForm(), () => {
    const prenom = document.getElementById("f-prenom").value.trim();
    const nom    = document.getElementById("f-nom").value.trim();
    if (!prenom || !nom) { showToast("Prénom et nom requis."); return; }
    clients.push({
      id: nextClientId++,
      prenom,
      nom,
      email:   document.getElementById("f-email").value.trim(),
      tel:     document.getElementById("f-tel").value.trim(),
      type:    document.getElementById("f-type").value,
      adresse: document.getElementById("f-adresse").value.trim()
    });
    save("erp_clients", clients);
    closeModal();
    renderAll();
    showToast("Client ajouté !");
  });
});

window.editClient = function(id) {
  const c = clients.find(x => x.id === id);
  openModal("Modifier le client", clientForm(c), () => {
    c.prenom  = document.getElementById("f-prenom").value.trim();
    c.nom     = document.getElementById("f-nom").value.trim();
    c.email   = document.getElementById("f-email").value.trim();
    c.tel     = document.getElementById("f-tel").value.trim();
    c.type    = document.getElementById("f-type").value;
    c.adresse = document.getElementById("f-adresse").value.trim();
    save("erp_clients", clients);
    closeModal();
    renderAll();
    showToast("Client mis à jour !");
  });
};

window.deleteClient = function(id) {
  if (!confirm("Supprimer ce client ?")) return;
  clients = clients.filter(x => x.id !== id);
  save("erp_clients", clients);
  renderAll();
  showToast("Client supprimé.");
};

/* =====================
   FACTURES
===================== */
function renderFactures() {
  document.getElementById("factures-tbody").innerHTML = factures.map(f => `
    <tr>
      <td>F-${String(f.id).padStart(3,"0")}</td>
      <td>${clientName(f.clientId)}</td>
      <td>${produitName(f.produitId)}</td>
      <td>${f.montant} €</td>
      <td>${formatDate(f.date)}</td>
      <td>${f.paiement}</td>
      <td>${statutFactBadge(f.statut)}</td>
      <td>
        <button class="btn-icon" onclick="editFacture(${f.id})">✏</button>
        <button class="btn-icon btn-danger" onclick="deleteFacture(${f.id})">✕</button>
      </td>
    </tr>
  `).join("");
}

function factureForm(f = {}) {
  return `
    <div class="form-grid">
      <div class="form-group"><label>Client</label><select id="f-client">${clientOptions(f.clientId)}</select></div>
      <div class="form-group"><label>Produit</label><select id="f-produit">${produitOptions(f.produitId)}</select></div>
      <div class="form-group"><label>Montant (€)</label><input id="f-montant" type="number" value="${f.montant || ""}"></div>
      <div class="form-group"><label>Date de facture</label><input id="f-date" type="date" value="${f.date || today()}"></div>
      <div class="form-group"><label>Date d'échéance</label><input id="f-echeance" type="date" value="${f.echeance || ""}"></div>
      <div class="form-group"><label>Paiement</label>
        <select id="f-paiement">
          <option ${f.paiement === "Stripe"   ? "selected" : ""}>Stripe</option>
          <option ${f.paiement === "PayPal"   ? "selected" : ""}>PayPal</option>
          <option ${f.paiement === "Virement" ? "selected" : ""}>Virement</option>
          <option ${f.paiement === "Espèces"  ? "selected" : ""}>Espèces</option>
        </select>
      </div>
      <div class="form-group"><label>Statut</label>
        <select id="f-statut">
          <option value="en_attente" ${f.statut === "en_attente" ? "selected" : ""}>En attente</option>
          <option value="payee"      ${f.statut === "payee"      ? "selected" : ""}>Payée</option>
          <option value="impayee"    ${f.statut === "impayee"    ? "selected" : ""}>Impayée</option>
        </select>
      </div>
    </div>
  `;
}

document.getElementById("btn-add-facture").addEventListener("click", () => {
  openModal("Créer une facture", factureForm(), () => {
    factures.push({
      id: nextFactureId++,
      clientId:  Number(document.getElementById("f-client").value),
      produitId: Number(document.getElementById("f-produit").value),
      montant:   Number(document.getElementById("f-montant").value),
      date:      document.getElementById("f-date").value,
      echeance:  document.getElementById("f-echeance").value,
      paiement:  document.getElementById("f-paiement").value,
      statut:    document.getElementById("f-statut").value
    });
    save("erp_factures", factures);
    closeModal();
    renderAll();
    showToast("Facture créée !");
  });
});

window.editFacture = function(id) {
  const f = factures.find(x => x.id === id);
  openModal("Modifier la facture", factureForm(f), () => {
    f.clientId  = Number(document.getElementById("f-client").value);
    f.produitId = Number(document.getElementById("f-produit").value);
    f.montant   = Number(document.getElementById("f-montant").value);
    f.date      = document.getElementById("f-date").value;
    f.echeance  = document.getElementById("f-echeance").value;
    f.paiement  = document.getElementById("f-paiement").value;
    f.statut    = document.getElementById("f-statut").value;
    save("erp_factures", factures);
    closeModal();
    renderAll();
    showToast("Facture mise à jour !");
  });
};

window.deleteFacture = function(id) {
  if (!confirm("Supprimer cette facture ?")) return;
  factures = factures.filter(x => x.id !== id);
  save("erp_factures", factures);
  renderAll();
  showToast("Facture supprimée.");
};

/* =====================
   RENDU GLOBAL
===================== */
function renderAll() {
  renderDashboard();
  renderStock();
  renderCommandes();
  renderClients();
  renderFactures();
}

renderAll();
