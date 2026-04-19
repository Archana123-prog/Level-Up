
const mongoose = require('mongoose');
async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/levelup', { serverSelectionTimeoutMS: 2000 });
    console.log('SUCCESS');
    process.exit(0);
  } catch (e) {
    console.log('FAILURE');
    process.exit(1);
  }
}
test();
