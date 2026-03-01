import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late'], 
    default: 'Present' 
  },
  remarks: { type: String } // ملاحظات اختيارية (مثل: بعذر طبي)
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);