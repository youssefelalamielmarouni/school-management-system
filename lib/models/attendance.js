import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  date: { 
    type: String, // سنخزنه بتنسيق YYYY-MM-DD لتسهيل البحث
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late'], 
    default: 'Present' 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users' // المعلم الذي قام برصد الغياب
  }
}, { timestamps: true });

// منع تكرار تسجيل غياب لنفس الطالب في نفس اليوم
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;