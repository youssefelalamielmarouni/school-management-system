"use server";
import connectDB from "@/lib/db";
import User from "@/lib/models/users";
import Student from "@/lib/models/student";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function loginAction(formData) {
  await connectDB();
  const user = await User.findOne({ email: formData.get("email") });

  if (!user) return { error: "المستخدم غير موجود" };

  const isMatch = await bcrypt.compare(formData.get("password"), user.password);
  if (!isMatch) return { error: "كلمة المرور خاطئة" };

  // حفظ الجلسة
  cookies().set("userId", user._id.toString());
  // إذا كان طالباً، سنحتاج لـ ID الطالب الفعلي للتقارير
  if (user.role === "student") {
    cookies().set("studentProfileId", user.studentProfile.toString());
  }
  cookies().set("userRole", user.role);

  return { success: true, role: user.role };
}