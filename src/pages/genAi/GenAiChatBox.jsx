import React, { useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const GenAiChatBox = ({ messages, loading }) => {
  const chatboxRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to detect code blocks (```language\ncode```) and render them
  const renderMessage = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    if (!codeBlockRegex.test(text)) {
      return <span className="whitespace-pre-wrap break-words">{text}</span>;
    }

    const parts = [];
    let lastIndex = 0;
    text.replace(codeBlockRegex, (match, lang, code, offset) => {
      if (offset > lastIndex) {
        parts.push(
          <span
            key={lastIndex}
            className="whitespace-pre-wrap break-words"
          >
            {text.slice(lastIndex, offset)}
          </span>
        );
      }
      parts.push(
        <SyntaxHighlighter
          key={offset}
          language={lang || "text"}
          style={oneDark}
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      );
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(
        <span
          key={lastIndex}
          className="whitespace-pre-wrap break-words"
        >
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div
      ref={chatboxRef}
      className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 py-6 space-y-4"
      style={{ scrollbarWidth: "none" }}
    >
      {messages?.map((msg, i) => {
        const isUser = msg.type === "user";
        return (
          <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-sm sm:text-base shadow-lg whitespace-pre-wrap break-words ${
                isUser
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                  : "bg-slate-600 text-white"
              }`}
            >
              {renderMessage(msg.text)}
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
};

export default GenAiChatBox;
