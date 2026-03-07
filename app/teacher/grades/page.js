"use client";
import { useState, useEffect } from "react";
import { getTeacherDashboardData, getStudentsByClassName, submitGrades } from "@/lib/actions/teacherActions";
import { 
  Save, 
  Award, 
  BookOpen, 
  Loader2, 
  ChevronLeft,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  FileEdit
} from "lucide-react";

export default function TeacherGradesPage() {
  const [mounted, setMounted] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [examName, setExamName] = useState("اختبار شهر مارس");
  const [subject, setSubject] = useState("اللغة العربية");
  const [errors, setErrors] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    setMounted(true);
    getTeacherDashboardData().then(res => {
      if (res.success) {
        setClasses(res.classes);
        if (res.classes.length > 0) setSelectedClass(res.classes[0].name);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedClass && mounted) {
      setLoadingStudents(true);
      setStudents([]);
      setScores({});
      setErrors({});
      
      getStudentsByClassName(selectedClass).then(data => {
        const parsedStudents = typeof data === 'string' ? JSON.parse(data) : data;
        setStudents(parsedStudents);
        setLoadingStudents(false);
      }).catch(() => setLoadingStudents(false));
    }
  }, [selectedClass, mounted]);

  const validateScore = (value) => {
    if (value === '' || value === null || value === undefined) return "الرجاء إدخال الدرجة";
    const num = Number(value);
    if (isNaN(num)) return "الرجاء إدخال رقم صحيح";
    if (num < 0) return "الدرجة لا يمكن أن تكون أقل من ٠";
    if (num > 20) return "الدرجة لا يمكن أن تزيد عن ٢٠";
    return "";
  };

  const handleScoreChange = (studentId, value) => {
    const error = validateScore(value);
    setErrors(prev => ({ ...prev, [studentId]: error }));
    setScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (students.length === 0) {
      alert("⚠️ لا يوجد طلاب في هذا الفصل");
      return;
    }

    // Validate all scores
    let hasErrors = false;
    const newErrors = {};
    students.forEach(student => {
      const score = scores[student._id];
      if (!score && score !== 0) {
        newErrors[student._id] = "الرجاء إدخال الدرجة";
        hasErrors = true;
      } else {
        const error = validateScore(score);
        if (error) {
          newErrors[student._id] = error;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      alert("❌ الرجاء تصحيح الأخطاء قبل الحفظ");
      return;
    }

    setIsSaving(true);
    try {
      const payload = students.map(s => ({
        studentId: s._id,
        classId: s.classId,
        subject,
        examName,
        score: Number(scores[s._id]) || 0,
        totalScore: 20
      }));
      
      const res = await submitGrades(payload);
      if (res.success) {
        alert("✅ تم حفظ الدرجات بنجاح!");
        // Clear success indicators
        setTimeout(() => {
          setErrors({});
        }, 2000);
      } else {
        alert("❌ خطأ: " + res.error);
      }
    } catch (error) {
      alert("🚨 حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <GraduationCap className="text-purple-600" size={40} />
          </div>
          <p className="text-purple-600 font-bold text-lg">جاري تهيئة النظام...</p>
        </div>
      </div>
    );
  }

  const enteredCount = Object.keys(scores).filter(id => scores[id] && !errors[id]).length;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-purple-600 cursor-pointer transition">الرئيسية</span>
          <ChevronLeft size={16} />
          <span className="hover:text-purple-600 cursor-pointer transition">المعلم</span>
          <ChevronLeft size={16} />
          <span className="text-purple-600 font-medium">رصد الدرجات</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-lg shadow-purple-100/30 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-l from-purple-50 to-white p-6 md:p-8 border-b-2 border-purple-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title */}
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <FileEdit className="text-purple-600" size={32} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-800">
                    رصد الدرجات
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    أدخل درجات الطلاب للاختبار الحالي
                  </p>
                </div>
              </div>

              {/* Class Selector & Stats */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white border-2 border-purple-200 rounded-xl px-4 py-2">
                  <Users size={18} className="text-purple-600" />
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="bg-transparent outline-none text-purple-900 font-bold min-w-[120px]"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl">
                  <span className="text-sm text-gray-600">عدد الطلاب:</span>
                  <span className="font-bold text-purple-600">{students.length}</span>
                </div>

                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">تم الإدخال:</span>
                  <span className="font-bold text-green-600">{enteredCount}</span>
                </div>
              </div>
            </div>

            {/* Exam Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-600" />
                  المادة الدراسية
                </label>
                <input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border-2 border-purple-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="أدخل اسم المادة"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Award size={16} className="text-purple-600" />
                  اسم الاختبار
                </label>
                <input 
                  value={examName} 
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full bg-white border-2 border-purple-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="أدخل اسم الاختبار"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleSave} 
                disabled={isSaving || loadingStudents || students.length === 0}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    حفظ جميع الدرجات
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="p-6 md:p-8">
            {loadingStudents ? (
              <div className="text-center py-16">
                <Loader2 size={40} className="animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-500">جاري تحميل قائمة الطلاب...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="text-purple-400" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد طلاب</h3>
                <p className="text-gray-500">لم يتم العثور على طلاب في هذا الفصل</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b-2 border-purple-100">
                      <th className="pb-4 pr-4 text-gray-600 font-medium w-16">#</th>
                      <th className="pb-4 text-gray-600 font-medium">اسم الطالب</th>
                      <th className="pb-4 text-center text-gray-600 font-medium">الدرجة (من ٢٠)</th>
                      <th className="pb-4 text-center text-gray-600 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const hasError = errors[student._id];
                      const hasValue = scores[student._id] !== undefined && scores[student._id] !== '';
                      
                      return (
                        <tr key={student._id} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                          <td className="py-4 pr-4 text-gray-400 font-medium">{index + 1}</td>
                          <td className="py-4">
                            <div className="font-bold text-gray-800">{student.name}</div>
                            <div className="text-xs text-gray-400">ID: {student._id.slice(-6)}</div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col items-center">
                              <input 
                                type="number"
                                max="20"
                                min="0"
                                step="0.5"
                                value={scores[student._id] || ''}
                                className={`w-24 p-3 text-center bg-white border-2 rounded-xl focus:outline-none transition ${
                                  hasError 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                    : hasValue
                                      ? 'border-green-300 bg-green-50 focus:border-green-500'
                                      : 'border-purple-200 focus:border-purple-500'
                                }`}
                                onChange={(e) => handleScoreChange(student._id, e.target.value)}
                                placeholder="٠"
                              />
                              {hasError && (
                                <span className="text-xs text-red-500 mt-1">{hasError}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            {hasError ? (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                خطأ في الإدخال
                              </span>
                            ) : hasValue ? (
                              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                تم الإدخال
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 text-xs px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                في الانتظار
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        {students.length > 0 && (
          <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">إجمالي الطلاب: <span className="font-bold text-purple-600">{students.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">تم الإدخال: <span className="font-bold text-green-600">{enteredCount}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">متبقي: <span className="font-bold text-gray-600">{students.length - enteredCount}</span></span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                * يمكن إدخال أرقام عشرية (مثال: ١٥.٥)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}