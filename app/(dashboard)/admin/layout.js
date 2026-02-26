import Link from "next/link";

export default function AdminLayout({ children }) {
  const menuItems = [
    { name: "الرئيسية", path: "/admin" },
    { name: "المعلمين", path: "/admin/teachers" },
    { name: "الطلاب", path: "/admin/students" },
    { name: "الفصول الدراسيّة", path: "/admin/classes" },
    { name: "الإعدادات", path: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar - القائمة الجانبية باللون البنفسجي */}
      <aside className="w-64 bg-purple-700 text-white hidden md:flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-purple-600">
          نظام مدرستي
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-600 hover:translate-x-1"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-purple-600">
          <button className="w-full bg-purple-800 py-2 rounded hover:bg-red-500 transition">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content - المحتوى الرئيسي باللون الأبيض */}
      <main className="flex-1 flex flex-col">
        {/* Header العلوي */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-purple-700">لوحة تحكم المدير</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">مرحباً، آدمن يوسف</span>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
              Y
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}