import React, { useEffect, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import { useGlobalContext } from "../context/ContextProvider";
import { PiClipboardTextThin, PiNetworkSlashLight } from "react-icons/pi";
import { TiTickOutline } from "react-icons/ti";
import { useThrottling } from "../utils/throttling";
import { genRoom } from "../server/homePage";

const PhraseOutModel = () => {
  const {
    state,
    state: {
      phraseModel: { isOpen, loading },
    },
    dispatch,
  } = useGlobalContext();

  const [copied, setCopied] = useState(false);
  const throttlingFn = useThrottling();

  useEffect(() => {
    throttlingFn(
      () => genRoom(state.homePage.createRoomPass),
      "SET_PHRASE_MODEL_PHRASE",
      "SET_PHRASE_MODEL_LOADING",
      "SET_PHRASE_MODEL_ERROR"
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 🔥 Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={() =>
          void (
            dispatch({ type: "PHRASE_MODEL_TOGGLE" }),
            dispatch({ type: "SET_CREATE_ROOM_PASS", value: "" }),
            dispatch({ type: "SET_PHRASE_MODEL_PHRASE", value: "" })
          )
        }
      />
      {/* 🔥 Modal Card */}
      <div className="relative bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 sm:p-8 rounded-2xl shadow-2xl w-[90%] sm:w-[480px] animate-scaleUp text-white">
        {/* Close button */}
        <TfiClose
          title="close"
          className="text-xl bg-red-500 hover:bg-red-600 p-1 rounded-full absolute -right-4 -top-4 cursor-pointer shadow-lg transition-transform hover:rotate-90"
          onClick={() =>
            void (
              dispatch({ type: "PHRASE_MODEL_TOGGLE" }),
              dispatch({ type: "SET_CREATE_ROOM_PASS", value: "" }),
              dispatch({ type: "SET_PHRASE_MODEL_PHRASE", value: "" })
            )
          }
        />

        {/* Content */}
        {loading ? (
          <Loading />
        ) : state.phraseModel.error ? (
          <div className="text-center text-xl flex flex-col items-center justify-center gap-4 text-red-400 select-none">
            <PiNetworkSlashLight className="text-4xl animate-pulse" />
            <span>{state.phraseModel.error}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Copy Icon */}
            {copied ? (
              <div className="absolute flex gap-2 items-center right-2 top-2 text-sm text-green-400 bg-black/40 px-3 py-1 rounded-lg shadow">
                <TiTickOutline className="text-xl" /> Copied!
              </div>
            ) : (
              <PiClipboardTextThin
                className="absolute right-2 top-2 bg-indigo-500 hover:bg-indigo-600 rounded-full text-3xl p-2 cursor-pointer transition-all shadow-lg"
                title="copy"
                onClick={() => {
                  navigator.clipboard.writeText(state.phraseModel.phrase);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              />
            )}

            {/* Phrase */}
            <div className="text-center bg-black/40 p-4 rounded-xl shadow-md border border-gray-700">
              <span className="block text-gray-300 mb-2">Room Phrase</span>
              <span className="text-green-400 text-lg font-semibold tracking-wide">
                {state.phraseModel.phrase}
              </span>
            </div>

            {/* Password (if exists) */}
            {!!state.homePage.createRoomPass && (
              <div className="text-center bg-black/40 p-4 rounded-xl shadow-md border border-gray-700">
                <span className="block text-gray-300 mb-2">Room Password</span>
                <span className="text-green-400 text-lg font-semibold tracking-wide">
                  {state.homePage.createRoomPass}
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

function Loading() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="w-14 h-14 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}


