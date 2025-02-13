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
    let sendLogs_exchange = 'log_exchange';
    await channel.assertExchange(sendLogs_exchange, 'topic', {
        durable: false
    });
    const qsendLogs = await channel.assertQueue('', {
        exclusive: true
    });
    await channel.bindQueue(qsendLogs.queue, sendLogs_exchange, 'log.error.warnings');
    channel.consume(qsendLogs.queue, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            const {
                log
            } = message.parameters;
            console.log("Calling function sendLogs", log);
            const resultsendLogs = await sendLogs(log);
            const responsesendLogs = {
                funcName: "sendLogs",
                result: resultsendLogs,
            };
            console.log("Sending response to function sendLogs");
            channel.publish('', msg.properties.replyTo, Buffer.from(JSON.stringify(responsesendLogs)), {
                correlationId: msg.properties.correlationId
            });
        }
    }, {
        noAck: true
    });
}
waitForCallalfa();

function sendLogs(log) {
    console.log(`Sending log: ${log}`);
}