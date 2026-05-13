import React from 'react';

export default function ChatDashboardStitch() {
  return (
    <div className="font-body-sm text-body-sm antialiased overflow-hidden h-screen w-screen flex items-center justify-center relative">
<aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-low/40 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-primary/5 flex flex-col p-gutter z-50">
<div className="mb-10 pl-2">
<h1 className="font-display text-headline-md font-bold text-primary tracking-tight">QueryTalk AI</h1>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Enterprise Tier</p>
</div>
<nav className="flex-1 flex flex-col gap-2">
<a className="flex items-center gap-3 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors duration-200 active:scale-95 transition-transform" href="#">
<span className="material-symbols-outlined font-label-mono text-label-mono">dashboard</span>
<span className="font-body-lg text-body-lg">Analytics</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-full bg-secondary-container text-on-secondary-container font-medium hover:bg-surface-variant/50 transition-colors duration-200 active:scale-95 transition-transform" href="#">
<span className="material-symbols-outlined font-label-mono text-label-mono" style="font-variation-settings: 'FILL' 1;">terminal</span>
<span className="font-body-lg text-body-lg">SQL Chat</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors duration-200 active:scale-95 transition-transform" href="#">
<span className="material-symbols-outlined font-label-mono text-label-mono">database</span>
<span className="font-body-lg text-body-lg">Databases</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors duration-200 active:scale-95 transition-transform" href="#">
<span className="material-symbols-outlined font-label-mono text-label-mono">history</span>
<span className="font-body-lg text-body-lg">History</span>
</a>
</nav>
<div className="mt-auto flex flex-col gap-4">
<button className="w-full py-3 px-4 rounded-xl bg-primary-container/20 text-primary border border-primary/30 font-medium hover:bg-primary-container/30 transition-all active:scale-95">
                Upgrade Plan
            </button>
<div className="border-t border-white/5 pt-4 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined font-label-mono text-label-mono text-[20px]">settings</span>
<span className="font-body-sm text-body-sm">Settings</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-full text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined font-label-mono text-label-mono text-[20px]">help_outline</span>
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
<div className="flex justify-end">
<div className="bg-surface-container-highest text-on-surface px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-white/5 shadow-lg">
<p className="font-body-lg text-body-lg">Show me the top 5 customers by revenue from the North America region for Q3, and group them by their primary product category.</p>
</div>
</div>
<div className="flex items-start gap-4 max-w-[90%]">
<div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary/20 shrink-0">
<span className="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">neurology</span>
</div>
<div className="flex flex-col gap-4 w-full">
<div className="text-on-surface font-body-lg text-body-lg pt-2">
                            I've generated the query to find the top 5 customers in North America for Q3, grouped by their primary product category.
                        </div>
<div className="bg-[#0f1526] rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-xl">
<div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface-container/50">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-outline font-label-mono text-label-mono text-[16px]">code</span>
<span className="font-label-mono text-label-mono text-outline">PostgreSQL</span>
</div>
<button className="text-outline hover:text-primary transition-colors flex items-center gap-1">
<span className="material-symbols-outlined font-label-mono text-label-mono text-[16px]">content_copy</span>
<span className="font-label-mono text-label-mono">Copy</span>
</button>
</div>
<div className="p-4 font-label-mono text-label-mono text-secondary/90 leading-relaxed overflow-x-auto">
<pre><code><span className="text-tertiary">SELECT</span> 
    c.customer_name, 
    p.category, 
    <span className="text-primary-container">SUM</span>(o.total_amount) <span className="text-tertiary">AS</span> q3_revenue
<span className="text-tertiary">FROM</span> orders o
<span className="text-tertiary">JOIN</span> customers c <span className="text-tertiary">ON</span> o.customer_id = c.id
<span className="text-tertiary">JOIN</span> products p <span className="text-tertiary">ON</span> o.product_id = p.id
<span className="text-tertiary">WHERE</span> 
    c.region = <span className="text-tertiary-container">'North America'</span>
    <span className="text-tertiary">AND</span> o.order_date &gt;= <span className="text-tertiary-container">'2023-07-01'</span>
    <span className="text-tertiary">AND</span> o.order_date &lt;= <span className="text-tertiary-container">'2023-09-30'</span>
<span className="text-tertiary">GROUP BY</span> 
    c.customer_name, 
    p.category
<span className="text-tertiary">ORDER BY</span> 
    q3_revenue <span className="text-tertiary">DESC</span>
<span className="text-tertiary">LIMIT</span> 5;</code></pre>
</div>
</div>
<div className="bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
<div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px]">table_chart</span>
<span className="font-body-sm text-body-sm font-medium text-on-surface">Preview (5 rows)</span>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="border-b border-white/5 bg-surface-container/30">
<th className="px-4 py-3 font-medium text-on-surface-variant">customer_name</th>
<th className="px-4 py-3 font-medium text-on-surface-variant">category</th>
<th className="px-4 py-3 font-medium text-on-surface-variant text-right">q3_revenue</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr className="hover:bg-white/[0.02] transition-colors">
<td className="px-4 py-3 text-on-surface">TechGlobal Corp</td>
<td className="px-4 py-3 text-on-surface-variant"><span className="px-2 py-1 rounded bg-surface-container-highest text-label-mono font-label-mono text-xs">Enterprise SaaS</span></td>
<td className="px-4 py-3 text-primary text-right font-label-mono text-label-mono">$1,245,000</td>
</tr>
<tr className="hover:bg-white/[0.02] transition-colors">
<td className="px-4 py-3 text-on-surface">Apex Logistics</td>
<td className="px-4 py-3 text-on-surface-variant"><span className="px-2 py-1 rounded bg-surface-container-highest text-label-mono font-label-mono text-xs">Cloud Storage</span></td>
<td className="px-4 py-3 text-primary text-right font-label-mono text-label-mono">$982,500</td>
</tr>
<tr className="hover:bg-white/[0.02] transition-colors">
<td className="px-4 py-3 text-on-surface">Nexa Financial</td>
<td className="px-4 py-3 text-on-surface-variant"><span className="px-2 py-1 rounded bg-surface-container-highest text-label-mono font-label-mono text-xs">Data Pipeline</span></td>
<td className="px-4 py-3 text-primary text-right font-label-mono text-label-mono">$875,200</td>
</tr>
<tr className="hover:bg-white/[0.02] transition-colors">
<td className="px-4 py-3 text-on-surface">Quantum Retail</td>
<td className="px-4 py-3 text-on-surface-variant"><span className="px-2 py-1 rounded bg-surface-container-highest text-label-mono font-label-mono text-xs">Analytics API</span></td>
<td className="px-4 py-3 text-primary text-right font-label-mono text-label-mono">$654,000</td>
</tr>
<tr className="hover:bg-white/[0.02] transition-colors">
<td className="px-4 py-3 text-on-surface">Meridian Health</td>
<td className="px-4 py-3 text-on-surface-variant"><span className="px-2 py-1 rounded bg-surface-container-highest text-label-mono font-label-mono text-xs">Enterprise SaaS</span></td>
<td className="px-4 py-3 text-primary text-right font-label-mono text-label-mono">$512,800</td>
</tr>
</tbody>
</table>
</div>
</div>
<div className="relative p-[1px] rounded-xl bg-gradient-to-r from-primary/30 via-secondary/10 to-transparent mt-2">
<div className="bg-surface-container-low/90 backdrop-blur-xl rounded-xl p-5 flex items-start gap-4">
<span className="material-symbols-outlined text-secondary mt-0.5" style="font-variation-settings: 'FILL' 1;">lightbulb</span>
<div>
<h4 className="font-body-lg text-body-lg font-medium text-on-surface mb-1">AI Insight</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
<span className="text-on-surface">Enterprise SaaS</span> is driving the majority of top-tier revenue in NA. TechGlobal Corp alone accounts for nearly 30% of the top 5 segment. Consider filtering by <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-secondary font-label-mono text-label-mono">customer_segment</code> to see if this trend holds across mid-market accounts.
                                    </p>
</div>
</div>
</div>
</div>
</div>
<div className="flex items-start gap-4 max-w-[90%]">
<div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary/20 shrink-0">
<span className="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">neurology</span>
</div>
<div className="flex items-center gap-2 h-10 px-4 bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-white/5 w-fit">
<span className="w-2 h-2 rounded-full bg-primary/60"></span>
<span className="w-2 h-2 rounded-full bg-primary/60"></span>
<span className="w-2 h-2 rounded-full bg-primary/60"></span>
</div>
</div>
</div>
</main>
<div className="absolute bottom-0 left-0 w-full px-margin-desktop pb-8 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
<div className="max-w-[1000px] mx-auto pointer-events-auto">
<div className="bg-surface-container-highest/80 backdrop-blur-xl border border-white/10 rounded-full flex items-end p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-primary/5 focus-within:ring-primary/30 transition-all">
<button className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary transition-colors shrink-0 mb-1">
<span className="material-symbols-outlined">add_circle</span>
</button>
<textarea className="bg-transparent border-none focus:ring-0 text-on-surface font-body-lg text-body-lg placeholder-outline w-full resize-none py-3 px-2 max-h-[120px] overflow-y-auto" placeholder="Ask anything about your data..." rows="1"></textarea>
<button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors shrink-0 mb-1 shadow-[0_0_15px_rgba(173,198,255,0.3)]">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; font-size: 20px;">send</span>
</button>
</div>
<div className="text-center mt-3">
<span className="font-label-mono text-label-mono text-on-surface-variant/60">QueryTalk AI can make mistakes. Consider verifying critical data.</span>
</div>
</div>
</div>
</div>
    </div>
  );
}
