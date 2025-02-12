function sendPushNotification(user, subject) {
    const notification = `${user} says: ${subject}`;
    
    return processPushNotification(notification);
}

function processPushNotification(notification) {
    console.log(`Processing message: ${notification}`);

    return !!notification
}
