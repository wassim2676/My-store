import NextAuth, { NextAuthConfig, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// ==================== 🔐 توسيع الأنواع ====================
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      isActive?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    isActive?: boolean;
    passwordHash?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    isActive?: boolean;
  }
}

// ==================== 🔑 الحصول على السر بأمان ====================
const getSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  
  // للتطوير: سر افتراضي إذا لم يوجد (لا تستخدمه في الإنتاج!)
  if (!secret && process.env.NODE_ENV === "development") {
    console.warn("⚠️ NEXTAUTH_SECRET غير موجود، باستخدام سر تجريبي!");
    return "dev-fallback-secret-key-for-local-development-only-12345678901234567890";
  }
  
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required in production");
  }
  
  return secret;
};

// ==================== ⚙️ إعدادات المصادقة ====================
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }

        if (!user.isActive) {
          throw new Error("الحساب غير مفعل، يرجى التواصل مع الدعم");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.warn(`[AUTH] Failed login attempt for: ${credentials.email}`);
          throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.isActive = user.isActive;
      }

      if (trigger === "update" && session?.user) {
        token.firstName = session.user.firstName;
        token.lastName = session.user.lastName;
        token.phone = session.user.phone;
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.phone = token.phone;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },

  // ✅ استخدام الدالة الآمنة
  secret: getSecret(),
  
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);