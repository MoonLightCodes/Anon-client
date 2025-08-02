import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { FaArrowLeft } from "react-icons/fa";
import { useGlobalContext } from "../context/ContextProvider";
import { getChats } from "../server/homePage";

const IndiChats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phrase = location.state?.phrase;

  const {
    state,
    dispatch,
    state: {
      socket,
      user,
      chats: { activeChats },
    },
  } = useGlobalContext();

  const bottomRef = useRef();
  const [msg, setMsg] = useState("");

  // Always get latest chatData from global state
  const chatData = useMemo(
    () => activeChats.find((chat) => chat.phrase === phrase),
    [activeChats, phrase]
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  // Fetch latest chats on mount
  useEffect(() => {
    (async () => {
      const res = await getChats();
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: res.data.data.activeChats,
      });
    })();
  }, []);

  // Join room on mount, leave on unmount
  useEffect(() => {
    if (!chatData) return navigate("/chats");

    socket.emit("join_room", { roomPhrase: chatData.phrase });

    const handleNewMessage = async (data) => {
      if (data.phrase === chatData.phrase) {
        // Refetch chats and update state
        const res = await getChats();
        dispatch({
          type: "POPULATE_NEW_CHATS",
          value: res.data.data.activeChats,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", chatData.phrase);
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatData]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;

    const messageData = {
      text: msg,
      sender: {
        _id: user._id,
        username: user.username,
      },
      phrase: chatData.phrase,
      createdAt: new Date(),
    };

    socket.emit("send_message", messageData);
    setMsg("");
  };

  return (
    <div className="h-screen w-full sm:w-[70%] bg-[#121c26] text-white flex flex-col p-4 relative">
      <div className="flex items-center gap-3 mb-4">
        <FaArrowLeft
          className="cursor-pointer text-xl text-green-400"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-2xl font-semibold text-green-400">
          {chatData?.phrase}
        </h1>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Created at: {moment(chatData?.createdAt).format("MMM Do YYYY, h:mm A")}
      </p>

      <div className="flex-1 overflow-y-auto noScroll bg-[#1f2a37] p-3 rounded-lg">
        {chatData?.messages?.map((message, i) => {
          const isOwn = message?.sender?._id === user._id;
          return (
            <div
              key={i}
              className={`p-3 rounded-md mb-2 max-w-xs ${
                isOwn ? "bg-green-600 ml-auto" : "bg-[#2c3e50] mr-auto"
              }`}
            >
              <p className="text-white">{message.text}</p>
              <p className="text-gray-400 text-xs mt-1">
                {isOwn ? "You" : message?.sender?.username || "Other"} •{" "}
                {moment(message.createdAt).format("h:mm A")}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // prevent mobile browsers from submitting form
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-[#1f2a37] text-white p-3 rounded-lg border border-[#2b3b4e] outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 hover:bg-green-600 cursor-pointer px-4 py-2 rounded-lg text-white font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default IndiChats;
