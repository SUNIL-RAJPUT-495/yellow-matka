import mongoose from 'mongoose';

const gdResultSchema = new mongoose.Schema({
  market_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GDMarket',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  jodi: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('GDResult', gdResultSchema);
