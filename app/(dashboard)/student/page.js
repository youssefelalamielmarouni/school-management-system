"use client";
import { useState, useEffect } from "react";
// سنفترض وجود دالة تجلب بيانات الطالب المسجل حالياً

export default function StudentPortal() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-lg">
        <h1 className="text-3xl font-bold">مرحباً بك، يوسف! 👋</h1>
        <p className="mt-2 opacity-90">نتمنى لك يوماً دراسياً ممتعاً ومليئاً بالانجاز.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* كرت الحضور */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <h3 className="text-gray-500 font-bold mb-4">نسبة حضورك</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-purple-600">92%</div>
            <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full" style={{width: '92%'}}></div>
            </div>
          </div>
        </div>

        {/* كرت آخر النتائج */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <h3 className="text-gray-500 font-bold mb-2">آخر اختبار</h3>
          <p className="text-xl font-bold text-gray-800">الرياضيات: 95/100</p>
          <button className="mt-4 text-purple-600 font-bold hover:underline">عرض الشهادة كاملة ←</button>
        </div>
      </div>
    </div>
  );
}