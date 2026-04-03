import mongoose from 'mongoose';

const borrowRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'],
      default: 'PENDING',
    },
    dueDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    deviceCondition: {
      type: String,
      enum: ['GOOD', 'MINOR DAMAGE', 'DAMAGED'],
      trim: true,
    },
    returnNotes: {
      type: String,
      trim: true,
    },
    penaltyAmount: { type: Number, default: 0 },
    daysLate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const BorrowRequest = mongoose.model('BorrowRequest', borrowRequestSchema);

export default BorrowRequest;
