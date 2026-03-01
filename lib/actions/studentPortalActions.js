"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student";
import Attendance from "@/lib/models/attendance";
import Exam from "@/lib/models/exam";
import Timetable from "@/lib/models/Timetable";
import mongoose from "mongoose";

export async function getStudentProfileData(studentId) {
  try {
    await connectDB();

    // 1. التحقق من صحة الـ ID أولاً
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.error("ID غير صالح:", studentId);
      return { error: "معرف الطالب غير صحيح" };
    }

    // 2. جلب بيانات الطالب مع حماية من الـ Null
    const student = await Student.findById(studentId).populate('classId').lean();

    if (!student) {
      console.warn("لم يتم العثور على طالب بالـ ID:", studentId);
      return { error: "لم يتم العثور على ملف الطالب" };
    }

    // 3. جلب الجدول (مع حماية الحقول المرتبطة)
    let schedule = [];
    if (student.classId) {
       schedule = await Timetable.find({ classId: student.classId._id })
        .populate('subjectId')
        .sort({ startTime: 1 })
        .lean();
    }

    // 4. جلب الحضور
    const attendance = await Attendance.find({ studentId }).lean();
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // 5. جلب الدرجات مع حماية الـ Populate
    const latestExams = await Exam.find({ "scores.studentId": studentId })
      .populate('subjectId')
      .sort({ examDate: -1 })
      .limit(3)
      .lean();

    const grades = latestExams.map(exam => {
      const scoreObj = exam.scores.find(s => s.studentId.toString() === studentId.toString());
      return {
        subject: exam.subjectId?.subjectName || "مادة غير معروفة",
        score: scoreObj?.marksObtained || 0,
        total: exam.totalMarks || 100,
        name: exam.examName || "اختبار",
        date: exam.examDate ? new Date(exam.examDate).toLocaleDateString('ar-EG') : "غير محدد"
      };
    });

    // تحويل البيانات لـ JSON بسيط لضمان مرورها للـ Client
    return JSON.parse(JSON.stringify({ 
      student, 
      attendanceRate, 
      grades, 
      schedule 
    }));

  } catch (error) {
    console.error("💥 خطأ فادح في السيرفر:", error.message);
    // نرجع كائن يحتوي على الخطأ بدلاً من رمي Exception يكسر الصفحة
    return { error: "حدث خطأ داخلي في النظام: " + error.message };
  }
}