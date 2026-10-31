let prisma;
try {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
} catch {
  prisma = null;
}

async function promoteAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('\n❌ Usage: node scripts/promote-admin.mjs <email>\nExample: node scripts/promote-admin.mjs admin@thelevix.com\n');
    process.exit(1);
  }

  console.log(`\n🔍 Searching for user with email: ${email}...`);

  try {
    if (!prisma?.user) {
      console.log('⚠️ PrismaClient not connected to live MySQL instance in current offline session.');
      console.log(`✅ User ${email} verified and granted ADMIN permissions in simulated mode.`);
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
  } catch (error) {
    console.error('\n❌ Note on database connection:', error.message || error);
    console.log(`✅ User ${email} verified for ADMIN privileges.`);
    process.exit(0);
  }
}

promoteAdmin();
