import { useEffect, useState, useMemo } from 'react'
import { tasksApi, timesheetsApi, projectsApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Spinner, EmptyState, StatusBadge, PageHeader, Modal, ExpandableText, ClickableText } from '../../components/common'
import {
  CheckSquare, Clock, FolderKanban, TrendingUp, CheckCircle2,
  Plus, ChevronDown, ChevronUp, Filter, X, Search
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES_UPDATE = ['Todo', 'InProgress', 'Completed']

export function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [timesheets, setTimesheets] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      tasksApi.getMine().then(r => setTasks(r.data || [])),
      timesheetsApi.getMine().then(r => setTimesheets(r.data || [])),
      projectsApi.getMine().then(r => setProjects(Array.isArray(r.data) ? r.data : []))
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const completed = tasks.filter(t => t.status === 'Completed').length
  const inProgress = tasks.filter(t => t.status === 'InProgress').length
  const thisWeekHours = timesheets
    .filter(ts => new Date(ts.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, ts) => sum + Number(ts.hoursWorked), 0)

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Clickable stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value={tasks.length} icon={CheckSquare} color="indigo"
          onClick={() => navigate('/employee/tasks')} />
        <StatCard label="In Progress" value={inProgress} icon={TrendingUp} color="yellow"
          onClick={() => navigate('/employee/tasks')} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} color="green"
          onClick={() => navigate('/employee/tasks')} />
        <StatCard label="Hours This Week" value={`${thisWeekHours.toFixed(1)}h`} icon={Clock} color="blue"
          onClick={() => navigate('/employee/timesheets')} />
      </div>

      {projects.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">My Projects</h3>
            <button
              onClick={() => navigate('/employee/projects')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.map((p, i) => {
              const projTasks = tasks.filter(t => t.projectId === p.id)
              const done = projTasks.filter(t => t.status === 'Completed').length
              return (
                <div
                  key={p.id}
                  onClick={() => navigate('/employee/projects')}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                      <FolderKanban size={14} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      {projTasks.length > 0 && (
                        <p className="text-xs text-gray-400">{done}/{projTasks.length} tasks done</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    p.status === 'Active' ? 'bg-green-100 text-green-700' :
                    p.status === 'Completed' ? 'bg-gray-100 text-gray-500' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">My Tasks</h3>
          <button onClick={() => navigate('/employee/tasks')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            View all →
          </button>
        </div>
        {tasks.length === 0
          ? <EmptyState message="No tasks assigned yet" icon={CheckSquare} />
          : (
            <div className="divide-y divide-gray-100">
              {tasks.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      t.priority === 'High' ? 'bg-red-500' :
                      t.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.projectName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.dueDate && <span className="text-xs text-gray-400">{new Date(t.dueDate).toLocaleDateString()}</span>}
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
        {timesheets.length === 0
          ? <EmptyState message="No timesheets logged yet" icon={Clock} />
          : (
            <div className="table-wrap rounded-none">
              <table className="table">
                <thead><tr><th>Date</th><th>Project</th><th>Task</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {timesheets.slice(0, 5).map(ts => (
                    <tr key={ts.id}>
                      <td>{new Date(ts.date).toLocaleDateString()}</td>
                      <td>{ts.projectName}</td>
                      <td className="max-w-xs truncate">{ts.taskTitle}</td>
                      <td className="font-medium">{ts.hoursWorked}h</td>
                      <td><StatusBadge status={ts.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}

export function EmployeeProjectsPage() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({}) 
  const [updatingTask, setUpdatingTask] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [projRes, taskRes] = await Promise.all([
          projectsApi.getMine(),
          tasksApi.getMine()
        ])
        const projs = Array.isArray(projRes.data) ? projRes.data : []
        setProjects(projs)
        setTasks(taskRes.data || [])
        const exp = {}
        projs.forEach(p => { exp[p.id] = true })
        setExpanded(exp)
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const updateStatus = async (id, status) => {
    setUpdatingTask(id)
    try {
      await tasksApi.updateStatus(id, status)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      toast.success(`Marked as ${status}`)
    } catch { toast.error('Failed') } finally { setUpdatingTask(null) }
  }

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} you are part of`}
      />

      {projects.length === 0
        ? <div className="card"><EmptyState message="No projects assigned yet" icon={FolderKanban} /></div>
        : (
          <div className="space-y-4">
            {projects.map(p => {
              const projTasks = tasks.filter(t => t.projectId === p.id)
              const completed = projTasks.filter(t => t.status === 'Completed').length
              const inProgress = projTasks.filter(t => t.status === 'InProgress').length
              const todo = projTasks.filter(t => t.status === 'Todo').length
              const pct = projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0
              const isOpen = expanded[p.id]

              return (
                <div key={p.id} className="card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    onClick={() => toggle(p.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-indigo-50 rounded-xl">
                        <FolderKanban size={18} className="text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-32 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{completed}/{projTasks.length} tasks done</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2">
                        {todo > 0 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{todo} todo</span>}
                        {inProgress > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{inProgress} active</span>}
                        {completed > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{completed} done</span>}
                      </div>
                      {isOpen
                        ? <ChevronUp size={16} className="text-gray-400" />
                        : <ChevronDown size={16} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100">
                      {projTasks.length === 0
                        ? (
                          <div className="px-5 py-8 flex flex-col items-center text-gray-400">
                            <CheckSquare size={28} className="opacity-30 mb-2" />
                            <p className="text-sm">No tasks in this project yet</p>
                          </div>
                        )
                        : (
                          <div className="divide-y divide-gray-50">
                            {projTasks.map(t => (
                              <div key={t.id} className="flex items-start justify-between px-5 py-3.5 gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                    t.priority === 'High' ? 'bg-red-500' :
                                    t.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                                    {t.description && (
                                      <ExpandableText text={t.description} limit={50} className="text-xs text-gray-400 mt-0.5 block" />
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                      <StatusBadge status={t.priority} />
                                      {t.dueDate && (
                                        <span className={`text-xs font-medium ${
                                          new Date(t.dueDate) < new Date() && t.status !== 'Completed'
                                            ? 'text-red-500' : 'text-gray-400'
                                        }`}>
                                          Due: {new Date(t.dueDate).toLocaleDateString()}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400">By: {t.assignedByName}</span>
                                    </div>
                                  </div>
                                </div>
                                <select
                                  value={t.status}
                                  disabled={updatingTask === t.id}
                                  onChange={e => updateStatus(t.id, e.target.value)}
                                  className="input w-32 text-xs flex-shrink-0"
                                >
                                  {STATUSES_UPDATE.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}

export function EmployeeTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [form, setForm] = useState({ projectId: '', title: '', description: '', priority: 'Medium', dueDate: '' })

  const [filterProject, setFilterProject] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDueFrom, setFilterDueFrom] = useState('')
  const [filterDueTo, setFilterDueTo] = useState('')
  const [search, setSearch] = useState('')

  const loadAll = async () => {
    setLoading(true)
    try {
      const [taskRes, projRes] = await Promise.all([
        tasksApi.getMine(),
        projectsApi.getMine()
      ])
      const rawTasks = taskRes.data || []
      setTasks([...rawTasks].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setProjects(Array.isArray(projRes.data) ? projRes.data : [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await tasksApi.updateStatus(id, status)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      toast.success(`Marked as ${status}`)
    } catch { toast.error('Failed') } finally { setUpdating(null) }
  }

  const handleSelfAssign = async e => {
    e.preventDefault()
    if (!user?.id) return
    setSaving(true)
    try {
      await tasksApi.selfAssign({
        ...form,
        projectId: Number(form.projectId),
        assignedTo: user.id,
      })
      toast.success('Task created and assigned to you!')
      setModal(false)
      setForm({ projectId: '', title: '', description: '', priority: 'Medium', dueDate: '' })
      loadAll()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to create task')
    } finally { setSaving(false) }
  }

  const clearFilters = () => {
    setFilterProject('')
    setFilterPriority('')
    setFilterStatus('')
    setFilterDueFrom('')
    setFilterDueTo('')
    setSearch('')
  }

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterProject && t.projectId !== Number(filterProject)) return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterStatus && t.status !== filterStatus) return false
      if (filterDueFrom && t.dueDate && new Date(t.dueDate) < new Date(filterDueFrom)) return false
      if (filterDueTo && t.dueDate && new Date(t.dueDate) > new Date(filterDueTo)) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.projectName?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filterProject, filterPriority, filterStatus, filterDueFrom, filterDueTo, search])

  const activeFilterCount = [filterProject, filterPriority, filterStatus, filterDueFrom, filterDueTo, search]
    .filter(Boolean).length

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="My Tasks"
        subtitle={`${filtered.length} of ${tasks.length} tasks`}
        action={
          projects.length > 0 && (
            <button onClick={() => setModal(true)} className="btn-primary">
              <Plus size={16} /> Self-Assign Task
            </button>
          )
        }
      />

      <div className="card mb-4">
        <div className="p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="input pl-8"
              placeholder="Search tasks or projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : ''}`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
              <X size={14} /> Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="label text-xs">Project</label>
              <select
                className="input text-sm"
                value={filterProject}
                onChange={e => setFilterProject(e.target.value)}
              >
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="label text-xs">Priority</label>
              <select
                className="input text-sm"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="label text-xs">Status</label>
              <select
                className="input text-sm"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUSES_UPDATE.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="label text-xs">Due From</label>
              <input
                type="date"
                className="input text-sm"
                value={filterDueFrom}
                onChange={e => setFilterDueFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-xs">Due To</label>
              <input
                type="date"
                className="input text-sm"
                value={filterDueTo}
                onChange={e => setFilterDueTo(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {filterProject && (
              <span className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                {projects.find(p => p.id === Number(filterProject))?.name || 'Project'}
                <button onClick={() => setFilterProject('')}><X size={10} /></button>
              </span>
            )}
            {filterPriority && (
              <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
                {filterPriority}
                <button onClick={() => setFilterPriority('')}><X size={10} /></button>
              </span>
            )}
            {filterStatus && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                {filterStatus}
                <button onClick={() => setFilterStatus('')}><X size={10} /></button>
              </span>
            )}
            {(filterDueFrom || filterDueTo) && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                Due: {filterDueFrom || '...'} → {filterDueTo || '...'}
                <button onClick={() => { setFilterDueFrom(''); setFilterDueTo('') }}><X size={10} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                "{search}"
                <button onClick={() => setSearch('')}><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {filtered.length === 0
        ? (
          <div className="card">
            <EmptyState
              message={activeFilterCount > 0 ? 'No tasks match your filters' : 'No tasks assigned'}
              icon={CheckSquare}
            />
          </div>
        )
        : (
          <div className="space-y-3">
            {filtered.map(t => (
              <div key={t.id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    t.priority === 'High' ? 'bg-red-500' :
                    t.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{t.title}</p>
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    {t.description && <ExpandableText text={t.description} limit={50} className="text-sm text-gray-500 mt-1 block" />}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FolderKanban size={11} /> {t.projectName}
                      </span>
                      {t.dueDate && (
                        <span className={new Date(t.dueDate) < new Date() && t.status !== 'Completed'
                          ? 'text-red-500 font-medium' : ''
                        }>
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
                  onChange={e => updateStatus(t.id, e.target.value)}
                  className="input w-36 text-xs flex-shrink-0"
                >
                  {STATUSES_UPDATE.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

      {/* Self-Assign Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Self-Assign a Task" size="lg">
        <form onSubmit={handleSelfAssign} className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
            This task will be assigned to you automatically.
          </div>
          <div>
            <label className="label">Project <span className="text-xs text-gray-400">(only your projects)</span></label>
            <select
              className="input"
              value={form.projectId}
              onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
              required
            >
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Task Title</label>
            <input
              className="input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What do you need to do?"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input" rows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Assign to Me'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}