import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard/dashboard";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { SidebarToggle } from "./components/Sidebar/SidebarToggle";
import LoginPage from "./pages/Login/login";
import UserTable from "./components/User/UserTable";
import AssetTable from './components/Asset/AssetTable';
import Chatbot from "./components/Chatbot/chatbot";


function App() {
  return (
    <Router>
      <QuantumSafeNet />
    </Router>
  );
}

function QuantumSafeNet() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // // Check token validity on page load
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const tokenExpiry = localStorage.getItem('tokenExpiry');

  //   if (token && tokenExpiry) {
  //     if (Date.now() < parseInt(tokenExpiry)) {
  //       setIsAuthenticated(true);
  //     } else {
  //       // Token expired
  //       handleLogout();
  //     }
  //   }
  // }, []);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  // // When logging in
  // const handleLogin = (token) => {
  //   const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  //   localStorage.setItem('token', token);
  //   localStorage.setItem('tokenExpiry', expiryTime);
  //   setIsAuthenticated(true);
  // };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // const handleLogout = () => {
  //   setIsAuthenticated(false);
  //   localStorage.removeItem("isAuthenticated");
  //   // You might want to redirect to login page here
  // };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // If not authenticated, show only the login page
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Fixed Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarToggle onClick={toggleSidebar} />
              <div>
                <h2 className="text-lg font-semibold">Dashboard</h2>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserTable />} />{" "}
              <Route path="/assets" element={<AssetTable />} />
              {/* Add other routes here */}
            </Routes>
          </div>
        </main>
      </div>
      <Chatbot/>
    </div>
  );
}

export default App;
