# 🍔 Fresh Bites — Restaurant · Grocery · WhatsApp QR Ordering

A premium food-delivery & grocery web app built for the **WhatsApp QR code ordering system** job:
customers scan a QR code printed on any table or shelf, browse a fully branded menu (restaurant
dishes + groceries in one cart), and their order lands on the restaurant's **WhatsApp** —
neatly formatted, itemized, and ready to confirm. No app install, no sign-up.

## ✨ What's inside

**Customer experience**
- Dark, premium storefront with cinematic food photography and a live "orders happening now" ticker
- Restaurant menu **and** grocery market in a single cart (mix a pizza and some avocados)
- Search, category filters, favorites, item detail modals with quick-order
- Cart drawer with free-delivery progress, live totals
- Checkout: contact, address, delivery time, payment (Cash / Card / USDT) and a
  **slide-to-order** gesture (Enter key works too, for accessibility)
- **Live order tracking** — 5-stage timeline (placed → confirmed → preparing → out for
  delivery → delivered) with an animated rider, ETA, driver card and re-send actions
- Everything persisted locally (cart, favorites, orders, store settings)

**Owner experience (the QR system)**
- `For owners` tab: set store name, logo, WhatsApp number, city, delivery fee, currency,
  brand accent color — the storefront rebrands **live**
- Generates a **QR code** that encodes your branded storefront link:
  - download as PNG, copy the link, or print ready-made **table tents** (print stylesheet included)
  - previewed at three real-world sizes: table tent, shelf tag, A-frame
- **Menu manager**: add/remove your own items (restaurant or grocery) for your store —
  they appear in your scanned storefront instantly
- When a customer scans, the app reads the URL params and brands itself for your store,
  and every order is sent to **your** WhatsApp number via a pre-formatted `wa.me` message

## 🧱 Tech

- React 18 + TypeScript + Vite
- Zero UI frameworks — hand-built design system (Sora + Inter, CSS custom properties,
  the whole app is one ~2,000-line stylesheet with full responsive + print +
  reduced-motion support)
- `qrcode` for client-side QR generation (canvas, downloadable PNG)

## 🚀 Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## 📝 WhatsApp order message format

```
🍽️ NEW ORDER — Fresh Bites
#FB-4821 · Sep 11, 10:42

— Your order —
• 2× Double Smash Burger — $25.80
• 1× Fresh Strawberries (500 g) — $5.20

Subtotal .............. $31.00
Delivery .............. FREE
Total ................. $31.00

👤 Amina T.
📞 +1 555 010 2030
📍 42 Maple Ave, Downtown
🕒 ASAP · ~25 min
💵 Cash on delivery
```

## 🗺 Try the demo flow

1. Add a couple of dishes + groceries to the cart → **Checkout**
2. Fill in details, pick payment, **slide to place your order**
3. Watch the order come alive in **Track order** (statuses advance in real time)
4. Visit **For owners**, change the name to "Mama Rosa's Pizzeria", set a WhatsApp
   number, and scan/download the QR — the whole app rebrands, and the QR link carries
   your brand + WhatsApp destination
