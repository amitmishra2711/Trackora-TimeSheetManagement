import { useEffect, useState } from 'react'
import { Users, UsersRound, FolderKanban, Clock, CheckSquare, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { usersApi, teamsApi, projectsApi, tasksApi, timesheetsApi } from '../../api'
import { StatCard, Spinner } from '../../components/common'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [timesheetData, setTimesheetData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentTimesheets, setRecentTimesheets] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [users, teams, projects, tasks, timesheets] = await Promise.all([
          usersApi.getAll({ page: 1, pageSize: 1 }),
          teamsApi.getAll({ page: 1, pageSize: 1 }),
          projectsApi.getAll({ page: 1, pageSize: 1 }),
          tasksApi.getAll({ page: 1, pageSize: 1 }),
          timesheetsApi.getAll({ page: 1, pageSize: 5 })
        ])
        setStats({
          users: users.data.totalCount,
          teams: teams.data.totalCount,
          projects: projects.data.totalCount,
          tasks: tasks.data.totalCount,
        })
        setRecentTimesheets(timesheets.data.items || [])

        // Generate chart data from timesheets
        const allTs = (await timesheetsApi.getAll({ page: 1, pageSize: 100 })).data.items || []
        const pending = allTs.filter(t => t.status === 'Pending').length
        const approved = allTs.filter(t => t.status === 'Approved').length
        const rejected = allTs.filter(t => t.status === 'Rejected').length
        setStatusData([
          { name: 'Pending', value: pending },
          { name: 'Approved', value: approved },
          { name: 'Rejected', value: rejected },
        ])

        // Hours by project (top 5)
        const byProject = {}
        allTs.forEach(ts => {
          byProject[ts.projectName] = (byProject[ts.projectName] || 0) + Number(ts.hoursWorked)
        })
        setTimesheetData(Object.entries(byProject).slice(0, 5).map(([name, hours]) => ({ name, hours: +hours.toFixed(1) })))
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your organization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.users ?? 0} icon={Users} color="indigo" />
        <StatCard label="Teams" value={stats?.teams ?? 0} icon={UsersRound} color="blue" />
        <StatCard label="Projects" value={stats?.projects ?? 0} icon={FolderKanban} color="purple" />
        <StatCard label="Tasks" value={stats?.tasks ?? 0} icon={CheckSquare} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Hours by Project</h3>
          {timesheetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timesheetData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No timesheet data yet</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Timesheet Status</h3>
          {statusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={['#f59e0b', '#10b981', '#ef4444'][i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No timesheet data yet</p>}
        </div>
      </div>

      {/* Recent Timesheets */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Timesheets</h3>
        </div>
        <div className="table-wrap rounded-none">
          <table className="table">
            <thead><tr><th>Employee</th><th>Project</th><th>Task</th><th>Date</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {recentTimesheets.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">No timesheets yet</td></tr>
              ) : recentTimesheets.map(ts => (
                <tr key={ts.id}>
                  <td className="font-medium">{ts.userName}</td>
                  <td>{ts.projectName}</td>
                  <td>{ts.taskTitle}</td>
                  <td>{new Date(ts.date).toLocaleDateString()}</td>
                  <td>{ts.hoursWorked}h</td>
                  <td><span className={`badge-${ts.status.toLowerCase()}`}>{ts.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
