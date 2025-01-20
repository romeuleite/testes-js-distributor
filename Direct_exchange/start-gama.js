import express from 'express';
const app = express();
const port = 4444;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
import {
    calculateDelta
} from "./functions-alfa.js";
async function waitForCallgama() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let calculateRoots_exchange = 'gama_exchange';
    await channel.assertExchange(calculateRoots_exchange, 'direct', {
        durable: false
    });
    const qcalculateRoots = await channel.assertQueue('', {
        exclusive: true
    });
    await channel.bindQueue(qcalculateRoots.queue, calculateRoots_exchange, 'server_calculateRoots');
    channel.consume(qcalculateRoots.queue, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            const {
                a,
                b,
                c
            } = message.parameters;
            console.log("Calling function calculateRoots", a, b, c);
            const resultcalculateRoots = await calculateRoots(a, b, c);
            const responsecalculateRoots = {
                funcName: "calculateRoots",
                result: resultcalculateRoots,
            };
            console.log("Sending response to function calculateRoots");
            channel.publish('', msg.properties.replyTo, Buffer.from(JSON.stringify(responsecalculateRoots)), {
                correlationId: msg.properties.correlationId
            });
        }
    }, {
        noAck: true
    });
}
waitForCallgama();
async function calculateRoots(a, b, c) {
    const delta = await calculateDelta(a, b, c);
    if (delta < 0) {
        return 'A equação não possui raízes reais';

    } else if (delta === 0) {
        const root = -b / (2 * a);

        return `A equação possui uma raiz real: ${root}`;

    } else {
        const root1 = (-b + Math.sqrt(delta)) / (2 * a);

        const root2 = (-b - Math.sqrt(delta)) / (2 * a);

        return `A equação possui duas raízes reais: ${root1} e ${root2}`;

    }
}