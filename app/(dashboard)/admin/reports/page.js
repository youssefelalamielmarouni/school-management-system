"use client";
import { useState, useEffect } from "react";
import { getAttendanceReport } from "@/lib/actions/attendanceActions";
import { getClassesForStudent } from "@/lib/actions/studentActions";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [report, setReport] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    getClassesForStudent().then(setClasses);
    loadReport();
  }, []);

  const loadReport = async (classId = "") => {
    const data = await getAttendanceReport(classId);
    setReport(data);
  };

  const exportToExcel = () => {
  // تجهيز البيانات لتناسب تنسيق Excel
  const excelData = report.map(item => ({
    "اسم الطالب": item.name,
    "رقم القيد": item.rollNumber,
    "أيام الحضور": item.present,
    "أيام الغياب": item.absent,
    "أيام التأخير": item.late,
    "نسبة الحضور %": ((item.present / item.total) * 100).toFixed(1)
  }));

  // إنشاء ملف Excel
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الحضور");

  // تحميل الملف للمستخدم
  XLSX.writeFile(workbook, `تقرير_حضور_${selectedClass || 'عام'}.xlsx`);
};

  return (
    <div className="p-6 space-y-6 text-right">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-800">تقارير الحضور والغياب</h2>
        <select 
          onChange={(e) => { setSelectedClass(e.target.value); loadReport(e.target.value); }}
          className="p-2 border rounded-lg bg-white text-black"
        >
          <option value="">كل الفصول</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ملخص سريع */}
        <div className="bg-green-100 p-4 rounded-xl border border-green-200">
          <p className="text-green-700 font-bold">متوسط الحضور</p>
          <p className="text-2xl text-green-800">85%</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl border border-red-200">
          <p className="text-red-700 font-bold">طلاب متجاوزون للغياب</p>
          <p className="text-2xl text-red-800">3 طلاب</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="p-4 border-b">الطالب</th>
              <th className="p-4 border-b text-center">أيام الحضور</th>
              <th className="p-4 border-b text-center text-red-600">أيام الغياب</th>
              <th className="p-4 border-b text-center">نسبة الحضور</th>
            </tr>
          </thead>
          <tbody>
            {report.map((item, index) => {
              const attendanceRate = ((item.present / item.total) * 100).toFixed(1);
              return (
                <tr key={index} className="border-b hover:bg-gray-50 text-black">
                  <td className="p-4">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.rollNumber}</p>
                  </td>
                  <td className="p-4 text-center font-bold text-green-600">{item.present}</td>
                  <td className="p-4 text-center font-bold text-red-600">
                    <span className={item.absent > 5 ? "bg-red-500 text-white px-2 py-1 rounded" : ""}>
                      {item.absent}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className={`h-2.5 rounded-full ${attendanceRate > 75 ? 'bg-green-500' : 'bg-orange-500'}`} 
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{attendanceRate}%</span>
                  </td>
                </tr>
                
              );
            })}
          </tbody>
        </table>
        <div className="p-4 bg-gray-50 flex justify-end">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700">
           Excel تصدير إلى 
          </button>
        </div>
      </div>
    </div>
  );
}