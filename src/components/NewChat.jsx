import React, { useCallback, useEffect, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import { useGlobalContext } from "../context/ContextProvider";
import { createRoom } from "../server/homePage";
import { useThrottling } from "../utils/throttling";

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
  }, [state.newChatModel.roomPass, state.newChatModel.roomPhrase, throttlingFn, dispatch]);

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
  }, [joinRoomStatus, state.newChatModel.error, state.newChatModel.loading, state.newChatModel.roomPhrase, dispatch, handleModelClose]);

  return (
    <div className="fixed z-20 top-20 sm:top-10 left-1/2 -translate-x-1/2 min-h-[35vh] w-[90vw] sm:w-[60vw] rounded-2xl bg-[#090e13] shadow-[0_0_40px_rgba(0,255,170,0.3)] p-6 flex flex-col items-center animate-fade-in">
      {/* Close Button */}
      <TfiClose
        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-2xl cursor-pointer shadow-md transition-all duration-300"
        title="close"
        onClick={handleModelClose}
      />

      {/* Success */}
      {state.newChatModel.success && !state.newChatModel.error && (
        <div className="text-2xl text-green-400 font-semibold animate-pulse drop-shadow-md">
          {state.newChatModel.success}
        </div>
      )}

      {/* Error */}
      {state.newChatModel.error ? (
        <div className="text-red-400 mt-10 text-center p-4 flex flex-col justify-center gap-4 bg-red-950/30 rounded-xl shadow-lg">
          {state.newChatModel.error}
          <button
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-white mx-auto cursor-pointer transition-all duration-300"
            onClick={() => {
              dispatch({ type: "SET_ERROR_NEW_CHAT_MODEL", value: "" });
              dispatch({ type: "SET_SUCCESS_NEW_CHAT_MODEL", value: "" });
              setJoinRoomStatus("idle");
            }}
          >
            🔄 Retry
          </button>
        </div>
      ) : (
        <>
          {/* Input Fields */}
          <div className="flex flex-col items-center mt-6 gap-6 w-full sm:w-[80%]">
            {/* Room Phrase */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="RoomPhrase" className="text-white font-medium">
                Room ID (4-word phrase):
              </label>
              <input
                type="text"
                className="outline-none border border-gray-600 focus:border-green-400 focus:ring-2 focus:ring-green-400/60 bg-[#0d141a] text-white rounded-xl p-3 transition-all duration-300"
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
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="pass" className="text-white font-medium">
                Password (optional):
              </label>
              <input
                type="password"
                className="outline-none border border-gray-600 focus:border-green-400 focus:ring-2 focus:ring-green-400/60 bg-[#0d141a] text-white rounded-xl p-3 transition-all duration-300"
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
            </div>
          </div>

          {/* Join Button */}
          <button
            className="bg-green-500 hover:bg-green-600 flex items-center gap-2 px-6 py-3 rounded-2xl mt-6 text-white font-semibold text-lg shadow-lg shadow-green-500/30 cursor-pointer transition-all duration-300 hover:scale-105"
            title="Join Room"
            onClick={handleCreateRoom}
          >
            🚀 Join Room{" "}
            {state.newChatModel.loading && (
              <div className="border-2 border-transparent rounded-full border-x-white animate-spin w-5 h-5" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default NewChat;
