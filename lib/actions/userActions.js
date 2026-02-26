"use server";
import connectDB from "@/lib/db";
import User from "@/lib/models/users"; // تأكد من أن الحرف U كبير أو صغير حسب ملفك
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

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