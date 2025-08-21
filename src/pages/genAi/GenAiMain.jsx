import React, { useCallback, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import GenAiHeading from "./GenAiHeading";
import GeniAIForm from "./GeniAIForm";
import GenAiChatBox from "./GenAiChatBox";

const GenAiMain = () => {
  const [messages, setMessages] = React.useState(()=>localStorage.getItem("genai")?JSON.parse(localStorage.getItem("genai")):[]);
  const [loading, setLoading] = React.useState(false);
  const main = useCallback(async function (q) {
    setLoading(true);
    const ai = new GoogleGenAI({
      apiKey: "AIzaSyAyqFCw3s_M6m5_zLmLiVrGtnag5yXvmVA",
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: q,
    });
    setLoading(false);
    setMessages((prev) => {
      let a = [
        ...prev,
        {
          type: "genai",
          text: response.text.replaceAll("**", " ").replaceAll("*", " "),
        },
      ];
      localStorage.setItem("genai", JSON.stringify(a));
      return a;
    });
  }, []);

  return (
    <div className="flex flex-col w-[80%] justify-center h-[90vh] md:h-screen">
      <GenAiHeading  />
      <GenAiChatBox messages={messages} loading={loading} />
      <GeniAIForm setMessages={setMessages} main={main} />
    </div>
  );
};

export default GenAiMain;
