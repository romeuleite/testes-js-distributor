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
    let calculateDelta_queueName = "fila_alfa";
    await channel.assertQueue(calculateDelta_queueName, {
        durable: false
    });
    channel.consume(calculateDelta_queueName, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            if (message.funcName === "calculateDelta") {
                const {
                    a,
                    b,
                    c
                } = message.parameters;
                console.log("Calling function calculateDelta", a, b, c);
                const resultcalculateDelta = await calculateDelta(a, b, c);
                const responsecalculateDelta = {
                    funcName: "calculateDelta",
                    result: resultcalculateDelta,
                };
                console.log("Sending response to function calculateDelta");
                channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responsecalculateDelta)), {
                    correlationId: msg.properties.correlationId
                });
            }
        }
    }, {
        noAck: true
    });
}
waitForCallalfa();

function calculateDelta(a, b, c) {
    const delta = b * b - 4 * a * c;
    return delta;
}