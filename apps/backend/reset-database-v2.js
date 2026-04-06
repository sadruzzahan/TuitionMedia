const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function resetAndRecreateDatabase() {
  try {
    console.log('=== DATABASE RESET AND RECREATE ===\n');
    
    // Drop all tables in correct order
    const tables = [
      'payments', 'reviews', 'applications', 'tutor_posts', 
      'tuition_requests', 'student_profiles', 'tutor_profiles', 'users',
      'notifications', 'documents', 'otp_codes', 'refresh_tokens', 
      'admin_audits', 'booking_fees'
    ];
    
    console.log('Dropping existing tables...');
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✓ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠ Table ${table} may not exist: ${error.message}`);
      }
    }
    
    // Drop enums
    const enums = [
      'UserRole', 'ApplicationStatus', 'TuitionRequestStatus',
      'PaymentStatus', 'PaymentMethod', 'DocumentStatus',
      'NotificationType', 'OTPPurpose', 'RequestStatus', 'BookingStatus'
    ];
    
    console.log('\nDropping existing enums...');
    for (const enumType of enums) {
      try {
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "${enumType}" CASCADE;`);
        console.log(`✓ Dropped enum: ${enumType}`);
      } catch (error) {
        console.log(`⚠ Enum ${enumType} may not exist: ${error.message}`);
      }
    }
    
    console.log('\n=== Running migration SQL ===');
    
    // Read migration file and split into individual statements
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'prisma', 'apply-migrations.sql'), 
      'utf8'
    );
    
    // Split SQL into individual statements (handle multi-line statements)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
      .map(stmt => stmt + ';');
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`✓ Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.log(`⚠ Statement ${i + 1} failed: ${error.message}`);
        console.log(`   SQL: ${statement.substring(0, 100)}...`);
      }
    }
    
    console.log('\n=== Verifying created tables ===');
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('Created tables:');
    result.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Regenerate Prisma client
    console.log('\n=== Regenerating Prisma Client ===');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
    
    console.log('\n✅ Database reset and migration completed successfully!');
    
  } catch (error) {
    console.error('Database reset error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndRecreateDatabase();
