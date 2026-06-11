import axios from "axios";

export const API_BACKEND = axios.create({
  baseURL: "https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon",
});;