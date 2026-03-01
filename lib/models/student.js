import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  role: { type: String, default: 'student' }
}, { 
  timestamps: true,
  collection: 'students' // تأكيد اسم الجدول في MongoDB
});



// تأكد من استخدام الاسم الصحيح للموديل
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default Student;