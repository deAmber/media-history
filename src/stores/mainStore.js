import { create } from "zustand";

const mainStore = create((set) => ({
  type: {value: 'movie', label: 'Movies'},
  setType: (option) => (set({type: option})),
  year: null,
  setYear: (option) => (set({year: option})),
  user: false,
  setUser: (option) => (set({user: option})),
}));

export default mainStore;