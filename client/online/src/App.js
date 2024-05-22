// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import './App.css'; // Import custom CSS file
import LoginScreen from './screens/login';
import TaskScreen from './screens/task';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/task" element={<TaskScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
