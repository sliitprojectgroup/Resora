import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import User from './models/User.js';
import Resource from './models/Resource.js';
import BorrowRequest from './models/BorrowRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await BorrowRequest.deleteMany({});
  await Resource.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared existing data');

  // Insert Users
  const users = await User.insertMany([
    {
      name: 'Nimesh Perera',
      email: 'nimesh.perera@students.sliit.lk',
      password: 'password123',
      role: 'student',
    },
    {
      name: 'Oshani Fernando',
      email: 'oshani.fernando@students.sliit.lk',
      password: 'password123',
      role: 'student',
    },
    {
      name: 'Kulitha Rajapaksha',
      email: 'kulitha.rajapaksha@students.sliit.lk',
      password: 'password123',
      role: 'student',
    },
    {
      name: 'Shwetha Wickramasinghe',
      email: 'shwetha.wickramasinghe@students.sliit.lk',
      password: 'password123',
      role: 'student',
    },
    {
      name: 'Mr. Ruwan Senanayake',
      email: 'ruwan.senanayake@sliit.lk',
      password: 'staffpass123',
      role: 'staff',
    },
    {
      name: 'Admin Resora',
      email: 'admin@resora.sliit.lk',
      password: 'adminpass123',
      role: 'admin',
    },
  ]);
  console.log(`Inserted ${users.length} users`);

  // Insert Resources
  const resources = await Resource.insertMany([
    {
      name: 'Dell Latitude 5520',
      category: 'Laptop',
      status: 'AVAILABLE',
    },
    {
      name: 'HP ProBook 450',
      category: 'Laptop',
      status: 'BORROWED',
    },
    {
      name: 'Arduino Uno Kit',
      category: 'Arduino Kit',
      status: 'AVAILABLE',
    },
    {
      name: 'Arduino Mega Starter Kit',
      category: 'Arduino Kit',
      status: 'BORROWED',
    },
    {
      name: 'Raspberry Pi 4 Kit',
      category: 'Raspberry Pi Kit',
      status: 'AVAILABLE',
    },
    {
      name: 'Canon EOS 200D Camera',
      category: 'Camera',
      status: 'AVAILABLE',
    },
    {
      name: 'USB Logic Analyzer',
      category: 'Lab Equipment',
      status: 'AVAILABLE',
    },
  ]);
  console.log(`Inserted ${resources.length} resources`);

  // Insert Borrow Requests
  const now = new Date();

  const borrowRequests = await BorrowRequest.insertMany([
    {
      student: users[0]._id,
      resource: resources[0]._id,
      status: 'PENDING',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      student: users[1]._id,
      resource: resources[1]._id,
      status: 'APPROVED',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      student: users[2]._id,
      resource: resources[2]._id,
      status: 'RETURNED',
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      student: users[3]._id,
      resource: resources[3]._id,
      status: 'APPROVED',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      student: users[3]._id,
      resource: resources[4]._id,
      status: 'PENDING',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      student: users[0]._id,
      resource: resources[5]._id,
      status: 'REJECTED',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      rejectionReason: 'Camera is reserved for a scheduled department event.',
    },
    {
      student: users[2]._id,
      resource: resources[6]._id,
      status: 'RETURNED',
      dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log(`Inserted ${borrowRequests.length} borrow requests`);

  console.log('Seeding complete!');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
