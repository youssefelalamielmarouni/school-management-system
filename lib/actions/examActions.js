"use server";
import connectDB from "@/lib/db";
import Exam from "@/lib/models/exam";
import { revalidatePath } from "next/cache";

export async function saveExamGrades(examData) {
  try {
    await connectDB();
    
    // إنشاء سجل الامتحان مع درجات الطلاب
    await Exam.create(examData);

    revalidatePath("/admin/grades");
    return { success: true };
  } catch (error) {
    return { error: "فشل حفظ الدرجات: " + error.message };
  }
}

export async function getExamsByClass(classId) {
  await connectDB();
  const exams = await Exam.find({ classId }).populate('subjectId', 'subjectName');
  return JSON.parse(JSON.stringify(exams));
}

export async function getStudentReport(studentId) {
  try {
    await connectDB();
    
    // البحث عن كل الامتحانات التي شارك فيها هذا الطالب
    const exams = await Exam.find({ "scores.studentId": studentId })
      .populate('subjectId', 'subjectName')
      .populate('classId', 'className');

    const report = exams.map(exam => {
      const studentScore = exam.scores.find(s => s.studentId.toString() === studentId);
      return {
        subject: exam.subjectId.subjectName,
        examName: exam.examName,
        obtained: studentScore ? studentScore.marksObtained : 0,
        total: exam.totalMarks,
        percentage: ((studentScore?.marksObtained / exam.totalMarks) * 100).toFixed(1)
      };
    });

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    console.error("Report Error:", error);
    return [];
  }
}