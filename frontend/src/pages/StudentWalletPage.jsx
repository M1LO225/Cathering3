import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const StudentWalletPage = () => {
    const { walletService } = useAuth();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const loadBalance = async () => {
        if(walletService) {
            const data = await walletService.getBalance();
            setBalance(data.saldo);
        }
    };

    useEffect(() => { loadBalance(); }, [walletService]);

    const handleTopUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await walletService.topUp(amount);
            alert(`Recarga de $${amount} exitosa.`);
            setAmount('');
            loadBalance();
        } catch (error) {
            alert("Error en la recarga");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h1>Mi Billetera Digital</h1>
            
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', padding: '40px', borderRadius: '20px', marginBottom: '30px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}>
                <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>Saldo Disponible</p>
                <h2 style={{ fontSize: '3em', margin: 0 }}>${parseFloat(balance).toFixed(2)}</h2>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '30px', borderRadius: '10px' }}>
                <h3>Recargar Saldo</h3>
                <form onSubmit={handleTopUp}>
                    <Input 
                        label="Monto a recargar ($)" 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        required 
                    />

                    <Input label="Número de Tarjeta (Simulado)" placeholder="**** **** **** ****" />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Input label="MM/YY" placeholder="12/25" />
                        <Input label="CVV" placeholder="123" />
                    </div>
                    
                    <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Procesando...' : 'Confirmar Recarga'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default StudentWalletPage;