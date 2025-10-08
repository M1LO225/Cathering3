// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './hooks/useAuth.jsx'; // Asegúrate de que la extensión sea correcta
import { BrowserRouter } from 'react-router-dom';

// Opcional: Estilos base, si tienes un archivo styles/index.css
// import './styles/index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter necesita envolver toda la app para manejar las rutas */}
    <BrowserRouter>
      {/* AuthProvider necesita envolver la app para que useAuth esté disponible */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);