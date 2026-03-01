import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/lib/models/users"; // تأكد من مسار الـ Model الخاص بك
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        await connectDB();
        
        // 1. البحث عن المستخدم
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("المستخدم غير موجود");

        // 2. التحقق من كلمة المرور
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) throw new Error("كلمة المرور خاطئة");

        // 3. إرجاع بيانات المستخدم (بما فيها الدور)
        return { id: user._id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
 callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // نضع الـ ID والـ Role داخل الـ token
        token.id = user.id?.toString() || user._id?.toString(); 
        token.role = user.role;
      }
      return token; // ⚠️ هذا هو السطر الناقص الذي كان يسبب المشكلة!
    },
    async session({ session, token }) {
      if (session.user) {
        // ننقل البيانات من الـ token إلى الـ session
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
pages: {
    signIn: '/login', // صفحة تسجيل الدخول المخصصة التي ستنشئها
  }
});

export { handler as GET, handler as POST };