import amqp from 'amqplib';

export async function cancelBooking_client(number, userid, callback) {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();


    const callbackQueue = 'mainFunction_callback_queue';
    await channel.assertQueue(callbackQueue, { durable: false });

    const msgContent = {
        number: number,
        userid: userid,
        callbackQueueName: callbackQueue
    }

    channel.consume(callbackQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const result = params.result

        callback(result)

    }, { noAck: true });


    channel.sendToQueue(
        'mainFunction_call_queue',
        Buffer.from(JSON.stringify(msgContent))
    );

}

function main() {

    let number = 100;
    let userid = 123;

    cancelBooking_client(number, userid, function (error) {
        if (error) {
            console.log("Resposta enviada: " + error);
        }
        else {
            console.log("Resposta enviada: " + 'success');
        }
    });
}

main();
