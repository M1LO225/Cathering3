// src/workers/PaymentWorker.js
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { Order, Wallet, Transaction, sequelize } = require('../config/db');

const queueUrl = process.env.SQS_WALLET_URL;
// Instanciamos el cliente fuera, AWS SDK v3 maneja la reconexión y credenciales
const client = new SQSClient({ region: "us-east-1" });

const processMessage = async (message) => {
    console.log(`⚡ [PROCESS] Mensaje recibido ID: ${message.MessageId}`);
    
    try {
        const body = JSON.parse(message.Body);
        const { orderId, userId, amount } = body;

        console.log(`🔍 [LOGIC] Procesando Orden #${orderId} para Usuario ${userId} ($${amount})`);

        await sequelize.transaction(async (t) => {
            const wallet = await Wallet.findOne({ where: { userId } }, { transaction: t });
            
            if (!wallet) {
                console.error(`❌ [ERROR] Wallet no encontrada para usuario ${userId}. Cancelando orden.`);
                await Order.update({ status: 'REJECTED' }, { where: { id: orderId }, transaction: t });
                return; 
            }

            const currentBalance = parseFloat(wallet.balance);
            const amountToPay = parseFloat(amount);

            if (currentBalance < amountToPay) {
                console.warn(`⚠️ [WARN] Saldo insuficiente. Tiene: $${currentBalance}, Requiere: $${amountToPay}`);
                await Order.update({ status: 'REJECTED' }, { where: { id: orderId }, transaction: t });
                return;
            }

            const newBalance = currentBalance - amountToPay;
            await wallet.update({ balance: newBalance }, { transaction: t });
            
            await Transaction.create({
                type: 'PURCHASE',
                amount: amountToPay,
                description: `Compra Orden #${orderId}`,
                walletId: wallet.id
            }, { transaction: t });

            await Order.update({ status: 'PAID', walletId: wallet.id }, { where: { id: orderId }, transaction: t });

            console.log(`✅ [SUCCESS] Cobro realizado. Nuevo saldo: $${newBalance}`);
        });

        return true; 

    } catch (error) {
        console.error(`🔥 [EXCEPTION] Error procesando mensaje: ${error.message}`);
        // No retornamos false aquí si es error de lógica de negocio irrecuperable
        // pero para seguridad de debug, dejemos que SQS lo reintente si es error de DB
        return false; 
    }
};

const startWorker = async () => {
    if (!queueUrl) {
        console.error("⛔ [WORKER] SQS_WALLET_URL no definida.");
        return;
    }
    console.log("🚀 [WORKER] Iniciando Polling (Heartbeat Activo)...");

    let isRunning = true;
    let loopCount = 0;

    while (isRunning) {
        loopCount++;
        // Log de latido cada vez que inicia una vuelta
        console.log(`💓 [POLLING] Vuelta #${loopCount} - Preguntando a SQS...`);

        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 1, // Traer de 1 en 1 para debug
                WaitTimeSeconds: 5,     // Bajamos a 5s para ver logs más rápido en CloudWatch
                VisibilityTimeout: 20   
            });
            
            const response = await client.send(command);

            if (response.Messages && response.Messages.length > 0) {
                console.log(`📬 [SQS] Se encontraron ${response.Messages.length} mensajes.`);
                
                for (const message of response.Messages) {
                    const success = await processMessage(message);

                    if (success) {
                        await client.send(new DeleteMessageCommand({
                            QueueUrl: queueUrl, 
                            ReceiptHandle: message.ReceiptHandle
                        }));
                        console.log("🗑️ [SQS] Mensaje eliminado correctamente.");
                    } else {
                        console.log("⚠️ [SQS] Mensaje NO eliminado (se reintentará).");
                    }
                }
            } else {
                // AQUÍ ESTÁ LA CLAVE: Queremos ver esto para saber si el worker sigue vivo
                console.log("zzz [SQS] La cola está vacía.");
            }

        } catch (error) {
            console.error("💥 [CRITICAL] Error en el bucle de Polling:", error);
            // Espera de seguridad para no saturar logs si falla la red
            await new Promise(r => setTimeout(r, 5000));
        }
    }
};

module.exports = startWorker;