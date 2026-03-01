"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getStudentProfileData } from "@/lib/actions/studentPortalActions";
import { BookOpen, Calendar, CheckCircle, Clock, GraduationCap } from "lucide-react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      getStudentProfileData(session.user.id)
        .then(setData)
        .catch(err => setError("فشل في جلب بيانات الطالب"));
    }
  }, [session, status]);

  if (status === "loading") return <div className="p-10 text-center animate-pulse text-purple-600 font-bold">جاري التحقق من الجلسة...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!data) return <div className="p-10 text-center text-purple-600">جاري تحميل بياناتك...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen" dir="rtl">
      
      {/* قسم الترحيب العلوي */}
      <div className="bg-linear-to-l from-purple-700 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">أهلاً بك، {data.student.name} 👋</h1>
          <p className="opacity-90 text-lg">أنت مسجل في: <span className="font-bold">{data.student.classId?.className || "غير محدد"}</span></p>
          <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full text-sm">
            رقم القيد: {data.student.rollNumber}
          </div>
        </div>
        <GraduationCap className="absolute -left-5 -bottom-5 size-48 opacity-10 rotate-12" />
      </div>

      {/* كروت الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<CheckCircle className="text-green-500" />} 
          label="نسبة الحضور" 
          value={`${data.attendanceRate}%`} 
          desc="بناءً على السجل الشهري"
        />
        <StatCard 
          icon={<BookOpen className="text-blue-500" />} 
          label="المواد المسجلة" 
          value={data.student.classId?.subjects?.length || 0} 
          desc="مواد الفصل الحالي"
        />
        <StatCard 
          icon={<Clock className="text-orange-500" />} 
          label="الحالة الأكاديمية" 
          value="منتظم" 
          desc="الفصل الدراسي الثاني"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* سجل الدرجات الأخير */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
             <div className="p-2 bg-purple-100 rounded-lg"><Calendar size={20} className="text-purple-600"/></div>
             آخر نتائج الاختبارات
          </h2>
          <div className="space-y-4">
            {data.grades && data.grades.length > 0 ? data.grades.map((grade, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-700">{grade.subject}</p>
                  <p className="text-xs text-gray-400">{grade.name}</p>
                </div>
                <div className="text-left">
                   <span className="text-xl font-black text-purple-700">{grade.score}</span>
                   <span className="text-gray-400 text-sm"> / {grade.total}</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-4">لا توجد درجات مرصودة حالياً</p>
            )}
          </div>
        </div>

        {/* تنبيهات النظام */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
             <div className="p-2 bg-yellow-100 rounded-lg">🔔</div>
             تنبيهات وإعلانات
          </h2>
          <div className="space-y-4">
            <AlertItem text="موعد اختبار اللغة الإنجليزية الأسبوع القادم" date="اليوم" />
            <AlertItem text="تم تحديث جدول الحصص الخاص بفصلك" date="أمس" />
            <AlertItem text="تذكير: رحلة مدرسية يوم الخميس القادم" date="قبل يومين" />
          </div>
        </div>

      </div>
    </div>
  );
}

// مكونات صغيرة للتنظيم
function StatCard({ icon, label, value, desc }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-4 bg-gray-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function AlertItem({ text, date }) {
  return (
    <div className="p-4 border-r-4 border-purple-500 bg-purple-50 rounded-l-xl flex justify-between items-center">
      <span className="text-gray-700 text-sm font-medium">{text}</span>
      <span className="text-xs text-purple-400">{date}</span>
    </div>
  );
}