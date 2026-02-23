const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  target_groups: [{
    type: String,
    enum: ['students', 'teachers', 'parents', 'all'],
    required: true
  }],

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Announcement', announcementSchema);