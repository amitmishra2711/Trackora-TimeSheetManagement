import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectsApi, tasksApi, timesheetsApi, teamsApi } from "../../api";
import {
  Spinner,
  EmptyState,
  StatusBadge,
  PageHeader,
  ExpandableText,
} from "../../components/common";
import {
  ArrowLeft,
  FolderKanban,
  Users,
  CheckSquare,
  Clock,
  ChevronRight,
  X,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────
// Page 1 — All projects assigned to leader's teams
// Route: /leader/projects
// ─────────────────────────────────────────────────────────
export function LeaderProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // getMine returns projects where leader's teams are assigned
        const res = await projectsApi.getMine();
        setProjects(Array.isArray(res.data) ? res.data : res.data?.items || []);
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle={`${projects.length} project${
          projects.length !== 1 ? "s" : ""
        } assigned to your teams`}
      />

      {projects.length === 0 ? (
        <div className="card">
          <EmptyState
            message="No projects assigned to your teams yet"
            icon={FolderKanban}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            // Count unique members across teams assigned to this project
            const memberCount = [
              ...new Map(
                (p.teams || [])
                  .flatMap((t) => t.members || [])
                  .map((m) => [m.id, m]),
              ).values(),
            ].length;

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/leader/projects/${p.id}`)}
                className="card p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-150 active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <FolderKanban size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {p.description && (
                      <p className="text-sm text-gray-500 mt-0.5 max-w-md truncate">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {p.teams?.length || 0} teams
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


export function LeaderProjectMembersPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [taskCounts, setTaskCounts] = useState({}); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, teamRes] = await Promise.all([
          projectsApi.getById(projectId),
          teamsApi.getLeading(),
        ]);
        const proj = projRes.data;
        const leaderTeams = teamRes.data || [];
        setProject(proj);
        setMyTeams(leaderTeams);

        const leaderTeamIds = new Set(leaderTeams.map((t) => t.id));
        const projectTeamIds = new Set((proj.teams || []).map((t) => t.id));

        const sharedTeamIds = [...leaderTeamIds].filter((id) =>
          projectTeamIds.has(id),
        );

        const memberMap = new Map();
        leaderTeams
          .filter((t) => sharedTeamIds.includes(t.id))
          .flatMap((t) => t.members || [])
          .forEach((m) => memberMap.set(m.id, m));

        const uniqueMembers = [...memberMap.values()];
        setMembers(uniqueMembers);

        if (uniqueMembers.length > 0) {
          const taskRes = await tasksApi.getByProject(projectId);
          const allTasks = taskRes.data || [];
          const counts = {};
          uniqueMembers.forEach((m) => {
            const memberTasks = allTasks.filter((t) => t.assignedTo === m.id);
            counts[m.id] = {
              total: memberTasks.length,
              completed: memberTasks.filter((t) => t.status === "Completed")
                .length,
              inProgress: memberTasks.filter((t) => t.status === "InProgress")
                .length,
              todo: memberTasks.filter((t) => t.status === "Todo").length,
            };
          });
          setTaskCounts(counts);
        }
      } catch {
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  if (!project)
    return (
      <div className="flex justify-center py-20 text-gray-400">
        <p>Project not found.</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/leader/projects")}
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
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Your Members</p>
            <p className="text-xl font-bold text-gray-900">{members.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <CheckSquare size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Tasks</p>
            <p className="text-xl font-bold text-gray-900">
              {Object.values(taskCounts).reduce((s, c) => s + c.total, 0)}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-yellow-50 rounded-xl">
            <Clock size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-xl font-bold text-gray-900">
              {Object.values(taskCounts).reduce((s, c) => s + c.inProgress, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Team Members in this Project
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Click a member to view their tasks and timesheets
          </p>
        </div>
        {members.length === 0 ? (
          <EmptyState
            message="None of your team members are in this project"
            icon={Users}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((m) => {
              const c = taskCounts[m.id] || {
                total: 0,
                completed: 0,
                inProgress: 0,
                todo: 0,
              };
              const pct =
                c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
              return (
                <div
                  key={m.id}
                  onClick={() =>
                    navigate(`/leader/projects/${projectId}/member/${m.id}`)
                  }
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
                      {m.firstName[0]}
                      {m.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Task progress bar */}
                    <div className="hidden sm:block w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {c.completed}/{c.total} tasks
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Mini task badges */}
                    <div className="flex items-center gap-1.5">
                      {c.todo > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {c.todo} todo
                        </span>
                      )}
                      {c.inProgress > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {c.inProgress} active
                        </span>
                      )}
                      {c.completed > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {c.completed} done
                        </span>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export function LeaderMemberDetailPage() {
  const { projectId, memberId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [member, setMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [exporting, setExporting] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, taskRes, tsRes, teamRes] = await Promise.all([
          projectsApi.getById(projectId),
          tasksApi.getByUser(memberId),
          timesheetsApi.getByMemberAndProject(memberId, projectId),
          teamsApi.getLeading(),
        ]);

        setProject(projRes.data);
        setTasks(
          (taskRes.data || []).filter((t) => t.projectId === Number(projectId)),
        );
        setTimesheets(tsRes.data || []);

        const allMembers = (teamRes.data || []).flatMap((t) => t.members || []);
        const found = allMembers.find((m) => m.id === Number(memberId));
        setMember(found || null);
      } catch {
        toast.error("Failed to load member details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, memberId]);

  const handleApproveTimesheet = async (id, status) => {
    try {
      await import("../../api").then((m) =>
        m.timesheetsApi.approve(id, status),
      );
      setTimesheets((prev) =>
        prev.map((ts) => (ts.id === id ? { ...ts, status } : ts)),
      );
      toast.success(`Timesheet ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed");
    }
  };

  const handleUpdateTaskStatus = async (id, status) => {
    setUpdatingTask(id);
    try {
      await import("../../api").then((m) =>
        m.tasksApi.updateStatus(id, status),
      );
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed");
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { reportsApi } = await import("../../api");
      const res = await reportsApi.exportExcel({
        userId: Number(memberId),
        projectId: Number(projectId),
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${member?.firstName}_${member?.lastName}_timesheets.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );

  const totalHours = timesheets.reduce(
    (s, ts) => s + Number(ts.hoursWorked),
    0,
  );
  const pendingTs = timesheets.filter((ts) => ts.status === "Pending").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/leader/projects/${projectId}`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {member
                ? `${member.firstName} ${member.lastName}`
                : `Member #${memberId}`}
            </h1>
            {member && (
              <span className="text-sm text-gray-500">— {project?.name}</span>
            )}
          </div>
          {member && (
            <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
          )}
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || timesheets.length === 0}
          className="btn-secondary"
        >
          <FileSpreadsheet size={15} />
          {exporting ? "Exporting..." : "Export Timesheets"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{tasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{completedTasks}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">
            {totalHours.toFixed(1)}h
          </p>
          <p className="text-xs text-gray-500 mt-1">Hours Logged</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingTs}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Approval</p>
        </div>
      </div>

      <div className="card">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "tasks"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CheckSquare size={15} />
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("timesheets")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "timesheets"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock size={15} />
            Timesheets ({timesheets.length})
            {pendingTs > 0 && (
              <span className="ml-1 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                {pendingTs} pending
              </span>
            )}
          </button>
        </div>

        {activeTab === "tasks" && (
          <div>
            {tasks.length === 0 ? (
              <EmptyState
                message="No tasks assigned in this project"
                icon={CheckSquare}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between px-5 py-4 gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          t.priority === "High"
                            ? "bg-red-500"
                            : t.priority === "Medium"
                            ? "bg-yellow-400"
                            : "bg-green-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {t.title}
                        </p>
                        {t.description  && <ExpandableText text={t.description} limit={10} className="text-sm text-gray-500 mt-1 block" />}
                        <div className="flex items-center gap-3 mt-1.5">
                          <StatusBadge status={t.priority} />
                          {t.dueDate && (
                            <span className="text-xs text-gray-400">
                              Due: {new Date(t.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button value={t.status} disabled={updatingTask === t.id}>
                      {t.status === "Todo" && (
                        <button
                          value="Todo"
                          className="bg-yellow-400 border-yellow-400 p-1.5 w-full rounded-xl"
                        >
                          Todo
                        </button>
                      )}
                      {t.status === "InProgress" && (
                        <button
                          value="InProgress"
                          className="bg-blue-400 border-blue-400 p-1.5 w-full rounded-xl"
                        >
                          In Progress
                        </button>
                      )}
                      {t.status === "Completed" && (
                        <button
                          value="Completed"
                          className="bg-green-400 border-green-400 p-1.5 rounded-xl w-full"
                        >
                          Completed
                        </button>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "timesheets" && (
          <div>
            {timesheets.length === 0 ? (
              <EmptyState
                message="No timesheets logged in this project"
                icon={Clock}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {timesheets.map((ts) => (
                  <div
                    key={ts.id}
                    className="flex items-center justify-between px-5 py-4 gap-4"
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
                    {ts.description && <ExpandableText text={ts.description} limit={10} className="text-sm text-gray-500 mt-1 block" />}
                   </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-700">
                        {ts.hoursWorked}h
                      </span>
                      <StatusBadge status={ts.status} />
                      {ts.status === "Pending" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleApproveTimesheet(ts.id, "Approved")
                            }
                            className="text-xs px-2.5 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApproveTimesheet(ts.id, "Rejected")
                            }
                            className="text-xs px-2.5 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
