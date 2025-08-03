import React, { useEffect } from "react";

const GenAiChatBox = ({ messages,loading }) => {
  const chatboxRef = React.useRef(null);
  useEffect(() => {
    chatboxRef.current &&
      (chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight);
  }, [messages]);
  return (
    <div
      className="flex-1 w-full max-w-3xl  mx-auto overflow-y-auto px-4 py-6 space-y-4"
      style={{ scrollbarWidth: "none" }}
      ref={chatboxRef}
    >
      {messages?.map((msg, i) => (
        <div
          key={i}
          className={`flex ${
            msg.type === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-sm sm:text-base shadow-lg ${
              msg.type === "user"
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                : "bg-slate-600 text-white"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 "></div>
        </div>
      )}
    </div>
  );
};

export default GenAiChatBox;
