import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AuthCallbackPage from './pages/AuthCallbackPage';
import Sidebar from './components/Sidebar';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import './App.css';
import L from 'leaflet';
import { type User } from './services/userService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    console.log('Đăng nhập thành công:', userData);
  };

  const handleLogout = () => {
    setUser(null);
    console.log('Đã đăng xuất');
  };

  const handleMapLoad = (mapInstance: L.Map) => {
    setMap(mapInstance);
    console.log('Bản đồ đã được tải');
  };

  // Sử dụng các biến để tránh warning
  console.log('Current user:', user);
  console.log('Map instance:', map);

  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar - luôn hiển thị, có thể đóng/mở */}
        <Sidebar user={user} isOpen={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col relative">
          {/* Header */}
          <Header onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
          
          {/* Map - luôn hiển thị ở background (toàn màn hình) */}
          <div className="fixed inset-0 z-0">
            <MapPage onMapLoad={handleMapLoad} />
          </div>
          
          <div className="map-content-overlay flex justify-end p-4">
            <Routes>
              <Route path="/" element={<div />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route 
                path="/admin" 
                element={
                  <div className="pointer-events-auto w-full max-w-3xl h-full overflow-y-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                    <AdminPage />
                  </div>
                } 
              />
              {/* Add-location route tạm tắt */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App
