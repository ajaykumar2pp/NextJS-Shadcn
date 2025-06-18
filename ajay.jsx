"use client";

import dayjs from "dayjs";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import {
  ChevronDown,
  Ellipsis,
  Download,
  ChevronsUpDown,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  SquarePen,
  GripVertical,
} from "lucide-react";

import {
  PointerSensor,
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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

import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Fetch customers based on page, size, search, sorting
function useFetchCustomers({ pageIndex, pageSize, debouncedSearch, sorting }) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const sortBy = sorting.length
          ? sorting.map((s) => s.id).join(",")
          : "sort_order";
        const sortOrder = sorting.length
          ? sorting.map((s) => (s.desc ? "desc" : "asc")).join(",")
          : "asc";

        const params = new URLSearchParams({
          page: String(pageIndex + 1),
          limit: String(pageSize),
          search: debouncedSearch || "",
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

    fetchData();

    // Cleanup on unmount or dependency change
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [
    pageIndex,
    pageSize,
    debouncedSearch,
    sorting.map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`).join("|"),
  ]);

  return { users, totalCount, loading };
}

function DraggableTableRow({ row }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

const style = {
  ...(transform && { transform: CSS.Transform.toString(transform) }),
  transition,
  opacity: isDragging ? 0.8 : 1,
  zIndex: isDragging ? 1 : 0,
  position: "relative",
  backgroundColor: isDragging ? "var(--background)" : undefined,
};


  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() ? "selected" : undefined}
      className="hover:bg-muted/50 border-b transition-colors"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="px-4 py-2 text-sm">
          {cell.column.id === "drag" ? (
            <Button
              variant="ghost"
              size="icon"
              className={`cursor-grab hover:bg-transparent text-muted-foreground size-7 ${
                isDragging ? "cursor-grabbing" : ""
              }`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3" />
              <span className="sr-only">Drag row</span>
            </Button>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function TableList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize state from URL params
  const initialPageSize = Number(searchParams.get("pageSize")) || 5;
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";

  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [pageIndex, setPageIndex] = useState(initialPage - 1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sorting, setSorting] = useState([]);
  const [activeRow, setActiveRow] = useState(null);
  // const [users, setUsers] = useState([]);
  const [debouncedSearch] = useDebounce(globalFilter, 500);

  const { users, totalCount, loading } = useFetchCustomers({
    pageIndex,
    pageSize,
    debouncedSearch,
    sorting,
  });

  // Column order state
  const [columnOrder, setColumnOrder] = useState(() => [
    "drag",
    "select",
    "id",
    "first_name",
    "last_name",
    "company",
    "email",
    "created_at",
    "actions",
  ]);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // URL param updater
  const updateUrlParams = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === false
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Columns definition
  const columns = useMemo(
    () => [
      {
        id: "drag",
        header: "",
        cell: () => (
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab hover:bg-transparent text-muted-foreground size-7"
          >
            <GripVertical className="size-3" />
            <span className="sr-only">Drag row</span>
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 30,
      },
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 30,
      },
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
      {
        id: "first_name",
        accessorKey: "first_name",
        header: "FIRST NAME",
      },
      {
        id: "last_name",
        accessorKey: "last_name",
        header: "LAST NAME",
      },
      {
        id: "company",
        accessorKey: "company",
        header: "COMPANY",
      },
      {
        id: "email",
        accessorKey: "email",
        header: "EMAIL",
      },
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

  // Initialize table
  const table = useReactTable({
    data: users,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      globalFilter,
      sorting,
      columnOrder,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalCount / pageSize),
    onPaginationChange: (updater) => {
      const { pageIndex: newPageIndex, pageSize: newPageSize } =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
      updateUrlParams("page", newPageIndex + 1);
      updateUrlParams("pageSize", newPageSize);
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPageIndex(0);
      updateUrlParams("search", value);
      updateUrlParams("page", "1");
    },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Render sort icons
  const renderSortIcon = (column) => {
    if (!column.getCanSort()) return null;
    const isSorted = column.getIsSorted();
    if (isSorted === "asc") return <ArrowUpWideNarrow size={16} />;
    if (isSorted === "desc") return <ArrowDownWideNarrow size={16} />;
    return <ChevronsUpDown size={16} />;
  };

 
  // Handle row reordering
  const handleDragStart = useCallback((event) => {
    setActiveRow(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      setActiveRow(null);

      if (active && over && active.id !== over.id) {
        const oldIndex = users.findIndex((user) => user.id === active.id);
        const newIndex = users.findIndex((user) => user.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newUsers = arrayMove(users, oldIndex, newIndex);

          // ✅ FIXED: use state to update the UI
          setUsers(newUsers);

          const reordered = newUsers.map((user, index) => ({
            id: user.id,
            order: index,
          }));

          await fetch("/api/dashboard/customers/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reordered),
          });
        }
      }
    },
    [users]
  );


  // Export functions
  const handleExport = (type) => {
    alert(`Export to ${type} not implemented`);
  };

  return (
    <div className="container mx-auto mt-6 px-4">
     
      {/* Data Table with Drag & Drop */}
      <div className="overflow-x-auto rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Table className="min-w-full divide-y divide-gray-200">
            {/* Header */}
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={`header-group-${headerGroup.id}`}>
                  {headerGroup.headers
                    .slice()
                    .sort(
                      (a, b) =>
                        columnOrder.indexOf(a.column.id) -
                        columnOrder.indexOf(b.column.id)
                    )
                    .map((header) => (
                      <TableHead
                        key={`header-${header.id}`}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer px-4 py-2 text-left text-sm font-medium text-muted-foreground"
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {renderSortIcon(header.column)}
                        </div>
                      </TableHead>
                    ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* Body */}
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`} className="animate-pulse">
                    {columns.map((column, j) => (
                      <TableCell
                        key={`skeleton-cell-${i}-${column.id || j}`}
                        className="px-4 py-2"
                      >
                        <div className="h-4 w-full bg-muted rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow key="no-results-row">
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={users.map((user) => user.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableTableRow key={`row-${row.id}`} row={row} />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>

          <DragOverlay>
            {activeRow ? (
              <table className="table-fixed border-collapse">
                <tbody>
                  <TableRow
                    key={`overlay-row-${activeRow.id}`}
                    className="shadow-lg bg-background border"
                  >
                    {columns.map((column) => {
                      const cellContent =
                        column.id === "drag" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-grabbing hover:bg-transparent text-muted-foreground size-7"
                          >
                            <GripVertical className="size-3" />
                          </Button>
                        ) : (
                          <div className="truncate max-w-xs">
                            {activeRow.getValue?.(
                              column.accessorKey || column.id
                            ) ??
                              activeRow[column.id] ??
                              ""}
                          </div>
                        );

                      return (
                        <TableCell
                          key={`overlay-cell-${
                            column.id || column.accessorKey
                          }`}
                          className="px-4 py-2 text-sm"
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

     
    </div>
  );
}

-- Add sort_order column with default values
ALTER TABLE users ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Set initial values (existing records ke liye)
UPDATE users SET sort_order = id;