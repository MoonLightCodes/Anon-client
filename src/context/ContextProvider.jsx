import React, { createContext, useContext, useReducer } from "react";
import { io } from "socket.io-client";

const socket = io("https://anon-server-9ykk.onrender.com/", {
  auth: {
    userId: localStorage.getItem("userId"), // Must be a valid MongoDB ObjectId
  },
});

const contextP = createContext();
export const useGlobalContext = () => useContext(contextP);

const initialState = {
  phraseModel: {
    isOpen: false,
    loading: false,
    error: null,
    phrase: "",
  },
  homePage: {
    createRoomPass: "",
  },
  chats: {
    activeChats: [],
    notification : true,
  },
  newChatModel: {
    isOpen: false,
    name: "",
    roomPhrase: "",
    roomPass: "",
    loading: false,
    error: null,
    success: "",
  },
  user: {
    _id: localStorage.getItem("userId"), // 👈 Replace this with actual user ID logic later
    name: localStorage.getItem("username"),
  },
  socket: socket,
};

function gReducer(state, payload) {
  switch (payload.type) {
    case "PHRASE_MODEL_TOGGLE":
      return {
        ...state,
        phraseModel: {
          ...state.phraseModel,
          isOpen: !state.phraseModel.isOpen,
        },
      };
    case "SET_PHRASE_MODEL_LOADING":
      return {
        ...state,
        phraseModel: {
          ...state.phraseModel,
          loading: payload.value,
        },
      };
    case "SET_PHRASE_MODEL_ERROR":
      return {
        ...state,
        phraseModel: {
          ...state.phraseModel,
          error: payload.value,
        },
      };
    case "SET_PHRASE_MODEL_PHRASE":
      return {
        ...state,
        phraseModel: {
          ...state.phraseModel,
          phrase: payload.value,
        },
      };
    case "SET_CREATE_ROOM_PASS":
      return {
        ...state,
        homePage: {
          ...state.homePage,
          createRoomPass: payload.value,
        },
      };
    case "SET_NOTIFICATION":
      return {
        ...state,
        chats: {
          ...state.notification,
          notification: payload.value,
        },
      };
      case "TOGGLE_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          isOpen: !state.newChatModel.isOpen,
        },
      };
    case "SET_NAME_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          name: payload.value,
        },
      };
    case "SET_LOADING_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          loading: payload.value,
        },
      };
    case "SET_ERROR_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          error: payload.value,
        },
      };
    case "SET_ROOMPHRASE_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          roomPhrase: payload.value,
        },
      };
    case "SET_SUCCESS_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          success: payload.value,
        },
      };
    case "SET_PASS_NEW_CHAT_MODEL":
      return {
        ...state,
        newChatModel: {
          ...state.newChatModel,
          roomPass: payload.value,
        },
      };
    case "ADD_NEW_CHATS":
      return {
        ...state,
        chats: {
          ...state.chats,
          activeChats: [payload.value, ...state.chats.activeChats],
        },
      };
    case "ADD_NEW_MESSAGE":
      return {
        ...state,
        chats: {
          ...state.chats,
          activeChats: state.chats.activeChats.map((chat) =>
            chat.phrase === payload.value.phrase
              ? {
                  ...chat,
                  messages: Array.isArray(chat.messages)
                    ? [...chat.messages, payload.value.message]
                    : [payload.value.message],
                }
              : chat
          ),
        },
      };
    case "ADD_LOCAL_MESSAGE":
      return {
        ...state,
        chats: {
          ...state.chats,
          activeChats: state.chats.activeChats.map((chat) =>
            chat.phrase === action.value.phrase
              ? {
                  ...chat,
                  messages: [...chat.messages, action.value.message],
                }
              : chat
          ),
        },
      };

    case "POPULATE_NEW_CHATS":
      return {
        ...state,
        chats: {
          ...state.chats,
          activeChats: [...payload.value],
        },
      };
    default:
      return state;
  }
}

const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gReducer, initialState);

  return (
    <contextP.Provider value={{ state, dispatch }}>
      {children}
    </contextP.Provider>
  );
};

export default ContextProvider;
