// models/Award.js
const AwardSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },

  // NEW
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
});
