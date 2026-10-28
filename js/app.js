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
let cart = load("cart", []).filter((i) => productById(i.id)); // [{id, qty, v}] — v = size/variant index
let wishlist = load("wishlist", []); // [id]

// A product may have sizes: variants: [{ label: "500g", price: 1600, old: 0 }, ...]
const variantOf = (p, v = 0) => (p.variants ? p.variants[v] || p.variants[0] : { label: "", price: p.price, old: p.old });
const itemLabel = (i) => { const p = productById(i.id), l = variantOf(p, i.v).label; return l ? `${p.name} (${l})` : p.name; };

function addToCart(id, qty = 1, v = 0) {
  const item = cart.find((i) => i.id === id && (i.v || 0) === v);
  item ? (item.qty += qty) : cart.push({ id, qty, v });
  save("cart", cart);
  updateBadges();
  toast(`Added to cart — ${itemLabel({ id, v })}`);
}
function setQty(id, qty, v = 0) {
  const same = (i) => i.id === id && (i.v || 0) === v;
  cart = qty > 0 ? cart.map((i) => (same(i) ? { ...i, qty } : i)) : cart.filter((i) => !same(i));
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
  const subtotal = cart.reduce((s, i) => s + variantOf(productById(i.id), i.v).price * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= STORE.freeDeliveryOver ? 0 : STORE.deliveryFee;
  return { subtotal, delivery, total: subtotal + delivery, count: cart.reduce((s, i) => s + i.qty, 0) };
}
function updateBadges() {
  const c = $("#cartCount"), w = $("#wishCount"), t = $("#cartTotal");
  if (c) c.textContent = cartTotals().count;
  if ($("#cartCount2")) $("#cartCount2").textContent = cartTotals().count;
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
  if (!r) return "";
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
      <div class="price">${p.variants ? `<small class="from">${p.variants.map((v) => v.label).join(" · ")}</small>` : ""}${money(p.price)} ${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
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
      <button class="burger" onclick="toggleDrawer(true)" aria-label="Open menu">${icon("menu", 24)}</button>
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
      <a href="contact.html">Contact</a>
    </div>
  </nav>`;

  // mobile: slide-in drawer + bottom tab bar
  document.body.insertAdjacentHTML("beforeend", `
  <div class="drawer-bg" onclick="toggleDrawer(false)"></div>
  <aside class="drawer" aria-label="Menu">
    <div class="drawer-head">
      <a href="index.html" class="logo">${LOGO_SVG}<span>Asaan <em>Digital</em> Bazaar</span></a>
      <button onclick="toggleDrawer(false)" aria-label="Close menu">${icon("x", 22)}</button>
    </div>
    <nav>
      <a href="index.html">${icon("home", 20)} Home</a>
      <a href="shop.html">${icon("bag", 20)} All Products</a>
      <a href="shop.html?sale=1">${icon("gems", 20)} Discounted</a>
      <a href="shop.html?sort=new">${icon("badge", 20)} New Arrivals</a>
      <a href="shop.html?wish=1">${icon("heart", 20)} My Wishlist</a>
      <h4>Categories</h4>
      ${CATEGORIES.map((c) => `<a href="shop.html?cat=${c.id}">${icon(c.id, 20)} ${c.name}</a>`).join("")}
    </nav>
    <div class="drawer-foot">
      <a href="tel:${STORE.phone.replace(/\s/g, "")}">${icon("phone", 18)} ${STORE.phone}</a>
      <a href="mailto:${STORE.email}">${icon("mail", 18)} ${STORE.email}</a>
    </div>
  </aside>
  <nav class="tabbar" aria-label="Quick links">
    <a href="index.html" class="${here === "index.html" ? "on" : ""}">${icon("home", 22)}<span>Home</span></a>
    <button onclick="toggleDrawer(true)">${icon("menu", 22)}<span>Categories</span></button>
    <a href="cart.html" class="${here === "cart.html" ? "on" : ""}"><i>${icon("bag", 22)}<b id="cartCount2">0</b></i><span>Cart</span></a>
    <a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener" class="wa">${WHATSAPP_SVG.replace(/28/g, "22").replace('fill="#fff"', 'fill="currentColor"')}<span>WhatsApp</span></a>
  </nav>`);
  updateBadges();
}

function toggleDrawer(open) {
  document.body.classList.toggle("drawer-open", open);
}

function renderFooter() {
  $("#footer").innerHTML = `
  <section class="trust wrap">
    <div>${icon("truck", 28)}<span><b>Fast Delivery</b><small>All across Pakistan</small></span></div>
    <div>${icon("shield", 28)}<span><b>Safe Payment</b><small>COD & bank transfer</small></span></div>
    <div>${icon("return", 28)}<span><b>7 Days Return</b><small>Hassle-free returns</small></span></div>
    <div>${icon("badge", 28)}<span><b>100% Authentic</b><small>Quality checked</small></span></div>
  </section>
  <section class="info-cards wrap">
    <a href="about.html">${icon("building", 40)}<b>About us</b><small>Know more about our company</small></a>
    <a href="contact.html">${icon("headset", 40)}<b>Contact Us</b><small>We are here to help</small></a>
    <a href="faq.html">${icon("help", 40)}<b>FAQ</b><small>Get all answers</small></a>
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
        <a href="about.html">About Us</a>
        <a href="faq.html">FAQ</a>
      </div>
      <div>
        <h4>Contact Us</h4>
        <a href="tel:${STORE.phone.replace(/\s/g, "")}">${icon("phone", 16)} ${STORE.phone}</a>
        <a href="mailto:${STORE.email}">${icon("mail", 16)} ${STORE.email}</a>
        ${STORE.address ? `<span class="addr">${icon("pin", 16)} ${STORE.address}</span>` : ""}
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
  $("#flashGrid").innerHTML = PRODUCTS.filter((p) => p.old).sort((a, b) => b.old - b.price - (a.old - a.price)).slice(0, 4).map(productCard).join("");

  const sellers = {};
  PRODUCTS.forEach((p) => (sellers[p.seller] ??= []).push(p));
  $("#sellers").innerHTML = Object.entries(sellers).sort((a, b) => b[1].length - a[1].length).slice(0, 6).map(([name, items]) => `
    <a class="seller" href="shop.html?q=${encodeURIComponent(name)}">
      <span class="avatar">${name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
      <b>${name}</b>
      <small>${stars(items.reduce((s, p) => s + p.rating, 0) / items.length)} · ${items.length} products</small>
    </a>`).join("");

  if (REVIEWS.length) {
    $("#reviews").innerHTML = REVIEWS.map((r) => `
      <figure class="review">
        <div class="stars">${icon("star", 16).repeat(r.rating)}</div>
        <blockquote>“${r.text}”</blockquote>
        <figcaption><span class="avatar sm">${r.name[0]}</span><span><b>${r.name}</b><small>${r.city}</small></span></figcaption>
      </figure>`).join("");
  } else {
    $("#reviews").closest(".sec").remove();
  }

  $("#insta").innerHTML = PRODUCTS.slice(0, 8).map((p) => `<a href="product.html?id=${p.id}" aria-label="${p.name}">${productImage(p)}<span>${icon("bag", 22)}</span></a>`).join("");

  initSlider();
  initCountdown();
}

function initSlider() {
  const slides = [...document.querySelectorAll("#slider .slide")];
  let i = 0, timer;
  $("#dots").innerHTML = slides.map((_, n) => `<button aria-label="Slide ${n + 1}" data-go="${n}"></button>`).join("");
  const dots = [...document.querySelectorAll("#dots button")];
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === i));
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
    clearInterval(timer);
    timer = setInterval(() => go(i + 1), 5500);
  };
  dots.forEach((d) => (d.onclick = () => go(+d.dataset.go)));
  document.querySelectorAll("[data-sl]").forEach((b) => {
    b.innerHTML = icon("chevron", 22);
    b.onclick = () => go(i + +b.dataset.sl);
  });
  let x0 = null;
  $("#slider").addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  $("#slider").addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  go(0);
}

function initCountdown() {
  const box = $("#countdown");
  const end = new Date(STORE.saleEnds).getTime();
  const tick = () => {
    const left = end - Date.now();
    if (!(left > 0)) { box.remove(); return false; }
    const parts = [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
    box.innerHTML = `<span class="ends">Ends in</span>` + parts.map((v, k) => `<span class="cd"><b>${String(v).padStart(2, "0")}</b><small>${["Days", "Hrs", "Min", "Sec"][k]}</small></span>`).join("");
    return true;
  };
  if (tick()) setInterval(tick, 1000);
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
        (!q || (p.name + p.desc + p.seller + catById(p.cat).name).toLowerCase().includes(q)) &&
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
  <div class="pd">
    <div class="pd-img">${off ? `<span class="badge-off">-${off}%</span>` : ""}${productImage(p, "big")}</div>
    <div class="pd-info">
      <span class="pcat">${catById(p.cat).name}</span>
      <h1>${p.name}</h1>
      <div class="meta">${stars(p.rating)}<span class="muted">Sold by <b>${p.seller}</b></span><span class="stock">● In stock</span></div>
      <div class="price big" id="pdPrice"></div>
      ${p.variants ? `<div class="sizes"><span>${p.variantLabel || "Size"}</span>${p.variants.map((v, k) => `<button class="size ${k ? "" : "on"}" data-v="${k}" onclick="pickSize(${p.id}, ${k})">${v.label}</button>`).join("")}</div>` : ""}
      <p class="desc">${p.desc}</p>
      <div class="total-line">Total Price: <b id="pdTotal"></b></div>
      <div class="qty-row">
        <div class="qty"><button onclick="q.value=Math.max(1,q.value-1);updateTotal()" aria-label="Less">${icon("minus", 16)}</button><input id="q" type="number" min="1" value="1" aria-label="Quantity" oninput="updateTotal()"><button onclick="q.value=+q.value+1;updateTotal()" aria-label="More">${icon("plus", 16)}</button></div>
        <button class="btn grow" onclick="addToCart(${p.id}, Math.max(1, +$('#q').value), pickedSize)">${icon("cart", 18)} Add to cart</button>
        <button class="btn btn-gold grow" onclick="addToCart(${p.id}, Math.max(1, +$('#q').value), pickedSize); location.href='cart.html'">Buy now</button>
      </div>
      <div class="pd-actions">
        <button class="link wish-link ${wishlist.includes(p.id) ? "on" : ""}" data-wish="${p.id}" onclick="toggleWish(${p.id})">${icon("heart", 18)} Add to wishlist</button>
        <a class="link" href="https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum, I want to ask about: " + p.name)}" target="_blank" rel="noopener">${icon("phone", 18)} Ask on WhatsApp</a>
      </div>
      ${shareBar(p)}
    </div>
    <aside class="pd-side">
      <ul class="perks">
        <li>${icon("truck", 20)}<span><b>Fast delivery</b>3–5 days, all over Pakistan</span></li>
        <li>${icon("cash", 20)}<span><b>Cash on Delivery</b>Pay when you receive</span></li>
        <li>${icon("return", 20)}<span><b>7 days return</b>If item is not as described</span></li>
        <li>${icon("badge", 20)}<span><b>100% authentic</b>Quality checked</span></li>
      </ul>
      <div class="seller-box">
        <span class="avatar">${p.seller.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
        <b>${p.seller}</b>
        <small>${((n) => `${n} product${n === 1 ? "" : "s"}`)(PRODUCTS.filter((x) => x.seller === p.seller).length)}</small>
        <a class="btn full" href="https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum, I want to ask about: " + p.name)}" target="_blank" rel="noopener">${WHATSAPP_SVG.replace(/28/g, "18")} Chat with us</a>
      </div>
    </aside>
  </div>
  <div class="sec-head"><h2 class="sec-title">You may also like</h2></div>
  <div class="grid">${related.map(productCard).join("")}</div>`;
  pickSize(p.id, 0);
}

let pickedSize = 0, pickedPrice = 0;
function pickSize(id, v) {
  pickedSize = v;
  const { price, old } = variantOf(productById(id), v);
  pickedPrice = price;
  $("#pdPrice").innerHTML = `${money(price)} ${old ? `<s>${money(old)}</s> <span class="save">Save ${money(old - price)}</span>` : ""}`;
  document.querySelectorAll(".size").forEach((b) => b.classList.toggle("on", +b.dataset.v === v));
  updateTotal();
}
function updateTotal() {
  const qty = Math.max(1, Math.floor(+$("#q").value) || 1);
  $("#pdTotal").textContent = money(pickedPrice * qty);
}

// Share links open each app's own share screen — no third-party share widget or tracking
function shareBar(p) {
  const url = location.href.split("#")[0];
  const text = `${p.name} — ${money(p.price)} | ${STORE.name}`;
  const u = encodeURIComponent(url), t = encodeURIComponent(text);
  const img = encodeURIComponent(new URL(p.image || `images/${p.id}.jpg`, location.href).href);
  const links = [
    ["whatsapp", "WhatsApp", `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, WHATSAPP_SVG.replace(/28/g, "18")],
    ["facebook", "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`, brand("facebook")],
    ["x", "X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`, brand("x", 16)],
    ["telegram", "Telegram", `https://t.me/share/url?url=${u}&text=${t}`, brand("telegram")],
    ["pinterest", "Pinterest", `https://pinterest.com/pin/create/button/?url=${u}&media=${img}&description=${t}`, brand("pinterest")],
    ["email", "Email", `mailto:?subject=${t}&body=${encodeURIComponent(text + "\n" + url)}`, icon("mail", 18)],
  ];
  return `
  <div class="share">
    <span class="share-label">${icon("share", 18)} Share</span>
    ${links.map(([k, label, href, svg]) => `<a class="sh sh-${k}" href="${href}" target="_blank" rel="noopener" title="Share on ${label}" aria-label="Share on ${label}"${k === "email" ? "" : ` onclick="return sharePopup(this.href)"`}>${svg}</a>`).join("")}
    <button class="sh sh-copy" onclick="copyLink(this)" title="Copy link" aria-label="Copy link">${icon("link", 18)}</button>
    ${navigator.share ? `<button class="sh sh-more" onclick="navigator.share({title:document.title,text:${JSON.stringify(text).replace(/"/g, "&quot;")},url:location.href}).catch(()=>{})" title="More apps" aria-label="More share options">${icon("share", 18)}</button>` : ""}
  </div>`;
}

// On desktop open the share screen in a small centred window; phones keep the normal new tab / app
function sharePopup(href) {
  if (innerWidth < 768) return true;
  const w = 620, h = 560;
  const win = open(href, "share", `width=${w},height=${h},left=${screenX + (outerWidth - w) / 2},top=${screenY + (outerHeight - h) / 2}`);
  if (!win) return true;
  win.focus();
  return false;
}

function copyLink(btn) {
  const done = () => { toast("Link copied!"); btn.classList.add("ok"); setTimeout(() => btn.classList.remove("ok"), 1500); };
  navigator.clipboard?.writeText(location.href).then(done, () => prompt("Copy this link:", location.href)) ?? prompt("Copy this link:", location.href);
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
        const p = productById(i.id), v = i.v || 0, { price } = variantOf(p, v);
        return `<div class="citem">
          <a href="product.html?id=${p.id}">${productImage(p, "thumb")}</a>
          <div class="cinfo"><a href="product.html?id=${p.id}" class="pname">${itemLabel(i)}</a><span class="muted">${money(price)} each</span></div>
          <div class="qty"><button onclick="setQty(${p.id},${i.qty - 1},${v});cartPage()" aria-label="Less">${icon("minus", 16)}</button><input value="${i.qty}" readonly aria-label="Quantity"><button onclick="setQty(${p.id},${i.qty + 1},${v});cartPage()" aria-label="More">${icon("plus", 16)}</button></div>
          <b class="ctotal">${money(price * i.qty)}</b>
          <button class="remove" onclick="setQty(${p.id},0,${v});cartPage()" aria-label="Remove">${icon("x", 18)}</button>
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
    const lines = cart.map((i) => `• ${itemLabel(i)} x${i.qty} = ${money(variantOf(productById(i.id), i.v).price * i.qty)}`).join("\n");
    const msg = `New order — ${STORE.name}\n\n${lines}\n\nSubtotal: ${money(t.subtotal)}\nDelivery: ${t.delivery ? money(t.delivery) : "Free"}\nTotal: ${money(t.total)}\n\nName: ${f.name}\nPhone: ${f.phone}\nCity: ${f.city}\nAddress: ${f.address}\nPayment: ${f.pay}`;
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    cart = []; save("cart", cart); updateBadges();
    box.innerHTML = `<div class="empty">${icon("badge", 56, "ok")}<h2>Thank you, ${f.name}!</h2><p class="muted">Your order has been sent. We will call you on ${f.phone} to confirm.</p><a class="btn" href="index.html">Continue shopping</a></div>`;
  };
}

function contactPage() {
  $("#contactGrid").innerHTML = `
    <a href="https://wa.me/${STORE.whatsapp}" target="_blank" rel="noopener">${icon("phone", 24)}<span><b>WhatsApp</b><small>${STORE.phone}</small></span></a>
    <a href="tel:${STORE.phone.replace(/\s/g, "")}">${icon("headset", 24)}<span><b>Call us</b><small>${STORE.phone}</small></span></a>
    <a href="mailto:${STORE.email}">${icon("mail", 24)}<span><b>Email</b><small>${STORE.email}</small></span></a>
    ${STORE.address ? `<div>${icon("pin", 24)}<span><b>Address</b><small>${STORE.address}</small></span></div>` : ""}`;
  $("#contactForm").onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum, I am ${f.name} (${f.phone}).\n\n${f.msg}`)}`, "_blank");
    e.target.reset();
    toast("Opening WhatsApp…");
  };
}

// ---------- boot ----------
renderHeader();
renderFooter();
function pinHeader() {
  const h = $("#header"), topbar = $(".topbar");
  h.style.top = `-${topbar.offsetHeight}px`;
  document.documentElement.style.setProperty("--header-h", `${h.offsetHeight - topbar.offsetHeight}px`);
}
pinHeader();
addEventListener("resize", pinHeader);
addEventListener("scroll", () => $("#header").classList.toggle("scrolled", scrollY > 40), { passive: true });
document.querySelectorAll("[data-ic]").forEach((el) => (el.outerHTML = icon(el.dataset.ic, 26)));
document.querySelectorAll("[data-arrow]").forEach((el) => (el.outerHTML = icon("arrow", 16)));
document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon, 160, "bg")));
const page = document.body.dataset.page;
({ home: homePage, shop: shopPage, product: productPage, cart: cartPage, contact: contactPage })[page]?.();
