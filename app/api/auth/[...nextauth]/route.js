import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/lib/models/users";
import bcrypt from "bcrypt";

export const authOptions = {
  // 1. المزودون (Providers) - تنتهي المصفوفة عند السطر 26
  providers: [
    CredentialsProvider({
      name: "credentials",
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error("البريد الإلكتروني غير مسجل");

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) throw new Error("كلمة المرور خاطئة");

        return user;
      },
    }),
  ],

  // 2. الإعدادات العامة (يجب أن تكون خارج المصفوفة)
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id.toString();
        token.role = user.role;
        token.classId = user.classId?.toString();
        // أضفنا هذا السطر للتأكد من وجود معرف البروفايل الذي يبحث عنه الأكشن
        token.studentProfile = user.studentProfile?.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.classId = token.classId;
        session.user.studentProfile = token.studentProfile;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };