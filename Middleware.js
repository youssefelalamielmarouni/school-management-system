import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // إذا كان المستخدم يحاول دخول صفحة إدارة وهو ليس آدمن
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    // يمكنك إضافة شروط إضافية هنا
  },
  {
    callbacks: {
      // هذه الدالة هي الأهم: إذا أعادت false، سيتم تحويل المستخدم للـ Login تلقائياً
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // تأكد أن هذا هو رابط صفحة تسجيل الدخول عندك
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
  ],
};