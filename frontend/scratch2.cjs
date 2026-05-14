const fs = require('fs');
let c = fs.readFileSync('src/components/ChatDashboard.jsx', 'utf8');

const target = `<div key={idx} className="bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 p-4 flex items-center gap-4">
                                        <span className="material-symbols-outlined text-on-surface-variant">history</span>
                                        <p className="font-body-lg text-on-surface flex-1">{msg.content}</p>
                                    </div>`;

const replacement = `<div key={idx} onClick={() => setActiveTab('chat')} className="bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all active:scale-[0.99] group">
                                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">history</span>
                                        <p className="font-body-lg text-on-surface flex-1 group-hover:text-primary transition-colors">{msg.content}</p>
                                    </div>`;

// Use regex to ignore whitespace differences
const regex = /<div key=\{idx\} className="bg-surface-container-low\/60 backdrop-blur-md rounded-xl border border-white\/5 p-4 flex items-center gap-4">[\s\S]*?<span className="material-symbols-outlined text-on-surface-variant">history<\/span>[\s\S]*?<p className="font-body-lg text-on-surface flex-1">\{msg\.content\}<\/p>[\s\S]*?<\/div>/;

c = c.replace(regex, replacement);

fs.writeFileSync('src/components/ChatDashboard.jsx', c);
console.log("Replacement successful");
