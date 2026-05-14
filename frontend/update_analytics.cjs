const fs = require('fs');
let c = fs.readFileSync('src/components/AnalyticsDashboard.jsx', 'utf8');

// 1. Add useState, useEffect, axios imports
c = c.replace(
  /import React from 'react';/,
  `import React, { useState, useEffect } from 'react';\nimport axios from 'axios';\nimport useStore from '../store';`
);

// 2. Remove static mock data definitions
const staticDataRegex = /const growthData = \[[\s\S]*?\];\n\nconst marketShareData = \[[\s\S]*?\];\n\nconst revenueRegionData = \[[\s\S]*?\];\n\nconst customerSegmentsData = \[[\s\S]*?\];/;
c = c.replace(staticDataRegex, '');

// 3. Update the component body to include state and fetch
const oldComponentStart = /export default function AnalyticsDashboard\(\) \{/;
const newComponentStart = `export default function AnalyticsDashboard() {
  const { token, dbStatus } = useStore();
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (dbStatus !== 'connected') {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/db/analytics', { headers: { Authorization: \`Bearer \${token}\` }});
        if (res.data.fallback) {
          setFallback(true);
          // Load default mock data
          setData({
            kpis: { totalRevenue: 2400000, growthPct: 28.4, activeCustomers: 14290, monthlySales: 8402 },
            growthData: [
              { name: 'Jan', current: 4000, projected: 2400 },
              { name: 'Feb', current: 4500, projected: 2800 },
              { name: 'Mar', current: 5200, projected: 3100 },
              { name: 'Apr', current: 6100, projected: 3500 },
              { name: 'May', current: 6800, projected: 3900 },
              { name: 'Jun', current: 7500, projected: 4200 }
            ],
            marketShareData: [
              { name: 'North America', value: 62, color: '#adc6ff' },
              { name: 'Europe', value: 25, color: '#df7412' },
              { name: 'APAC', value: 13, color: '#00a2e6' }
            ],
            revenueRegionData: [
              { name: 'NA', value: 120 }, { name: 'EU', value: 80 }, { name: 'APAC', value: 150 }
            ],
            customerSegmentsData: [
              { x: 10, y: 30, z: 200, group: 1 }, { x: 40, y: 80, z: 300, group: 2 }, { x: 70, y: 15, z: 400, group: 3 }
            ]
          });
        } else {
          setFallback(false);
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token, dbStatus]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-primary animate-pulse">Loading Live Analytics...</div>;
  }

  if (!data) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[64px] opacity-50 mb-4">link_off</span>
            <p>Connect a database to view analytics.</p>
        </div>
    );
  }

  const { kpis, growthData, marketShareData, revenueRegionData, customerSegmentsData } = data;
`;

c = c.replace(oldComponentStart, newComponentStart);

// 4. Update JSX to use dynamic KPI values
c = c.replace(/<h4 className="font-display text-3xl font-bold text-on-surface">\$2.4M<\/h4>/, `<h4 className="font-display text-3xl font-bold text-on-surface">\${(kpis.totalRevenue >= 1000000 ? (kpis.totalRevenue / 1000000).toFixed(1) + 'M' : (kpis.totalRevenue >= 1000 ? (kpis.totalRevenue / 1000).toFixed(1) + 'k' : kpis.totalRevenue))}</h4>`);
c = c.replace(/<span className="text-sm font-medium">\+14.5% vs last month<\/span>/, `<span className="text-sm font-medium">{kpis.growthPct > 0 ? '+' : ''}{kpis.growthPct}% vs last month</span>`);
c = c.replace(/<h4 className="font-display text-3xl font-bold text-on-surface">28.4%<\/h4>/, `<h4 className="font-display text-3xl font-bold text-on-surface">{kpis.growthPct}%</h4>`);
c = c.replace(/<h4 className="font-display text-3xl font-bold text-on-surface">14,290<\/h4>/, `<h4 className="font-display text-3xl font-bold text-on-surface">{kpis.activeCustomers.toLocaleString()}</h4>`);
c = c.replace(/<h4 className="font-display text-3xl font-bold text-on-surface">8,402<\/h4>/, `<h4 className="font-display text-3xl font-bold text-on-surface">{kpis.monthlySales.toLocaleString()}</h4>`);

// 5. Add fallback warning banner
const headerStart = /<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">/;
c = c.replace(headerStart, `
      {fallback && (
        <div className="bg-tertiary-container/20 border border-tertiary-container text-on-surface px-4 py-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary-container">info</span>
            <p className="text-sm">Showing sample analytics. Connect to the standard demo schema for live data.</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">`);

fs.writeFileSync('src/components/AnalyticsDashboard.jsx', c);
console.log("Updated AnalyticsDashboard.jsx for dynamic data");
