import { useEffect, useState } from "react";
import {
  teamsApi,
  timesheetsApi,
  tasksApi,
  reportsApi,
  projectsApi,
  usersApi,
} from "../../api";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

export function LeaderDashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]); // ALL teams this leader leads
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState(null); // which team card is expanded

  useEffect(() => {
    const load = async () => {
      try {
        const [teamRes, tsRes] = await Promise.all([
          teamsApi.getLeading(),
          timesheetsApi.getByMyTeams(),
        ]);
        const allTeams = teamRes.data || [];
        setTeams(allTeams);
        setTimesheets(tsRes.data || []);
        // Auto-expand first team
        if (allTeams.length > 0) setExpandedTeam(allTeams[0].id);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Aggregate stats across ALL teams
  const totalMembers = [
    ...new Map(
      teams.flatMap((t) => t.members || []).map((m) => [m.id, m]),
    ).values(),
  ].length;
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
          Welcome back, {user?.firstName}! You lead{" "}
          <span className="font-semibold text-indigo-600">
            {teams.length} team{teams.length !== 1 ? "s" : ""}
          </span>
          .
        </p>
      </div>

      {/* Stats across all teams */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Teams"
          value={teams.length}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Total Members"
          value={totalMembers}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Pending Approvals"
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
      </div>

      {/* One card per team — expandable */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <div className="card p-6">
            <EmptyState message="No teams assigned" icon={Users} />
          </div>
        ) : (
          teams.map((team) => {
            const isExpanded = expandedTeam === team.id;
            const teamTs = timesheets.filter((ts) =>
              (team.members || []).some((m) => m.id === ts.userId),
            );
            const teamPending = teamTs.filter(
              (t) => t.status === "Pending",
            ).length;

            return (
              <div key={team.id} className="card overflow-hidden">
                {/* Team header — click to expand/collapse */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
                  onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Users size={16} className="text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{team.name}</p>
                      <p className="text-xs text-gray-500">
                        {team.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {teamPending > 0 && (
                      <span className="badge-pending">
                        {teamPending} pending
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded: members grid */}
                {isExpanded && (
                  <div className="p-4">
                    {!team.members?.length ? (
                      <EmptyState
                        message="No members in this team"
                        icon={Users}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {team.members.map((m) => {
                          const memberTs = timesheets.filter(
                            (ts) => ts.userId === m.id,
                          );
                          const memberPending = memberTs.filter(
                            (ts) => ts.status === "Pending",
                          ).length;
                          const memberHours = memberTs.reduce(
                            (s, ts) => s + Number(ts.hoursWorked),
                            0,
                          );
                          return (
                            <div
                              key={m.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                            >
                              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                                {m.firstName[0]}
                                {m.lastName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {m.firstName} {m.lastName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-400">
                                    {memberHours.toFixed(1)}h logged
                                  </span>
                                  {memberPending > 0 && (
                                    <span className="text-xs text-yellow-600 font-medium">
                                      {memberPending} pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Pending Approvals (All Teams)
          </h3>
          <span className="badge-pending">{pending} pending</span>
        </div>
        <div className="overflow-x-auto">
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
              {timesheets.filter((t) => t.status === "Pending").slice(0, 8)
                .length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">
                    No pending timesheets
                  </td>
                </tr>
              ) : (
                timesheets
                  .filter((t) => t.status === "Pending")
                  .slice(0, 8)
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
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamsApi.getLeading();
      setTeams(res.data || []);
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeMember = async (teamId, userId) => {
    try {
      await teamsApi.removeMember(teamId, userId);
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
    <div className="space-y-6">
      <PageHeader
        title="My Teams"
        subtitle={`You lead ${teams.length} team${
          teams.length !== 1 ? "s" : ""
        }`}
      />

      {teams.length === 0 ? (
        <div className="card p-6">
          <EmptyState message="No teams assigned" icon={Users} />
        </div>
      ) : (
        teams.map((team) => (
          <div key={team.id} className="card overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{team.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {team.members?.length || 0} members
                </p>
              </div>
              <span className="badge bg-indigo-50 text-indigo-700">
                Team #{team.id}
              </span>
            </div>

            {!team.members?.length ? (
              <div className="py-8">
                <EmptyState message="No members in this team" icon={Users} />
              </div>
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
                      onClick={() => removeMember(team.id, m.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export function LeaderTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [teams, setTeams] = useState([]); 
  const [allMembers, setAllMembers] = useState([]); 
  const [projects, setProjects] = useState([]); 

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const teamRes = await teamsApi.getLeading();
        const myTeams = teamRes.data || [];
        setTeams(myTeams);

        const memberMap = new Map();
        myTeams
          .flatMap((t) => t.members || [])
          .forEach((m) => memberMap.set(m.id, m));
        setAllMembers([...memberMap.values()]);

        const projRes = await projectsApi.getAll({ page: 1, pageSize: 100 });
        const myTeamIds = new Set(myTeams.map((t) => t.id));
        const myProjects = (projRes.data.items || []).filter((p) =>
          p.teams?.some((t) => myTeamIds.has(t.id)),
        );
        setProjects(myProjects);

        const taskRes = await import("../../api").then((m) =>
          m.tasksApi.getAll({ page: 1, pageSize: 100 }),
        );
        setTasks(taskRes.data.items || []);
      } catch {
        toast.error("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal?.id) {
        await import("../../api").then((m) =>
          m.tasksApi.update(modal.id, form),
        );
        toast.success("Task updated");
      } else {
        await import("../../api").then((m) => m.tasksApi.create(form));
        toast.success("Task created");
      }
      setModal(null);
      const taskRes = await import("../../api").then((m) =>
        m.tasksApi.getAll({ page: 1, pageSize: 100 }),
      );
      setTasks(taskRes.data.items || []);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed");
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
        title="Tasks"
        subtitle={`${tasks.length} tasks across your teams`}
        action={
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={16} /> New Task
          </button>
        }
      />

      <div className="card">
        <div className="overflow-x-auto">
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="No tasks yet" icon={CheckSquare} />
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
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
                      <button
                        onClick={() => setModal(t)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.id ? "Edit Task" : "Create Task"}
        size="lg"
      >
        <LeaderTaskForm
          initial={modal?.id ? modal : null}
          projects={projects}
          members={allMembers}
          teams={teams}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}

function LeaderTaskForm({
  initial,
  projects,
  members,
  teams,
  onSave,
  onClose,
  loading,
}) {
  const PRIORITIES = ["Low", "Medium", "High"];
  const STATUSES = ["Todo", "InProgress", "Completed"];

  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    projectId: initial?.projectId || "",
    assignedTo: initial?.assignedTo || "",
    priority: initial?.priority || "Medium",
    status: initial?.status || "Todo",
    dueDate: initial?.dueDate ? initial.dueDate.split("T")[0] : "",
  });

  const [filteredMembers, setFilteredMembers] = useState(members);

  useEffect(() => {
    if (!form.projectId) {
      setFilteredMembers(members);
      return;
    }
    const selectedProject = projects.find(
      (p) => p.id === Number(form.projectId),
    );
    if (!selectedProject) {
      setFilteredMembers(members);
      return;
    }

    const projectTeamIds = new Set(
      (selectedProject.teams || []).map((t) => t.id),
    );
    const validMemberIds = new Set(
      teams
        .filter((t) => projectTeamIds.has(t.id))
        .flatMap((t) => t.members || [])
        .map((m) => m.id),
    );
    setFilteredMembers(members.filter((m) => validMemberIds.has(m.id)));
  }, [form.projectId, projects, members, teams]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEdit = !!initial?.id;

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
          <label className="label">
            Project{" "}
            <span className="text-xs text-gray-400">(your teams only)</span>
          </label>
          <select
            className="input"
            value={form.projectId}
            onChange={set("projectId")}
            required
            disabled={isEdit}
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
          <label className="label">
            Assign To{" "}
            <span className="text-xs text-gray-400">(your members only)</span>
          </label>
          <select
            className="input"
            value={form.assignedTo}
            onChange={set("assignedTo")}
            required
          >
            <option value="">Select member...</option>
            {filteredMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
          {form.projectId && filteredMembers.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              No members from your teams are on this project.
            </p>
          )}
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
          {loading ? "Saving..." : isEdit ? "Update" : "Create Task"}
        </button>
      </div>
    </form>
  );
}

export function LeaderReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
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
        const myTeams = teamRes.data || [];
        setTeams(myTeams);
        if (myTeams.length > 0) {
          setSelectedTeamId(myTeams[0].id);
          const reps = await reportsApi.getAll(myTeams[0].id);
          setReports(reps.data || []);
          const tsk = await import("../../api").then((m) =>
            m.tasksApi.getAll({ page: 1, pageSize: 100 }),
          );
          setTasks(tsk.data?.items || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;
    reportsApi
      .getAll(selectedTeamId)
      .then((r) => setReports(r.data || []))
      .catch(() => {});
  }, [selectedTeamId]);

  const toggleTask = (taskId) =>
    setForm((f) => ({
      ...f,
      details: f.details.find((d) => d.taskId === taskId)
        ? f.details.filter((d) => d.taskId !== taskId)
        : [...f.details, { taskId, notes: "" }],
    }));

  const setNote = (taskId, notes) =>
    setForm((f) => ({
      ...f,
      details: f.details.map((d) =>
        d.taskId === taskId ? { ...d, notes } : d,
      ),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return toast.error("Select a team first");
    setSaving(true);
    try {
      await reportsApi.create({ ...form, teamId: Number(selectedTeamId) });
      toast.success("Report submitted!");
      setModal(false);
      const reps = await reportsApi.getAll(selectedTeamId);
      setReports(reps.data || []);
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
        subtitle="Submit end-of-day reports for your teams"
        action={
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={16} /> Submit Report
          </button>
        }
      />

      {teams.length > 1 && (
        <div className="flex gap-2 mb-4">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTeamId === t.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : reports.length === 0 ? (
        <div className="card">
          <EmptyState message="No reports yet for this team" icon={FileText} />
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
          {teams.length > 1 && (
            <div>
              <label className="label">Select Team</label>
              <select
                className="input"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                required
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
