import create from 'zustand';

const useLocationStore = create((set) => ({
  locations: [],
  addLocation: (location) => set((state) => ({
    locations: [
      ...state.locations,
      {
        ...location,
        timestamp: new Date().getTime(), // Add a timestamp
      },
    ],
  })),
}));

export default useLocationStore;
