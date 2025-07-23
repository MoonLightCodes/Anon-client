import React from "react";
import { useGlobalContext } from "../context/ContextProvider";

const Home = () => {
  const { state, dispatch } = useGlobalContext();
  // console.log(state.chats)
  
  return (
    <div
      className={`w-full  flex justify-center items-center ${
        state.phraseModel.isOpen ? "pointer-events-none" : ""
      }`}
    >
      <div className="w-full sm:max-w-xl m-1 mt-20 sm:mt-0 sm:w-[70%] p-2 flex flex-col gap-2 ">
        <h1 className="text-2xl select-none font-bold text-center rounded-2xl border p-2">
          Create New Room
        </h1>
        <form className="group">
          <div className="flex gap-2 items-center ">
            <label htmlFor="pass">Set Password</label>
            <input
              type="text"
              id="pass"
              className=" outline-none border p-1 rounded-xl "
              placeholder="Enter some password"
              value={state.homePage.createRoomPass}
              onChange={({ target: { value } }) =>
                dispatch({
                  type: "SET_CREATE_ROOM_PASS",
                  value: value,
                })
                
              }
            />
          </div>
          <p className="text-xs text-red-300 hidden group-focus-within:block text-center">
            "leave this field empty to make the room open for all"
          </p>
        </form>
        <button
          className="p-2 bg-green-400 rounded-lg cursor-pointer"
          onClick={() => void(dispatch({ type: "PHRASE_MODEL_TOGGLE" }))}
        >
          Generate Phrase
        </button>
      </div>
    </div>
  );
};

export default Home;
