import fetch from 'node-fetch';
import amqp from 'amqplib';
export async function sendLogs(log) {
    const p = new Promise(async (resolve, reject) => {
        try {
            console.log("Connecting to RabbitMQ...");
            const connection = await amqp.connect("amqp://localhost");
            console.log("Connection established!");
            console.log("Sending call to function sendLogs");
            const channel = await connection.createChannel();
            const q = await channel.assertQueue('', {
                exclusive: true,
            });
            let sendLogs_exchange = 'log_exchange';
            await channel.assertExchange(sendLogs_exchange, 'topic', {
                durable: false,
            });
            const correlationId = generateUuid();
            const callObj = {
                funcName: "sendLogs",
                parameters: {
                    log: log,
                },
            };
            channel.consume(q.queue, (msg) => {
                if (msg) {
                    const message = JSON.parse(msg.content.toString());
                    console.log("Receiving response for function sendLogs");
                    if (msg.properties.correlationId === correlationId) {
                        const result = message.result;
                        console.log("Response received:", result);
                        resolve(result);
                        channel.cancel(msg.fields.consumerTag);
                    }
                }
            }, {
                noAck: true,
            });
            channel.publish(sendLogs_exchange, 'log.error.warnings', Buffer.from(JSON.stringify(callObj)), {
                correlationId: correlationId,
                replyTo: q.queue
            });
        } catch (error) {
            console.error("Error processing call to function sendLogs:", error);
            reject(error);
        }
    });
    return p;

    function generateUuid() {
        return Math.random().toString() + Math.random().toString() + Math.random().toString();
    }
}