import React, { useEffect, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import { useGlobalContext } from "../context/ContextProvider";
import moment from "moment";
import { FaCommentDots, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { deleteChat, exitChat, getChats } from "../server/homePage";
import { TbDoorExit } from "react-icons/tb";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

const Chats = () => {
  const my_userId = localStorage.getItem("userId");
  const {
    state: {
      chats: { activeChats },
      newChatModel: { isOpen: newChatModelIsOpen },
      phraseModel: { isOpen: phraseModelIsOpen },
    },
    dispatch,
  } = useGlobalContext();

  const [first, setfirst] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 track initial chats loading
  const [actionLoading, setActionLoading] = useState(null); // 🔥 track delete/exit loading per chat
  const navigate = useNavigate();

  // Scroll lock when modals open
  useEffect(() => {
    if (newChatModelIsOpen || phraseModelIsOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [newChatModelIsOpen, phraseModelIsOpen, first]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://anon-server-9ykk.onrender.com", {
      auth: { userId: my_userId },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [my_userId]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const data = await getChats();
      dispatch({
        type: "SET_NOTIFICATION",
        value: data.data.data.activeChats.some((chat) =>
          chat.unreadUsers?.some((u) => u === my_userId)
        ),
      });
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: data.data.data.activeChats,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chats + listen for new messages
  useEffect(() => {
    if (!socket) return;

    fetchChats();

    const handleNewMessage = () => {
      fetchChats();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch, my_userId]);

  const handleDelete = async (roomPhrase) => {
    try {
      setActionLoading(roomPhrase + "-delete");
      await deleteChat(roomPhrase);
      setfirst((e) => !e);
      fetchChats();
    } catch (error) {
      console.log(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExit = async (roomPhrase) => {
    try {
      setActionLoading(roomPhrase + "-exit");
      await exitChat(roomPhrase);
      setfirst((e) => !e);
      fetchChats();
    } catch (error) {
      console.log(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 🔥 Skeleton component
  const SkeletonCard = () => (
    <div className="animate-pulse bg-[#1f2a37] p-5 rounded-2xl shadow-2xl border border-[#2b3b4e]">
      <div className="h-6 w-1/3 bg-gray-700 rounded mb-3"></div>
      <div className="h-3 w-1/2 bg-gray-700 rounded mb-4"></div>
      <div className="flex gap-4">
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative px-4 sm:px-6 lg:px-10">
      {/* Floating Add Button with Framer Motion */}
      {!newChatModelIsOpen && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 cursor-pointer"
          title="Add new room"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.15, rotate: 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => dispatch({ type: "TOGGLE_NEW_CHAT_MODEL" })}
        >
          <IoAddSharp className="text-4xl sm:text-5xl bg-gradient-to-tr from-green-400 to-green-600 rounded-full p-3 text-black shadow-lg" />
        </motion.div>
      )}

      <div
        className={`noScroll h-[calc(100vh-100px)] overflow-y-auto flex flex-col mt-16 gap-6 pb-6 ${
          newChatModelIsOpen ? "pointer-events-none" : ""
        }`}
      >
        {/* 🔥 Show Skeleton while loading */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : activeChats.length === 0 ? (
          <p className="text-gray-400 text-center mt-20 text-sm tracking-wide italic animate-pulse">
            No chats yet. 🚀 Create one and start Anon-ing.
          </p>
        ) : (
          activeChats
            .slice()
            .reverse()
            .map((chat) => (
              <div
                key={chat._id}
                onClick={() =>
                  navigate("/indiChat", { state: { phrase: chat.phrase } })
                }
                className="relative bg-gradient-to-tr from-[#1f2a37] to-[#2c3e50] text-white p-5 rounded-2xl shadow-2xl border border-[#2b3b4e] hover:scale-[1.01] hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Delete button (only for creator) */}
                {chat.members?.[0]?._id === my_userId && (
                  <div
                    className="absolute top-3 right-6 z-20 text-red-400 text-xl sm:text-3xl opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer"
                    title="Delete Room"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(chat.phrase);
                    }}
                  >
                    {actionLoading === chat.phrase + "-delete" ? (
                      <div className="animate-spin h-5 w-5 border-2 border-red-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <FaTrashAlt />
                    )}
                  </div>
                )}

                {/* Exit button */}
                <div
                  className="absolute top-16 right-6 text-xl sm:text-3xl text-sky-300 opacity-80 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                  title="Exit Room"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExit(chat.phrase);
                  }}
                >
                  {actionLoading === chat.phrase + "-exit" ? (
                    <div className="animate-spin h-5 w-5 border-2 border-sky-300 border-t-transparent rounded-full"></div>
                  ) : (
                    <TbDoorExit />
                  )}
                </div>

                {chat.unreadUsers?.some((e) => e === my_userId) && (
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                )}

                <h2 className="text-xl sm:text-2xl font-semibold tracking-wide mb-2 text-green-400 drop-shadow-md">
                  {chat.phrase}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Created:{" "}
                  {moment(chat.createdAt).format("MMM Do YYYY, h:mm A")}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-2 sm:gap-0">
                  <span className="flex items-center gap-2 text-gray-300">
                    <FaUsers className="text-sm sm:text-base text-green-300" />
                    {chat.members?.length || 0} Member
                    {(chat.members?.length || 0) !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-2 text-gray-300">
                    <FaCommentDots className="text-sm sm:text-base text-green-200" />
                    {chat.messages?.length || 0} Message
                    {(chat.messages?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Chats;
