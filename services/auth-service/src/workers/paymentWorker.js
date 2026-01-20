const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({ region: "us-east-1" });
const QUEUE_URL = process.env.SQS_WALLET_URL;

const startPaymentWorker = (UserModel, TransactionModel) => {
    console.log("👷 Worker de Pagos iniciado. Escuchando SQS...");

    const pollQueue = async () => {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: QUEUE_URL,
                MaxNumberOfMessages: 1, // Procesar de 1 en 1 para evitar condiciones de carrera
                WaitTimeSeconds: 20,    // Long Polling (ahorra dinero)
                VisibilityTimeout: 30
            });

            const response = await sqsClient.send(command);

            if (response.Messages && response.Messages.length > 0) {
                const message = response.Messages[0];
                const body = JSON.parse(message.Body);
                
                console.log(`📨 Procesando pago para Orden #${body.orderId}`);
                
                await processPayment(body, UserModel, TransactionModel);

                // Borrar mensaje de la cola tras procesar
                await sqsClient.send(new DeleteMessageCommand({
                    QueueUrl: QUEUE_URL,
                    ReceiptHandle: message.ReceiptHandle
                }));
            }
        } catch (err) {
            console.error("Error en Worker SQS:", err);
        }

        // Volver a preguntar a la cola inmediatamente
        setImmediate(pollQueue);
    };

    pollQueue();
};

async function processPayment(data, UserModel, TransactionModel) {
    const { userId, amount, orderId } = data;
    
    // Buscar usuario y wallet (Asumiendo que el saldo está en UserModel o una tabla relacionada)
    // Ajusta esto según tu modelo real de Auth
    const user = await UserModel.findByPk(userId);
    
    if (!user) {
        console.error(`❌ Usuario ${userId} no encontrado.`);
        // Aquí deberías enviar un mensaje a la cola "order_result" diciendo FAILED
        return;
    }

    // Lógica simple de saldo (Ajusta a tus campos reales)
    // Asumiré que el usuario tiene un campo 'balance' o relación 'wallet'
    // Si usas TransactionModel para calcular saldo, haz la suma aquí.
    
    if (parseFloat(user.balance) >= amount) {
        // Debitar
        const newBalance = parseFloat(user.balance) - amount;
        await user.update({ balance: newBalance });
        
        // Registrar Transacción
        await TransactionModel.create({
            userId: userId,
            amount: -amount,
            type: 'PURCHASE',
            description: `Pago Orden #${orderId}`
        });

        console.log(`✅ Pago exitoso. Nuevo saldo: ${newBalance}`);
        // TODO: Enviar mensaje a cola 'cat-prod-order-result' con status: 'PAID'
    } else {
        console.log(`❌ Saldo insuficiente para usuario ${userId}`);
        // TODO: Enviar mensaje a cola 'cat-prod-order-result' con status: 'CANCELLED'
    }
}

module.exports = startPaymentWorker;