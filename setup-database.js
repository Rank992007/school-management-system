const db = require('./config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // Read the schema SQL file
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        // Ignore errors for statements that might already exist
        if (!error.message.includes('already exists')) {
          console.error('Error executing statement:', statement);
          console.error('Error:', error.message);
        }
      }
    }
    
    console.log('Database schema setup completed successfully!');
    
    // Test the connection
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection test:', result.rows[0].current_time);
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
