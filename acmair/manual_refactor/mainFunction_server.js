import amqp from 'amqplib';

function mainFunction(callbackFunction) {
    console.log('Performing operation...');

    callbackFunction('Operation complete');
}

export async function mainFunction_server() {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const mainFunctionQueue = 'mainFunction_call_queue';
    await channel.assertQueue(mainFunctionQueue, { durable: false });

    channel.consume(mainFunctionQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const callbackQueueName = params.callbackQueueName

        mainFunction((result) => {
            const msgContent = {
                result: result
            }

            channel.sendToQueue(
                callbackQueueName,
                Buffer.from(JSON.stringify(msgContent))
            );
        })
        

    }, { noAck: true });

}

mainFunction_server();