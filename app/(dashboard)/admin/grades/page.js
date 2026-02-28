"use client";
import { useState, useEffect } from "react";
import { getClassesForStudent } from "@/lib/actions/studentActions";
import { getStudentsByClass } from "@/lib/actions/attendanceActions";
import { getSubjects } from "@/lib/actions/subjectActions";
import { saveExamGrades } from "@/lib/actions/examActions";

export default function GradesPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [marks, setMarks] = useState({}); // {studentId: score}

  useEffect(() => {
    getClassesForStudent().then(setClasses);
    getSubjects().then(setSubjects);
  }, []);

  const loadStudents = async (classId) => {
    setSelectedClass(classId);
    const data = await getStudentsByClass(classId);
    setStudents(data);
    const initialMarks = {};
    data.forEach(s => initialMarks[s._id] = 0);
    setMarks(initialMarks);
  };

  const handleScoreChange = (sId, val) => {
    setMarks(prev => ({ ...prev, [sId]: val }));
  };

  const handleSubmit = async () => {
    const formattedScores = Object.keys(marks).map(sId => ({
      studentId: sId,
      marksObtained: Number(marks[sId])
    }));

    const result = await saveExamGrades({
      examName,
      subjectId: selectedSubject,
      classId: selectedClass,
      totalMarks,
      scores: formattedScores
    });

    if (result.success) alert("تم رصد الدرجات بنجاح!");
  };

  return (
    <div className="p-6 space-y-6 text-right">
      <h2 className="text-2xl font-bold text-purple-800">رصد درجات الطلاب</h2>

      {/* إعدادات الامتحان */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm border border-purple-100">
        <input placeholder="اسم الامتحان (مثلاً: نصفي)" className="p-2 border rounded text-black" onChange={(e)=>setExamName(e.target.value)} />
        <select onChange={(e) => loadStudents(e.target.value)} className="p-2 border rounded text-black">
          <option value="">اختر الفصل</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
        </select>
        <select onChange={(e) => setSelectedSubject(e.target.value)} className="p-2 border rounded text-black">
          <option value="">اختر المادة</option>
          {subjects.filter(s => s.class?._id === selectedClass).map(s => (
            <option key={s._id} value={s._id}>{s.subjectName}</option>
          ))}
        </select>
        <input type="number" placeholder="الدرجة الكلية" className="p-2 border rounded text-black" onChange={(e)=>setTotalMarks(e.target.value)} />
      </div>

      {/* قائمة الطلاب لإدخال الدرجات */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-purple-50 text-purple-700">
              <tr>
                <th className="p-4 border-b">اسم الطالب</th>
                <th className="p-4 border-b text-center">الدرجة المكتسبة</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-b text-black">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-center">
                    <input 
                      type="number" 
                      max={totalMarks}
                      className="w-20 p-1 border rounded text-center focus:ring-2 focus:ring-purple-500 outline-none" 
                      onChange={(e) => handleScoreChange(s._id, e.target.value)}
                    /> 
                    <span className="mr-2 text-gray-400">/ {totalMarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button onClick={handleSubmit} className="bg-purple-600 text-white px-10 py-2 rounded-lg font-bold hover:bg-purple-700 shadow-md transition">
              حفظ النتائج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}