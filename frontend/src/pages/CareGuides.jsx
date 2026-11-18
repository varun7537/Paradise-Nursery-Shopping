// src/pages/CareGuides.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Sun, Thermometer, Wind, Scissors,
  ChevronDown, Search, Leaf, BookOpen, Sprout,
  AlertCircle, CheckCircle, Info,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Succulents', 'Tropicals', 'Herbs', 'Ferns', 'Flowering'];

const GUIDES = [
  {
    id: 1,
    name: 'Succulents & Cacti',
    category: 'Succulents',
    emoji: '🌵',
    tagline: 'Low-maintenance desert beauties',
    difficulty: 'Easy',
    difficultyColor: 'green',
    water: 'Every 2–3 weeks',
    light: 'Bright direct sun',
    temp: '60–80 °F',
    humidity: 'Low (10–40%)',
    waterTip: 'Water deeply but infrequently. Allow soil to dry out completely between waterings. In winter, reduce to once a month.',
    lightTip: 'Thrives in 6+ hours of direct sunlight. South or east-facing windows are ideal. Supplement with grow lights in winter.',
    tempTip: 'Tolerant of heat but protect from frost. Most varieties cannot survive temperatures below 32 °F.',
    humidityTip: 'Prefer dry air. Avoid misting and keep away from kitchens and bathrooms.',
    pruning: 'Remove dead or damaged leaves at the base. Propagate offsets ("pups") in spring.',
    commonIssues: [
      { issue: 'Mushy stem or leaves', cause: 'Overwatering / root rot', fix: 'Remove plant from soil, trim rotted roots, let dry 2–3 days, repot in fresh dry mix.' },
      { issue: 'Stretching / leaning (etiolation)', cause: 'Insufficient light', fix: 'Move to a brighter spot gradually to avoid sunburn.' },
      { issue: 'Brown, shrivelled leaves', cause: 'Underwatering', fix: 'Give a thorough soak and establish a more regular watering schedule.' },
    ],
  },
  {
    id: 2,
    name: 'Tropical Houseplants',
    category: 'Tropicals',
    emoji: '🌿',
    tagline: 'Lush foliage for any interior',
    difficulty: 'Moderate',
    difficultyColor: 'yellow',
    water: 'Weekly',
    light: 'Bright indirect light',
    temp: '65–85 °F',
    humidity: 'High (50–70%)',
    waterTip: 'Water when the top inch of soil feels dry. Use room-temperature filtered or rainwater when possible.',
    lightTip: 'Bright indirect light suits most tropicals. Avoid direct midday sun, which scorches leaves.',
    tempTip: 'Keep away from cold drafts and heating vents. Never expose to temperatures below 50 °F.',
    humidityTip: 'Mist leaves every few days, use a pebble-water tray, or run a humidifier nearby.',
    pruning: 'Pinch back leggy growth in spring to encourage bushier habit. Remove yellowing leaves promptly.',
    commonIssues: [
      { issue: 'Yellow leaves', cause: 'Overwatering or low light', fix: 'Check soil moisture before watering and move to a brighter spot.' },
      { issue: 'Brown leaf tips', cause: 'Low humidity or fluoride in water', fix: 'Increase humidity and switch to filtered water.' },
      { issue: 'Drooping leaves', cause: 'Underwatering or root-bound', fix: 'Water thoroughly; repot if roots are circling the pot.' },
    ],
  },
  {
    id: 3,
    name: 'Culinary Herbs',
    category: 'Herbs',
    emoji: '🌱',
    tagline: 'Fresh flavours from your windowsill',
    difficulty: 'Easy',
    difficultyColor: 'green',
    water: 'Every 3–5 days',
    light: 'Full sun (6 h+)',
    temp: '60–75 °F',
    humidity: 'Moderate (40–60%)',
    waterTip: 'Water when the top half-inch of soil is dry. Ensure pots have drainage holes — soggy roots cause most herb failures.',
    lightTip: 'Most herbs need at least 6 hours of sun. A south-facing sill is ideal; supplement with a grow light in winter.',
    tempTip: 'Most herbs prefer cool to warm temperatures. Basil is the exception — it sulks below 60 °F.',
    humidityTip: 'Average household humidity is fine. Good air circulation helps prevent fungal issues.',
    pruning: 'Harvest regularly by snipping stems just above a leaf node. Never remove more than one-third at a time. Pinch off flower buds to prolong leaf production.',
    commonIssues: [
      { issue: 'Leggy, pale growth', cause: 'Insufficient light', fix: 'Move to a sunnier spot or add a grow light.' },
      { issue: 'Wilting despite moist soil', cause: 'Root rot from poor drainage', fix: 'Repot into fresh, well-draining mix with a pot that has drainage holes.' },
      { issue: 'Bolting (going to seed early)', cause: 'Heat or stress', fix: 'Pinch off flower heads immediately to redirect energy to leaves.' },
    ],
  },
  {
    id: 4,
    name: 'Ferns',
    category: 'Ferns',
    emoji: '🌿',
    tagline: 'Elegant fronds for shady spots',
    difficulty: 'Moderate',
    difficultyColor: 'yellow',
    water: 'Keep evenly moist',
    light: 'Low to medium indirect',
    temp: '60–75 °F',
    humidity: 'Very high (60–80%)',
    waterTip: 'Keep soil consistently moist but never waterlogged. Ferns hate drying out — check daily in warm weather.',
    lightTip: 'Bright indirect or filtered light. Direct sun will scorch fronds; a north-facing window works well.',
    tempTip: 'Stable temperatures are key. Avoid heating vents, cold windows, and sudden temperature swings.',
    humidityTip: 'Ferns are humidity-hungry. Group plants together, mist daily, or use a humidifier for best results.',
    pruning: 'Remove old, brown fronds at the base with clean scissors. This encourages fresh growth.',
    commonIssues: [
      { issue: 'Crispy brown fronds', cause: 'Low humidity or underwatering', fix: 'Increase humidity immediately and water more frequently.' },
      { issue: 'Pale or yellowish fronds', cause: 'Too much direct light', fix: 'Move to a shadier location away from direct sun.' },
      { issue: 'Dropping fronds', cause: 'Cold draft or temperature shock', fix: 'Move away from windows and vents; maintain stable warmth.' },
    ],
  },
  {
    id: 5,
    name: 'Flowering Plants',
    category: 'Flowering',
    emoji: '🌸',
    tagline: 'Year-round colour and fragrance',
    difficulty: 'Moderate',
    difficultyColor: 'yellow',
    water: 'Weekly; reduce after bloom',
    light: 'Bright indirect light',
    temp: '55–75 °F',
    humidity: 'Moderate (40–60%)',
    waterTip: 'Water thoroughly when the top inch is dry. Reduce watering after blooms fade to allow a rest period.',
    lightTip: 'Bright, indirect light encourages blooming. A few hours of gentle morning sun is beneficial.',
    tempTip: 'Cooler nights (around 55 °F) can trigger or prolong blooming in many varieties.',
    humidityTip: 'Avoid misting flowers directly — this encourages mould. Use a pebble tray instead.',
    pruning: 'Deadhead spent blooms promptly to encourage the next flush of flowers. Cut stems at 45° just above a leaf node.',
    commonIssues: [
      { issue: 'No blooms', cause: 'Insufficient light or over-fertilising', fix: 'Move to brighter spot; switch to a bloom-promoting low-nitrogen fertiliser.' },
      { issue: 'Dropping buds', cause: 'Draft, sudden temperature change, or low humidity', fix: 'Find a stable, draught-free position and boost humidity.' },
      { issue: 'Grey mould on flowers', cause: 'Botrytis — high humidity + poor airflow', fix: 'Remove affected parts, improve ventilation, reduce humidity slightly.' },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const DifficultyBadge = ({ level, color }) => {
  const styles = {
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red:    'bg-red-100   text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[color] || styles.green}`}>
      {level}
    </span>
  );
};

const StatPill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
    <Icon className="w-4 h-4 text-green-500 shrink-0" />
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-gray-700">{value}</p>
    </div>
  </div>
);

const AccordionSection = ({ icon: Icon, title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-green-50 transition text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Icon className="w-4 h-4 text-green-500" /> {title}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GuideCard = ({ guide }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
    >
      {/* Card header */}
      <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{guide.emoji}</span>
            <div>
              <h3 className="text-base font-bold text-gray-800">{guide.name}</h3>
              <p className="text-xs text-gray-400">{guide.tagline}</p>
            </div>
          </div>
          <DifficultyBadge level={guide.difficulty} color={guide.difficultyColor} />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <StatPill icon={Droplets}    label="Water"    value={guide.water}    />
          <StatPill icon={Sun}         label="Light"    value={guide.light}    />
          <StatPill icon={Thermometer} label="Temp"     value={guide.temp}     />
          <StatPill icon={Wind}        label="Humidity" value={guide.humidity} />
        </div>

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition"
        >
          {expanded ? 'Show less' : 'Full care guide'}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                <AccordionSection icon={Droplets}    title="Watering details">   {guide.waterTip}    </AccordionSection>
                <AccordionSection icon={Sun}         title="Light requirements"> {guide.lightTip}    </AccordionSection>
                <AccordionSection icon={Thermometer} title="Temperature & climate"> {guide.tempTip} </AccordionSection>
                <AccordionSection icon={Wind}        title="Humidity tips">      {guide.humidityTip} </AccordionSection>
                <AccordionSection icon={Scissors}    title="Pruning & propagation"> {guide.pruning} </AccordionSection>

                {/* Common issues */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <AlertCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-gray-700">Common issues & fixes</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {guide.commonIssues.map((item, i) => (
                      <div key={i} className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{item.issue}</p>
                        <p className="text-xs text-gray-400 mt-0.5"><span className="font-medium text-orange-500">Cause:</span> {item.cause}</p>
                        <p className="text-xs text-gray-500 mt-1"><span className="font-medium text-green-600">Fix:</span> {item.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CareGuides = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = GUIDES.filter(g => {
    const matchCat  = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                        g.tagline.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-5xl mx-auto px-4"
      >

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=50')] bg-cover bg-center opacity-20" />
            <div className="relative text-center text-white px-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <BookOpen className="w-7 h-7" />
                <h1 className="text-3xl font-bold">Plant Care Guides</h1>
              </div>
              <p className="text-green-100 text-sm max-w-md mx-auto">
                Expert tips to help every plant in your collection thrive — from watering schedules to common problem fixes.
              </p>
            </div>
          </div>

          {/* Search + filter bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plant guides…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      activeCategory === cat
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className="px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Leaf className="w-4 h-4 text-green-400" />
            {filtered.length} guide{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* ── Guide grid ──────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-md p-12 text-center"
          >
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">No guides match your search</p>
            <p className="text-gray-400 text-sm mt-1">Try a different keyword or category.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-4 px-5 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.map(guide => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Pro tip banner ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-md p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Not sure which plant is right for you?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse our full collection — every product page includes its specific care requirements so you can shop with confidence.
            </p>
          </div>
          <a
            href="/products"
            className="ml-auto shrink-0 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
          >
            Shop plants
          </a>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default CareGuides;