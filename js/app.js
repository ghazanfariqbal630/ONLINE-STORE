// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const money = (n) => `${STORE.currency} ${Number(n).toLocaleString("en-PK")}`;
const catById = (id) => CATEGORIES.find((c) => c.id === id);
const productById = (id) => PRODUCTS.find((p) => p.id === Number(id));
const params = new URLSearchParams(location.search);

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ---------- cart & wishlist ----------
let cart = load("cart", []); // [{id, qty}]
let wishlist = load("wishlist", []); // [id]

function addToCart(id, qty = 1) {
  const item = cart.find((i) => i.id === id);
  item ? (item.qty += qty) : cart.push({ id, qty });
  save("cart", cart);
  updateBadges();
  toast(`Added to cart: ${productById(id).name}`);
}
function setQty(id, qty) {
  cart = qty > 0 ? cart.map((i) => (i.id === id ? { ...i, qty } : i)) : cart.filter((i) => i.id !== id);
  save("cart", cart);
  updateBadges();
}
function toggleWish(id) {
  wishlist = wishlist.includes(id) ? wishlist.filter((w) => w !== id) : [...wishlist, id];
  save("wishlist", wishlist);
  updateBadges();
  document.querySelectorAll(`[data-wish="${id}"]`).forEach((b) => b.classList.toggle("on", wishlist.includes(id)));
}
function cartTotals() {
  const subtotal = cart.reduce((s, i) => s + productById(i.id).price * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= STORE.freeDeliveryOver ? 0 : STORE.deliveryFee;
  return { subtotal, delivery, total: subtotal + delivery, count: cart.reduce((s, i) => s + i.qty, 0) };
}
function updateBadges() {
  const c = $("#cartCount"), w = $("#wishCount");
  if (c) c.textContent = cartTotals().count;
  if (w) w.textContent = wishlist.length;
}

function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- shared UI ----------
function productImage(p, cls = "") {
  return p.image
    ? `<img class="pimg ${cls}" src="${p.image}" alt="${p.name}" loading="lazy">`
    : `<div class="pimg ${cls}" style="background:${catById(p.cat).color}"><span>${p.icon}</span></div>`;
}

function productCard(p) {
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  return `
  <article class="card">
    ${off ? `<span class="badge-off">-${off}%</span>` : ""}
    <button class="wish ${wishlist.includes(p.id) ? "on" : ""}" data-wish="${p.id}" onclick="toggleWish(${p.id})" aria-label="Add to wishlist">♥</button>
    <a href="product.html?id=${p.id}">${productImage(p)}</a>
    <div class="card-body">
      <small class="muted">${catById(p.cat).name}</small>
      <a href="product.html?id=${p.id}" class="pname">${p.name}</a>
      <div class="stars">★ ${p.rating.toFixed(1)}</div>
      <div class="price">${money(p.price)} ${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
      <button class="btn btn-sm" onclick="addToCart(${p.id})">Add to cart</button>
    </div>
  </article>`;
}

function renderHeader() {
  const cats = CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}">${c.icon} ${c.name}</a>`).join("");
  $("#header").innerHTML = `
  <div class="topbar">
    <div class="wrap">
      <span>🚚 Free delivery on orders over ${money(STORE.freeDeliveryOver)} · Cash on Delivery available</span>
      <span class="hide-sm">📞 ${STORE.phone}</span>
    </div>
  </div>
  <div class="mainbar wrap">
    <a href="index.html" class="logo">⛰️ ${STORE.name}</a>
    <form class="search" action="shop.html">
      <input name="q" placeholder="Search for shawls, jewelry, shilajit..." value="${params.get("q") || ""}">
      <button aria-label="Search">🔍</button>
    </form>
    <nav class="icons">
      <a href="shop.html?wish=1" title="Wishlist">♥ <b id="wishCount">0</b></a>
      <a href="cart.html" title="Cart">🛒 <b id="cartCount">0</b></a>
    </nav>
  </div>
  <nav class="catbar">
    <div class="wrap">
      <div class="dropdown">
        <button class="cat-btn">☰ Categories</button>
        <div class="menu">${cats}</div>
      </div>
      <a href="index.html">Home</a>
      <a href="shop.html">All Products</a>
      <a href="shop.html?sale=1">Discounted</a>
      <a href="shop.html?sort=new">New Arrivals</a>
      <a href="index.html#contact">Contact</a>
    </div>
  </nav>`;
  updateBadges();
}

function renderFooter() {
  $("#footer").innerHTML = `
  <section class="trust wrap">
    <div>🚚<b>Fast Delivery</b><small>All across Pakistan</small></div>
    <div>🔒<b>Safe Payment</b><small>Cash on Delivery & bank transfer</small></div>
    <div>↩️<b>7 Days Return</b><small>Easy return policy</small></div>
    <div>✅<b>100% Authentic</b><small>Genuine handmade products</small></div>
  </section>
  <footer class="footer" id="contact">
    <div class="wrap cols">
      <div>
        <div class="logo">⛰️ ${STORE.name}</div>
        <p>${STORE.tagline}. Handicrafts, jewelry, organic food and more — delivered to your door.</p>
      </div>
      <div>
        <h4>Shop</h4>
        <a href="shop.html?sort=new">New Arrivals</a>
        <a href="shop.html?sale=1">Discounted Products</a>
        <a href="shop.html?sort=rating">Top Rated</a>
        <a href="cart.html">My Cart</a>
      </div>
      <div>
        <h4>Contact</h4>
        <p>📞 ${STORE.phone}<br>✉️ ${STORE.email}<br>📍 ${STORE.address}</p>
      </div>
      <div>
        <h4>Newsletter</h4>
        <p>Get new arrivals and offers by email.</p>
        <form class="newsletter" onsubmit="event.preventDefault(); this.reset(); toast('Thanks for subscribing!')">
          <input type="email" required placeholder="Your email"><button class="btn btn-sm">Join</button>
        </form>
      </div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${STORE.name}. All rights reserved.</div>
  </footer>
  <a class="wa-float" href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">💬</a>`;
}

// ---------- pages ----------
function homePage() {
  $("#catGrid").innerHTML = CATEGORIES.map(
    (c) => `<a class="cat" href="shop.html?cat=${c.id}" style="background:${c.color}"><span>${c.icon}</span>${c.name}</a>`
  ).join("");
  const section = (tag, el) => ($(el).innerHTML = PRODUCTS.filter((p) => p.tags.includes(tag)).slice(0, 8).map(productCard).join(""));
  section("featured", "#featured");
  section("new", "#newArrivals");
  section("best", "#bestSelling");
  section("top", "#topRated");
}

function shopPage() {
  const cat = params.get("cat");
  const q = (params.get("q") || "").toLowerCase();
  const filters = $("#filters");
  filters.innerHTML =
    `<a href="shop.html" class="${!cat ? "active" : ""}">All</a>` +
    CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}" class="${cat === c.id ? "active" : ""}">${c.icon} ${c.name}</a>`).join("");

  const sortSel = $("#sort");
  sortSel.value = params.get("sort") || "default";

  function draw() {
    let list = PRODUCTS.filter(
      (p) =>
        (!cat || p.cat === cat) &&
        (!q || (p.name + p.desc + catById(p.cat).name).toLowerCase().includes(q)) &&
        (!params.get("sale") || p.old) &&
        (!params.get("wish") || wishlist.includes(p.id))
    );
    const s = sortSel.value;
    if (s === "low") list.sort((a, b) => a.price - b.price);
    if (s === "high") list.sort((a, b) => b.price - a.price);
    if (s === "rating") list.sort((a, b) => b.rating - a.rating);
    if (s === "new") list.sort((a, b) => b.id - a.id);

    const title = params.get("wish") ? "My Wishlist" : params.get("sale") ? "Discounted Products" : q ? `Results for “${q}”` : cat ? catById(cat).name : "All Products";
    $("#shopTitle").textContent = title;
    $("#count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    $("#shopGrid").innerHTML = list.length ? list.map(productCard).join("") : `<p class="empty">No products found.</p>`;
  }
  sortSel.onchange = draw;
  draw();
}

function productPage() {
  const p = productById(params.get("id"));
  const box = $("#product");
  if (!p) { box.innerHTML = `<p class="empty">Product not found. <a href="shop.html">Back to shop</a></p>`; return; }
  document.title = `${p.name} | ${STORE.name}`;
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  box.innerHTML = `
  <nav class="crumbs"><a href="index.html">Home</a> / <a href="shop.html?cat=${p.cat}">${catById(p.cat).name}</a> / ${p.name}</nav>
  <div class="pd">
    <div class="pd-img">${productImage(p, "big")}</div>
    <div class="pd-info">
      <h1>${p.name}</h1>
      <div class="stars">★ ${p.rating.toFixed(1)} <span class="muted">· Sold by ${p.seller}</span></div>
      <div class="price big">${money(p.price)} ${p.old ? `<s>${money(p.old)}</s> <span class="save">Save ${off}%</span>` : ""}</div>
      <p>${p.desc}</p>
      <div class="qty-row">
        <div class="qty"><button onclick="q.value=Math.max(1,q.value-1)">−</button><input id="q" type="number" min="1" value="1"><button onclick="q.value=+q.value+1">+</button></div>
        <button class="btn" onclick="addToCart(${p.id}, Math.max(1, +$('#q').value))">Add to cart</button>
        <button class="btn btn-outline" onclick="addToCart(${p.id}, Math.max(1, +$('#q').value)); location.href='cart.html'">Buy now</button>
      </div>
      <button class="link wish-link" data-wish="${p.id}" onclick="toggleWish(${p.id})">♥ Add to wishlist</button>
      <ul class="perks">
        <li>🚚 Delivery in 3–5 working days across Pakistan</li>
        <li>💵 Cash on Delivery available</li>
        <li>↩️ 7 days easy return</li>
      </ul>
    </div>
  </div>
  <h2 class="sec-title">You may also like</h2>
  <div class="grid">${PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat)).slice(0, 4).map(productCard).join("")}</div>`;
}

function cartPage() {
  const box = $("#cart");
  if (!cart.length) {
    box.innerHTML = `<div class="empty"><p>Your cart is empty.</p><a class="btn" href="shop.html">Start shopping</a></div>`;
    return;
  }
  const t = cartTotals();
  box.innerHTML = `
  <div class="cart-layout">
    <div class="cart-items">
      ${cart.map((i) => {
        const p = productById(i.id);
        return `<div class="citem">
          <a href="product.html?id=${p.id}">${productImage(p, "thumb")}</a>
          <div class="cinfo"><a href="product.html?id=${p.id}" class="pname">${p.name}</a><span class="muted">${money(p.price)} each</span></div>
          <div class="qty"><button onclick="setQty(${p.id},${i.qty - 1});cartPage()">−</button><input value="${i.qty}" readonly><button onclick="setQty(${p.id},${i.qty + 1});cartPage()">+</button></div>
          <b class="ctotal">${money(p.price * i.qty)}</b>
          <button class="remove" onclick="setQty(${p.id},0);cartPage()" aria-label="Remove">✕</button>
        </div>`;
      }).join("")}
    </div>
    <aside class="summary">
      <h3>Order Summary</h3>
      <div class="row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      <div class="row"><span>Delivery</span><span>${t.delivery ? money(t.delivery) : "Free"}</span></div>
      ${t.delivery ? `<small class="muted">Add ${money(STORE.freeDeliveryOver - t.subtotal)} more for free delivery</small>` : ""}
      <div class="row total"><span>Total</span><span>${money(t.total)}</span></div>
      <h3>Delivery Details</h3>
      <form id="checkout">
        <input name="name" required placeholder="Full name">
        <input name="phone" required placeholder="Phone number" inputmode="tel">
        <input name="city" required placeholder="City">
        <textarea name="address" required placeholder="Full address" rows="2"></textarea>
        <label class="radio"><input type="radio" name="pay" value="Cash on Delivery" checked> Cash on Delivery</label>
        <label class="radio"><input type="radio" name="pay" value="Bank Transfer"> Bank Transfer / JazzCash / Easypaisa</label>
        <button class="btn full">Place order via WhatsApp</button>
      </form>
    </aside>
  </div>`;
  $("#checkout").onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const lines = cart.map((i) => `• ${productById(i.id).name} x${i.qty} = ${money(productById(i.id).price * i.qty)}`).join("\n");
    const msg = `New order — ${STORE.name}\n\n${lines}\n\nSubtotal: ${money(t.subtotal)}\nDelivery: ${t.delivery ? money(t.delivery) : "Free"}\nTotal: ${money(t.total)}\n\nName: ${f.name}\nPhone: ${f.phone}\nCity: ${f.city}\nAddress: ${f.address}\nPayment: ${f.pay}`;
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    cart = []; save("cart", cart); updateBadges();
    box.innerHTML = `<div class="empty"><h2>✅ Thank you, ${f.name}!</h2><p>Your order has been sent. We will call you on ${f.phone} to confirm.</p><a class="btn" href="index.html">Continue shopping</a></div>`;
  };
}

// ---------- boot ----------
renderHeader();
renderFooter();
const page = document.body.dataset.page;
({ home: homePage, shop: shopPage, product: productPage, cart: cartPage })[page]?.();
