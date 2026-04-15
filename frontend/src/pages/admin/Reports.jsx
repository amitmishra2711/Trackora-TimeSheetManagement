import { useEffect, useState } from "react";
import { reportsApi } from "../../api";
import {
  Spinner,
  EmptyState,
  StatusBadge,
  PageHeader,
  
  Modal,
} from "../../components/common";
import { FileSpreadsheet, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";

export function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [exportLoading, setExportLoading] = useState(null);
  const [filters, setFilters] = useState({ from: "", to: "" });

  useEffect(() => {
    reportsApi
      .getAll()
      .then((r) => setReports(r.data))
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (type) => {
    setExportLoading(type);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res =
        type === "excel"
          ? await reportsApi.exportExcel(params)
          : await reportsApi.exportPdf(params);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `timesheets.${type === "excel" ? "xlsx" : "html"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${type === "excel" ? "Excel" : "PDF"}`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Daily reports and exports" />

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Export Timesheets</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">From</label>
            <input
              type="date"
              className="input w-auto"
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              className="input w-auto"
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
            />
          </div>
          <button
            onClick={() => handleExport("excel")}
            disabled={!!exportLoading}
            className="btn-success"
          >
            <FileSpreadsheet size={16} />{" "}
            {exportLoading === "excel" ? "Exporting..." : "Export Excel"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!exportLoading}
            className="btn-secondary"
          >
            <FileText size={16} />{" "}
            {exportLoading === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Daily Reports from Team Leaders
          </h3>
        </div>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState message="No reports submitted yet" />
        ) : (
          <div className="table-wrap rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Leader</th>
                  <th>Date</th>
                  <th>Summary</th>
                  <th>Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.teamName}</td>
                    <td>{r.leaderName}</td>
                    <td>{new Date(r.reportDate).toLocaleDateString()}</td>
                    <td className="max-w-xs truncate text-gray-500">
                      {r.summary}
                    </td>
                    <td>{r.details?.length || 0} tasks</td>
                    <td>
                      <button
                        onClick={() => setSelected(r)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Report — ${selected?.teamName}`}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Leader:</span>{" "}
                <span className="font-medium">{selected.leaderName}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>{" "}
                <span className="font-medium">
                  {new Date(selected.reportDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Submitted:</span>{" "}
                <span className="font-medium">
                  {new Date(selected.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-1">Summary</p>
              <p className="text-sm text-gray-600">{selected.summary}</p>
            </div>
            {selected.details?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Task Notes
                </p>
                <div className="space-y-2">
                  {selected.details.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 border border-gray-100 rounded-lg"
                    >
                      <p className="text-sm font-medium">{d.taskTitle}</p>
                      {d.notes && (
                        <p className="text-xs text-gray-500 mt-1">{d.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
