import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectsApi, tasksApi, timesheetsApi, reportsApi } from "../../api";
import {
  Modal,
  Spinner,
  EmptyState,
  StatusBadge,
} from "../../components/common";
import {
  ArrowLeft,
  Plus,
  Users,
  Clock,
  CheckSquare,
  X,
  ChevronRight,
  User,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

const PRIORITIES = ["Low", "Medium", "High"];

function QuickTaskForm({
  projectId,
  projectName,
  employees,
  onSave,
  onClose,
  loading,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, projectId, assignedTo: Number(form.assignedTo) });
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Project</label>
        <input
          className="input bg-gray-50 text-gray-500 cursor-not-allowed"
          value={projectName}
          readOnly
        />
      </div>
      <div>
        <label className="label">Task Title</label>
        <input
          className="input"
          value={form.title}
          onChange={set("title")}
          placeholder="Enter task title..."
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
          placeholder="Optional description..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Assign To</label>
          <select
            className="input"
            value={form.assignedTo}
            onChange={set("assignedTo")}
            required
          >
            <option value="">Select member...</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
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
      </div>
      <div>
        <label className="label">Due Date</label>
        <input
          type="date"
          className="input"
          value={form.dueDate}
          onChange={set("dueDate")}
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}

function MemberTasksModal({ data, onClose }) {
  if (!data) return null;
  const { member, tasks } = data;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "InProgress").length;
  const todo = tasks.filter((t) => t.status === "Todo").length;

  const priorityColor = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };
  const statusColor = {
    Completed: "bg-green-100 text-green-700",
    InProgress: "bg-blue-100 text-blue-700",
    Todo: "bg-gray-100 text-gray-600",
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 p-4 border-b border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">{completed}</p>
              <p className="text-xs text-green-500 mt-0.5">Completed</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{inProgress}</p>
              <p className="text-xs text-blue-500 mt-0.5">In Progress</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-700">{todo}</p>
              <p className="text-xs text-yellow-500 mt-0.5">Todo</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tasks.length === 0 ? (
              <EmptyState
                message="No tasks assigned to this member in this project"
                icon={CheckSquare}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="px-6 py-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            priorityColor[t.priority] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className="text-xs text-gray-400">
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                        statusColor[t.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MemberTimesheetDrawer({ member, projectId, onClose }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!member) return;
    setLoading(true);
    timesheetsApi
      .getByMemberAndProject(member.id, projectId)
      .then((r) => setTimesheets(r.data || []))
      .catch(() => toast.error("Failed to load timesheets"))
      .finally(() => setLoading(false));
  }, [member, projectId]);

  const totalHours = timesheets.reduce(
    (sum, ts) => sum + Number(ts.hoursWorked),
    0,
  );
  const approved = timesheets.filter((t) => t.status === "Approved").length;
  const pending = timesheets.filter((t) => t.status === "Pending").length;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await reportsApi.exportExcel({
        userId: member.id,
        projectId,
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${member.firstName}_${member.lastName}_timesheets.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!member) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700">
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={exporting || timesheets.length === 0}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                <FileSpreadsheet size={14} />
                {exporting ? "Exporting..." : "Export Excel"}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-100">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-indigo-700">
                {totalHours.toFixed(1)}h
              </p>
              <p className="text-xs text-indigo-500 mt-0.5">Total Hours</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">{approved}</p>
              <p className="text-xs text-green-500 mt-0.5">Approved</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-yellow-700">{pending}</p>
              <p className="text-xs text-yellow-500 mt-0.5">Pending</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner size={28} />
              </div>
            ) : timesheets.length === 0 ? (
              <EmptyState
                message="No timesheets for this member in this project"
                icon={Clock}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {timesheets.map((ts) => (
                  <div
                    key={ts.id}
                    className="px-6 py-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ts.taskTitle}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(ts.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {ts.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {ts.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-700">
                        {ts.hoursWorked}h
                      </span>
                      <StatusBadge status={ts.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTaskMember, setSelectedTaskMember] = useState(null);

  const allMembers =
    project?.teams
      ?.flatMap((t) => t.members || [])
      .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i) || [];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projRes, taskRes] = await Promise.all([
          projectsApi.getById(id),
          tasksApi.getByProject(id),
        ]);
        setProject(projRes.data);
        setTasks(taskRes.data || []);
      } catch {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCreateTask = async (form) => {
    setSavingTask(true);
    try {
      await tasksApi.create(form);
      toast.success("Task created!");
      setTaskModal(false);
      const res = await tasksApi.getByProject(id);
      setTasks(res.data || []);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create task");
    } finally {
      setSavingTask(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );

  if (!project)
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <p>Project not found.</p>
      </div>
    );

  const tasksByMember = (memberId) =>
    tasks.filter((t) => t.assignedTo === memberId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/projects")}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 mt-0.5">
              {project.description}
            </p>
          )}
        </div>
        <button onClick={() => setTaskModal(true)} className="btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Teams</p>
            <p className="text-xl font-bold text-gray-900">
              {project.teams?.length || 0}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <CheckSquare size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Tasks</p>
            <p className="text-xl font-bold text-gray-900">{tasks.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-xl">
            <User size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Members</p>
            <p className="text-xl font-bold text-gray-900">
              {allMembers.length}
            </p>
          </div>
        </div>
      </div>

      {project.teams?.length === 0 ? (
        <div className="card">
          <EmptyState
            message="No teams assigned to this project"
            icon={Users}
          />
        </div>
      ) : (
        project.teams?.map((team) => (
          <div key={team.id} className="card overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{team.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Leader: {team.leaderName}
                </p>
              </div>
              <span className="badge bg-indigo-50 text-indigo-700">
                {team.members?.length || 0} members
              </span>
            </div>

            {!team.members?.length ? (
              <div className="py-8">
                <EmptyState message="No members in this team" icon={User} />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {team.members.map((member) => {
                  const memberTasks = tasksByMember(member.id);
                  const completedCount = memberTasks.filter(
                    (t) => t.status === "Completed",
                  ).length;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                          <CheckSquare size={13} />
                          <span>
                            {completedCount}/{memberTasks.length} tasks
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            setSelectedTaskMember({
                              member,
                              tasks: memberTasks,
                            })
                          }
                          className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckSquare size={13} />
                          Tasks
                          <ChevronRight size={13} />
                        </button>

                        <button
                          onClick={() => setSelectedMember(member)}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Clock size={13} />
                          Timesheets
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}

      {tasks.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">
              All Tasks in this Project
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium max-w-xs truncate">{t.title}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={taskModal}
        onClose={() => setTaskModal(false)}
        title="Create Task"
        size="lg"
      >
        <QuickTaskForm
          projectId={Number(id)}
          projectName={project.name}
          employees={allMembers}
          onSave={handleCreateTask}
          onClose={() => setTaskModal(false)}
          loading={savingTask}
        />
      </Modal>

      <MemberTasksModal
        data={selectedTaskMember}
        onClose={() => setSelectedTaskMember(null)}
      />

      <MemberTimesheetDrawer
        member={selectedMember}
        projectId={Number(id)}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
