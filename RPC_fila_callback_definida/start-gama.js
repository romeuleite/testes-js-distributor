import express from 'express';
const app = express();
const port = 3333;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
import {
    isDivisor
} from "./functions-beta.js";
async function waitForCallgama() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let isDivisorOfBoth_queueName = "isDivisorOfBoth_call_queue";
    await channel.assertQueue(isDivisorOfBoth_queueName, {
        durable: false
    });
    channel.consume(isDivisorOfBoth_queueName, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            if (message.funcName === "isDivisorOfBoth") {
                const {
                    divisor,
                    a,
                    b
                } = message.parameters;
                console.log("Calling function isDivisorOfBoth", divisor, a, b);
                const resultisDivisorOfBoth = await isDivisorOfBoth(divisor, a, b);
                const responseisDivisorOfBoth = {
                    funcName: "isDivisorOfBoth",
                    result: resultisDivisorOfBoth,
                };
                console.log("Sending response to function isDivisorOfBoth");
                channel.sendToQueue('isDivisorOfBoth_callback_queue', Buffer.from(JSON.stringify(responseisDivisorOfBoth)), {
                    correlationId: msg.properties.correlationId
                });
            }
        }
    }, {
        noAck: true
    });
}
waitForCallgama();
async function isDivisorOfBoth(divisor, a, b) {
    return await isDivisor(divisor, a) && await isDivisor(divisor, b);
}