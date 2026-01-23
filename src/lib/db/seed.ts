import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'src/lib/db/users.json');
const mockUsersFilePath = path.join(process.cwd(), 'src/lib/db/mock-users.json');

/**
 * Seed mock users to database
 * Run this script to populate users.json with test users
 */
async function seedUsers() {
  try {
    // Read mock users
    const mockUsersData = fs.readFileSync(mockUsersFilePath, 'utf-8');
    const mockUsers = JSON.parse(mockUsersData);

    // Write to users.json
    fs.writeFileSync(usersFilePath, JSON.stringify(mockUsers, null, 2));
    
    console.log('✅ Mock users seeded successfully!');
    console.log('\n📋 Test accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Admin User');
    console.log('   Email/Username: admin@example.com hoặc admin');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2. John Doe');
    console.log('   Email/Username: john@example.com hoặc johndoe');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3. Test User');
    console.log('   Email: user@example.com');
    console.log('   Password: user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

export { seedUsers };
