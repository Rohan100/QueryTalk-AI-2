import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/react';
import axios from 'axios';
import useStore from '../store';

const DB_TYPE_COLORS = {
  postgresql: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'storage' },
  mysql:      { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: 'storage' },
  sqlite:     { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'database' },
  snowflake:  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'cloud' },
};

function DbTypeTag({ type }) {
  const style = DB_TYPE_COLORS[type?.toLowerCase()] || DB_TYPE_COLORS.sqlite;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label-mono font-medium border ${style.bg} ${style.border} ${style.text}`}>
      <span className="material-symbols-outlined text-[14px]">{style.icon}</span>
      {type?.toUpperCase()}
    </span>
  );
}

function ConnectionCard({ conn, onConnect, onDelete, connecting }) {
  const isConnecting = connecting === conn.id;
  const updatedAt = new Date(conn.updated_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="group relative bg-surface-container-low/60 backdrop-blur-md rounded-2xl border border-white/8 p-6 flex flex-col gap-4 hover:border-primary/30 hover:bg-surface-container-low/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
        </div>
        <button
          onClick={() => onDelete(conn.id)}
          aria-label="Delete connection"
          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      {/* Name + type */}
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-title-md font-semibold text-on-surface truncate">{conn.name}</h3>
        <DbTypeTag type={conn.db_type} />
      </div>

      {/* Hints */}
      <div className="flex flex-col gap-1.5 text-sm">
        {conn.host_hint && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">dns</span>
            <span className="font-label-mono truncate">{conn.host_hint}</span>
          </div>
        )}
        {conn.db_name_hint && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">table_chart</span>
            <span className="font-label-mono truncate">{conn.db_name_hint}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span className="text-xs">Last used {updatedAt}</span>
        </div>
      </div>

      {/* Connect button */}
      <button
        onClick={() => onConnect(conn)}
        disabled={isConnecting}
        className="mt-auto w-full py-2.5 rounded-xl bg-primary text-on-primary font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">power</span>
            Connect
          </>
        )}
      </button>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated ring */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 rounded-full border border-primary/20" />
        <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
        </div>
      </div>
      <h2 className="font-display text-headline-sm font-bold text-on-surface mb-3">No databases connected</h2>
      <p className="font-body-lg text-on-surface-variant max-w-sm mb-8">
        Connect your first database to start querying with natural language.
      </p>
      <button
        onClick={onAdd}
        id="add-first-database-btn"
        className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-xl shadow-primary/25"
      >
        <span className="material-symbols-outlined">add</span>
        Connect your first database
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container-low/40 rounded-2xl border border-white/5 p-6 flex flex-col gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-white/5" />
      <div className="h-5 bg-white/5 rounded-lg w-3/4" />
      <div className="h-6 bg-white/5 rounded-full w-24" />
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
      </div>
      <div className="h-10 bg-white/5 rounded-xl mt-auto" />
    </div>
  );
}

export default function DatabasesPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { setDbStatus, setDbName, setActiveConnectionId } = useStore();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null); // ID of connection being activated
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ID awaiting confirmation

  const fetchConnections = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await axios.get('/api/db/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnections(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // User doesn't exist in DB yet (webhook hasn't fired)
        setConnections([]);
      } else {
        setError('Failed to load your databases. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnect = async (conn) => {
    setConnecting(conn.id);
    try {
      const token = await getToken();
      await axios.post(`/api/db/reconnect/${conn.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDbStatus('connected');
      setDbName(conn.name);
      setActiveConnectionId(conn.id);
      navigate(`/chat/${conn.id}`);
    } catch (err) {
      setError(`Failed to connect to "${conn.name}": ${err.response?.data?.detail || err.message}`);
      setConnecting(null);
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      // Auto-clear confirmation after 3s
      setTimeout(() => setDeleteConfirm(c => c === id ? null : c), 3000);
      return;
    }
    // Second click — confirmed
    try {
      const token = await getToken();
      await axios.delete(`/api/db/saved/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnections(prev => prev.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete connection.');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-background font-body-sm text-body-sm antialiased">
      {/* Ambient glows */}
      <div className="fixed top-[-100px] left-[10%] w-[500px] h-[500px] bg-primary rounded-full mix-blend-screen filter blur-[180px] opacity-8 pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[10%] w-[400px] h-[400px] bg-tertiary rounded-full mix-blend-screen filter blur-[180px] opacity-8 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-surface/30 backdrop-blur-xl border-b border-white/5 flex justify-between items-center h-16 px-6 md:px-12">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
          <div>
            <h1 className="font-display text-title-lg font-bold text-primary tracking-tight leading-none">QueryTalk AI</h1>
            <p className="font-label-mono text-[10px] text-on-surface-variant tracking-widest uppercase">Enterprise Tier</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="add-database-btn"
            onClick={() => navigate('/connect')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Add Database</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
            aria-label="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        {/* Page title */}
        <div className="mb-10">
          <h2 className="font-display text-headline-md font-bold text-on-surface tracking-tight">My Databases</h2>
          <p className="font-body-lg text-on-surface-variant mt-1">Select a connection to start querying with AI.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <p className="text-sm">{error}</p>
            <button onClick={() => setError('')} className="ml-auto hover:opacity-70">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Delete confirmation banner */}
        {deleteConfirm && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-error/10 border border-error/30 text-on-surface">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <p className="text-sm flex-1">Click the delete button again to confirm removal.</p>
            <button onClick={() => setDeleteConfirm(null)} className="text-on-surface-variant hover:text-on-surface text-xs underline">
              Cancel
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && connections.length === 0 && (
          <EmptyState onAdd={() => navigate('/connect')} />
        )}

        {/* Connection cards */}
        {!loading && connections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {connections.map(conn => (
              <ConnectionCard
                key={conn.id}
                conn={conn}
                onConnect={handleConnect}
                onDelete={handleDelete}
                connecting={connecting}
              />
            ))}

            {/* Add new card */}
            <button
              onClick={() => navigate('/connect')}
              id="add-another-database-btn"
              className="group border-2 border-dashed border-white/10 hover:border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:text-primary transition-all min-h-[220px] cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl border border-dashed border-current flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-[24px]">add</span>
              </div>
              <span className="font-medium text-sm">Add Database</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
