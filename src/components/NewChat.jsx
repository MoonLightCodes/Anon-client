import React, { useCallback, useEffect, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import { useGlobalContext } from "../context/ContextProvider";
import { createRoom } from "../server/homePage";
import { useThrottling } from "../utils/throttling";
import { motion, AnimatePresence } from "framer-motion";

const NewChat = () => {
  const { state, dispatch } = useGlobalContext();
  const throttlingFn = useCallback(useThrottling(), []);
  const [joinRoomStatus, setJoinRoomStatus] = useState("idle");

  const handleModelClose = useCallback(() => {
    dispatch({ type: "TOGGLE_NEW_CHAT_MODEL" });
    dispatch({ type: "SET_NAME_NEW_CHAT_MODEL", value: "" });
    dispatch({ type: "SET_ROOMPHRASE_NEW_CHAT_MODEL", value: "" });
    dispatch({ type: "SET_PASS_NEW_CHAT_MODEL", value: "" });
    dispatch({ type: "SET_ERROR_NEW_CHAT_MODEL", value: null });
    dispatch({ type: "SET_LOADING_NEW_CHAT_MODEL", value: false });
    dispatch({ type: "SET_SUCCESS_NEW_CHAT_MODEL", value: "" });
    setJoinRoomStatus("idle");
  }, [dispatch]);

  const handleCreateRoom = useCallback(() => {
    if (state.newChatModel.roomPhrase.trim().split(" ").length !== 4) {
      dispatch({
        type: "SET_ERROR_NEW_CHAT_MODEL",
        value: "Enter a valid 4-word phrase and Name (min 5 chars)",
      });
      return;
    }

    setJoinRoomStatus("pending");

    throttlingFn(
      async () => {
        const res = await createRoom(
          state.newChatModel.roomPass,
          state.newChatModel.roomPhrase
            .trim()
            .split(" ")
            .map((e) => e.trim())
            .join(" ")
        );
        setJoinRoomStatus("success");
        return res;
      },
      "",
      "SET_LOADING_NEW_CHAT_MODEL",
      "SET_ERROR_NEW_CHAT_MODEL"
    );
  }, [
    state.newChatModel.roomPass,
    state.newChatModel.roomPhrase,
    throttlingFn,
    dispatch,
  ]);

  useEffect(() => {
    if (
      joinRoomStatus === "success" &&
      !state.newChatModel.error &&
      !state.newChatModel.loading &&
      state.newChatModel.roomPhrase.trim().split(" ").length === 4
    ) {
      dispatch({
        type: "SET_SUCCESS_NEW_CHAT_MODEL",
        value: "Room Joined Successfully 🎉",
      });

      const timeout = setTimeout(() => {
        dispatch({ type: "SET_SUCCESS_NEW_CHAT_MODEL", value: "" });
        setJoinRoomStatus("idle");
        handleModelClose();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [
    joinRoomStatus,
    state.newChatModel.error,
    state.newChatModel.loading,
    state.newChatModel.roomPhrase,
    dispatch,
    handleModelClose,
  ]);

  return (
    <AnimatePresence>
      <motion.div
        key="new-chat-modal"
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="fixed z-20 top-20 sm:top-10 left-1/2 -translate-x-1/2 min-h-[35vh] w-[90vw] sm:w-[60vw] rounded-2xl 
        bg-[#0a1017]/80 backdrop-blur-xl border border-white/10 
        shadow-[0_0_50px_rgba(0,255,170,0.4)] p-6 flex flex-col items-center"
      >
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-2xl cursor-pointer shadow-md transition-all"
          title="close"
          onClick={handleModelClose}
        >
          <TfiClose />
        </motion.button>

        {/* Success */}
        {state.newChatModel.success && !state.newChatModel.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl text-green-400 font-semibold drop-shadow-md"
          >
            {state.newChatModel.success}
          </motion.div>
        )}

        {/* Error */}
        {state.newChatModel.error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 mt-10 text-center p-4 flex flex-col justify-center gap-4 bg-red-950/30 rounded-xl shadow-lg w-full sm:w-[80%]"
          >
            {state.newChatModel.error}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-white mx-auto cursor-pointer transition-all"
              onClick={() => {
                dispatch({ type: "SET_ERROR_NEW_CHAT_MODEL", value: "" });
                dispatch({ type: "SET_SUCCESS_NEW_CHAT_MODEL", value: "" });
                setJoinRoomStatus("idle");
              }}
            >
              🔄 Retry
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Input Fields */}
            <div className="flex flex-col items-center mt-6 gap-6 w-full sm:w-[80%]">
              {/* Room Phrase */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 w-full"
              >
                <label htmlFor="RoomPhrase" className="text-white font-medium">
                  Room ID (4-word phrase):
                </label>
                <input
                  type="text"
                  className="outline-none border border-gray-600 focus:border-green-400 focus:ring-2 focus:ring-green-400/60 bg-[#0d141a] text-white rounded-xl p-3 transition-all"
                  placeholder="eg: sky blue river stone"
                  id="RoomPhrase"
                  value={state.newChatModel.roomPhrase}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_ROOMPHRASE_NEW_CHAT_MODEL",
                      value: e.target.value,
                    })
                  }
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-2 w-full"
              >
                <label htmlFor="pass" className="text-white font-medium">
                  Password (optional):
                </label>
                <input
                  type="password"
                  className="outline-none border border-gray-600 focus:border-green-400 focus:ring-2 focus:ring-green-400/60 bg-[#0d141a] text-white rounded-xl p-3 transition-all"
                  placeholder="Enter password or leave empty"
                  id="pass"
                  value={state.newChatModel.roomPass}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_PASS_NEW_CHAT_MODEL",
                      value: e.target.value,
                    })
                  }
                />
              </motion.div>
            </div>

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 flex items-center gap-2 px-6 py-3 rounded-2xl mt-6 text-white font-semibold text-lg shadow-lg shadow-green-500/30 cursor-pointer transition-all"
              title="Join Room"
              onClick={handleCreateRoom}
            >
              🚀 Join Room{" "}
              {state.newChatModel.loading && (
                <motion.div
                  className="border-2 border-transparent rounded-full border-x-white animate-spin w-5 h-5"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              )}
            </motion.button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NewChat;
