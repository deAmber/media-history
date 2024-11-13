import { create } from "zustand";

const driveData = create((set) => ({
  meta: {},
  setMeta: (option) => (set({meta: option})),
  movies: {},
  setMovies: (option) => (set({movies: option})),
  shows: {},
  setShows: (option) => (set({shows: option})),
  games: {},
  setGames: (option) => (set({games: option})),
  books: {},
  setBooks: (option) => (set({books: option})),
}));

export default driveData;