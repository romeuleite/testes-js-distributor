import express from 'express';
const app = express();
const port = 2222;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
import {
    isDivisorOfBoth
} from "./functions-gama.js";
async function waitForCalldelta() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let checkCommonDivisor_queueName = "checkCommonDivisor_call_queue";
    await channel.assertQueue(checkCommonDivisor_queueName, {
        durable: false
    });
    channel.consume(checkCommonDivisor_queueName, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            if (message.funcName === "checkCommonDivisor") {
                const {
                    divisor,
                    a,
                    b
                } = message.parameters;
                console.log("Calling function checkCommonDivisor", divisor, a, b);
                const resultcheckCommonDivisor = await checkCommonDivisor(divisor, a, b);
                const responsecheckCommonDivisor = {
                    funcName: "checkCommonDivisor",
                    result: resultcheckCommonDivisor,
                };
                console.log("Sending response to function checkCommonDivisor");
                channel.sendToQueue('checkCommonDivisor_callback_queue', Buffer.from(JSON.stringify(responsecheckCommonDivisor)), {
                    correlationId: msg.properties.correlationId
                });
            }
        }
    }, {
        noAck: true
    });
}
waitForCalldelta();
async function checkCommonDivisor(divisor, a, b) {
    if (await isDivisorOfBoth(divisor, a, b)) {
        return `${divisor} is a common divisor of ${a} and ${b}`;

    } else {
        return `${divisor} is not a common divisor of ${a} and ${b}`;

    }
}