import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MainElement from "./components/MainElement";
import Chats from "./pages/Chats";
import IndiChats from "./pages/IndiChats";
import PhraseOutModel from "./components/PhraseOutModel";
import { useGlobalContext } from "./context/ContextProvider";
import NewChat from "./components/NewChat";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { getChats } from "./server/homePage";
import GenAiMain from "./pages/genAi/GenAiMain.jsx";
import SudokuMain from "./pages/Sudoku.jsx";
import LearnMore from "./pages/LearnMore.jsx";

export const App = () => {
  const {
    state,
    state: {
      phraseModel: { isOpen },
    },
    state: {
      newChatModel: { isOpen: newChatModelIsOpen },
    },
    dispatch,
  } = useGlobalContext();
  useEffect(() => {
    (async function () {
      const data = await getChats();
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: data.data.data.activeChats,
      });
    })();
  }, [state.phraseModel, state.newChatModel]);
  useEffect(() => {
    (async function () {
      const data = await getChats();
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: data.data.data.activeChats,
      });
    })();
  }, []);

  return (
    <>
      {isOpen && <PhraseOutModel />}
      {newChatModelIsOpen && <NewChat />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<MainElement />}>
          <Route path="/home" element={<Home />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/indiChat" element={<IndiChats />} />
          <Route path="/P-AI" element={<GenAiMain />} />
          <Route path="/game" element={<SudokuMain />} />
          <Route path="/learnmore" element={<LearnMore />} />
        </Route>
      </Routes>
    </>
  );
};
export default App;
