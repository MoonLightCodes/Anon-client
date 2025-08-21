import React, { useEffect } from "react";
import { useGlobalContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const Home = () => {
  const { state, dispatch } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.phraseModel.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [state.phraseModel.isOpen]);

  return (
    <motion.div
      className={`w-full flex flex-col justify-between items-center min-h-screen ${
        state.phraseModel.isOpen ? "pointer-events-none" : ""
      }`}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        className="w-full sm:max-w-3xl text-center mt-16 sm:mt-20 px-4"
        variants={fadeInUp}
        custom={0}
      >
        <motion.h1
          className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Welcome to Anon Chat <span className="text-white">💬</span>
        </motion.h1>
        <motion.p
          className="mt-4 text-gray-300 sm:text-lg"
          variants={fadeInUp}
          custom={1}
        >
          Create secure, anonymous chat rooms instantly. Share meaningful
          phrases, stay private, and connect in real-time.
        </motion.p>
        <motion.div
          className="mt-6 flex justify-center gap-4"
          variants={fadeInUp}
          custom={2}
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl font-semibold text-white shadow-lg"
            onClick={() => void dispatch({ type: "PHRASE_MODEL_TOGGLE" })}
          >
            🚀 Start a New Chat
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold text-white shadow-lg"
            onClick={() => navigate("/learnmore")}
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Create Room Section */}
      <motion.div
        className="w-full sm:max-w-xl mt-12 sm:mt-16 p-6 bg-white/5 rounded-2xl shadow-lg backdrop-blur-lg border border-white/10"
        variants={fadeInUp}
        custom={3}
      >
        <h2 className="text-2xl font-bold text-center mb-6">✨ Create New Room</h2>
        <form className="group space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label htmlFor="pass" className="font-medium">
              Set Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              id="pass"
              className="flex-1 outline-none border border-indigo-400 p-2 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Enter some password"
              value={state.homePage.createRoomPass}
              onChange={({ target: { value } }) =>
                dispatch({ type: "SET_CREATE_ROOM_PASS", value })
              }
            />
          </div>
          <p className="text-xs text-red-300 hidden group-focus-within:block text-center">
            Leave this field empty to make the room open for all 🚪
          </p>
        </form>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 w-full p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl font-semibold text-white shadow-lg"
          onClick={() => void dispatch({ type: "PHRASE_MODEL_TOGGLE" })}
        >
          Generate Phrase 🔑
        </motion.button>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="mt-16 grid sm:grid-cols-3 gap-6 px-6 w-full sm:max-w-5xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          { title: "🔒 Private", desc: "Rooms dissolve after 15 minutes of inactivity." },
          { title: "⚡ Real-Time", desc: "Chat instantly with low latency powered by sockets." },
          { title: "🎭 Anonymous", desc: "No accounts, no traces — just pure conversations." },
          { title: "🌍 Global", desc: "Connect with anyone, anywhere, anytime in seconds." },
          { title: "📱 Responsive", desc: "Works seamlessly across mobile, tablet, and desktop." },
          { title: "🛡️ Secure", desc: "Messages are encrypted and never stored permanently." },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="p-5 rounded-xl bg-white/5 border border-white/10 shadow-md"
            variants={fadeInUp}
            custom={i}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(0,0,0,0.3)" }}
          >
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full sm:max-w-4xl px-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          { value: "10K+", label: "Chats Created" },
          { value: "50K+", label: "Messages Sent" },
          { value: "99.9%", label: "Uptime" },
          { value: "15min", label: "Auto-Delete Timer" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="p-4 rounded-lg bg-white/5 border border-white/10"
            variants={fadeInUp}
            custom={i}
            whileHover={{ scale: 1.1 }}
          >
            <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials */}
      <motion.div
        className="mt-20 px-6 w-full sm:max-w-3xl text-center"
        variants={fadeInUp}
        custom={2}
      >
        <h2 className="text-2xl font-bold mb-6">💡 What People Say</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { name: "Sahil Mund", text: "Anon Chat is my go-to for private discussions." },
            { name: "Vishnu Vardhan", text: "Fast, simple, and secure. Perfect for quick chats." },
          ].map((t, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
              variants={fadeInUp}
              custom={i}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-gray-300 italic">"{t.text}"</p>
              <h4 className="mt-2 font-semibold">{t.name}</h4>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="mt-20 px-6 w-full sm:max-w-3xl"
        variants={fadeInUp}
        custom={3}
      >
        <h2 className="text-2xl font-bold text-center mb-6">❓ Frequently Asked</h2>
        <div className="space-y-4">
          {[
            { q: "Is it really anonymous?", a: "Yes! No accounts, no logins, and no saved data." },
            { q: "Do rooms auto-delete?", a: "Yes. After 15 minutes of inactivity, the room dissolves automatically." },
            { q: "Is it free?", a: "Absolutely. Anon Chat is free to use with no hidden costs." },
          ].map((faq, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
              variants={fadeInUp}
              custom={i}
              whileHover={{ scale: 1.03 }}
            >
              <h4 className="font-semibold">{faq.q}</h4>
              <p className="text-gray-300 text-sm mt-1">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="mt-20 mb-6 text-center text-gray-400 text-sm"
        variants={fadeInUp}
        custom={4}
      >
        🚀 Built with ❤️ by <span className="font-semibold">Anon</span> · Stay connected, stay safe
      </motion.footer>
    </motion.div>
  );
};

export default Home;
