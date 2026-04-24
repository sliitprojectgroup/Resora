import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

async function globalSetup() {
  console.log('🌱 Re-seeding database before tests...');
  execSync('node seed.js', {
    cwd: resolve('backend'),
    stdio: 'inherit',
  });
  console.log('✅ Database seeded successfully');
}

export default globalSetup;
