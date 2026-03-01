"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student"; // تأكد أن الحرف الأول s صغير كما في قاعدة بياناتك
import User from "@/lib/models/users";
import Class from "@/lib/models/class"; // هذا السطر كان ناقصاً!
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

// دالة جلب الطلاب (أضفتها لك لكي تكتمل الصفحة)
export async function getStudents() {
  try {
    await connectDB();
    const students = await Student.find().populate("classId").sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function createStudent(formData) {
  try {
    await connectDB();

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const rollNumber = formData.get("rollNumber");
    const classId = formData.get("classId");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await Student.create({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      classId
    });

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      studentProfile: newStudent._id 
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Error creating student/user:", error);
    return { error: "فشل في إضافة الطالب والحساب: " + error.message };
  }
}

export async function deleteStudent(id) {
  try {
    await connectDB();
    const student = await Student.findById(id);
    if (!student) return { error: "الطالب غير موجود" };

    await User.findOneAndDelete({ email: student.email });
    await Student.findByIdAndDelete(id);

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "فشل في عملية الحذف: " + error.message };
  }
}

export async function getClassesForStudent() {
  try {
    await connectDB();
    // تأكد أن الموديل اسمه Class كما قمت باستيراده في الأعلى
    const classes = await Class.find().sort({ className: 1 });
    return JSON.parse(JSON.stringify(classes));
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}