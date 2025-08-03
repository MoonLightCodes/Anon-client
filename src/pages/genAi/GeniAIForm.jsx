import React, { useEffect, useRef, useState } from "react";

const GeniAIForm = ({ setMessages, main }) => {
  const [shadowColor, setShadowColor] = useState("#ff00cc");
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  const colors = ["#ff00cc", "#00ffcc", "#ffcc00", "#00ccff", "#cc00ff"];

  const handleCLick = (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    setMessages((prev) => {
      let a = [
        ...prev,
        {
          type: "user",
          text: inputValue,
        },
      ];
      localStorage.setItem("genai", JSON.stringify(a));
      return a;
    });
    main(inputValue);
    setInputValue("");
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setShadowColor((prev) => {
        const idx = colors.indexOf(prev);
        return colors[(idx + 1) % colors.length];
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const nextColor = colors[(colors.indexOf(shadowColor) + 1) % colors.length];
  const linearGradient = `linear-gradient(90deg, ${shadowColor}, ${nextColor})`;

  return (
    <form
      className="w-full max-w-3xl mx-auto px-4 py-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4"
      style={{
        background: linearGradient,
        padding: "2px",
      }}
    >
      <div className="flex w-full bg-black rounded-3xl px-4 py-3 backdrop-blur-2xl gap-3">
        <textarea
          style={{ scrollbarWidth: "none" }}
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={1}
          placeholder="Ask your Gen AI assistant..."
          className="flex-1 text-white placeholder-gray-400 focus:outline-none text-base sm:text-lg resize-none bg-transparent max-h-[60vh] overflow-y-auto"
        />
        <button
          type="submit"
          className="w-8 h-10 sm:w-10 sm:h-12 rounded-2xl bg-indigo-400 cursor-pointer active:bg-slate-900 text-white font-medium transition-all duration-300 -rotate-90 flex items-center justify-center text-lg sm:text-xl"
          onClick={handleCLick}
        >
          ➤
        </button>
      </div>
    </form>
  );
};

export default GeniAIForm;
