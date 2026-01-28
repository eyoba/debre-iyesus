const bcrypt = require('bcrypt');

const password = 'admin123'; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('\nGenerated password hash for "admin123":');
    console.log(hash);
    console.log('\nCopy this hash and use it in your schema.sql or database INSERT statement.');
  }
});
