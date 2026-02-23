const { default: mongoose } = require("mongoose");

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    },
    parentContact: {
      type: String,
      required: true
    },
    currentClass : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    }
});
