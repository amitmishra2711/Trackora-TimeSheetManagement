import { useEffect, useState } from 'react'
import { timesheetsApi, projectsApi, tasksApi } from '../../api'
import { Modal, ConfirmDialog, Pagination, PageHeader, Spinner, EmptyState, StatusBadge } from '../../components/common'
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function TimesheetForm({ initial, projects, tasks, onSave, onClose, loading, isEdit }) {
  const [form, setForm] = useState({
    projectId: initial?.projectId || '',
    taskId: initial?.taskId || '',
    date: initial?.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0],
    hoursWorked: initial?.hoursWorked || '',
    description: initial?.description || ''
  })
  const [filteredTasks, setFilteredTasks] = useState([])

  useEffect(() => {
    if (form.projectId) setFilteredTasks(tasks.filter(t => t.projectId === Number(form.projectId)))
    else setFilteredTasks([])
  }, [form.projectId, tasks])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <form onSubmit={e => {
      e.preventDefault()
      onSave({ ...form, projectId: Number(form.projectId), taskId: Number(form.taskId), hoursWorked: parseFloat(form.hoursWorked) })
    }} className="space-y-4">
      <div><label className="label">Project</label>
        <select className="input" value={form.projectId} onChange={e => { setForm(f => ({ ...f, projectId: e.target.value, taskId: '' })) }} required>
          <option value="">Select project...</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div><label className="label">Task</label>
        <select className="input" value={form.taskId} onChange={set('taskId')} required disabled={!form.projectId}>
          <option value="">Select task...</option>
          {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={set('date')} required /></div>
        <div><label className="label">Hours Worked</label><input type="number" step="0.25" min="0.25" max="24" className="input" value={form.hoursWorked} onChange={set('hoursWorked')} required /></div>
      </div>
      <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={set('description')} /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : isEdit ? 'Update' : 'Log Time'}</button>
      </div>
    </form>
  )
}

export default function TimesheetsPage({ leaderView = false, employeeView = false }) {
  const { user, isAdmin, isLeader, isEmployee } = useAuth()
  const [data, setData] = useState({ items: [], totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      let res
      if (isEmployee) res = await timesheetsApi.getMine()
      else if (isLeader) {
        const teamRes = await import('../../api').then(m => m.teamsApi.getLeading())
        const teamId = teamRes.data?.[0]?.id
        if (teamId) res = await timesheetsApi.getByTeam(teamId)
        else res = { data: [] }
      } else res = await timesheetsApi.getAll({ page, pageSize: 20 })
      setData(Array.isArray(res.data) ? { items: res.data, totalPages: 1 } : res.data)
    } catch { toast.error('Failed to load') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])
  useEffect(() => {
    const loadMeta = async () => {
      const { projectsApi: pApi, tasksApi: tApi } = await import('../../api')
      const proj = isEmployee ? await pApi.getMine() : await pApi.getAll({ page: 1, pageSize: 100 })
      setProjects(Array.isArray(proj.data) ? proj.data : proj.data.items || [])
      const tsk = isEmployee ? await tApi.getMine() : await tApi.getAll({ page: 1, pageSize: 200 })
      setTasks(Array.isArray(tsk.data) ? tsk.data : tsk.data.items || [])
    }
    loadMeta().catch(() => {})
  }, [])

  const handleSave = async form => {
    setSaving(true)
    try {
      if (modal?.id) { await timesheetsApi.update(modal.id, form); toast.success('Updated') }
      else { await timesheetsApi.create(form); toast.success('Time logged!') }
      setModal(null); load()
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Failed') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await timesheetsApi.delete(deleteTarget.id); toast.success('Deleted'); setDeleteTarget(null); load() }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Failed') } finally { setSaving(false) }
  }

  const handleApprove = async (id, status) => {
    try { await timesheetsApi.approve(id, status); toast.success(`Timesheet ${status}`); load() }
    catch (err) { toast.error(typeof err === 'string' ? err : 'Failed') }
  }

  const items = data.items || data

  return (
    <div>
      <PageHeader title={isEmployee ? 'My Timesheets' : isLeader ? 'Team Timesheets' : 'All Timesheets'}
        action={isEmployee && <button onClick={() => setModal({})} className="btn-primary"><Plus size={16} /> Log Time</button>} />

      <div className="card">
        <div className="table-wrap rounded-xl">
          <table className="table">
            <thead><tr>
              {!isEmployee && <th>Employee</th>}
              <th>Project</th><th>Task</th><th>Date</th><th>Hours</th>
              <th>Status</th><th>Description</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={isEmployee ? 7 : 8} className="text-center py-10"><Spinner /></td></tr>
                : items.length === 0 ? <tr><td colSpan={isEmployee ? 7 : 8}><EmptyState message="No timesheets" /></td></tr>
                  : items.map(ts => (
                    <tr key={ts.id}>
                      {!isEmployee && <td className="font-medium">{ts.userName}</td>}
                      <td>{ts.projectName}</td>
                      <td className="max-w-xs truncate">{ts.taskTitle}</td>
                      <td className="text-gray-500">{new Date(ts.date).toLocaleDateString()}</td>
                      <td className="font-medium">{ts.hoursWorked}h</td>
                      <td><StatusBadge status={ts.status} /></td>
                      <td className="text-gray-500 max-w-xs truncate">{ts.description || '—'}</td>
                      <td>
                        <div className="flex gap-1">
                          {/* Employee: edit/delete if allowed */}
                          {isEmployee && ts.canEdit && (
                            <>
                              <button onClick={() => setModal(ts)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"><Pencil size={14} /></button>
                              <button onClick={() => setDeleteTarget(ts)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </>
                          )}
                          {/* Leader/Admin: approve/reject */}
                          {(isLeader || isAdmin) && ts.status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(ts.id, 'Approved')} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600" title="Approve"><CheckCircle size={14} /></button>
                              <button onClick={() => handleApprove(ts.id, 'Rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Reject"><XCircle size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {data.totalPages > 1 && <div className="p-4"><Pagination page={page} totalPages={data.totalPages} onPage={setPage} /></div>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit Timesheet' : 'Log Time'} size="lg">
        <TimesheetForm initial={modal?.id ? modal : null} projects={projects} tasks={tasks}
          onSave={handleSave} onClose={() => setModal(null)} loading={saving} isEdit={!!modal?.id} />
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={saving} title="Delete Timesheet" message="Delete this timesheet entry?" />
    </div>
  )
}
