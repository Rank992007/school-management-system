#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Complete Deployment Automation');
console.log('==================================\n');

// Read .env file to get environment variables
let envVars = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  console.log('✅ Environment variables loaded from .env file');
} catch (error) {
  console.log('⚠️  Could not read .env file. You\'ll need to set environment variables manually.');
}

console.log('\n📋 Environment Variables for Vercel:');
console.log('=====================================');
console.log('DATABASE_URL:', envVars.DATABASE_URL || 'SET_THIS_IN_VERCEL');
console.log('JWT_SECRET:', envVars.JWT_SECRET || 'SET_THIS_IN_VERCEL');
console.log('NODE_ENV: production\n');

console.log('🔗 Quick Deployment Steps:');
console.log('=========================\n');
console.log('1. Go to: https://vercel.com');
console.log('2. Login with GitHub');
console.log('3. Click "New Project"');
console.log('4. Select: Rank992007/school-management-system');
console.log('5. Click "Import"\n');

console.log('⚙️  Vercel Configuration:');
console.log('======================');
console.log('Framework Preset: Other');
console.log('Root Directory: .');
console.log('Build Command: npm install && cd client && npm install && npm run build');
console.log('Output Directory: client/build');
console.log('Install Command: npm install\n');

console.log('🔧 Environment Variables to Add:');
console.log('=================================');
console.log('DATABASE_URL =', envVars.DATABASE_URL || 'your_neon_db_connection_string');
console.log('JWT_SECRET =', envVars.JWT_SECRET || 'your_jwt_secret_key');
console.log('NODE_ENV = production\n');

console.log('🚀 Click "Deploy" and wait for deployment to complete.\n');

console.log('📱 Your Live App Will Be At:');
console.log('===========================');
console.log('https://school-management-system-rank992007.vercel.app\n');

console.log('🔗 Useful Links:');
console.log('===============');
console.log('GitHub: https://github.com/Rank992007/school-management-system');
console.log('Vercel Dashboard: https://vercel.com/dashboard');
console.log('Neon DB: https://neon.tech\n');

console.log('💡 After Deployment:');
console.log('====================');
console.log('1. Test the live application');
console.log('2. Set up database schema if needed: node setup-database.js');
console.log('3. Register first users (student/teacher)');
console.log('4. Test all features\n');

console.log('✨ Ready to deploy! Follow the steps above.');
