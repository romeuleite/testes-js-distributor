import express from 'express';
const app = express();
const port = 4444;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
import {
    calculateRemainder
} from "./functions-alfa.js";
async function waitForCallbeta() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let isDivisor_queueName = "isDivisor_call_queue";
    await channel.assertQueue(isDivisor_queueName, {
        durable: false
    });
    channel.consume(isDivisor_queueName, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            if (message.funcName === "isDivisor") {
                const {
                    a,
                    b
                } = message.parameters;
                console.log("Calling function isDivisor", a, b);
                const resultisDivisor = await isDivisor(a, b);
                const responseisDivisor = {
                    funcName: "isDivisor",
                    result: resultisDivisor,
                };
                console.log("Sending response to function isDivisor");
                channel.sendToQueue('isDivisor_callback_queue', Buffer.from(JSON.stringify(responseisDivisor)), {
                    correlationId: msg.properties.correlationId
                });
            }
        }
    }, {
        noAck: true
    });
}
waitForCallbeta();
async function isDivisor(a, b) {
    const remainder = await calculateRemainder(a, b);
    if (remainder === 0)
        return true;
    else return false;
}