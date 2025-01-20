import fetch from 'node-fetch';
import amqp from 'amqplib';
export async function calculateRoots(a, b, c) {
    const p = new Promise(async (resolve, reject) => {
        try {
            console.log("Connecting to RabbitMQ...");
            const connection = await amqp.connect("amqp://localhost");
            console.log("Connection established!");
            console.log("Sending call to function calculateRoots");
            const channel = await connection.createChannel();
            const q = await channel.assertQueue('', {
                exclusive: true,
            });
            let calculateRoots_exchange = 'gama_exchange';
            await channel.assertExchange(calculateRoots_exchange, 'direct', {
                durable: false,
            });
            const correlationId = generateUuid();
            const callObj = {
                funcName: "calculateRoots",
                parameters: {
                    a: a,
                    b: b,
                    c: c,
                },
            };
            channel.consume(q.queue, (msg) => {
                if (msg) {
                    const message = JSON.parse(msg.content.toString());
                    console.log("Receiving response for function calculateRoots");
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
            channel.publish(calculateRoots_exchange, 'server_calculateRoots', Buffer.from(JSON.stringify(callObj)), {
                correlationId: correlationId,
                replyTo: q.queue
            });
        } catch (error) {
            console.error("Error processing call to function calculateRoots:", error);
            reject(error);
        }
    });
    return p;

    function generateUuid() {
        return Math.random().toString() + Math.random().toString() + Math.random().toString();
    }
}