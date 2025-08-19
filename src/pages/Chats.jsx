import React, { useEffect, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import { useGlobalContext } from "../context/ContextProvider";
import moment from "moment";
import { FaCommentDots, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { deleteChat, exitChat, getChats } from "../server/homePage";
import { TbDoorExit } from "react-icons/tb";

const Chats = () => {
  const my_userId = localStorage.getItem("userId");
  const {
    state,
    state: {
      chats: { activeChats },
      newChatModel: { isOpen: newChatModelIsOpen },
      phraseModel: { isOpen: phraseModelIsOpen },
    },
    dispatch,
  } = useGlobalContext();

  const [first, setfirst] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (newChatModelIsOpen || phraseModelIsOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [newChatModelIsOpen, phraseModelIsOpen, first]);

  const handleDelete = async (roomPhrase) => {
    try {
      await deleteChat(roomPhrase);
      setfirst((e) => !e);
    } catch (error) {
      console.log(error.messages);
    }
  };

  const handleExit = async (roomPhrase) => {
    try {
      await exitChat(roomPhrase);
      setfirst((e) => !e);
    } catch (error) {
      console.log(error.messages);
    }
  };

  useEffect(() => {
    (async function () {
      const data = await getChats();
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: data.data.data.activeChats,
      });
    })();
  }, [state.phraseModel, state.newChatModel, first]);

  return (
    <div className="w-full relative px-4 sm:px-6 lg:px-10">
      {/* Floating add button */}
      {!newChatModelIsOpen && (
        <div
          className="absolute top-4 right-4 cursor-pointer z-10"
          title="Add new room"
        >
          <IoAddSharp
            className="text-4xl bg-gradient-to-tr from-green-400 to-green-600 rounded-full p-2 text-black shadow-lg hover:scale-110 hover:rotate-90 transition-all duration-300"
            onClick={() => dispatch({ type: "TOGGLE_NEW_CHAT_MODEL" })}
          />
        </div>
      )}

      <div
        className={`noScroll h-[calc(100vh-100px)] overflow-y-auto flex flex-col mt-16 gap-6 pb-6 ${
          newChatModelIsOpen ? "pointer-events-none" : ""
        }`}
      >
        {activeChats.length === 0 ? (
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
                {my_userId === chat.members[0]._id && (
                  <div
                    className="absolute top-3 text-xl sm:text-3xl right-6 text-red-400 opacity-80 group-hover:opacity-100 hover:scale-125 transition-all duration-300"
                    title="Delete Room"
                    onClick={(e) =>
                      void (e.stopPropagation(), handleDelete(chat.phrase))
                    }
                  >
                    <FaTrashAlt />
                  </div>
                )}

                {/* Exit button */}
                <div
                  className="absolute top-16 text-xl sm:text-3xl right-6 text-sky-300 opacity-80 group-hover:opacity-100 hover:scale-125 transition-all duration-300"
                  title="Exit Room"
                  onClick={(e) =>
                    void (e.stopPropagation(), handleExit(chat.phrase))
                  }
                >
                  <TbDoorExit />
                </div>

                <h2 className="text-xl sm:text-2xl font-semibold tracking-wide mb-2 text-green-400 drop-shadow-md">
                  {chat.phrase}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  Created: {moment(chat.createdAt).format("MMM Do YYYY, h:mm A")}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-2 sm:gap-0">
                  <span className="flex items-center gap-2 text-gray-300">
                    <FaUsers className="text-sm sm:text-base text-green-300" />
                    {chat.members?.length} Member
                    {chat.members?.length !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-2 text-gray-300">
                    <FaCommentDots className="text-sm sm:text-base text-green-200" />
                    {chat.messages?.length} Message
                    {chat.messages?.length !== 1 ? "s" : ""}
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
