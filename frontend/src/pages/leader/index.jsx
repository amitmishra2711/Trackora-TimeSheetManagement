import { useEffect, useState } from "react";
import { teamsApi, timesheetsApi, tasksApi, reportsApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  StatCard,
  Spinner,
  EmptyState,
  StatusBadge,
  Modal,
  PageHeader,
} from "../../components/common";
import {
  Users,
  CheckSquare,
  Clock,
  FileText,
  Plus,
  UserMinus,
} from "lucide-react";
import toast from "react-hot-toast";

export function LeaderDashboard() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const teamRes = await teamsApi.getLeading();
        const myTeam = teamRes.data?.[0];
        setTeam(myTeam);
        if (myTeam) {
          const tsRes = await timesheetsApi.getByTeam(myTeam.id);
          setTimesheets(tsRes.data || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pending = timesheets.filter((t) => t.status === "Pending").length;
  const approved = timesheets.filter((t) => t.status === "Approved").length;

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leader Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Team Members"
          value={team?.members?.length || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Pending Timesheets"
          value={pending}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          label="Approved"
          value={approved}
          icon={CheckSquare}
          color="green"
        />
        <StatCard
          label="Total Logged"
          value={timesheets.length}
          icon={FileText}
          color="indigo"
        />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          My Team — {team?.name || "No team assigned"}
        </h3>
        {team?.members?.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                  {m.firstName[0]}
                  {m.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No team members" icon={Users} />
        )}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
          <span className="badge-pending">{pending} pending</span>
        </div>
        <div className="table-wrap rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.filter((t) => t.status === "Pending").slice(0, 5)
                .length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    No pending timesheets
                  </td>
                </tr>
              ) : (
                timesheets
                  .filter((t) => t.status === "Pending")
                  .slice(0, 5)
                  .map((ts) => (
                    <tr key={ts.id}>
                      <td className="font-medium">{ts.userName}</td>
                      <td>{ts.projectName}</td>
                      <td>{new Date(ts.date).toLocaleDateString()}</td>
                      <td>{ts.hoursWorked}h</td>
                      <td>
                        <StatusBadge status={ts.status} />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function LeaderTeamPage() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamsApi.getLeading();
      setTeam(res.data?.[0] || null);
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeMember = async (userId) => {
    if (!team) return;
    try {
      await teamsApi.removeMember(team.id, userId);
      toast.success("Member removed");
      load();
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  return (
    <div>
      <PageHeader
        title={`My Team: ${team?.name || "—"}`}
        subtitle={`Leader: ${team?.leaderName || "—"}`}
      />
      <div className="card">
        {!team?.members?.length ? (
          <EmptyState message="No team members" icon={Users} />
        ) : (
          <div className="divide-y divide-gray-100">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                    {m.firstName[0]}
                    {m.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeMember(m.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <UserMinus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function LeaderReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    reportDate: new Date().toISOString().split("T")[0],
    summary: "",
    details: [],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const teamRes = await teamsApi.getLeading();
        const myTeam = teamRes.data?.[0];
        setTeam(myTeam);
        if (myTeam) {
          const reps = await reportsApi.getAll(myTeam.id);
          setReports(reps.data);
          const tsk = await tasksApi.getAll({ page: 1, pageSize: 100 });
          setTasks(tsk.data?.items || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleTask = (taskId) => {
    setForm((f) => ({
      ...f,
      details: f.details.find((d) => d.taskId === taskId)
        ? f.details.filter((d) => d.taskId !== taskId)
        : [...f.details, { taskId, notes: "" }],
    }));
  };

  const setNote = (taskId, notes) => {
    setForm((f) => ({
      ...f,
      details: f.details.map((d) =>
        d.taskId === taskId ? { ...d, notes } : d,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team) return toast.error("No team found");
    setSaving(true);
    try {
      await reportsApi.create({ ...form, teamId: team.id });
      toast.success("Report submitted!");
      setModal(false);
      const reps = await reportsApi.getAll(team.id);
      setReports(reps.data);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Daily Reports"
        subtitle="Submit end-of-day team reports"
        action={
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={16} /> Submit Report
          </button>
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : reports.length === 0 ? (
        <div className="card">
          <EmptyState message="No reports yet" icon={FileText} />
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(r.reportDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{r.summary}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {r.details?.length || 0} tasks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Submit Daily Report"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Report Date</label>
            <input
              type="date"
              className="input"
              value={form.reportDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, reportDate: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Summary</label>
            <textarea
              className="input"
              rows={4}
              placeholder="What did the team accomplish today?"
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Tasks to include</label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2">
              {tasks.map((t) => (
                <div key={t.id}>
                  <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.details.find((d) => d.taskId === t.id)}
                      onChange={() => toggleTask(t.id)}
                    />
                    <span className="text-sm font-medium">{t.title}</span>
                    <span className="text-xs text-gray-400">
                      {t.projectName}
                    </span>
                  </label>
                  {form.details.find((d) => d.taskId === t.id) && (
                    <input
                      className="input mt-1 text-xs ml-6"
                      placeholder="Notes..."
                      value={
                        form.details.find((d) => d.taskId === t.id)?.notes || ""
                      }
                      onChange={(e) => setNote(t.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
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
              {saving ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export { default as LeaderTimesheets } from "../admin/Timesheets";
export { default as LeaderTasks } from "../admin/Tasks";
