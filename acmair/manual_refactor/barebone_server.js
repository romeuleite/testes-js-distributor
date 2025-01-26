import amqp from 'amqplib';

function mainFunction(param1, callbackFunction) {
    // Perform some tasks
    callbackFunction(); // Invoke the callbak
}

export async function mainFunction_server() {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const mainFunctionQueue = 'mainFunction_call_queue';
    await channel.assertQueue(mainFunctionQueue, { durable: false });

    channel.consume(mainFunctionQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const callbackQueueName = params.callbackQueueName
        const param1 = params.param1

        mainFunction(param1, (result) => {
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