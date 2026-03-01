"use server";
import connectDB from "@/lib/db";
import User from "@/lib/models/users"; 
import Student from "@/lib/models/student";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function createTeacher(formData) {
  try {
    await connectDB();
    
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    // 1. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. إنشاء المعلم وتخزينه في متغير للتأكد من نجاح العملية
    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher", 
    });

    // 3. طباعة النتيجة في الـ Terminal للتأكد (اختياري)
    console.log("تم إنشاء المعلم بنجاح:", createdUser.email);

    // 4. تحديث البيانات في الصفحة
    revalidatePath("/admin/teachers"); 

    return { success: true };

  } catch (error) {
    console.error("خطأ أثناء الإضافة:", error.message);
    
    // معالجة خطأ تكرار الإيميل بشكل خاص
    if (error.code === 11000) {
      return { error: "هذا البريد الإلكتروني مسجل مسبقاً لمستخدم آخر" };
    }

    return { error: "حدث خطأ غير متوقع: " + error.message };
  }
}

export async function getTeachers() {
  try {
    await connectDB();
    // جلب المستخدمين الذين دورهم "teacher" وترتيبهم من الأحدث للأقدم
    const teachers = await User.find({ role: "teacher" }).sort({ createdAt: -1 });
    
    // تحويل البيانات من Mongoose Documents إلى JSON عادي لتجنب مشاكل Next.js
    return JSON.parse(JSON.stringify(teachers));
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export async function deleteTeacher(id) {
  try {
    await connectDB();
    
    // التأكد من أننا لا نحذف الأدمن بالخطأ (حماية إضافية)
    const user = await User.findById(id);
    if (user.role === 'admin') {
      return { error: "لا يمكن حذف حساب المدير!" };
    }

    await User.findByIdAndDelete(id);
    
    // تحديث المسار لإبلاغ Next.js بأن البيانات تغيرت
    revalidatePath("/admin/teachers"); 
    return { success: true };
  } catch (error) {
    return { error: "فشل حذف المعلم: " + error.message };
  }
}


export async function createStudent(formData) {
  try {
    await connectDB();

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const classId = formData.get("classId");
    const rollNumber = formData.get("rollNumber");

    // 1. توليد ID موحد
    const sharedId = new mongoose.Types.ObjectId();
    console.log("Generated ID:", sharedId);

    // 2. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. إنشاء User
    const createdUser = await User.create({
      _id: sharedId, 
      name,
      email,
      password: hashedPassword,
      role: "student",
    });
    console.log("User created with ID:", createdUser._id);

    // 4. إنشاء Student بنفس الـ ID
    const createdStudent = await Student.create({
      _id: sharedId,
      name,
      email,
      password: hashedPassword,
      classId,
      rollNumber,
    });
    console.log("Student created with ID:", createdStudent._id);

    revalidatePath("/admin/students");
    return { success: true };

  } catch (error) {
    console.error("خطأ أثناء إضافة الطالب:", error.message);
    console.error("Full error:", error); // اطبع الخطأ كاملاً
    if (error.code === 11000) {
      return { error: "هذا البريد الإلكتروني مسجل مسبقاً" };
    }
    return { error: "فشل الإضافة: " + error.message };
  }
}