// src/pages/ContactUs.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector }    from 'react-redux';
import { motion, AnimatePresence }     from 'framer-motion';
import {
  Mail, Phone, MapPin, Send, Loader2,
  CheckCircle, AlertCircle, User, MessageSquare, FileText,
} from 'lucide-react';
import {
  submitContactForm,
  resetContactState,
  selectContactLoading,
  selectContactSuccess,
  selectContactError,
} from '../store/contactSlice';

// ── Constants ─────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

const CONTACT_INFO = [
  { icon: Phone,  label: 'Phone',   value: '+91 98765 43210',            href: 'tel:+919876543210' },
  { icon: Mail,   label: 'Email',   value: 'contact@paradisenursery.com', href: 'mailto:contact@paradisenursery.com' },
  { icon: MapPin, label: 'Address', value: '123 Green Street, Mumbai, India', href: null },
];

// ── Field component ───────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
      )}
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-red-500 text-xs mt-1 flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" /> {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ContactUs = () => {
  const dispatch = useDispatch();
  const loading  = useSelector(selectContactLoading);
  const success  = useSelector(selectContactSuccess);
  const apiError = useSelector(selectContactError);

  const [form,        setForm]        = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  // Reset Redux state on unmount
  useEffect(() => () => { dispatch(resetContactState()); }, [dispatch]);

  // Clear form on success
  useEffect(() => {
    if (success) setForm(EMPTY_FORM);
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error as user types
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Client-side validation — mirrors backend validators for instant feedback
  const validate = () => {
    const errs = {};
    if (!form.name.trim())
      errs.name = 'Name is required.';
    else if (form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters.';

    if (!form.email.trim())
      errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Must be a valid email address.';

    if (!form.subject.trim())
      errs.subject = 'Subject is required.';
    else if (form.subject.trim().length < 3)
      errs.subject = 'Subject must be at least 3 characters.';

    if (!form.message.trim())
      errs.message = 'Message is required.';
    else if (form.message.trim().length < 10)
      errs.message = 'Message must be at least 10 characters.';

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Reset previous API error
    dispatch(resetContactState());

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    dispatch(submitContactForm({
      name:    form.name.trim(),
      email:   form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    }));
  };

  const inputClass = (fieldName) =>
    `w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-gray-900
     placeholder-gray-400 outline-none transition
     focus:ring-2 focus:ring-green-500 focus:border-transparent
     ${fieldErrors[fieldName] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-green-500 to-green-700 text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=40')] bg-cover bg-center opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-5xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-lg text-green-100 max-w-xl mx-auto">
            We'd love to hear from you! Reach out for any queries or support.
          </p>
        </motion.div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: Contact Info ─────────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Whether you have questions about our plants, need gardening tips,
                or want to know more — feel free to reach out!
              </p>
            </div>

            <div className="space-y-4">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-gray-700 hover:text-green-600 transition font-medium">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700 font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Business hours */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-green-800 mb-3">Business Hours</h3>
              <div className="space-y-1.5 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Mon – Fri</span><span className="font-semibold">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span><span className="font-semibold">10:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span><span className="font-semibold text-red-500">Closed</span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* ── Right: Form ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

            {/* ── Success banner ──────────────────────────────────────────── */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl mb-6"
                >
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Message sent successfully!</p>
                    <p className="text-xs mt-0.5 text-green-600">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── API error banner ────────────────────────────────────────── */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl mb-6 text-sm"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Name + Email row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Your Name" icon={User} error={fieldErrors.name}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputClass('name')}
                    disabled={loading}
                  />
                </Field>

                <Field label="Email Address" icon={Mail} error={fieldErrors.email}>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass('email')}
                    disabled={loading}
                  />
                </Field>
              </div>

              {/* Subject */}
              <Field label="Subject" icon={FileText} error={fieldErrors.subject}>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className={inputClass('subject')}
                  disabled={loading}
                />
              </Field>

              {/* Message */}
              <Field label="Message" icon={MessageSquare} error={fieldErrors.message}>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write your message here..."
                  disabled={loading}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-gray-900
                    placeholder-gray-400 outline-none transition resize-none
                    focus:ring-2 focus:ring-green-500 focus:border-transparent
                    ${fieldErrors.message ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}
                    ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <span className="text-xs text-gray-400 mt-1 block text-right">
                  {form.message.length}/5000
                </span>
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.98]
                           text-white font-semibold rounded-xl shadow-sm transition-all
                           flex items-center justify-center gap-2
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Sending…</>
                ) : success ? (
                  <><CheckCircle className="h-5 w-5" /> Message Sent!</>
                ) : (
                  <><Send className="h-5 w-5" /> Send Message</>
                )}
              </button>

            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;