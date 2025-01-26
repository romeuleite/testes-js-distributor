import amqp from 'amqplib';

export async function mainFunction_client(inputArray, callback) {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const callbackQueue = 'mainFunction_callback_queue';
    await channel.assertQueue(callbackQueue, { durable: false });

    const msgContent = {
        inputArray: inputArray,
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
    let inputArray = [1, 2, 3, 4, 5];

    mainFunction_client(inputArray, function (number) {
        console.log('Result: ' + number)
    });
}

main();