"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  LogOut, 
  ClipboardCheck, 
  GraduationCap, 
  UserCheck,
  Calendar,
  Bell,
  ArrowLeft
} from "lucide-react";

export default function TeacherPage() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header with quick actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <GraduationCap className="text-purple-600" size={28} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-purple-600">بوابة المعلم</h2>
              <p className="text-xs text-gray-500">اللوحة الشخصية</p>
            </div>
          </div>
          <button className="p-2 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all relative">
            <Bell size={20} className="text-purple-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Welcome Card - White & Purple */}
        <div className="relative bg-white border-2 border-purple-100 rounded-3xl p-8 text-gray-800 shadow-lg shadow-purple-100/50 overflow-hidden">
          {/* Decorative purple elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-50 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full translate-x-48 translate-y-48"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full text-sm text-purple-700">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                مرحباً بك،
                <span className="block text-2xl md:text-3xl mt-2 text-purple-600">
                  أستاذ/ {session?.user?.name || "المعلم"}
                </span>
              </h1>
              <p className="text-gray-600 text-lg max-w-xl leading-relaxed">
                يسرنا رؤيتك مرة أخرى. جميع الفصول الدراسية جاهزة، والطلاب في انتظارك لبدء يوم تعليمي مثمر.
              </p>
              
              {/* Quick stats */}
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">٣</div>
                  <div className="text-xs text-gray-500">فصول نشطة</div>
                </div>
                <div className="w-px h-8 bg-purple-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">٨٥</div>
                  <div className="text-xs text-gray-500">طالب</div>
                </div>
                <div className="w-px h-8 bg-purple-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">٤</div>
                  <div className="text-xs text-gray-500">حصص اليوم</div>
                </div>
              </div>
            </div>
            
            {/* Teacher avatar placeholder */}
            <div className="hidden md:block w-32 h-32 bg-purple-50 rounded-2xl border-2 border-purple-100 p-4">
              <GraduationCap size={64} className="text-purple-300" />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Attendance Card - White & Purple */}
          <Link href="/teacher/attendance" className="group transform transition-all duration-300 hover:-translate-y-2">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-purple-100 overflow-hidden">
              <div className="bg-purple-50 p-4 border-b border-purple-100">
                <div className="bg-white w-fit p-3 rounded-xl shadow-sm">
                  <UserCheck size={28} className="text-purple-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">تسجيل الحضور</h3>
                <p className="text-sm text-gray-500 mb-4">تسجيل حضور وغياب الطلاب بسهولة</p>
                <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>بدء التسجيل</span>
                  <ArrowLeft size={16} className="mr-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Grades Card - White & Purple */}
          <Link href="/teacher/grades" className="group transform transition-all duration-300 hover:-translate-y-2">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-purple-100 overflow-hidden">
              <div className="bg-purple-50 p-4 border-b border-purple-100">
                <div className="bg-white w-fit p-3 rounded-xl shadow-sm">
                  <ClipboardCheck size={28} className="text-purple-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">رصد الدرجات</h3>
                <p className="text-sm text-gray-500 mb-4">إدخال وتحديث درجات الطلاب والاختبارات</p>
                <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>عرض الدرجات</span>
                  <ArrowLeft size={16} className="mr-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Logout Card - White & Purple */}
          <button onClick={handleLogout} className="group transform transition-all duration-300 hover:-translate-y-2">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-purple-100 overflow-hidden h-full w-full text-right">
              <div className="bg-purple-50 p-4 border-b border-purple-100">
                <div className="bg-white w-fit p-3 rounded-xl shadow-sm">
                  <LogOut size={28} className="text-purple-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">تسجيل الخروج</h3>
                <p className="text-sm text-gray-500 mb-4">إنهاء الجلسة الحالية بأمان</p>
                <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>تأكيد الخروج</span>
                  <ArrowLeft size={16} className="mr-1" />
                </div>
              </div>
            </div>
          </button>

        </div>

        {/* Schedule Preview Section - White & Purple */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-purple-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">جدول اليوم الدراسي</h3>
            <span className="text-sm text-purple-600 font-medium hover:text-purple-700 cursor-pointer">عرض الكل</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-white border-2 border-purple-200 rounded-xl flex items-center justify-center text-purple-600 font-bold">٨ص</div>
              <div>
                <h4 className="font-bold text-gray-800">رياضيات - ٣/٢</h4>
                <p className="text-xs text-gray-500">القاعة الرئيسية</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-white border-2 border-purple-200 rounded-xl flex items-center justify-center text-purple-600 font-bold">١٠ص</div>
              <div>
                <h4 className="font-bold text-gray-800">علوم - ٥/١</h4>
                <p className="text-xs text-gray-500">معمل العلوم</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="w-12 h-12 bg-white border-2 border-purple-200 rounded-xl flex items-center justify-center text-purple-600 font-bold">١م</div>
              <div>
                <h4 className="font-bold text-gray-800">لغة عربية - ٤/١</h4>
                <p className="text-xs text-gray-500">قاعة ٧</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm pt-8 border-t border-purple-100">
          نظام إدارة المدرسة الذكي {new Date().getFullYear()} | جميع الحقوق محفوظة
        </p>

      </div>
    </div>
  );
}