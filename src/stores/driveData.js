import { create } from "zustand";

const driveData = create((set) => ({
  meta: {},
  setMeta: (option) => (set({meta: option})),
  movies: {},
  setMovies: (option) => (set({movies: option})),
}));

export default driveData;