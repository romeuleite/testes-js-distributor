import express from 'express';
const app = express();
const port = 5555;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
async function waitForCallalfa() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let calculateRemainder_queueName = "calculateRemainder_call_queue";
    await channel.assertQueue(calculateRemainder_queueName, {
        durable: false
    });
    channel.consume(calculateRemainder_queueName, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            if (message.funcName === "calculateRemainder") {
                const {
                    a,
                    b
                } = message.parameters;
                console.log("Calling function calculateRemainder", a, b);
                const resultcalculateRemainder = await calculateRemainder(a, b);
                const responsecalculateRemainder = {
                    funcName: "calculateRemainder",
                    result: resultcalculateRemainder,
                };
                console.log("Sending response to function calculateRemainder");
                channel.sendToQueue('calculateRemainder_callback_queue', Buffer.from(JSON.stringify(responsecalculateRemainder)), {
                    correlationId: msg.properties.correlationId
                });
            }
        }
    }, {
        noAck: true
    });
}
waitForCallalfa();

function calculateRemainder(a, b) {
    return b % a;
}