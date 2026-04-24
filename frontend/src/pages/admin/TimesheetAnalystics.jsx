import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { timesheetAnalyticsApi, usersApi, projectsApi, teamsApi } from '../../api'
import { Spinner, EmptyState, StatusBadge } from '../../components/common'
import {
  Clock, Download, ChevronDown, ChevronRight,
  Users, FolderKanban, Calendar, Filter, X,
  TrendingUp, CheckCircle, AlertCircle, Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function WeeklySummaryCards({ summary, loading }) {
  const cards = [
    {
      label: 'This Month',
      value: summary?.thisMonth ?? 0,
      icon: Calendar,
      color: 'indigo',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
    },
    {
      label: 'Week 1  (1–7)',
      value: summary?.week1 ?? 0,
      icon: Clock,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    {
      label: 'Week 2  (8–14)',
      value: summary?.week2 ?? 0,
      icon: Clock,
      color: 'violet',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-200',
    },
    {
      label: 'Week 3  (15–21)',
      value: summary?.week3 ?? 0,
      icon: Clock,
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
    },
    {
      label: 'Week 4  (22+)',
      value: summary?.week4 ?? 0,
      icon: Clock,
      color: 'fuchsia',
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-600',
      border: 'border-fuchsia-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`bg-white rounded-2xl border ${c.border} p-4 shadow-sm flex flex-col gap-2`}
        >
          <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center`}>
            <c.icon size={17} className={c.text} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium leading-tight">{c.label}</p>
            {loading ? (
              <div className="h-7 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${c.text} mt-0.5`}>
                {Number(c.value).toFixed(1)}
                <span className="text-sm font-medium ml-0.5">h</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TimesheetFilters({
  filters, onChange, employees = [], projects = [], teams = [],
  showTeam = true, showEmployee = true,
}) {
  const [open, setOpen] = useState(true)

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  const activeCount = [
    filters.employeeId, filters.projectId,
    filters.teamId, filters.startDate, filters.endDate
  ].filter(Boolean).length

  const clear = () =>
    onChange({ employeeId: '', projectId: '', teamId: '', startDate: '', endDate: '' })

  const preset = (key) => {
    const now = new Date()
    const presets = {
      'this-month': {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate:   format(endOfMonth(now),   'yyyy-MM-dd'),
      },
      'this-week': (() => {
        const day = now.getDay()
        const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
        return { startDate: format(mon, 'yyyy-MM-dd'), endDate: format(sun, 'yyyy-MM-dd') }
      })(),
      'last-7': {
        startDate: format(new Date(now.getTime() - 6 * 86400000), 'yyyy-MM-dd'),
        endDate:   format(now, 'yyyy-MM-dd'),
      },
      'last-30': {
        startDate: format(new Date(now.getTime() - 29 * 86400000), 'yyyy-MM-dd'),
        endDate:   format(now, 'yyyy-MM-dd'),
      },
    }
    if (presets[key]) onChange({ ...filters, ...presets[key] })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="font-semibold text-sm text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clear() }}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X size={12} /> Clear all
            </button>
          )}
          {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 pt-4 mb-4">
            <span className="text-xs text-gray-400 font-medium self-center">Quick:</span>
            {[
              { key: 'this-week',  label: 'This Week' },
              { key: 'this-month', label: 'This Month' },
              { key: 'last-7',     label: 'Last 7 Days' },
              { key: 'last-30',    label: 'Last 30 Days' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => preset(p.key)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {showEmployee && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <Users size={11} className="inline mr-1" />Employee
                </label>
                <select className="input text-sm" value={filters.employeeId} onChange={set('employeeId')}>
                  <option value="">All employees</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <FolderKanban size={11} className="inline mr-1" />Project
              </label>
              <select className="input text-sm" value={filters.projectId} onChange={set('projectId')}>
                <option value="">All projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {showTeam && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  <Users size={11} className="inline mr-1" />Team
                </label>
                <select className="input text-sm" value={filters.teamId} onChange={set('teamId')}>
                  <option value="">All teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Calendar size={11} className="inline mr-1" />From Date
              </label>
              <input
                type="date" className="input text-sm"
                value={filters.startDate} onChange={set('startDate')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Calendar size={11} className="inline mr-1" />To Date
              </label>
              <input
                type="date" className="input text-sm"
                value={filters.endDate} onChange={set('endDate')}
              />
            </div>
          </div>

          {activeCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {filters.employeeId && employees.find(e => e.id === Number(filters.employeeId)) && (
                <Chip
                  label={`Employee: ${employees.find(e => e.id === Number(filters.employeeId))?.firstName}`}
                  onRemove={() => onChange({ ...filters, employeeId: '' })}
                  color="indigo"
                />
              )}
              {filters.projectId && projects.find(p => p.id === Number(filters.projectId)) && (
                <Chip
                  label={`Project: ${projects.find(p => p.id === Number(filters.projectId))?.name}`}
                  onRemove={() => onChange({ ...filters, projectId: '' })}
                  color="blue"
                />
              )}
              {filters.teamId && teams.find(t => t.id === Number(filters.teamId)) && (
                <Chip
                  label={`Team: ${teams.find(t => t.id === Number(filters.teamId))?.name}`}
                  onRemove={() => onChange({ ...filters, teamId: '' })}
                  color="purple"
                />
              )}
              {filters.startDate && (
                <Chip
                  label={`From: ${filters.startDate}`}
                  onRemove={() => onChange({ ...filters, startDate: '' })}
                  color="green"
                />
              )}
              {filters.endDate && (
                <Chip
                  label={`To: ${filters.endDate}`}
                  onRemove={() => onChange({ ...filters, endDate: '' })}
                  color="green"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove, color = 'gray' }) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700',
    blue:   'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green:  'bg-green-100 text-green-700',
    gray:   'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X size={10} />
      </button>
    </span>
  )
}

 
export function GroupedTimesheetTable({ data, loading, onApprove, canApprove = false }) {
  const [expandedProjects, setExpandedProjects] = useState({})
  const [expandedTeams, setExpandedTeams]       = useState({})
  const [expandedEmployees, setExpandedEmployees] = useState({})

  // Auto-expand everything on first load
  useEffect(() => {
    if (!data?.grouped) return
    const ep = {}, et = {}, ee = {}
    data.grouped.forEach(p => {
      ep[p.projectId] = true
      p.teams.forEach(t => {
        et[`${p.projectId}-${t.teamId}`] = true
        t.employees.forEach(e => {
          ee[`${p.projectId}-${t.teamId}-${e.userId}`] = true
        })
      })
    })
    setExpandedProjects(ep)
    setExpandedTeams(et)
    setExpandedEmployees(ee)
  }, [data])

  const toggleP = (pid)          => setExpandedProjects(s => ({ ...s, [pid]: !s[pid] }))
  const toggleT = (k)            => setExpandedTeams(s => ({ ...s, [k]: !s[k] }))
  const toggleE = (k)            => setExpandedEmployees(s => ({ ...s, [k]: !s[k] }))

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-3">
        <Spinner size={32} className="text-indigo-600" />
        <p className="text-sm text-gray-500">Loading timesheet data…</p>
      </div>
    )
  }

  if (!data?.grouped?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <EmptyState
          message="No timesheet entries match your filters"
          icon={Clock}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.grouped.map(project => {
        const pKey     = project.projectId
        const pExpanded = expandedProjects[pKey] ?? true

        return (
          <div key={pKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            {/* ── Project Header ───────────────────────────── */}
            <button
              onClick={() => toggleP(pKey)}
              className="w-full flex items-center justify-between px-5 py-4 bg-indigo-600 hover:bg-indigo-700 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {pExpanded
                  ? <ChevronDown size={16} className="text-indigo-200" />
                  : <ChevronRight size={16} className="text-indigo-200" />}
                <FolderKanban size={16} className="text-indigo-200" />
                <span className="font-semibold text-white text-sm">{project.projectName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-indigo-200">
                  {project.teams.length} team{project.teams.length !== 1 ? 's' : ''}
                </span>
                <div className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {Number(project.totalHours).toFixed(1)}h total
                </div>
              </div>
            </button>

            {pExpanded && project.teams.map(team => {
              const tKey     = `${pKey}-${team.teamId}`
              const tExpanded = expandedTeams[tKey] ?? true

              return (
                <div key={tKey}>

                  {/* ── Team Header ───────────────────────── */}
                  <button
                    onClick={() => toggleT(tKey)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors border-b border-indigo-100 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {tExpanded
                        ? <ChevronDown size={14} className="text-indigo-400" />
                        : <ChevronRight size={14} className="text-indigo-400" />}
                      <Users size={14} className="text-indigo-500" />
                      <span className="font-semibold text-indigo-800 text-sm">{team.teamName}</span>
                      <span className="text-xs text-indigo-400 ml-1">
                        · {team.employees.length} employee{team.employees.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-indigo-700">
                      {Number(team.totalHours).toFixed(1)}h
                    </div>
                  </button>

                  {tExpanded && team.employees.map(emp => {
                    const eKey     = `${pKey}-${team.teamId}-${emp.userId}`
                    const eExpanded = expandedEmployees[eKey] ?? true

                    return (
                      <div key={eKey} className="border-b border-gray-100 last:border-0">

                        {/* ── Employee Row ───────────────── */}
                        <button
                          onClick={() => toggleE(eKey)}
                          className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {eExpanded
                              ? <ChevronDown size={13} className="text-gray-400" />
                              : <ChevronRight size={13} className="text-gray-400" />}
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                              {emp.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{emp.userName}</span>
                            <span className="text-xs text-gray-400">· {emp.entries.length} entries</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-800">
                              {Number(emp.totalHours).toFixed(1)}h
                            </span>
                            {/* Mini progress bar */}
                            <div className="hidden sm:block w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, (emp.totalHours / (team.totalHours || 1)) * 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </button>

                        {/* ── Entry rows ─────────────────── */}
                        {eExpanded && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-t border-gray-100">
                                  <th className="pl-16 pr-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                  <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                                  <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                  {canApprove && (
                                    <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {emp.entries.map((entry, idx) => (
                                  <tr
                                    key={entry.timesheetId}
                                    className={`border-t border-gray-50 hover:bg-gray-50/70 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                                  >
                                    <td className="pl-16 pr-3 py-2.5 text-gray-600 font-medium">
                                      {entry.dayOfWeek}
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                                      {format(new Date(entry.date), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-700 max-w-[150px] truncate" title={entry.taskTitle}>
                                      {entry.taskTitle}
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-500 max-w-[180px] truncate" title={entry.description}>
                                      {entry.description || '—'}
                                    </td>
                                    <td className="px-3 py-2.5 text-center font-bold text-indigo-700">
                                      {Number(entry.hoursWorked).toFixed(1)}h
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <StatusBadge status={entry.status} />
                                    </td>
                                    {canApprove && (
                                      <td className="px-3 py-2.5 text-center">
                                        {entry.status === 'Pending' ? (
                                          <div className="flex items-center justify-center gap-1">
                                            <button
                                              onClick={() => onApprove?.(entry.timesheetId, 'Approved')}
                                              className="px-2 py-0.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded font-medium transition-colors"
                                            >
                                              ✓ Approve
                                            </button>
                                            <button
                                              onClick={() => onApprove?.(entry.timesheetId, 'Rejected')}
                                              className="px-2 py-0.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded font-medium transition-colors"
                                            >
                                              ✗ Reject
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-gray-300">—</span>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                                {/* Employee total row */}
                                <tr className="bg-indigo-50/40 border-t border-indigo-100">
                                  <td colSpan={canApprove ? 4 : 4} className="pl-16 pr-3 py-2 text-xs font-semibold text-indigo-700">
                                    {emp.userName} — Total
                                  </td>
                                  <td className="px-3 py-2 text-center text-sm font-bold text-indigo-700">
                                    {Number(emp.totalHours).toFixed(1)}h
                                  </td>
                                  <td colSpan={canApprove ? 2 : 1} />
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Team total row */}
                  <div className="flex items-center justify-between px-5 py-2.5 bg-indigo-100/60 border-t border-indigo-200">
                    <span className="text-xs font-semibold text-indigo-800">Team Total — {team.teamName}</span>
                    <span className="text-sm font-bold text-indigo-800">{Number(team.totalHours).toFixed(1)}h</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Grand total */}
      <div className="bg-indigo-600 rounded-2xl px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-indigo-100">
          Grand Total — {data.totalRecords} entries across {data.grouped.length} project{data.grouped.length !== 1 ? 's' : ''}
        </span>
        <span className="text-2xl font-black text-white">
          {Number(data.grouped.reduce((s, p) => s + p.totalHours, 0)).toFixed(1)}h
        </span>
      </div>
    </div>
  )
}


function ExportButton({ filters, leaderId, label = 'Export Excel' }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.employeeId) params.employeeId = filters.employeeId
      if (filters.projectId)  params.projectId  = filters.projectId
      if (filters.teamId)     params.teamId     = filters.teamId
      if (filters.startDate)  params.startDate  = filters.startDate
      if (filters.endDate)    params.endDate    = filters.endDate

      const res = await timesheetAnalyticsApi.exportExcel(params)
      const url = URL.createObjectURL(
        new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
      )
      const a = document.createElement('a')
      a.href = url
      a.download = `trackora_timesheets_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel exported — 4 sheets included!')
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95"
    >
      <Download size={15} className={loading ? 'animate-bounce' : ''} />
      {loading ? 'Exporting…' : label}
    </button>
  )
}

export function AdminTimesheetPage() {
  const EMPTY_FILTERS = {
    employeeId: '', projectId: '', teamId: '', startDate: '', endDate: ''
  }

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  const [employees, setEmployees] = useState([])
  const [projects,  setProjects]  = useState([])
  const [teams,     setTeams]     = useState([])

  useEffect(() => {
    Promise.all([
      usersApi.getEmployees(),
      projectsApi.getAll({ page: 1, pageSize: 100 }),
      teamsApi.getAll({ page: 1, pageSize: 100 }),
    ]).then(([eRes, pRes, tRes]) => {
      setEmployees(eRes.data || [])
      setProjects(pRes.data?.items || [])
      setTeams(tRes.data?.items || [])
    }).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.employeeId) params.employeeId = filters.employeeId
      if (filters.projectId)  params.projectId  = filters.projectId
      if (filters.teamId)     params.teamId     = filters.teamId
      if (filters.startDate)  params.startDate  = filters.startDate
      if (filters.endDate)    params.endDate    = filters.endDate

      const res = await timesheetAnalyticsApi.getAnalytics(params)
      setData(res.data)
    } catch {
      toast.error('Failed to load timesheet analytics')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (id, status) => {
    try {
      const { timesheetsApi } = await import('../../api')
      await timesheetsApi.approve(id, status)
      toast.success(`Timesheet ${status.toLowerCase()}`)
      fetchData()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Grouped view: Project → Team → Employee · All filters combined
          </p>
        </div>
        <ExportButton filters={filters} label="Export to Excel (4 sheets)" />
      </div>

      <WeeklySummaryCards summary={data?.summary} loading={loading} />

      <TimesheetFilters
        filters={filters}
        onChange={setFilters}
        employees={employees}
        projects={projects}
        teams={teams}
        showTeam={true}
        showEmployee={true}
      />

      {data && !loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          {data.totalRecords} entries ·{' '}
          {data.grouped?.length} project{data.grouped?.length !== 1 ? 's' : ''} ·{' '}
          {data.grouped?.reduce((s, p) => s + p.teams.length, 0)} teams ·{' '}
          {Number(data.grouped?.reduce((s, p) => s + p.totalHours, 0) || 0).toFixed(1)}h total
        </div>
      )}

      <GroupedTimesheetTable
        data={data}
        loading={loading}
        canApprove={true}
        onApprove={handleApprove}
      />
    </div>
  )
}


export function LeaderTimesheetPage() {
  const EMPTY_FILTERS = {
    employeeId: '', projectId: '', teamId: '', startDate: '', endDate: ''
  }

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)

  const [employees, setEmployees] = useState([])
  const [projects,  setProjects]  = useState([])
  const [teams,     setTeams]     = useState([])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const teamRes = await teamsApi.getLeading()
        const myTeams = teamRes.data || []
        setTeams(myTeams)

        const memberMap = new Map()
        myTeams.flatMap(t => t.members || []).forEach(m => memberMap.set(m.id, m))
        setEmployees([...memberMap.values()])

        const projRes = await projectsApi.getAll({ page: 1, pageSize: 100 })
        const myTeamIds = new Set(myTeams.map(t => t.id))
        setProjects(
          (projRes.data?.items || []).filter(p =>
            p.teams?.some(t => myTeamIds.has(t.id))
          )
        )
      } catch {}
    }
    loadMeta()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.employeeId) params.employeeId = filters.employeeId
      if (filters.projectId)  params.projectId  = filters.projectId
      if (filters.teamId)     params.teamId     = filters.teamId
      if (filters.startDate)  params.startDate  = filters.startDate
      if (filters.endDate)    params.endDate    = filters.endDate

      const res = await timesheetAnalyticsApi.getAnalytics(params)
      setData(res.data)
    } catch {
      toast.error('Failed to load timesheet analytics')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (id, status) => {
    try {
      const { timesheetsApi } = await import('../../api')
      await timesheetsApi.approve(id, status)
      toast.success(`Timesheet ${status.toLowerCase()}`)
      fetchData()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Timesheets</h1>
       
        </div>
        <ExportButton filters={filters} label="Export to Excel" />
      </div>

      <WeeklySummaryCards summary={data?.summary} loading={loading} />

      <TimesheetFilters
        filters={filters}
        onChange={setFilters}
        employees={employees}
        projects={projects}
        teams={teams}
        showTeam={true}
        showEmployee={true}
      />

      {data && !loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          {data.totalRecords} entries ·{' '}
          {Number(data.grouped?.reduce((s, p) => s + p.totalHours, 0) || 0).toFixed(1)}h total
        </div>
      )}

      <GroupedTimesheetTable
        data={data}
        loading={loading}
        canApprove={true}
        onApprove={handleApprove}
      />
    </div>
  )
}