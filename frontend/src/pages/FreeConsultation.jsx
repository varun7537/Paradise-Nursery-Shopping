// src/pages/FreeConsultation.jsx
// ✅ Design unchanged — no modifications needed here
import React from "react";
import ConsultationForm from "../components/ConsultationForm";

const FreeConsultation = () => {
  return (
    <div>
      <header className="bg-green-500 text-white py-10 text-center">
        <h1 className="text-4xl font-bold">Get Your Free Consultation</h1>
        <p className="mt-2 text-lg">
          Fill out the form below, and we'll get in touch with you soon!
        </p>
      </header>
      <main className="py-10">
        <ConsultationForm />
      </main>
    </div>
  );
};

export default FreeConsultation;