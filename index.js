import crypto from "crypto";

const SYMBOL = "BTCUSDT";
const QUANTITY = "0.001";

const BINANCE_API_URL = process.env.BINANCE_API_URL;
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY;

let isOpened = false;

function getClosePriceInCandle(candle) {
    // Campos retornados no candle
    //[1]open
    //[2]high
    //[3]low
    //[4]close
    return parseFloat(candle[4]);
}

function calcSimpleMovingAverage(data) {
    const closes = data.map(candle => getClosePriceInCandle(candle))
    const sum = closes.reduce((a,b) => a + b)

    return sum / data.length;
}

async function start() {
    const responseData = await fetch(`${BINANCE_API_URL}/api/v3/klines?limit=21&interval=15m&symbol=${SYMBOL}`)
    const responseBody = await responseData.json();

    const candle = responseBody[responseBody.length - 1];

    const price = getClosePriceInCandle(candle);

    console.clear()
    console.log(price);

    const simpleMovingAverage = calcSimpleMovingAverage(responseBody);
    // const simpleMovingAverageIn21Periods = calcSimpleMovingAverage(responseBody);
    // const simpleMovingAverageIn13Periods = calcSimpleMovingAverage(responseBody.slice(8));
    console.log("SMA", simpleMovingAverage);
    // console.log("SMA (13):", simpleMovingAverageIn13Periods);
    // console.log("SMA (21):", simpleMovingAverageIn21Periods);
    console.log("Is Opened:", isOpened);

    // if (simpleMovingAverageIn13Periods > simpleMovingAverageIn21Periods && !isOpened) {
    if (price <= (simpleMovingAverage * 0.9) && !isOpened) {
        isOpened = true;

        newOrder(SYMBOL, QUANTITY, "buy");
    }
    // else if (simpleMovingAverageIn13Periods < simpleMovingAverageIn21Periods && isOpened) {
    else if (price >= (simpleMovingAverage * 1.1) && isOpened) {
        isOpened = false;

        newOrder(SYMBOL, QUANTITY, "sell");
    }
    else {
        console.log("wait")
    }
}

async function newOrder(symbol, quantity, side) {
    const order = { symbol, quantity, side };
    order.type = "MARKET";
    order.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", BINANCE_SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest("hex");

    order.signature = signature;

    try {
        const response = await fetch(`${BINANCE_API_URL}/api/v3/order?${new URLSearchParams(order).toString()}`, {
            method: "POST",
            headers: {
                "X-MBX-APIKEY": BINANCE_API_KEY
            }
        })
        const responseData = await response.json();

        console.log({responseData})
        console.log({responseDataFills: responseData.fills})
    } catch (error) {
        console.log(error);
    }
}

setInterval(() => {
    start();
}, 3000);