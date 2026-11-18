import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCcw,
  Info,
  CheckCircle,
  XCircle,
  CreditCard,
  Repeat2,
  CalendarX,
  Truck,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  ChevronUp,
  ChevronRight,
  Leaf,
  Clock,
  PackageX,
  PackageCheck,
  Printer,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const LAST_UPDATED   = "April 6, 2026";
const CONTACT_EMAIL  = "support@paradisenursery.com";
const CONTACT_PHONE  = "+1 (800) 555-0199";
const COMPANY_NAME   = "Paradise Nursery";

const SECTIONS = [
  { id: "introduction",    label: "Introduction",        icon: Info         },
  { id: "eligibility",     label: "Return Eligibility",  icon: CheckCircle  },
  { id: "non-returnable",  label: "Non-Returnable",      icon: XCircle      },
  { id: "refund-process",  label: "Refund Process",      icon: CreditCard   },
  { id: "replacement",     label: "Replacement Policy",  icon: Repeat2      },
  { id: "cancellation",    label: "Cancellation",        icon: CalendarX    },
  { id: "shipping-costs",  label: "Shipping & Costs",    icon: Truck        },
  { id: "damaged",         label: "Damaged Products",    icon: AlertTriangle},
  { id: "contact",         label: "Contact Us",          icon: Mail         },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Gradient section divider */
const Divider = () => (
  <div className="h-px bg-gradient-to-r from-green-200 via-teal-100 to-transparent mb-7 mt-1" />
);

/** Branded bullet list */
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

/** Contextual info / callout box */
function InfoBox({ icon: Icon = Info, color = "green", children }) {
  const palette = {
    green: { wrap: "bg-green-50  border-green-200",  icon: "text-green-600",  text: "text-green-800"  },
    teal:  { wrap: "bg-teal-50   border-teal-200",   icon: "text-teal-600",   text: "text-teal-800"   },
    amber: { wrap: "bg-amber-50  border-amber-200",  icon: "text-amber-600",  text: "text-amber-800"  },
    red:   { wrap: "bg-red-50    border-red-200",    icon: "text-red-500",    text: "text-red-800"    },
  };
  const p = palette[color] ?? palette.green;
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${p.wrap}`} role="note">
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${p.icon}`} aria-hidden="true" />
      <p className={`text-sm leading-relaxed ${p.text}`}>{children}</p>
    </div>
  );
}

/** Numbered process step */
function StepCard({ step, icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-green-100 p-5 shadow-md shadow-green-50 hover:shadow-lg hover:shadow-green-100/60 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm text-white font-extrabold text-sm">
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

/** Feature badge card (icon + label + sublabel) */
function BadgeCard({ icon: Icon, label, sublabel, color = "green" }) {
  const bg = {
    green: "from-green-50 to-teal-50 border-green-100",
    amber: "from-amber-50 to-orange-50 border-amber-100",
    red:   "from-red-50 to-rose-50 border-red-100",
  }[color] ?? "from-green-50 to-teal-50 border-green-100";

  return (
    <div className={`flex flex-col items-center text-center gap-3 rounded-2xl border bg-gradient-to-br p-6 ${bg}`}>
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-green-200">
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div>
        <p className="font-extrabold text-gray-800 text-lg leading-tight">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Policy Section wrapper ───────────────────────────────────────────────────

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
      {/* Header */}
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
      {/* TOC header */}
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

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
        <Calendar className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
        <span>Updated {LAST_UPDATED}</span>
      </div>

      {/* Print button */}
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

// ─── Main Component ───────────────────────────────────────────────────────────

const RefundReturnPolicy = () => {
  const [activeSection, setActiveSection]   = useState("introduction");
  const [showScrollTop, setShowScrollTop]   = useState(false);
  const observerRef = useRef(null);

  /* IntersectionObserver — active TOC highlight */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 print:bg-white">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 relative overflow-hidden print:hidden">
        {/* Botanical SVG decorations */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none select-none" aria-hidden="true">
          <svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="white" d="M200,15 Q285,75 265,165 Q245,255 150,235 Q55,215 75,125 Q95,35 200,15Z"/>
            <path fill="white" d="M255,5 Q315,55 295,135 Q275,215 195,195 Q115,175 135,95 Q155,15 255,5Z" opacity="0.45"/>
          </svg>
        </div>
        <div className="absolute left-0 bottom-0 w-52 h-52 opacity-5 pointer-events-none select-none" aria-hidden="true">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="white"/>
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
            <div className="flex items-start gap-5">
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex-shrink-0 shadow-lg">
                <RefreshCcw className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-teal-100 text-sm font-semibold uppercase tracking-widest mb-1">
                  Legal · Returns
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Refund &amp; Return<br className="hidden sm:block"/> Policy
                </h1>
                <p className="text-teal-100 mt-2 text-base md:text-lg max-w-xl">
                  We stand behind every plant we ship. If something isn't right,
                  we'll make it right. 🌿
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

          {/* Quick-stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[
              { icon: Clock,         label: "30-Day",      sub: "Return window"      },
              { icon: CreditCard,    label: "5–7 Days",    sub: "Refund processing"  },
              { icon: PackageCheck,  label: "Free",        sub: "Return shipping"    },
              { icon: PackageX,      label: "24 Hours",    sub: "Damage reporting"   },
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

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16 print:py-4 print:px-0">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sticky TOC sidebar ────────────────────────────────────────── */}
          <aside
            className="hidden lg:block w-64 flex-shrink-0 print:hidden"
            aria-label="Page navigation"
          >
            <TableOfContents activeSection={activeSection} />
          </aside>

          {/* ── Policy content ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* 1 · Introduction */}
            <PolicySection
              id="introduction"
              icon={Info}
              eyebrow="Overview"
              title="Introduction"
            >
              <p>
                At <strong className="text-gray-900">{COMPANY_NAME}</strong>, every plant is
                carefully packed and inspected before it leaves our greenhouse. We know, however,
                that things don't always go as planned — plants are living things, and transit can
                be unpredictable.
              </p>
              <p>
                This policy explains your rights when something goes wrong, what we can replace or
                refund, and how to get in touch with our support team. We aim to make every
                experience with us a positive one.
              </p>
              <InfoBox icon={Leaf} color="green">
                This policy applies to all purchases made through our website. For wholesale or
                B2B orders, please refer to your individual sales agreement or contact us directly.
              </InfoBox>
              <p>
                By placing an order with {COMPANY_NAME}, you agree to the terms outlined in this
                Refund &amp; Return Policy. If you have any questions before purchasing, please{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-green-600 font-semibold hover:text-teal-600 transition-colors underline underline-offset-2"
                >
                  reach out to our team
                </a>{" "}
                — we're happy to help.
              </p>
            </PolicySection>

            {/* 2 · Return Eligibility */}
            <PolicySection
              id="eligibility"
              icon={CheckCircle}
              eyebrow="Conditions"
              title="Return Eligibility"
              accent
            >
              <p>
                We accept returns within <strong className="text-gray-900">30 days</strong> of the
                confirmed delivery date, subject to the following conditions being met.
              </p>

              {/* Quick badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <BadgeCard icon={Clock}        label="30 Days"  sublabel="Return window from delivery" />
                <BadgeCard icon={PackageCheck} label="Unused"   sublabel="Item in original condition"  />
                <BadgeCard icon={Leaf}         label="Healthy"  sublabel="Plant alive at time of return"/>
              </div>

              <p className="font-semibold text-gray-800">
                To be eligible for a return, all of the following must apply:
              </p>
              <BulletList
                items={[
                  "The item must have been purchased directly from paradisenursery.com.",
                  "The return request is initiated within 30 days of the delivery date.",
                  "The plant is in a reasonably healthy condition (normal care should have been provided).",
                  "Original packaging, pot, and any accessories are included where possible.",
                  "You have proof of purchase (order number or confirmation email).",
                  "The item has not been repotted, significantly pruned, or chemically treated.",
                ]}
              />
              <InfoBox icon={Clock} color="teal">
                Requests received after 30 days of delivery will not be eligible for a refund or
                exchange, except in cases of proven transit damage or a genuine quality defect. We
                recommend inspecting all plants within 48 hours of arrival.
              </InfoBox>
            </PolicySection>

            {/* 3 · Non-Returnable Items */}
            <PolicySection
              id="non-returnable"
              icon={XCircle}
              eyebrow="Exclusions"
              title="Non-Returnable Items"
            >
              <p>
                Due to the perishable nature of live plants and hygiene considerations, certain
                items cannot be returned under any circumstances.
              </p>
              <InfoBox icon={XCircle} color="red">
                Attempting to return a non-returnable item will result in the item being sent back
                to you at your expense. Please read the list carefully before initiating a return.
              </InfoBox>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-md shadow-red-50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-base">
                    <PackageX className="w-4 h-4 text-red-500" aria-hidden="true" />
                    Non-Returnable Products
                  </h3>
                  <BulletList
                    items={[
                      "Live plants that have been repotted or replanted",
                      "Seeds and bulbs once packaging is opened",
                      "Cut flowers and perishable floral arrangements",
                      "Soil, fertiliser, and chemical products once opened",
                      "Custom or made-to-order plant arrangements",
                      "Digital products (care guides, e-books)",
                      "Gift cards and store credit vouchers",
                    ]}
                  />
                </div>
                <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-md shadow-amber-50">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-base">
                    <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    Conditionally Non-Returnable
                  </h3>
                  <BulletList
                    items={[
                      "Plants showing obvious neglect or improper care",
                      "Items marked clearly as 'Final Sale' at time of purchase",
                      "Clearance or heavily discounted sale items",
                      "Plants purchased more than 30 days before return request",
                      "Products without original receipt or order proof",
                      "Items damaged due to customer mishandling or accident",
                    ]}
                  />
                </div>
              </div>
            </PolicySection>

            {/* 4 · Refund Process */}
            <PolicySection
              id="refund-process"
              icon={CreditCard}
              eyebrow="How It Works"
              title="Refund Process"
              accent
            >
              <p>
                Once your return is approved, we will process your refund promptly. Follow the
                steps below to initiate a return and receive your refund.
              </p>
              <div className="space-y-3 mt-2">
                <StepCard
                  step="01"
                  icon={Mail}
                  title="Contact Our Support Team"
                  description={`Email us at ${CONTACT_EMAIL} with your order number, the item(s) you wish to return, and the reason for your return. Include photos if the issue is damage or quality-related.`}
                />
                <StepCard
                  step="02"
                  icon={CheckCircle}
                  title="Receive Return Authorisation"
                  description="Our team will review your request within 2 business days and email you a Return Merchandise Authorisation (RMA) number along with return instructions."
                />
                <StepCard
                  step="03"
                  icon={Truck}
                  title="Ship the Item Back"
                  description="Pack the plant securely using the original packaging where possible. Attach the provided return label and drop the package at your nearest carrier location."
                />
                <StepCard
                  step="04"
                  icon={PackageCheck}
                  title="Item Inspection"
                  description="Once we receive your return, our team will inspect the item within 2 business days to confirm it meets our return eligibility criteria."
                />
                <StepCard
                  step="05"
                  icon={CreditCard}
                  title="Refund Issued"
                  description="Approved refunds are issued to your original payment method within 5–7 business days. You'll receive an email confirmation once the refund is processed."
                />
              </div>
              <InfoBox icon={Clock} color="teal">
                <strong>Processing times:</strong> Refunds typically appear on your statement within
                5–7 business days after approval. Bank processing times may vary. If you haven't
                received your refund after 10 business days, please contact us.
              </InfoBox>
            </PolicySection>

            {/* 5 · Replacement Policy */}
            <PolicySection
              id="replacement"
              icon={Repeat2}
              eyebrow="Exchanges"
              title="Replacement Policy"
            >
              <p>
                In many cases, we prefer to send a replacement plant rather than issue a refund —
                ensuring you still get to enjoy the beauty of your chosen species. Replacements are
                available under the following conditions.
              </p>
              <BulletList
                items={[
                  "The original plant arrived dead or in critically poor health due to transit.",
                  "A verifiable quality defect is present (e.g., severe pest infestation at arrival).",
                  "The wrong plant or product was delivered.",
                  "The item was significantly different from its description on our website.",
                  "Replacement requests are made within 30 days of delivery.",
                ]}
              />
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <InfoBox icon={CheckCircle} color="green">
                  <strong>Same-item replacement:</strong> If the exact plant is available, we will
                  ship an identical replacement at no additional cost, including free expedited shipping.
                </InfoBox>
                <InfoBox icon={Repeat2} color="teal">
                  <strong>Alternative replacement:</strong> If the same plant is out of stock, we
                  will offer a comparable alternative or a full store credit valid for 12 months.
                </InfoBox>
              </div>
              <p className="text-sm text-gray-600">
                Replacements are processed within <strong className="text-gray-800">3–5 business days</strong> of
                approval and shipped with full tracking. We do not offer simultaneous refund and
                replacement for the same item.
              </p>
            </PolicySection>

            {/* 6 · Cancellation Policy */}
            <PolicySection
              id="cancellation"
              icon={CalendarX}
              eyebrow="Order Cancellations"
              title="Cancellation Policy"
              accent
            >
              <p>
                We understand that plans change. Our cancellation policy is designed to be as
                flexible as possible while accounting for the fact that we begin processing and
                preparing orders quickly.
              </p>
              <div className="space-y-3 mt-2">
                {[
                  {
                    icon: CheckCircle,
                    color: "text-green-600",
                    bg:    "bg-green-50 border-green-100",
                    title: "Within 12 Hours of Ordering — Full Refund",
                    text:  "Cancellations made within 12 hours of placing your order are fully refunded to your original payment method, no questions asked.",
                  },
                  {
                    icon: Clock,
                    color: "text-amber-500",
                    bg:    "bg-amber-50 border-amber-100",
                    title: "12–24 Hours — Partial Refund or Store Credit",
                    text:  "If your order is already being prepared, we may charge a 10% restocking/preparation fee. The remaining balance will be refunded or issued as store credit.",
                  },
                  {
                    icon: XCircle,
                    color: "text-red-500",
                    bg:    "bg-red-50 border-red-100",
                    title: "After 24 Hours / Once Dispatched — No Cancellation",
                    text:  "Orders that have already been dispatched cannot be cancelled. Once you receive the delivery, you may initiate a standard return if eligible.",
                  },
                ].map(({ icon: Icon, color, bg, title, text }) => (
                  <div
                    key={title}
                    className={`flex gap-4 p-5 rounded-2xl border ${bg}`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <InfoBox icon={CalendarX} color="amber">
                To cancel an order, contact us immediately at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-amber-700 underline underline-offset-2 hover:text-teal-700 transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                with your order number. We process cancellations in the order they are received.
              </InfoBox>
            </PolicySection>

            {/* 7 · Shipping & Return Costs */}
            <PolicySection
              id="shipping-costs"
              icon={Truck}
              eyebrow="Shipping Charges"
              title="Shipping &amp; Return Costs"
            >
              <p>
                We try to make returns as painless as possible. Here's a clear breakdown of who
                covers shipping costs in each scenario.
              </p>
              <div className="overflow-x-auto -mx-1 mt-2">
                <table
                  className="w-full text-sm rounded-2xl overflow-hidden border border-green-100"
                  role="table"
                  aria-label="Shipping cost responsibility"
                >
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      <th className="text-left px-5 py-3.5 font-bold" scope="col">Scenario</th>
                      <th className="text-left px-5 py-3.5 font-bold" scope="col">Return Shipping</th>
                      <th className="text-left px-5 py-3.5 font-bold" scope="col">Replacement Shipping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {[
                      { scenario: "Arrived dead / severely damaged",  ret: "We cover (free label provided)", rep: "We cover (free)"   },
                      { scenario: "Wrong item sent",                  ret: "We cover (free label provided)", rep: "We cover (free)"   },
                      { scenario: "Change of mind return",            ret: "Customer pays",                  rep: "N/A — refund only" },
                      { scenario: "Quality issue (verified)",         ret: "We cover (free label provided)", rep: "We cover (free)"   },
                      { scenario: "Damaged by customer",              ret: "Customer pays",                  rep: "Not eligible"      },
                    ].map((row, i) => (
                      <tr key={row.scenario} className={i % 2 === 0 ? "bg-white" : "bg-green-50/40"}>
                        <td className="px-5 py-3 font-semibold text-gray-800">{row.scenario}</td>
                        <td className="px-5 py-3 text-gray-600">{row.ret}</td>
                        <td className="px-5 py-3 text-gray-500">{row.rep}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <InfoBox icon={Truck} color="green">
                For approved returns, a prepaid return label will be emailed to you. Please use
                only the provided label — we cannot reimburse independently purchased postage.
              </InfoBox>
            </PolicySection>

            {/* 8 · Damaged or Defective Products */}
            <PolicySection
              id="damaged"
              icon={AlertTriangle}
              eyebrow="Damage Claims"
              title="Damaged or Defective Products"
              accent
            >
              <p>
                Plants are living organisms and can sometimes suffer during transit. If your order
                arrives damaged or not as expected, please follow the steps below immediately.
              </p>
              <InfoBox icon={Clock} color="amber">
                <strong>Important:</strong> All damage claims must be reported within{" "}
                <strong>24 hours of delivery</strong>. Claims submitted after this window may not
                be accepted, as it becomes difficult to distinguish transit damage from improper
                care after 24 hours.
              </InfoBox>
              <div className="space-y-3 mt-2">
                <StepCard
                  step="01"
                  icon={Camera}
                  title="Document the Damage Immediately"
                  description="Take clear photographs of the damaged plant, packaging, and any visible delivery labels. These photos are essential for processing your claim."
                />
                <StepCard
                  step="02"
                  icon={Mail}
                  title="Email Us Within 24 Hours"
                  description={`Send your order number, photos, and a brief description of the damage to ${CONTACT_EMAIL}. We will respond within 1 business day.`}
                />
                <StepCard
                  step="03"
                  icon={CheckCircle}
                  title="Claim Review & Resolution"
                  description="Our team will assess your claim and offer an appropriate resolution — typically a free replacement, store credit, or a full refund — within 2 business days."
                />
              </div>
              <p className="text-sm text-gray-600">
                We may also ask you to return the damaged item for quality control purposes. If so,
                a prepaid return label will be provided. Your resolution will not be delayed pending
                the return of the damaged plant.
              </p>
            </PolicySection>

            {/* 9 · Contact */}
            <PolicySection
              id="contact"
              icon={Mail}
              eyebrow="Get in Touch"
              title="Contact Us"
            >
              <p>
                Our support team is available Monday–Friday, 9 AM–6 PM (PST). We aim to respond
                to all return and refund enquiries within{" "}
                <strong className="text-gray-900">1–2 business days</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    icon: Mail,
                    label: "Email Support",
                    value: CONTACT_EMAIL,
                    href:  `mailto:${CONTACT_EMAIL}`,
                    sub:   "Fastest response channel",
                  },
                  {
                    icon: Phone,
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

              {/* Mailing address */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 p-5">
                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" aria-hidden="true" />
                  Returns Mailing Address
                </p>
                <address className="not-italic text-sm text-gray-600 leading-relaxed">
                  {COMPANY_NAME} Returns Department<br />
                  123 Greenhouse Lane, Garden District<br />
                  San Francisco, CA 94102<br />
                  United States
                </address>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-3">
                  ⚠️ Do not ship returns to this address without a valid RMA number — unauthorised
                  returns will not be processed and cannot be returned to sender.
                </p>
              </div>
            </PolicySection>

            {/* ── CTA Banner ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-green-200 print:hidden">
              <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none" aria-hidden="true">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="white" d="M100,10 Q170,50 160,120 Q150,190 80,180 Q10,170 20,100 Q30,30 100,10Z"/>
                </svg>
              </div>
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold text-white leading-tight mb-1">
                    Still have questions?
                  </h2>
                  <p className="text-teal-100 text-sm leading-relaxed">
                    Our plant care specialists are on hand to help you navigate any return, refund,
                    or replacement — no stress, no fuss. 🌿
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group bg-white text-green-700 hover:bg-green-50 py-3 px-7 rounded-full font-bold text-sm transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    aria-label="Contact support via email"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    Email Support
                  </a>
                  <Link
                    to="/freeconsultation"
                    className="border-2 border-white/40 text-white hover:bg-white/10 py-3 px-7 rounded-full font-bold text-sm transition duration-300 text-center flex items-center justify-center gap-2"
                  >
                    Free Consultation
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Last updated footer note */}
            <p className="text-xs text-center text-gray-400 pb-4">
              This Refund &amp; Return Policy was last updated on{" "}
              <time dateTime="2026-04-06" className="font-semibold text-gray-500">
                {LAST_UPDATED}
              </time>
              . Previous versions are available upon request by contacting{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>

          </div>
        </div>
      </main>

      {/* ── Mobile bottom TOC ─────────────────────────────────────────────── */}
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

      {/* ── Scroll to top FAB ─────────────────────────────────────────────── */}
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

// Inline stub for Camera icon (lucide doesn't export it by default in older installs)
function Camera({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

export default RefundReturnPolicy;