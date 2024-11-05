const fs = require('fs');
const path = require('path');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { fetchSimInfo } = require('./simInfo.js'); // Importing the function

const client = new Client({
    puppeteer: {
        executablePath: "/usr/bin/google-chrome-stable",
        args: [
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-software-rasterizer",
        ],
        headless: true,
    },
});

const adminNum = "923125581867@c.us";

// Normalize phone number to the format used by WhatsApp (country code without leading zeros)
const normalizeNumber = (number) => {
    if (number.startsWith('0')) {
        return `92${number.slice(1)}@c.us`;
    }
    if (!number.endsWith('@c.us')) {
        return `${number}@c.us`;
    }
    return number;
};

const numbersFilePath = path.join(__dirname, 'numbers.txt');

// Function to load numbers from numbers.txt file
function loadNumbers() {
    if (!fs.existsSync(numbersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(numbersFilePath, 'utf-8').trim();
    return data ? data.split('\n').map(num => normalizeNumber(num.trim())) : [];
}

// Function to save a number to the file
const saveNumber = (number) => {
    const numbers = loadNumbers();
    const normalizedNumber = normalizeNumber(number);
    if (!numbers.includes(normalizedNumber)) {
        fs.appendFileSync(numbersFilePath, `${normalizedNumber}\n`);
    }
};

// Function to remove a number from the file
const removeNumber = (number) => {
    const normalizedNumber = normalizeNumber(number);
    const numbers = loadNumbers().filter(num => num !== normalizedNumber && num !== adminNum); // Prevent admin's number from being removed
    fs.writeFileSync(numbersFilePath, numbers.join('\n') + '\n');
};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code with your phone to log in.');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    const senderNumber = msg.from;
    console.log(`Received message from: ${senderNumber}`);

    // Load the numbers from the file dynamically
    const numbers = loadNumbers();
    console.log(`Loaded numbers: ${numbers}`);

    // Only respond if the message is from the admin or a normalized number in the numbers.txt file
    if (senderNumber !== adminNum && !numbers.includes(normalizeNumber(senderNumber))) {
        console.log(`Number ${senderNumber} is not authorized.`);
        return;
    }

    // Admin commands (only accessible to the admin)
    if (senderNumber === adminNum) {
        // Check if the admin wants to add a number
        if (msg.body.startsWith("add:")) {
            const numberToAdd = msg.body.split(":")[1].trim();
            saveNumber(numberToAdd);
            await client.sendMessage(senderNumber, `Number ${normalizeNumber(numberToAdd)} has been added to the list.`);
            console.log(`Added number: ${normalizeNumber(numberToAdd)}`);
            return;
        }

        // Check if the admin wants to remove a number
        if (msg.body.startsWith("remove:")) {
            const numberToRemove = msg.body.split(":")[1].trim();
            if (normalizeNumber(numberToRemove) === adminNum) {
                await client.sendMessage(senderNumber, "You cannot remove the admin's own number.");
            } else {
                removeNumber(numberToRemove);
                await client.sendMessage(senderNumber, `Number ${normalizeNumber(numberToRemove)} has been removed from the list.`);
                console.log(`Removed number: ${normalizeNumber(numberToRemove)}`);
            }
            return;
        }

        // If the admin messages "list", send the list of numbers
        if (msg.body.toLowerCase() === "list") {
            const numbersList = loadNumbers().join('\n');
            await client.sendMessage(senderNumber, `Here is the list of numbers:\n${numbersList}`);
            return;
        }
    }

    // If the admin or a number inside the numbers.txt file sends a message starting with "siminfo:", fetch SIM info
    if (msg.body.toLowerCase().startsWith("siminfo:")) {
        const number = msg.body.split(":")[1].trim(); // Extract number from message

        // Fetch SIM info
        const simInfo = await fetchSimInfo(number);

        // Send response back to WhatsApp
        await client.sendMessage(senderNumber, `Here's the available SIM info:\n\n${simInfo}`);
    }
});

client.initialize();
