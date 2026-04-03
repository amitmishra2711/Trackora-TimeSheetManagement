import { useEffect, useState } from "react";
import { tasksApi, timesheetsApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  StatCard,
  Spinner,
  EmptyState,
  StatusBadge,
  PageHeader,
} from "../../components/common";
import { CheckSquare, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tasksApi.getMine().then((r) => setTasks(r.data || [])),
      timesheetsApi.getMine().then((r) => setTimesheets(r.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "InProgress").length;
  const thisWeekHours = timesheets
    .filter((ts) => {
      const d = new Date(ts.date);
      const now = new Date();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Tasks"
          value={tasks.length}
          icon={CheckSquare}
          color="indigo"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Hours This Week"
          value={`${thisWeekHours.toFixed(1)}h`}
          icon={Clock}
          color="blue"
        />
      </div>

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

export function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    tasksApi
      .getMine()
      .then((r) => setTasks(r.data || []))
      .catch(() => toast.error("Failed"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await tasksApi.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast.success(`Task marked as ${status}`);
    } catch {
      toast.error("Failed");
    } finally {
      setUpdating(null);
    }
  };

  const STATUSES = ["Todo", "InProgress", "Completed"];

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${tasks.length} tasks assigned to you`}
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
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
