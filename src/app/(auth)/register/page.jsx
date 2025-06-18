"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogOut } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import registerSchema from "@/validation/registerSchema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      company: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zip: "",
      phone: "",
      about: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const trimmedValues = Object.fromEntries(
          Object.entries(values).map(([key, val]) => [key, val.trim?.() ?? val])
        );

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trimmedValues),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Registration Failed");

        toast.success("User registered successfully!");
        resetForm();
        router.push("/dashboard");
      } catch (err) {
        toast.error(err.message || "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  });

  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <p className="text-sm text-red-500 mt-1">{formik.errors[field]}</p>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-bold mb-2">Register Information</h2>
      <p className="text-muted-foreground mb-8">
        Please provide all required details to register your account.
      </p>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Email & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              autoCapitalize="none"
              {...inputProps("email")}
            />
            {renderError("email")}
          </div>
          <div className="relative space-y-1.5">
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...inputProps("password")}
              className="pr-10"
            />
            <span
              className="absolute right-3 top-[28px] cursor-pointer text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            {renderError("password")}
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="firstname">First Name <span className="text-red-500">*</span></Label>
            <Input id="firstname" type="text" {...inputProps("firstname")} />
            {renderError("firstname")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastname">Last Name <span className="text-red-500">*</span></Label>
            <Input id="lastname" type="text" {...inputProps("lastname")} />
            {renderError("lastname")}
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
          <Input id="company" type="text" {...inputProps("company")} />
          {renderError("company")}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
          <Input id="address" type="text" {...inputProps("address")} />
          {renderError("address")}
        </div>

        {/* City, State, Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["city", "state", "country"].map((field) => (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>
                {field[0].toUpperCase() + field.slice(1)} <span className="text-red-500">*</span>
              </Label>
              <Input id={field} type="text" {...inputProps(field)} />
              {renderError(field)}
            </div>
          ))}
        </div>

        {/* Zip, Phone, About */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="zip">Zip Code <span className="text-red-500">*</span></Label>
            <Input id="zip" type="text" {...inputProps("zip")} />
            {renderError("zip")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
            <Input id="phone" type="text" {...inputProps("phone")} />
            {renderError("phone")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="about">How did you hear about us? <span className="text-red-500">*</span></Label>
            <Select
              value={formik.values.about}
              onValueChange={(value) => formik.setFieldValue("about", value)}
            >
              <SelectTrigger id="about" className="w-[180]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
              </SelectContent>
            </Select>
            {renderError("about")}
          </div>
        </div>
        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={formik.isSubmitting}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {formik.isSubmitting ? "Registering..." : "Finish Registration"}
          </Button>
        </div>
      </form>

      {/* Login Link */}
      <div className="text-center mt-6 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 underline">
          Login here
        </Link>
      </div>
    </div>
  );
}
