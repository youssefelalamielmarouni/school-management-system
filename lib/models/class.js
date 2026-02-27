import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true }, // مثل: "Grade 10-A"
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', // يجب أن يطابق الاسم الذي سجلت به موديل المستخدمين
    required: true 
  },
  capacity: { type: Number, default: 30 },
  createdAt: { type: Date, default: Date.now }
});

const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
export default Class;