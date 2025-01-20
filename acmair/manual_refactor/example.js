function cancelBookingCallback(bookingid, userid, callback) {
    console.log(`dataaccess.remove(module.dbNames.bookingName,{'_id': ${bookingid}, 'customerId':${userid})`)

    const error = false;

    if (error) {
        callback(new Error("Error"));
    } else {
        callback(null);
    }

}

function cancelBooking(req, res) {
    console.log('canceling booking');

    let number = req.number;
    let userid = req.userid;

    cancelBookingCallback(number, userid, function (error) {
        if (error) {
            res.send({ 'status': 'error' });
        }
        else {
            res.send({ 'status': 'success' });
        }
    });
};

function response() {
    return {
        send: function (message) {
            console.log("Resposta enviada: " + message.status);
        }
    };
}

let requisition = { "number": 100, "userid": 123 };

cancelBooking(requisition, response());
