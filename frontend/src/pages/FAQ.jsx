import React, { useState } from "react";

const FAQ = () => {
  const faqs = [
    {
      question: "What is Paradise Nursery?",
      answer:
        "Paradise Nursery is your one-stop destination for all types of plants, gardening tools, and free gardening consultations.",
    },
    {
      question: "Do you offer free delivery?",
      answer:
        "Yes, we offer free delivery on all orders above ₹500 within our service areas.",
    },
    {
      question: "How can I request free gardening consultation?",
      answer:
        "You can request a free consultation by visiting the 'Free Consultation' page on our website and filling out the form.",
    },
    {
      question: "What are your payment options?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, and cash on delivery for your convenience.",
    },
    {
      question: "Can I return or replace a plant if it arrives damaged?",
      answer:
        "Yes, we have a hassle-free return policy. Please contact us within 48 hours of delivery for returns or replacements.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <header className="bg-green-500 text-white py-10 text-center">
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-2 text-lg">
          Have questions? We've got answers!
        </p>
      </header>

      <main className="py-10 px-6 lg:px-20">
        <section className="space-y-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-100 border border-gray-300 rounded-lg shadow-sm"
            >
              <button
                className="w-full text-left p-4 flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-medium text-gray-800">
                  {faq.question}
                </h3>
                <span
                  className={`text-gray-600 text-xl transform ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {activeIndex === index && (
                <div className="p-4 text-gray-700 border-t border-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default FAQ;
