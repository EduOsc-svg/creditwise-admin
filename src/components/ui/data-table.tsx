import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border bg-card", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "transition-colors hover:bg-muted/30",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn("px-4 py-3 text-foreground", col.className)}
                >
                  {col.render
                    ? col.render(item, index)
                    : String((item as Record<string, unknown>)[col.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
