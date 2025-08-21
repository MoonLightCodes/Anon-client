import React, { useEffect, useState } from "react";
import logo from "../assets/anonLogo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { PiChatsCircleLight } from "react-icons/pi";
import { CiHome, CiLogout } from "react-icons/ci";
import { RiAiGenerate } from "react-icons/ri";
import { PiGameControllerThin } from "react-icons/pi";
import { useGlobalContext } from "../context/ContextProvider";
import { motion } from "framer-motion";

const NavBar = React.memo(() => {
  const location = useLocation();
  const [currPath, setCurrPath] = useState(location.pathname);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrPath(location.pathname);
  }, [location.pathname]);

  const {
    state,
    state: {
      chats: { notification },
      newChatModel: { isOpen: newChatModelIsOpen },
    },
  } = useGlobalContext();

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.08, transition: { type: "spring", stiffness: 300 } },
    tap: { scale: 0.95 },
  };

  // ✅ Active button styles
  const activeStyle =
    "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md scale-105";

  return (
    <motion.div
      className={`w-[10vw] sm:w-[20vw] select-none flex flex-col items-center gap-3 ${
        state.phraseModel.isOpen || newChatModelIsOpen
          ? "pointer-events-none"
          : ""
      }`}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo */}
      <motion.div
        className="w-20 aspect-square flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <img
          src={logo}
          alt="AnonLogo"
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Nav Buttons */}
      <div className="flex flex-col gap-2">
        {/* Home */}
        <motion.button
          title="Home"
          className={`p-2 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 ${
            currPath === "/home" ? activeStyle : "hover:bg-[#0a1017]"
          }`}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => void (navigate("/home"), setCurrPath("/home"))}
        >
          <CiHome className="text-2xl" />
          <span className="sm:block hidden">Home</span>
        </motion.button>

        {/* Chats */}
        <motion.button
          title="Chats"
          className={`p-2 rounded-2xl relative flex items-center gap-3 cursor-pointer transition-all duration-300 ${
            currPath === "/chats" ? activeStyle : "hover:bg-[#0a1017]"
          }`}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => void (navigate("/chats"), setCurrPath("/chats"))}
        >
          {notification && (
            <motion.div
              className="w-3 h-3 -top-1 rounded-full absolute bg-red-500 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          )}
          <PiChatsCircleLight className="text-2xl" />
          <span className="sm:block hidden">Chats</span>
        </motion.button>

        {/* GenAi */}
        <motion.button
          title="GenAi"
          className={`p-2 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 ${
            currPath === "/P-AI" ? activeStyle : "hover:bg-[#0a1017]"
          }`}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => void (navigate("/P-AI"), setCurrPath("/P-AI"))}
        >
          <RiAiGenerate className="text-2xl" />
          <span className="sm:block hidden">GenAi</span>
        </motion.button>

        {/* Game */}
        <motion.button
          title="Game"
          className={`p-2 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 ${
            currPath === "/game" ? activeStyle : "hover:bg-[#0a1017]"
          }`}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => void (navigate("/game"), setCurrPath("/game"))}
        >
          <PiGameControllerThin className="text-2xl" />
          <span className="sm:block hidden">Game</span>
        </motion.button>

        {/* Logout */}
        <motion.button
          title="Logout"
          className={`p-2 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 ${
            currPath === "/login" ? activeStyle : "hover:bg-[#0a1017]"
          }`}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => void (navigate("/login"), setCurrPath("/login"))}
        >
          <CiLogout className="text-2xl" />
          <span className="sm:block hidden">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
});

export default NavBar;
