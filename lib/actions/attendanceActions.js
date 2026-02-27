"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student";
import Attendance from "@/lib/models/attendance";
import { revalidatePath } from "next/cache";

// 1. جلب طلاب فصل معين لرصد غيابهم
export async function getStudentsByClass(classId) {
  await connectDB();
  const students = await Student.find({ classId }).select('name rollNumber');
  return JSON.parse(JSON.stringify(students));
}

// 2. حفظ سجل الحضور (مصفوفة من الطلاب)
export async function saveAttendance(attendanceData) {
  try {
    await connectDB();
    
    // استخدام bulkWrite أو loop لحفظ السجلات
    const promises = attendanceData.map(record => 
      Attendance.findOneAndUpdate(
        { studentId: record.studentId, date: record.date },
        record,
        { upsert: true, new: true }
      )
    );
    
    await Promise.all(promises);
    revalidatePath("/admin/attendance");
    return { success: true };
  } catch (error) {
    return { error: "فشل حفظ الحضور: " + error.message };
  }
}

export async function getAttendanceReport(classId) {
  try {
    await connectDB();
    const query = classId ? { classId } : {};
    
    // جلب كل سجلات الحضور بناءً على الفصل (أو الكل)
    const records = await Attendance.find(query).populate('studentId', 'name rollNumber');

    // تجميع البيانات لكل طالب
    const report = records.reduce((acc, curr) => {
      const studentId = curr.studentId?._id;
      if (!studentId) return acc;

      if (!acc[studentId]) {
        acc[studentId] = {
          name: curr.studentId.name,
          rollNumber: curr.studentId.rollNumber,
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      }

      acc[studentId].total++;
      if (curr.status === 'Present') acc[studentId].present++;
      else if (curr.status === 'Absent') acc[studentId].absent++;
      else if (curr.status === 'Late') acc[studentId].late++;

      return acc;
    }, {});

    return JSON.parse(JSON.stringify(Object.values(report)));
  } catch (error) {
    console.error("Report Error:", error);
    return [];
  }
}