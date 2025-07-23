import axios from "axios";
import paths from "./endPoints";

export const signUpApi = (username, password) => {
  return axios.post(paths.signUp, { username, password });
};
