"use server";

import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student";
import Class from "@/lib/models/class";
import Grade from "@/lib/models/grade";
import Attendance from "@/lib/models/attendance"; // تأكد من وجود هذا الموديل
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * 1. جلب بيانات لوحة التحكم (الفصول والإحصائيات)
 */
export async function getTeacherDashboardData() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return { success: false, error: "لم يتم العثور على جلسة" };
    }

    const teacherObjectId = new mongoose.Types.ObjectId(session.user.id);
    const classes = await Class.find({ teacher: teacherObjectId }).lean();
    
    const classIds = classes.map(c => c._id);
    const totalStudents = await Student.countDocuments({ classId: { $in: classIds } });

    return {
      success: true,
      stats: { totalStudents, classesCount: classes.length },
      classes: JSON.parse(JSON.stringify(classes.map(c => ({
        id: c._id.toString(),
        name: c.className,
      }))))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 2. جلب الطلاب بناءً على اسم الفصل
 */
export async function getStudentsByClassName(className) {
  try {
    await connectDB();
    const classDoc = await Class.findOne({ className }).lean();
    if (!classDoc) return [];

    const students = await Student.find({ 
      classId: new mongoose.Types.ObjectId(classDoc._id) 
    }).sort({ name: 1 }).lean();
    
    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    return [];
  }
}

/**
 * 3. حفظ الدرجات (Grades)
 */
export async function submitGrades(gradesData) {
  try {
    await connectDB();
    const operations = gradesData.map(grade => ({
      updateOne: {
        filter: { studentId: grade.studentId, examName: grade.examName, subject: grade.subject },
        update: { $set: grade },
        upsert: true
      }
    }));
    await Grade.bulkWrite(operations);
    revalidatePath("/teacher/grades");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 4. حفظ الحضور (Attendance) - الدالة التي كانت مفقودة
 */
export async function submitAttendance(attendanceData) {
  try {
    await connectDB();
    
    // نقوم بحفظ السجلات الجديدة (Bulk Insert)
    // يمكنك تعديلها لتكون Update إذا كان التحضير يتم مرتين في نفس اليوم
    await Attendance.insertMany(attendanceData);
    
    revalidatePath("/teacher/attendance");
    return { success: true };
  } catch (error) {
    console.error("Attendance Error:", error);
    return { success: false, error: "فشل حفظ الحضور: " + error.message };
  }
}

