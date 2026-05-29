const fs = require('fs');
let c = fs.readFileSync('src/components/ChatDashboard.jsx', 'utf8');

// 1. Update useStore destructurings
c = c.replace(
  /const \{ token, logout, chatHistory, addMessage, dbStatus, dbName \} = useStore\(\);/,
  `const { token, logout, chats, activeChatId, addMessage, createNewChat, setActiveChatId, dbStatus, dbName } = useStore();\n  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];\n  const chatHistory = activeChat ? activeChat.messages : [];`
);

// 2. Add New Chat button
c = c.replace(
  /<nav className="flex-1 flex flex-col gap-2 mt-2">/,
  `<nav className="flex-1 flex flex-col gap-2 mt-2">\n            <button onClick={() => { createNewChat(); setActiveTab('chat'); setSidebarOpen(false); }} className="flex items-center justify-center gap-2 px-4 py-3 mb-2 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 w-full">\n                <span className="material-symbols-outlined font-bold">add</span>\n                New Chat\n            </button>`
);

// 3. Update History Tab rendering
const newHistoryBlock = `                {activeTab === 'history' && (
                    <div className="flex flex-col mt-4">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6">Chat Sessions</h2>
                        {chats.length > 0 && chats.some(c => c.messages.length > 0) ? (
                            <div className="flex flex-col gap-4">
                                {chats.filter(c => c.messages.length > 0).map((chat) => (
                                    <div key={chat.id} onClick={() => { setActiveChatId(chat.id); setActiveTab('chat'); }} className="bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all active:scale-[0.99] group">
                                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chat_bubble</span>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-body-lg text-on-surface group-hover:text-primary transition-colors truncate">{chat.title}</p>
                                            <p className="font-body-sm text-on-surface-variant truncate text-xs mt-1">{chat.messages.length} messages</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center mt-12 text-on-surface-variant/50">
                                <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">history</span>
                                <p className="font-body-lg text-body-lg text-on-surface">No history yet</p>
                                <p className="font-body-sm text-body-sm mt-2">Your past chat sessions will appear here.</p>
                            </div>
                        )}
                    </div>
                )}`;

// Match the old history block which we modified recently
const historyRegex = /\{activeTab === 'history' && \([\s\S]*?<h2 className="font-display text-headline-sm font-bold text-primary mb-6">Query History<\/h2>[\s\S]*?<div className="flex flex-col gap-4">[\s\S]*?\{chatHistory\.filter\(msg => msg\.role === 'user'\)\.map\(\(msg, idx\) => \([\s\S]*?<div key=\{idx\} onClick=\{\(\) => setActiveTab\('chat'\)\} className="bg-surface-container-low\/60 backdrop-blur-md rounded-xl border border-white\/5 p-4 flex items-center gap-4 cursor-pointer hover:bg-white\/\[0\.05\] transition-all active:scale-\[0\.99\] group">[\s\S]*?<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">history<\/span>[\s\S]*?<p className="font-body-lg text-on-surface flex-1 group-hover:text-primary transition-colors">\{msg\.content\}<\/p>[\s\S]*?<\/div>[\s\S]*?\)\)[\s\S]*?<\/div>[\s\S]*?: \([\s\S]*?<div className="flex flex-col items-center justify-center mt-12 text-on-surface-variant\/50">[\s\S]*?<span className="material-symbols-outlined text-\[64px\] mb-4 text-primary\/30">history<\/span>[\s\S]*?<p className="font-body-lg text-body-lg text-on-surface">No history yet<\/p>[\s\S]*?<p className="font-body-sm text-body-sm mt-2">Your past queries will appear here\.<\/p>[\s\S]*?<\/div>[\s\S]*?\)[\s\S]*?<\/div>[\s\S]*?\)\}/;

c = c.replace(historyRegex, newHistoryBlock);

fs.writeFileSync('src/components/ChatDashboard.jsx', c);
console.log("History tab successfully updated");
