import type { Category, Item, StoreConfig } from './types'

export const DEFAULT_STORE: StoreConfig = {
  slug: 'fresh-bites',
  name: 'Fresh Bites',
  tagline: 'Kitchen + market, delivered',
  whatsapp: '15551234567',
  city: 'Downtown',
  fee: 2.99,
  freeAt: 30,
  currency: '$',
  emoji: '🍔',
  accent: '#ff6a2b',
}

export const CATEGORIES: Category[] = [
  { id: 'burgers', label: 'Burgers', emoji: '🍔', kind: 'menu' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕', kind: 'menu' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣', kind: 'menu' },
  { id: 'bowls', label: 'Bowls & Salads', emoji: '🥗', kind: 'menu' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰', kind: 'menu' },
  { id: 'drinks', label: 'Drinks', emoji: '🧋', kind: 'menu' },
  { id: 'produce', label: 'Produce', emoji: '🥑', kind: 'grocery' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞', kind: 'grocery' },
  { id: 'dairy', label: 'Dairy & Eggs', emoji: '🥚', kind: 'grocery' },
  { id: 'butcher', label: 'Butcher', emoji: '🥩', kind: 'grocery' },
  { id: 'pantry', label: 'Pantry', emoji: '🫒', kind: 'grocery' },
  { id: 'snacks', label: 'Snacks & Drinks', emoji: '🍪', kind: 'grocery' },
]

export const CATALOG: Item[] = [
  // ─── Restaurant ────────────────────────────────────────────────
  {
    id: 'smash', kind: 'menu', name: 'Double Smash Burger',
    desc: 'Two smashed beef patties, triple cheddar, house pickles and secret sauce on a toasted brioche bun. Served with crinkle-cut fries.',
    price: 12.9, category: 'burgers', img: 'img/burger-smash.jpg', emoji: '🍔',
    kcal: 940, time: '18–25 min', rating: 4.9, reviews: 482, popular: true,
  },
  {
    id: 'chicken-burger', kind: 'menu', name: 'Crispy Chicken Burger',
    desc: 'Buttermilk-brined fried chicken, crisp lettuce, tomato, pickles and garlic-mayo slaw on a brioche bun.',
    price: 11.5, category: 'burgers', img: 'img/burger-chicken.jpg', emoji: '🍗',
    kcal: 820, time: '18–25 min', rating: 4.8, reviews: 317,
  },
  {
    id: 'pep-pizza', kind: 'menu', name: 'Pepperoni Supreme',
    desc: 'Wood-fired thin crust, double pepperoni, mozzarella, hot honey drizzle and fresh oregano.',
    price: 14.0, category: 'pizza', img: 'img/pizza.jpg', emoji: '🍕',
    kcal: 1100, time: '25–30 min', rating: 4.7, reviews: 264, popular: true,
  },
  {
    id: 'dragon-roll', kind: 'menu', name: 'Dragon Roll · 8 pcs',
    desc: 'Shrimp tempura, avocado and unagi glaze, crowned with salmon and glossy roe. Served with wasabi & pickled ginger.',
    price: 13.5, category: 'sushi', img: 'img/sushi.jpg', emoji: '🍣',
    kcal: 520, time: '20–30 min', rating: 4.9, reviews: 391, popular: true,
  },
  {
    id: 'salmon-bowl', kind: 'menu', name: 'Salmon Poke Bowl',
    desc: 'Seared salmon, avocado, edamame, mango and cucumber over sushi rice, toasted sesame and ponzu.',
    price: 15.0, category: 'bowls', img: 'img/salmon-bowl.jpg', emoji: '🥗',
    kcal: 640, time: '15–20 min', rating: 4.8, reviews: 208,
  },
  {
    id: 'wrap', kind: 'menu', name: 'Grilled Chicken Wrap',
    desc: 'Charred chicken breast, melted mozzarella, charred corn, creamy herb sauce and fresh greens in a grilled tortilla.',
    price: 9.9, category: 'bowls', img: 'img/wrap.jpg', emoji: '🌯',
    kcal: 580, time: '15–20 min', rating: 4.6, reviews: 154,
  },
  {
    id: 'caesar', kind: 'menu', name: 'Caesar Classic',
    desc: 'Baby romaine, aged parmesan, sourdough croutons and our 24-hour caesar dressing. Anchovy optional.',
    price: 8.9, category: 'bowls', img: 'img/caesar.jpg', emoji: '🥗',
    kcal: 420, time: '10–15 min', rating: 4.5, reviews: 121,
  },
  {
    id: 'lava-cake', kind: 'menu', name: 'Molten Lava Cake',
    desc: 'Warm dark-chocolate cake with a flowing center, vanilla bean ice cream and a dusting of cocoa.',
    price: 6.5, category: 'desserts', img: 'img/lava-cake.jpg', emoji: '🍫',
    kcal: 480, time: '15–20 min', rating: 4.9, reviews: 342, popular: true,
  },
  {
    id: 'latte', kind: 'menu', name: 'Iced Caramel Latte',
    desc: 'Double-shot espresso over cold milk with caramel cream and cold foam. The best thing in the fridge, arguably.',
    price: 4.9, category: 'drinks', img: 'img/latte.jpg', emoji: '🧋',
    kcal: 180, time: '5–10 min', rating: 4.7, reviews: 98,
  },

  // ─── The Market ────────────────────────────────────────────────
  {
    id: 'avo', kind: 'grocery', name: 'Avocados', unit: '3 pack',
    desc: 'Hass avocados, ripe and ready today — buttery, creamy, perfect for toast and toasts of approval.',
    price: 4.5, category: 'produce', emoji: '🥑', g1: '#3fae6a', g2: '#0d2b1c',
    rating: 4.8, reviews: 214, popular: true,
  },
  {
    id: 'straw', kind: 'grocery', name: 'Fresh Strawberries', unit: '500 g',
    desc: 'Sweet, dewy and picked this morning. Smell them in the box — that is the whole quality check.',
    price: 5.2, category: 'produce', emoji: '🍓', g1: '#e8467a', g2: '#42102a',
    rating: 4.9, reviews: 187,
  },
  {
    id: 'banana', kind: 'grocery', name: 'Ripe Bananas', unit: '1 bunch',
    desc: 'Golden and sweet, ready to eat. Breakfast, smoothies or the back pocket — your call.',
    price: 2.3, category: 'produce', emoji: '🍌', g1: '#f0c243', g2: '#4a3407',
    rating: 4.6, reviews: 96,
  },
  {
    id: 'sourdough', kind: 'grocery', name: 'Sourdough Loaf', unit: '900 g',
    desc: '48-hour ferment, crackly crust, open crumb. Baked at 6 AM every day — it sells out by 2.',
    price: 4.8, category: 'bakery', emoji: '🍞', g1: '#d6913f', g2: '#3a2312',
    rating: 4.9, reviews: 233, popular: true,
  },
  {
    id: 'eggs', kind: 'grocery', name: 'Free-Range Eggs', unit: '12 count',
    desc: 'Big orange yolks from hens that have seen actual grass. Breakfast never tasted this responsible.',
    price: 5.9, category: 'dairy', emoji: '🥚', g1: '#ecd9ac', g2: '#4a3c22',
    rating: 4.9, reviews: 175,
  },
  {
    id: 'cheddar', kind: 'grocery', name: 'Aged Cheddar', unit: '300 g',
    desc: '18-month aged, sharp and crystalline. For the board, the pasta or the 1 AM cheese moment.',
    price: 6.4, category: 'dairy', emoji: '🧀', g1: '#f2a93b', g2: '#4d2f08',
    rating: 4.7, reviews: 142,
  },
  {
    id: 'chicken-breast', kind: 'grocery', name: 'Chicken Breast', unit: '1 kg',
    desc: 'Boneless, skinless, farm-raised. Vacuum-sealed and cut to order on request.',
    price: 9.9, category: 'butcher', emoji: '🍗', g1: '#d96a45', g2: '#3d140c',
    rating: 4.6, reviews: 88,
  },
  {
    id: 'oil', kind: 'grocery', name: 'Extra Virgin Olive Oil', unit: '500 ml',
    desc: 'First cold press, peppery finish. The one that makes everything taste like somewhere warm.',
    price: 11.9, category: 'pantry', emoji: '🫒', g1: '#c9b23a', g2: '#33300d',
    rating: 4.8, reviews: 119,
  },
  {
    id: 'honey', kind: 'grocery', name: 'Wildflower Honey', unit: '400 ml',
    desc: 'Raw, unfiltered, single-harvest. For tea, toast, and yes — directly from the jar.',
    price: 7.9, category: 'pantry', emoji: '🍯', g1: '#e9a83a', g2: '#4d3208',
    rating: 4.9, reviews: 96,
  },
  {
    id: 'choc', kind: 'grocery', name: 'Dark Chocolate 85%', unit: '100 g',
    desc: 'Single-origin, stone-ground. Intense, a little bitter, deeply satisfying. Fair-trade always.',
    price: 4.2, category: 'snacks', emoji: '🍫', g1: '#8a5a3a', g2: '#241207',
    rating: 4.8, reviews: 201,
  },
  {
    id: 'cookies', kind: 'grocery', name: 'Oat Milk Cookies', unit: '12 pc',
    desc: 'Baked in small batches with real vanilla and flaky salt. Vegan, secretly dangerous.',
    price: 3.8, category: 'snacks', emoji: '🍪', g1: '#c98d4e', g2: '#3a2410',
    rating: 4.7, reviews: 134,
  },
  {
    id: 'soda', kind: 'grocery', name: 'Craft Citrus Soda', unit: '355 ml',
    desc: 'Blood orange and yuzu, low sugar, real fizz. Cold chain kept from farm to fridge.',
    price: 3.5, category: 'snacks', emoji: '🥤', g1: '#ff8a3d', g2: '#4d1c07',
    rating: 4.5, reviews: 77,
  },
]

export const HERO_ITEM: Item = {
  id: 'hero', kind: 'menu', name: 'The Fresh Bites Smash', desc: '',
  price: 12.9, category: 'burgers', img: 'img/hero.jpg', emoji: '🍔',
  rating: 4.9, reviews: 482,
}

export const TICKER = [
  'Sara A. ordered Dragon Roll ×1',
  'Marco T. grabbed Sourdough + Eggs',
  'Aisha K. ordered Double Smash ×2',
  'Leo B. checked out 4 grocery items',
  'Nina P. added a Molten Lava Cake',
  'Omar F. is on the way to you 🛵',
  'Julia R. ordered Salmon Poke Bowl',
]

export const REVIEWS = [
  {
    name: 'Maya R.',
    avatar: '👩🏽',
    stars: 5,
    text: 'Scanned the QR at the table, ordered in 30 seconds, and it landed on their WhatsApp with everything formatted. Dinner was at my door in 22 minutes.',
  },
  {
    name: 'Daniel K.',
    avatar: '👨🏻',
    stars: 5,
    text: 'First time ordering groceries and dinner from the same cart. Eggs, bread, avocados and a pepperoni — one payment, one delivery, zero fuss.',
  },
  {
    name: 'Lucia M. — owner',
    avatar: '👩🏼‍🍳',
    stars: 5,
    text: 'I run a small pizzeria. The QR codes on our tables doubled walk-in orders, and every single one arrives on my WhatsApp. Zero app installs for my customers.',
  },
]

export const EMOJIS = ['🍔', '🍕', '🍣', '🥗', '🌮', '🍜', '🍰', '☕', '🍗', '🏪']

export const ACCENTS = [
  { c: '#ff6a2b', name: 'Ember' },
  { c: '#ffb03a', name: 'Amber' },
  { c: '#25d366', name: 'Leaf' },
  { c: '#7c5cff', name: 'Grape' },
  { c: '#ff4d6d', name: 'Berry' },
]

export const CURRENCIES = ['$', '€', '£', '₦', 'USDT']

export const WHEN_OPTIONS = ['ASAP · ~25 min', 'In 45 min', 'In 2 hours']

export const PAYMENTS = [
  { id: 'cash', label: 'Cash on delivery', icon: '💵', hint: 'Pay the rider at your door' },
  { id: 'card', label: 'Card', icon: '💳', hint: 'Visa · Mastercard · Amex' },
  { id: 'usdt', label: 'USDT (TRC-20)', icon: '⚡', hint: 'Pay after we confirm on WhatsApp' },
] as const

export const MARQUEE = [
  '🍔 Smash burgers',
  '🍕 Wood-fired pizza',
  '🍣 Fresh sushi',
  '🥑 Farm produce',
  '🍞 Baked daily',
  '🧋 Cold drinks',
  '🍫 Molten desserts',
  '🛵 25-min delivery',
]
