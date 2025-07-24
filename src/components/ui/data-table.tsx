"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  globalSearch?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data = [], // Provide default empty array
  searchPlaceholder = "Search...",
  searchColumn,
  globalSearch = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});  const [globalFilter, setGlobalFilter] = React.useState("");

  // Custom global filter function for better search across multiple fields
  const customGlobalFilterFn = (row: any, columnId: string, value: string) => {
    const searchValue = value.toLowerCase();
    
    // Search in all string values of the row
    const searchableValues = [
      row.original.AdmissionNumber,
      row.original.FirstName, 
      row.original.LastName,
      `${row.original.FirstName} ${row.original.LastName}`, // Full name
      row.original.Gender,
      row.original.ParentContact,
      row.original.Address,
      row.original.StudentClassID
    ].filter(Boolean).map(val => String(val).toLowerCase());
    
    return searchableValues.some(val => val.includes(searchValue));
  };

  const table = useReactTable({
    data: data || [], // Ensure data is never undefined
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: customGlobalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });// Use the first searchable column if no searchColumn is specified
  const getFirstAccessorColumn = () => {
    const accessorColumn = columns.find(col => 'accessorKey' in col && col.accessorKey);
    return accessorColumn ? (accessorColumn as any).accessorKey : undefined;
  };
  
  const defaultSearchColumn = searchColumn || getFirstAccessorColumn();
  
  // Ensure the column exists before using it
  const searchColumnExists = defaultSearchColumn && table.getColumn(defaultSearchColumn);
  const shouldUseGlobalSearch = globalSearch || !searchColumnExists;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-8"
    >
      {/* Enhanced Header with Glassmorphism */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-orange-500" />            <Input
              placeholder={searchPlaceholder}
              value={shouldUseGlobalSearch ? globalFilter : (table.getColumn(defaultSearchColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) => {
                if (shouldUseGlobalSearch) {
                  setGlobalFilter(event.target.value);
                } else {
                  table.getColumn(defaultSearchColumn)?.setFilterValue(event.target.value);
                }
              }}
              className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium shadow-lg"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90 hover:border-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl px-4 py-2 rounded-xl font-medium"
              >
                <Eye className="h-4 w-4" />
                View
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl rounded-xl">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 rounded-lg mx-1 transition-all duration-200"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/30 shadow-lg font-medium">
            <Filter className="h-4 w-4 text-orange-500" />
            {table.getFilteredRowModel().rows.length} items
          </div>
        </div>
      </div>

      {/* Enhanced Table Container */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white/50 to-amber-50/30 pointer-events-none"></div>
        
        <div className="relative modern-scroll overflow-auto max-h-[600px]">
          <Table className="modern-table">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-100/80 bg-gradient-to-r from-gray-50/80 to-white/80">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id} 
                        className="modern-table-header px-6 py-4 text-left font-semibold text-gray-700 bg-gradient-to-r from-gray-50/90 to-white/90 border-b-2 border-gray-100"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-orange-25 hover:to-amber-25 transition-all duration-300 group"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id} 
                          className="modern-table-cell px-6 py-4 text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-600">No results found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm"
      >
        <div className="flex-1 text-sm text-gray-600">
          Showing {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white/50 border-gray-200/50 hover:bg-gradient-to-r hover:from-[#ff4e00]/10 hover:to-[#8ea604]/10 disabled:opacity-50 transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white/50 border-gray-200/50 hover:bg-gradient-to-r hover:from-[#ff4e00]/10 hover:to-[#8ea604]/10 disabled:opacity-50 transition-all duration-300"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
