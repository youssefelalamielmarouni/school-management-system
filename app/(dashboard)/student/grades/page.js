"use client";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bidi from "bidi-js";
import { Download, FileText, Award, AlertCircle } from "lucide-react";
import { getMyGrades } from "@/lib/actions/studentActions";
import { useSession } from "next-auth/react";
import { amiriFont } from "@/lib/fonts/amiri";

// حل مشكلة استيراد arabic-reshaper في Next.js
const arabicReshaper = require("arabic-reshaper");

export default function StudentGradesPage() {
  const { data: session } = useSession();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // دالة معالجة النصوص العربية داخل المكون لاستخدام محرك bidi
  const fixArabicText = (text, bidiEngine) => {
    if (!text) return "";
    try {
      const reshapeFn = typeof arabicReshaper.reshape === "function" 
        ? arabicReshaper.reshape 
        : arabicReshaper;
      const reshaped = reshapeFn(text);
      return bidiEngine.getReorderedString(reshaped, "rtl");
    } catch (err) {
      return text;
    }
  };

  useEffect(() => {
    setIsClient(true);
    async function fetchGrades() {
      try {
        const data = await getMyGrades();
        setGrades(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    const bidiEngine = bidi();

    // 1. إعداد الخط العربي
    const fontData = typeof amiriFont === 'string' ? amiriFont : amiriFont.default;
    doc.addFileToVFS("Amiri.ttf", fontData);
    doc.addFont("Amiri.ttf", "Amiri", "normal");
    doc.setFont("Amiri");

    doc.setFont("Amiri");

    // 2. تصميم رأس الصفحة
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    // هنا سيظهر "كشف النقاط الرسمي" بالعربية الصحيحة
    doc.text(fixArabicText("كشف النقاط الرسمي", bidiEngine), 105, 25, { align: "center" });

    // 3. معلومات الطالب (ستستخدم خط Amiri تلقائياً لأننا حددناه في الأعلى)
    doc.setTextColor(0, 0, 0);

    // 3. معلومات الطالب
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    const studentName = session?.user?.name || "طالب";
    doc.text(`${fixArabicText("اسم الطالب", bidiEngine)}: ${fixArabicText(studentName, bidiEngine)}`, 190, 55, { align: "right" });
    doc.text(`${fixArabicText("تاريخ الاستخراج", bidiEngine)}: ${new Date().toLocaleDateString('en-US')}`, 190, 65, { align: "right" });

    // 4. تجهيز بيانات الجدول
    const tableRows = grades.map(g => [
      fixArabicText(g.score >= 10 ? "ناجح" : "راسب", bidiEngine),
      `${g.score} / ${g.totalScore}`,
      fixArabicText(g.examName, bidiEngine),
      fixArabicText(g.subject, bidiEngine),
    ]);

    // 5. إنشاء الجدول
    autoTable(doc, {
      startY: 75,
      head: [[
        fixArabicText("result", bidiEngine), 
        fixArabicText("grade", bidiEngine), 
        fixArabicText("exam", bidiEngine), 
        fixArabicText("subject", bidiEngine)
      ]],
      body: tableRows,
      styles: { font: "Amiri", halign: 'right', fontSize: 12 },
      headStyles: { fillColor: [124, 58, 237], halign: 'right' },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 },
      }
    });

    // 6. تذييل الصفحة (Footer)
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text(fixArabicText("ملاحظة: هذا الكشف مستخرج آلياً ولا يحتاج لختم رسمي.", bidiEngine), 105, finalY, { align: "center" });

    doc.save(`Grades_${studentName}.pdf`);
  };

  // حساب الإحصائيات
  const totalScores = grades.reduce((acc, curr) => acc + curr.score, 0);
  const average = grades.length > 0 ? (totalScores / grades.length).toFixed(2) : 0;

  if (!isClient) return null;
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p className="mt-4 font-bold text-purple-600">جاري تحميل نتائجك...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto text-right" dir="rtl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800">نتائج اختباراتي</h1>
        {grades.length > 0 && (
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all active:scale-95"
          >
            <Download size={20} />
            تحميل PDF
          </button>
        )}
      </header>

      {grades.length > 0 ? (
        <div className="space-y-6">
          {/* بطاقة المعدل */}
          <div className="bg-gradient from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-xl text-white flex justify-between items-center">
            <div>
              <p className="text-purple-100 font-medium mb-1">المعدل الإجمالي</p>
              <h2 className="text-5xl font-black">{average} <span className="text-xl opacity-70">/ 20</span></h2>
            </div>
            <Award size={64} className="opacity-20" />
          </div>

          {/* قائمة الدرجات */}
          <div className="grid gap-4">
            {grades.map((grade) => (
              <div key={grade._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-center">
                  <div className={`p-3 rounded-xl ${grade.score >= 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{grade.subject}</h4>
                    <p className="text-sm text-gray-500">{grade.examName}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-2xl font-black ${grade.score >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                    {grade.score} <span className="text-sm text-gray-400">/ {grade.totalScore}</span>
                  </p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${grade.score >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {grade.score >= 10 ? "ناجح" : "راسب"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold text-lg">لا توجد درجات مسجلة حالياً.</p>
        </div>
      )}
    </div>
  );
}