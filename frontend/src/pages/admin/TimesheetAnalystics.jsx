import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { timesheetAnalyticsApi, timesheetsApi, usersApi, projectsApi, teamsApi } from '../../api'
import { Spinner, EmptyState, StatusBadge } from '../../components/common'
import {
  Clock, Download, Calendar, Filter, X,
  ChevronUp, ChevronDown, Users, FolderKanban, CheckCircle, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth } from 'date-fns'

function WeeklySummaryCards({ summary, loading }) {
  const cards = [
    { label: 'This Month',    value: summary?.thisMonth ?? 0, bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200' },
    { label: 'Week 1  (1–7)',  value: summary?.week1    ?? 0, bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200'   },
    { label: 'Week 2  (8–14)', value: summary?.week2    ?? 0, bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-200' },
    { label: 'Week 3 (15–21)', value: summary?.week3    ?? 0, bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
    { label: 'Week 4  (22+)',  value: summary?.week4    ?? 0, bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div key={i} className={`bg-white rounded-2xl border ${c.border} p-4 shadow-sm`}>
          <div className={`w-8 h-8 ${c.bg} rounded-xl flex items-center justify-center mb-2`}>
            <Clock size={15} className={c.text} />
          </div>
          <p className="text-xs text-gray-500 font-medium">{c.label}</p>
          {loading
            ? <div className="h-7 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            : <p className={`text-2xl font-bold ${c.text} mt-0.5`}>
                {Number(c.value).toFixed(1)}<span className="text-sm font-medium ml-0.5">h</span>
              </p>
          }
        </div>
      ))}
    </div>
  )
}

function FilterPanel({ filters, onChange, employees, projects, teams, showTeam, showEmployee }) {
  const [open, setOpen] = useState(true)

  const set = k => e => onChange({ ...filters, [k]: e.target.value })
  const clear = () => onChange({ employeeId: '', projectId: '', teamId: '', startDate: '', endDate: '' })

  const activeCount = [filters.employeeId, filters.projectId, filters.teamId,
    filters.startDate, filters.endDate].filter(Boolean).length

  const preset = key => {
    const now = new Date()
    const map = {
      'this-month': { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') },
      'this-week': (() => {
        const d = now.getDay(); const mon = new Date(now); mon.setDate(now.getDate() - (d === 0 ? 6 : d - 1))
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
        return { startDate: format(mon, 'yyyy-MM-dd'), endDate: format(sun, 'yyyy-MM-dd') }
      })(),
      'last-7':  { startDate: format(new Date(now - 6 * 86400000), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') },
      'last-30': { startDate: format(new Date(now - 29 * 86400000), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') },
    }
    if (map[key]) onChange({ ...filters, ...map[key] })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-500" />
          <span className="font-semibold text-sm text-gray-900">Filters</span>
          {activeCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button onClick={e => { e.stopPropagation(); clear() }}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
              <X size={11} /> Clear all
            </button>
          )}
          {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 pt-4 mb-4 items-center">
            <span className="text-xs text-gray-400 font-medium">Quick:</span>
            {[
              { key: 'this-week', label: 'This Week' },
              { key: 'this-month', label: 'This Month' },
              { key: 'last-7', label: 'Last 7 Days' },
              { key: 'last-30', label: 'Last 30 Days' },
            ].map(p => (
              <button key={p.key} onClick={() => preset(p.key)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-medium">
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {showEmployee && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Employee</label>
                <select className="input text-sm" value={filters.employeeId} onChange={set('employeeId')}>
                  <option value="">All employees</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Project</label>
              <select className="input text-sm" value={filters.projectId} onChange={set('projectId')}>
                <option value="">All projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {showTeam && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Team</label>
                <select className="input text-sm" value={filters.teamId} onChange={set('teamId')}>
                  <option value="">All teams</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">From Date</label>
              <input type="date" className="input text-sm" value={filters.startDate} onChange={set('startDate')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">To Date</label>
              <input type="date" className="input text-sm" value={filters.endDate} onChange={set('endDate')} />
            </div>
          </div>

          {activeCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {filters.employeeId && (() => { const e = employees.find(x => x.id === Number(filters.employeeId)); return e ? <Chip key="emp" label={`Employee: ${e.firstName} ${e.lastName}`} onRemove={() => onChange({ ...filters, employeeId: '' })} color="indigo" /> : null })()}
              {filters.projectId  && (() => { const p = projects.find(x => x.id === Number(filters.projectId)); return p ? <Chip key="proj" label={`Project: ${p.name}`} onRemove={() => onChange({ ...filters, projectId: '' })} color="blue" /> : null })()}
              {filters.teamId     && (() => { const t = teams.find(x => x.id === Number(filters.teamId)); return t ? <Chip key="team" label={`Team: ${t.name}`} onRemove={() => onChange({ ...filters, teamId: '' })} color="purple" /> : null })()}
              {filters.startDate  && <Chip key="from" label={`From: ${filters.startDate}`} onRemove={() => onChange({ ...filters, startDate: '' })} color="green" />}
              {filters.endDate    && <Chip key="to"   label={`To: ${filters.endDate}`}     onRemove={() => onChange({ ...filters, endDate: '' })}   color="green" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove, color = 'gray' }) {
  const c = { indigo: 'bg-indigo-100 text-indigo-700', blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700', green: 'bg-green-100 text-green-700', gray: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c[color]}`}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70"><X size={10} /></button>
    </span>
  )
}

function SortTh({ col, label, sortCol, sortDir, onSort, className = '' }) {
  const active = sortCol === col
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="flex flex-col ml-0.5 leading-none">
          <ChevronUp   size={9} className={active && sortDir === 'asc'  ? 'text-indigo-600' : 'text-gray-500'} />
          <ChevronDown size={9} className={active && sortDir === 'desc' ? 'text-indigo-600' : 'text-gray-500'} />
        </span>
      </div>
    </th>
  )
}

function FlatTimesheetTable({ rows, loading, canApprove, onApprove }) {
  const [sortCol, setSortCol] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = col => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const sorted = useMemo(() => {
    if (!rows?.length) return []
    return [...rows].sort((a, b) => {
      let av, bv
      switch (sortCol) {
        case 'date':       av = new Date(a.date).getTime();  bv = new Date(b.date).getTime(); break
        case 'employee':   av = a.userName;     bv = b.userName;     break
        case 'project':    av = a.projectName;  bv = b.projectName;  break
        case 'team':       av = a.teamName;     bv = b.teamName;     break
        case 'task':       av = a.taskTitle;    bv = b.taskTitle;    break
        case 'day':        av = a.dayOfWeek;    bv = b.dayOfWeek;    break
        case 'status':     av = a.status;       bv = b.status;       break
        case 'hours':      av = a.hoursWorked;  bv = b.hoursWorked;  break
        default:           av = a.timesheetId;  bv = b.timesheetId;  break
      }
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''))
    })
  }, [rows, sortCol, sortDir])

  const totalHours = useMemo(() =>
    sorted.reduce((s, r) => s + Number(r.hoursWorked), 0), [sorted])

  const thProps = { sortCol, sortDir, onSort: handleSort }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 flex flex-col items-center gap-3">
        <Spinner size={32} className="text-indigo-600" />
        <p className="text-sm text-gray-500">Loading timesheet data…</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm ">
          <thead className="bg-gray-50 border-b border-gray-200 ">
            <tr>
              <SortTh col="employee" label="Employee"     {...thProps} />
              <SortTh col="project"  label="Project"      {...thProps} />
              <SortTh col="team"     label="Team"         {...thProps} />
              <SortTh col="task"     label="Task"         {...thProps} />
              <SortTh col="date"     label="Date"  {...thProps} />
              <SortTh col="day"      label="Day"          {...thProps} />
              <SortTh col="status"   label="Status"       {...thProps} />
              <SortTh  col="hours"    label="Hours"        {...thProps} className="text-right" />
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={canApprove ? 9 : 8}>
                  <EmptyState message="No timesheet entries match your filters" icon={Clock} />
                </td>
              </tr>
            ) : sorted.map((row, idx) => (
              <tr
                key={row.timesheetId}
                className={`border-t border-gray-100 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {row.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 whitespace-nowrap">{row.userName}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-medium max-w-[130px] truncate" title={row.projectName}>
                    <FolderKanban size={10} />
                    {row.projectName}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg font-medium max-w-[120px] truncate" title={row.teamName}>
                    <Users size={10} />
                    {row.teamName}
                  </span>
                </td>

                <td className="px-4 py-3 max-w-[160px]">
                  <span className="text-gray-700 text-sm truncate block" title={row.taskTitle}>
                    {row.taskTitle}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(row.date), 'dd MMM yyyy')}
                    </p>
                    
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 font-medium">{row.dayOfWeek}</span>
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>

                <td className="px-4 py-3 text-left">
                  <span className="text-sm font-bold text-indigo-700 ">
                    {Number(row.hoursWorked).toFixed(1)}h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="border-t border-gray-200 bg-indigo-600 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-100">
            {sorted.length} entr{sorted.length !== 1 ? 'ies' : 'y'} shown
          </span>
          <div className="flex items-center gap-2">
            <span className="text-indigo-200 text-sm">Total hours:</span>
            <span className="text-white text-xl font-black">
              {totalHours.toFixed(1)}h
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function ExportButton({ filters, label = 'Export Excel' }) {
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
      toast.success('Exported! Includes Summary, By Project, By Team, By Employee sheets.')
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

function useTimesheetPage(isLeader = false) {
  const EMPTY = { employeeId: '', projectId: '', teamId: '', startDate: '', endDate: '' }
  const [filters, setFilters] = useState(EMPTY)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const [projects,  setProjects]  = useState([])
  const [teams,     setTeams]     = useState([])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        if (isLeader) {
          const tRes = await teamsApi.getLeading()
          const myTeams = tRes.data || []
          setTeams(myTeams)
          const memberMap = new Map()
          myTeams.flatMap(t => t.members || []).forEach(m => memberMap.set(m.id, m))
          setEmployees([...memberMap.values()])
          const pRes = await projectsApi.getAll({ page: 1, pageSize: 100 })
          const myTeamIds = new Set(myTeams.map(t => t.id))
          setProjects((pRes.data?.items || []).filter(p => p.teams?.some(t => myTeamIds.has(t.id))))
        } else {
          const [eRes, pRes, tRes] = await Promise.all([
            usersApi.getEmployees(),
            projectsApi.getAll({ page: 1, pageSize: 100 }),
            teamsApi.getAll({ page: 1, pageSize: 100 }),
          ])
          setEmployees(eRes.data || [])
          setProjects(pRes.data?.items || [])
          setTeams(tRes.data?.items || [])
        }
      } catch {}
    }
    loadMeta()
  }, [isLeader])

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
      toast.error('Failed to load timesheet data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (id, status) => {
    try {
      await timesheetsApi.approve(id, status)
      toast.success(`Timesheet ${status.toLowerCase()}`)
      fetchData()
    } catch { toast.error('Failed to update') }
  }

  return { filters, setFilters, data, loading, employees, projects, teams, handleApprove, fetchData }
}

export function AdminTimesheetPage() {
  const { filters, setFilters, data, loading, employees, projects, teams, handleApprove } =
    useTimesheetPage(false)

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All employees · Filter, sort, approve and export
          </p>
        </div>
        <ExportButton filters={filters} label="Export to Excel" />
      </div>

      <WeeklySummaryCards summary={data?.summary} loading={loading} />

      <FilterPanel
        filters={filters} onChange={setFilters}
        employees={employees} projects={projects} teams={teams}
        showTeam showEmployee
      />

      {data && !loading && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          {data.totalRecords} entr{data.totalRecords !== 1 ? 'ies' : 'y'} · sorted by latest date first
        </p>
      )}

      <FlatTimesheetTable
        rows={data?.rows}
        loading={loading}
        canApprove
        onApprove={handleApprove}
      />
    </div>
  )
}

export function LeaderTimesheetPage() {
  const { filters, setFilters, data, loading, employees, projects, teams, handleApprove } =
    useTimesheetPage(true)

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Timesheets</h1>
         
        </div>
        <ExportButton filters={filters} label="Export to Excel" />
      </div>

      <WeeklySummaryCards summary={data?.summary} loading={loading} />

      <FilterPanel
        filters={filters} onChange={setFilters}
        employees={employees} projects={projects} teams={teams}
        showTeam showEmployee
      />

      {data && !loading && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          {data.totalRecords} entr{data.totalRecords !== 1 ? 'ies' : 'y'} · sorted by latest date first
        </p>
      )}

      <FlatTimesheetTable
        rows={data?.rows}
        loading={loading}
        canApprove
        onApprove={handleApprove}
      />
    </div>
  )
}