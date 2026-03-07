export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-4xl font-bold text-red-600 mb-4">وصول غير مصرح!</h1>
      <p className="text-gray-600 mb-6">عذراً، لا تملك الصلاحيات الكافية لدخول هذه الصفحة.</p>
      <a href="/" className="px-6 py-2 bg-purple-600 text-white rounded-lg">العودة للرئيسية</a>
    </div>
  );
}