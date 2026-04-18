import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BORROWED'],
      default: 'AVAILABLE',
    },
    deviceCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Allows multiple null/undefined values if some resources don't have codes
    },
    image: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
