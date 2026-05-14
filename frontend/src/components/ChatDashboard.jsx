import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function ChatDashboard() {
  const navigate = useNavigate();
  const { token, logout, chats, activeChatId, addMessage, createNewChat, setActiveChatId, dbStatus, dbName, apiKey, setApiKey } = useStore();
  const [schemaData, setSchemaData] = useState('');
  const [loadingSchema, setLoadingSchema] = useState(false);
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const chatHistory = activeChat ? activeChat.messages : [];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // bypass dbStatus check for now so UI can be seen
    // if (dbStatus === 'disconnected') {
    //   navigate('/connect');
    // }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dbStatus, chatHistory, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMsg });
    setLoading(true);

    try {
      const res = await axios.post(
        '/api/chat/',
        { message: userMsg },
        { headers: { Authorization: `Bearer ${token}`, 'X-API-Key': apiKey || '' } }
      );
      addMessage({
        role: 'assistant',
        content: res.data.reply,
        sql: res.data.sql,
        data: res.data.data
      });
    } catch (err) {
      console.error(err);
      addMessage({ role: 'assistant', content: 'Error communicating with the server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'databases' && dbStatus === 'connected') {
      const fetchSchema = async () => {
        setLoadingSchema(true);
        try {
          const res = await axios.get('/api/db/schema', { headers: { Authorization: `Bearer ${token}` }});
          setSchemaData(res.data.schema);
        } catch(e) {
          console.error(e);
          setSchemaData('Failed to load schema.');
        } finally {
          setLoadingSchema(false);
        }
      };
      fetchSchema();
    }
  }, [activeTab, dbStatus, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderChart = (data) => {
    if (!data || data.length === 0) return null;
    
    const keys = Object.keys(data[0]);
    const stringKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
    const numberKey = keys.find(k => typeof data[0][k] === 'number');

    if (!numberKey) return null;

    return (
      <div className="h-64 mt-4 bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={stringKey} stroke="#a0b4c4" />
            <YAxis stroke="#a0b4c4" />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1a2438', border: 'none', borderRadius: '8px', color: '#fff'}} />
            <Bar dataKey={numberKey} fill="#7dd3fc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  const renderTable = (data) => {
    if (!data || data.length === 0) return null;
    const keys = Object.keys(data[0]);
    
    return (
      <div className="bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
            <span className="font-body-sm text-body-sm font-medium text-on-surface">Data Preview</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
                <thead>
                    <tr className="border-b border-white/5 bg-surface-container/30">
                        {keys.map(k => (
                            <th key={k} className="px-4 py-3 font-medium text-on-surface-variant">{k}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.slice(0, 10).map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            {keys.map(k => (
                                <td key={k} className="px-4 py-3 text-on-surface">{row[k]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  };

  return (
    <div className="font-body-sm text-body-sm antialiased fixed inset-0 flex flex-col overflow-hidden bg-background">
      {/* Top Navbar */}
      <header className="w-full bg-surface/30 backdrop-blur-md border-b border-white/5 flex justify-between items-center h-16 px-4 md:px-margin-desktop z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-display text-title-lg md:text-headline-sm font-bold text-primary tracking-tight leading-none">QueryTalk AI</h1>
            <p className="hidden md:block font-body-sm text-body-sm text-on-surface-variant mt-1 leading-none">Enterprise Tier</p>
          </div>
          
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(137,206,255,0.8)]"></span>
            <span className="font-label-mono text-label-mono text-secondary truncate max-w-[150px]">Connected: {dbName || 'demo.db'}</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>
          <button onClick={() => setActiveTab('notifications')} className={`hidden sm:block hover:text-primary transition-colors ${activeTab === 'notifications' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'notifications' ? "'FILL' 1" : "'FILL' 0"}}>notifications</span>
          </button>
          <button onClick={() => setActiveTab('security')} className={`hidden sm:block hover:text-primary transition-colors ${activeTab === 'security' ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : "'FILL' 0"}}>shield</span>
          </button>
          <button onClick={() => navigate('/connect')} className="bg-primary text-on-primary font-medium font-body-sm text-body-sm px-3 md:px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(173,198,255,0.2)] whitespace-nowrap">
            Connect DB
          </button>
          <div className="ml-1 md:ml-2 w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
            <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlUlP37Kr7hG9AMroagV09jBtw_oQkciSuV9RfKSHQdcqn3CSaDNtcf5AjH2kZcjyoniZavtoNE1XpLBWV4HYDBwDB7Vlg6jiQ-OYU8WmPeTVAy25L54yk1c0SXK_HhbVxdlOH2dogkttXeBlW3Xj-0j3zAHT9pUqNsNV3uoyfKT_b9-CLpNQJ_J-fSjfua2RdUyZsbmsP3xYNLX231W2T5Za78gG9zVHwFssV4lqpB5P52JVqxIToxvJagzvZNgsP8GNGuYGQOUR_" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        
        {/* Sidebar */}
        <aside className={`absolute md:static top-0 left-0 h-full w-[280px] bg-surface-container-low/95 md:bg-surface-container-low/40 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-primary/5 flex flex-col p-4 md:p-gutter z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="md:hidden mb-6 pl-2 pt-2">
            <p className="font-body-sm text-body-sm text-on-surface-variant">Enterprise Tier</p>
          </div>
          <nav className="flex-1 flex flex-col gap-2 mt-2">
            <button onClick={() => { createNewChat(); setActiveTab('chat'); setSidebarOpen(false); }} className="flex items-center justify-center gap-2 px-4 py-3 mb-2 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 w-full">
                <span className="material-symbols-outlined font-bold">add</span>
                New Chat
            </button>
            <a onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'analytics' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
            <span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'analytics' ? "'FILL' 1" : "'FILL' 0"}}>dashboard</span>
            <span className="font-body-lg text-body-lg">Analytics</span>
            </a>
            <a onClick={(e) => { e.preventDefault(); setActiveTab('chat'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'chat' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
            <span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'chat' ? "'FILL' 1" : "'FILL' 0"}}>terminal</span>
            <span className="font-body-lg text-body-lg">SQL Chat</span>
            </a>
            <a onClick={(e) => { e.preventDefault(); setActiveTab('databases'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'databases' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
            <span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'databases' ? "'FILL' 1" : "'FILL' 0"}}>database</span>
            <span className="font-body-lg text-body-lg">Databases</span>
            </a>
            <a onClick={(e) => { e.preventDefault(); setActiveTab('history'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'history' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
            <span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'history' ? "'FILL' 1" : "'FILL' 0"}}>history</span>
            <span className="font-body-lg text-body-lg">History</span>
            </a>
          </nav>
<div className="mt-auto flex flex-col gap-4">
<button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl bg-primary-container/20 text-primary border border-primary/30 font-medium hover:bg-primary-container/30 transition-all active:scale-95">
                Logout
            </button>
<div className="border-t border-white/5 pt-4 flex flex-col gap-1">
<a onClick={(e) => { e.preventDefault(); setActiveTab('settings'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${activeTab === 'settings' ? 'text-primary bg-primary/10 font-medium' : 'text-on-surface-variant hover:text-primary'}`} href="#">
<span className="material-symbols-outlined text-label-mono text-[20px]" style={{fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0"}}>settings</span>
<span className="font-body-sm text-body-sm">Settings</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveTab('support'); setSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-2 rounded-full transition-colors ${activeTab === 'support' ? 'text-primary bg-primary/10 font-medium' : 'text-on-surface-variant hover:text-primary'}`} href="#">
<span className="material-symbols-outlined text-label-mono text-[20px]" style={{fontVariationSettings: activeTab === 'support' ? "'FILL' 1" : "'FILL' 0"}}>help_outline</span>
<span className="font-body-sm text-body-sm">Support</span>
</a>
</div>
</div>
</aside>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background overflow-hidden w-full">
          <main className="flex-1 overflow-y-auto pb-32 scroll-smooth">
            <div className="max-w-[1000px] mx-auto w-full px-gutter pt-8 flex flex-col gap-8">
                {activeTab === 'chat' && (
                    <>
                        {chatHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                                <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">neurology</span>
                                <p className="font-body-lg text-body-lg text-on-surface">Ask me anything about your data.</p>
                                <p className="font-body-sm text-body-sm mt-2">Example: "Show me the top 5 customers by revenue"</p>
                            </div>
                        ) : (
                            chatHistory.map((msg, idx) => (
                                <div key={idx}>
                                    {msg.role === 'user' ? (
                                        <div className="flex justify-end mb-8">
                                            <div className="bg-surface-container-highest text-on-surface px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-white/5 shadow-lg">
                                                <p className="font-body-lg text-body-lg">{msg.content}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-4 max-w-[90%] mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary/20 shrink-0">
                                                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>neurology</span>
                                            </div>
                                            <div className="flex flex-col gap-4 w-full">
                                                <div className="text-on-surface font-body-lg text-body-lg pt-2 whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>
                                                {msg.sql && (
                                                    <div className="bg-[#0f1526] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-xl mt-2">
                                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-container/50">
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-outline text-label-mono text-[16px]">code</span>
                                                                <span className="font-label-mono text-label-mono text-outline">Executed SQL</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 font-label-mono text-label-mono text-secondary/90 leading-relaxed overflow-x-auto">
                                                            <pre><code>{msg.sql}</code></pre>
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.data && renderTable(msg.data)}
                                                {msg.data && renderChart(msg.data)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        
                        {loading && (
                            <div className="flex items-start gap-4 max-w-[90%]">
                                <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary/20 shrink-0">
                                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>neurology</span>
                                </div>
                                <div className="flex items-center gap-2 h-10 px-4 bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 w-fit">
                                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></span>
                                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}

                {activeTab === 'analytics' && (<AnalyticsDashboard />)}
                {activeTab === 'databases' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">database</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Connected Databases</p>
                        <p className="font-body-sm text-body-sm mt-2">Manage your data sources here.</p>
                        <div className="mt-8 w-full max-w-md bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 p-4 flex items-center gap-4">
                            <span className="material-symbols-outlined text-secondary text-3xl">database</span>
                            <div className="flex-1">
                                <h3 className="text-body-lg font-medium text-on-surface">{dbName || 'demo.db'}</h3>
                                <p className="text-body-sm text-on-surface-variant">Connected</p>
                            </div>
                            <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(137,206,255,0.8)]"></span>
                        </div>
                    </div>
                )}
                                {activeTab === 'history' && (
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
                )}

                {activeTab === 'settings' && (
                    <div className="flex flex-col mt-4 max-w-2xl">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined">settings</span> Settings</h2>
                        <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
                            
                            <div>
                              <label className="block text-sm font-medium text-on-surface-variant mb-2">Anthropic API Key</label>
                              <p className="text-xs text-on-surface-variant/70 mb-3">If provided, this key will be used instead of the server's default key.</p>
                              <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)} 
                                placeholder="sk-ant-api03-..." 
                                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-label-mono text-sm"
                              />
                            </div>

                            <hr className="border-white/5" />

                            <div>
                              <h3 className="text-on-surface font-medium mb-3">Theme Preferences</h3>
                              <div className="flex gap-4">
                                <button className="flex-1 py-3 rounded-xl border-2 border-primary bg-primary/10 text-primary font-medium flex items-center justify-center gap-2">
                                  <span className="material-symbols-outlined">dark_mode</span> Dark
                                </button>
                                <button className="flex-1 py-3 rounded-xl border-2 border-white/5 bg-surface-container-high text-on-surface-variant font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                                  <span className="material-symbols-outlined">light_mode</span> Light (Soon)
                                </button>
                              </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'support' && (
                    <div className="flex flex-col mt-4 max-w-3xl">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined">help_outline</span> Support Center</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <span className="material-symbols-outlined text-secondary text-[32px] mb-4">mail</span>
                            <h3 className="text-on-surface font-medium text-lg mb-2">Contact Us</h3>
                            <p className="text-on-surface-variant text-sm mb-4">Need direct assistance? Our team is here to help you get the most out of QueryTalk AI.</p>
                            <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-medium text-sm hover:bg-secondary-container/90 transition-colors">Email Support</button>
                          </div>
                          <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <span className="material-symbols-outlined text-tertiary-container text-[32px] mb-4">book</span>
                            <h3 className="text-on-surface font-medium text-lg mb-2">Documentation</h3>
                            <p className="text-on-surface-variant text-sm mb-4">Read our detailed guides on database connections, query optimization, and more.</p>
                            <button className="bg-surface-container-high text-on-surface border border-white/10 px-4 py-2 rounded-lg font-medium text-sm hover:bg-surface-variant transition-colors">View Docs</button>
                          </div>
                        </div>

                        <h3 className="font-display text-title-lg font-medium text-on-surface mb-4 mt-4">Frequently Asked Questions</h3>
                        <div className="flex flex-col gap-3">
                          <div className="bg-surface-container-high/50 rounded-xl p-4 border border-white/5">
                            <h4 className="text-on-surface font-medium mb-2">How is my API key stored?</h4>
                            <p className="text-on-surface-variant text-sm leading-relaxed">Your API key is stored locally in your browser's localStorage and is sent securely via headers to our backend. It is never persisted in our database.</p>
                          </div>
                          <div className="bg-surface-container-high/50 rounded-xl p-4 border border-white/5">
                            <h4 className="text-on-surface font-medium mb-2">What databases are supported?</h4>
                            <p className="text-on-surface-variant text-sm leading-relaxed">Currently, we support SQLite, PostgreSQL, and MySQL. We are constantly working on adding more database integrations.</p>
                          </div>
                        </div>
                    </div>
                )}


                
            
                {activeTab === 'settings' && (
                    <div className="flex flex-col mt-4 max-w-2xl">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined">settings</span> Settings</h2>
                        <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
                            
                            <div>
                              <label className="block text-sm font-medium text-on-surface-variant mb-2">Anthropic API Key</label>
                              <p className="text-xs text-on-surface-variant/70 mb-3">If provided, this key will be used instead of the server's default key.</p>
                              <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)} 
                                placeholder="sk-ant-api03-..." 
                                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-label-mono text-sm"
                              />
                            </div>

                            <hr className="border-white/5" />

                            <div>
                              <h3 className="text-on-surface font-medium mb-3">Theme Preferences</h3>
                              <div className="flex gap-4">
                                <button className="flex-1 py-3 rounded-xl border-2 border-primary bg-primary/10 text-primary font-medium flex items-center justify-center gap-2">
                                  <span className="material-symbols-outlined">dark_mode</span> Dark
                                </button>
                                <button className="flex-1 py-3 rounded-xl border-2 border-white/5 bg-surface-container-high text-on-surface-variant font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                                  <span className="material-symbols-outlined">light_mode</span> Light (Soon)
                                </button>
                              </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'support' && (
                    <div className="flex flex-col mt-4 max-w-3xl">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined">help_outline</span> Support Center</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <span className="material-symbols-outlined text-secondary text-[32px] mb-4">mail</span>
                            <h3 className="text-on-surface font-medium text-lg mb-2">Contact Us</h3>
                            <p className="text-on-surface-variant text-sm mb-4">Need direct assistance? Our team is here to help you get the most out of QueryTalk AI.</p>
                            <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-medium text-sm hover:bg-secondary-container/90 transition-colors">Email Support</button>
                          </div>
                          <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                            <span className="material-symbols-outlined text-tertiary-container text-[32px] mb-4">book</span>
                            <h3 className="text-on-surface font-medium text-lg mb-2">Documentation</h3>
                            <p className="text-on-surface-variant text-sm mb-4">Read our detailed guides on database connections, query optimization, and more.</p>
                            <button className="bg-surface-container-high text-on-surface border border-white/10 px-4 py-2 rounded-lg font-medium text-sm hover:bg-surface-variant transition-colors">View Docs</button>
                          </div>
                        </div>

                        <h3 className="font-display text-title-lg font-medium text-on-surface mb-4 mt-4">Frequently Asked Questions</h3>
                        <div className="flex flex-col gap-3">
                          <div className="bg-surface-container-high/50 rounded-xl p-4 border border-white/5">
                            <h4 className="text-on-surface font-medium mb-2">How is my API key stored?</h4>
                            <p className="text-on-surface-variant text-sm leading-relaxed">Your API key is stored locally in your browser's localStorage and is sent securely via headers to our backend. It is never persisted in our database.</p>
                          </div>
                          <div className="bg-surface-container-high/50 rounded-xl p-4 border border-white/5">
                            <h4 className="text-on-surface font-medium mb-2">What databases are supported?</h4>
                            <p className="text-on-surface-variant text-sm leading-relaxed">Currently, we support SQLite, PostgreSQL, and MySQL. We are constantly working on adding more database integrations.</p>
                          </div>
                        </div>
                    </div>
                )}
            
                {activeTab === 'notifications' && (
                    <div className="flex flex-col mt-4 max-w-2xl">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined">notifications</span> Notifications</h2>
                        <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
                            <div className="flex gap-4 items-start pb-4 border-b border-white/5">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined">database</span>
                                </div>
                                <div>
                                    <h3 className="text-on-surface font-medium">Database Connected</h3>
                                    <p className="text-on-surface-variant text-sm mt-1">Successfully connected to local SQLite database (demo_v2.db).</p>
                                    <span className="text-xs text-on-surface-variant/50 mt-2 block">Just now</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start pb-4 border-b border-white/5">
                                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <div>
                                    <h3 className="text-on-surface font-medium">Analytics Updated</h3>
                                    <p className="text-on-surface-variant text-sm mt-1">Your dashboard data has been successfully seeded with 500 records.</p>
                                    <span className="text-xs text-on-surface-variant/50 mt-2 block">2 minutes ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className="flex flex-col mt-4 max-w-2xl">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6 flex items-center gap-2"><span className="material-symbols-outlined">shield</span> Security & Access</h2>
                        <div className="bg-surface-container-low/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col gap-6">
                            <div>
                                <h3 className="text-on-surface font-medium mb-2">Connection Encryption</h3>
                                <p className="text-on-surface-variant text-sm mb-4">All queries are executed securely over authenticated sessions. Your API keys are encrypted at rest.</p>
                                <div className="flex items-center gap-2 text-primary">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                    <span className="text-sm font-medium">End-to-End Encrypted</span>
                                </div>
                            </div>
                            <hr className="border-white/5" />
                            <div>
                                <h3 className="text-on-surface font-medium mb-2">Query Safety</h3>
                                <p className="text-on-surface-variant text-sm mb-4">QueryTalk AI strictly generates READ-ONLY SQL queries. Write, Update, and Delete operations are blocked at the middleware layer.</p>
                                <div className="flex items-center gap-2 text-secondary">
                                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                    <span className="text-sm font-medium">Safe Mode Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
        
        {activeTab === 'chat' && (
            <div className="absolute bottom-0 left-0 w-full px-4 md:px-margin-desktop pb-6 md:pb-8 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
                <div className="max-w-[1000px] mx-auto pointer-events-auto">
                    <form onSubmit={handleSend} className="bg-surface-container-highest/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-primary/5 focus-within:ring-primary/30 transition-all">
                        <button type="button" className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary transition-colors shrink-0">
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            disabled={loading}
                            className="bg-transparent border-none focus:ring-0 text-on-surface font-body-lg text-body-lg placeholder-outline w-full px-2" 
                            placeholder="Ask anything about your data..." 
                        />
                        <button type="submit" disabled={loading || !input.trim()} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors shrink-0 shadow-[0_0_15px_rgba(173,198,255,0.3)] disabled:opacity-50">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1", fontSize: "20px"}}>send</span>
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <span className="font-label-mono text-label-mono text-on-surface-variant/60">QueryTalk AI can make mistakes. Consider verifying critical data.</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
    </div>
  );
}
