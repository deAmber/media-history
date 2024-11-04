import { create } from "zustand";

const mainStore = create((set) => ({
  type: {value: 'movie', label: 'Movie'},
  setType: (option) => (set({type: option})),
  year: 2024,
  setYear: (option) => (set({year: option})),
  user: false,
  setUser: (option) => (set({user: option})),
}));

export default mainStore;