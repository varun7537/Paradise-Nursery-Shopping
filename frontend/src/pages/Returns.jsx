// src/pages/Returns.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, ShieldCheck, Package, Mail, Camera,
  CheckCircle, AlertCircle, ChevronDown, Clock,
  Leaf, Info, Phone, Truck, X, ChevronRight,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const POLICY_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Live Arrival Guarantee',
    color: 'green',
    desc: 'Every plant is guaranteed to arrive alive and healthy. If your plant arrives in poor condition — wilted, broken, or clearly stressed — we will replace it or refund you in full, no questions asked.',
  },
  {
    icon: Clock,
    title: '30-Day Health Guarantee',
    color: 'blue',
    desc: 'If your plant dies within 30 days of delivery despite following our care instructions, we will send a replacement or issue store credit. Just share a photo and your order number.',
  },
  {
    icon: Package,
    title: 'Wrong item received',
    color: 'purple',
    desc: 'If we sent you the wrong plant or product, contact us within 14 days and we will send the correct item with express shipping at no extra cost to you.',
  },
  {
    icon: AlertCircle,
    title: 'Change of mind',
    color: 'orange',
    desc: 'We cannot accept returns of live plants due to their perishable nature. For non-plant items (pots, tools, accessories), returns are accepted within 30 days in original condition.',
  },
];

const STEPS = [
  {
    number: '01',
    icon: Camera,
    title: 'Document the issue',
    desc: 'Take clear photos of the plant or item showing the problem. Photos must be taken within 48 hours of delivery for live-arrival claims, or within 30 days for health guarantee claims.',
  },
  {
    number: '02',
    icon: Mail,
    title: 'Contact us',
    desc: 'Email hello@paradisenursery.com with your order number, a description of the issue, and your photos. Alternatively, use the form below to submit a claim directly.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'We review your claim',
    desc: 'Our team reviews all claims within 1–2 business days. We may ask a few follow-up questions to understand the situation and confirm care conditions.',
  },
  {
    number: '04',
    icon: RefreshCw,
    title: 'Resolution',
    desc: 'Once approved, we will either dispatch a replacement with priority shipping or issue a full refund to your original payment method within 3–5 business days.',
  },
];

const FAQS = [
  {
    q: 'Do I need to return the plant to get a refund?',
    a: 'No — we never ask you to ship a plant back. Just send us photos and your order number. Returning a stressed plant would cause further harm and unnecessary waste.',
  },
  {
    q: 'What counts as "following care instructions"?',
    a: 'We check for obvious care issues in the photos (e.g. standing water, sunburn). As long as you made a reasonable effort based on our care guide, you are covered. We are here to help, not interrogate you.',
  },
  {
    q: 'My plant died after 30 days — can I still get help?',
    a: 'The formal guarantee covers 30 days, but please reach out anyway. If the cause appears to be a pre-existing condition from transit, we will still work with you on a resolution.',
  },
  {
    q: 'Can I return a pot or accessory if I changed my mind?',
    a: 'Yes — non-living items can be returned within 30 days of delivery in original, unused condition. You cover return shipping costs. Once we receive and inspect the item, we issue a refund within 5 business days.',
  },
  {
    q: 'How long does it take to receive a replacement?',
    a: 'Replacements ship within 1–2 business days of claim approval, using the same or faster shipping method as your original order. You will receive a new tracking number by email.',
  },
  {
    q: 'What if I ordered during a weather hold and the plant arrived late?',
    a: 'Weather holds protect your plant — the guarantee clock starts from actual delivery, not the original estimated date. You still get the full 48-hour and 30-day windows.',
  },
];

const ISSUE_TYPES = [
  'Plant arrived dead or severely damaged',
  'Plant arrived wilted or stressed',
  'Wrong plant / item received',
  'Item was missing from my order',
  'Plant died within 30 days',
  'Non-plant item defective or damaged',
  'Other',
];

// ── Sub-components ────────────────────────────────────────────────────────────

const colorMap = {
  green:  { outer: 'bg-green-100',  icon: 'text-green-600',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700'  },
  blue:   { outer: 'bg-blue-100',   icon: 'text-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'   },
  purple: { outer: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  orange: { outer: 'bg-orange-100', icon: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
};

const PolicyCard = ({ item }) => {
  const c = colorMap[item.color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-md border p-5 hover:shadow-lg transition-shadow ${c.border}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${c.outer}`}>
          <item.icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-green-50 transition text-left"
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
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
            <div className="px-5 py-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Claim form
const ClaimForm = () => {
  const [form, setForm]   = useState({ orderNumber: '', issueType: '', description: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const validate = () => {
    const e = {};
    if (!form.orderNumber.trim()) e.orderNumber = 'Order number is required.';
    if (!form.issueType)          e.issueType   = 'Please select an issue type.';
    if (!form.description.trim()) e.description = 'Please describe the issue.';
    if (!form.email.trim())       e.email       = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900)); // simulate API call
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-8 px-4 gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Claim submitted!</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            We have received your claim for order <span className="font-semibold text-gray-700">{form.orderNumber}</span>.
            Our team will review and respond to <span className="font-semibold text-gray-700">{form.email}</span> within 1–2 business days.
          </p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setForm({ orderNumber: '', issueType: '', description: '', email: '' }); setFileName(''); }}
          className="px-5 py-2 border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition"
        >
          Submit another claim
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order number + email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Order number *</label>
          <input
            name="orderNumber"
            value={form.orderNumber}
            onChange={handleChange}
            placeholder="e.g. PN-100423"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
              errors.orderNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.orderNumber && <p className="text-red-500 text-xs mt-1">{errors.orderNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email address *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
              errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Issue type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Issue type *</label>
        <div className="relative">
          <select
            name="issueType"
            value={form.issueType}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition appearance-none bg-white ${
              errors.issueType ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select issue type…</option>
            {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {errors.issueType && <p className="text-red-500 text-xs mt-1">{errors.issueType}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Describe the issue *
          <span className="ml-2 text-xs font-normal text-gray-400">{form.description.length}/500</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          placeholder="Tell us what happened — when did you notice the issue, what does it look like, have you already tried anything?"
          className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition ${
            errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Attach photos (recommended)</label>
        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition group">
          <Camera className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-600 group-hover:text-green-700 transition">
              {fileName || 'Click to upload photos'}
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, WEBP — max 10 MB each</p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => {
              const names = Array.from(e.target.files).map(f => f.name).join(', ');
              setFileName(names || '');
            }}
          />
        </label>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {submitting
          ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
          : <><RefreshCw className="w-4 h-4" /> Submit Return / Replacement Claim</>
        }
      </motion.button>
    </form>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Returns = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-5xl mx-auto px-4 space-y-8"
    >

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459156212016-c812468e2115?w=1200&q=50')] bg-cover bg-center opacity-20" />
          <div className="relative text-center text-white px-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <RefreshCw className="w-7 h-7" />
              <h1 className="text-3xl font-bold">Returns & Replacements</h1>
            </div>
            <p className="text-green-100 text-sm max-w-md mx-auto">
              We stand behind every plant we ship. If something isn't right, we make it right — quickly and without fuss.
            </p>
          </div>
        </div>

        {/* TL;DR strip */}
        <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex items-start sm:items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-green-800">
            <span className="font-bold">tl;dr —</span> unhappy with your plant? Email a photo to{' '}
            <a href="mailto:hello@paradisenursery.com" className="underline underline-offset-2 hover:no-underline font-medium">
              hello@paradisenursery.com
            </a>{' '}
            within 30 days. We'll replace it or refund you. No return required.
          </p>
        </div>
      </div>

      {/* ── Policy cards ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-500" /> Our Guarantee
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {POLICY_POINTS.map((item, i) => <PolicyCard key={i} item={item} />)}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" /> How the Process Works
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Four simple steps from problem to resolution — typically handled within 2 business days.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-green-200 leading-none">{step.number}</span>
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{step.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden lg:block w-4 h-4 text-gray-300 self-center absolute" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Eligibility at a glance ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-green-500" /> Eligibility at a Glance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Scenario', 'Window', 'Resolution', 'Return required?'].map(h => (
                  <th key={h} className="pb-2.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { scenario: 'Plant arrives dead / severely damaged', window: '48 hours of delivery', resolution: 'Replacement or full refund', ret: false },
                { scenario: 'Plant arrives wilted / stressed',        window: '48 hours of delivery', resolution: 'Replacement or full refund', ret: false },
                { scenario: 'Plant dies under normal care',           window: '30 days of delivery',  resolution: 'Replacement or store credit', ret: false },
                { scenario: 'Wrong item shipped',                     window: '14 days of delivery',  resolution: 'Correct item + express ship', ret: false },
                { scenario: 'Non-plant item — change of mind',        window: '30 days of delivery',  resolution: 'Refund on receipt',          ret: true  },
                { scenario: 'Non-plant item — defective',             window: '30 days of delivery',  resolution: 'Replacement or refund',      ret: false },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-green-50 transition">
                  <td className="py-2.5 pr-4 text-gray-700">{row.scenario}</td>
                  <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{row.window}</td>
                  <td className="py-2.5 pr-4 text-gray-700">{row.resolution}</td>
                  <td className="py-2.5">
                    {row.ret
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">Yes</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> No</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          All windows begin from actual delivery date as confirmed by carrier tracking.
        </p>
      </div>

      {/* ── Claim form ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Submit a Claim</h2>
            <p className="text-xs text-gray-400">Usually resolved within 1–2 business days</p>
          </div>
        </div>
        <div className="p-6">
          <ClaimForm />
        </div>
      </div>

      {/* ── FAQs ──────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-green-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* ── Contact strip ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white rounded-2xl shadow-md p-5 flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-gray-800">Still have questions?</p>
          <p className="text-sm text-gray-500 mt-0.5">Our team is happy to help Monday – Friday, 9 am – 5 pm PT.</p>
        </div>
        <div className="sm:ml-auto flex gap-3 shrink-0">
          <a
            href="mailto:hello@paradisenursery.com"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
          <a
            href="tel:+15031234567"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
          >
            <Phone className="w-4 h-4" /> Call us
          </a>
        </div>
      </motion.div>

    </motion.div>
  </div>
);


export default Returns;