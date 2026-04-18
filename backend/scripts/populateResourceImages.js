import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Resource from '../models/Resource.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const IMAGE_BY_KEYWORD = [
  {
    keywords: ['laptop', 'notebook', 'macbook', 'lenovo', 'dell xps'],
    url: 'https://source.unsplash.com/1200x800/?laptop,computer',
  },
  {
    keywords: ['desktop', 'pc', 'workstation', 'all-in-one'],
    url: 'https://source.unsplash.com/1200x800/?desktop,computer',
  },
  {
    keywords: ['headset', 'headphone', 'earphone', 'audio'],
    url: 'https://source.unsplash.com/1200x800/?headset,headphones',
  },
  {
    keywords: ['monitor', 'display', 'screen'],
    url: 'https://source.unsplash.com/1200x800/?monitor,display',
  },
  {
    keywords: ['projector'],
    url: 'https://source.unsplash.com/1200x800/?projector,presentation',
  },
  {
    keywords: ['printer'],
    url: 'https://source.unsplash.com/1200x800/?printer,office',
  },
  {
    keywords: ['tablet', 'ipad'],
    url: 'https://source.unsplash.com/1200x800/?tablet,device',
  },
  {
    keywords: ['charger', 'adapter', 'power', 'usb-c', 'hub', 'dock', 'accessory'],
    url: 'https://source.unsplash.com/1200x800/?charger,usb,accessories',
  },
  {
    keywords: ['network', 'router', 'switch', 'modem', 'wifi'],
    url: 'https://source.unsplash.com/1200x800/?networking,router',
  },
  {
    keywords: ['software', 'license'],
    url: 'https://source.unsplash.com/1200x800/?software,code',
  },
];

const DEFAULT_IMAGE = 'https://source.unsplash.com/1200x800/?technology,device';

function pickImage(resource) {
  const searchText = `${resource?.name || ''} ${resource?.category || ''}`.toLowerCase();
  const match = IMAGE_BY_KEYWORD.find((entry) =>
    entry.keywords.some((keyword) => searchText.includes(keyword))
  );
  return match ? match.url : DEFAULT_IMAGE;
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const resources = await Resource.find({
    $or: [{ image: { $exists: false } }, { image: null }, { image: '' }],
  });

  if (resources.length === 0) {
    console.log('No resources need image updates.');
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  for (const resource of resources) {
    resource.image = pickImage(resource);
    await resource.save();
    updated += 1;
    console.log(`Updated: ${resource.name} -> ${resource.image}`);
  }

  console.log(`Done. Updated ${updated} resource(s).`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Image population failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
