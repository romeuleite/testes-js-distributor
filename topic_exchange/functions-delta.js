import fetch from 'node-fetch';
import amqp from 'amqplib';
export async function processWarningLogs(log) {
    const p = new Promise(async (resolve, reject) => {
        try {
            console.log("Connecting to RabbitMQ...");
            const connection = await amqp.connect("amqp://localhost");
            console.log("Connection established!");
            console.log("Sending call to function processWarningLogs");
            const channel = await connection.createChannel();
            const q = await channel.assertQueue('', {
                exclusive: true,
            });
            let processWarningLogs_exchange = 'log_exchange';
            await channel.assertExchange(processWarningLogs_exchange, 'topic', {
                durable: false,
            });
            const correlationId = generateUuid();
            const callObj = {
                funcName: "processWarningLogs",
                parameters: {
                    log: log,
                },
            };
            channel.consume(q.queue, (msg) => {
                if (msg) {
                    const message = JSON.parse(msg.content.toString());
                    console.log("Receiving response for function processWarningLogs");
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
            channel.publish(processWarningLogs_exchange, 'log.*.warning', Buffer.from(JSON.stringify(callObj)), {
                correlationId: correlationId,
                replyTo: q.queue
            });
        } catch (error) {
            console.error("Error processing call to function processWarningLogs:", error);
            reject(error);
        }
    });
    return p;

    function generateUuid() {
        return Math.random().toString() + Math.random().toString() + Math.random().toString();
    }
}