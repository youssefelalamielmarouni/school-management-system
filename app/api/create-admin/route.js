import connectDB from "@/lib/db";
import User from "@/lib/models/users"; // تأكد من اسم الموديل والمسار
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // التحقق إذا كان هناك أدمن موجود مسبقاً لمنع التكرار
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return NextResponse.json({ message: "الآدمن موجود بالفعل!" }, { status: 400 });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // إنشاء المستخدم
    const newAdmin = await User.create({
      name: "Youssef Alami",
      email: "admin@school.com",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json({ 
      message: "تم إنشاء حساب المدير بنجاح", 
      email: newAdmin.email 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}