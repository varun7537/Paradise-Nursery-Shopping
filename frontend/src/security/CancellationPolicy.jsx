import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarX,
  Info,
  CheckCircle,
  XCircle,
  ListChecks,
  CreditCard,
  BadgeDollarSign,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  ChevronUp,
  ChevronRight,
  Leaf,
  Clock,
  Truck,
  PackageX,
  AlertTriangle,
  ShieldCheck,
  Printer,
  Ban,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const LAST_UPDATED  = "April 6, 2026";
const CONTACT_EMAIL = "support@paradisenursery.com";
const CONTACT_PHONE = "+1 (800) 555-0199";
const COMPANY_NAME  = "Paradise Nursery";

const SECTIONS = [
  { id: "introduction",    label: "Introduction",         icon: Info            },
  { id: "eligibility",     label: "Cancellation Window",  icon: CheckCircle     },
  { id: "non-cancellable", label: "Non-Cancellable",      icon: Ban             },
  { id: "process",         label: "How to Cancel",        icon: ListChecks      },
  { id: "refunds",         label: "Refund After Cancel",  icon: CreditCard      },
  { id: "fees",            label: "Fees & Charges",       icon: BadgeDollarSign },
  { id: "contact",         label: "Contact Us",           icon: Mail            },
];

// ─── Shared design primitives ─────────────────────────────────────────────────

/** Gradient section divider — identical across all pages */
const Divider = () => (
  <div className="h-px bg-gradient-to-r from-green-200 via-teal-100 to-transparent mb-7 mt-1" />
);

/** Branded bullet list with emerald→teal gradient chevron dots */
function BulletList({ items }) {
  return (
    <ul className="space-y-2.5" role="list">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
            aria-hidden="true"
          >
            <ChevronRight className="w-3 h-3 text-white" />
          </span>
          <span className="text-gray-700 text-[15px] leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Contextual callout — green / teal / amber / red variants */
function InfoBox({ icon: Icon = Info, color = "green", children }) {
  const styles = {
    green: { wrap: "bg-green-50  border-green-200",  icon: "text-green-600",  text: "text-green-800"  },
    teal:  { wrap: "bg-teal-50   border-teal-200",   icon: "text-teal-600",   text: "text-teal-800"   },
    amber: { wrap: "bg-amber-50  border-amber-200",  icon: "text-amber-600",  text: "text-amber-800"  },
    red:   { wrap: "bg-red-50    border-red-200",    icon: "text-red-500",    text: "text-red-800"    },
  };
  const s = styles[color] ?? styles.green;
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${s.wrap}`} role="note">
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.icon}`} aria-hidden="true" />
      <p className={`text-sm leading-relaxed ${s.text}`}>{children}</p>
    </div>
  );
}

/** Numbered process step card */
function StepCard({ step, icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-green-100 p-5 shadow-md shadow-green-50 hover:shadow-lg hover:shadow-green-100/60 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm text-white font-extrabold text-sm select-none">
          {step}
        </div>
        <Icon className="w-4 h-4 text-green-400" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/** Traffic-light status card (green / amber / red) for time-window rules */
function WindowCard({ icon: Icon, iconColor, bgColor, borderColor, title, children }) {
  return (
    <div className={`flex gap-4 p-5 rounded-2xl border ${bgColor} ${borderColor}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
      <div>
        <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
        <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/** Fee row for the charges table */
function FeeRow({ label, value, note, highlight = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3.5 border-b border-green-50 last:border-b-0 ${highlight ? "bg-amber-50/60 -mx-5 px-5 rounded-xl" : ""}`}>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        {note && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{note}</p>}
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${highlight ? "text-amber-700" : "text-green-700"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Policy section wrapper ───────────────────────────────────────────────────

function PolicySection({ id, icon: Icon, eyebrow, title, children, accent = false }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={[
        "rounded-3xl p-8 md:p-10 border scroll-mt-28 transition-shadow duration-300",
        accent
          ? "bg-gradient-to-br from-green-50 to-teal-50 border-green-100 shadow-lg shadow-green-100/40"
          : "bg-white border-green-50 shadow-xl shadow-green-100/40",
      ].join(" ")}
    >
      {/* Section header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-green-200"
          aria-hidden="true"
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          {eyebrow && (
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">
              {eyebrow}
            </p>
          )}
          <h2
            id={`${id}-heading`}
            className="text-2xl font-extrabold text-gray-800 leading-tight"
          >
            {title}
          </h2>
        </div>
      </div>

      <Divider />

      <div className="text-gray-700 leading-relaxed space-y-5 text-[15px]">
        {children}
      </div>
    </section>
  );
}

// ─── Sticky Table of Contents ─────────────────────────────────────────────────

function TableOfContents({ activeSection }) {
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white rounded-3xl shadow-xl shadow-green-100/60 border border-green-50 p-6 sticky top-24"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-extrabold text-gray-800 text-sm">On this page</span>
      </div>

      <ul className="space-y-1" role="list">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                aria-current={isActive ? "location" : undefined}
                className={[
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-green-200"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                ].join(" ")}
              >
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-green-500"}`}
                  aria-hidden="true"
                />
                <span className="leading-snug">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="h-px bg-gradient-to-r from-green-200 to-transparent mt-5 mb-4" />

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
        <Calendar className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
        <span>Updated {LAST_UPDATED}</span>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-green-700 hover:text-teal-700 bg-green-50 hover:bg-teal-50 border border-green-100 rounded-xl py-2.5 transition-colors duration-200"
        aria-label="Print this policy"
      >
        <Printer className="w-3.5 h-3.5" aria-hidden="true" />
        Print Policy
      </button>
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CancellationPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerRef = useRef(null);

  /* IntersectionObserver for active TOC highlight */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  /* Scroll-to-top visibility */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 print:bg-white">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 relative overflow-hidden print:hidden">
        {/* Botanical SVG decorations */}
        <div
          className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="white" d="M200,15 Q285,75 265,165 Q245,255 150,235 Q55,215 75,125 Q95,35 200,15Z" />
            <path fill="white" d="M255,5 Q315,55 295,135 Q275,215 195,195 Q115,175 135,95 Q155,15 255,5Z" opacity="0.45" />
          </svg>
        </div>
        <div
          className="absolute left-0 bottom-0 w-52 h-52 opacity-5 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="white" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white text-sm font-medium mb-6 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Title block */}
            <div className="flex items-start gap-5">
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex-shrink-0 shadow-lg">
                <CalendarX className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-teal-100 text-sm font-semibold uppercase tracking-widest mb-1">
                  Legal · Orders
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Cancellation<br className="hidden sm:block" /> Policy
                </h1>
                <p className="text-teal-100 mt-2 text-base md:text-lg max-w-xl">
                  We understand plans change. Here's everything you need to know about
                  cancelling an order with {COMPANY_NAME}. 🌿
                </p>
              </div>
            </div>

            {/* Last updated badge */}
            <div className="flex-shrink-0 bg-white/15 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-2.5 self-start md:self-auto">
              <Calendar className="w-4 h-4 text-teal-100" aria-hidden="true" />
              <div>
                <p className="text-xs text-teal-200 font-medium">Last Updated</p>
                <p className="text-white font-bold text-sm">
                  <time dateTime="2026-04-06">{LAST_UPDATED}</time>
                </p>
              </div>
            </div>
          </div>

          {/* Quick-stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[
              { icon: Clock,       label: "12 Hours",   sub: "Free cancellation window" },
              { icon: CreditCard,  label: "5–7 Days",   sub: "Refund to original method" },
              { icon: PackageX,    label: "Pre-Ship",   sub: "Cancel before dispatch"    },
              { icon: ShieldCheck, label: "No Fees",    sub: "If cancelled within window"  },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="bg-white/15 backdrop-blur border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <Icon className="w-5 h-5 text-teal-100 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-extrabold text-white text-base leading-tight">{label}</p>
                  <p className="text-teal-200 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16 print:py-4 print:px-0">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sticky TOC sidebar ──────────────────────────────────────────── */}
          <aside
            className="hidden lg:block w-64 flex-shrink-0 print:hidden"
            aria-label="Page navigation"
          >
            <TableOfContents activeSection={activeSection} />
          </aside>

          {/* ── Policy content ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ── 1 · Introduction ───────────────────────────────────────── */}
            <PolicySection
              id="introduction"
              icon={Info}
              eyebrow="Overview"
              title="Introduction"
            >
              <p>
                At <strong className="text-gray-900">{COMPANY_NAME}</strong>, we take pride in
                preparing every order with care — from selecting healthy plants to careful packaging.
                We understand, however, that circumstances sometimes require customers to cancel an
                order before it is delivered.
              </p>
              <p>
                This Cancellation Policy sets out the conditions under which orders may be
                cancelled, any applicable fees, and how refunds are processed following a successful
                cancellation. Please read this policy carefully before placing your order.
              </p>
              <InfoBox icon={Leaf} color="green">
                This policy applies to all orders placed through{" "}
                <strong>paradisenursery.com</strong>. For wholesale or subscription orders, please
                refer to your individual agreement or{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline underline-offset-2 font-semibold text-green-700 hover:text-teal-700 transition-colors"
                >
                  contact our team
                </a>{" "}
                directly.
              </InfoBox>
              <p>
                By placing an order with us, you agree to the terms of this policy. If you have
                questions before purchasing, we encourage you to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-green-600 font-semibold hover:text-teal-600 transition-colors underline underline-offset-2"
                >
                  reach out to our support team
                </a>{" "}
                — we're always happy to help.
              </p>
            </PolicySection>

            {/* ── 2 · Cancellation Eligibility ──────────────────────────── */}
            <PolicySection
              id="eligibility"
              icon={CheckCircle}
              eyebrow="Timeframes"
              title="Cancellation Window"
              accent
            >
              <p>
                Whether your cancellation is eligible — and what refund you receive — depends
                entirely on <strong className="text-gray-900">when you submit your request</strong>{" "}
                relative to when your order was placed and dispatched.
              </p>

              <div className="space-y-3">
                {/* Green — full refund */}
                <WindowCard
                  icon={CheckCircle}
                  iconColor="text-green-600"
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  title="Within 12 Hours of Ordering — Full Cancellation, Full Refund"
                >
                  <p>
                    Cancellations submitted within 12 hours of the order being placed qualify for
                    a <strong>complete refund</strong> to your original payment method — no
                    questions asked, no fees charged.
                  </p>
                </WindowCard>

                {/* Amber — partial */}
                <WindowCard
                  icon={Clock}
                  iconColor="text-amber-600"
                  bgColor="bg-amber-50"
                  borderColor="border-amber-200"
                  title="12–24 Hours After Ordering — Partial Refund May Apply"
                >
                  <p>
                    If your order has begun preparation but has not yet been dispatched, a
                    cancellation may still be possible subject to a{" "}
                    <strong>10% preparation and handling fee</strong>. The remaining balance will be
                    refunded or offered as store credit.
                  </p>
                </WindowCard>

                {/* Red — no cancellation */}
                <WindowCard
                  icon={XCircle}
                  iconColor="text-red-500"
                  bgColor="bg-red-50"
                  borderColor="border-red-200"
                  title="After 24 Hours / Post-Dispatch — Cancellation Not Available"
                >
                  <p>
                    Once an order has been dispatched or collected by our courier partner, it can no
                    longer be cancelled. If you no longer wish to receive your order, please refer to
                    our{" "}
                    <Link
                      to="/refund-return-policy"
                      className="font-semibold text-red-700 hover:text-teal-700 underline underline-offset-2 transition-colors"
                    >
                      Refund &amp; Return Policy
                    </Link>{" "}
                    once your delivery has been received.
                  </p>
                </WindowCard>
              </div>

              <InfoBox icon={Truck} color="teal">
                Orders placed with <strong>express or next-day shipping</strong> are processed
                immediately. For these orders, the cancellation window is reduced to{" "}
                <strong>2 hours</strong> from the time of purchase.
              </InfoBox>
            </PolicySection>

            {/* ── 3 · Non-Cancellable Orders ────────────────────────────── */}
            <PolicySection
              id="non-cancellable"
              icon={Ban}
              eyebrow="Exclusions"
              title="Non-Cancellable Orders"
            >
              <p>
                Certain order types cannot be cancelled under any circumstances, regardless of
                when the request is made. Please review these exclusions carefully before placing
                your order.
              </p>
              <InfoBox icon={Ban} color="red">
                Cancellation requests for the following order types will be declined. If you have
                concerns before purchasing, please contact us in advance.
              </InfoBox>

              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {/* Non-cancellable products */}
                <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-md shadow-red-50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-base">
                    <PackageX className="w-4 h-4 text-red-500" aria-hidden="true" />
                    Non-Cancellable Items
                  </h3>
                  <BulletList
                    items={[
                      "Custom or bespoke plant arrangements already in preparation",
                      "Personalised gift orders with engraving or custom messaging",
                      "Pre-order items already allocated and reserved",
                      "Subscription boxes already packed and assigned",
                      "Flash-sale items purchased at a one-time discounted price",
                      "Digital downloads and e-gift cards once issued",
                    ]}
                  />
                </div>

                {/* Conditionally non-cancellable */}
                <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-md shadow-amber-50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-base">
                    <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    Conditionally Restricted
                  </h3>
                  <BulletList
                    items={[
                      "Orders placed more than 24 hours ago",
                      "Orders already collected by a courier or shipping partner",
                      "Seasonal or limited-edition collections in final preparation",
                      "Bulk or B2B orders subject to a separate sales agreement",
                      "Orders currently in transit or out for delivery",
                      "Orders for which a gift card or discount code has already been consumed",
                    ]}
                  />
                </div>
              </div>
            </PolicySection>

            {/* ── 4 · Cancellation Process ──────────────────────────────── */}
            <PolicySection
              id="process"
              icon={ListChecks}
              eyebrow="Step by Step"
              title="How to Cancel Your Order"
              accent
            >
              <p>
                To cancel your order, please follow the steps below as soon as possible. Acting
                quickly gives us the best chance of stopping your order before it is dispatched.
              </p>

              <div className="space-y-3 mt-2">
                <StepCard
                  step="01"
                  icon={Mail}
                  title="Contact Our Support Team Immediately"
                  description={`Email us at ${CONTACT_EMAIL} or call ${CONTACT_PHONE} with your order number, the item(s) you wish to cancel, and the reason for cancellation.`}
                />
                <StepCard
                  step="02"
                  icon={Clock}
                  title="Receive Cancellation Confirmation"
                  description="Our team will review your request and respond within 2–4 hours during business hours (Mon–Fri, 9 AM–6 PM PST). Requests sent outside business hours will be reviewed the next business day."
                />
                <StepCard
                  step="03"
                  icon={CheckCircle}
                  title="Cancellation Approved or Declined"
                  description="We will confirm whether your cancellation is approved based on your order status. If approved, a Cancellation Reference Number will be included in your confirmation email."
                />
                <StepCard
                  step="04"
                  icon={CreditCard}
                  title="Refund Initiated"
                  description="Once approved, your refund will be processed within 1–2 business days. The refund is returned to your original payment method and typically appears within 5–7 business days."
                />
              </div>

              <InfoBox icon={Clock} color="teal">
                <strong>Tip:</strong> For the fastest possible response, please email and call us
                simultaneously. Reference your order number in all communications. Avoid raising
                chargebacks before contacting us — we resolve all genuine cancellation requests
                promptly and chargebacks delay the process for everyone.
              </InfoBox>
            </PolicySection>

            {/* ── 5 · Refund After Cancellation ─────────────────────────── */}
            <PolicySection
              id="refunds"
              icon={CreditCard}
              eyebrow="Refund Details"
              title="Refund After Cancellation"
            >
              <p>
                When a cancellation is successfully processed, we initiate the refund as quickly as
                possible. The timeline and amount depend on when the cancellation was requested.
              </p>

              {/* Refund timeline table */}
              <div className="overflow-x-auto -mx-1 mt-2">
                <table
                  className="w-full text-sm rounded-2xl overflow-hidden border border-green-100"
                  role="table"
                  aria-label="Refund amounts and timelines by cancellation window"
                >
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      <th className="text-left px-5 py-3.5 font-bold" scope="col">Cancellation Time</th>
                      <th className="text-left px-5 py-3.5 font-bold" scope="col">Refund Amount</th>
                      <th className="text-left px-5 py-3.5 font-bold" scope="col">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {[
                      {
                        window: "Within 12 hours of ordering",
                        amount: "100% — Full refund",
                        time:   "1–2 business days",
                        stripe: false,
                      },
                      {
                        window: "12–24 hours (pre-dispatch)",
                        amount: "90% — 10% preparation fee deducted",
                        time:   "2–3 business days",
                        stripe: true,
                      },
                      {
                        window: "After dispatch",
                        amount: "Not eligible for cancellation refund",
                        time:   "See Refund & Return Policy",
                        stripe: false,
                      },
                    ].map((row) => (
                      <tr
                        key={row.window}
                        className={row.stripe ? "bg-green-50/40" : "bg-white"}
                      >
                        <td className="px-5 py-3 font-semibold text-gray-800">{row.window}</td>
                        <td className="px-5 py-3 text-gray-600">{row.amount}</td>
                        <td className="px-5 py-3 text-gray-500">{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <InfoBox icon={CreditCard} color="green">
                  <strong>Refund method:</strong> Refunds are always returned to the original
                  payment method used at checkout — credit card, debit card, or PayPal. We do not
                  issue cash refunds.
                </InfoBox>
                <InfoBox icon={Clock} color="teal">
                  <strong>Bank processing:</strong> Once we initiate the refund, your bank may
                  take an additional 3–5 business days to post the funds. Contact your bank if
                  you haven't seen the credit after 10 business days.
                </InfoBox>
              </div>

              <p className="text-sm text-gray-600">
                You will receive an email notification when your refund is initiated, including the
                exact amount and the last four digits of the payment method credited. Please keep
                this email for your records.
              </p>
            </PolicySection>

            {/* ── 6 · Fees & Charges ────────────────────────────────────── */}
            <PolicySection
              id="fees"
              icon={BadgeDollarSign}
              eyebrow="Charges"
              title="Fees &amp; Charges"
              accent
            >
              <p>
                We aim to make cancellations as straightforward and cost-free as possible. Most
                cancellations within our free window attract zero fees. Below is a complete
                breakdown of all applicable charges.
              </p>

              <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-md shadow-green-50 divide-y divide-green-50 mt-2">
                <FeeRow
                  label="Cancellation within 12 hours"
                  value="Free"
                  note="No deductions — 100% refund guaranteed"
                />
                <FeeRow
                  label="Preparation &amp; handling fee (12–24 hours)"
                  value="10% of order total"
                  note="Applied when order preparation has already commenced"
                  highlight
                />
                <FeeRow
                  label="Cancellation after dispatch"
                  value="Not applicable"
                  note="Cancellations are not available once an order is dispatched"
                />
                <FeeRow
                  label="Payment processing reversal fee"
                  value="None"
                  note="We absorb all third-party payment reversal costs"
                />
                <FeeRow
                  label="Custom / bespoke order cancellation"
                  value="Up to 50% of order"
                  note="Varies depending on production stage — contact us for a quote"
                  highlight
                />
              </div>

              <InfoBox icon={ShieldCheck} color="green">
                <strong>Our commitment:</strong> We will never charge a cancellation fee without
                your prior knowledge. Any applicable fee will be communicated clearly in our
                cancellation confirmation email before the refund is processed, giving you the
                opportunity to proceed or reconsider.
              </InfoBox>

              <p className="text-sm text-gray-600">
                All fees are quoted in USD and inclusive of any applicable taxes. {COMPANY_NAME}
                reserves the right to update its fee schedule with 30 days' notice. Changes will
                not apply retroactively to orders already placed.
              </p>
            </PolicySection>

            {/* ── 7 · Contact ───────────────────────────────────────────── */}
            <PolicySection
              id="contact"
              icon={Mail}
              eyebrow="Get in Touch"
              title="Contact Us"
            >
              <p>
                Our support team is on hand Monday–Friday, 9 AM–6 PM PST to handle all
                cancellation requests. We aim to respond within{" "}
                <strong className="text-gray-900">2–4 hours</strong> during business hours.
                For urgent requests, please call us directly.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    icon:  Mail,
                    label: "Email Support",
                    value: CONTACT_EMAIL,
                    href:  `mailto:${CONTACT_EMAIL}`,
                    sub:   "Best for non-urgent enquiries",
                  },
                  {
                    icon:  Phone,
                    label: "Phone Support",
                    value: CONTACT_PHONE,
                    href:  `tel:${CONTACT_PHONE.replace(/\D/g, "")}`,
                    sub:   "Mon–Fri, 9 AM–6 PM PST",
                  },
                ].map(({ icon: Icon, label, value, href, sub }) => (
                  <a
                    key={label}
                    href={href}
                    className="group flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 hover:border-green-300 hover:shadow-md hover:shadow-green-100 transition-all duration-300"
                    aria-label={`${label}: ${value}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                      <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-0.5">
                        {label}
                      </p>
                      <p className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors text-sm break-all">
                        {value}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* What to include in your request */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 p-5 mt-2">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-green-600" aria-hidden="true" />
                  What to include in your cancellation request
                </h3>
                <BulletList
                  items={[
                    "Your full name and email address used at checkout",
                    "Order number (found in your confirmation email)",
                    "Item(s) you wish to cancel",
                    "Reason for cancellation (helps us improve)",
                    "Preferred resolution: full refund or store credit",
                  ]}
                />
              </div>

              {/* Mailing address */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 p-5">
                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" aria-hidden="true" />
                  Registered Address
                </p>
                <address className="not-italic text-sm text-gray-600 leading-relaxed">
                  {COMPANY_NAME} Customer Support<br />
                  123 Greenhouse Lane, Garden District<br />
                  San Francisco, CA 94102<br />
                  United States
                </address>
              </div>
            </PolicySection>

            {/* ── Related policies navigation ──────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  to:    "/refund-return-policy",
                  icon:  CalendarX,
                  label: "Refund & Return Policy",
                  sub:   "Returns, refunds, and replacements",
                },
                {
                  to:    "/privacy-policy",
                  icon:  ShieldCheck,
                  label: "Privacy Policy",
                  sub:   "How we handle your personal data",
                },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-green-100 shadow-md shadow-green-50 hover:shadow-lg hover:shadow-green-100/60 hover:border-green-300 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm group-hover:text-green-700 transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all duration-200"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            {/* ── CTA Banner ──────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-green-200 print:hidden">
              <div
                className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none"
                aria-hidden="true"
              >
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="white" d="M100,10 Q170,50 160,120 Q150,190 80,180 Q10,170 20,100 Q30,30 100,10Z" />
                </svg>
              </div>
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold text-white leading-tight mb-1">
                    Need to cancel an order?
                  </h2>
                  <p className="text-teal-100 text-sm leading-relaxed">
                    Our plant care specialists are ready to help. Contact us immediately for the
                    best chance of a smooth, fee-free cancellation. 🌿
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group bg-white text-green-700 hover:bg-green-50 py-3 px-7 rounded-full font-bold text-sm transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    aria-label="Email our support team"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    Email Support
                  </a>
                  <a
                    href={`tel:${CONTACT_PHONE.replace(/\D/g, "")}`}
                    className="border-2 border-white/40 text-white hover:bg-white/10 py-3 px-7 rounded-full font-bold text-sm transition duration-300 text-center flex items-center justify-center gap-2"
                    aria-label="Call our support team"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Call Us
                  </a>
                </div>
              </div>
            </div>

            {/* Last updated note */}
            <p className="text-xs text-center text-gray-400 pb-4">
              This Cancellation Policy was last updated on{" "}
              <time dateTime="2026-04-06" className="font-semibold text-gray-500">
                {LAST_UPDATED}
              </time>
              . Previous versions are available upon request by contacting{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-green-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>

          </div>{/* end content */}
        </div>{/* end flex */}
      </main>

      {/* ── Mobile bottom TOC ───────────────────────────────────────────────── */}
      <nav
        className="lg:hidden bg-white border-t border-green-100 shadow-lg px-4 py-3 sticky bottom-0 z-40 overflow-x-auto print:hidden"
        aria-label="Mobile section navigation"
      >
        <div className="flex gap-2 w-max mx-auto">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                aria-current={isActive ? "location" : undefined}
                className={[
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                    : "bg-green-50 text-green-700 hover:bg-green-100",
                ].join(" ")}
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Scroll to top FAB ───────────────────────────────────────────────── */}
      <button
        onClick={scrollToTop}
        className={[
          "fixed bottom-20 lg:bottom-8 right-6 z-50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 rounded-full shadow-lg shadow-green-300",
          "hover:shadow-xl hover:shadow-green-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300",
          showScrollTop ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none",
        ].join(" ")}
        aria-label="Scroll to top"
        tabIndex={showScrollTop ? 0 : -1}
      >
        <ChevronUp className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default CancellationPolicy;