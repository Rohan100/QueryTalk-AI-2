import re

with open('src/components/ChatDashboard.jsx', 'r') as f:
    content = f.read()

settings_and_support_ui = """
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
"""

history_end = r"Your past chat sessions will appear here\.<\/p>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}"
content = re.sub(history_end, "Your past chat sessions will appear here.</p>\n                            </div>\n                        )}\n                    </div>\n                )}\n" + settings_and_support_ui, content)

with open('src/components/ChatDashboard.jsx', 'w') as f:
    f.write(content)
print("Injected Settings and Support")
