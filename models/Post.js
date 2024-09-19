const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const postSchema = new mongoose.Schema({
  username: { type: String },
  image: { type: Buffer, required: true },
  comments: [{ username: String, text: String }],
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
  contentType: { type: String, required: true } 
}, { timestamps: true });

postSchema.plugin(AutoIncrement, { inc_field: 'pid' });

module.exports = mongoose.model('Post', postSchema);
