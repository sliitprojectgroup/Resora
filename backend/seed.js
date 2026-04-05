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

// Helper for unique device codes
const createCode = (prefix, i) => `${prefix}-${String(i).padStart(3, '0')}`;

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear DB
  await BorrowRequest.deleteMany({});
  await Resource.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared existing data');

  // ================= USERS =================
  const users = await User.insertMany([
    { name: 'Shwetha Wickramasinghe', email: 'shwetha@resora.lk', password: '123', role: 'student', studentId: 'IT21890' },
    { name: 'Kulitha Rajapaksha', email: 'kulitha@resora.lk', password: '123', role: 'student', studentId: 'IT21455' },
    { name: 'Kasun Silva', email: 'kasun@resora.lk', password: '123', role: 'student', studentId: 'IT21234' },
    { name: 'Dilini Jayawardena', email: 'dilini@resora.lk', password: '123', role: 'student', studentId: 'IT21567' },
    { name: 'Ravindu Bandara', email: 'ravindu@resora.lk', password: '123', role: 'student', studentId: 'IT21789' },
    { name: 'Tharushi Mendis', email: 'tharushi@resora.lk', password: '123', role: 'student', studentId: 'IT21345' },
    { name: 'Chamod Dissanayake', email: 'chamod@resora.lk', password: '123', role: 'student', studentId: 'IT21678' },
    { name: 'Sanduni Wijesinghe', email: 'sanduni@resora.lk', password: '123', role: 'student', studentId: 'IT21901' },
    { name: 'Isuru Gamage', email: 'isuru@resora.lk', password: '123', role: 'student', studentId: 'IT21123' },
    { name: 'Nethmi Perera', email: 'nethmi@resora.lk', password: '123', role: 'student', studentId: 'IT21456' },
    { name: 'Nimesh Perera', email: 'nimesh@resora.lk', password: '123', role: 'staff' },
    { name: 'Oshani Fernando', email: 'oshani@resora.lk', password: '123', role: 'admin' },
  ]);

  console.log(`Inserted ${users.length} users`);

  // ================= RESOURCES =================
  let resourcesData = [];

  // 💻 10 SAME LAPTOPS
  for (let i = 1; i <= 10; i++) {
    resourcesData.push({
      name: 'Dell Latitude 5420',
      category: 'Laptop',
      status: i <= 8 ? 'BORROWED' : 'AVAILABLE',
      deviceCode: createCode('LAP', i),
    });
  }

  // 💻 Additional laptops
  for (let i = 11; i <= 15; i++) {
    resourcesData.push({
      name: 'HP EliteBook 840 G8',
      category: 'Laptop',
      status: i <= 12 ? 'BORROWED' : 'AVAILABLE',
      deviceCode: createCode('LAP', i),
    });
  }

  // ⌨️ Keyboards (6)
  for (let i = 1; i <= 6; i++) {
    resourcesData.push({
      name: 'Logitech K120 Keyboard',
      category: 'Keyboard',
      status: 'AVAILABLE',
      deviceCode: createCode('KEY', i),
    });
  }

  // 🖱️ Mouse (6)
  for (let i = 1; i <= 6; i++) {
    resourcesData.push({
      name: 'Logitech M185 Mouse',
      category: 'Mouse',
      status: i <= 4 ? 'BORROWED' : 'AVAILABLE',
      deviceCode: createCode('MOU', i),
    });
  }

  // 🎧 Headsets (4)
  for (let i = 1; i <= 4; i++) {
    resourcesData.push({
      name: 'Logitech Headset',
      category: 'Headset',
      status: i <= 2 ? 'BORROWED' : 'AVAILABLE',
      deviceCode: createCode('HED', i),
    });
  }

  // 🔌 Accessories
  const accessories = [
    'USB-C Hub',
    'Dell Charger 65W',
    'HP Charger 90W',
    'Extension Cable',
    'HDMI Cable',
    'LAN Cable',
  ];

  accessories.forEach((item, i) => {
    resourcesData.push({
      name: item,
      category: 'Accessory',
      status: 'AVAILABLE',
      deviceCode: createCode('ACC', i + 1),
    });
  });

  const resources = await Resource.insertMany(resourcesData);
  console.log(`Inserted ${resources.length} resources`);

  // ================= BORROW REQUESTS =================
  const now = new Date();

  const borrowRequests = await BorrowRequest.insertMany([
    // 🔥 MANY PENDING
    { student: users[0]._id, resource: resources[13]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 5 * 86400000) },
    { student: users[1]._id, resource: resources[14]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 7 * 86400000) },
    { student: users[2]._id, resource: resources[15]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 6 * 86400000) },
    { student: users[3]._id, resource: resources[16]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 4 * 86400000) },
    { student: users[4]._id, resource: resources[17]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 3 * 86400000) },
    { student: users[5]._id, resource: resources[18]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 8 * 86400000) },
    { student: users[6]._id, resource: resources[19]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 6 * 86400000) },
    { student: users[7]._id, resource: resources[20]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 5 * 86400000) },
    { student: users[8]._id, resource: resources[27]._id, status: 'PENDING', dueDate: new Date(now.getTime() + 4 * 86400000) },

    // 🔥 APPROVED (borrowed) - Laptops
    { student: users[0]._id, resource: resources[0]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 5 * 86400000) },
    { student: users[1]._id, resource: resources[1]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 6 * 86400000) },
    { student: users[2]._id, resource: resources[2]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 7 * 86400000) },
    { student: users[3]._id, resource: resources[3]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 4 * 86400000) },
    { student: users[4]._id, resource: resources[4]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 3 * 86400000) },
    { student: users[5]._id, resource: resources[5]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 8 * 86400000) },
    { student: users[6]._id, resource: resources[6]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 5 * 86400000) },
    { student: users[7]._id, resource: resources[7]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 6 * 86400000) },
    { student: users[8]._id, resource: resources[10]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 4 * 86400000) },
    { student: users[9]._id, resource: resources[11]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 7 * 86400000) },
    { student: users[10]._id, resource: resources[12]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 5 * 86400000) },

    // 🔥 APPROVED (borrowed) - Mouse
    { student: users[0]._id, resource: resources[21]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 3 * 86400000) },
    { student: users[1]._id, resource: resources[22]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 4 * 86400000) },
    { student: users[4]._id, resource: resources[23]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 5 * 86400000) },
    { student: users[5]._id, resource: resources[24]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 6 * 86400000) },

    // 🔥 APPROVED (borrowed) - Headsets
    { student: users[2]._id, resource: resources[27]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 4 * 86400000) },
    { student: users[3]._id, resource: resources[28]._id, status: 'APPROVED', dueDate: new Date(now.getTime() + 5 * 86400000) },

    // ⏰ OVERDUE (important for monitoring)
    {
      student: users[9]._id,
      resource: resources[8]._id,
      status: 'APPROVED',
      dueDate: new Date(now.getTime() - 3 * 86400000),
    },
    {
      student: users[10]._id,
      resource: resources[9]._id,
      status: 'APPROVED',
      dueDate: new Date(now.getTime() - 5 * 86400000),
    },
    {
      student: users[11]._id,
      resource: resources[25]._id,
      status: 'APPROVED',
      dueDate: new Date(now.getTime() - 2 * 86400000),
    },

    // ✅ RETURNED
    {
      student: users[2]._id,
      resource: resources[29]._id,
      status: 'RETURNED',
      dueDate: new Date(now.getTime() - 5 * 86400000),
      returnDate: new Date(now.getTime() - 2 * 86400000),
    },
    {
      student: users[3]._id,
      resource: resources[30]._id,
      status: 'RETURNED',
      dueDate: new Date(now.getTime() - 8 * 86400000),
      returnDate: new Date(now.getTime() - 4 * 86400000),
    },
    {
      student: users[6]._id,
      resource: resources[26]._id,
      status: 'RETURNED',
      dueDate: new Date(now.getTime() - 10 * 86400000),
      returnDate: new Date(now.getTime() - 7 * 86400000),
    },

    // ❌ REJECTED
    {
      student: users[7]._id,
      resource: resources[31]._id,
      status: 'REJECTED',
      dueDate: new Date(now.getTime() + 2 * 86400000),
      rejectionReason: 'Device already reserved',
    },
    {
      student: users[8]._id,
      resource: resources[32]._id,
      status: 'REJECTED',
      dueDate: new Date(now.getTime() + 3 * 86400000),
      rejectionReason: 'Student has overdue items',
    },
  ]);

  console.log(`Inserted ${borrowRequests.length} requests`);

  console.log('Seeding complete!');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  mongoose.disconnect();
  process.exit(1);
});