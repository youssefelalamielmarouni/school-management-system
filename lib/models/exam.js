import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  examName: { type: String, required: true }, // مثل: "اختبار الشهر الأول" أو "النهائي"
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  scores: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    marksObtained: { type: Number, default: 0 }
  }],
  totalMarks: { type: Number, default: 100 },
  examDate: { type: Date, default: Date.now }
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', gradeSchema);
export default Exam;