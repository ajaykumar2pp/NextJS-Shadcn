export const metadata = {
  title: "Customers | Dashboard",
  description: "View and manage customer information",
};

import CustomerList from "@/components/CustomerList";
import TableList from "@/components/TableList";
import Link from "next/link";
import React from "react";

const GetCustomers = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-xl font-bold">Customers</h5>
        <Link
          href="/dashboard/customers/create"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Add New Customer
        </Link>
      </div>
      <div>
        {/* <CustomerList /> */}
        <TableList />
      </div>
    </div>
  );
};

export default GetCustomers;
