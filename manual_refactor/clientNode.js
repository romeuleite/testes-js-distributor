import amqp from 'amqplib';

export async function cancelBooking_client(number, userid, callback) {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const callbackQueue = 'cancelBooking_callback_queue';
    await channel.assertQueue(callbackQueue, { durable: false });

    const msgContent = {
        number: number,
        userid: userid,
        callbackQueueName: callbackQueue
    }

    channel.consume(callbackQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const callback_param = params.callback_param

        callback(callback_param)

    }, { noAck: true });

    channel.sendToQueue(
        'cancelBooking_call_queue',
        Buffer.from(JSON.stringify(msgContent))
    );

}

function main() {
    const number = 1;
    const userid = 123;

    cancelBooking_client(number, userid, function (error) {
        if (error) {
            console.log('status : error');
        }
        else {
            console.log('status : success');
        }
    });
}

main();