import { create } from 'zustand'

const useStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null });
  },
  
  chatHistory: [],
  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearHistory: () => set({ chatHistory: [] }),
  
  dbStatus: 'disconnected',
  setDbStatus: (status) => set({ dbStatus: status }),
}));

export default useStore;
