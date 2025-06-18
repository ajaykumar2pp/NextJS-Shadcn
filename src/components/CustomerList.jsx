"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import dayjs from "dayjs";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  SquarePen,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronsUpDown,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const abortControllerRef = useRef(null);

  const initialPageSize = Number(searchParams.get("pageSize")) || 5;
  const initialPageIndex =
    searchParams.get("page") && Number(searchParams.get("page")) > 0
      ? Number(searchParams.get("page")) - 1
      : 0;

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [debouncedSearch] = useDebounce(globalFilter, 500);
  const [sorting, setSorting] = useState([]);

  const updateUrlParams = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const sortBy = sorting.map((s) => s.id).join(",");
        const sortOrder = sorting
          .map((s) => (s.desc ? "desc" : "asc"))
          .join(",");

        const params = new URLSearchParams({
          page: String(pageIndex + 1),
          limit: String(pageSize),
          search: debouncedSearch,
          sortBy,
          sortOrder,
        });

        const res = await fetch(
          `/api/dashboard/customers?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data.users || []);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => abortControllerRef.current?.abort();
  }, [debouncedSearch, pageIndex, pageSize, sorting]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "first_name", header: "FIRST NAME" },
      { accessorKey: "last_name", header: "LAST NAME" },
      { accessorKey: "company", header: "COMPANY" },
      { accessorKey: "email", header: "EMAIL" },
      {
        id: "created_at",
        header: "REGISTERED ON",
        accessorFn: (row) => dayjs(row.created_at).format("MMM DD, YYYY"),
      },
      {
        id: "actions",
        header: "ACTIONS",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={() =>
              router.push(`/dashboard/customers/edit/${row.original.id}`)
            }
            className="text-blue-500 hover:text-blue-700"
            aria-label={`Edit customer ${row.original.id}`}
          >
            <SquarePen size={18} />
          </button>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: users,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      globalFilter,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
      updateUrlParams("page", next.pageIndex + 1);
      updateUrlParams("pageSize", next.pageSize);
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      updateUrlParams("sortBy", updater.map((s) => s.id).join(","));
      updateUrlParams(
        "sortOrder",
        updater.map((s) => (s.desc ? "desc" : "asc")).join(",")
      );
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPageIndex(0);
      updateUrlParams("page", "1");
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const renderSortIcon = (column) => {
    if (!column.getCanSort()) return null;
    const isSorted = column.getIsSorted();
    if (isSorted === "asc") return <ArrowUpWideNarrow size={16} />;
    if (isSorted === "desc") return <ArrowDownWideNarrow size={16} />;
    return <ChevronsUpDown size={16} />;
  };

  const paginationItems = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pageSize);
    const current = pageIndex + 1;
    const pagesToShow = 5;
    const pageNumbers = [];

    const showLeftEllipsis = current > 3;
    const showRightEllipsis = current < totalPages - 2;

    const start = Math.max(1, current - 1);
    const end = Math.min(totalPages, current + 1);

    if (!showLeftEllipsis) {
      for (let i = 1; i <= Math.min(pagesToShow, totalPages); i++) {
        pageNumbers.push(i);
      }
    } else if (!showRightEllipsis) {
      for (let i = totalPages - pagesToShow + 1; i <= totalPages; i++) {
        if (i > 0) pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("left-ellipsis");
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      pageNumbers.push("right-ellipsis");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  }, [pageIndex, totalCount, pageSize]);

  return (
    <div className="container mx-auto mt-6 px-4">
      {/* Search & Page Size */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search customers..."
          className="w-full md:w-1/3 rounded-md border border-gray-300 px-4 py-2 text-sm"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={loading}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const newSize = Number(value);
              setPageSize(newSize);
              setPageIndex(0);
              updateUrlParams("pageSize", value);
              updateUrlParams("page", "1");
            }}
          >
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue placeholder="Page Size">{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Always render thead */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer px-4 py-2 text-left font-medium text-sm text-muted-foreground"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {renderSortIcon(header.column)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              // Show skeleton rows while loading
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(columns.length)].map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <div className="h-4 w-full bg-muted rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-muted-foreground"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={
                table.getCanPreviousPage()
                  ? ""
                  : "pointer-events-none opacity-50"
              }
              href="#"
            />
          </PaginationItem>

          {paginationItems.map((page, index) =>
            page === "left-ellipsis" || page === "right-ellipsis" ? (
              <PaginationItem key={index}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={page === pageIndex + 1}
                  onClick={() => {
                    setPageIndex(page - 1);
                    updateUrlParams("page", page.toString());
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={
                table.getCanNextPage() ? "" : "pointer-events-none opacity-50"
              }
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
