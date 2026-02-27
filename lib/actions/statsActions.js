"use server";
import connectDB from "@/lib/db";
import User from "@/lib/models/users";
import Class from "@/lib/models/class";
import Student from "@/lib/models/student";

export async function getDashboardStats() {
  try {
    await connectDB();
    
    // جلب عدد الوثائق من كل مجموعة في وقت واحد لسرعة الأداء
    const [teachersCount, studentsCount, classesCount] = await Promise.all([
      User.countDocuments({ role: "teacher" }),
      Student.countDocuments({}),
      Class.countDocuments({}),
    ]);

    return {
      teachers: teachersCount,
      students: studentsCount,
      classes: classesCount,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { teachers: 0, students: 0, classes: 0 };
  }
}