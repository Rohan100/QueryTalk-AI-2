const fs = require('fs');
let c = fs.readFileSync('src/components/ChatDashboard.jsx', 'utf8');

c = c.replace(/<nav className="hidden md:flex items-center gap-6 ml-6 border-l border-white\/10 pl-6">[\s\S]*?<\/nav>/, '');

c = c.replace(/<button onClick=\{\(\) => alert\('Notifications coming soon!'\)\} className="hidden sm:block text-on-surface-variant hover:text-primary transition-colors">[\s\S]*?<\/button>/, `<button onClick={() => setActiveTab('notifications')} className={\`hidden sm:block hover:text-primary transition-colors \${activeTab === 'notifications' ? 'text-primary' : 'text-on-surface-variant'}\`}>\n            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'notifications' ? "'FILL' 1" : "'FILL' 0"}}>notifications</span>\n          </button>`);

c = c.replace(/<button onClick=\{\(\) => alert\('Security details coming soon!'\)\} className="hidden sm:block text-on-surface-variant hover:text-primary transition-colors">[\s\S]*?<\/button>/, `<button onClick={() => setActiveTab('security')} className={\`hidden sm:block hover:text-primary transition-colors \${activeTab === 'security' ? 'text-primary' : 'text-on-surface-variant'}\`}>\n            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : "'FILL' 0"}}>shield</span>\n          </button>`);

c = c.replace(/<a onClick=\{\(e\) => \{ e\.preventDefault\(\); alert\('Settings coming soon!'\); \}\} className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-colors" href="#">[\s\S]*?<\/a>/, `<a onClick={(e) => { e.preventDefault(); setActiveTab('settings'); setSidebarOpen(false); }} className={\`flex items-center gap-3 px-4 py-2 rounded-full transition-colors \${activeTab === 'settings' ? 'text-primary bg-primary/10 font-medium' : 'text-on-surface-variant hover:text-primary'}\`} href="#">\n<span className="material-symbols-outlined text-label-mono text-[20px]" style={{fontVariationSettings: activeTab === 'settings' ? "'FILL' 1" : "'FILL' 0"}}>settings</span>\n<span className="font-body-sm text-body-sm">Settings</span>\n</a>`);

c = c.replace(/<a onClick=\{\(e\) => \{ e\.preventDefault\(\); alert\('Support coming soon!'\); \}\} className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-colors" href="#">[\s\S]*?<\/a>/, `<a onClick={(e) => { e.preventDefault(); setActiveTab('support'); setSidebarOpen(false); }} className={\`flex items-center gap-3 px-4 py-2 rounded-full transition-colors \${activeTab === 'support' ? 'text-primary bg-primary/10 font-medium' : 'text-on-surface-variant hover:text-primary'}\`} href="#">\n<span className="material-symbols-outlined text-label-mono text-[20px]" style={{fontVariationSettings: activeTab === 'support' ? "'FILL' 1" : "'FILL' 0"}}>help_outline</span>\n<span className="font-body-sm text-body-sm">Support</span>\n</a>`);

const emptyTabs = `                )}

                {activeTab === 'notifications' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">notifications</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Notifications</p>
                        <p className="font-body-sm text-body-sm mt-2">Your recent alerts and system messages will appear here.</p>
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">shield</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Security & Access</p>
                        <p className="font-body-sm text-body-sm mt-2">Manage your connection security settings.</p>
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">settings</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Settings</p>
                        <p className="font-body-sm text-body-sm mt-2">Configure your dashboard preferences.</p>
                    </div>
                )}
                {activeTab === 'support' && (
                    <div className="flex flex-col items-center justify-center mt-20 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">help_outline</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Support Center</p>
                        <p className="font-body-sm text-body-sm mt-2">How can we help you today?</p>
                    </div>
                )}
            </div>
        </main>`;

c = c.replace(/                \)}\r?\n            <\/div>\r?\n        <\/main>/, emptyTabs);

fs.writeFileSync('src/components/ChatDashboard.jsx', c);
console.log("Replacement successful");
