require('dotenv').config();
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

const token = jwt.sign(
  {
    userId: 'test-user',
    client: 'client1',
    auth: true
  },
  jwtSecret,
  { expiresIn: '2h' }
);

console.log('\n==== JWT Token Generated ====');
console.log(token);
console.log('\nUse this token in the frontend Authorization field:');
console.log(`Bearer ${token}`);
console.log('=============================\n');
