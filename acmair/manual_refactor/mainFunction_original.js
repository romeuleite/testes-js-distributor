// Basic Syntax
function mainFunction(param1, callbackFunction) {
    // Perform some tasks
    callbackFunction(); // Invoke the callbak
}

mainFunction(param1, () => { });

// Basic Example
function mainFunction(callbackFunction) {
    console.log('Performing operation...');

    callbackFunction('Operation complete');
}

mainFunction(function (result) {
    console.log('Result: ' + result)
});

// Param array example
function mainFunction(arrayOfNumbers, callbackFunction) {
    console.log('Performing operation...');

    arrayOfNumbers.forEach(callbackFunction)
}

let inputArray = [1, 2, 3, 4, 5];

mainFunction(inputArray, function (number) {
    console.log('Result: ' + number)
});
