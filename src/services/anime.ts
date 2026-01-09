import api from "./api";

export const getAnimeList = async () => {
  const res = await api.get("/anime"); 
  return res.data;
};
