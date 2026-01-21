// src/config/sqs.js
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({ region: "us-east-1" });

const sendOrderToQueue = async (orderData) => {
    // Esta URL vendrá de tus variables de entorno (Terraform output)
    const queueUrl = process.env.SQS_WALLET_URL; 

    if (!queueUrl) {
        console.error("⚠️ CRITICAL: SQS_WALLET_URL no está definida.");
        return;
    }

    const params = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(orderData),
        MessageGroupId: "orders", // Opcional si usas colas FIFO, para Standard no hace daño
    };

    try {
        const command = new SendMessageCommand(params);
        const result = await sqsClient.send(command);
        console.log(`✅ Mensaje enviado a SQS: ${result.MessageId}`);
        return result;
    } catch (error) {
        console.error("❌ Error enviando a SQS:", error);
        throw error;
    }
};

module.exports = { sendOrderToQueue };