import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UsersRound, FolderKanban, CheckSquare,
  Clock, TrendingUp, TrendingDown, AlertTriangle,
  UserCheck, Target, BarChart2, Calendar
} from 'lucide-react'
import { usersApi, teamsApi, projectsApi, tasksApi, timesheetsApi } from '../../api'
import { StatCard, Spinner, StatusBadge, ClickableText, ExpandableText } from '../../components/common'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts'
import { format, subDays } from 'date-fns'

const COLORS = { indigo: '#4f46e5', green: '#16a34a', yellow: '#d97706', red: '#dc2626', blue: '#2563eb', gray: '#6b7280' }

// ─── KPI Card ─────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color = 'indigo', trend, onClick }) {
  const bg = { indigo: 'bg-indigo-50 text-indigo-600', green: 'bg-green-50 text-green-600', yellow: 'bg-yellow-50 text-yellow-600', red: 'bg-red-50 text-red-600', blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600' }
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-200 p-5 flex items-start justify-between shadow-sm ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-150 active:scale-[0.98]' : ''}`}
    >
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}% vs last month
          </div>
        )}
        {onClick && <p className="text-xs text-indigo-500 mt-2 font-medium">View details →</p>}
      </div>
      <div className={`p-3 rounded-xl ${bg[color]}`}>
        <Icon size={22} />
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, teams: 0, projects: 0, tasks: 0 })
  const [taskStatusData, setTaskStatusData] = useState([])
  const [tsStatusData, setTsStatusData] = useState([])
  const [projectStatusData, setProjectStatusData] = useState([])
  const [hoursPerProject, setHoursPerProject] = useState([])
  const [hoursPerDay, setHoursPerDay] = useState([])
  const [recentTimesheets, setRecentTimesheets] = useState([])
  const [topEmployees, setTopEmployees] = useState([])
  const [overdueTaskCount, setOverdueTaskCount] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [totalHoursThisWeek, setTotalHoursThisWeek] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, teamsRes, projRes, tasksRes, tsRes] = await Promise.all([
          usersApi.getAll({ page: 1, pageSize: 1 }),
          teamsApi.getAll({ page: 1, pageSize: 1 }),
          projectsApi.getAll({ page: 1, pageSize: 100 }),
          tasksApi.getAll({ page: 1, pageSize: 200 }),
          timesheetsApi.getAll({ page: 1, pageSize: 200 })
        ])

        const projects = projRes.data.items || []
        const tasks = tasksRes.data.items || []
        const timesheets = tsRes.data.items || []

        // KPI counts
        setStats({
          users: usersRes.data.totalCount,
          teams: teamsRes.data.totalCount,
          projects: projects.length,
          tasks: tasks.length
        })

        // Pending approvals & overdue tasks
        setPendingApprovals(timesheets.filter(ts => ts.status === 'Pending').length)
        const today = new Date()
        setOverdueTaskCount(tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'Completed').length)

        // Task completion rate
        const completedTasks = tasks.filter(t => t.status === 'Completed').length
        setCompletionRate(tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0)

        // Hours this week
        const weekAgo = subDays(new Date(), 7)
        const weekTs = timesheets.filter(ts => new Date(ts.date) >= weekAgo)
        setTotalHoursThisWeek(weekTs.reduce((s, ts) => s + Number(ts.hoursWorked), 0))

        // Task status chart
        setTaskStatusData([
          { name: 'Todo', value: tasks.filter(t => t.status === 'Todo').length, fill: COLORS.gray },
          { name: 'In Progress', value: tasks.filter(t => t.status === 'InProgress').length, fill: COLORS.blue },
          { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, fill: COLORS.green },
        ])

        // Timesheet status chart
        setTsStatusData([
          { name: 'Pending', value: timesheets.filter(ts => ts.status === 'Pending').length, fill: COLORS.yellow },
          { name: 'Approved', value: timesheets.filter(ts => ts.status === 'Approved').length, fill: COLORS.green },
          { name: 'Rejected', value: timesheets.filter(ts => ts.status === 'Rejected').length, fill: COLORS.red },
        ])

        // Project status chart
        setProjectStatusData([
          { name: 'Active', value: projects.filter(p => p.status === 'Active').length, fill: COLORS.indigo },
          { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length, fill: COLORS.green },
          { name: 'On Hold', value: projects.filter(p => p.status === 'OnHold').length, fill: COLORS.yellow },
        ])

        // Hours per project (top 6)
        const byProject = {}
        timesheets.forEach(ts => { byProject[ts.projectName] = (byProject[ts.projectName] || 0) + Number(ts.hoursWorked) })
        setHoursPerProject(
          Object.entries(byProject)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([name, hours]) => ({ name: name.length > 14 ? name.slice(0, 14) + '…' : name, hours: +hours.toFixed(1) }))
        )

        // Hours per day last 14 days
        const days = {}
        for (let i = 13; i >= 0; i--) {
          const d = format(subDays(new Date(), i), 'MMM dd')
          days[d] = 0
        }
        timesheets.forEach(ts => {
          const d = format(new Date(ts.date), 'MMM dd')
          if (days[d] !== undefined) days[d] += Number(ts.hoursWorked)
        })
        setHoursPerDay(Object.entries(days).map(([date, hours]) => ({ date, hours: +hours.toFixed(1) })))

        // Top 5 employees by hours
        const byUser = {}
        timesheets.forEach(ts => {
          if (!byUser[ts.userName]) byUser[ts.userName] = { name: ts.userName, hours: 0, approved: 0 }
          byUser[ts.userName].hours += Number(ts.hoursWorked)
          if (ts.status === 'Approved') byUser[ts.userName].approved += Number(ts.hoursWorked)
        })
        setTopEmployees(
          Object.values(byUser)
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5)
        )

        // Recent timesheets (latest 6)
        setRecentTimesheets(
          [...timesheets]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6)
        )
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Spinner size={36} className="text-indigo-600" />
      <p className="text-sm text-gray-500">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="space-y-8 pb-8">

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — Organisation overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500 font-medium">Live</span>
        </div>
      </div>

      {/* Alert bar — show only if there are issues */}
      {(overdueTaskCount > 0 || pendingApprovals > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <div className="flex gap-6 text-sm">
            {overdueTaskCount > 0 && (
              <span className="text-amber-800">
                <strong>{overdueTaskCount}</strong> overdue task{overdueTaskCount !== 1 ? 's' : ''}
              </span>
            )}
            {pendingApprovals > 0 && (
              <span className="text-amber-800">
                <strong>{pendingApprovals}</strong> timesheet approval{pendingApprovals !== 1 ? 's' : ''} pending
              </span>
            )}
          </div>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Employees" value={stats.users} icon={Users} color="indigo"
          sub="All registered users" onClick={() => navigate('/admin/users')} />
        <KpiCard label="Active Teams" value={stats.teams} icon={UsersRound} color="blue"
          sub="Across organisation" onClick={() => navigate('/admin/teams')} />
        <KpiCard label="Projects" value={stats.projects} icon={FolderKanban} color="purple"
          sub="All statuses" onClick={() => navigate('/admin/projects')} />
        <KpiCard label="Total Tasks" value={stats.tasks} icon={CheckSquare} color="green"
          sub={`${completionRate}% completion rate`} onClick={() => navigate('/admin/tasks')} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Hours This Week" value={`${totalHoursThisWeek.toFixed(1)}h`} icon={Clock} color="indigo"
          sub="Last 7 days" onClick={() => navigate('/admin/timesheets')} />
        <KpiCard label="Pending Approvals" value={pendingApprovals} icon={UserCheck} color="yellow"
          sub="Timesheets awaiting review" onClick={() => navigate('/admin/timesheets')} />
        <KpiCard label="Overdue Tasks" value={overdueTaskCount} icon={AlertTriangle} color="red"
          sub="Past due date, not completed" onClick={() => navigate('/admin/tasks')} />
        <KpiCard label="Completion Rate" value={`${completionRate}%`} icon={Target} color="green"
          sub="Tasks completed vs total" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hours trend area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionHeader title="Daily Hours Logged" sub="Last 14 days across all employees" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hoursPerDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
              <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={2} fill="url(#hoursGrad)" dot={false} activeDot={{ r: 4, fill: '#4f46e5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timesheet status donut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionHeader title="Timesheet Status" sub="All submissions" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={tsStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {tsStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {tsStatusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hours by project bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionHeader title="Hours by Project" sub="Total logged hours per project" />
          {hoursPerProject.length === 0
            ? <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hoursPerProject} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Task status donut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionHeader title="Task Status" sub="All tasks breakdown" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {taskStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {taskStatusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: top employees + recent timesheets */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Top employees leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SectionHeader title="Top Employees by Hours" sub="All-time total logged hours" />
          {topEmployees.length === 0
            ? <div className="text-center text-gray-400 text-sm py-8">No data yet</div>
            : (
              <div className="space-y-3">
                {topEmployees.map((emp, i) => (
                  <div key={emp.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{emp.name}</span>
                        <span className="text-xs font-semibold text-indigo-600 ml-2 flex-shrink-0">{emp.hours.toFixed(1)}h</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (emp.hours / (topEmployees[0]?.hours || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Recent timesheets */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Timesheets</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest submissions across all employees</p>
            </div>
            <button onClick={() => navigate('/admin/timesheets')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTimesheets.length === 0
              ? <div className="text-center text-gray-400 text-sm py-10">No timesheets yet</div>
              : recentTimesheets.map(ts => (
                <div key={ts.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {ts.userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <ClickableText onClick={() => navigate('/admin/users')} className="text-sm font-medium">
                        {ts.userName}
                      </ClickableText>
                      <p className="text-xs text-gray-400 truncate">
                        <ClickableText onClick={() => navigate(`/admin/projects/${ts.projectId}`)} className="text-xs">
                          {ts.projectName}
                        </ClickableText>
                        {' · '}{ts.taskTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-xs text-gray-500">{format(new Date(ts.date), 'MMM d')}</span>
                    <span className="text-sm font-semibold text-gray-900">{ts.hoursWorked}h</span>
                    <StatusBadge status={ts.status} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Project status overview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionHeader title="Project Portfolio Status" sub="Status distribution across all projects" />
          <button onClick={() => navigate('/admin/projects')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Manage projects →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {projectStatusData.map(d => (
            <div key={d.name} className="text-center p-4 rounded-xl" style={{ background: `${d.fill}15` }}>
              <p className="text-3xl font-bold" style={{ color: d.fill }}>{d.value}</p>
              <p className="text-sm text-gray-600 mt-1 font-medium">{d.name}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}