import express from 'express';
const app = express();
const port = 3333;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
async function waitForCalldelta() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let processWarningLogs_exchange = 'log_exchange';
    await channel.assertExchange(processWarningLogs_exchange, 'topic', {
        durable: false
    });
    const qprocessWarningLogs = await channel.assertQueue('', {
        exclusive: true
    });
    await channel.bindQueue(qprocessWarningLogs.queue, processWarningLogs_exchange, 'log.*.warning');
    channel.consume(qprocessWarningLogs.queue, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            const {
                log
            } = message.parameters;
            console.log("Calling function processWarningLogs", log);
            const resultprocessWarningLogs = await processWarningLogs(log);
            const responseprocessWarningLogs = {
                funcName: "processWarningLogs",
                result: resultprocessWarningLogs,
            };
            console.log("Sending response to function processWarningLogs");
            channel.publish('', msg.properties.replyTo, Buffer.from(JSON.stringify(responseprocessWarningLogs)), {
                correlationId: msg.properties.correlationId
            });
        }
    }, {
        noAck: true
    });
}
waitForCalldelta();

function processWarningLogs(log) {
    console.log(`Warning log: ${log}`);
}