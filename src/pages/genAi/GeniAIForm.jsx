import React, { useEffect, useRef, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
const GeniAIForm = ({ setMessages, main }) => {
  const [shadowColor, setShadowColor] = useState("#ff00cc");
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  const colors = ["#ff00cc", "#00ffcc", "#ffcc00", "#00ccff", "#cc00ff"];

  const handleClick = async () => {
    if (inputValue.trim() === "") return;

    let currentInput = inputValue;
    setInputValue("");

    // Add user's message to state
    setMessages((prev) => {
      const updated = [...prev, { type: "user", text: currentInput }];
      localStorage.setItem("genai", JSON.stringify(updated));
      return updated;
    });

    // Prepare context from previous messages
    const prevUserMessages = JSON.parse(localStorage.getItem("genai") || "[]")
      .filter((msg) => msg.type === "user")
      .map((msg) => msg.text)
      .join("\n");

    const prompt = `You are a helpful AI assistant.  
You are given the following context (previous conversation, background info, or system data).  
Always consider this context when generating your response.  
Only respond directly to the **last user message**.  

Context:
${prevUserMessages}

Last user message:
${currentInput}

Now respond helpfully and naturally to the last user message.
`;

    // Call main (AI handler) and include AI response in messages
    const aiResponse = await main(prompt);

    // setMessages((prev) => {
    //   const updated = [
    //     ...prev,
    //     { type: "genai", text: aiResponse },
    //   ];
    //   localStorage.setItem("genai", JSON.stringify(updated));
    //   return updated;
    // });
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
      style={{ background: linearGradient, padding: "2px" }}
      onSubmit={(e) => {
        e.preventDefault();
        handleClick();
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleClick();
            }
          }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-8 h-10 sm:w-10 sm:h-12 rounded-2xl bg-indigo-400 cursor-pointer active:bg-slate-900 text-white font-medium transition-all duration-300 -rotate-90 flex items-center justify-center text-lg sm:text-xl"
        >
          ➤
        </button>

        {/* New Chat Button */}
        <button
          type="button"
          title="New Chat"
          className="w-10 h-12 flex justify-center items-center rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 cursor-pointer text-white font-medium transition-all duration-200 shadow-lg text-4xl"
          onClick={() => {
            localStorage.setItem("genai", "");
            setMessages([]);
          }}
        >
          <IoAddSharp />
        </button>
      </div>
    </form>
  );
};

export default GeniAIForm;
