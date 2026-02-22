import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import ClientPortal from './pages/ClientPortal';
import Landing from './pages/Landing';

import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/client" element={<ClientPortal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
