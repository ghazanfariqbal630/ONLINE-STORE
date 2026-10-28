// Store settings — change these to your own details
const STORE = {
  name: "Asaan Digital Bazaar",
  tagline: "Handmade treasures from the mountains",
  phone: "+92 306 6088303",
  whatsapp: "923066088303", // country code + number, no + or spaces
  email: "ghazanfariqbal630@gmail.com",
  address: "Your address, City, Pakistan",
  currency: "PKR",
  deliveryFee: 250,
  freeDeliveryOver: 5000,
  saleEnds: "2026-11-30T23:59:59+05:00", // flash sale timer end; timer hides after this date
};

const CATEGORIES = [
  { id: "home", name: "Home & Living", icon: "🏠", color: "#f3e3c3" },
  { id: "wedding", name: "Wedding & Party", icon: "💍", color: "#f6d5d5" },
  { id: "vintage", name: "Vintages", icon: "🏺", color: "#e6dccd" },
  { id: "jewelry", name: "Jewelry & Accessories", icon: "📿", color: "#d9e8f0" },
  { id: "fashion", name: "Clothing & Fashion", icon: "🧣", color: "#e4ddf2" },
  { id: "art", name: "Art & Collectables", icon: "🎨", color: "#f7e6c9" },
  { id: "organic", name: "Organic Products", icon: "🍯", color: "#dcebd3" },
  { id: "gems", name: "Gem Stones", icon: "💎", color: "#d4eae8" },
];

// PHOTOS: save the photo in the "images" folder named by product id — e.g. images/1.jpg for id 1.
// Or set image: "images/any-name.jpg". If no photo is found, the icon is shown instead.
const PRODUCTS = [
  { id: 17, name: "Premium Almonds (Badam) — Without Shell", cat: "organic", price: 1600, old: 0, icon: "🌰", image: "images/almonds.webp", rating: 0, seller: "Asaan Digital Bazaar", tags: ["featured", "new", "best"],
    variantLabel: "Weight", variants: [{ label: "500g", price: 1600 }, { label: "1 KG", price: 3200 }],
    desc: "Fresh, premium-quality almonds without shell — 100% natural, rich in nutrients, good for the heart and great for brain health. Packed fresh in a resealable pouch." },
  { id: 1, name: "Men's Aqeeq Ring, 925 Sterling Silver", cat: "jewelry", price: 12999, old: 15999, icon: "💍", image: "", rating: 4.8, seller: "Silver Craft House", tags: ["featured", "best"], desc: "Handcrafted 925 sterling silver ring set with natural red Aqeeq (agate). Polished finish, available in all sizes." },
  { id: 2, name: "Pure White Pashmina Shawl", cat: "fashion", price: 5200, old: 5600, icon: "🧣", image: "", rating: 4.9, seller: "Valley Weavers", tags: ["featured", "new"], desc: "Soft, warm hand-woven pashmina shawl in pure white. Lightweight and perfect for winter evenings and gifting." },
  { id: 3, name: "Pure Himalayan Shilajit (20g)", cat: "organic", price: 3000, old: 0, icon: "🫙", image: "", rating: 4.7, seller: "Mountain Organics", tags: ["best", "top"], desc: "Lab-tested, purified resin form shilajit sourced from high-altitude rocks. A natural mineral supplement." },
  { id: 4, name: "Brass Lion Showpiece", cat: "home", price: 12000, old: 13000, icon: "🐐", image: "", rating: 4.6, seller: "North Handicrafts", tags: ["featured"], desc: "Detailed solid brass lion sculpture with an antique finish. A striking piece for any shelf or office desk." },
  { id: 5, name: "Feroza (Turquoise) Bracelet", cat: "jewelry", price: 1500, old: 1700, icon: "📿", image: "", rating: 4.5, seller: "Silver Craft House", tags: ["new", "best"], desc: "Natural feroza beads strung on a strong elastic cord. Fits most wrists comfortably." },
  { id: 6, name: "Raw Mountain Honeycomb 500g", cat: "organic", price: 1100, old: 0, icon: "🫐", image: "", rating: 4.8, seller: "Mountain Organics", tags: ["top", "new"], desc: "Pure raw honeycomb straight from mountain bee farms. Unprocessed, unfiltered and naturally sweet." },
  { id: 7, name: "Apricot Jam, Homemade 400g", cat: "organic", price: 800, old: 1000, icon: "🍑", image: "", rating: 4.7, seller: "Mountain Organics", tags: ["best"], desc: "Made in small batches from fresh mountain apricots. Great with paratha, toast or as a dessert topping." },
  { id: 8, name: "Hand-Knotted Wool Rug (3x5 ft)", cat: "home", price: 18500, old: 21000, icon: "🧶", image: "", rating: 4.9, seller: "Valley Weavers", tags: ["featured", "top"], desc: "Traditional geometric patterns, hand-knotted from local sheep wool with natural dyes." },
  { id: 9, name: "Hand-Knitted Woollen Cap", cat: "fashion", price: 1800, old: 0, icon: "🧢", image: "", rating: 4.4, seller: "Crochet Gallery", tags: ["new"], desc: "Soft hand-knitted woollen cap for cold winters. Warm, stretchy and one-size-fits-most." },
  { id: 10, name: "Vintage Copper Water Pot", cat: "vintage", price: 9500, old: 0, icon: "🏺", image: "", rating: 4.6, seller: "Old Bazar Finds", tags: ["featured"], desc: "Authentic hand-hammered copper pot, decades old, with tin lining. Each piece is one of a kind." },
  { id: 11, name: "Mountain Landscape Oil Painting", cat: "art", price: 15000, old: 17500, icon: "🖼️", image: "", rating: 5.0, seller: "Peak Art Studio", tags: ["top"], desc: "Original oil on canvas (18x24 in) of snow peaks at sunset, signed by the artist. Frame included." },
  { id: 12, name: "Natural Ruby — Rough Stone", cat: "gems", price: 7500, old: 8200, icon: "💎", image: "", rating: 4.5, seller: "Gem Valley", tags: ["new", "top"], desc: "Untreated natural ruby specimen in host rock. Comes with a small display box." },
  { id: 13, name: "Bridal Embroidered Dupatta", cat: "wedding", price: 8900, old: 9900, icon: "👰", image: "", rating: 4.8, seller: "Valley Weavers", tags: ["featured", "best"], desc: "Hand-embroidered dupatta with intricate traditional floral motifs. A perfect wedding gift." },
  { id: 14, name: "Walnut Wood Jewelry Box", cat: "home", price: 3200, old: 0, icon: "📦", image: "", rating: 4.6, seller: "North Handicrafts", tags: ["new"], desc: "Hand-carved walnut wood box with velvet lining and brass hinges." },
  { id: 15, name: "Pure Apricot Kernel Oil 100ml", cat: "organic", price: 950, old: 1200, icon: "🧴", image: "", rating: 4.7, seller: "Mountain Organics", tags: ["best", "new"], desc: "Cold-pressed oil from apricot kernels. Used for skin, hair and massage." },
  { id: 16, name: "Emerald Silver Pendant", cat: "gems", price: 11500, old: 13000, icon: "🟢", image: "", rating: 4.9, seller: "Gem Valley", tags: ["featured", "top"], desc: "Natural emerald set in a 925 silver pendant, with a matching silver chain." },
];

// Real customer reviews only — the "What our customers say" section stays hidden while this list is empty.
// Example: { name: "Ayesha K.", city: "Lahore", rating: 5, text: "Shawl bohat soft hai, delivery 3 din mein aa gayi." },
const REVIEWS = [];
