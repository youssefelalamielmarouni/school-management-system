import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', // ربط المادة بمعلم معين
    required: true 
  },
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', // ربط المادة بفصل معين
    required: true 
  },
  subjectCode: { type: String, unique: true }, // كود المادة مثل (MATH101)
  createdAt: { type: Date, default: Date.now }
});

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;