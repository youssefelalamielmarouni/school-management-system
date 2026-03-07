"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getTeacherDashboardData, getStudentsByClassName, submitAttendance } from "@/lib/actions/teacherActions";
import { 
  CheckCircle, XCircle, Save, Loader2, Users, Calendar, Clock, Search, 
  Filter, Download, AlertCircle, UserCheck, UserX, BarChart, CheckCircle2,
  GraduationCap, ChevronLeft, ChevronDown, Circle, CircleCheckBig
} from "lucide-react";

export default function SmartAttendance() {
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showStats, setShowStats] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await getTeacherDashboardData();
        if (res.success && res.classes.length > 0) {
          setClasses(res.classes);
          setSelectedClass(res.classes[0].name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await getStudentsByClassName(selectedClass);
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsedData) {
          setStudents(parsedData);
          const initial = {};
          parsedData.forEach(s => initial[s._id] = "Present");
          setAttendance(initial);
        }
      } catch (err) {
        setMessage({ type: "error", text: "فشل تحميل الطلاب" });
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedClass]);

  const handleSaveReport = async () => {
    if (students.length === 0) return;
    setIsSaving(true);
    try {
      const payload = students.map(s => ({
        studentId: s._id,
        classId: s.classId,
        status: attendance[s._id] || "Present",
        date: new Date(selectedDate)
      }));
      const result = await submitAttendance(payload);
      if (result.success) {
        setMessage({ type: "success", text: "✅ تم حفظ سجل الحضور بنجاح!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ حدث خطأ أثناء الحفظ" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const toggleStatus = (id) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === "Present" ? "Absent" : "Present" }));
  };

  const markAllPresent = () => {
    const newAttendance = {};
    students.forEach(s => newAttendance[s._id] = "Present");
    setAttendance(newAttendance);
  };

  const markAllAbsent = () => {
    const newAttendance = {};
    students.forEach(s => newAttendance[s._id] = "Absent");
    setAttendance(newAttendance);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <GraduationCap className="text-purple-600" size={40} />
          </div>
          <p className="text-purple-600 font-bold text-lg">جاري تحميل بيانات الحضور...</p>
        </div>
      </div>
    );
  }

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(s => {
    if (filterStatus === "present") return attendance[s._id] === "Present";
    if (filterStatus === "absent") return attendance[s._id] === "Absent";
    return true;
  });

  const presentCount = students.filter(s => attendance[s._id] === "Present").length;
  const absentCount = students.filter(s => attendance[s._id] === "Absent").length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-purple-600 cursor-pointer transition">الرئيسية</span>
          <ChevronLeft size={16} />
          <span className="hover:text-purple-600 cursor-pointer transition">المعلم</span>
          <ChevronLeft size={16} />
          <span className="text-purple-600 font-medium">تسجيل الحضور</span>
        </div>

        {/* Welcome Message */}
        <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-4 text-purple-700">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl">
              <UserCheck className="text-purple-600" size={20} />
            </div>
            <p className="font-medium">
              مرحباً أستاذ/ {session?.user?.name || "المعلم"}! يمكنك الآن تسجيل حضور طلابك بسهولة
            </p>
          </div>
        </div>

        {/* Main Control Card */}
        <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-lg shadow-purple-100/30 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-l from-purple-50 to-white p-6 md:p-8 border-b-2 border-purple-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title & Class Selector */}
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <Users className="text-purple-600" size={32} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-800">
                    تسجيل الحضور
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={16} className="text-purple-600" />
                    <span className="text-gray-600 text-sm">{selectedDate}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white border-2 border-purple-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border-2 border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none transition"
                />

                <button
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  حفظ السجل
                </button>
              </div>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllPresent}
                  className="bg-green-50 hover:bg-green-100 border-2 border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <CheckCircle size={16} />
                  حضور الكل
                </button>
                <button
                  onClick={markAllAbsent}
                  className="bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <XCircle size={16} />
                  غياب الكل
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="بحث عن طالب..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border-2 border-purple-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:border-purple-500 outline-none transition w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border-2 border-purple-200 rounded-xl px-4 py-2 text-sm focus:border-purple-500 outline-none transition"
                >
                  <option value="all">جميع الطلاب</option>
                  <option value="present">الحضور فقط</option>
                  <option value="absent">الغياب فقط</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-purple-50/50 border-b-2 border-purple-100">
            <div className="bg-white rounded-xl p-4 border-2 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">إجمالي الطلاب</p>
                  <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">الحضور</p>
                  <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">الغياب</p>
                  <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-xl">
                  <UserX className="text-red-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">نسبة الحضور</p>
                  <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <BarChart className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mx-6 mt-6 p-4 rounded-2xl text-white font-bold flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          {/* Students Grid */}
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-purple-400" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد طلاب</h3>
                <p className="text-gray-500">لم يتم العثور على طلاب مطابقين لمعايير البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(student => (
                  <div 
                    key={student._id}
                    onClick={() => toggleStatus(student._id)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      attendance[student._id] === "Present" 
                        ? "bg-white border-green-200 hover:border-green-400 hover:shadow-green-100" 
                        : "bg-white border-red-200 hover:border-red-400 hover:shadow-red-100"
                    }`}
                  >
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                      attendance[student._id] === "Present"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                      {attendance[student._id] === "Present" ? "حاضر" : "غائب"}
                    </div>

                    {/* Student Info */}
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mb-3 ${
                        attendance[student._id] === "Present"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {student.name.charAt(0)}
                      </div>
                      
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{student.name}</h3>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <span>ID: {student._id.slice(-6)}</span>
                      </div>

                      {/* Toggle Indicator */}
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        attendance[student._id] === "Present"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {attendance[student._id] === "Present" ? (
                          <>
                            <CircleCheckBig size={16} />
                            <span>انقر لتغيير إلى غائب</span>
                          </>
                        ) : (
                          <>
                            <Circle size={16} />
                            <span>انقر لتغيير إلى حاضر</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Status Icon */}
                    <div className={`absolute bottom-3 right-3 ${
                      attendance[student._id] === "Present"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                      {attendance[student._id] === "Present" ? (
                        <CheckCircle size={24} />
                      ) : (
                        <XCircle size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  الحضور: <span className="font-bold text-green-600">{presentCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  الغياب: <span className="font-bold text-red-600">{absentCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-purple-600" />
                <span className="text-sm text-gray-600">
                  آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              * انقر على بطاقة الطالب لتغيير حالة الحضور
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}