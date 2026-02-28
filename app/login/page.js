"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // نمنع إعادة التوجيه التلقائي للتحقق من النتيجة
    });

    if (result.error) {
      alert("خطأ في البيانات: " + result.error);
    } else {
      router.push("/admin/dashboard"); // وجهه للوحة التحكم عند النجاح
      router.refresh();
    }
  };

  const handleLogin = async (formData) => {
  const result = await loginAction(formData);
  if (result.success) {
    if (result.role === 'admin') window.location.href = "/admin";
    else if (result.role === 'teacher') window.location.href = "/teacher";
    else window.location.href = "/student";
  } else {
    alert(result.error);
  }
};

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">تسجيل دخول الإدارة</h1>
        <input 
          type="email" placeholder="البريد الإلكتروني" 
          className="block w-full p-2 border mb-3 text-black"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="كلمة المرور" 
          className="block w-full p-2 border mb-4 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          دخول
        </button>
      </form>
    </div>
  );
}