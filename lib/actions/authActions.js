"use server";
import connectDB from "@/lib/db";
import User from "@/lib/models/users";
import Student from "@/lib/models/student";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function loginAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  await connectDB();

  // 1. البحث في جدول المستخدمين (مديرين ومعلمين)
  let user = await User.findOne({ email });
  let role = user?.role;

  // 2. إذا لم يجد، يبحث في جدول الطلاب
  if (!user) {
    user = await Student.findOne({ email });
    role = "student";
  }

  if (!user) return { error: "المستخدم غير موجود" };

  // 3. التحقق من كلمة المرور
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { error: "كلمة المرور خاطئة" };

  // 4. حفظ الجلسة (Session) في الكوكيز (تبسيطاً للمثال)
  cookies().set("userRole", role);
  cookies().set("userId", user._id.toString());

  return { success: true, role };
}