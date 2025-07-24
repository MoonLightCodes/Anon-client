import React, { useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import moment from "moment";
import { useGlobalContext } from "../context/ContextProvider";
import { getChats } from "../server/homePage";

const IndiChats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phrase = location.state?.phrase;
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const [msg, setMsg] = useState("");

  const {
    socket,
    user,
    chats: { activeChats },
    dispatch,
  } = useGlobalContext().state;

  const chatData = useMemo(() => {
    return activeChats.find((chat) => chat.phrase === phrase);
  }, [activeChats, phrase]);

  useEffect(() => {
    if (!chatData) {
      navigate("/");
      return;
    }

    socket.emit("join_room", { roomPhrase: chatData.phrase });

    const onNewMessage = async (data) => {
      if (data.phrase === chatData.phrase) {
        const res = await getChats();
        dispatch({ type: "POPULATE_NEW_CHATS", value: res.data.data.activeChats });
      }
    };

    socket.on("newMessage", onNewMessage);

    return () => {
      socket.emit("leaveRoom", chatData.phrase);
      socket.off("newMessage", onNewMessage);
    };
  }, [chatData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;

    const message = {
      text: msg,
      sender: { _id: user._id, username: user.username },
      phrase: chatData.phrase,
      createdAt: new Date(),
    };

    socket.emit("send_message", message);
    setMsg("");
  };

  return (
    <div className="h-[100dvh] flex flex-col w-full bg-[#121c26] text-white p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FaArrowLeft
          onClick={() => navigate(-1)}
          className="cursor-pointer text-xl text-green-400"
        />
        <h2 className="text-xl font-semibold text-green-400">{chatData?.phrase}</h2>
      </div>

      {/* Created at */}
      <p className="text-gray-400 text-sm mb-2">
        Created at: {moment(chatData?.createdAt).format("MMM Do YYYY, h:mm A")}
      </p>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        {chatData?.messages.map((m, i) => {
          const isOwn = m?.sender?._id === user._id;
          return (
            <div
              key={i}
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
                isOwn ? "bg-green-600 ml-auto" : "bg-gray-700 mr-auto"
              }`}
            >
              <p>{m.text}</p>
              <p className="text-xs text-gray-300 mt-1">
                {isOwn ? "You" : m?.sender?.username || "Anon"} •{" "}
                {moment(m.createdAt).format("h:mm A")}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 pt-3 bg-[#121c26] sticky bottom-0 z-10"
      >
        <input
          ref={inputRef}
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 rounded-lg bg-[#1f2a37] text-white border border-gray-600 outline-none"
          autoComplete="off"
          inputMode="text"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default IndiChats;
