"use client";
import { useState, useEffect } from "react";
import { getMyGrades } from "@/lib/actions/studentActions";

export default function StudentGradesPage() {
  const [grades, setGrades] = useState([]); // التأكد من البداية بمصفوفة فارغة
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function fetchGrades() {
      try {
        const data = await getMyGrades();
        // التحقق مما إذا كانت البيانات مصفوفة فعلاً
        if (Array.isArray(data)) {
          setGrades(data);
        } else {
          console.error("Data received is not an array:", data);
          setGrades([]); // في حال وجود خطأ، نعود لمصفوفة فارغة
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  if (loading) return <div className="p-20 text-center font-bold">جاري تحميل النتائج...</div>;

  return (
    <div className="p-6 text-right" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">نتائج اختباراتي</h1>

      {/* هنا نستخدم الشرط للتأكد من وجود مصفوفة قبل الرندرة */}
      {Array.isArray(grades) && grades.length > 0 ? (
        <div className="space-y-4">
          {grades.map((grade) => (
            <div key={grade._id} className="p-4 bg-white border rounded-xl shadow-sm flex justify-between">
              <span className="font-bold">{grade.subject}</span>
              <span className="text-purple-600 font-black">{grade.score} / {grade.totalScore}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 bg-gray-50 p-10 rounded-2xl text-center border-2 border-dashed">
          لا توجد درجات مسجلة حالياً.
        </p>
      )}
    </div>
  );
}