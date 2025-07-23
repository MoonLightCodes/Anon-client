import axios from "axios";
import paths from "./endPoints";

export const createRoom = (roomPass, roomPhrase, name) => {
  return axios.post(
    paths.createRoom,
    { roomPass, roomPhrase, name },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};
export const genRoom = (roomPass) => {
  return axios.post(
    paths.genRoom,
    { roomPass },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};

export const getChats = () => {
  return axios.get(paths.getChats, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
};
export const deleteChat = (roomPhrase) => {
  return axios.put(
    paths.deleteChat,
    { roomPhrase },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};
export const exitChat = (roomPhrase) => {
  return axios.put(
    paths.exitChat,
    { roomPhrase },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
};
