

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import { AuthProvider } from './hooks/useAuth'; 
import { BrowserRouter as Router } from 'react-router-dom';
import './styles.css';
import { CartProvider } from './context/CartContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> 
      <AuthProvider>
        <CartProvider>
            <App />
        </CartProvider> 
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);