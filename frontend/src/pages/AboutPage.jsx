import React from "react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <motion.header 
        className="relative bg-green-600 text-white py-16 text-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-[url('https://media.istockphoto.com/id/1369508879/photo/woman-working-in-plant-flower-shop.jpg?s=1024x1024&w=is&k=20&c=bDR-IVtrP2mszW_h-fW8iTUdpI9gNMHjVzVa_AtwcIk=')] opacity-20"/>
        <div className="relative z-10">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Paradise Nursery
          </motion.h1>
          <motion.p 
            className="text-xl max-w-2xl mx-auto"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Learn more about us and how we bring nature closer to you.
          </motion.p>
        </div>
      </motion.header>

      <main className="py-16 px-6 lg:px-20 max-w-7xl mx-auto">
        <motion.section 
          className="mb-16"
          {...fadeIn}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg text-center max-w-4xl mx-auto">
            At Paradise Nursery, our mission is to make the world greener, one plant at a time. 
            We are dedicated to providing high-quality plants, gardening supplies, and expert 
            advice to help you create your personal green paradise.
          </p>
        </motion.section>

        <motion.section 
          className="mb-16"
          {...fadeIn}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              Paradise Nursery was founded with a vision to transform homes, offices, and outdoor 
              spaces into lush, vibrant environments. Over the years, we have built a reputation 
              for offering a wide variety of healthy plants and top-notch gardening products. 
              Whether you are a seasoned gardener or just getting started, we're here to help 
              every step of the way.
            </p>
          </div>
        </motion.section>

        <motion.section 
          className="mb-16"
          {...fadeIn}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Passion for Nature",
                description: "We believe in the power of plants to transform spaces and lives."
              },
              {
                title: "Customer Focus",
                description: "Your satisfaction is our top priority. We strive to deliver an exceptional experience."
              },
              {
                title: "Sustainability",
                description: "We are committed to promoting eco-friendly practices in everything we do."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-xl font-bold text-green-600 mb-3">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="mb-16"
          {...fadeIn}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Plant Sales",
                description: "Browse our extensive collection of indoor and outdoor plants.",
                icon: "🌿"
              },
              {
                title: "Gardening Supplies",
                description: "Get the best tools, soil, pots, and fertilizers to grow your garden.",
                icon: "🏺"
              },
              {
                title: "Free Consultation",
                description: "Talk to our gardening experts for personalized advice and tips.",
                icon: "💭"
              },
              {
                title: "Delivery Services",
                description: "Convenient delivery to your doorstep for all your gardening needs.",
                icon: "🚚"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-4xl mb-4 block">{service.icon}</span>
                <h3 className="text-2xl font-bold text-green-600 mb-3">{service.title}</h3>
                <p className="text-gray-700">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="text-center mt-16"
          {...fadeIn}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Start Your Green Journey?</h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-8 max-w-2xl mx-auto">
            Contact us today or visit our <strong>Free Consultation</strong> page to get 
            personalized advice from our experts.
          </p>
          <motion.a
            href="/freeconsultation"
            className="inline-block bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Free Consultation
          </motion.a>
        </motion.section>
      </main>
    </div>
  );
};

export default About;