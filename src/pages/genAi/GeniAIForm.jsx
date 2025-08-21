import React, { useEffect, useRef, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import { motion } from "framer-motion";

const GeniAIForm = ({ setMessages, main }) => {
  const [shadowColor, setShadowColor] = useState("#ff00cc");
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  const colors = ["#ff00cc", "#00ffcc", "#ffcc00", "#00ccff", "#cc00ff"];

  const handleClick = async () => {
    if (inputValue.trim() === "") return;

    let currentInput = inputValue;
    setInputValue("");

    // Add user's message
    setMessages((prev) => {
      const updated = [...prev, { type: "user", text: currentInput }];
      localStorage.setItem("genai", JSON.stringify(updated));
      return updated;
    });

    // Collect context
    const prevUserMessages = JSON.parse(localStorage.getItem("genai") || "[]")
      .filter((msg) => msg.type === "user")
      .map((msg) => msg.text)
      .join("\n");

    const prompt = `You are a helpful AI assistant. 
Context:
${prevUserMessages}

Last user message:
${currentInput}`;

    await main(prompt);
  };

  // Shadow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShadowColor((prev) => {
        const idx = colors.indexOf(prev);
        return colors[(idx + 1) % colors.length];
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const nextColor = colors[(colors.indexOf(shadowColor) + 1) % colors.length];
  const linearGradient = `linear-gradient(90deg, ${shadowColor}, ${nextColor})`;

  return (
    <div className="relative w-full flex justify-center">
      {/* Input Form */}
      <form
        className="w-full max-w-3xl mx-auto px-4 py-4 rounded-3xl flex items-center"
        style={{ background: linearGradient, padding: "2px" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleClick();
        }}
      >
        <div className="flex w-full bg-black rounded-3xl px-4 py-2 gap-3 items-end">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows={1}
            style={{scrollbarWidth:'none'}}
            placeholder="Ask your Gen AI assistant..."
            className="flex-1 text-white placeholder-gray-400 focus:outline-none text-base sm:text-lg resize-none bg-transparent max-h-[60vh] overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleClick();
              }
            }}
          />

          {/* Send Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg"
          >
            ➤
          </motion.button>
        </div>
      </form>

      {/* Floating Add Chat Button (Bottom-Right Corner) */}
      <motion.button
        whileHover={{ rotate: 90, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="New Chat"
        className="fixed bottom-21 sm:bottom-30 right-5 sm:right-50 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white text-3xl flex items-center justify-center shadow-2xl z-50"
        onClick={() => {
          localStorage.setItem("genai", "");
          setMessages([]);
        }}
      >
        <IoAddSharp />
      </motion.button>
    </div>
  );
};

export default GeniAIForm;
