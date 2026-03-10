"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getStudentProfileData } from "@/lib/actions/studentPortalActions";
import { 
  CheckCircle,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  FileText,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader student={data.student} />
        
        {/* Gap between Header and Attendance */}
        <div className="h-2"></div>
        
        {/* Stats Card - Only Attendance */}
        <AttendanceCard attendanceRate={data.attendanceRate} />

        {/* Gap between Attendance and Test Results */}
        <div className="h-4"></div>

        {/* Test Results Section */}
        <TestResultsSection grades={data.grades} />
      </div>
    </div>
  );
}

// ========== Subcomponents ==========

function LoadingState({ message = "جاري التحميل..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
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
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
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
    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-8 overflow-hidden shadow-xl">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-indigo-100 mb-2 text-lg">{getGreeting()}،</p>
            <h1 className="text-3xl md:text-4xl font-black mb-3">{student.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-indigo-100">
                <span className="font-semibold text-white">الفصل:</span> {student.classId?.className || "غير محدد"}
              </p>
              <p className="text-indigo-100">
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

function AttendanceCard({ attendanceRate }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-transform">
          <CheckCircle className="text-green-600 w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium">نسبة الحضور</p>
          <p className="text-4xl font-black text-gray-800">{attendanceRate}%</p>
          <p className="text-xs text-gray-400 mt-1">بناءً على السجل الشهري</p>
        </div>
      </div>
    </div>
  );
}

function TestResultsSection({ grades }) {
  // Get only the 3 most recent grades
  const recentGrades = grades?.slice(0, 3) || [];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
            <FileText className="text-purple-600 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">نتائج الاختبارات</h2>
        </div>
        
        <Link
          href="/student/grades"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentGrades.length > 0 ? (
          recentGrades.map((grade, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:shadow-md transition-all border border-gray-100"
            >
              <div>
                <p className="font-bold text-gray-800 text-lg">{grade.subject}</p>
                <p className="text-sm text-gray-500 mt-0.5">{grade.name}</p>
              </div>
              <div className="text-left bg-indigo-50 px-5 py-2.5 rounded-xl">
                <span className="text-2xl font-black text-indigo-700">{grade.score}</span>
                <span className="text-gray-400 text-sm mr-1">/{grade.total}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            
          </div>
        )}
      </div>

      {/* View All Link for Mobile (if there are more than 3 grades) */}
      {grades?.length > 3 && (
        <div className="mt-4 text-center md:hidden">
          <Link
            href="/student/grades"
            className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            <span>عرض جميع النتائج ({grades.length})</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}