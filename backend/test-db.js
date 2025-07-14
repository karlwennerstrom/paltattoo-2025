const { testConnection } = require('./config/database');

async function test() {
  console.log('Testing database connection...');
  const connected = await testConnection();
  
  if (connected) {
    console.log('✓ Database connection successful!');
    process.exit(0);
  } else {
    console.log('✗ Database connection failed!');
    console.log('Please check your MySQL configuration and .env file');
    process.exit(1);
  }
}

test();