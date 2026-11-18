import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Info,
  Database,
  Settings,
  Share2,
  Cookie,
  UserCheck,
  Mail,
  Calendar,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Eye,
  Lock,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronUp,
  Leaf,
  AlertCircle,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LAST_UPDATED = "April 6, 2026";
const CONTACT_EMAIL = "privacy@paradisenursery.com";
const COMPANY_NAME = "Paradise Nursery";

const SECTIONS = [
  { id: "introduction",   label: "Introduction",          icon: Info },
  { id: "data-collected", label: "Information We Collect", icon: Database },
  { id: "data-use",       label: "How We Use Information", icon: Settings },
  { id: "data-sharing",   label: "Data Sharing & Security",icon: Share2 },
  { id: "cookies",        label: "Cookies Policy",         icon: Cookie },
  { id: "user-rights",    label: "Your Rights",            icon: UserCheck },
  { id: "contact",        label: "Contact Us",             icon: Mail },
];

// ─── Reusable section wrapper ─────────────────────────────────────────────────

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
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-green-200">
          <Icon className="w-5 h-5 text-white" aria-hidden="true" />
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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-green-200 via-teal-100 to-transparent mb-6" />

      <div className="text-gray-700 leading-relaxed space-y-4 text-[15px]">
        {children}
      </div>
    </section>
  );
}

// ─── Highlight box (used inside sections) ────────────────────────────────────

function InfoBox({ icon: Icon = AlertCircle, color = "green", children }) {
  const palette = {
    green: { wrap: "bg-green-50 border-green-200", icon: "text-green-600", text: "text-green-800" },
    teal:  { wrap: "bg-teal-50  border-teal-200",  icon: "text-teal-600",  text: "text-teal-800"  },
    amber: { wrap: "bg-amber-50 border-amber-200", icon: "text-amber-600", text: "text-amber-800" },
  };
  const p = palette[color] ?? palette.green;
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${p.wrap}`} role="note">
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${p.icon}`} aria-hidden="true" />
      <p className={`text-sm leading-relaxed ${p.text}`}>{children}</p>
    </div>
  );
}

// ─── Bullet list (styled) ─────────────────────────────────────────────────────

function BulletList({ items }) {
  return (
    <ul className="space-y-2" role="list">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mt-0.5">
            <ChevronRight className="w-3 h-3 text-white" aria-hidden="true" />
          </span>
          <span className="text-gray-700 text-[15px] leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Right-column card (used inside sections for sub-categories) ──────────────

function DataCard({ icon: Icon, title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-md shadow-green-50 hover:shadow-lg hover:shadow-green-100/60 transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3 text-base">
        <Icon className="w-4 h-4 text-green-600" aria-hidden="true" />
        {title}
      </h3>
      <BulletList items={items} />
    </div>
  );
}

// ─── User rights card ─────────────────────────────────────────────────────────

function RightCard({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-green-100 p-5 shadow-md shadow-green-50 hover:shadow-lg hover:shadow-green-100/60 hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        <Icon className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Sticky Table of Contents ─────────────────────────────────────────────────

function TableOfContents({ activeSection }) {
  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white rounded-3xl shadow-xl shadow-green-100/60 border border-green-50 p-6 sticky top-24"
    >
      {/* TOC header */}
      <div className="flex items-center gap-2 mb-5">
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
                className={[
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-green-200"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                ].join(" ")}
                aria-current={isActive ? "location" : undefined}
              >
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-green-500"}`}
                  aria-hidden="true"
                />
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Decorative divider */}
      <div className="h-px bg-gradient-to-r from-green-200 to-transparent mt-5 mb-4" />

      {/* Last updated */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Calendar className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
        Updated {LAST_UPDATED}
      </div>
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const observerRef = useRef(null);

  // Intersection Observer — highlight active TOC entry
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

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 relative overflow-hidden">
        {/* Decorative botanical shapes */}
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none select-none" aria-hidden="true">
          <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="white" d="M200,20 Q280,80 260,160 Q240,240 150,220 Q60,200 80,120 Q100,40 200,20Z" />
            <path fill="white" d="M260,10 Q310,60 290,130 Q270,200 200,180 Q130,160 150,90 Q170,20 260,10Z" opacity="0.5"/>
          </svg>
        </div>
        <div className="absolute left-0 bottom-0 w-48 h-48 opacity-5 pointer-events-none select-none" aria-hidden="true">
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
                <Shield className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-teal-100 text-sm font-semibold uppercase tracking-widest mb-1">
                  Legal · Privacy
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Privacy Policy
                </h1>
                <p className="text-teal-100 mt-2 text-base md:text-lg max-w-xl">
                  We respect your privacy and are committed to protecting your personal data. Here's everything you need to know. 🌿
                </p>
              </div>
            </div>

            {/* Last updated badge */}
            <div className="flex-shrink-0 bg-white/15 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-2.5 self-start md:self-auto">
              <Calendar className="w-4 h-4 text-teal-100" aria-hidden="true" />
              <div>
                <p className="text-xs text-teal-200 font-medium">Last Updated</p>
                <p className="text-white font-bold text-sm">{LAST_UPDATED}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sticky TOC sidebar ─────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="Page navigation">
            <TableOfContents activeSection={activeSection} />
          </aside>

          {/* ── Policy content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* 1 · Introduction */}
            <PolicySection
              id="introduction"
              icon={Info}
              eyebrow="Overview"
              title="Introduction"
            >
              <p>
                Welcome to <strong className="text-gray-900">{COMPANY_NAME}</strong>. We are committed
                to protecting your personal information and your right to privacy. This Privacy Policy
                explains what information we collect, how we use it, and what rights you have in relation
                to it.
              </p>
              <p>
                By using our website and services, you agree to the collection and use of information in
                accordance with this policy. If you disagree with any part of this policy, please
                discontinue use of our services.
              </p>
              <InfoBox icon={Leaf} color="green">
                This policy applies to all information collected through our website, mobile application,
                and any related services, sales, marketing, or events.
              </InfoBox>
              <p>
                We encourage you to read this policy carefully so you can make an informed decision about
                sharing your personal information with us. If you have questions or concerns, please{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-green-600 font-semibold hover:text-teal-600 transition-colors underline underline-offset-2"
                >
                  contact us
                </a>
                .
              </p>
            </PolicySection>

            {/* 2 · Information We Collect */}
            <PolicySection
              id="data-collected"
              icon={Database}
              eyebrow="Data Collection"
              title="Information We Collect"
              accent
            >
              <p>
                We collect information you provide directly to us, as well as information gathered
                automatically when you use our services.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <DataCard
                  icon={UserCheck}
                  title="Personal Information"
                  items={[
                    "Full name and display name",
                    "Email address",
                    "Phone number",
                    "Shipping and billing address",
                    "Payment information (processed securely)",
                    "Account credentials (hashed)",
                    "Order history and preferences",
                  ]}
                />
                <DataCard
                  icon={Eye}
                  title="Non-Personal Data"
                  items={[
                    "IP address and approximate location",
                    "Browser type and version",
                    "Device type and operating system",
                    "Pages visited and time spent",
                    "Referring website / traffic source",
                    "Cookie identifiers",
                    "Aggregated analytics data",
                  ]}
                />
              </div>
              <InfoBox icon={Lock} color="teal">
                We never collect sensitive data such as government IDs, health information, or financial
                account numbers beyond what is strictly necessary for payment processing.
              </InfoBox>
            </PolicySection>

            {/* 3 · How We Use Information */}
            <PolicySection
              id="data-use"
              icon={Settings}
              eyebrow="Data Usage"
              title="How We Use Your Information"
            >
              <p>
                We use the information we collect for specific, legitimate purposes outlined below.
                We do not use your data in ways that are incompatible with these purposes.
              </p>
              <div className="space-y-4 mt-2">
                {[
                  {
                    icon: CheckCircle,
                    title: "Order Processing & Fulfilment",
                    text: "To process your purchases, arrange delivery, send confirmation emails, and handle returns or refunds. This is essential for our service and cannot be opted out of while using our shop.",
                  },
                  {
                    icon: Mail,
                    title: "Customer Support",
                    text: "To respond to your enquiries, troubleshoot problems, and provide assistance. We may retain support communications to improve our services.",
                  },
                  {
                    icon: Leaf,
                    title: "Personalisation & Recommendations",
                    text: "To understand your plant preferences and suggest products, care guides, and content that may interest you — making your experience more relevant and enjoyable.",
                  },
                  {
                    icon: RefreshCw,
                    title: "Marketing Communications",
                    text: "With your explicit consent, we may send newsletters, promotions, and seasonal offers. You can unsubscribe at any time via the link in any email or through your account settings.",
                  },
                  {
                    icon: Settings,
                    title: "Service Improvement & Analytics",
                    text: "To understand how our website is used, identify bugs, improve performance, and develop new features. Analytics data is aggregated and anonymised where possible.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="flex gap-4 p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 hover:border-green-200 transition-colors"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-green-100 shadow-sm flex items-center justify-center">
                      <Icon className="w-4 h-4 text-green-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1 text-base">{title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PolicySection>

            {/* 4 · Data Sharing & Security */}
            <PolicySection
              id="data-sharing"
              icon={Share2}
              eyebrow="Security & Third Parties"
              title="Data Sharing & Security"
              accent
            >
              <p>
                We do not sell, rent, or trade your personal information to third parties. We may share
                your data only in the limited circumstances described below.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <DataCard
                  icon={ExternalLink}
                  title="Third-Party Services"
                  items={[
                    "Payment processors (Stripe, PayPal)",
                    "Shipping couriers (FedEx, UPS, DHL)",
                    "Email service providers (for transactional emails)",
                    "Analytics platforms (Google Analytics — anonymised)",
                    "Cloud hosting providers (AWS, Vercel)",
                  ]}
                />
                <DataCard
                  icon={Lock}
                  title="Security Measures"
                  items={[
                    "TLS/HTTPS encryption on all connections",
                    "Passwords hashed using bcrypt",
                    "Payment data handled by PCI-compliant processors",
                    "Regular security audits and penetration tests",
                    "Strict employee access controls",
                    "Data breach notification within 72 hours",
                  ]}
                />
              </div>
              <InfoBox icon={Shield} color="teal">
                All third-party partners are vetted to ensure they maintain appropriate data protection
                standards consistent with GDPR, CCPA, and applicable local regulations.
              </InfoBox>
              <p className="text-sm text-gray-600">
                We may also disclose your information if required by law, to protect the rights and
                safety of {COMPANY_NAME} or others, or in connection with a merger or acquisition (in
                which case you will be notified in advance).
              </p>
            </PolicySection>

            {/* 5 · Cookies Policy */}
            <PolicySection
              id="cookies"
              icon={Cookie}
              eyebrow="Cookies & Tracking"
              title="Cookies Policy"
            >
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience,
                remember your preferences, and understand how you interact with our site.
              </p>
              <div className="overflow-x-auto mt-2 -mx-1">
                <table
                  className="w-full text-sm rounded-2xl overflow-hidden border border-green-100"
                  role="table"
                  aria-label="Cookie types"
                >
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      <th className="text-left px-5 py-3 font-bold" scope="col">Type</th>
                      <th className="text-left px-5 py-3 font-bold" scope="col">Purpose</th>
                      <th className="text-left px-5 py-3 font-bold" scope="col">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {[
                      { type: "Essential",    purpose: "Authentication, cart, security",           duration: "Session / 1 year" },
                      { type: "Functional",   purpose: "Language, region, layout preferences",     duration: "1 year"          },
                      { type: "Analytics",    purpose: "Page views, traffic sources, performance", duration: "2 years"         },
                      { type: "Marketing",    purpose: "Personalised ads and remarketing",         duration: "90 days"         },
                    ].map((row, i) => (
                      <tr
                        key={row.type}
                        className={i % 2 === 0 ? "bg-white" : "bg-green-50/40"}
                      >
                        <td className="px-5 py-3 font-semibold text-gray-800">{row.type}</td>
                        <td className="px-5 py-3 text-gray-600">{row.purpose}</td>
                        <td className="px-5 py-3 text-gray-500">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600">
                You can control or disable cookies through your browser settings at any time. Note that
                disabling certain cookies may affect the functionality of our website. For marketing
                cookies, you can opt out via{" "}
                <a
                  href="https://optout.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold hover:text-teal-600 transition-colors underline underline-offset-2"
                >
                  aboutads.info
                </a>
                .
              </p>
              <InfoBox icon={Cookie} color="amber">
                We use a cookie consent banner to obtain your permission before setting non-essential
                cookies. You can change your preferences at any time from the cookie settings in the
                site footer.
              </InfoBox>
            </PolicySection>

            {/* 6 · User Rights */}
            <PolicySection
              id="user-rights"
              icon={UserCheck}
              eyebrow="Your Data Rights"
              title="Your Rights"
              accent
            >
              <p>
                Depending on your location, you may have the following rights regarding your personal
                data. We honour all verifiable requests within <strong className="text-gray-900">30 days</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <RightCard
                  icon={Eye}
                  title="Right to Access"
                  description="Request a copy of the personal data we hold about you, including how it is used and with whom it is shared."
                />
                <RightCard
                  icon={RefreshCw}
                  title="Right to Rectification"
                  description="Request correction of inaccurate or incomplete data. You can update most details directly from your account settings."
                />
                <RightCard
                  icon={Trash2}
                  title="Right to Erasure"
                  description="Request deletion of your personal data where it is no longer necessary for the purpose it was collected, subject to legal obligations."
                />
                <RightCard
                  icon={Lock}
                  title="Right to Object"
                  description="Object to the processing of your data for direct marketing or where processing is based on legitimate interests."
                />
                <RightCard
                  icon={Database}
                  title="Right to Portability"
                  description="Receive a machine-readable copy of your data so you can transfer it to another service provider."
                />
                <RightCard
                  icon={Shield}
                  title="Right to Restriction"
                  description="Request that we restrict processing of your data in certain circumstances, such as while we investigate a complaint."
                />
              </div>
              <InfoBox icon={Mail} color="green">
                To exercise any of these rights, contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-green-700 hover:text-teal-700 underline underline-offset-2 transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
                . We may need to verify your identity before processing your request.
              </InfoBox>
            </PolicySection>

            {/* 7 · Contact */}
            <PolicySection
              id="contact"
              icon={Mail}
              eyebrow="Get in Touch"
              title="Contact Us"
            >
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                your personal data, please do not hesitate to reach out. We aim to respond to all
                privacy-related enquiries within <strong className="text-gray-900">5 business days</strong>.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    icon: Mail,
                    label: "Privacy Enquiries",
                    value: CONTACT_EMAIL,
                    href: `mailto:${CONTACT_EMAIL}`,
                  },
                  {
                    icon: Shield,
                    label: "Data Protection Officer",
                    value: "dpo@paradisenursery.com",
                    href: "mailto:dpo@paradisenursery.com",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
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
                    </div>
                  </a>
                ))}
              </div>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 p-5 mt-2">
                <p className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" aria-hidden="true" />
                  Registered Address
                </p>
                <address className="not-italic text-sm text-gray-600 leading-relaxed">
                  {COMPANY_NAME} Inc.<br />
                  123 Greenhouse Lane, Garden District<br />
                  San Francisco, CA 94102<br />
                  United States
                </address>
              </div>
            </PolicySection>

            {/* ── Agree / Accept bar ──────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-green-200">
              {/* Botanical decoration */}
              <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none" aria-hidden="true">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path fill="white" d="M100,10 Q170,50 160,120 Q150,190 80,180 Q10,170 20,100 Q30,30 100,10Z" />
                </svg>
              </div>

              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold text-white leading-tight mb-1">
                    Do you accept our Privacy Policy?
                  </h2>
                  <p className="text-teal-100 text-sm leading-relaxed">
                    By clicking "I Agree", you acknowledge that you have read and understand our Privacy Policy
                    and consent to the use of your data as described above.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  {agreed ? (
                    <div className="flex items-center gap-2 bg-white/20 border border-white/30 text-white rounded-full py-3 px-6 font-bold text-sm">
                      <CheckCircle className="w-5 h-5" aria-hidden="true" />
                      Accepted!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setAgreed(true)}
                        className="bg-white text-green-700 hover:bg-green-50 py-3 px-7 rounded-full font-bold text-sm transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        aria-label="Accept Privacy Policy"
                      >
                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                        I Agree
                      </button>
                      <Link
                        to="/"
                        className="border-2 border-white/40 text-white hover:bg-white/10 py-3 px-7 rounded-full font-bold text-sm transition duration-300 text-center"
                        aria-label="Decline and go back to home"
                      >
                        Decline
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Last updated footer note ────────────────────────────────── */}
            <p className="text-xs text-center text-gray-400 pb-4">
              This Privacy Policy was last updated on{" "}
              <time dateTime="2026-04-06" className="font-semibold text-gray-500">
                {LAST_UPDATED}
              </time>
              . Previous versions are available upon request.
            </p>

          </div>{/* end content */}
        </div>{/* end grid */}
      </main>

      {/* ── Mobile TOC (bottom sheet style) ────────────────────────────────── */}
      <nav
        className="lg:hidden bg-white border-t border-green-100 shadow-lg px-4 py-3 sticky bottom-0 z-40 overflow-x-auto"
        aria-label="Mobile section navigation"
      >
        <div className="flex gap-2 w-max mx-auto">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                className={[
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                    : "bg-green-50 text-green-700 hover:bg-green-100",
                ].join(" ")}
                aria-current={isActive ? "location" : undefined}
              >
                <Icon className="w-3 h-3" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Scroll to top ───────────────────────────────────────────────────── */}
      <button
        onClick={scrollToTop}
        className={[
          "fixed bottom-20 lg:bottom-8 right-6 z-50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 rounded-full shadow-lg shadow-green-300",
          "hover:shadow-xl hover:shadow-green-300 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
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

export default PrivacyPolicy;