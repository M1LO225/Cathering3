// Ruta: frontend/src/pages/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';


const UserManagementPage = () => {
    const { userService, isAuthenticated, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la CREACIÓN
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);

    // Estados para la EDICIÓN
    const [editingUser, setEditingUser] = useState(null); // ID del usuario que se está editando
    const [editForm, setEditForm] = useState({ username: '', email: '', password: '' }); 


    const fetchUsers = async () => {
        if (!userService) return;
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('401') || err.message.includes('403')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated, userService]);

    // --- MANEJO DE CREACIÓN ---
    const handleCreateFormChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await userService.createUser(createForm);
            alert(`User ${createForm.username} created successfully!`);
            setCreateForm({ username: '', email: '', password: '' });
            setIsCreating(false);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- MANEJO DE EDICIÓN ---
    const startEditing = (user) => {
        // Establecer el usuario a editar y precargar el formulario
        setEditingUser(user.id);
        setEditForm({ 
            username: user.username, 
            email: user.email, 
            password: '' // La contraseña debe dejarse vacía
        });
    };

    const handleEditFormChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError(null);
        if (!editingUser) return;
        
        // Objeto de actualizaciones
        const updates = {};
        const currentUserData = users.find(u => u.id === editingUser);

        // Comprobar cambios
        if (editForm.username !== currentUserData.username) {
            updates.username = editForm.username;
        }
        if (editForm.email !== currentUserData.email) {
            updates.email = editForm.email;
        }
        // Solo incluir la contraseña si se escribió algo
        if (editForm.password) {
            updates.password = editForm.password;
        }
        
        // Si no hay cambios, cancelar la operación
        if (Object.keys(updates).length === 0) {
            setEditingUser(null);
            return alert("No changes detected.");
        }

        try {
            await userService.updateUser(editingUser, updates);
            alert(`User ID ${editingUser} updated successfully.`);
            setEditingUser(null); // Cerrar el formulario de edición
            fetchUsers(); // Recargar la lista
        } catch (err) {
            setError(err.message);
        }
    };
    
    // --- MANEJO DE ELIMINACIÓN ---
    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`Are you sure you want to delete user ID ${userId}?`)) return;
        
        setError(null);
        try {
            await userService.deleteUser(userId);
            alert(`User ID ${userId} deleted.`);
            fetchUsers(); // Recargar la lista
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Cargando usuarios...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="user-management-container">
            <h1>Gestión de Usuarios (CRUD Completo)</h1>
            <p className="total-users">Total Users: {users.length}</p>

            {/* Formulario de Creación */}
            <button 
                className="btn-toggle-create"
                onClick={() => setIsCreating(!isCreating)}
            >
                {isCreating ? 'Ocultar Formulario' : 'Crear Nuevo Usuario'}
            </button>

            {isCreating && (
                <form className="create-form" onSubmit={handleCreateUser}>
                    <h3>Crear Usuario</h3>
                    <input type="text" name="username" placeholder="Username" value={createForm.username} onChange={handleCreateFormChange} required />
                    <input type="email" name="email" placeholder="Email" value={createForm.email} onChange={handleCreateFormChange} required />
                    <input type="password" name="password" placeholder="Password" value={createForm.password} onChange={handleCreateFormChange} required />
                    <button type="submit">Crear</button>
                </form>
            )}

            {/* Listado de Usuarios */}
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Created At</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <React.Fragment key={user.id}>
                            <tr>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        className="btn-edit" 
                                        onClick={() => startEditing(user)}
                                        disabled={editingUser === user.id}
                                    >
                                        {editingUser === user.id ? 'Editing...' : 'Edit'}
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            
                            {/* Formulario de Edición en Línea */}
                            {editingUser === user.id && (
                                <tr>
                                    <td colSpan="5">
                                        <form className="edit-form" onSubmit={handleUpdateUser}>
                                            <h4>Edit User ID: {user.id}</h4>
                                            <input type="text" name="username" placeholder="Username" value={editForm.username} onChange={handleEditFormChange} required />
                                            <input type="email" name="email" placeholder="Email" value={editForm.email} onChange={handleEditFormChange} required />
                                            <input type="password" name="password" placeholder="New Password (optional)" value={editForm.password} onChange={handleEditFormChange} />
                                            <button type="submit">Save Changes</button>
                                            <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
                                        </form>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;