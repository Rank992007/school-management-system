#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Environment Variables Setup');
console.log('================================\n');

// Read current .env file
let currentEnv = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      currentEnv[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('No existing .env file found, creating new one.\n');
}

// Ask for DATABASE_URL
rl.question('Enter your Neon DB connection string (or press Enter to keep current): ', (dbUrl) => {
  if (dbUrl.trim()) {
    currentEnv.DATABASE_URL = dbUrl.trim();
  }
  
  // Ask for JWT_SECRET
  rl.question('Enter your JWT secret (or press Enter to keep current): ', (jwtSecret) => {
    if (jwtSecret.trim()) {
      currentEnv.JWT_SECRET = jwtSecret.trim();
    }
    
    // Set other required variables
    currentEnv.PORT = currentEnv.PORT || '5000';
    currentEnv.NODE_ENV = currentEnv.NODE_ENV || 'production';
    
    // Write to .env file
    const envContent = Object.entries(currentEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Environment variables updated in .env file:');
    console.log('=============================================');
    console.log('DATABASE_URL:', currentEnv.DATABASE_URL);
    console.log('JWT_SECRET:', currentEnv.JWT_SECRET);
    console.log('PORT:', currentEnv.PORT);
    console.log('NODE_ENV:', currentEnv.NODE_ENV);
    console.log('\n📋 Copy these values to Vercel environment variables:');
    console.log('====================================================');
    console.log('DATABASE_URL =', currentEnv.DATABASE_URL);
    console.log('JWT_SECRET =', currentEnv.JWT_SECRET);
    console.log('NODE_ENV = production\n');
    
    rl.close();
  });
});
