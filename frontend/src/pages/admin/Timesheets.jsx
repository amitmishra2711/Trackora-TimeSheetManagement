  import { useEffect, useState, useCallback } from "react";
  import { timesheetsApi, projectsApi, tasksApi } from "../../api";
  import {
    Modal,
    ConfirmDialog,
    Pagination,
    PageHeader,
    ClickableText,
    ExpandableText,
    
    Spinner,
    EmptyState,
    StatusBadge,
  } from "../../components/common";
  import {
    Plus,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Filter,
    X,
  } from "lucide-react";
  import toast from "react-hot-toast";
  import { useAuth } from "../../context/AuthContext";
  import { useNavigate } from "react-router-dom";

  function TimesheetForm({
    initial,
    projects,
    tasks,
    onSave,
    onClose,
    loading,
    isEdit,
  }) {
    const [form, setForm] = useState({
      projectId: initial?.projectId || "",
      taskId: initial?.taskId || "",
      date: initial?.date
        ? initial.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      hoursWorked: initial?.hoursWorked || "",
      description: initial?.description || "",
    });
    const [filteredTasks, setFilteredTasks] = useState([]);

    useEffect(() => {
      if (form.projectId)
        setFilteredTasks(
          tasks.filter((t) => t.projectId === Number(form.projectId)),
        );
      else setFilteredTasks([]);
    }, [form.projectId, tasks]);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...form,
            projectId: Number(form.projectId),
            taskId: Number(form.taskId),
            hoursWorked: parseFloat(form.hoursWorked),
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="label">Project</label>
          <select
            className="input"
            value={form.projectId}
            onChange={(e) =>
              setForm((f) => ({ ...f, projectId: e.target.value, taskId: "" }))
            }
            required
          >
            <option value="">Select project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Task</label>
          <select
            className="input"
            value={form.taskId}
            onChange={set("taskId")}
            required
            disabled={!form.projectId}
          >
            <option value="">Select task...</option>
            {filteredTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={set("date")}
              required
            />
          </div>
          <div>
            <label className="label">Hours Worked</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              className="input"
              value={form.hoursWorked}
              onChange={set("hoursWorked")}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={set("description")}
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : isEdit ? "Update" : "Log Time"}
          </button>
        </div>
      </form>
    );
  }

  export default function TimesheetsPage({
    leaderView = false,
    employeeView = false,
  }) {
    const { user, isAdmin, isLeader, isEmployee } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [search, setSearch] = useState("");
    const [filterProject, setFilterProject] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState("desc");

    const handleSort = (col) => {
      if (col === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortBy(col);
        setSortDir("desc");
      }
    };

    const load = useCallback(async () => {
      setLoading(true);
      try {
        let res;
        if (isEmployee) {
          res = await timesheetsApi.getMine();
          let data = Array.isArray(res.data) ? res.data : [];

          if (search)
            data = data.filter(
              (ts) =>
                ts.projectName?.toLowerCase().includes(search.toLowerCase()) ||
                ts.taskTitle?.toLowerCase().includes(search.toLowerCase()) ||
                ts.description?.toLowerCase().includes(search.toLowerCase()),
            );
          if (filterProject)
            data = data.filter((ts) => ts.projectId === Number(filterProject));
          if (filterStatus)
            data = data.filter((ts) => ts.status === filterStatus);
          if (filterDateFrom)
            data = data.filter(
              (ts) => new Date(ts.date) >= new Date(filterDateFrom),
            );
          if (filterDateTo)
            data = data.filter(
              (ts) => new Date(ts.date) <= new Date(filterDateTo),
            );
        
          data.sort((a, b) => {
            let av =
              a[
                sortBy === "date"
                  ? "date"
                  : sortBy === "project"
                  ? "projectName"
                  : sortBy === "task"
                  ? "taskTitle"
                  : "hoursWorked"
              ];
            let bv =
              b[
                sortBy === "date"
                  ? "date"
                  : sortBy === "project"
                  ? "projectName"
                  : sortBy === "task"
                  ? "taskTitle"
                  : "hoursWorked"
              ];
            if (typeof av === "string" && av.includes("T"))
              return sortDir === "desc"
                ? new Date(bv) - new Date(av)
                : new Date(av) - new Date(bv);
            return sortDir === "desc"
              ? String(bv).localeCompare(String(av))
              : String(av).localeCompare(String(bv));
          });
          setItems(data);
          setTotalCount(data.length);
          setTotalPages(1);
        } else if (isLeader) {
          res = await timesheetsApi.getByMyTeams();
          let data = Array.isArray(res.data) ? res.data : [];
          if (search)
            data = data.filter(
              (ts) =>
                ts.userName?.toLowerCase().includes(search.toLowerCase()) ||
                ts.projectName?.toLowerCase().includes(search.toLowerCase()) ||
                ts.taskTitle?.toLowerCase().includes(search.toLowerCase()),
            );
          if (filterProject)
            data = data.filter((ts) => ts.projectId === Number(filterProject));
          if (filterStatus)
            data = data.filter((ts) => ts.status === filterStatus);
          if (filterDateFrom)
            data = data.filter(
              (ts) => new Date(ts.date) >= new Date(filterDateFrom),
            );
          if (filterDateTo)
            data = data.filter(
              (ts) => new Date(ts.date) <= new Date(filterDateTo),
            );
          data.sort((a, b) => {
            let av =
              sortBy === "username"
                ? a.userName
                : sortBy === "project"
                ? a.projectName
                : sortBy === "task"
                ? a.taskTitle
                : a.date;
            let bv =
              sortBy === "username"
                ? b.userName
                : sortBy === "project"
                ? b.projectName
                : sortBy === "task"
                ? b.taskTitle
                : b.date;
            if (typeof av === "string" && av.includes("T"))
              return sortDir === "desc"
                ? new Date(bv) - new Date(av)
                : new Date(av) - new Date(bv);
            return sortDir === "desc"
              ? String(bv).localeCompare(String(av))
              : String(av).localeCompare(String(bv));
          });
          setItems(data);
          setTotalCount(data.length);
          setTotalPages(1);
        } else {
          res = await timesheetsApi.getAll({
            page,
            pageSize: 15,
            search: search || undefined,
            sortBy: sortBy || undefined,
            sortDir: sortDir || undefined,
            
          });
          const d = res.data;
         let data = d.items || [];

if (search)
  data = data.filter(
    (ts) =>
      ts.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      ts.taskTitle?.toLowerCase().includes(search.toLowerCase()) ||
      ts.description?.toLowerCase().includes(search.toLowerCase())
  );

if (filterProject)
  data = data.filter((ts) => ts.projectId === Number(filterProject));

if (filterStatus)
  data = data.filter(
    (ts) => ts.status?.toLowerCase() === filterStatus.toLowerCase()
  );

if (filterDateFrom)
  data = data.filter(
    (ts) => new Date(ts.date) >= new Date(filterDateFrom)
  );

if (filterDateTo)
  data = data.filter(
    (ts) => new Date(ts.date) <= new Date(filterDateTo)
  );

setItems(data);
setTotalCount(data.length);
setTotalPages(1);
          setTotalCount(d.totalCount || 0);
          setTotalPages(d.totalPages || 1);
        }
      } catch {
        toast.error("Failed to load timesheets");
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      filterProject,
      filterStatus,
      filterDateFrom,
      filterDateTo,
      sortBy,
      sortDir,
      isAdmin,
      isLeader,
      isEmployee,
    ]);

    useEffect(() => {
      load();
    }, [load]);

    useEffect(() => {
      const loadMeta = async () => {
        try {
          const pRes = isEmployee
            ? await projectsApi.getMine()
            : await projectsApi.getAll({ page: 1, pageSize: 100 });
          setProjects(
            Array.isArray(pRes.data) ? pRes.data : pRes.data?.items || [],
          );
          const tRes = await tasksApi.getMine();
          setTasks(Array.isArray(tRes.data) ? tRes.data : tRes.data?.items || []);
        } catch {}
      };
      loadMeta();
    }, []);

    const handleSave = async (form) => {
      setSaving(true);
      try {
        if (modal?.id) {
          await timesheetsApi.update(modal.id, form);
          toast.success("Updated");
        } else {
          await timesheetsApi.create(form);
          toast.success("Time logged!");
        }
        setModal(null);
        load();
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed");
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async () => {
      setSaving(true);
      try {
        await timesheetsApi.delete(deleteTarget.id);
        toast.success("Deleted");
        setDeleteTarget(null);
        load();
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed");
      } finally {
        setSaving(false);
      }
    };

    const handleApprove = async (id, status) => {
      try {
        await timesheetsApi.approve(id, status);
        toast.success(`Timesheet ${status}`);
        load();
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed");
      }
    };

    const clearFilters = () => {
      setSearch("");
      setFilterProject("");
      setFilterStatus("");
      setFilterDateFrom("");
      setFilterDateTo("");
      setPage(1);
    };
    const activeFilters = [
      search,
      filterProject,
      filterStatus,
      filterDateFrom,
      filterDateTo,
    ].filter(Boolean).length;

    const SortTh = ({ col, label }) => (
      <th
        className="px-4 py-3 font-medium cursor-pointer select-none hover:bg-gray-100 transition-colors"
        onClick={() => handleSort(col)}
      >
        <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-gray-500">
          {label}
          <span className="flex flex-col ml-0.5">
            <span
              className={`text-[8px] leading-none ${
                sortBy === col && sortDir === "asc"
                  ? "text-indigo-600"
                  : "text-gray-300"
              }`}
            >
              ▲
            </span>
            <span
              className={`text-[8px] leading-none ${
                sortBy === col && sortDir === "desc"
                  ? "text-indigo-600"
                  : "text-gray-300"
              }`}
            >
              ▼
            </span>
          </span>
        </div>
      </th>
    );

    return (
      <div>
        <PageHeader
          title={
            isEmployee
              ? "My Timesheets"
              : isLeader
              ? "Team Timesheets"
              : "All Timesheets"
          }
          subtitle={`${totalCount} entries`}
          action={
            isEmployee && (
              <button onClick={() => setModal({})} className="btn-primary">
                <Plus size={16} /> Log Time
              </button>
            )
          }
        />

        <div className="card mb-4">
          <div className="p-4 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <input
                className="input pl-3 w-full"
                placeholder={
                  isEmployee
                    ? "Search by project, task, description..."
                    : isLeader
                    ? "Search by employee, project, task..."
                    : "Search by employee, project, task, description..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${
                showFilters
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : ""
              }`}
            >
              <Filter size={14} /> Filters
              {activeFilters > 0 && (
                <span className="bg-indigo-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {!isEmployee && (
                <div>
                  <label className="label text-xs">Project</label>
                  <select
                    className="input text-sm"
                    value={filterProject}
                    onChange={(e) => {
                      setFilterProject(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Projects</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="label text-xs">Status</label>
                <select
                  className="input text-sm"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  {["Pending", "Approved", "Rejected"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Date From</label>
                <input
                  type="date"
                  className="input text-sm"
                  value={filterDateFrom}
                  onChange={(e) => {
                    setFilterDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div>
                <label className="label text-xs">Date To</label>
                <input
                  type="date"
                  className="input text-sm"
                  value={filterDateTo}
                  onChange={(e) => {
                    setFilterDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="card rounded-none border-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left ">
              <thead className="bg-gray-50 text-gray-300 text-xs border-b">
                <tr className="text-gray-300 bg-black">
                  {!isEmployee && <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    Employee
                  </th>}
                  <th className="px-4 py-3 text-xs  uppercase tracking-wider text-gray-100 font-bolder">
                    Project
                  </th>
                 <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    TASK
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    DATE
                  </th>
                  
                 
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    HOURS
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    Description
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    STATUS
                  </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-100 font-bolder">
                    ACTION
                  </th>
                  
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={isEmployee ? 7 : 8}
                      className="text-center py-10"
                    >
                      <Spinner />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={isEmployee ? 7 : 8}>
                      <EmptyState message="No timesheets found" />
                    </td>
                  </tr>
                ) : (
                  items.map((ts) => (
                    <tr
                      key={ts.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {!isEmployee && (
                        <td className="px-4 py-3">
                          <ClickableText className="under"
                            onClick={
                              isAdmin ? () => navigate(`/admin/users`) : undefined
                            }
                          >
                            {ts.userName}
                          </ClickableText>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <ClickableText
                          onClick={
                            isAdmin
                              ? () => navigate(`/admin/projects/${ts.projectId}`)
                              : undefined
                          }
                        >
                          {ts.projectName}
                        </ClickableText>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">
                        <ClickableText onClick={ isAdmin
                              ? () => navigate(`/admin/tasks`)
                              : undefined}>
                          {ts.taskTitle}
                        </ClickableText>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(ts.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {ts.hoursWorked}h
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                        <ExpandableText
                          text={ts.description || "—"}
                          limit={10}
                          className="text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ts.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isEmployee && ts.canEdit && (
                            <>
                              <button
                                onClick={() => setModal(ts)}
                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(ts)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {(isLeader || isAdmin) && ts.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(ts.id, "Approved")}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600"
                                title="Approve"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleApprove(ts.id, "Rejected")}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                                title="Reject"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4">
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          )}
        </div>

        <Modal
          open={!!modal}
          onClose={() => setModal(null)}
          title={modal?.id ? "Edit Timesheet" : "Log Time"}
          size="lg"
        >
          <TimesheetForm
            initial={modal?.id ? modal : null}
            projects={projects}
            tasks={tasks}
            onSave={handleSave}
            onClose={() => setModal(null)}
            loading={saving}
            isEdit={!!modal?.id}
          />
        </Modal>
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={saving}
          title="Delete Timesheet"
          message="Delete this timesheet entry?"
        />
      </div>
    );
  }
