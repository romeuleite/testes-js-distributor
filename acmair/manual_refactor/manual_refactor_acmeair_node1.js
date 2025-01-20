import amqp from 'amqplib';

export async function callbackFunc(req, res) {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const callbackQueue = 'callback_queue';
    await channel.assertQueue(callbackQueue, { durable: false });

    const msgContent = {
        number: req.number,
        userid: req.userid,
        callbackQueueName: callbackQueue
    }

    channel.sendToQueue(
        'cancelBooking_queue',
        Buffer.from(JSON.stringify(msgContent))
    );

    channel.consume(callbackQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const error = params.result

        if (error) {
            res.send({ 'status': 'error' });
        }
        else {
            res.send({ 'status': 'success' });
        }

    }, { noAck: true });

}

let requisition = { "number": 100, "userid": 123 };

function response() {
    return {
        send: function (message) {
            console.log("Resposta enviada: " + message.status);
        }
    };
}

callbackFunc(requisition, response());