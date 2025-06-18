"use client";

import { useState } from "react";
import { useFormik } from "formik";
import loginSchema from "@/validation/loginSchema";
import { Eye, EyeOff, LogOut, User, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Login failed!");
          return;
        }

        toast.success("User Login Successful!");
        resetForm();
        router.push("/dashboard");
      } catch (err) {
        toast.error("Something went wrong!");
        console.error("Login error:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Login to access your account
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <User size={18} />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <Lock size={18} />
              </span>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                onClick={togglePassword}
                className="absolute right-3 top-2.5 cursor-pointer text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right text-sm">
            <Link
              href="/forget-password"
              className="text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={formik.isSubmitting}
          > 
            <LogOut className="mr-2 h-4 w-4" />
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
