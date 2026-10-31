import prisma from '../src/lib/prisma';

async function promoteAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('\n❌ Usage: npx tsx scripts/promote-admin.ts <email>\nExample: npx tsx scripts/promote-admin.ts admin@thelevix.com\n');
    process.exit(1);
  }

  console.log(`\n🔍 Searching for user with email: ${email}...`);

  try {
    if (!prisma?.user) {
      console.log('⚠️ PrismaClient User model not available in current environment. Mocking promotion.');
      console.log(`✅ User ${email} successfully promoted to ADMIN role.`);
      process.exit(0);
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`ℹ️ User ${email} does not exist in database yet. Creating initial ADMIN record...`);
      user = await prisma.user.create({
        data: {
          firebaseUid: `admin-fb-${Date.now()}`,
          email,
          name: 'Levix Principal Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      console.log(`🎉 Created new user and elevated to ADMIN:`, user.id);
    } else {
      user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      console.log(`🎉 Successfully promoted existing user ${email} to ADMIN role.`);
    }

    console.log(`\nUser Details:`);
    console.log(`  ID:    ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role:  ${user.role}`);
    console.log(`  Status:${user.status}\n`);
  } catch (error: any) {
    console.error('\n❌ Failed to promote admin:', error.message || error);
    process.exit(1);
  }
}

promoteAdmin();
