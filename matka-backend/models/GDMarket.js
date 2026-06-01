import mongoose from 'mongoose';

const gdMarketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active_days: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6]
  },
  open_time: {
    type: String,
    required: true
  },
  close_time: {
    type: String,
    required: true
  },
  jodi_result: {
    type: String,
    default: '**'
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, { timestamps: true });

export default mongoose.model('GDMarket', gdMarketSchema);
