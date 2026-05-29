import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import useStore from '../store';
import axios from 'axios';

export default function ConnectDatabase() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { setDbStatus, setDbName, setActiveConnectionId } = useStore();
  
  const [dbType, setDbType] = useState('sqlite');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [dbNameLocal, setDbNameLocal] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useSSL, setUseSSL] = useState(false);
  
  const [schemaPreview, setSchemaPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPayload = () => ({
    db_type: dbType,
    host: host || undefined,
    port: port ? parseInt(port) : undefined,
    db_name: dbNameLocal,
    username: username || undefined,
    password: password || undefined
  });

  const handleTest = async () => {
    setError('');
    setSchemaPreview(null);
    setLoading(true);
    try {
      const clerkToken = await getToken();
      const res = await axios.post('/api/db/test', getPayload(), {
        headers: { Authorization: `Bearer ${clerkToken}` }
      });
      setSchemaPreview(res.data.schema);
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection test failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const clerkToken = await getToken();
      const res = await axios.post('/api/db/connect', getPayload(), {
        headers: { Authorization: `Bearer ${clerkToken}` }
      });
      setDbStatus('connected');
      setDbName(dbNameLocal || 'demo.db');
      const connId = res.data.connection_id;
      if (connId) setActiveConnectionId(connId);
      navigate(connId ? `/chat/${connId}` : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed.');
      setLoading(false);
    }
  };

  return (
    <div className="font-body-sm text-body-sm antialiased overflow-hidden h-screen w-screen flex items-center justify-center relative">
      {/* Background Context (Dashboard Blur) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[150px]"></div>
        {/* Faux Dashboard Content Behind Blur */}
        <div className="w-full h-full p-8 opacity-20 filter blur-sm">
          <div className="flex gap-8 h-full">
            <div className="w-64 border-r border-white/5 h-full"></div>
            <div className="flex-1 flex flex-col gap-8">
              <div className="h-16 border-b border-white/5 w-full"></div>
              <div className="flex-1 grid grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl"></div>
                <div className="col-span-2 bg-white/5 rounded-xl"></div>
                <div className="col-span-3 bg-white/5 rounded-xl h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Overlay Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        {/* Main Modal Container */}
        <div className="w-full max-w-[1000px] h-[700px] glass-panel rounded-xl flex overflow-hidden shadow-2xl shadow-primary/5 animate-fade-in relative z-50">
          
          {/* Left Side: Form Configuration */}
          <div className="w-[55%] flex flex-col h-full border-r border-white/5 bg-[rgba(12,19,36,0.5)]">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-primary tracking-tight mb-1">Connect DB</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Configure your database connection parameters securely.</p>
              </div>
              <button type="button" onClick={() => navigate('/')} aria-label="Close Modal" className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>close</span>
              </button>
            </div>
            
            {/* Form Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form className="flex flex-col gap-6">
                {/* DB Type Selector */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Database Type</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none glass-input rounded-lg px-4 py-3 font-body-sm text-body-sm text-on-surface focus:ring-0"
                      value={dbType}
                      onChange={(e) => setDbType(e.target.value)}
                    >
                      <option className="bg-[rgba(25,31,49,1)] text-on-surface" value="postgresql">PostgreSQL</option>
                      <option className="bg-[rgba(25,31,49,1)] text-on-surface" value="mysql">MySQL</option>
                      <option className="bg-[rgba(25,31,49,1)] text-on-surface" value="sqlite">SQLite</option>
                      <option className="bg-[rgba(25,31,49,1)] text-on-surface" value="snowflake">Snowflake</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Host */}
                  <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                    <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Host</label>
                    <input className="w-full glass-input rounded-lg px-4 py-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-0" placeholder="e.g., db.internal.net" type="text" value={host} onChange={e=>setHost(e.target.value)} />
                  </div>
                  {/* Port */}
                  <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                    <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Port</label>
                    <input className="w-full glass-input rounded-lg px-4 py-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-0" placeholder="5432" type="number" value={port} onChange={e=>setPort(e.target.value)} />
                  </div>
                </div>
                
                {/* Database Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Database Name</label>
                  <input className="w-full glass-input rounded-lg px-4 py-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-0" placeholder="production_db" type="text" value={dbNameLocal} onChange={e=>setDbNameLocal(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                    <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Username</label>
                    <input className="w-full glass-input rounded-lg px-4 py-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-0" placeholder="admin_user" type="text" value={username} onChange={e=>setUsername(e.target.value)} />
                  </div>
                  {/* Password */}
                  <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                    <label className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input className="w-full glass-input rounded-lg px-4 py-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-0" placeholder="••••••••" type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors" type="button">
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility" : "visibility_off"}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* SSL Toggle */}
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => setUseSSL(!useSSL)} className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${useSSL ? 'bg-primary' : 'bg-primary/20'}`} type="button">
                    <span className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${useSSL ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Require SSL/TLS connection</span>
                </div>
              </form>
            </div>
            
            {/* Action Footer */}
            <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between bg-[rgba(21,27,45,0.3)]">
              <button type="button" onClick={handleTest} disabled={loading} className="px-5 py-2.5 rounded-lg border border-white/10 text-on-surface font-medium hover:bg-white/5 transition-all flex items-center gap-2 group">
                <span className={`material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors ${loading ? 'animate-spin' : ''}`}>sync</span>
                Test Connection
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate('/')} className="px-5 py-2.5 rounded-lg text-on-surface-variant font-medium hover:text-white transition-colors">Cancel</button>
                <button 
                  onClick={handleConnect}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#005ac2] hover:bg-[#4d8eff] text-white rounded-lg font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  Connect
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side: Schema Preview Panel */}
          <div className="w-[45%] flex flex-col h-full bg-[rgba(7,13,31,0.8)] relative">
            {/* Subtle Gradient Glow Top Right */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">database</span>
              <h3 className="font-headline-md text-body-lg font-medium text-on-surface">Schema Preview</h3>
            </div>
            
            {schemaPreview ? (
              <div className="flex-1 overflow-y-auto p-8 relative z-10">
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                  <h4 className="font-body-lg text-primary mb-4 border-b border-white/10 pb-2">Connected Successfully</h4>
                  <pre className="font-label-mono text-label-mono text-success whitespace-pre-wrap">
                    {schemaPreview}
                  </pre>
                </div>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center p-8 relative z-10 text-center">
                <div className="bg-error/10 border border-error/20 p-6 rounded-xl">
                  <span className="material-symbols-outlined text-error text-[40px] mb-4">error</span>
                  <h4 className="font-body-lg text-body-lg text-error mb-2">Connection Error</h4>
                  <p className="font-body-sm text-body-sm text-error/80">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
                <div className="w-24 h-24 rounded-full border border-white/5 bg-white/5 flex items-center justify-center mb-6 relative">
                  <div className={`absolute inset-0 rounded-full border border-primary/20 ${loading ? 'animate-[spin_2s_linear_infinite]' : ''}`}></div>
                  <span className="material-symbols-outlined text-[40px] text-outline-variant">schema</span>
                </div>
                <h4 className="font-body-lg text-body-lg text-on-surface mb-2">{loading ? "Testing Connection..." : "Awaiting Connection"}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[250px]">
                  Enter your credentials and click "Test Connection" to preview the database schema, tables, and views here.
                </p>
                {/* Mock Code Snippet to simulate technical environment */}
                {!loading && (
                  <div className="mt-8 p-4 rounded-lg bg-black/40 border border-white/5 w-full text-left overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-error"></div>
                      <div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    </div>
                    <pre className="font-label-mono text-label-mono text-outline-variant">
{`> awaiting_handshake()
> establishing_tunnel()
_ pending credentials...`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
