import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  InboxIcon,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";

export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? <Spinner size={14} /> : null} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function StatusBadge({ status }) {
  const map = {
    Pending: "badge-pending",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
    Active: "badge-active",
    Completed: "badge-completed",
    OnHold: "badge-pending",
    Todo: "badge-pending",
    InProgress: "badge-active",
    High: "badge-high",
    Medium: "badge-medium",
    Low: "badge-low",
    Admin: "badge bg-purple-100 text-purple-800",
    Leader: "badge bg-blue-100 text-blue-800",
    Employee: "badge bg-gray-100 text-gray-800",
  };
  return (
    <span className={map[status] || "badge bg-gray-100 text-gray-700"}>
      {status}
    </span>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn-secondary px-2 py-1"
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(
        (p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium ${
              p === page
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="btn-secondary px-2 py-1"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "indigo",
  sub,
  onClick,
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div
      className={`card p-5 flex items-start gap-4 ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-150 active:scale-[0.98]"
          : ""
      }`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {onClick && (
          <p className="text-xs text-indigo-500 mt-1">Click to view →</p>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  message = "No data found",
  icon: Icon = InboxIcon,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={40} className="mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative max-w-xs">
      <Search
        size={14}
        className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-8"
      />
    </div>
  );
}

export function ExpandableText({ text, limit = 50, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const words = text.split(" ");
  const isLong = words.length > limit;
  const displayed =
    !isLong || expanded ? text : words.slice(0, limit).join(" ") + "...";

  return (
    <span className={className}>
      {displayed}
      {isLong && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs whitespace-nowrap"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </span>
  );
}

export function ClickableText({ children, onClick, className = "" }) {
  if (!onClick) return <span className={className}>{children}</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`text-indigo-600 hover:text-indigo-800 hover:underline font-medium text-left ${className}`}
    >
      {children}
    </button>
  );
}

export function SortHeader({ col, label, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  return (
    <th
      className="px-4 py-3 font-medium cursor-pointer select-none hover:bg-gray-100 transition-colors"
      onClick={() => onSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="flex flex-col ml-0.5">
          <ChevronUp
            size={10}
            className={
              active && sortDir === "asc" ? "text-indigo-600" : "text-gray-300"
            }
          />
          <ChevronDown
            size={10}
            className={
              active && sortDir === "desc" ? "text-indigo-600" : "text-gray-300"
            }
          />
        </span>
      </div>
    </th>
  );
}

export function useSortSearch(
  items,
  defaultSort = "createdAt",
  defaultDir = "desc",
) {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(defaultSort);
  const [sortDir, setSortDir] = useState(defaultDir);

  const handleSort = (col) => {
    if (col === sortCol) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sorted = [...items].sort((a, b) => {
    let av = a[sortCol],
      bv = b[sortCol];
    if (av === undefined || av === null) av = "";
    if (bv === undefined || bv === null) bv = "";

    if (
      typeof av === "string" &&
      (av.includes("T") || av.match(/\d{4}-\d{2}-\d{2}/))
    ) {
      av = new Date(av).getTime() || 0;
      bv = new Date(bv).getTime() || 0;
      return sortDir === "asc" ? av - bv : bv - av;
    }
    if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  return { sorted, search, setSearch, sortCol, sortDir, handleSort };
}
