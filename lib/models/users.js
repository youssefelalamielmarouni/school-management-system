const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({    
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  studentProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' // يربط الحساب ببيانات الطالب الدراسية
  }
});

const Users = mongoose.models.Users || mongoose.model('Users', userSchema);
export default Users;