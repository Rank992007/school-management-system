#!/usr/bin/env node

console.log('🌐 School Management System - Web Deployment Guide');
console.log('====================================================\n');

console.log('✅ Your code is already on GitHub!');
console.log('📍 Repository: https://github.com/Rank992007/school-management-system\n');

console.log('📋 Next Steps for Vercel Deployment:');
console.log('1. Go to https://vercel.com');
console.log('2. Click "Sign up" or "Login"');
console.log('3. Choose "Continue with GitHub"');
console.log('4. Click "New Project"');
console.log('5. Select "school-management-system" from your GitHub repos');
console.log('6. Click "Import"\n');

console.log('⚙️  Vercel will auto-detect these settings:');
console.log('   - Framework Preset: Other');
console.log('   - Root Directory: . (root)');
console.log('   - Build Command: npm install && cd client && npm install && npm run build');
console.log('   - Output Directory: client/build');
console.log('   - Install Command: npm install\n');

console.log('🔧 Add these Environment Variables:');
console.log('   DATABASE_URL=' + process.env.DATABASE_URL || 'your_neon_db_connection_string');
console.log('   JWT_SECRET=' + process.env.JWT_SECRET || 'your_jwt_secret_key');
console.log('   NODE_ENV=production\n');

console.log('🚀 Click "Deploy" and wait for deployment to complete.\n');

console.log('📱 After deployment, your app will be available at:');
console.log('   https://school-management-system-rank992007.vercel.app\n');

console.log('🔗 Quick Links:');
console.log('   - GitHub: https://github.com/Rank992007/school-management-system');
console.log('   - Vercel: https://vercel.com');
console.log('   - Neon DB: https://neon.tech\n');

console.log('💡 Tip: Make sure your Neon DB is running and the connection string is correct!');
