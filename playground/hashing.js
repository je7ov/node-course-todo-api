const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

// const message = 'I am user number 3';
// const hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
// console.log(SHA256(message).toString() === hash);

const data = {
  id: 10
};

const token = jwt.sign(data, '123abc');

console.log(token);

const decoded = jwt.verify(token, '123abc');

console.log(decoded);