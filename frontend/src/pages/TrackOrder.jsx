// src/pages/TrackOrder.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, MapPin, CheckCircle, Clock,
  Search, Loader2, AlertCircle, Leaf, RefreshCw,
  ShoppingBag, Phone, Mail, Info,
} from 'lucide-react';

// ── Mock tracking data (replace with real API call) ───────────────────────────

const MOCK_ORDERS = {
  'PN-100423': {
    orderNumber: 'PN-100423',
    placedOn: 'March 8, 2025',
    estimatedDelivery: 'March 14, 2025',
    status: 'in_transit',
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456784',
    shippingMethod: 'Express Shipping',
    items: [
      { name: 'Monstera Deliciosa', qty: 1, image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=80&q=60' },
      { name: 'Ceramic White Pot (6")', qty: 2, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=80&q=60' },
    ],
    destination: 'Portland, OR 97201',
    events: [
      { date: 'Mar 8, 9:14 AM',  label: 'Order placed',             desc: 'Your order was received and confirmed.', done: true  },
      { date: 'Mar 9, 7:30 AM',  label: 'Inspected & packed',       desc: 'Plants inspected and packaged by our team.', done: true  },
      { date: 'Mar 9, 2:05 PM',  label: 'Handed to carrier',        desc: 'Collected by UPS at our nursery facility.', done: true  },
      { date: 'Mar 11, 6:00 AM', label: 'In transit — Portland hub', desc: 'Package arrived at Portland distribution centre.', done: true  },
      { date: 'Mar 14, Est.',    label: 'Out for delivery',          desc: 'Estimated delivery by end of day.', done: false },
      { date: 'Mar 14, Est.',    label: 'Delivered',                 desc: 'Package delivered to your address.', done: false },
    ],
  },
  'PN-099887': {
    orderNumber: 'PN-099887',
    placedOn: 'March 3, 2025',
    estimatedDelivery: 'March 7, 2025',
    status: 'delivered',
    carrier: 'FedEx',
    trackingNumber: '274899172985',
    shippingMethod: 'Standard Shipping',
    items: [
      { name: 'Peace Lily (Large)', qty: 1, image: 'https://images.unsplash.com/photo-1620803366004-119b57f54cd6?w=80&q=60' },
    ],
    destination: 'Portland, OR 97201',
    events: [
      { date: 'Mar 3, 10:22 AM', label: 'Order placed',          desc: 'Your order was received and confirmed.', done: true },
      { date: 'Mar 4, 8:15 AM',  label: 'Inspected & packed',    desc: 'Plants inspected and packaged by our team.', done: true },
      { date: 'Mar 4, 3:40 PM',  label: 'Handed to carrier',     desc: 'Collected by FedEx at our nursery facility.', done: true },
      { date: 'Mar 6, 7:00 AM',  label: 'In transit',            desc: 'Package on its way to your city.', done: true },
      { date: 'Mar 7, 9:00 AM',  label: 'Out for delivery',      desc: 'Package loaded onto delivery vehicle.', done: true },
      { date: 'Mar 7, 2:34 PM',  label: 'Delivered',             desc: 'Left at front door. Signed by: J. Smith', done: true },
    ],
  },
};

const STATUS_META = {
  processing:  { label: 'Processing',    color: 'yellow', icon: Clock     },
  packed:      { label: 'Packed',        color: 'blue',   icon: Package   },
  in_transit:  { label: 'In Transit',    color: 'orange', icon: Truck     },
  out_for_del: { label: 'Out for Del.',  color: 'purple', icon: MapPin    },
  delivered:   { label: 'Delivered',     color: 'green',  icon: CheckCircle },
};

const STATUS_COLORS = {
  yellow: 'bg-yellow-100 text-yellow-700',
  blue:   'bg-blue-100   text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
  green:  'bg-green-100  text-green-700',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const meta  = STATUS_META[status] || STATUS_META.processing;
  const Icon  = meta.icon;
  const color = STATUS_COLORS[meta.color];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${color}`}>
      <Icon className="w-3.5 h-3.5" /> {meta.label}
    </span>
  );
};

const Timeline = ({ events }) => {
  const lastDone = [...events].reverse().findIndex(e => e.done);
  const activeIdx = lastDone === -1 ? 0 : events.length - 1 - lastDone;

  return (
    <div className="relative">
      {/* Track line */}
      <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gray-200" />
      <div
        className="absolute left-[19px] top-5 w-px bg-green-400 transition-all duration-700"
        style={{ height: `${(activeIdx / (events.length - 1)) * 100}%` }}
      />

      <div className="space-y-6">
        {events.map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="flex items-start gap-4 relative"
          >
            {/* Node */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-300 ${
              ev.done
                ? 'bg-green-500 border-green-500'
                : i === activeIdx + 1
                  ? 'bg-white border-green-400 shadow-md shadow-green-100'
                  : 'bg-white border-gray-200'
            }`}>
              {ev.done
                ? <CheckCircle className="w-5 h-5 text-white" />
                : i === activeIdx + 1
                  ? <Truck className="w-4 h-4 text-green-500" />
                  : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              }
            </div>

            <div className={`pt-2 ${ev.done ? '' : 'opacity-50'}`}>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${ev.done ? 'text-gray-800' : 'text-gray-400'}`}>
                  {ev.label}
                </p>
                {i === activeIdx && ev.done && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{ev.date}</p>
              {ev.done && <p className="text-xs text-gray-400 mt-0.5">{ev.desc}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const OrderResult = ({ order }) => (
  <motion.div
    key={order.orderNumber}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
  >
    {/* Header */}
    <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">Order {order.orderNumber}</h2>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Placed {order.placedOn} · {order.shippingMethod}
        </p>
      </div>
      <div className="sm:ml-auto text-right">
        <p className="text-xs text-gray-500">Estimated delivery</p>
        <p className="text-sm font-bold text-green-700">{order.estimatedDelivery}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
      {/* Left: Timeline */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <Truck className="w-4 h-4 text-green-500" /> Shipment progress
        </h3>
        <Timeline events={order.events} />
      </div>

      {/* Right: Details */}
      <div className="px-6 py-5 space-y-5">
        {/* Items */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-green-500" /> Items in this shipment
          </h3>
          <div className="space-y-2.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover bg-gray-100 shrink-0"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrier info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Carrier</span>
            <span className="font-semibold text-gray-800">{order.carrier}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Tracking #</span>
            <span className="font-mono text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
              {order.trackingNumber}
            </span>
          </div>
          <div className="flex items-start justify-between text-sm gap-2">
            <span className="text-gray-500 shrink-0">Destination</span>
            <span className="font-semibold text-gray-800 text-right">{order.destination}</span>
          </div>
        </div>

        {/* Delivered success banner */}
        {order.status === 'delivered' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800">Your order has been delivered!</p>
              <p className="text-xs text-green-600 mt-0.5">
                We hope your plants arrived healthy. If anything looks off, contact us within 48 hours.
              </p>
            </div>
          </motion.div>
        )}

        {/* Help links */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Need help?</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="mailto:hello@paradisenursery.com"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-green-300 hover:bg-green-50 transition"
            >
              <Mail className="w-4 h-4 text-green-500" /> Email us
            </a>
            <a
              href="tel:+15031234567"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-green-300 hover:bg-green-50 transition"
            >
              <Phone className="w-4 h-4 text-green-500" /> Call us
            </a>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const TrackOrder = () => {
  const [query,   setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e?.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSearched(false);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));

    const found = MOCK_ORDERS[trimmed];
    if (found) {
      setResult(found);
    } else {
      setError(`No order found for "${trimmed}". Please check the number and try again.`);
    }
    setSearched(true);
    setLoading(false);
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setError('');
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-4xl mx-auto px-4 space-y-6"
      >

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580913428023-02c695666d61?w=1200&q=50')] bg-cover bg-center opacity-20" />
            <div className="relative text-center text-white px-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Truck className="w-7 h-7" />
                <h1 className="text-3xl font-bold">Track Your Order</h1>
              </div>
              <p className="text-green-100 text-sm max-w-md mx-auto">
                Enter your order number to see real-time shipment updates and an estimated delivery date.
              </p>
            </div>
          </div>

          {/* Search form */}
          <form onSubmit={handleTrack} className="px-6 py-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order number
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. PN-100423"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={loading || !query.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Tracking…</>
                  : <><Search className="w-4 h-4" /> Track</>
                }
              </motion.button>
              {searched && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </motion.button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Your order number is in your confirmation email, formatted as PN-XXXXXX.
            </p>
          </form>
        </div>

        {/* ── Loading skeleton ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-green-500 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Looking up your order…</p>
              <div className="w-full max-w-xs space-y-2 mt-1">
                {[100, 80, 60].map((w, i) => (
                  <div key={i} className={`h-2.5 bg-gray-100 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error state ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-md p-6 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{error}</p>
                <p className="text-sm text-gray-500 mt-1">
                  You can also find your order number in your confirmation email from{' '}
                  <span className="font-medium text-green-600">hello@paradisenursery.com</span>.
                </p>
                <div className="flex gap-3 mt-3">
                  <a href="mailto:hello@paradisenursery.com" className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition">
                    <Mail className="w-4 h-4" /> Contact support
                  </a>
                  <a href="/orders" className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition">
                    <ShoppingBag className="w-4 h-4" /> My orders
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Order result ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {result && !loading && <OrderResult order={result} />}
        </AnimatePresence>

        {/* ── Empty / initial state prompt ─────────────────────────────────── */}
        <AnimatePresence>
          {!searched && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-md p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-base font-semibold text-gray-700 mb-1">Where's my order?</h2>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Enter your order number above to see packing, dispatch, and delivery updates.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
                <a href="/orders" className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-gray-600 hover:border-green-300 hover:bg-green-50 transition">
                  <ShoppingBag className="w-4 h-4 text-green-500" /> View all my orders
                </a>
                <a href="/shipping-info" className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-gray-600 hover:border-green-300 hover:bg-green-50 transition">
                  <Truck className="w-4 h-4 text-green-500" /> Shipping info
                </a>
              </div>

              {/* Demo hint */}
              <div className="mt-6 bg-green-50 border border-green-100 rounded-xl px-4 py-3 inline-flex items-center gap-2">
                <Info className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs text-green-700">
                  <span className="font-semibold">Demo tip:</span> Try order numbers{' '}
                  <button onClick={() => setQuery('PN-100423')} className="font-mono font-bold underline hover:no-underline">PN-100423</button>{' '}
                  or{' '}
                  <button onClick={() => setQuery('PN-099887')} className="font-mono font-bold underline hover:no-underline">PN-099887</button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};


export default TrackOrder;