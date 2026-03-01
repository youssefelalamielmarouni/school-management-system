import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  day: { 
    type: String, 
    enum: ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'], 
    required: true 
  },
  startTime: { type: String, required: true }, // مثال: "08:30"
  endTime: { type: String, required: true },
  room: { type: String } // اختياري: رقم القاعة أو الفصل
}, { timestamps: true });

export default mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);