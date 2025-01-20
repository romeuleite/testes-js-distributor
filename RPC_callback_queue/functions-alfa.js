import fetch from 'node-fetch';
import amqp from 'amqplib';
export async function calculateDelta(a, b, c) {
    const p = new Promise(async (resolve, reject) => {
        try {
            console.log("Connecting to RabbitMQ...");
            const connection = await amqp.connect("amqp://localhost");
            console.log("Connection established!");
            console.log("Sending call to function calculateDelta");
            const channel = await connection.createChannel();
            const q = await channel.assertQueue('', {
                exclusive: true,
            });
            let queueName = "fila_alfa";
            console.log("Declaring queue: fila_alfa");
            let callbackQueue = "callback_alfa";
            await channel.assertQueue(callbackQueue, {
                durable: false
            });
            const correlationId = generateUuid();
            const callObj = {
                funcName: "calculateDelta",
                parameters: {
                    a: a,
                    b: b,
                    c: c,
                },
            };
            channel.consume(callbackQueue, (msg) => {
                if (msg) {
                    const message = JSON.parse(msg.content.toString());
                    console.log("Receiving response for function calculateDelta");
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
            console.log("Sending message to queue: fila_alfa");
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(callObj)), {
                correlationId: correlationId
            });
        } catch (error) {
            console.error("Error processing call to function calculateDelta:", error);
            reject(error);
        }
    });
    return p;

    function generateUuid() {
        return Math.random().toString() + Math.random().toString() + Math.random().toString();
    }
}