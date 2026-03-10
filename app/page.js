"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap
} from "lucide-react";

export default function LandingPage() {

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7 }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white text-slate-900 overflow-hidden"
      dir="rtl"
    >

      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-300/30 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">

        <motion.div
          {...fadeUp}
          className="flex items-center gap-2 font-black text-2xl text-purple-600"
        >
          <GraduationCap size={32} />
          <span>SMS</span>
        </motion.div>

        <Link
          href="/login"
          className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:scale-105 flex items-center gap-2"
        >
          دخول
          <ArrowRight size={18} />
        </Link>

      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-10 pb-16 max-w-7xl mx-auto text-center ">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="inline-block px-6 py-2 mb-8 text-lg font-bold tracking-wide text-purple-700 bg-purple-100 rounded-full"
        >
          School Management System
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUp}
          className="text-5xl md:text-7xl font-black mb-8 leading-tight"
        >
          أدِر فصولك الدراسية
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            بذكاء وبدون مجهود
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          نظام متكامل لإدارة الطلاب، تسجيل الحضور، رصد الدرجات،
          وإنشاء التقارير الذكية في ثوانٍ. صُمم خصيصاً لتمكين المعلمين
          وإدارة المدارس بكفاءة عالية.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp}
          className="flex justify-center gap-4 flex-wrap"
        >

          <Link
            href="/login"
            className="px-8 py-3 mb-3 bg-purple-600 text-white rounded-full font-bold shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all hover:scale-105 flex items-center gap-2"
          >
            تسجيل الدخول
            <ArrowRight size={18} />
          </Link>

          

        </motion.div>

        <motion.h2
          {...fadeUp}
          className="text-2xl md:text-1xl font-bold mb-6"
        >
         Devloped by <span className="text-purple-600 mt-20">Youssef El Alami El Marouni</span>
         <i className="text-sm text-slate-500 block mt-1">Full Stack Developer</i>
        <Link href="https://www.linkedin.com/in/youssef-el-alami-el-marouni-327224301" target="_blank" className="text-purple-600 hover:underline">
          LinkedIn
        </Link>
        </motion.h2>

      </section>
    </div>
  );
}