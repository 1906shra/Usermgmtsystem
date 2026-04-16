require('dotenv').config();
const mongoose = require('mongoose');
const { User, ROLES } = require('../models/User.model');

const seedUsers = [
  {
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    status: 'active',
  },
  {
    name: 'Jane Manager',
    email: 'manager@example.com',
    password: 'Manager@123',
    role: ROLES.MANAGER,
    status: 'active',
  },
  {
    name: 'John User',
    email: 'user@example.com',
    password: 'User@123',
    role: ROLES.USER,
    status: 'active',
  },
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'Alice@123',
    role: ROLES.USER,
    status: 'active',
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'Bob@123',
    role: ROLES.USER,
    status: 'inactive',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create admin first (no createdBy)
    const admin = await User.create(seedUsers[0]);
    console.log(`✅ Created admin: ${admin.email}`);

    // Create remaining users with createdBy = admin
    for (let i = 1; i < seedUsers.length; i++) {
      const user = await User.create({
        ...seedUsers[i],
        createdBy: admin._id,
        updatedBy: admin._id,
      });
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:   admin@example.com   / Admin@123');
    console.log('  Manager: manager@example.com / Manager@123');
    console.log('  User:    user@example.com    / User@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
