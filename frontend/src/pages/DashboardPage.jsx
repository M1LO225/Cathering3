// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { authService, logout } = useAuth();
  const [protectedData, setProtectedData] = useState('Cargando...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usamos el método fetchProtected del servicio para obtener datos
        // NOTA: 'protected/data' es el endpoint que creamos en index.js del backend
        const response = await authService.fetchProtected('protected/data');
        const data = await response.json();
        setProtectedData(data.data);
      } catch (error) {
        setProtectedData('Error al cargar datos protegidos o sesión expirada.');
        // El authService ya llamó a logout() si el token es inválido
      }
    };
    fetchData();
  }, [authService]);

  return (
    <div style={{ padding: '20px', border: '1px solid green' }}>
      <h1>Panel de Control (Ruta Protegida)</h1>
      <p>¡Bienvenido! Solo ves esto si el JWT es válido.</p>
      
      <p><strong>Datos del Backend:</strong> {protectedData}</p>
      
      <Button onClick={logout} style={{ backgroundColor: 'darkred' }}>
        Cerrar Sesión
      </Button>
    </div>
  );
};

export default DashboardPage;