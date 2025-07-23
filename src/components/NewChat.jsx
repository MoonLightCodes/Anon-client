import React, { useCallback, useEffect, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import { useGlobalContext } from "../context/ContextProvider";
import { createRoom } from "../server/homePage";
import { useThrottling } from "../utils/throttling";
import { useRef } from "react";

const NewChat = () => {
  const { state, dispatch } = useGlobalContext();

  const throttlingFn = useCallback(useThrottling(), []);
  const [joinRoomStatus, setJoinRoomStatus] = useState("idle");

  const handleModelClose = useCallback(() => {
    dispatch({ type: "TOGGLE_NEW_CHAT_MODEL" });
    dispatch({ type: "SET_NAME_NEW_CHAT_MODEL", value: "" });
    dispatch({ type: "SET_ROOMPHRASE_NEW_CHAT_MODEL", value: "" });
    dispatch({ type: "SET_PASS_NEW_CHAT_MODEL", value: "" }); // ✅ Reset password
    dispatch({ type: "SET_ERROR_NEW_CHAT_MODEL", value: null });
    dispatch({ type: "SET_LOADING_NEW_CHAT_MODEL", value: false });
    dispatch({ type: "SET_SUCCESS_NEW_CHAT_MODEL", value: "" });
    setJoinRoomStatus("idle");
  }, [dispatch]);

  const handleCreateRoom = useCallback(() => {
    if (state.newChatModel.roomPhrase.trim().split(" ").length !== 4) {
      dispatch({
        type: "SET_ERROR_NEW_CHAT_MODEL",
        value: "Enter the Phrase properly or Name Atleast 5 characters",
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
        value: "Room Joined Successfully",
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
  ]);

  return (
    <div className="fixed z-10 sm:max-w-4xl top-20 sm:top-10 flex flex-col rounded-2xl bg-[#090e13] left-1/2 -translate-x-1/2 min-h-[30vh] w-[90vw] sm:w-[60vw]">
      <div className="relative">
        <TfiClose
          className="absolute -top-2 -right-2 bg-red-400 rounded-full p-1 text-2xl cursor-pointer"
          title="close"
          onClick={handleModelClose}
        />
      </div>

      {state.newChatModel.success && !state.newChatModel.error && (
        <div className="text-2xl text-green-400 text-center">
          {state.newChatModel.success}
        </div>
      )}

      {state.newChatModel.error ? (
        <div className="text-red-400 mt-10 text-center p-2 flex flex-col justify-center gap-4">
          {state.newChatModel.error}
          <button
            className="bg-green-400 p-2 rounded-2xl text-white mx-auto cursor-pointer"
            onClick={() => {
              dispatch({ type: "SET_ERROR_NEW_CHAT_MODEL", value: "" });
              dispatch({ type: "SET_SUCCESS_NEW_CHAT_MODEL", value: "" });
              setJoinRoomStatus("idle");
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center ml-2 mt-10 gap-2">
            <div className="flex flex-col gap-2 group items-center">
              <div className="flex gap-2 items-center">
                <label htmlFor="RoomPhrase">Room ID:</label>
                <input
                  type="text"
                  className="outline-none ml-4 border rounded-2xl p-1"
                  placeholder="Enter The Room Phrase"
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
              <div className="text-red-400 text-sm text-center hidden group-focus-within:block">
                enter the phrase with spaces between
              </div>
            </div>

            {/* ✅ Password Input */}
            <div className="flex flex-col group gap-2 items-center">
              <div className="flex gap-3">
                {" "}
                <label htmlFor="pass">Password:</label>
                <input
                  type="text"
                  className="outline-none border rounded-2xl p-1"
                  placeholder="Enter Password (optional)"
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
              <div className="text-red-400 text-sm text-center hidden group-focus-within:block">
                leave this feild if room is open
              </div>
            </div>
          </div>

          <button
            className="bg-green-400 flex items-center gap-2 mx-auto p-2 rounded-2xl mt-3 cursor-pointer"
            title="Join Room"
            onClick={handleCreateRoom}
          >
            Join Room{" "}
            {state.newChatModel.loading && (
              <div className="border-2 border-transparent rounded-full border-x-white animate-spin w-4 h-4" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default NewChat;
