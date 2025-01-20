import amqp from 'amqplib';

export async function cancelBookingCallback() {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const cancelBookingQueue = 'cancelBooking_queue';
    await channel.assertQueue(cancelBookingQueue, { durable: false });

    channel.consume(cancelBookingQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const bookingid = params.number
        const userid = params.userid
        const callbackQueueName = params.callbackQueueName

        console.log(`dataaccess.remove(module.dbNames.bookingName,{'_id': ${bookingid}, 'customerId':${userid})`)
        const result = new Error("Error");

        const msgContent = {
            result: result
        }

        channel.sendToQueue(
            callbackQueueName,
            Buffer.from(JSON.stringify(msgContent))
        );

    }, { noAck: true });

}

cancelBookingCallback()