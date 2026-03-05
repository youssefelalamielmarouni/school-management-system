import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true }, // اسم المادة
  examName: { type: String, required: true }, // مثال: اختبار شهر مارس
  score: { type: Number, required: true },
  totalScore: { type: Number, default: 100 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Grade || mongoose.model('Grade', gradeSchema);