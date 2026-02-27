import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true }, // رقم الطالب
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', // الربط مع موديل الفصول
    required: true 
  },
  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default Student;