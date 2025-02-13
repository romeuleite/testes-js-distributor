import amqp from 'amqplib';

export async function cancelBooking_server() {

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const cancelBookingQueue = 'cancelBooking_call_queue';
    await channel.assertQueue(cancelBookingQueue, { durable: false });

    channel.consume(cancelBookingQueue, async (msg) => {
        const params = JSON.parse(msg.content.toString());
        const callbackQueueName = params.callbackQueueName

        const bookingid = params.bookingid
        const userid = params.userid

        cancelBooking(bookingid, userid, (error) => {
            const msgContent = {
                error: error
            }

            channel.sendToQueue(
                callbackQueueName,
                Buffer.from(JSON.stringify(msgContent))
            );
        })
    }, { noAck: true });
}

function cancelBooking(bookingid, userid, callback /*(error)*/) {
    dataaccess.remove('module.dbNames.bookingName',{'_id':bookingid, 'customerId':userid}, callback)
}

cancelBooking_server();