"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import addCustomerSchema from "@/validation/addCustomerSchema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-tabs/style/react-tabs.css";
import { toast } from "react-toastify";

export default function EditCustomerPage() {
  const params = useParams();
  const id = params.id;

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const noteTabs = ["Customer", "Quality", "Accounting", "Shipping", "Sales"];
  const placeholders = [
    "CUSTOMER NOTE",
    "QUALITY",
    "ACCOUNTING",
    "SHIPPING",
    "SALES",
  ];

  const formik = useFormik({
    initialValues: {
      email: "",
      firstname: "",
      lastname: "",
      company: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zip: "",
      phone: "",
      mobile: "",
      sendinvoice: "",
      conformance: "",
      password: "",
      sfirstname: "",
      slastname: "",
      scompany: "",
      saddress: "",
      scity: "",
      sstate: "",
      scountry: "",
      szip: "",
      sphone: "",
      smobile: "",
      terms: "",
      freight: "",
      note: "",
    },
    validationSchema: addCustomerSchema,
    onSubmit: async (values, { resetForm }) => {
      // console.log(values);
      try {
        console.log(values);
        const res = await fetch("/api/dashboard/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message || "Add Customer failed!");
          return;
        }
        toast.success("Add Customer Successful!");
        resetForm();
        router.push("/dashboard/customers");
      } catch (err) {
        toast.error("Add Customer failed!");
        console.error(err);
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
      <p className="text-red-600 text-sm mt-1">{formik.errors[field]}</p>
    );

  return (
      <div className="p-4">
        <div>
          <h2 className="text-lg font-bold">Edit Customer - ID : {id}</h2>
        </div>

        {/* Checkbox */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked
            readOnly
          />
          <span className="text-sm">Critical Customers</span>
        </div>

        {/* Login Details */}
        <div className="mt-6">
          <h2 className="text-lg font-medium">Login Details</h2>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-4 space-y-6">
          {/* Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                {...inputProps("email")}
              />
              {renderError("email")}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring focus:ring-blue-200"
                  {...inputProps("password")}
                />
                <span
                  onClick={togglePassword}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
                >
                  {renderError("password")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* LEFT COLUMN: Billing Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Billing Details
              </h2>

              {/* Billing Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...inputProps("firstname")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {renderError("firstname")}
                </div>
                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...inputProps("lastname")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {renderError("lastname")}
                </div>
              </div>
              {/* Company */}
              <div className="mt-4">
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  {...inputProps("company")}
                />
                {renderError("company")}
              </div>
              {/* Address */}
              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-medium">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  {...inputProps("address")}
                />
                {renderError("address")}
              </div>
              {/* City, State, Country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    {...inputProps("city")}
                  />
                  {renderError("city")}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    {...inputProps("state")}
                  />
                  {renderError("state")}
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    {...inputProps("country")}
                  />
                  {renderError("country")}
                </div>
              </div>

              {/* Zip, Phone, Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    {...inputProps("zip")}
                  />
                  {renderError("zip")}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium">
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Send Invoice */}
              <div className="mt-4">
                <label
                  htmlFor="sendinvoice"
                  className="block text-sm font-medium"
                >
                  Send Invoice To
                </label>
                <input
                  type="text"
                  name="sendinvoice"
                  value={formik.values.sendinvoice}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
                {formik.touched.sendinvoice && formik.errors.sendinvoice && (
                  <p className="text-red-600 text-sm mt-1">
                    {formik.errors.sendinvoice}
                  </p>
                )}
              </div>

              {/* Certificate of Conformance */}
              <div className="mt-4">
                <label
                  htmlFor="conformance"
                  className="block text-sm font-medium"
                >
                  Certificate Of Conformance
                </label>
                <input
                  type="text"
                  name="conformance"
                  value={formik.values.conformance}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Shipping Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping First Name
                  </label>
                  <input
                    type="text"
                    name="sfirstname"
                    value={formik.values.sfirstname}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping Last Name
                  </label>
                  <input
                    type="text"
                    name="slastname"
                    value={formik.values.slastname}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Company
                </label>
                <input
                  type="text"
                  name="scompany"
                  value={formik.values.scompany}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Shipping Address */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <input
                  type="text"
                  name="saddress"
                  value={formik.values.saddress}
                  onChange={formik.handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              {/* Shipping City, State, Country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping City
                  </label>
                  <input
                    type="text"
                    name="scity"
                    value={formik.values.scity}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping State
                  </label>
                  <input
                    type="text"
                    name="sstate"
                    value={formik.values.sstate}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping Country
                  </label>
                  <input
                    type="text"
                    name="scountry"
                    value={formik.values.scountry}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Shipping Zip, Phone, Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping Zip Code
                  </label>
                  <input
                    type="text"
                    name="szip"
                    value={formik.values.szip}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping Phone
                  </label>
                  <input
                    type="text"
                    name="sphone"
                    value={formik.values.sphone}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping Mobile
                  </label>
                  <input
                    type="text"
                    name="smobile"
                    value={formik.values.smobile}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Terms & Freight Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms
                  </label>
                  <Select
                    value={formik.values.terms}
                    onValueChange={(value) =>
                      formik.setFieldValue("terms", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Freight Condition
                  </label>
                  <input
                    type="text"
                    name="freight"
                    value={formik.values.freight}
                    onChange={formik.handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Notes with Tabs */}
              <div className="mt-4">
                <Tabs defaultValue="Customer" className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>

                  <TabsList className="grid grid-cols-5 w-full mb-2">
                    {noteTabs.map((tab) => (
                      <TabsTrigger key={tab} value={tab}>
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {noteTabs.map((tab, index) => (
                    <TabsContent key={tab} value={tab}>
                      <textarea
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 min-h-[50px]"
                        name="note"
                        value={formik.values.note}
                        onChange={formik.handleChange}
                        placeholder={placeholders[index]}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Saving..." : "Add Customer"}
            </button>
            <button
              type="button"
              onClick={() => formik.resetForm()}
              className="ml-3 bg-gray-100 text-gray-700 px-4 py-2 cursor-pointer rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
  );
}
