import express from 'express';
const app = express();
const port = 4444;
app.use(express.json());
app.listen(port, () => {
  console.log('Server running in port ' + port);
});
import amqp from 'amqplib';
async function waitForCallbeta() {
    const connection = await amqp.connect("amqp://localhost");
    console.log("Waiting for calls");
    const channel = await connection.createChannel();
    let processErrorLogs_exchange = 'log_exchange';
    await channel.assertExchange(processErrorLogs_exchange, 'topic', {
        durable: false
    });
    const qprocessErrorLogs = await channel.assertQueue('', {
        exclusive: true
    });
    await channel.bindQueue(qprocessErrorLogs.queue, processErrorLogs_exchange, 'log.error.*');
    channel.consume(qprocessErrorLogs.queue, async (msg) => {
        if (msg) {
            console.log("Receiving call");
            const message = JSON.parse(msg.content.toString());
            const {
                log
            } = message.parameters;
            console.log("Calling function processErrorLogs", log);
            const resultprocessErrorLogs = await processErrorLogs(log);
            const responseprocessErrorLogs = {
                funcName: "processErrorLogs",
                result: resultprocessErrorLogs,
            };
            console.log("Sending response to function processErrorLogs");
            channel.publish('', msg.properties.replyTo, Buffer.from(JSON.stringify(responseprocessErrorLogs)), {
                correlationId: msg.properties.correlationId
            });
        }
    }, {
        noAck: true
    });
}
waitForCallbeta();

function processErrorLogs(log) {
    console.log(`Error log: ${log}`);
}