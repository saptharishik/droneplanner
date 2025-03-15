import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import DroneMissionPlanner from './components/Auth/Login';


function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<DroneMissionPlanner />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      
    </Router>
  );
}

export default App;
