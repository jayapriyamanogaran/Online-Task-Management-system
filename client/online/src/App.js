// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import './App.css'; // Import custom CSS file
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RouterApp from './Router';

const App = () => {
  return (
    // <AppFireBase>
    <>
      <ToastContainer />
      <RouterApp />
    </>
    // </AppFireBase>
  );
};

export default App;
