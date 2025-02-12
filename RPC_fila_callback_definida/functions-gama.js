import fetch from 'node-fetch';
import amqp from 'amqplib';
export async function isDivisorOfBoth(divisor, a, b) {
    const p = new Promise(async (resolve, reject) => {
        try {
            console.log("Connecting to RabbitMQ...");
            const connection = await amqp.connect("amqp://localhost");
            console.log("Connection established!");
            console.log("Sending call to function isDivisorOfBoth");
            const channel = await connection.createChannel();
            const q = await channel.assertQueue('', {
                exclusive: true,
            });
            let queueName = "isDivisorOfBoth_call_queue";
            console.log("Declaring queue: isDivisorOfBoth_call_queue");
            let callbackQueue = "isDivisorOfBoth_callback_queue";
            await channel.assertQueue(callbackQueue, {
                durable: false
            });
            const correlationId = generateUuid();
            const callObj = {
                funcName: "isDivisorOfBoth",
                parameters: {
                    divisor: divisor,
                    a: a,
                    b: b,
                },
            };
            channel.consume(callbackQueue, (msg) => {
                if (msg) {
                    const message = JSON.parse(msg.content.toString());
                    console.log("Receiving response for function isDivisorOfBoth");
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
            console.log("Sending message to queue: isDivisorOfBoth_call_queue");
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(callObj)), {
                correlationId: correlationId
            });
        } catch (error) {
            console.error("Error processing call to function isDivisorOfBoth:", error);
            reject(error);
        }
    });
    return p;

    function generateUuid() {
        return Math.random().toString() + Math.random().toString() + Math.random().toString();
    }
}