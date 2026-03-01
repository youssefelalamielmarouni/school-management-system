"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student";
import Attendance from "@/lib/models/attendance";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import Class from "@/lib/models/class";

export async function getClassStudents(classId) {
  try {
    await connectDB();
    const students = await Student.find({ classId }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function submitAttendance(attendanceList) {
  try {
    await connectDB();
    await Attendance.insertMany(attendanceList);
    revalidatePath("/teacher/attendance");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// أضف هذه الدالة أو حدث الموجودة
export async function getStudentsByClassName(className) {
  try {
    await connectDB();
    
    // 1. ابحث عن الفصل
    const classDoc = await Class.findOne({ className: className }).lean();
    
    if (!classDoc) {
      console.log("Class not found in DB");
      return [];
    }

    // 2. تأكد من تحويل المعرف إلى ObjectId لضمان دقة البحث
    const classIdObject = new mongoose.Types.ObjectId(classDoc._id);

    // 3. ابحث عن الطلاب
    const students = await Student.find({ 
      classId: classIdObject // البحث باستخدام الكائن وليس النص
    }).lean();

    console.log(`Found ${students.length} students for class ${className}`);
    
    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}