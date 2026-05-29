const fs = require('fs');
let c = fs.readFileSync('src/components/ChatDashboard.jsx', 'utf8');

// Add import
c = c.replace(
  /import \{ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer \} from 'recharts';/,
  `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';\nimport AnalyticsDashboard from './AnalyticsDashboard';`
);

// Replace analytics tab content
const oldAnalyticsTab = `                {activeTab === 'analytics' && (
                    <div className="flex flex-col items-center justify-center mt-32 text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-[64px] mb-4 text-primary/30">dashboard</span>
                        <p className="font-body-lg text-body-lg text-on-surface">Analytics Dashboard</p>
                        <p className="font-body-sm text-body-sm mt-2">Visual reports and insights will appear here.</p>
                    </div>
                )}`;

const newAnalyticsTab = `                {activeTab === 'analytics' && (
                    <AnalyticsDashboard />
                )}`;

// We need regex to match the old tab precisely
const regex = /\{activeTab === 'analytics' && \([\s\S]*?<div className="flex flex-col items-center justify-center mt-32 text-on-surface-variant\/50">[\s\S]*?<span className="material-symbols-outlined text-\[64px\] mb-4 text-primary\/30">dashboard<\/span>[\s\S]*?<p className="font-body-lg text-body-lg text-on-surface">Analytics Dashboard<\/p>[\s\S]*?<p className="font-body-sm text-body-sm mt-2">Visual reports and insights will appear here\.<\/p>[\s\S]*?<\/div>[\s\S]*?\)\}/;

c = c.replace(regex, newAnalyticsTab);

fs.writeFileSync('src/components/ChatDashboard.jsx', c);
console.log("Analytics import successful");
