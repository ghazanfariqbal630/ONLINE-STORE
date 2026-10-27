// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const money = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;
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
  toast(`Added to cart — ${productById(id).name}`);
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
  const c = $("#cartCount"), w = $("#wishCount"), t = $("#cartTotal");
  if (c) c.textContent = cartTotals().count;
  if (w) w.textContent = wishlist.length;
  if (t) t.textContent = money(cartTotals().subtotal);
}

function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.innerHTML = `${icon("badge", 18)}<span>${msg}</span>`;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2400);
}

// ---------- shared UI ----------
// Photo comes from p.image, or else images/<id>.jpg; if that file is missing a clean placeholder is shown
function productImage(p, cls = "") {
  const ph = `<div class="pimg ph ${cls}">${icon(p.cat, 64)}</div>`;
  const src = p.image || `images/${p.id}.jpg`;
  return `<img class="pimg ${cls}" src="${src}" alt="${p.name}" loading="lazy" onerror="this.outerHTML=this.dataset.fallback" data-fallback='${ph.replace(/'/g, "&#39;")}'>`;
}

function stars(r) {
  return `<span class="stars">${icon("star", 14)}<b>${r.toFixed(1)}</b></span>`;
}

function productCard(p) {
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  return `
  <article class="card">
    <div class="card-media">
      ${off ? `<span class="badge-off">-${off}%</span>` : ""}
      <button class="wish ${wishlist.includes(p.id) ? "on" : ""}" data-wish="${p.id}" onclick="toggleWish(${p.id})" aria-label="Add to wishlist">${icon("heart", 18)}</button>
      <a href="product.html?id=${p.id}">${productImage(p)}</a>
      <button class="quick-add" onclick="addToCart(${p.id})">${icon("cart", 16)} Add to cart</button>
    </div>
    <div class="card-body">
      <span class="pcat">${catById(p.cat).name}</span>
      <a href="product.html?id=${p.id}" class="pname">${p.name}</a>
      ${stars(p.rating)}
      <div class="price">${money(p.price)} ${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
    </div>
  </article>`;
}

function renderHeader() {
  const cats = CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}">${icon(c.id, 18)} ${c.name}</a>`).join("");
  const here = location.pathname.split("/").pop() || "index.html";
  const nav = (href, label) => `<a href="${href}" class="${here === href.split("?")[0] && !params.toString() === !href.includes("?") ? "active" : ""}">${label}</a>`;
  $("#header").innerHTML = `
  <div class="topbar">
    <div class="wrap">
      <span>${icon("truck", 15)} Free delivery on orders over ${money(STORE.freeDeliveryOver)}</span>
      <span class="hide-sm">${icon("cash", 15)} Cash on Delivery across Pakistan</span>
      <a href="tel:${STORE.phone.replace(/\s/g, "")}">${icon("phone", 14)} ${STORE.phone}</a>
    </div>
  </div>
  <div class="mainbar">
    <div class="wrap">
      <a href="index.html" class="logo">${LOGO_SVG}<span>Asaan <em>Digital</em> Bazaar</span></a>
      <form class="search" action="shop.html">
        <input name="q" placeholder="Search products, brands and categories" value="${params.get("q") || ""}" aria-label="Search">
        <button aria-label="Search">${icon("search", 20)}</button>
      </form>
      <nav class="icons">
        <a href="shop.html?wish=1" class="icon-btn" title="Wishlist">${icon("heart", 22)}<b id="wishCount">0</b></a>
        <a href="cart.html" class="cart-btn" title="Cart">
          <span class="icon-btn">${icon("bag", 22)}<b id="cartCount">0</b></span>
          <span class="cart-label hide-sm"><small>My cart</small><strong id="cartTotal">Rs. 0</strong></span>
        </a>
      </nav>
    </div>
  </div>
  <nav class="catbar">
    <div class="wrap">
      <div class="dropdown">
        <button class="cat-btn">${icon("menu", 18)} All Categories</button>
        <div class="menu">${cats}</div>
      </div>
      ${nav("index.html", "Home")}
      ${nav("shop.html", "Shop")}
      <a href="shop.html?sale=1">Discounted</a>
      <a href="shop.html?sort=new">New Arrivals</a>
      <a href="shop.html?sort=rating">Top Rated</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>`;
  updateBadges();
}

function renderFooter() {
  $("#footer").innerHTML = `
  <section class="trust wrap">
    <div>${icon("truck", 28)}<span><b>Fast Delivery</b><small>All across Pakistan</small></span></div>
    <div>${icon("shield", 28)}<span><b>Safe Payment</b><small>COD & bank transfer</small></span></div>
    <div>${icon("return", 28)}<span><b>7 Days Return</b><small>Hassle-free returns</small></span></div>
    <div>${icon("badge", 28)}<span><b>100% Authentic</b><small>Quality checked</small></span></div>
  </section>
  <footer class="footer" id="contact">
    <div class="wrap cols">
      <div>
        <a href="index.html" class="logo light">${LOGO_SVG}<span>Asaan <em>Digital</em> Bazaar</span></a>
        <p>Pakistan's easy online bazaar — handicrafts, jewelry, fashion and organic products delivered to your door with Cash on Delivery.</p>
      </div>
      <div>
        <h4>Shop</h4>
        <a href="shop.html?sort=new">New Arrivals</a>
        <a href="shop.html?sale=1">Discounted Products</a>
        <a href="shop.html?sort=rating">Top Rated</a>
        <a href="cart.html">My Cart</a>
      </div>
      <div>
        <h4>Contact Us</h4>
        <a href="tel:${STORE.phone.replace(/\s/g, "")}">${icon("phone", 16)} ${STORE.phone}</a>
        <a href="mailto:${STORE.email}">${icon("mail", 16)} ${STORE.email}</a>
        <span class="addr">${icon("pin", 16)} ${STORE.address}</span>
      </div>
      <div>
        <h4>Newsletter</h4>
        <p>Get new arrivals and exclusive offers first.</p>
        <form class="newsletter" onsubmit="event.preventDefault(); this.reset(); toast('Thanks for subscribing!')">
          <input type="email" required placeholder="Your email address" aria-label="Email"><button aria-label="Subscribe">${icon("arrow", 18)}</button>
        </form>
      </div>
    </div>
    <div class="copy wrap">
      <span>© ${new Date().getFullYear()} ${STORE.name}. All rights reserved.</span>
      <span class="pay">Cash on Delivery · Bank Transfer · JazzCash · Easypaisa</span>
    </div>
  </footer>
  <a class="wa-float" href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${WHATSAPP_SVG}</a>`;
}

// ---------- pages ----------
function homePage() {
  $("#catGrid").innerHTML = CATEGORIES.map((c) => {
    const n = PRODUCTS.filter((p) => p.cat === c.id).length;
    return `<a class="cat" href="shop.html?cat=${c.id}"><span class="cat-ic">${icon(c.id, 28)}</span><b>${c.name}</b><small>${n} product${n === 1 ? "" : "s"}</small></a>`;
  }).join("");
  const section = (tag, el) => ($(el).innerHTML = PRODUCTS.filter((p) => p.tags.includes(tag)).slice(0, 8).map(productCard).join(""));
  section("featured", "#featured");
  section("new", "#newArrivals");
  section("best", "#bestSelling");
  section("top", "#topRated");
}

function shopPage() {
  const cat = params.get("cat");
  const q = (params.get("q") || "").toLowerCase();
  $("#filters").innerHTML =
    `<a href="shop.html" class="${!cat ? "active" : ""}">${icon("menu", 18)} All Products</a>` +
    CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}" class="${cat === c.id ? "active" : ""}">${icon(c.id, 18)} ${c.name}</a>`).join("");

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
    $("#crumb").textContent = title;
    $("#count").textContent = `${list.length} product${list.length === 1 ? "" : "s"} found`;
    $("#shopGrid").innerHTML = list.length ? list.map(productCard).join("") : `<div class="empty">${icon("search", 40)}<p>No products found.</p><a class="btn" href="shop.html">View all products</a></div>`;
  }
  sortSel.onchange = draw;
  draw();
}

function productPage() {
  const p = productById(params.get("id"));
  const box = $("#product");
  if (!p) { box.innerHTML = `<div class="empty"><p>Product not found.</p><a class="btn" href="shop.html">Back to shop</a></div>`; return; }
  document.title = `${p.name} | ${STORE.name}`;
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const related = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id).concat(PRODUCTS.filter((x) => x.cat !== p.cat)).slice(0, 4);
  box.innerHTML = `
  <nav class="crumbs"><a href="index.html">Home</a>${icon("chevron", 14)}<a href="shop.html?cat=${p.cat}">${catById(p.cat).name}</a>${icon("chevron", 14)}<span>${p.name}</span></nav>
  <div class="pd">
    <div class="pd-img">${off ? `<span class="badge-off">-${off}%</span>` : ""}${productImage(p, "big")}</div>
    <div class="pd-info">
      <span class="pcat">${catById(p.cat).name}</span>
      <h1>${p.name}</h1>
      <div class="meta">${stars(p.rating)}<span class="muted">Sold by <b>${p.seller}</b></span><span class="stock">● In stock</span></div>
      <div class="price big">${money(p.price)} ${p.old ? `<s>${money(p.old)}</s> <span class="save">Save ${money(p.old - p.price)}</span>` : ""}</div>
      <p class="desc">${p.desc}</p>
      <div class="qty-row">
        <div class="qty"><button onclick="q.value=Math.max(1,q.value-1)" aria-label="Less">${icon("minus", 16)}</button><input id="q" type="number" min="1" value="1" aria-label="Quantity"><button onclick="q.value=+q.value+1" aria-label="More">${icon("plus", 16)}</button></div>
        <button class="btn grow" onclick="addToCart(${p.id}, Math.max(1, +$('#q').value))">${icon("cart", 18)} Add to cart</button>
        <button class="btn btn-gold grow" onclick="addToCart(${p.id}, Math.max(1, +$('#q').value)); location.href='cart.html'">Buy now</button>
      </div>
      <div class="pd-actions">
        <button class="link wish-link ${wishlist.includes(p.id) ? "on" : ""}" data-wish="${p.id}" onclick="toggleWish(${p.id})">${icon("heart", 18)} Add to wishlist</button>
        <a class="link" href="https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum, I want to ask about: " + p.name)}" target="_blank" rel="noopener">${icon("phone", 18)} Ask on WhatsApp</a>
      </div>
      <ul class="perks">
        <li>${icon("truck", 20)}<span><b>Delivery in 3–5 working days</b>All over Pakistan</span></li>
        <li>${icon("cash", 20)}<span><b>Cash on Delivery</b>Pay when you receive</span></li>
        <li>${icon("return", 20)}<span><b>7 days easy return</b>If item is not as described</span></li>
      </ul>
    </div>
  </div>
  <div class="sec-head"><h2 class="sec-title">You may also like</h2></div>
  <div class="grid">${related.map(productCard).join("")}</div>`;
}

function cartPage() {
  const box = $("#cart");
  if (!cart.length) {
    box.innerHTML = `<div class="empty">${icon("bag", 48)}<h2>Your cart is empty</h2><p class="muted">Looks like you haven't added anything yet.</p><a class="btn" href="shop.html">Start shopping</a></div>`;
    return;
  }
  const t = cartTotals();
  box.innerHTML = `
  <div class="cart-layout">
    <div class="cart-items">
      <div class="cart-head"><span>Product</span><span>Quantity</span><span>Total</span></div>
      ${cart.map((i) => {
        const p = productById(i.id);
        return `<div class="citem">
          <a href="product.html?id=${p.id}">${productImage(p, "thumb")}</a>
          <div class="cinfo"><a href="product.html?id=${p.id}" class="pname">${p.name}</a><span class="muted">${money(p.price)} each</span></div>
          <div class="qty"><button onclick="setQty(${p.id},${i.qty - 1});cartPage()" aria-label="Less">${icon("minus", 16)}</button><input value="${i.qty}" readonly aria-label="Quantity"><button onclick="setQty(${p.id},${i.qty + 1});cartPage()" aria-label="More">${icon("plus", 16)}</button></div>
          <b class="ctotal">${money(p.price * i.qty)}</b>
          <button class="remove" onclick="setQty(${p.id},0);cartPage()" aria-label="Remove">${icon("x", 18)}</button>
        </div>`;
      }).join("")}
    </div>
    <aside class="summary">
      <h3>Order Summary</h3>
      <div class="row"><span>Subtotal (${t.count} items)</span><span>${money(t.subtotal)}</span></div>
      <div class="row"><span>Delivery</span><span>${t.delivery ? money(t.delivery) : `<b class="free">Free</b>`}</span></div>
      ${t.delivery ? `<div class="note">Add <b>${money(STORE.freeDeliveryOver - t.subtotal)}</b> more for free delivery</div>` : ""}
      <div class="row total"><span>Total</span><span>${money(t.total)}</span></div>
      <h3>Delivery Details</h3>
      <form id="checkout">
        <input name="name" required placeholder="Full name" autocomplete="name">
        <input name="phone" required placeholder="Phone number (03xx xxxxxxx)" inputmode="tel" autocomplete="tel">
        <input name="city" required placeholder="City" autocomplete="address-level2">
        <textarea name="address" required placeholder="Complete address" rows="2" autocomplete="street-address"></textarea>
        <label class="radio"><input type="radio" name="pay" value="Cash on Delivery" checked><span><b>Cash on Delivery</b><small>Pay when you receive</small></span></label>
        <label class="radio"><input type="radio" name="pay" value="Bank Transfer / JazzCash / Easypaisa"><span><b>Bank Transfer / JazzCash / Easypaisa</b><small>We'll share account details</small></span></label>
        <button class="btn full">${WHATSAPP_SVG.replace(/28/g, "20")} Place order via WhatsApp</button>
        <small class="muted center">${icon("shield", 14)} Your details are only used to deliver your order</small>
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
    box.innerHTML = `<div class="empty">${icon("badge", 56, "ok")}<h2>Thank you, ${f.name}!</h2><p class="muted">Your order has been sent. We will call you on ${f.phone} to confirm.</p><a class="btn" href="index.html">Continue shopping</a></div>`;
  };
}

// ---------- boot ----------
renderHeader();
renderFooter();
document.querySelectorAll("[data-arrow]").forEach((el) => (el.outerHTML = icon("arrow", 16)));
document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon, 160, "bg")));
const page = document.body.dataset.page;
({ home: homePage, shop: shopPage, product: productPage, cart: cartPage })[page]?.();
