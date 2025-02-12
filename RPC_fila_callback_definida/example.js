function calculateRemainder(a, b) {
    return b % a;
}

function isDivisor(a, b) {
    const remainder = calculateRemainder(a, b);

    if (remainder === 0) return true;
    else return false;
}

function isDivisorOfBoth(divisor, a, b) {
    return isDivisor(divisor, a) && isDivisor(divisor, b);
}

function checkCommonDivisor(divisor, a, b) {
    if (isDivisorOfBoth(divisor, a, b)) {
        return `${divisor} is a common divisor of ${a} and ${b}`
    } else {
        return `${divisor} is not a common divisor of ${a} and ${b}`
    }
}