import { create } from 'zustand'

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(7);
const initialChatId = generateId();

const useStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  apiKey: localStorage.getItem('apiKey') || '',
  setApiKey: (key) => {
    localStorage.setItem('apiKey', key);
    set({ apiKey: key });
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null });
  },
  
  chats: [{ id: initialChatId, title: 'New Chat', messages: [] }],
  activeChatId: initialChatId,
  
  createNewChat: () => set((state) => {
    const newChat = { id: generateId(), title: 'New Chat', messages: [] };
    return {
      chats: [newChat, ...state.chats],
      activeChatId: newChat.id
    };
  }),
  
  setActiveChatId: (id) => set({ activeChatId: id }),

  addMessage: (msg) => set((state) => {
    const activeId = state.activeChatId || state.chats[0].id;
    return {
      chats: state.chats.map(chat => {
        if (chat.id === activeId) {
          const newTitle = (chat.messages.length === 0 && msg.role === 'user') 
                           ? (msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content) 
                           : chat.title;
          return { ...chat, title: newTitle, messages: [...chat.messages, msg] };
        }
        return chat;
      }),
      activeChatId: activeId
    };
  }),
  
  clearHistory: () => set({ chats: [{ id: generateId(), title: 'New Chat', messages: [] }] }),
  
  dbStatus: 'disconnected',
  setDbStatus: (status) => set({ dbStatus: status }),
  
  dbName: 'Local Database',
  setDbName: (name) => set({ dbName: name }),

  activeConnectionId: null,
  setActiveConnectionId: (id) => set({ activeConnectionId: id }),
}));

export default useStore;
