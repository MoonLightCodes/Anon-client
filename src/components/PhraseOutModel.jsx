import React, { useEffect, useState, useCallback } from "react";
import { TfiClose } from "react-icons/tfi";
import { PiClipboardTextThin, PiNetworkSlashLight } from "react-icons/pi";
import { TiTickOutline } from "react-icons/ti";
import { useGlobalContext } from "../context/ContextProvider";
import { useThrottling } from "../utils/throttling";
import { genRoom } from "../server/homePage";

const PhraseOutModel = () => {
  const {
    state,
    state: {
      phraseModel: { isOpen, loading, error, phrase },
      homePage: { createRoomPass },
    },
    dispatch,
  } = useGlobalContext();

  const [copied, setCopied] = useState(false);
  const throttlingFn = useThrottling();

  // 🔹 Unified close/reset handler
  const handleClose = useCallback(() => {
    dispatch({ type: "PHRASE_MODEL_TOGGLE" });
    dispatch({ type: "SET_CREATE_ROOM_PASS", value: "" });
    dispatch({ type: "SET_PHRASE_MODEL_PHRASE", value: "" });
  }, [dispatch]);

  // 🔹 Generate room phrase on mount
  useEffect(() => {
    throttlingFn(
      () => genRoom(createRoomPass),
      "SET_PHRASE_MODEL_PHRASE",
      "SET_PHRASE_MODEL_LOADING",
      "SET_PHRASE_MODEL_ERROR"
    );

    // Cleanup copied state when modal closes
    return () => setCopied(false);
  }, [createRoomPass, throttlingFn]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* 🔥 Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />

      {/* 🔥 Modal Card */}
      <div className="relative bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 sm:p-8 rounded-2xl shadow-2xl w-[90%] sm:w-[480px] animate-scaleUp text-white">
        {/* Close button */}
        <TfiClose
          title="Close"
          aria-label="Close modal"
          className="text-xl bg-red-500 hover:bg-red-600 p-1 rounded-full absolute -right-4 -top-4 cursor-pointer shadow-lg transition-transform hover:rotate-90"
          onClick={handleClose}
        />

        {/* Content */}
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-center text-xl flex flex-col items-center justify-center gap-4 text-red-400 select-none">
            <PiNetworkSlashLight className="text-4xl animate-pulse" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Copy Status / Button */}
            {copied ? (
              <div className="absolute flex gap-2 items-center right-2 top-2 text-sm text-green-400 bg-black/40 px-3 py-1 rounded-lg shadow">
                <TiTickOutline className="text-xl" /> Copied!
              </div>
            ) : (
              <PiClipboardTextThin
                className="absolute right-2 top-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-3xl p-2 cursor-pointer transition-all shadow-lg"
                title="Copy phrase"
                aria-label="Copy room phrase"
                onClick={() => {
                  navigator.clipboard.writeText(phrase);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              />
            )}

            {/* Phrase */}
            <div className="text-center bg-black/40 p-4 rounded-xl shadow-md border border-gray-700">
              <span className="block text-gray-300 mb-2">Room Phrase</span>
              <span className="text-green-400 text-lg font-semibold tracking-wide">
                {phrase}
              </span>
            </div>

            {/* Password (if exists) */}
            {!!createRoomPass && (
              <div className="text-center bg-black/40 p-4 rounded-xl shadow-md border border-gray-700">
                <span className="block text-gray-300 mb-2">Room Password</span>
                <span className="text-green-400 text-lg font-semibold tracking-wide">
                  {createRoomPass}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseOutModel;

/* 🔹 Loading Spinner */
function Loading() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="w-14 h-14 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}
