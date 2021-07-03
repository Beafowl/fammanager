const stringMath = require('string-math');

// helper functions

const prependZero = (n) => {

    return n > 9 ? '' + n : '0' + n;
}

const getTime = () => {

    const date = new Date();
    return `[${prependZero(date.getHours())}:${prependZero(date.getMinutes())}:${prependZero(date.getSeconds())}]`;
}

const print = (msg) => {

    console.log(`${getTime()} ${msg}`);
}

const formattedNumber = (x) => {

    const roundedNumber = Math.round(x);

    return roundedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const resolveGoldAmount = (gold) => {

    gold = gold.replace(/k/i, '*1000'); // replace first occurence of k with times 1000
    gold = gold.replace(/k/gi, '000'); // another k makes it to millions, billions etc
    gold = gold.replace(/,/i, '.'); // replace comma with period to make it a viable mathematical expression

    return stringMath(gold);
}

module.exports = {

    prependZero,
    getTime,
    print,
    formattedNumber,
    resolveGoldAmount

}