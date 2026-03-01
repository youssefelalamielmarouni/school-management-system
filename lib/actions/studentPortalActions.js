"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student";
import Attendance from "@/lib/models/attendance";
import Exam from "@/lib/models/exam";
import mongoose from "mongoose";
import Timetable from "@/lib/models/Timetable";

export async function getStudentProfileData(studentId) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("ID الطالب غير صالح");
    }

    // 1. البحث عن الطالب في جدول Students
    const student = await Student.findById(studentId).populate('classId');

    // إذا لم نجد الطالب (بسبب عدم تطابق الـ ID في قاعدة البيانات)
    if (!student) {
      console.error("لم يتم العثور على ملف طالب لهذا الـ ID:", studentId);
      return { 
        error: "ملف الطالب غير مكتمل. يرجى التواصل مع الإدارة.",
        student: { name: "مستخدم بدون ملف" },
        attendanceRate: 0,
        grades: [],
        schedule: []
      };
    }

    // 2. جلب إحصائيات الحضور (تمت بنجاح)
    const attendance = await Attendance.find({ studentId });
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // 3. جلب جدول الحصص بناءً على فصل الطالب (تمت بنجاح)
    const schedule = await Timetable.find({ classId: student.classId?._id })
      .populate('subjectId', 'subjectName')
      .sort({ startTime: 1 });

    // 4. جلب الدرجات (تمت بنجاح)
    const latestExams = await Exam.find({ "scores.studentId": studentId })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: -1 })
      .limit(3);

    const grades = latestExams.map(exam => {
      const scoreObj = exam.scores.find(s => s.studentId.toString() === studentId);
      return {
        subject: exam?.subjectId?.subjectName || "مادة غير معروفة",
        score: scoreObj?.marksObtained || 0,
        total: exam.totalMarks,
        name: exam.examName,
        date: exam.examDate ? exam.examDate.toLocaleDateString('ar-EG') : "تاريخ غير محدد"
      };
    });

    // إرسال البيانات مجمعة للواجهة
    return JSON.parse(JSON.stringify({ 
      student, 
      attendanceRate, 
      grades, 
      schedule 
    }));

  } catch (error) {
    console.error("خطأ في السيرفر:", error.message);
    throw error;
  }
}