import React, { useEffect, useState } from "react";
import logo from "../assets/anonLogo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { PiChatsCircleLight } from "react-icons/pi";
import { CiHome } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { useGlobalContext } from "../context/ContextProvider";
import { RiAiGenerate } from "react-icons/ri";
import { PiGameControllerThin } from "react-icons/pi";

const NavBar = React.memo(() => {
  const location = useLocation();
  const [currPath, setCurrPath] = useState(location.pathname);
  const navigate = useNavigate();
  useEffect(() => {
    setCurrPath(location.pathname);
  });
  const {
    state,
    state: {
      newChatModel: { isOpen: newChatModelIsOpen },
    },
  } = useGlobalContext();
  return (
    <div
      className={`w-[10vw] sm:w-[20vw] select-none flex flex-col items-center gap-3 ${
        state.phraseModel.isOpen || newChatModelIsOpen
          ? "pointer-events-none"
          : ""
      }`}
    >
      <div className="w-20 aspect-square ">
        <img src={logo} alt="AnonLogo" />
      </div>
      <div className="flex flex-col gap-2">
        <button
          title="Home"
          className={`p-2 ${
            currPath === "/home" ? "bg-[#0a1017]" : ""
          } rounded-2xl  flex items-center  gap-3 cursor-pointer`}
          onClick={() => void (navigate("/home"), setCurrPath("/home"))}
        >
          <CiHome className="text-2xl" />
          <span className="sm:block hidden">Home</span>
        </button>
        <button
          title="Chats"
          className={`p-2 ${
            currPath === "/chats" ? "bg-[#0a1017]" : ""
          } rounded-2xl  flex items-center gap-3 cursor-pointer`}
          onClick={() => void (navigate("/chats"), setCurrPath("/chats"))}
        >
          <PiChatsCircleLight className="text-2xl" />
          <span className="sm:block hidden">Chats</span>
        </button>
        <button
          title="GenAi"
          className={`p-2 bg-sky-400 ${
            currPath === "/P-AI" ? "bg-sky-700" : ""
          } rounded-2xl  flex items-center gap-3 cursor-pointer`}
          onClick={() => void (navigate("/P-AI"), setCurrPath("/P-AI"))}
        >
          <RiAiGenerate  className="text-2xl" />
          <span className="sm:block hidden">GenAi</span>
        </button>
        <button
          title="Game"
          className={`p-2 ${
            currPath === "/game" ? "bg-[#0a1017]" : ""
          } rounded-2xl  flex items-center gap-3 cursor-pointer`}
          onClick={() => void (navigate("/game"), setCurrPath("/game"))}
        >
          <PiGameControllerThin className="text-2xl"/>
          <span className="sm:block hidden">Game</span>
        </button>
        <button
          title="Logout"
          className={`p-2 ${
            currPath === "/login" ? "bg-[#0a1017]" : ""
          } rounded-2xl  flex items-center gap-3 cursor-pointer`}
          onClick={() => void (navigate("/login"), setCurrPath("/login"))}
        >
          <CiLogout className="text-2xl" />
          <span className="sm:block hidden">Logout</span>
        </button>
         
      </div>
    </div>
  );
});

export default NavBar;
