import os

with open('C:\\Users\\ADMIN\\Desktop\\Demo-Query\\QueryTalk-AI\\frontend\\src\\components\\ChatDashboardStitch.jsx', 'r', encoding='utf-8') as f:
    stitch_content = f.read()

# We will construct the new ChatDashboard.jsx content by combining the logic and the stitch UI
# First, extract the imports and state logic
react_logic = """import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChatDashboard() {
  const navigate = useNavigate();
  const { token, logout, chatHistory, addMessage, dbStatus } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
        'http://localhost:8000/api/chat/',
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
"""

# Now we need to extract the structure of ChatDashboardStitch and inject the react mapping
start_aside_idx = stitch_content.find('<aside')
end_aside_idx = stitch_content.find('</aside>') + len('</aside>')

start_header_idx = stitch_content.find('<header')
end_header_idx = stitch_content.find('</header>') + len('</header>')

start_main_idx = stitch_content.find('<main')
end_main_idx = stitch_content.find('</main>') + len('</main>')

start_footer_idx = stitch_content.find('<div className="absolute bottom-0 left-0 w-full')
end_footer_idx = stitch_content.rfind('</div>', 0, stitch_content.rfind('</div>', 0, stitch_content.rfind('</div>'))) + len('</div>')

layout = f"""
  return (
    <div className="font-body-sm text-body-sm antialiased overflow-hidden h-screen w-screen flex items-center justify-center relative">
      {stitch_content[start_aside_idx:end_aside_idx].replace('Upgrade Plan', 'Logout').replace('<button className="w-full', '<button onClick={handleLogout} className="w-full')}
      <div className="ml-[280px] flex-1 flex flex-col relative h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        {stitch_content[start_header_idx:end_header_idx]}
        <main className="flex-1 mt-16 overflow-y-auto pb-32 scroll-smooth">
            <div className="max-w-[1000px] mx-auto w-full px-gutter pt-8 flex flex-col gap-8">
                {{chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">neurology</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Ask me anything about your data.</p>
                        <p className="font-body-sm text-body-sm mt-2">Example: "Show me the top 5 customers by revenue"</p>
                    </div>
                ) : (
                    chatHistory.map((msg, idx) => (
                        <div key={{idx}}>
                            {{msg.role === 'user' ? (
                                <div className="flex justify-end mb-8">
                                    <div className="bg-surface-container-highest text-on-surface px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-white/5 shadow-lg">
                                        <p className="font-body-lg text-body-lg">{{msg.content}}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4 max-w-[90%] mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary/20 shrink-0">
                                        <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>neurology</span>
                                    </div>
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="text-on-surface font-body-lg text-body-lg pt-2 whitespace-pre-wrap">
                                            {{msg.content}}
                                        </div>
                                        {{msg.sql && (
                                            <div className="bg-[#0f1526] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-xl mt-2">
                                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-container/50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-outline font-label-mono text-label-mono text-[16px]">code</span>
                                                        <span className="font-label-mono text-label-mono text-outline">Executed SQL</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 font-label-mono text-label-mono text-secondary/90 leading-relaxed overflow-x-auto">
                                                    <pre><code>{{msg.sql}}</code></pre>
                                                </div>
                                            </div>
                                        )}}
                                        {{msg.data && renderTable(msg.data)}}
                                        {{msg.data && renderChart(msg.data)}}
                                    </div>
                                </div>
                            )}}
                        </div>
                    ))
                )}}
                
                {{loading && (
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
                )}}
                <div ref={{messagesEndRef}} />
            </div>
        </main>
        
        <div className="absolute bottom-0 left-0 w-full px-margin-desktop pb-8 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
            <div className="max-w-[1000px] mx-auto pointer-events-auto">
                <form onSubmit={{handleSend}} className="bg-surface-container-highest/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-primary/5 focus-within:ring-primary/30 transition-all">
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary transition-colors shrink-0">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <input 
                        type="text" 
                        value={{input}} 
                        onChange={{(e) => setInput(e.target.value)}} 
                        disabled={{loading}}
                        className="bg-transparent border-none focus:ring-0 text-on-surface font-body-lg text-body-lg placeholder-outline w-full px-2" 
                        placeholder="Ask anything about your data..." 
                    />
                    <button type="submit" disabled={{loading || !input.trim()}} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors shrink-0 shadow-[0_0_15px_rgba(173,198,255,0.3)] disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1", fontSize: "20px"}}>send</span>
                    </button>
                </form>
                <div className="text-center mt-3">
                    <span className="font-label-mono text-label-mono text-on-surface-variant/60">QueryTalk AI can make mistakes. Consider verifying critical data.</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}}
"""

layout = layout.replace('style="font-variation-settings: \'FILL\' 1;"', 'style={{fontVariationSettings: "\'FILL\' 1"}}')
layout = layout.replace('style="font-variation-settings: \'FILL\' 1; font-size: 20px;"', 'style={{fontVariationSettings: "\'FILL\' 1", fontSize: "20px"}}')

with open('C:\\Users\\ADMIN\\Desktop\\Demo-Query\\QueryTalk-AI\\frontend\\src\\components\\ChatDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(react_logic + layout)
