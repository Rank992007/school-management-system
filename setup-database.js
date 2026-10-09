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

    const migrationStatements = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6)",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP",
      "ALTER TABLE bulletins ADD COLUMN IF NOT EXISTS total_days INTEGER DEFAULT 0",
      "ALTER TABLE bulletins ADD COLUMN IF NOT EXISTS present_days INTEGER DEFAULT 0",
      "ALTER TABLE bulletins ADD COLUMN IF NOT EXISTS attendance_percentage DECIMAL(5,2) DEFAULT 0",
      "ALTER TABLE bulletin_subjects ADD COLUMN IF NOT EXISTS subject_name VARCHAR(50)",
      "ALTER TABLE bulletin_subjects ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(100)",
      "ALTER TABLE bulletin_subjects ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) DEFAULT 0",
      "CREATE TABLE IF NOT EXISTS bulletin_marks (id SERIAL PRIMARY KEY, bulletin_subject_id INTEGER NOT NULL REFERENCES bulletin_subjects(id) ON DELETE CASCADE, test_type VARCHAR(20) NOT NULL, score INTEGER NOT NULL, max_score INTEGER NOT NULL, date TIMESTAMP)"
    ];

    for (const statement of migrationStatements) {
      try {
        await db.query(statement);
        console.log('✓ Migration applied:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('Migration error:', statement, error.message);
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
