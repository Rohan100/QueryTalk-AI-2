const fs = require('fs');
let content = fs.readFileSync('src/components/ChatDashboard.jsx', 'utf8');

const notifSecurityUI = `
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
        </main>`;

content = content.replace(/<\/div>\s*<\/main>/, notifSecurityUI);

fs.writeFileSync('src/components/ChatDashboard.jsx', content);
console.log("Appended Notifications and Security");
