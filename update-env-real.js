const fs = require('fs');

const envContent = `PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_Avr9RQfbJ2dX@ep-summer-sun-ajbnpk2z-pooler.c-3.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=production`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file updated with real Neon DB connection string');
console.log('📋 Environment variables ready for Vercel deployment');
