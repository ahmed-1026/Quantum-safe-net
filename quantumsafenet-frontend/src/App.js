import React from "react";
// import Navbar from './components/navbar';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Dashboard from "./components/dashboard";

function App() {
  return (
    <Router>
      <div className="">
        <QuantumSafeNet />
      </div>
    </Router>
  );
}

function QuantumSafeNet() {
  return (
    <>
      <div>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
