import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store';
import Login from './components/Login';
import ChatDashboard from './components/ChatDashboard';
import ConnectDatabase from './components/ConnectDatabase';

function App() {
  const token = useStore((state) => state.token);

  return (
    <Router>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-100px] left-[10%] w-[500px] h-[500px] bg-primary rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-[-100px] right-[10%] w-[400px] h-[400px] bg-tertiary rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>
        
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/connect" element={token ? <ConnectDatabase /> : <Navigate to="/login" />} />
          <Route path="/" element={token ? <ChatDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
