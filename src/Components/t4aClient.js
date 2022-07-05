import axios from "axios";

const t4aClient = axios.create({
  baseURL: "https://gameinfo.albiononline.com/api/gameinfo/",
});

export default t4aClient;
