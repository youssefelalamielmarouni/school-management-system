"use client";
import { useState, useEffect } from "react";
import { getStudentsByClassName, submitGrades } from "@/lib/actions/teacherActions";
import { Save, Award, BookOpen } from "lucide-react";

export default function TeacherGradesPage() {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({}); // { studentId: 85 }
  const [examName, setExamName] = useState("اختبار شهر مارس");
  const [subject, setSubject] = useState("اللغة العربية");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getStudentsByClassName("bac").then(setStudents);
  }, []);

  const handleSave = async () => {
    // 1. التحقق من وجود طلاب
    if (students.length === 0) {
      alert("⚠️ لا يوجد طلاب لرصد درجاتهم!");
      return;
    }

    console.log("Starting save process..."); // تتبع في الكونسول
    setIsSaving(true);

    try {
      // 2. تحضير البيانات مع التأكد من القيم
      const payload = students.map(s => ({
        studentId: s._id,
        classId: s.classId,
        subject: subject || "مادة غير محددة",
        examName: examName || "اختبار دوري",
        score: Number(scores[s._id]) || 0, // التأكد من أنها أرقام
        totalScore: 20
      }));

      console.log("Payload to send:", payload);

      // 3. استدعاء الأكشن
      const res = await submitGrades(payload);
      
      if (res.success) {
        alert("✅ تم حفظ الدرجات بنجاح لجميع الطلاب!");
        // يمكنك هنا تصفير الخانات إذا أردت
      } else {
        console.error("Server error:", res.error);
        alert("❌ فشل الحفظ: " + res.error);
      }
    } catch (error) {
      console.error("Client error:", error);
      alert("🚨 حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setIsSaving(false);
      console.log("Process finished.");
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6" dir="rtl">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-50 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Award className="text-purple-600" /> رصد درجات فصل bac
          </h1>
          <div className="flex gap-4 mt-3">
             <input 
               value={subject} 
               onChange={(e)=>setSubject(e.target.value)}
               className="bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500"
               placeholder="المادة"
             />
             <input 
               value={examName} 
               onChange={(e)=>setExamName(e.target.value)}
               className="bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500"
               placeholder="اسم الاختبار"
             />
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
           {isSaving ? "جاري الحفظ..." : "حفظ الدرجات"}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">اسم الطالب</th>
              <th className="p-4 text-center">الدرجة (من 20)</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-700">{student.name}</td>
                <td className="p-4 flex justify-center">
                  <input 
                    type="number"
                    max="100"
                    min="0"
                    className="w-20 p-2 text-center bg-purple-50 border-2 border-purple-100 rounded-xl focus:border-purple-500 outline-none transition"
                    onChange={(e) => handleScoreChange(student._id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}