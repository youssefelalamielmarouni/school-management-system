import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // اختياري
  day: { 
    type: String, 
    enum: ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], 
    required: true 
  },
  startTime: { type: String, required: true }, // مثال: "08:30"
  endTime: { type: String, required: true },
}, { timestamps: true });

const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
export default Timetable;