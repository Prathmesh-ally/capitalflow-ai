import React from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <Dashboard />
    </div>
  );
}

export default App;