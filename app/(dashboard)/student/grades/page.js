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

    // 2. تصميم رأس الصفحة
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    // كشف النقاط الرسمي
    doc.text(fixArabicText("كشف النقاط الرسمي", bidiEngine), 105, 25, { align: "center" });

    // 3. معلومات الطالب
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    
    // الحصول على تاريخ اليوم بالهجري والميلادي
    const today = new Date();
    const gregorianDate = today.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const hijriDate = today.toLocaleDateString('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const studentName = session?.user?.name || "طالب";
    const studentId = session?.user?.id || "غير محدد";
    
    // إضافة معلومات الطالب بشكل منظم
    const studentInfo = [
      `${fixArabicText("اسم الطالب", bidiEngine)}: ${fixArabicText(studentName, bidiEngine)}`,
      `${fixArabicText("رقم الطالب", bidiEngine)}: ${studentId}`,
      `${fixArabicText("التاريخ الميلادي", bidiEngine)}: ${gregorianDate}`,
      `${fixArabicText("التاريخ الهجري", bidiEngine)}: ${hijriDate}`,
    ];

    let yPos = 55;
    studentInfo.forEach(info => {
      doc.text(info, 190, yPos, { align: "right" });
      yPos += 10;
    });

    // حساب الإحصائيات للعرض في الجدول
    const totalScore = grades.reduce((acc, curr) => acc + curr.score, 0);
    const average = (totalScore / grades.length).toFixed(2);
    const passedCount = grades.filter(g => g.score >= 10).length;
    const failedCount = grades.filter(g => g.score < 10).length;

    // 4. تجهيز بيانات الجدول مع إضافة معلومات إضافية
    const tableRows = grades.map((g, index) => [
      index + 1, // رقم مسلسل
      fixArabicText(g.subject, bidiEngine),
      fixArabicText(g.examName, bidiEngine),
      `${g.score} / ${g.totalScore}`,
      `${((g.score / g.totalScore) * 100).toFixed(1)}%`,
      fixArabicText(g.score >= 10 ? "ناجح" : "راسب", bidiEngine),
    ]);

    // 5. إنشاء الجدول المحسن
    autoTable(doc, {
      startY: yPos + 10,
      head: [[
        fixArabicText("م", bidiEngine),
        fixArabicText("المادة", bidiEngine),
        fixArabicText("الاختبار", bidiEngine),
        fixArabicText("الدرجة", bidiEngine),
        fixArabicText("النسبة", bidiEngine),
        fixArabicText("النتيجة", bidiEngine),
      ]],
      body: tableRows,
      styles: { 
        font: "Amiri", 
        halign: 'center', 
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: { 
        fillColor: [124, 58, 237],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 15 }, // م
        1: { cellWidth: 45 }, // المادة
        2: { cellWidth: 45 }, // الاختبار
        3: { cellWidth: 30 }, // الدرجة
        4: { cellWidth: 25 }, // النسبة
        5: { cellWidth: 30 }, // النتيجة
      },
      didDrawPage: (data) => {
        // إضافة ترقيم الصفحات
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          fixArabicText(`الصفحة ${data.pageNumber}`, bidiEngine),
          190,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
      }
    });

    // 6. إضافة ملخص الإحصائيات بعد الجدول
    const finalY = doc.lastAutoTable.finalY + 20;
    
    // رسم صندوق الإحصائيات
    doc.setFillColor(240, 242, 245);
    doc.roundedRect(15, finalY, 180, 45, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("Amiri", "bold");
    doc.text(fixArabicText("ملخص النتائج", bidiEngine), 105, finalY + 8, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("Amiri", "normal");
    
    const stats = [
      `${fixArabicText("عدد المواد", bidiEngine)}: ${grades.length}`,
      `${fixArabicText("المجموع الكلي", bidiEngine)}: ${totalScore}`,
      `${fixArabicText("المعدل العام", bidiEngine)}: ${average}`,
      `${fixArabicText("المواد الناجحة", bidiEngine)}: ${passedCount}`,
      `${fixArabicText("المواد الراسبة", bidiEngine)}: ${failedCount}`,
    ];

    let statsX = 30;
    stats.forEach((stat, index) => {
      doc.text(stat, statsX, finalY + 22);
      statsX += 50;
    });

    // 7. تذييل الصفحة
    const footerY = finalY + 55;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      fixArabicText("هذا الكشف مستخرج آلياً من نظام الطالب ولا يحتاج إلى ختم أو توقيع", bidiEngine),
      105,
      footerY,
      { align: "center" }
    );
    
    doc.text(
      fixArabicText("للتحقق من صحة المستند يرجى التواصل مع إدارة المدرسة", bidiEngine),
      105,
      footerY + 7,
      { align: "center" }
    );

    // 8. حفظ الملف
    doc.save(`نتائج_${studentName.replace(/\s+/g, '_')}.pdf`);
  };

  // حساب الإحصائيات
  const totalScore = grades.reduce((acc, curr) => acc + curr.score, 0);
  const average = grades.length > 0 ? (totalScore / grades.length).toFixed(2) : 0;
  const passedCount = grades.filter(g => g.score >= 10).length;
  const failedCount = grades.filter(g => g.score < 10).length;
  const successRate = grades.length > 0 ? ((passedCount / grades.length) * 100).toFixed(1) : 0;

  if (!isClient) return null;
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
      <p className="mt-6 text-lg font-medium text-gray-700">جاري تحميل نتائجك...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">نتائج اختباراتي</h1>
            <p className="text-gray-600">مرحباً {session?.user?.name}، هذه قائمة نتائجك الدراسية</p>
          </div>
          {grades.length > 0 && (
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Download size={20} />
              تحميل كشف النتائج PDF
            </button>
          )}
        </header>

        {grades.length > 0 ? (
          <div className="space-y-8">
            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                label="المعدل الإجمالي"
                value={average}
                unit="/20"
                color="indigo"
              />
              <StatCard 
                label="المواد الناجحة"
                value={passedCount}
                unit={`من ${grades.length}`}
                color="green"
              />
              <StatCard 
                label="نسبة النجاح"
                value={`${successRate}%`}
                color="purple"
              />
              <StatCard 
                label="المجموع الكلي"
                value={totalScore}
                unit="درجة"
                color="blue"
              />
            </div>

            {/* قائمة الدرجات */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">تفاصيل الدرجات</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {grades.map((grade, index) => (
                  <GradeItem key={grade._id} grade={grade} index={index} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// المكونات المساعدة
function StatCard({ label, value, unit = "", color }) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    blue: 'from-blue-50 to-blue-100 text-blue-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl shadow-sm`}>
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <p className="text-3xl font-black">
        {value}
        {unit && <span className="text-sm mr-1 opacity-70">{unit}</span>}
      </p>
    </div>
  );
}

function GradeItem({ grade, index }) {
  const passed = grade.score >= 10;
  
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {index + 1}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-lg">{grade.subject}</h4>
            <p className="text-sm text-gray-500">{grade.examName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className={`text-2xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {grade.score} <span className="text-sm text-gray-400">/ {grade.totalScore}</span>
            </p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            passed 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {passed ? "ناجح" : "راسب"}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText size={48} className="text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد نتائج بعد</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        لم يتم تسجيل أي نتائج اختبارات حتى الآن. سيتم إضافتها هنا بمجرد صدور النتائج من قبل المدرسة.
      </p>
    </div>
  );
}