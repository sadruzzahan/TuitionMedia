const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== DATABASE INSPECTION ===\n');
    
    // Check table counts
    const tables = [
      'users',
      'tuition_requests', 
      'applications',
      'tutor_posts',
      'student_profiles',
      'tutor_profiles',
      'payments',
      'booking_fees',
      'reviews',
      'notifications',
      'documents',
      'otp_codes',
      'refresh_tokens',
      'admin_audits'
    ];
    
    console.log('Table Counts:');
    for (const table of tables) {
      try {
        const model = prisma[table.slice(0, -1)]; // Remove 's' for singular
        const count = await model.count();
        console.log(`${table}: ${count} records`);
      } catch (error) {
        console.log(`${table}: Error - ${error.message}`);
      }
    }
    
    // Check recent activity
    console.log('\n=== Recent Activity ===');
    
    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { id: true, email: true, role: true, created_at: true }
    });
    console.log('Recent Users:', recentUsers);
    
    // Recent tuition requests
    const recentRequests = await prisma.tuitionRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, createdAt: true }
    });
    console.log('Recent Tuition Requests:', recentRequests);
    
    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, amount: true, status: true, method: true, createdAt: true }
    });
    console.log('Recent Payments:', recentPayments);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
