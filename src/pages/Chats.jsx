import React, { useCallback, useEffect, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import { useGlobalContext } from "../context/ContextProvider";
import moment from "moment";
import { FaCommentDots, FaTrash, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { deleteChat, exitChat, getChats } from "../server/homePage";
import { TbDoorExit } from "react-icons/tb";

const Chats = () => {
  const my_userId = localStorage.getItem('userId')
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
      console.log(data);
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: data.data.data.activeChats,
      });
    })();
  }, [state.phraseModel, state.newChatModel, first]);

  return (
    <div className="w-full relative">
      {!newChatModelIsOpen && (
        <div
          className="absolute top-2 right-3 cursor-pointer z-10"
          title="Add new room"
        >
          <IoAddSharp
            className="text-4xl bg-black rounded-full p-1 text-green-400 hover:bg-gray-800 transition"
            onClick={() => dispatch({ type: "TOGGLE_NEW_CHAT_MODEL" })}
          />
        </div>
      )}

      <div
        className={`noScroll h-[calc(100vh-80px)] pr-1 flex flex-col mt-15 select-none gap-4 ${
          newChatModelIsOpen ? "pointer-events-none" : ""
        }`}
      >
        {activeChats.length === 0 ? (
          <p className="text-gray-400 text-center mt-20 text-sm tracking-wide">
            No chats yet. Create one and start Anon-ing.
          </p>
        ) : (
          activeChats.reverse().map((chat) => (
            <div
              onClick={() => navigate("/indiChat", { state: { phrase:chat.phrase } })}
              key={chat._id}
              className="bg-[#1f2a37] relative text-white p-4 rounded-xl shadow-inner border border-[#2b3b4e] hover:bg-[#2c3e50] transition duration-200"
            >
              {my_userId===chat.members[0]._id &&  <div
                className="absolute right-3 text-red-300 cursor-pointer hover:scale-110"
                title="Delete ROom"
                onClick={(e) =>
                  void (e.stopPropagation(), handleDelete(chat.phrase))
                }
              >
                <FaTrashAlt />
              </div>}
              <div
                className="absolute right-3 bottom-12 text-sky-300 cursor-pointer hover:scale-110"
                title="Exit Room"
                onClick={(e) =>
                  void (e.stopPropagation(), handleExit(chat.phrase))
                }
              >
                <TbDoorExit />
              </div>
              <h2 className="text-lg font-semibold tracking-wide mb-1 text-green-400">
                {chat.phrase}
              </h2>
              <p className="text-xs text-gray-400">
                Created: {moment(chat.createdAt).format("MMM Do YYYY, h:mm A")}
              </p>
              <div className="flex items-center justify-between text-sm mt-3 text-gray-300">
                <span className="flex items-center gap-1">
                  <FaUsers className="text-sm text-green-300" />
                  {chat.members?.length} Member
                  {chat.members?.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
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
