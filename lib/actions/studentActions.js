"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student";
import Class from "@/lib/models/class";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

// جلب الفصول المتاحة للاختيار
export async function getClassesForStudent() {
  await connectDB();
  const classes = await Class.find().select('className _id');
  return JSON.parse(JSON.stringify(classes));
}

// إنشاء طالب جديد
export async function createStudent(formData) {
  try {
    await connectDB();
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const rollNumber = formData.get("rollNumber");
    const classId = formData.get("classId");

    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      classId
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    if (error.code === 11000) return { error: "الإيميل أو رقم الطالب مسجل مسبقاً" };
    return { error: "فشل إضافة الطالب: " + error.message };
  }
}

export async function getStudents() {
  try {
    await connectDB();
    // جلب الطلاب وعمل Populate للحصول على اسم الفصل من موديل Class
    const students = await Student.find()
      .populate('classId', 'className') 
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

// دالة الحذف أيضاً لتكتمل السيطرة
export async function deleteStudent(id) {
  try {
    await connectDB();
    await Student.findByIdAndDelete(id);
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    return { error: "فشل الحذف: " + error.message };
  }
}