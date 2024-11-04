import { create } from "zustand";

//Stores meta information about the user
//TODO: read in values on login/load
const metaStore = create((set) => ({
  supportedYears: [2024],
  addSupportedYear: (option) => set((state) => ({supportedYears: [...new Set([...state.supportedYears, option])]}))
}));

export default metaStore;