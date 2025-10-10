// Ruta: frontend/src/main.jsx (o main.js)

import React from 'react';
import ReactDOM from 'react-dom/client';
 // 🚨 Debe importar Router
import App from './App.jsx';
import { AuthProvider } from './hooks/useAuth'; // 🚨 Debe importar AuthProvider
import { BrowserRouter as Router } from 'react-router-dom';
import './styles.css';
// import './index.css'; // Opcional para estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> 
      <AuthProvider> {/* Este envuelve TODA la lógica de Auth y servicios */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);