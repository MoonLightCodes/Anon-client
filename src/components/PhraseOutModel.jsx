import React, { useEffect, useState } from "react";
import { TfiClose } from "react-icons/tfi";
import { useGlobalContext } from "../context/ContextProvider";
import { PiClipboardTextThin } from "react-icons/pi";
import { useThrottling } from "../utils/throttling";
import { PiNetworkSlashLight } from "react-icons/pi";
import { genRoom } from "../server/homePage";
import { TiTickOutline } from "react-icons/ti";

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

  return (
    <div className="fixed sm:max-w-md min-h-20 w-[90vw] flex flex-col p-3 sm:w-[70vw] left-1/2 sm:top-1/3 top-1/6 bg-[#2a384a] -translate-1/2 mt-15 rounded  ">
      {loading ? (
        <Loading />
      ) : state.phraseModel.error ? (
        <div>
          <TfiClose
            title="close"
            className="text-2xl bg-red-400 p-1 rounded-full absolute -right-4 -top-4 cursor-pointer"
            onClick={() =>
              void (dispatch({ type: "PHRASE_MODEL_TOGGLE" }),
              dispatch({ type: "SET_CREATE_ROOM_PASS", value: "" }),
              dispatch({ type: "SET_PHRASE_MODEL_PHRASE", value: "" }))
            }
          />
          <div className="text-center text-2xl flex justify-center items-center gap-5 text-red-400 select-none">
            {state.phraseModel.error}{" "}
            <span>
              <PiNetworkSlashLight />
            </span>
          </div>
        </div>
      ) : (
        <div className="relative ">
          <TfiClose
            title="close"
            className="text-2xl bg-red-400 p-1 rounded-full absolute -right-4 -top-4 cursor-pointer"
            onClick={() =>
              void (dispatch({ type: "PHRASE_MODEL_TOGGLE" }),
              dispatch({ type: "SET_CREATE_ROOM_PASS", value: "" }),
              dispatch({ type: "SET_PHRASE_MODEL_PHRASE", value: "" }))
            }
          />
          <div className="relative mt-10 w-[80%] mx-auto bg-[#0a1017] rounded-sm flex flex-col">
            {copied ? (
              <div className="absolute flex gap-3 items-center justify-center right-1 top-1 text-sm text-green-400 bg-[#0a1017] px-2 py-1 rounded">
               <TiTickOutline className="text-2xl" /> Copied!
              </div>
            ) : (
              <PiClipboardTextThin
                className="absolute right-1 top-1 bg-indigo-400 rounded-full text-2xl p-1 cursor-pointer"
                title="copy"
                onClick={() => {
                  navigator.clipboard.writeText(state.phraseModel.phrase);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              />
            )}
            <div className="mt-10 mb-2 mb text-center text-green-400  p-2 bg-[#05080b] mx-auto px-4 rounded-2xl">
              <span className="select-none text-white">Room Phrase is: </span>
              {state.phraseModel.phrase}
            </div>
            {!!state.homePage.createRoomPass && (
              <div className="mt-2 mb-5 text-green-400 text-center p-2 bg-[#05080b] mx-auto px-4 rounded-2xl">
                <span className="select-none text-white">
                  Room Password is:{" "}
                </span>
                {state.homePage.createRoomPass}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhraseOutModel;

function Loading() {
  return (
    <div className="w-20 aspect-square rounded-full border-2 border-x-[#0a1017] border-transparent animate-spin mx-auto" />
  );
}
