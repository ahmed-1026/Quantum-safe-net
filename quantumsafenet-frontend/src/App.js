import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard/dashboard";
import EmployeeDashboard from "./components/Employee/EmployeeDashboard";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { SidebarToggle } from "./components/Sidebar/SidebarToggle";
import LoginPage from "./pages/Login/login";
import UserTable from "./components/User/UserTable";
import ServerTable from "./components/Server/ServerTable";
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
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole");
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check token validity on page load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (token && tokenExpiry) {
      if (Date.now() < parseInt(tokenExpiry)) {
        setIsAuthenticated(true);
        setUserRole(localStorage.getItem("userRole"));
        console.log("User role:", userRole);
      } else {
        // Token expired
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  // When logging in
  const handleLogin = (role) => {
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem('tokenExpiry', expiryTime);
    localStorage.setItem("isAuthenticated", true);
    localStorage.setItem("userRole", role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // const handleLogin = () => {
  //   setIsAuthenticated(true);
  // };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userRole");
    // You might want to redirect to login page here
  };

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

      <Sidebar isOpen={isSidebarOpen} userRole={userRole} />

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
              {userRole === "admin" ? (
                <>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/users" element={<UserTable />} />
                  <Route path="/assets" element={<AssetTable />} />
                  <Route path="/servers" element={<ServerTable />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={<EmployeeDashboard />} />
                </>
              )}
              {/* Add other routes */}
            </Routes>
          </div>
        </main>
      </div>
      <Chatbot/>
    </div>
  );
}

export default App;
