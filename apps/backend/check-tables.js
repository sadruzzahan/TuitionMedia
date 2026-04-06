const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('=== CHECKING TABLE STRUCTURE ===\n');
    
    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('Available tables:');
    tables.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Test accessing each table
    console.log('\n=== TESTING TABLE ACCESS ===');
    
    const tableTests = [
      { name: 'users', model: 'user' },
      { name: 'tuition_requests', model: 'tuitionRequest' },
      { name: 'applications', model: 'application' },
      { name: 'tutor_posts', model: 'tutorPost' },
      { name: 'student_profiles', model: 'studentProfile' },
      { name: 'tutor_profiles', model: 'tutorProfile' },
      { name: 'payments', model: 'payment' },
      { name: 'booking_fees', model: 'bookingFee' },
      { name: 'reviews', model: 'review' },
      { name: 'notifications', model: 'notification' },
      { name: 'documents', model: 'document' },
      { name: 'otp_codes', model: 'otpCode' },
      { name: 'refresh_tokens', model: 'refreshToken' },
      { name: 'admin_audits', model: 'adminAudit' }
    ];
    
    for (const test of tableTests) {
      try {
        const count = await prisma[test.model].count();
        console.log(`${test.name}: ${count} records ✓`);
      } catch (error) {
        console.log(`${test.name}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
