"use client";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. محاولة تسجيل الدخول
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, 
    });

    if (result.error) {
      alert("خطأ في البيانات: " + result.error);
      setLoading(false);
    } else {
      // 2. جلب بيانات الجلسة لمعرفة الرتبة (Role)
      const session = await getSession();
      const role = session?.user?.role; // تأكد أن Next-Auth يمرر الـ role في الـ session

      // 3. التوجيه الذكي بناءً على الرتبة
      if (role === 'admin') {
        router.push("/admin");
      } else if (role === 'student') {
        router.push("/student");
      } else if (role === 'teacher') {
        router.push("/teacher");
      } else {
        router.push("/"); // وجهة افتراضية
      }
      
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-800">تسجيل الدخول الموحد</h1>
        
        <input 
          type="email" 
          placeholder="البريد الإلكتروني" 
          className="block w-full p-2 border mb-3 text-black rounded"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="كلمة المرور" 
          className="block w-full p-2 border mb-4 text-black rounded"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button 
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition"
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>

      to test system:
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">بيانات الاختبار:</h2>
        <p><strong>Admin:</strong>
          <br />البريد: admin@school.com
          <br />كلمة المرور: admin123
        </p>
        <p><strong>Student:</strong>
          <br />البريد: student9@gmail.com
          <br />كلمة المرور:  123          
        </p>
        <p><strong>Teacher:</strong>
          <br />البريد:teacher2@gmail.com
          <br />كلمة المرور: 123
        </p>
      </div>
    </div>
  );
}