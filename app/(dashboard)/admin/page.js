"use client";
import { useState, useEffect } from "react";
import { getDashboardStats } from "@/lib/actions/statsActions";
import { Users, GraduationCap, School } from "lucide-react"; // مكتبة أيقونات رائعة

export default function AdminDashboard() {
  const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const cards = [
    { title: "إجمالي المعلمين", value: stats.teachers, icon: <Users size={32} />, color: "bg-blue-500" },
    { title: "إجمالي الطلاب", value: stats.students, icon: <GraduationCap size={32} />, color: "bg-purple-600" },
    { title: "عدد الفصول", value: stats.classes, icon: <School size={32} />, color: "bg-pink-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">لوحة التحكم الإحصائية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-gray-500 font-medium">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? "..." : card.value}
              </h3>
            </div>
            <div className={`${card.color} p-4 rounded-xl text-white shadow-lg`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* هنا يمكننا لاحقاً إضافة رسم بياني أو آخر النشاطات */}
      <div className="mt-10 bg-purple-50 p-8 rounded-3xl border border-purple-100 text-center">
        <h2 className="text-purple-800 font-bold text-xl mb-2">مرحباً بك في نظام إدارة المدرسة</h2>
        <p className="text-purple-600">يمكنك من هنا متابعة كافة العمليات التعليمية وإدارة الطاقم والطلاب.</p>
      </div>
    </div>
  );
}