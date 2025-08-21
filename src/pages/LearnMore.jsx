import React from "react";
import { FaRocket, FaShieldAlt, FaGlobe, FaUsers, FaCogs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const LearnMore = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#090e13] text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-r from-[#121c26] to-[#1b2430]">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600"
        >
          Explore Anon Chat <span className="text-white">🚀</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="mt-6 text-gray-300 max-w-2xl text-lg sm:text-xl"
        >
          Build private, secure, and anonymous chat experiences. Connect globally,
          share meaningful conversations, and keep control of your privacy.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          className="mt-8 flex gap-4 flex-wrap justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-green-400 text-black font-semibold rounded-xl shadow-md"
            onClick={() => navigate("/home")}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 sm:px-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
          Why Anon Chat?
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            { icon: FaShieldAlt, title: "Secure", desc: "End-to-end encryption and ephemeral rooms keep your chats private." },
            { icon: FaRocket, title: "Fast", desc: "Real-time messaging powered by optimized sockets for instant communication." },
            { icon: FaGlobe, title: "Global", desc: "Connect with anyone worldwide without revealing your identity." },
            { icon: FaUsers, title: "Anonymous", desc: "No accounts, no tracking, just pure conversations." },
            { icon: FaCogs, title: "Customizable", desc: "Flexible room settings, passwords, and auto-delete timers." },
            { icon: FaRocket, title: "Scalable", desc: "Built for thousands of concurrent chats with low latency." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="bg-[#0a1017]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <feature.icon className="text-green-400 text-4xl mb-4" />
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 sm:px-16 bg-gradient-to-r from-[#0a1017] to-[#1b2430]">
        <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            { step: "1", title: "Create a Room", desc: "Generate a unique phrase or use a custom one with optional password." },
            { step: "2", title: "Share With Friends", desc: "Send the phrase to invite friends securely." },
            { step: "3", title: "Start Chatting", desc: "Chat anonymously with full privacy until the room auto-deletes." },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="bg-[#0a1017]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-16 h-16 rounded-full bg-green-400 text-black flex items-center justify-center font-bold text-xl mb-4 mx-auto"
              >
                {item.step}
              </motion.div>
              <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 sm:px-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
          Stats That Matter
        </h2>
        <div className="grid sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Chats Created" },
            { value: "50K+", label: "Messages Sent" },
            { value: "99.9%", label: "Uptime" },
            { value: "15min", label: "Auto-Delete Timer" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ scale: 1.05 }}
              className="bg-[#0a1017]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-3xl font-bold text-green-400 mb-2">{stat.value}</h3>
              <p className="text-gray-300 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 sm:px-16 bg-gradient-to-r from-[#0a1017] to-[#1b2430]">
        <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
          What People Say
        </h2>
        <div className="grid sm:grid-cols-2 gap-10">
          {[
            { name: "Alex", text: "Anon Chat is my go-to for private discussions. Super fast and secure!" },
            { name: "Sam", text: "I love the simplicity. No accounts, no hassle, just clean anonymous chat." },
          ].map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ scale: 1.05 }}
              className="bg-[#0a1017]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center"
            >
              <p className="text-gray-300 italic mb-4">"{t.text}"</p>
              <h4 className="font-semibold text-green-400">{t.name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400 text-sm border-t border-white/10">
        🚀 Built with ❤️ by <span className="font-semibold">Anon Team</span> · Stay secure, stay anonymous
      </footer>
    </div>
  );
};

export default LearnMore;
