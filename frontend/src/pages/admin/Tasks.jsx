import { useEffect, useState } from "react";
import { tasksApi, projectsApi, usersApi, teamsApi } from "../../api";
import {
  Modal,
  ConfirmDialog,
  Pagination,
  PageHeader,
  SearchInput,
  Spinner,
  EmptyState,
  StatusBadge,
 
} from "../../components/common";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Todo", "InProgress", "Completed"];

function TaskForm({
  initial,
  projects,
  employees,
  onSave,
  onClose,
  loading,
  isEdit,
}) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    projectId: initial?.projectId || "",
    assignedTo: initial?.assignedTo || "",
    priority: initial?.priority || "Medium",
    status: initial?.status || "Todo",
    dueDate: initial?.dueDate ? initial.dueDate.split("T")[0] : "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...form,
          projectId: Number(form.projectId),
          assignedTo: Number(form.assignedTo),
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Title</label>
        <input
          className="input"
          value={form.title}
          onChange={set("title")}
          required
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={2}
          value={form.description}
          onChange={set("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Project</label>
          <select
            className="input"
            value={form.projectId}
            onChange={set("projectId")}
            required
            disabled={isEdit}
          >
            <option value="">Select...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Assign To</label>
          <select
            className="input"
            value={form.assignedTo}
            onChange={set("assignedTo")}
            required
          >
            <option value="">Select...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Priority</label>
          <select
            className="input"
            value={form.priority}
            onChange={set("priority")}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        {isEdit && (
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={set("status")}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">Due Date</label>
          <input
            type="date"
            className="input"
            value={form.dueDate}
            onChange={set("dueDate")}
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

export default function TasksPage() {
  const { isAdmin, isLeader } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Load dropdown data for the task form
  useEffect(() => {
    if (isAdmin) {
      // Admin sees all projects and all employees
      projectsApi
        .getAll({ page: 1, pageSize: 100 })
        .then((r) => setProjects(r.data.items || []))
        .catch(() => {});
      usersApi
        .getEmployees()
        .then((r) => setEmployees(r.data || []))
        .catch(() => {});
    } else if (isLeader) {
      // Leader form only shows their own team's projects and members
      teamsApi
        .getLeading()
        .then((r) => {
          const team = r.data?.[0];
          setEmployees(team?.members || []);
          projectsApi
            .getAll({ page: 1, pageSize: 100 })
            .then((pr) => setProjects(pr.data.items || []))
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, [isAdmin, isLeader]);

  // Load tasks — backend automatically filters by leader's team
  const load = async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getAll({ page, pageSize: 10, search });
      setData(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal?.id) {
        await tasksApi.update(modal.id, form);
        toast.success("Task updated");
      } else {
        await tasksApi.create(form);
        toast.success("Task created");
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
      await tasksApi.delete(deleteTarget.id);
      toast.success("Deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={
          isLeader
            ? `${data.totalCount} tasks in your team`
            : `${data.totalCount} tasks`
        }
        action={
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={16} /> New Task
          </button>
        }
      />

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={
              isLeader
                ? "Search by task title or project name..."
                : "Search by task title or project name..."
            }
          />
        </div>

        <div className="table-wrap rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <Spinner />
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      message={
                        isLeader
                          ? "No tasks found for your team"
                          : "No tasks found"
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.items.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium max-w-xs truncate">{t.title}</td>
                    <td className="text-gray-500">{t.projectName}</td>
                    <td>{t.assignedToName}</td>
                    <td>
                      <StatusBadge status={t.priority} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="text-gray-500">
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal(t)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPage={setPage}
          />
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.id ? "Edit Task" : "Create Task"}
        size="lg"
      >
        <TaskForm
          initial={modal?.id ? modal : null}
          projects={projects}
          employees={employees}
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
        title="Delete Task"
        message={`Delete task "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
