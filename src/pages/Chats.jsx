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
    <div className="w-full relative">
      {/* Floating add button */}
      {!newChatModelIsOpen && (
        <div
          className="absolute top-2 right-3 cursor-pointer z-10"
          title="Add new room"
        >
          <IoAddSharp
            className="text-4xl bg-gradient-to-tr from-green-400 to-green-600 rounded-full p-1 text-black shadow-lg hover:scale-110 hover:rotate-90 transition-all duration-300"
            onClick={() => dispatch({ type: "TOGGLE_NEW_CHAT_MODEL" })}
          />
        </div>
      )}

      <div
        className={`noScroll h-[calc(100vh-80px)] pr-1 flex flex-col mt-14 select-none gap-4 ${
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
                onClick={() =>
                  navigate("/indiChat", { state: { phrase: chat.phrase } })
                }
                key={chat._id}
                className="relative bg-gradient-to-tr from-[#1f2a37] to-[#2c3e50] text-white p-5 rounded-2xl shadow-lg border border-[#2b3b4e] 
                           hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Delete button (only for creator) */}
                {my_userId === chat.members[0]._id && (
                  <div
                    className="absolute right-3 top-3 text-red-300 cursor-pointer hover:scale-125 transition"
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
                  className="absolute right-3 bottom-3 text-sky-300 cursor-pointer hover:scale-125 transition"
                  title="Exit Room"
                  onClick={(e) =>
                    void (e.stopPropagation(), handleExit(chat.phrase))
                  }
                >
                  <TbDoorExit />
                </div>

                <h2 className="text-xl font-semibold tracking-wide mb-2 text-green-400">
                  {chat.phrase}
                </h2>
                <p className="text-xs text-gray-400">
                  Created: {moment(chat.createdAt).format("MMM Do YYYY, h:mm A")}
                </p>

                <div className="flex items-center justify-between text-sm mt-4">
                  <span className="flex items-center gap-1 text-gray-300">
                    <FaUsers className="text-sm text-green-300" />
                    {chat.members?.length} Member
                    {chat.members?.length !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <FaCommentDots className="text-sm text-green-200" />
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
