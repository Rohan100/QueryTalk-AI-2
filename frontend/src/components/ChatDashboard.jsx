import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChatDashboard() {
  const navigate = useNavigate();
  const { token, logout, chatHistory, addMessage, dbStatus } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
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
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="font-body-sm text-body-sm antialiased overflow-hidden h-screen w-screen flex items-center justify-center relative">
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-low/40 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-primary/5 flex flex-col p-gutter z-50">
<div className="mb-10 pl-2">
<h1 className="font-display text-headline-md font-bold text-primary tracking-tight">QueryTalk AI</h1>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Enterprise Tier</p>
</div>
<nav className="flex-1 flex flex-col gap-2">
<a onClick={(e) => { e.preventDefault(); setActiveTab('analytics'); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'analytics' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
<span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'analytics' ? "'FILL' 1" : "'FILL' 0"}}>dashboard</span>
<span className="font-body-lg text-body-lg">Analytics</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveTab('chat'); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'chat' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
<span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'chat' ? "'FILL' 1" : "'FILL' 0"}}>terminal</span>
<span className="font-body-lg text-body-lg">SQL Chat</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveTab('databases'); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'databases' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
<span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'databases' ? "'FILL' 1" : "'FILL' 0"}}>database</span>
<span className="font-body-lg text-body-lg">Databases</span>
</a>
<a onClick={(e) => { e.preventDefault(); setActiveTab('history'); }} className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 active:scale-95 transition-transform ${activeTab === 'history' ? 'bg-secondary-container text-on-secondary-container font-medium' : 'text-on-surface-variant hover:bg-surface-variant/50'}`} href="#">
<span className="material-symbols-outlined text-label-mono" style={{fontVariationSettings: activeTab === 'history' ? "'FILL' 1" : "'FILL' 0"}}>history</span>
<span className="font-body-lg text-body-lg">History</span>
</a>
</nav>
<div className="mt-auto flex flex-col gap-4">
<button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl bg-primary-container/20 text-primary border border-primary/30 font-medium hover:bg-primary-container/30 transition-all active:scale-95">
                Logout
            </button>
<div className="border-t border-white/5 pt-4 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined text-label-mono text-[20px]">settings</span>
<span className="font-body-sm text-body-sm">Settings</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined text-label-mono text-[20px]">help_outline</span>
<span className="font-body-sm text-body-sm">Support</span>
</a>
</div>
</div>
</aside>
      <div className="ml-[280px] flex-1 flex flex-col relative h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] bg-surface/30 backdrop-blur-md border-b border-white/5 flex justify-between items-center h-16 px-margin-desktop z-40">
<div className="flex items-center gap-6">
<nav className="flex items-center gap-6">
<a className="text-on-surface-variant font-medium font-body-sm text-body-sm hover:text-primary transition-all focus-within:ring-1 ring-primary/20" href="#">Docs</a>
<a className="text-on-surface-variant font-medium font-body-sm text-body-sm hover:text-primary transition-all focus-within:ring-1 ring-primary/20" href="#">API</a>
<a className="text-on-surface-variant font-medium font-body-sm text-body-sm hover:text-primary transition-all focus-within:ring-1 ring-primary/20" href="#">Logs</a>
</nav>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full border border-white/10">
<span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(137,206,255,0.8)]"></span>
<span className="font-label-mono text-label-mono text-secondary">Connected: Analytics_DB</span>
</div>
<div className="w-px h-6 bg-white/10 mx-2"></div>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">shield</span>
</button>
<button className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors px-3 py-1.5">
                    Share
                </button>
<button className="bg-primary text-on-primary font-medium font-body-sm text-body-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(173,198,255,0.2)]">
                    Connect DB
                </button>
<div className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-white/20">
<img alt="User Avatar" className="w-full h-full object-cover" data-alt="A close up, high resolution portrait of a professional individual looking slightly off-camera. The lighting is soft and flattering, creating a premium, modern tech industry aesthetic. The background is completely neutral and subtly out of focus, colored in deep dark tones that perfectly match a minimalist dark-mode UI environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlUlP37Kr7hG9AMroagV09jBtw_oQkciSuV9RfKSHQdcqn3CSaDNtcf5AjH2kZcjyoniZavtoNE1XpLBWV4HYDBwDB7Vlg6jiQ-OYU8WmPeTVAy25L54yk1c0SXK_HhbVxdlOH2dogkttXeBlW3Xj-0j3zAHT9pUqNsNV3uoyfKT_b9-CLpNQJ_J-fSjfua2RdUyZsbmsP3xYNLX231W2T5Za78gG9zVHwFssV4lqpB5P52JVqxIToxvJagzvZNgsP8GNGuYGQOUR_"/>
</div>
</div>
</header>
        <main className="flex-1 mt-16 overflow-y-auto pb-32 scroll-smooth">
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

                {activeTab === 'analytics' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">dashboard</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Analytics Dashboard</p>
                        <p className="font-body-sm text-body-sm mt-2">Visual reports and insights will appear here.</p>
                    </div>
                )}
                {activeTab === 'databases' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">database</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Connected Databases</p>
                        <p className="font-body-sm text-body-sm mt-2">Manage your data sources here.</p>
                        <div className="mt-8 w-full max-w-md bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 p-4 flex items-center gap-4">
                            <span className="material-symbols-outlined text-secondary text-3xl">database</span>
                            <div className="flex-1">
                                <h3 className="text-body-lg font-medium text-on-surface">Analytics_DB</h3>
                                <p className="text-body-sm text-on-surface-variant">Connected</p>
                            </div>
                            <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(137,206,255,0.8)]"></span>
                        </div>
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="flex flex-col mt-4">
                        <h2 className="font-display text-headline-sm font-bold text-primary mb-6">Query History</h2>
                        {chatHistory.filter(msg => msg.role === 'user').length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {chatHistory.filter(msg => msg.role === 'user').map((msg, idx) => (
                                    <div key={idx} className="bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 p-4 flex items-center gap-4">
                                        <span className="material-symbols-outlined text-on-surface-variant">history</span>
                                        <p className="font-body-lg text-on-surface flex-1">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center mt-12 text-on-surface-variant/50">
                                <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">history</span>
                                <p className="font-body-lg text-body-lg text-on-surface">No history yet</p>
                                <p className="font-body-sm text-body-sm mt-2">Your past queries will appear here.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
        
        {activeTab === 'chat' && (
            <div className="absolute bottom-0 left-0 w-full px-margin-desktop pb-8 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
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
  );
}
