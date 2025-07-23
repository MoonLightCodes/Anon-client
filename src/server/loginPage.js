import axios from "axios";
import paths from "./endPoints";

export const loginApi = (username, password) => {
  return axios.post(paths.login, { username, password });
};
