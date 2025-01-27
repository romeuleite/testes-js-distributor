import amqp from 'amqplib';

export async function cancelBooking_server() {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const mainFunctionQueue = 'mainFunction_call_queue';
    await channel.assertQueue(mainFunctionQueue, { durable: false });

    channel.consume(mainFunctionQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const callbackQueueName = params.callbackQueueName
        const bookingid = params.bookingid
        const userid = params.userid

        cancelBooking(bookingid, userid, (result) => {
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

function cancelBooking(bookingid, userid, callback) {
    console.log(`dataaccess.remove(module.dbNames.bookingName,{'_id': ${bookingid}, 'customerId':${userid})`)

    const error = false;

    if (error) {
        callback(new Error("Error"));
    } else {
        callback(null);
    }

}

cancelBooking_server();
