"use server";
import connectDB from "@/lib/db";
import Subject from "@/lib/models/subject";
import { revalidatePath } from "next/cache";

export async function createSubject(formData) {
  try {
    await connectDB();
    const subjectName = formData.get("subjectName");
    const teacherId = formData.get("teacherId");
    const classId = formData.get("classId");
    const subjectCode = formData.get("subjectCode");

    await Subject.create({
      subjectName,
      teacher: teacherId,
      class: classId,
      subjectCode
    });

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    return { error: "فشل إضافة المادة: " + error.message };
  }
}

export async function getSubjects() {
  await connectDB();
  const subjects = await Subject.find()
    .populate('teacher', 'name')
    .populate('class', 'className')
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(subjects));
}

export async function deleteSubject(id) {
  try {
    await connectDB();
    await Subject.findByIdAndDelete(id);
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error) {
    return { error: "فشل في حذف المادة: " + error.message };
  }
}