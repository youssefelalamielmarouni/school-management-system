"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getStudentsByClassName, submitAttendance } from "@/lib/actions/teacherActions";
import { 
  CheckCircle, 
  XCircle, 
  Save, 
  Loader2,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Download,
  AlertCircle,
  UserCheck,
  UserX,
  UserClock,
  CheckCircle2,
  XCircle as XCircleIcon,
  Clock3,
  Shield,
  BarChart
} from "lucide-react";

export default function SmartAttendance() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showStats, setShowStats] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getStudentsByClassName("bac");
        
        if (data && data.length > 0) {
          setStudents(data);
          const initial = {};
          data.forEach(s => initial[s._id] = "Present");
          setAttendance(initial);
          showMessage("success", `تم تحميل ${data.length} طالب`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        showMessage("error", "فشل في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const toggleStudentStatus = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present"
    }));
  };

  const setAllStudents = (status) => {
    const newAttendance = {};
    students.forEach(s => newAttendance[s._id] = status);
    setAttendance(newAttendance);
    showMessage("success", `تم تعيين جميع الطلاب كـ ${status === "Present" ? "حاضر" : "غائب"}`);
  };

  const handleSaveReport = async () => {
    if (students.length === 0) return;
    setIsSaving(true);
    
    const payload = students.map(s => ({
      studentId: s._id,
      classId: s.classId,
      status: attendance[s._id] || "Present",
      date: new Date()
    }));

    try {
      const result = await submitAttendance(payload);
      if (result.success) {
        showMessage("success", "✅ تم حفظ سجل الحضور بنجاح");
      } else {
        showMessage("error", `❌ فشل: ${result.error}`);
      }
    } catch (error) {
      showMessage("error", "❌ حدث خطأ في الاتصال");
    } finally {
      setIsSaving(false);
    }
  };

  const getStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(s => s === "Present").length;
    const absent = Object.values(attendance).filter(s => s === "Absent").length;
    return { total, present, absent };
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || attendance[student._id] === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = getStats();

  if (status === "loading" || loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl">
                  <Users className="text-indigo-600 w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-l from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  حضور فصل bac
                </h1>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('ar-EG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date().toLocaleTimeString('ar-EG', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <BarChart className="w-4 h-4" />
                الإحصائيات
              </button>
              <button
                onClick={() => setAllStudents("Present")}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                الكل حاضر
              </button>
              <button
                onClick={() => setAllStudents("Absent")}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                الكل غائب
              </button>
              <button
                onClick={handleSaveReport}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    إرسال التقرير
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 animate-slideDown">
              <StatCard
                label="إجمالي الطلاب"
                value={stats.total}
                icon={<Users className="w-5 h-5" />}
                color="indigo"
              />
              <StatCard
                label="الحضور"
                value={stats.present}
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="green"
                percentage={(stats.present / stats.total * 100).toFixed(1)}
              />
              <StatCard
                label="الغياب"
                value={stats.absent}
                icon={<XCircleIcon className="w-5 h-5" />}
                color="red"
                percentage={(stats.absent / stats.total * 100).toFixed(1)}
              />
            </div>
          )}
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slideDown ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="بحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filterStatus === "all" 
                    ? "bg-indigo-100 text-indigo-600" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Filter className="w-4 h-4" />
                الكل
              </button>
              <button
                onClick={() => setFilterStatus("Present")}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filterStatus === "Present" 
                    ? "bg-green-100 text-green-600" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                الحضور
              </button>
              <button
                onClick={() => setFilterStatus("Absent")}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  filterStatus === "Absent" 
                    ? "bg-red-100 text-red-600" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <XCircle className="w-4 h-4" />
                الغياب
              </button>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => (
            <StudentCard
              key={student._id}
              student={student}
              status={attendance[student._id] || "Present"}
              onToggle={() => toggleStudentStatus(student._id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد طلاب</h3>
            <p className="text-gray-400">لا توجد نتائج تطابق بحثك</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <p>إجمالي الطلاب: {students.length} | المعروض: {filteredStudents.length}</p>
          <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== Subcomponents ==========

function StudentCard({ student, status, onToggle }) {
  const isPresent = status === "Present";
  
  return (
    <div
      onClick={onToggle}
      className={`group relative overflow-hidden rounded-3xl border-2 cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-xl ${
        isPresent 
          ? "bg-gradient-to-br from-white to-green-50 border-green-200 hover:border-green-300" 
          : "bg-gradient-to-br from-white to-red-50 border-red-200 hover:border-red-300"
      }`}
    >
      {/* Decorative Elements */}
      <div className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all ${
        isPresent ? "bg-green-500" : "bg-red-500"
      }`}></div>
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
            isPresent 
              ? "bg-green-100 text-green-600" 
              : "bg-red-100 text-red-600"
          }`}>
            {student.name.charAt(0)}
          </div>
          {isPresent ? (
            <CheckCircle className="text-green-500 w-6 h-6 animate-bounce" />
          ) : (
            <XCircle className="text-red-500 w-6 h-6 animate-pulse" />
          )}
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg mb-1">{student.name}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            isPresent 
              ? "bg-green-100 text-green-600" 
              : "bg-red-100 text-red-600"
          }`}>
            {isPresent ? "حاضر" : "غائب"}
          </span>
          <span className="text-gray-400 text-xs">رقم: {student.rollNumber || "---"}</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isPresent ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: isPresent ? "100%" : "0%" }}
          ></div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${
        isPresent ? "bg-green-500" : "bg-red-500"
      }`}></div>
    </div>
  );
}

function StatCard({ label, value, icon, color, percentage }) {
  const colors = {
    indigo: "from-indigo-100 to-indigo-200 text-indigo-600",
    green: "from-green-100 to-green-200 text-green-600",
    red: "from-red-100 to-red-200 text-red-600"
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm">{label}</span>
        <div className={`p-2.5 bg-gradient-to-br ${colors[color]} rounded-xl`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-black text-gray-800">{value}</span>
        {percentage && (
          <span className={`text-sm font-medium ${
            color === "green" ? "text-green-600" : 
            color === "red" ? "text-red-600" : "text-indigo-600"
          }`}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-xl w-64"></div>
            <div className="h-4 bg-gray-200 rounded-xl w-48"></div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl animate-pulse">
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}