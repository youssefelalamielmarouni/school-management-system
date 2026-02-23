const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
    }]
});

module.exports = mongoose.model('Subject', subjectSchema);