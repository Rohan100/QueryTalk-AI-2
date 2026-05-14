import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ChatDashboard from './components/ChatDashboard';
import ConnectDatabase from './components/ConnectDatabase';

/** Full-screen loading spinner shown while Clerk resolves the auth state */
function AuthLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
          Loading…
        </span>
      </div>
    </div>
  );
}

/** Wraps a route so only authenticated users can access it */
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <AuthLoader />;
  return isSignedIn ? children : <Navigate to="/sign-in" replace />;
}

/** Redirects already-authenticated users away from auth pages */
function AuthRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <AuthLoader />;
  return !isSignedIn ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      {/* Persistent ambient background glows */}
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-100px] left-[10%] w-[500px] h-[500px] bg-primary rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[10%] w-[400px] h-[400px] bg-tertiary rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none" />

        <Routes>
          {/* Auth routes — redirect to dashboard if already signed in */}
          <Route
            path="/sign-in/*"
            element={
              <AuthRoute>
                <SignInPage />
              </AuthRoute>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <AuthRoute>
                <SignUpPage />
              </AuthRoute>
            }
          />

          {/* Legacy /login path — redirect to /sign-in for backward compat */}
          <Route path="/login" element={<Navigate to="/sign-in" replace />} />

          {/* Protected app routes */}
          <Route
            path="/connect"
            element={
              <ProtectedRoute>
                <ConnectDatabase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
