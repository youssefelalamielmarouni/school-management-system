"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getStudentProfileData } from "@/lib/actions/studentPortalActions";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Calendar as CalendarIcon,
  Bell
} from "lucide-react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchStudentData();
    }
  }, [session, status]);

  const fetchStudentData = async () => {
    try {
      const res = await getStudentProfileData(session.user.id);
      if (res.error) {
        setError(res.error);
      } else {
        setData(res);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("فشل في الاتصال بالسيرفر");
    }
  };

  if (status === "loading") {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchStudentData} />;
  }

  if (!data || !data.student) {
    return <LoadingState message="جاري تجهيز البيانات..." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader student={data.student} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <TodaySchedule schedule={data.schedule} />
          
          {/* Weekly Overview */}
          <WeeklySchedule schedule={data.schedule} />
        </div>

        {/* Stats Cards */}
        <StatsGrid 
          attendanceRate={data.attendanceRate} 
          student={data.student} 
        />

        {/* Bottom Grid */}
        <BottomGrid grades={data.grades} />
      </div>
    </div>
  );
}

// ========== Subcomponents ==========

function LoadingState({ message = "جاري التحميل..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
          <AlertCircle className="text-red-500 w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

function WelcomeHeader({ student }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 18) return "مساء الخير";
    return "مساء الخير";
  };

  return (
    <div className="relative bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-3xl p-8 overflow-hidden shadow-xl">
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-100 mb-2">{getGreeting()}،</p>
            <h1 className="text-4xl font-black mb-2">{student.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-purple-100 text-lg">
                <span className="font-semibold text-white">الفصل:</span> {student.classId?.className || "غير محدد"}
              </p>
              <p className="text-purple-100 text-lg">
                <span className="font-semibold text-white">رقم القيد:</span> {student.rollNumber}
              </p>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
      </div>
      {/* Decorative Elements */}
      <div className="absolute left-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}

function TodaySchedule({ schedule }) {
  const todaySchedule = schedule?.filter(s => 
    s.day === new Date().toLocaleDateString('ar-SA', { weekday: 'long' })
  ) || [];

  return (
    <div className="lg:col-span-1 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-linear-to-br from-purple-100 to-purple-200 rounded-2xl">
          <Calendar className="text-purple-600 w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">حصص اليوم</h2>
      </div>
      
      <div className="space-y-3">
        {todaySchedule.length > 0 ? (
          todaySchedule.map((slot, i) => (
            <div 
              key={i} 
              className="group bg-linear-to-r from-purple-50 to-white p-4 rounded-2xl border-r-4 border-purple-500 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {slot.subjectId?.subjectName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-purple-600 text-sm font-medium">
                    {slot.room || "قاعة 1"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد حصص مجدولة لهذا اليوم</p>
              <p className="text-sm text-gray-300 mt-1">استمتع بيومك!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklySchedule({ schedule }) {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-linear-to-br from-blue-100 to-blue-200 rounded-2xl">
          <BookOpen className="text-blue-600 w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">الجدول الأسبوعي</h2>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {days.map((day) => (
          <div key={day} className="space-y-2">
            <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl p-2 text-center text-sm font-bold">
              {day}
            </div>
            <div className="space-y-2 min-h-[120px]">
              {schedule?.filter(s => s.day === day).map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-linear-to-br from-blue-50 to-white rounded-xl border border-blue-100 text-center group hover:shadow-md transition-all"
                >
                  <p className="text-xs font-bold text-blue-800 truncate">
                    {item.subjectId?.subjectName}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {item.startTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsGrid({ attendanceRate, student }) {
  const stats = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: "نسبة الحضور",
      value: `${attendanceRate}%`,
      desc: "بناءً على السجل الشهري",
      color: "from-green-100 to-green-200",
      iconColor: "text-green-600"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: "المواد المسجلة",
      value: student.classId?.subjects?.length || 0,
      desc: "مواد الفصل الحالي",
      color: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "الحالة الأكاديمية",
      value: "منتظم",
      desc: "الفصل الدراسي الثاني",
      color: "from-orange-100 to-orange-200",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-linear-to-br ${stat.color} rounded-2xl group-hover:scale-110 transition-transform`}>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BottomGrid({ grades }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Grades */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
            <CalendarIcon className="text-purple-600 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">آخر نتائج الاختبارات</h2>
        </div>
        
        <div className="space-y-3">
          {grades && grades.length > 0 ? (
            grades.slice(0, 5).map((grade, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-white rounded-2xl hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-bold text-gray-800">{grade.subject}</p>
                  <p className="text-xs text-gray-400">{grade.name}</p>
                </div>
                <div className="text-left bg-purple-50 px-4 py-2 rounded-xl">
                  <span className="text-xl font-black text-purple-700">{grade.score}</span>
                  <span className="text-gray-400 text-sm">/{grade.total}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-2xl p-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">لا توجد درجات مرصودة حالياً</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl">
            <Bell className="text-yellow-600 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">تنبيهات وإعلانات</h2>
        </div>
        
        <div className="space-y-3">
          <AlertItem 
            text="موعد اختبار اللغة الإنجليزية الأسبوع القادم" 
            date="اليوم"
            urgent={true}
          />
          <AlertItem 
            text="تم تحديث جدول الحصص الخاص بفصلك" 
            date="أمس"
          />
          <AlertItem 
            text="تذكير: رحلة مدرسية يوم الخميس القادم" 
            date="قبل يومين"
          />
        </div>
      </div>
    </div>
  );
}

function AlertItem({ text, date, urgent = false }) {
  return (
    <div className={`group p-4 rounded-2xl flex justify-between items-center transition-all hover:shadow-md ${
      urgent 
        ? 'bg-gradient-to-r from-red-50 to-white border-r-4 border-red-500' 
        : 'bg-gradient-to-r from-purple-50 to-white border-r-4 border-purple-500'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          urgent ? 'bg-red-500 animate-pulse' : 'bg-purple-500'
        }`}></div>
        <span className="text-gray-700 text-sm font-medium">{text}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        urgent ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
      }`}>
        {date}
      </span>
    </div>
  );
}