#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 School Management System - Deployment Setup');
console.log('===============================================\n');

// Check if Git is installed
const gitPath = process.platform === 'win32' ? '"C:\\Program Files\\Git\\bin\\git.exe"' : 'git';
try {
  execSync(`${gitPath} --version`, { stdio: 'pipe' });
  console.log('✅ Git is installed');
} catch (error) {
  console.log('❌ Git is not installed. Please install Git first.');
  process.exit(1);
}

// Check if we're in a Git repository
try {
  execSync(`${gitPath} status`, { stdio: 'pipe' });
  console.log('✅ Git repository is initialized');
} catch (error) {
  console.log('❌ Not in a Git repository. Please run git init first.');
  process.exit(1);
}

// Check for required files
const requiredFiles = [
  'package.json',
  'server.js',
  'vercel.json',
  'client/package.json'
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} is missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the project structure.');
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Environment setup...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('DATABASE_URL')) {
    console.log('✅ DATABASE_URL is configured');
  } else {
    console.log('⚠️  DATABASE_URL is not configured in .env');
  }
  
  if (envContent.includes('JWT_SECRET')) {
    console.log('✅ JWT_SECRET is configured');
  } else {
    console.log('⚠️  JWT_SECRET is not configured in .env');
  }
} else {
  console.log('⚠️  .env file does not exist. You\'ll need to configure environment variables in Vercel.');
}

// Display next steps
console.log('\n📋 Next Steps:');
console.log('1. Create a GitHub repository at https://github.com/new');
console.log('2. Add the remote repository:');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/school-management-system.git');
console.log('3. Push to GitHub:');
console.log('   git push -u origin master');
console.log('4. Deploy to Vercel:');
console.log('   - Install Vercel CLI: npm i -g vercel');
console.log('   - Login: vercel login');
console.log('   - Deploy: vercel');
console.log('5. Configure environment variables in Vercel dashboard:');
console.log('   - DATABASE_URL (your Neon DB connection string)');
console.log('   - JWT_SECRET (your JWT secret key)');
console.log('   - NODE_ENV=production');
console.log('\n📖 See DEPLOYMENT.md for detailed instructions.');

// Optional: Check if we can push to GitHub
try {
  const remotes = execSync(`${gitPath} remote`, { encoding: 'utf8' }).trim();
  if (remotes.includes('origin')) {
    console.log('\n🔗 Git remote "origin" is configured');
    console.log('   You can push with: git push -u origin master');
  } else {
    console.log('\n🔗 Git remote not configured. Add your GitHub repository first.');
  }
} catch (error) {
  console.log('\n🔗 No Git remotes configured yet.');
}

console.log('\n✨ Setup complete! Your project is ready for deployment.');
