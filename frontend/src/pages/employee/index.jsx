import { useEffect, useState } from "react";
import { tasksApi, timesheetsApi, projectsApi } from "../../api";
// selfAssign uses the dedicated employee endpoint that validates project membership
import { useAuth } from "../../context/AuthContext";
import {
  StatCard,
  Spinner,
  EmptyState,
  StatusBadge,
  PageHeader,
  Modal,
} from "../../components/common";
import {
  CheckSquare,
  Clock,
  FolderKanban,
  TrendingUp,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES_UPDATE = ["Todo", "InProgress", "Completed"];

// ─── EMPLOYEE DASHBOARD ───────────────────────────────────
export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tasksApi.getMine().then((r) => setTasks(r.data || [])),
      timesheetsApi.getMine().then((r) => setTimesheets(r.data || [])),
      projectsApi
        .getMine()
        .then((r) => setProjects(Array.isArray(r.data) ? r.data : [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "InProgress").length;
  const thisWeekHours = timesheets
    .filter((ts) => {
      const d = new Date(ts.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    })
    .reduce((sum, ts) => sum + Number(ts.hoursWorked), 0);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.firstName}!
        </p>
      </div>

      {/* Clickable stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate("/employee/tasks")}>
          <StatCard
            label="My Tasks"
            value={tasks.length}
            icon={CheckSquare}
            color="indigo"
          />
        </button>
        <button onClick={() => navigate("/employee/tasks")}>
          <StatCard
            label="In Progress"
            value={inProgress}
            icon={TrendingUp}
            color="yellow"
          />
        </button>
          <button onClick={() => navigate("/employee/tasks")}>  
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          color="green"
          
        />
        </button>
        <button onClick={() => navigate("/employee/timesheets")}>
          <StatCard
            label="Hours This Week"
            value={`${thisWeekHours.toFixed(1)}h`}
            icon={Clock}
            color="blue"
          />
        </button>
      </div>
   
     

      {/* My Projects */}
      {projects.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">My Projects</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <FolderKanban size={14} className="text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : p.status === "Completed"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Tasks */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">My Tasks</h3>
        </div>
        {tasks.length === 0 ? (
          <EmptyState message="No tasks assigned yet" icon={CheckSquare} />
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.priority === "High"
                        ? "bg-red-500"
                        : t.priority === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t.title}
                    </p>
                    <p className="text-xs text-gray-500">{t.projectName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.dueDate && (
                    <span className="text-xs text-gray-400">
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Timesheets */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Timesheets</h3>
        </div>
        {timesheets.length === 0 ? (
          <EmptyState message="No timesheets logged yet" icon={Clock} />
        ) : (
          <div className="table-wrap rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Task</th>
                  <th>Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {timesheets.slice(0, 5).map((ts) => (
                  <tr key={ts.id}>
                    <td>{new Date(ts.date).toLocaleDateString()}</td>
                    <td>{ts.projectName}</td>
                    <td className="max-w-xs truncate">{ts.taskTitle}</td>
                    <td className="font-medium">{ts.hoursWorked}h</td>
                    <td>
                      <StatusBadge status={ts.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EMPLOYEE TASKS PAGE ──────────────────────────────────
// Employee can view assigned tasks AND self-assign tasks on their own projects
export function EmployeeTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]); // projects employee belongs to
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [taskRes, projRes] = await Promise.all([
        tasksApi.getMine(),
        projectsApi.getMine(),
      ]);
      setTasks(taskRes.data || []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await tasksApi.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Failed");
    } finally {
      setUpdating(null);
    }
  };

  const handleSelfAssign = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      await tasksApi.selfAssign({
        ...form,
        projectId: Number(form.projectId),
        assignedTo: user.id, // always assign to self
      });
      toast.success("Task created and assigned to you!");
      setModal(false);
      setForm({
        projectId: "",
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
      });
      loadAll();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${tasks.length} tasks assigned to you`}
        action={
          projects.length > 0 && (
            <button onClick={() => setModal(true)} className="btn-primary">
              <Plus size={16} /> Self-Assign Task
            </button>
          )
        }
      />

      {tasks.length === 0 ? (
        <div className="card">
          <EmptyState message="No tasks assigned" icon={CheckSquare} />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="card p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    t.priority === "High"
                      ? "bg-red-500"
                      : t.priority === "Medium"
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{t.title}</p>
                    <StatusBadge status={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                  {t.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Project: {t.projectName}</span>
                    {t.dueDate && (
                      <span>
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span>By: {t.assignedByName}</span>
                  </div>
                </div>
              </div>
              <select
                value={t.status}
                disabled={updating === t.id}
                onChange={(e) => updateStatus(t.id, e.target.value)}
                className="input w-36 text-xs"
              >
                {STATUSES_UPDATE.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Self-Assign Modal — only projects employee belongs to */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Self-Assign a Task"
        size="lg"
      >
        <form onSubmit={handleSelfAssign} className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
            This task will be assigned to you automatically.
          </div>
          <div>
            <label className="label">
              Project{" "}
              <span className="text-xs text-gray-400">
                (only your projects)
              </span>
            </label>
            <select
              className="input"
              value={form.projectId}
              onChange={(e) =>
                setForm((f) => ({ ...f, projectId: e.target.value }))
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
            <label className="label">Task Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="What do you need to do?"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Creating..." : "Assign to Me"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
