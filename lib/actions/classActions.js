"use server";
import connectDB from "@/lib/db";
import Class from "@/lib/models/class";
import User from "@/lib/models/users";
import { revalidatePath } from "next/cache";

// 1. جلب المعلمين فقط لملء القائمة المنسدلة
export async function getTeachersForSelect() {
  await connectDB();
  const teachers = await User.find({ role: 'teacher' }).select('name _id');
  return JSON.parse(JSON.stringify(teachers));
}

// 2. إنشاء فصل جديد
export async function createClass(formData) {
  try {
    await connectDB();
    const className = formData.get("className");
    const teacherId = formData.get("teacherId");
    const capacity = formData.get("capacity");

    await Class.create({
      className,
      teacher: teacherId,
      capacity
    });

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { error: "فشل إنشاء الفصل: " + error.message };
  }
}

export async function getClasses() {
  try {
    await connectDB();
    // هنا نستخدم populate لجلب اسم المعلم من مجموعة المستخدمين
    const classes = await Class.find()
      .populate('teacher', 'name') // 'teacher' هو اسم الحقل في Schema، و 'name' هو ما نريد جلبه فقط
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(classes));
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function deleteClass(id) {
  try {
    await connectDB();
    
    // ملاحظة مستقبليّة: هنا يمكننا التأكد أولاً من عدم وجود طلاب في الفصل قبل حذفه
    await Class.findByIdAndDelete(id);
    
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error) {
    return { error: "فشل في حذف الفصل: " + error.message };
  }
}