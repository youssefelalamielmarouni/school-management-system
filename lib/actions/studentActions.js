"use server";
import connectDB from "@/lib/db";
import Student from "@/lib/models/student"; 
import User from "@/lib/models/users";
import Class from "@/lib/models/class"; 
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose"; // أضفنا هذا للتأكد من المعرفات
import Grade from "@/lib/models/grade";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function getStudents() {
  try {
    await connectDB();
    // جلب الطلاب مع بيانات الفصل المرتبط بهم (مثل اسم الفصل)
    const students = await Student.find()
      .populate("classId", "className") // سنجلب فقط اسم الفصل لتقليل حجم البيانات
      .sort({ createdAt: -1 })
      .lean();
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

    // التحقق من وجود الطالب مسبقاً لمنع تكرار الإيميل
    const existingUser = await User.findOne({ email });
    if (existingUser) return { error: "هذا البريد الإلكتروني مسجل مسبقاً" };

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. إنشاء سجل الطالب
    const newStudent = await Student.create({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      classId: new mongoose.Types.ObjectId(classId) // تحويل آمن للـ ID
    });

    // 2. إنشاء حساب المستخدم (للولوج للنظام)
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      // نربط الحساب بـ ID الطالب وبـ ID الفصل ليسهل جلب البيانات في لوحة الطالب
      studentProfile: newStudent._id,
      classId: new mongoose.Types.ObjectId(classId) 
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Error creating student/user:", error);
    return { error: "فشل في إضافة الطالب: " + error.message };
  }
}

export async function deleteStudent(id) {
  try {
    await connectDB();
    const student = await Student.findById(id);
    if (!student) return { error: "الطالب غير موجود" };

    // حذف الحساب المرتبط بهذا البريد أولاً
    await User.findOneAndDelete({ email: student.email });
    await Student.findByIdAndDelete(id);

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "فشل في الحذف: " + error.message };
  }
}

export async function getClassesForStudent() {
  try {
    await connectDB();
    const classes = await Class.find().sort({ className: 1 }).lean();
    return JSON.parse(JSON.stringify(classes));
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function getMyGrades() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    // فحص محتويات الجلسة في تيرمينال السيرفر
    console.log("Full Session Data:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      console.log("❌ Authentication failed: Session is null");
      return [];
    }

    // محاولة الحصول على الـ ID الصحيح (student 9)
    // جرب البحث بـ studentProfile أولاً ثم id
    const searchId = session.user.studentProfile || session.user.id;

    if (!searchId) {
      console.log("❌ Error: No ID found in session user object");
      return [];
    }

    console.log("🔍 Searching database for studentId:", searchId);

    const grades = await Grade.find({ studentId: searchId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${grades.length} grades for this student.`);

    return JSON.parse(JSON.stringify(grades));
  } catch (error) {
    console.error("❌ Critical Error in getMyGrades:", error);
    return [];
  }
}