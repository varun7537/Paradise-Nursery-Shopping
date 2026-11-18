import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, Sun, Droplets, Star, ShoppingCart, ArrowRight, Heart,
  Truck, Phone, Shield, ChevronLeft, ChevronRight, Search,
  X, Plus, Minus, Check, MessageCircle, ChevronDown, ChevronUp,
  Sparkles, TrendingUp, Clock, Filter, Home, Wind, Smile,
  Eye, Flame, Tag, BookOpen, Users, Award, Zap
} from "lucide-react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const ALL_PLANTS = [
  { id: 1, image: "https://media.istockphoto.com/id/120877521/photo/monstera.jpg?s=1024x1024&w=is&k=20&c=3bZaL2cjGt3H27Qsb_Kg56o9il1DL7ycYwOONG1tmZE=", name: "Monstera Deliciosa", price: 45, tag: "Bestseller", category: "Indoor", rating: 4.9, reviews: 218, isNew: false, isBestseller: true },
  { id: 2, image: "https://media.istockphoto.com/id/151539559/photo/pot-plant.jpg?s=1024x1024&w=is&k=20&c=fpSigU0QN6Q3Q09nypqQAEozdd2Hg6dh7GjJ1ZOBY7M=", name: "Peace Lily", price: 30, tag: "Easy Care", category: "Indoor", rating: 4.7, reviews: 145, isNew: false, isBestseller: true },
  { id: 3, image: "https://media.istockphoto.com/id/1168381749/photo/sansevieria-trifasciata-in-a-pot-isolated-on-white-background.jpg?s=1024x1024&w=is&k=20&c=VceRmz_z7oyIuFRztdgAU-xokfTHwZFv01-4BDZbuK4=", name: "Snake Plant", price: 25, tag: "Air Purifying", category: "Indoor", rating: 4.8, reviews: 302, isNew: false, isBestseller: true },
  { id: 4, image: "https://media.istockphoto.com/id/1393839291/photo/green-leaves-tropical-houseplant-fiddle-leaf-fig-tree-in-small-ceramic-pot-ornamental-tree.jpg?s=1024x1024&w=is&k=20&c=UtL-9Kpz9mDQs1V8CZhLho0JZAbutG8Wcc4OxXsA7qg=", name: "Fiddle Leaf Fig", price: 60, tag: "Statement Plant", category: "Indoor", rating: 4.6, reviews: 98, isNew: true, isBestseller: false },
  { id: 5, image: "https://media.istockphoto.com/id/1468694517/photo/aloe-vera-two-leaves-with-slice-beauty-skin-care-concept.jpg?s=1024x1024&w=is&k=20&c=hnQXEPPzhpDHPXFIa0IOldpgmqXZcCOOZyLs3PCZwaM=", name: "Aloe Vera", price: 20, tag: "Medicinal", category: "Succulents", rating: 4.9, reviews: 411, isNew: false, isBestseller: true },
  { id: 6, image: "https://media.istockphoto.com/id/1417260723/photo/house-plant-chlorophytum-comosum-in-grey-pot-on-white-table.jpg?s=1024x1024&w=is&k=20&c=MRNfwWdBeQa6aAMUTX5HLyRiA63jlKZXi3kTUzfsyJ4=", name: "Spider Plant", price: 15, tag: "Low Maintenance", category: "Indoor", rating: 4.5, reviews: 189, isNew: false, isBestseller: false },
  { id: 7, image: "https://media.istockphoto.com/id/1400227202/photo/rosengeranium-potted-plant-doktor-westerlunds.jpg?s=1024x1024&w=is&k=20&c=ggMDWFLv1Nltw_T9cEHa8-X4oDP8nO6LrdTFPdefQw4=", name: "Pink Geranium", price: 22, tag: "Flowering", category: "Outdoor", rating: 4.7, reviews: 76, isNew: true, isBestseller: false },
  { id: 8, image: "https://media.istockphoto.com/id/157510083/photo/edinburgh-door-entrance.jpg?s=1024x1024&w=is&k=20&c=A1FW5KyncQgrpXzmYXwhaNjrPohKmIMyvXQdtS3KcXc=", name: "Door Garden Set", price: 85, tag: "Bundle", category: "Outdoor", rating: 4.8, reviews: 54, isNew: true, isBestseller: false },
];

const CATEGORIES = [
  { label: "All Plants", icon: <Leaf className="w-5 h-5" />, key: "all", bg: "from-green-400 to-teal-500" },
  { label: "Indoor", icon: <Home className="w-5 h-5" />, key: "Indoor", bg: "from-emerald-400 to-green-600" },
  { label: "Outdoor", icon: <Sun className="w-5 h-5" />, key: "Outdoor", bg: "from-yellow-400 to-orange-500" },
  { label: "Succulents", icon: <Droplets className="w-5 h-5" />, key: "Succulents", bg: "from-teal-400 to-cyan-600" },
  { label: "Air Purifying", icon: <Wind className="w-5 h-5" />, key: "air", bg: "from-sky-400 to-blue-600" },
  { label: "Easy Care", icon: <Smile className="w-5 h-5" />, key: "easy", bg: "from-purple-400 to-pink-500" },
];

const BLOG_POSTS = [
  {
    image: "https://media.istockphoto.com/id/1409763640/photo/friends-buying-plants-at-a-garden-center.jpg?s=1024x1024&w=is&k=20&c=aHJM6PvuQGnIkCH4g1z1ari7BVjo2dVGaSWp_XhIx40=",
    category: "Care Guide",
    title: "10 Beginner-Friendly Houseplants You Can't Kill",
    excerpt: "Starting your plant journey? These resilient beauties will thrive even if you forget to water them occasionally.",
    author: "Emma Green",
    date: "May 28, 2025",
    readTime: "4 min read",
  },
  {
    image: "https://media.istockphoto.com/id/120877521/photo/monstera.jpg?s=1024x1024&w=is&k=20&c=3bZaL2cjGt3H27Qsb_Kg56o9il1DL7ycYwOONG1tmZE=",
    category: "Styling Tips",
    title: "How to Style Your Home with Tropical Plants",
    excerpt: "Transform any room into a lush sanctuary with these interior styling secrets from our expert designers.",
    author: "James Leaf",
    date: "May 15, 2025",
    readTime: "6 min read",
  },
  {
    image: "https://media.istockphoto.com/id/1468694517/photo/aloe-vera-two-leaves-with-slice-beauty-skin-care-concept.jpg?s=1024x1024&w=is&k=20&c=hnQXEPPzhpDHPXFIa0IOldpgmqXZcCOOZyLs3PCZwaM=",
    category: "Wellness",
    title: "Plants That Actually Improve Your Air Quality",
    excerpt: "Science-backed picks that remove toxins and boost oxygen levels in your living and working spaces.",
    author: "Dr. Priya Sharma",
    date: "May 5, 2025",
    readTime: "5 min read",
  },
];

const FAQS = [
  { q: "Do you deliver live plants safely?", a: "Yes! We use specially designed breathable packaging with moisture retention. All plants are carefully secured with biodegradable cushioning to ensure they arrive healthy and vibrant." },
  { q: "What if my plant arrives damaged?", a: "We offer a 30-day guarantee. If your plant arrives damaged or dies within 30 days, we'll replace it or issue a full refund — no questions asked. Just send us a photo." },
  { q: "How often should I water my new plant?", a: "It depends on the species! Each plant comes with a detailed care card. Our general rule: water when the top inch of soil feels dry. Overwatering is the most common mistake." },
  { q: "Do you offer bulk orders for offices or events?", a: "Absolutely! We offer corporate and event packages with volume discounts. Contact our team for custom quotes and we'll arrange delivery and setup." },
  { q: "Can I return a plant I've changed my mind about?", a: "We accept returns within 7 days of delivery for plants in original condition. Please note that we can't accept returns on plants that have been repotted or significantly altered." },
];

const TESTIMONIALS = [
  { image: "https://media.istockphoto.com/id/1471845315/photo/happy-portrait-or-business-woman-taking-a-selfie-in-office-building-for-a-social-media.jpg?s=1024x1024&w=is&k=20&c=pH8fuqyANYAwC6KH3Dp4vWlqg8EfXa0w4X_qcYEbdWM=", name: "Sarah Johnson", role: "Home Gardener", text: "Paradise Nursery transformed my apartment into a green sanctuary. Their plants are healthy and beautiful!", rating: 5 },
  { image: "https://media.istockphoto.com/id/1429256034/photo/happy-woman-video-conference-webinar-portrait.jpg?s=1024x1024&w=is&k=20&c=EkWvx9nsRhZ5Hf4HSfqjvilGRvhS1LW-DYmFK8Kbs0C=", name: "Michael Chen", role: "Interior Designer", text: "The quality of plants and expert advice here is unmatched. My go-to place for all plant needs.", rating: 5 },
  { image: "https://media.istockphoto.com/id/670337396/photo/my-mission-to-make-it-right-to-the-top.jpg?s=1024x1024&w=is&k=20&c=feUr7f6CEwePqq0Ij4qsid2ujyTTtMriYmX7aib69ws=", name: "Emma Williams", role: "Plant Enthusiast", text: "Outstanding selection and incredible customer service. Every plant I've bought is thriving!", rating: 5 },
];

const QUIZ_STEPS = [
  {
    question: "Where will this plant live?",
    options: [
      { label: "Bright living room", icon: "☀️", value: "bright" },
      { label: "Low-light bedroom", icon: "🌙", value: "low" },
      { label: "Sunny balcony", icon: "🏠", value: "outdoor" },
      { label: "Office desk", icon: "💼", value: "office" },
    ],
  },
  {
    question: "How often do you remember to water?",
    options: [
      { label: "Daily — I'm devoted", icon: "💧", value: "frequent" },
      { label: "Weekly is fine", icon: "📅", value: "weekly" },
      { label: "I forget sometimes", icon: "😅", value: "occasional" },
      { label: "Honestly, rarely", icon: "🌵", value: "rare" },
    ],
  },
  {
    question: "What's your goal?",
    options: [
      { label: "Purify the air", icon: "🌬️", value: "air" },
      { label: "Make a statement", icon: "✨", value: "statement" },
      { label: "Easy greenery", icon: "🍃", value: "easy" },
      { label: "Grow something edible", icon: "🌿", value: "edible" },
    ],
  },
];

/* ─────────────────────────────────────────────
   STAR RATING COMPONENT
───────────────────────────────────────────── */
const StarRating = ({ rating, size = "sm", showCount = false, count = 0 }) => {
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sizeClass} ${i <= Math.floor(rating) ? "text-yellow-400" : i - 0.5 <= rating ? "text-yellow-300" : "text-gray-200"} fill-current`} viewBox="0 0 20 20">
          <path d="M10 15l-3.684 2.532.943-4.414-3.404-2.94 4.453-.382L10 4l1.692 4.416 4.453.382-3.404 2.94.943 4.414L10 15z" />
        </svg>
      ))}
      {showCount && <span className="text-xs text-gray-500 ml-1">({count})</span>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PLANT CARD COMPONENT
───────────────────────────────────────────── */
const PlantCard = ({ plant, onAddToCart, wishlist, toggleWishlist }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    onAddToCart(plant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden flex flex-col">
      <div className="relative overflow-hidden">
        <img src={plant.image} alt={plant.name} className="w-full h-52 sm:h-56 object-cover transform group-hover:scale-110 transition duration-500" />
        <span className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-0.5 rounded-full text-xs font-medium shadow">{plant.tag}</span>
        {plant.isNew && <span className="absolute top-3 left-3 bg-teal-500 text-white px-2.5 py-0.5 rounded-full text-xs font-medium shadow">New</span>}
        <button
          onClick={() => toggleWishlist(plant.id)}
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 ${wishlist.includes(plant.id) ? "bg-red-500 text-white scale-110" : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
          aria-label="Wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight mb-1">{plant.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <StarRating rating={plant.rating} />
          <span className="text-xs text-gray-500">({plant.reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-green-600">${plant.price}</span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${added ? "bg-green-500 text-white scale-95" : "bg-green-50 text-green-700 hover:bg-green-500 hover:text-white"}`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CART DRAWER COMPONENT
───────────────────────────────────────────── */
const CartDrawer = ({ isOpen, onClose, cart, updateQty, removeItem }) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <>
      <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-green-600" /> Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Leaf className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Your cart is empty</p>
              <p className="text-gray-300 text-sm mt-1">Add some plants to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-green-600 font-bold text-sm">${item.price}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-green-100 flex items-center justify-center transition-colors"><Minus className="w-3 h-3 text-gray-600" /></button>
                  <span className="w-5 text-center text-sm font-semibold text-gray-700">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-green-100 flex items-center justify-center transition-colors"><Plus className="w-3 h-3 text-gray-600" /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-full hover:bg-red-100 transition-colors"><X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</span>
            </div>
            <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3.5 rounded-full font-bold text-base hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
              Checkout →
            </button>
            <button onClick={onClose} className="w-full text-center text-green-600 text-sm font-medium hover:underline">Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   SEARCH OVERLAY COMPONENT
───────────────────────────────────────────── */
const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const results = query.trim().length > 0
    ? ALL_PLANTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else setQuery("");
  }, [isOpen]);

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 right-0 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-green-400 transition-colors">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for plants, categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800 text-base placeholder:text-gray-400"
            />
            {query && <button onClick={() => setQuery("")} className="p-1 rounded-full hover:bg-gray-200 transition-colors"><X className="w-4 h-4 text-gray-400" /></button>}
            <button onClick={onClose} className="ml-1 text-sm text-gray-500 hover:text-gray-700 font-medium">Close</button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 pb-3 space-y-1 max-h-72 overflow-y-auto">
              {results.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-green-50 cursor-pointer transition-colors group" onClick={onClose}>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-green-700 transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} · ${p.price}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <p className="py-4 text-center text-gray-400 text-sm">No plants found for "{query}"</p>
          )}
          {!query && (
            <div className="py-3 flex flex-wrap gap-2">
              {["Monstera", "Air purifying", "Easy care", "Succulents", "Outdoor"].map((t) => (
                <button key={t} onClick={() => setQuery(t)} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors font-medium">{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   WHATSAPP CHAT WIDGET
───────────────────────────────────────────── */
const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-30 flex flex-col items-start gap-2">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl w-72 overflow-hidden animate-fadeInUp">
          <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"><Leaf className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-white font-semibold text-sm">Paradise Nursery</p>
              <p className="text-green-100 text-xs">Typically replies in minutes</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4 bg-[#e5ddd5]">
            <div className="bg-white rounded-xl rounded-tl-none px-3 py-2.5 shadow-sm max-w-[85%]">
              <p className="text-gray-700 text-sm">👋 Hi there! Looking for the perfect plant? We're here to help!</p>
              <p className="text-gray-400 text-xs mt-1 text-right">10:24 AM</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <a
              href="https://wa.me/911234567890?text=Hi!%20I'm%20interested%20in%20your%20plants%20🌿"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2.5 rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-13 h-13 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
        style={{ width: 52, height: 52 }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PLANT FINDER QUIZ
───────────────────────────────────────────── */
const QUIZ_RESULTS = {
  "bright-frequent-statement": { name: "Fiddle Leaf Fig", match: 98 },
  "bright-weekly-air": { name: "Peace Lily", match: 96 },
  "low-rare-easy": { name: "Snake Plant", match: 99 },
  "low-occasional-easy": { name: "Pothos", match: 97 },
  "outdoor-weekly-statement": { name: "Monstera Deliciosa", match: 95 },
  "office-rare-easy": { name: "ZZ Plant", match: 98 },
  default: { name: "Spider Plant", match: 92 },
};

const PlantFinderQuiz = () => {
  const [step, setStep] = useState(-1); // -1 = not started
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (val) => {
    const next = [...answers, val];
    if (next.length === QUIZ_STEPS.length) {
      const key = next.join("-");
      setResult(QUIZ_RESULTS[key] || QUIZ_RESULTS.default);
      setAnswers(next);
      setStep(QUIZ_STEPS.length);
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  };

  const reset = () => { setStep(-1); setAnswers([]); setResult(null); };

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-green-100">
      {step === -1 && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-5">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Find Your Perfect Plant</h3>
          <p className="text-gray-500 mb-7 max-w-md mx-auto">Answer 3 quick questions and we'll match you with the ideal plant for your space and lifestyle.</p>
          <button onClick={() => setStep(0)} className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-bold hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Start the Quiz →
          </button>
        </div>
      )}

      {step >= 0 && step < QUIZ_STEPS.length && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            {QUIZ_STEPS.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? "bg-green-500" : "bg-gray-200"}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 font-medium mb-2">Question {step + 1} of {QUIZ_STEPS.length}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">{QUIZ_STEPS[step].question}</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUIZ_STEPS[step].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 border-transparent hover:border-green-400 hover:shadow-md transition-all duration-200 text-center group"
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700 leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
          {step > 0 && (
            <button onClick={() => { setAnswers(a => a.slice(0, -1)); setStep(s => s - 1); }} className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>
      )}

      {step === QUIZ_STEPS.length && result && (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl mb-5 shadow-lg">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">Your Perfect Match</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{result.name}</h3>
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${result.match}%` }} />
            </div>
            <span className="text-green-600 font-bold text-sm">{result.match}% match</span>
          </div>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Based on your answers, this plant is perfect for your light conditions, watering habits, and goals.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products" className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-full font-bold hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
              Shop {result.name}
            </Link>
            <button onClick={reset} className="border-2 border-green-200 text-green-700 px-6 py-3 rounded-full font-bold hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-sm">
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("bestsellers"); // bestsellers | newarrivals
  const [openFaq, setOpenFaq] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  // Sticky nav scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 5000);
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll);
    return () => { clearInterval(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Cart helpers
  const addToCart = (plant) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === plant.id);
      return ex ? prev.map((i) => i.id === plant.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...plant, qty: 1 }];
    });
    trackViewed(plant);
  };
  const updateQty = (id, qty) => qty < 1 ? removeItem(id) : setCart((p) => p.map((i) => i.id === id ? { ...i, qty } : i));
  const removeItem = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Wishlist
  const toggleWishlist = (id) => setWishlist((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]);

  // Recently Viewed
  const trackViewed = (plant) => setRecentlyViewed((p) => [plant, ...p.filter((i) => i.id !== plant.id)].slice(0, 6));

  // Filtered plants
  const filtered = ALL_PLANTS.filter((p) => {
    const catMatch = activeCategory === "all" || p.category === activeCategory || (activeCategory === "air" && p.tag === "Air Purifying") || (activeCategory === "easy" && (p.tag === "Easy Care" || p.tag === "Low Maintenance"));
    const ratingMatch = p.rating >= ratingFilter;
    return catMatch && ratingMatch;
  });

  const bestsellers = ALL_PLANTS.filter((p) => p.isBestseller);
  const newArrivals = ALL_PLANTS.filter((p) => p.isNew);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail) setNewsletterDone(true);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── STICKY NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className={`font-extrabold text-base sm:text-lg transition-colors ${scrolled ? "text-gray-800" : "text-white"}`}>Paradise Nursery</span>
          </Link>

          {/* Search bar (desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`hidden sm:flex items-center gap-2 flex-1 max-w-xs px-4 py-2 rounded-full border transition-all duration-200 text-sm ${scrolled ? "bg-gray-50 border-gray-200 text-gray-400 hover:border-green-400" : "bg-white/20 border-white/30 text-white/80 hover:bg-white/30"}`}
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span>Search plants…</span>
          </button>

          {/* Nav Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search */}
            <button onClick={() => setSearchOpen(true)} className={`sm:hidden p-2 rounded-full transition-colors ${scrolled ? "hover:bg-gray-100 text-gray-600" : "text-white hover:bg-white/20"}`}>
              <Search className="w-5 h-5" />
            </button>
            <Link to="/products" className={`hidden md:block text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-green-600" : "text-white/90 hover:text-white"}`}>Shop</Link>
            <Link to="/freeconsultation" className={`hidden md:block text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-green-600" : "text-white/90 hover:text-white"}`}>Consult</Link>
            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-full transition-colors hover:bg-green-100">
              <ShoppingCart className={`w-5 h-5 transition-colors ${scrolled ? "text-gray-700" : "text-white"}`} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="relative bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/1409763640/photo/friends-buying-plants-at-a-garden-center.jpg?s=1024x1024&w=is&k=20&c=aHJM6PvuQGnIkCH4g1z1ari7BVjo2dVGaSWp_XhIx40=')] bg-cover bg-center opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className={`text-white space-y-6 transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">
                <Sparkles className="w-3.5 h-3.5" /> Trusted by 50,000+ plant lovers
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                Bring Nature<br />
                <span className="text-teal-100">Into Your Home</span> 🌿
              </h1>
              <p className="text-lg sm:text-xl text-teal-50 leading-relaxed max-w-md">
                Transform your space with our carefully curated collection of beautiful, healthy plants.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/products" className="group bg-white text-green-600 hover:bg-green-50 py-3.5 px-7 rounded-full font-bold transition-all duration-300 transform hover:scale-105 text-center flex items-center justify-center gap-2 shadow-lg">
                  Explore Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm border border-white/40 text-white hover:bg-white/25 py-3.5 px-7 rounded-full font-bold transition-all duration-300"
                >
                  <Search className="w-4 h-4" /> Search Plants
                </button>
              </div>
              {/* Mini stats */}
              <div className="flex flex-wrap gap-5 pt-2">
                {[["500+", "Plant varieties"], ["30-day", "Guarantee"], ["Free", "Delivery"]].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-white font-extrabold text-lg leading-none">{n}</p>
                    <p className="text-teal-100 text-xs mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`hidden md:block transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}>
              <div className="grid grid-cols-2 gap-5">
                <img src="https://media.istockphoto.com/id/1400227202/photo/rosengeranium-potted-plant-doktor-westerlunds.jpg?s=1024x1024&w=is&k=20&c=ggMDWFLv1Nltw_T9cEHa8-X4oDP8nO6LrdTFPdefQw4=" alt="Indoor Plant" className="rounded-2xl shadow-2xl transform hover:scale-105 transition duration-500 hover:shadow-green-400/20" />
                <img src="https://media.istockphoto.com/id/157510083/photo/edinburgh-door-entrance.jpg?s=1024x1024&w=is&k=20&c=A1FW5KyncQgrpXzmYXwhaNjrPohKmIMyvXQdtS3KcXc=" alt="Outdoor Plant" className="rounded-2xl shadow-2xl transform translate-y-10 hover:scale-105 transition duration-500 hover:shadow-green-400/20" />
              </div>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 60" className="w-full fill-white" preserveAspectRatio="none" style={{ display: "block" }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="bg-white py-8 sm:py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { icon: <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />, label: "Free Delivery", sub: "On orders over $50" },
              { icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />, label: "30-Day Guarantee", sub: "Healthy or replaced" },
              { icon: <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />, label: "24/7 Support", sub: "Always here to help" },
              { icon: <Star className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />, label: "5-Star Rated", sub: "50,000+ happy customers" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{item.label}</p>
                  <p className="text-gray-400 text-xs hidden sm:block">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="bg-gray-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Browse Categories</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${activeCategory === cat.key ? "border-green-500 bg-green-500 text-white shadow-md shadow-green-200" : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700"}`}
              >
                <span className="flex-shrink-0">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PLANT GRID WITH RATINGS FILTER ── */}
      <div className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Our Plants</h2>
              <p className="text-gray-400 text-sm mt-0.5">{filtered.length} plants found</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Min rating:</span>
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setRatingFilter(r)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${ratingFilter === r ? "bg-yellow-400 text-yellow-900" : "bg-gray-100 text-gray-500 hover:bg-yellow-50"}`}
                >
                  {r === 0 ? "All" : `${r}+★`}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Leaf className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No plants match those filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filtered.map((p) => (
                <PlantCard key={p.id} plant={p} onAddToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-bold hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              View All Plants <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── BEST SELLERS / NEW ARRIVALS TABS ── */}
      <div className="bg-gray-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Handpicked for You</h2>
            <div className="inline-flex bg-white rounded-full p-1 border border-gray-200 shadow-sm self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("bestsellers")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === "bestsellers" ? "bg-green-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Flame className="w-4 h-4" /> Best Sellers
              </button>
              <button
                onClick={() => setActiveTab("newarrivals")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === "newarrivals" ? "bg-green-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Zap className="w-4 h-4" /> New Arrivals
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {(activeTab === "bestsellers" ? bestsellers : newArrivals).map((p) => (
              <PlantCard key={p.id} plant={p} onAddToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
            ))}
          </div>
        </div>
      </div>

      {/* ── PLANT FINDER QUIZ ── */}
      <div className="bg-white py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <PlantFinderQuiz />
        </div>
      </div>

      {/* ── RATINGS & REVIEWS ── */}
      <div className="bg-gray-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Summary */}
            <div className="lg:w-64 flex-shrink-0 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Ratings & Reviews</h2>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-5xl font-extrabold text-gray-800">4.8</span>
                <span className="text-gray-400 text-sm">out of 5</span>
              </div>
              <StarRating rating={4.8} size="lg" />
              <p className="text-gray-400 text-xs mt-1">Based on 1,200+ reviews</p>
              <div className="mt-4 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 text-right">{star}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <button className="mt-5 w-full border-2 border-green-200 text-green-700 py-2.5 rounded-full text-sm font-semibold hover:bg-green-50 hover:border-green-400 transition-all">
                Write a Review
              </button>
            </div>

            {/* Testimonial cards */}
            <div className="flex-1 w-full">
              <div className="relative">
                <button
                  onClick={() => setActiveTestimonial((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                  className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-green-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="overflow-hidden">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all duration-500">
                    <div className="flex items-start gap-4">
                      <img src={TESTIMONIALS[activeTestimonial].image} alt={TESTIMONIALS[activeTestimonial].name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-green-100" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-bold text-gray-800">{TESTIMONIALS[activeTestimonial].name}</p>
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{TESTIMONIALS[activeTestimonial].role}</span>
                          <span className="ml-auto flex-shrink-0 text-xs text-gray-400 hidden sm:inline">Verified Purchase ✓</span>
                        </div>
                        <StarRating rating={TESTIMONIALS[activeTestimonial].rating} />
                        <p className="text-gray-600 mt-3 leading-relaxed italic">"{TESTIMONIALS[activeTestimonial].text}"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length)}
                  className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-green-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-5">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)} className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? "bg-green-600 w-6" : "bg-gray-200 w-2"}`} />
                ))}
              </div>
              {/* Additional review cards (static) */}
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                {[
                  { name: "Rohan K.", role: "First-time buyer", text: "Arrived perfectly packaged. The Monstera is absolutely stunning!", stars: 5 },
                  { name: "Priya M.", role: "Interior Stylist", text: "I've ordered 6 times now. Consistent quality every single time.", stars: 5 },
                ].map((r) => (
                  <div key={r.name} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">{r.name[0]}</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                        <p className="text-gray-400 text-xs">{r.role}</p>
                      </div>
                    </div>
                    <StarRating rating={r.stars} />
                    <p className="text-gray-500 text-sm mt-2 italic">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE US ── */}
      <div className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-10 text-center">Why Plant Lovers Choose Us</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: <Sun className="w-7 h-7" />, title: "Wide Selection", text: "500+ indoor & outdoor varieties curated for every space." },
              { icon: <Leaf className="w-7 h-7" />, title: "Expert Advice", text: "Personalised plant care tips from certified horticulturists." },
              { icon: <Droplets className="w-7 h-7" />, title: "Care Guides", text: "Detailed plant care instructions with every order." },
              { icon: <ShoppingCart className="w-7 h-7" />, title: "Easy Shopping", text: "Seamless ordering with same-day dispatch available." },
            ].map((f) => (
              <div key={f.title} className="bg-gradient-to-br from-green-50 to-teal-50 p-5 sm:p-7 rounded-2xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENTLY VIEWED ── */}
      {recentlyViewed.length > 0 && (
        <div className="bg-gray-50 py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Recently Viewed</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-36 sm:w-44 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-28 sm:h-32 object-cover" />
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-700 truncate">{p.name}</p>
                    <p className="text-green-600 font-bold text-sm mt-0.5">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BLOG ── */}
      <div className="bg-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">From the Garden Blog</h2>
              <p className="text-gray-400 text-sm mt-1">Expert tips, care guides & plant inspiration</p>
            </div>
            <Link to="/blog" className="hidden sm:flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold text-sm">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {BLOG_POSTS.map((post) => (
              <article key={post.title} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="relative overflow-hidden h-44 sm:h-48">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">{post.category}</span>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-green-700 transition-colors">{post.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-teal-500" />
                      <span className="font-medium text-gray-600">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="sm:hidden text-center mt-5">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm">All Articles <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="bg-gray-50 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
            <p className="text-gray-400 mt-2 text-sm">Everything you need to know before your first order.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 ${openFaq === i ? "border-green-200 shadow-md" : "border-gray-100 shadow-sm"}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <span className="font-semibold text-gray-800 text-sm sm:text-base pr-4">{faq.q}</span>
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${openFaq === i ? "bg-green-100 text-green-600 rotate-180" : "bg-gray-100 text-gray-400"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFaq === i ? "max-h-48" : "max-h-0"}`}>
                  <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">Still have questions?{" "}
              <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">Chat with us on WhatsApp</a>
            </p>
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <div className="bg-gradient-to-r from-teal-500 to-green-600 py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 text-6xl">🌿</div>
          <div className="absolute top-8 right-16 text-5xl">🌱</div>
          <div className="absolute bottom-4 left-1/3 text-4xl">🍃</div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-7 sm:p-10 shadow-xl border border-white/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join Our Green Community</h2>
            <p className="text-teal-50 mb-6 text-sm sm:text-base">Subscribe for exclusive offers, plant care tips, and gardening inspiration.</p>
            {newsletterDone ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"><Check className="w-7 h-7 text-white" /></div>
                <p className="text-white font-bold text-lg">You're in! 🎉</p>
                <p className="text-teal-100 text-sm">Check your inbox for your 10% off code.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 rounded-full border-2 border-white/30 bg-white/15 text-white placeholder:text-white/60 focus:outline-none focus:border-white/60 backdrop-blur-sm text-sm"
                />
                <button type="submit" className="bg-white text-green-600 hover:bg-green-50 px-6 py-3.5 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap">
                  Join Now
                </button>
              </form>
            )}
            {!newsletterDone && <p className="text-teal-100 text-xs mt-3">🎁 Get 10% off your first order when you sign up!</p>}
          </div>
        </div>
      </div>

      {/* ── FOOTER ──
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-white">Paradise Nursery</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Bringing nature into your home, one plant at a time.</p>
              <div className="flex gap-3 mt-4">
                {["📸", "🐦", "📌", "💚"].map((icon, i) => (
                  <button key={i} className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center text-sm transition-colors">{icon}</button>
                ))}
              </div>
            </div>
            {[
              { title: "Shop", links: ["Indoor Plants", "Outdoor Plants", "Succulents", "New Arrivals", "Best Sellers"] },
              { title: "Help", links: ["Plant Care Guide", "Delivery Info", "Returns Policy", "FAQ", "Track My Order"] },
              { title: "Company", links: ["About Us", "Blog", "Sustainability", "Careers", "Press"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>© 2025 Paradise Nursery. All rights reserved.</p>
            <div className="flex gap-4">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
                <a key={t} href="#" className="hover:text-gray-300 transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer> */}

      {/* ── SCROLL TO TOP ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-4 sm:right-6 z-20 bg-green-600 text-white p-3 rounded-full shadow-xl hover:bg-green-700 transition-all duration-300 transform ${showScrollTop ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
        aria-label="Scroll to top"
      >
        <ChevronLeft className="w-5 h-5 rotate-90" />
      </button>

      {/* ── OVERLAYS & DRAWERS ── */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty} removeItem={removeItem} />
      <WhatsAppWidget />
    </div>
  );
};

export default LandingPage;