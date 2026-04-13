import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teamsApi } from '../../api'
import { Spinner, EmptyState, StatusBadge, PageHeader } from '../../components/common'
import { ArrowLeft, Users, Mail, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teamsApi.getById(id)
      .then(r => setTeam(r.data))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={32} /></div>
  if (!team) return <div className="flex flex-col items-center py-20 text-gray-400"><p>Team not found.</p></div>

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-sm text-gray-500">Leader: {team.leaderName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl"><Users size={18} className="text-indigo-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Total Members</p>
            <p className="text-xl font-bold text-gray-900">{team.members?.length || 0}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-xl"><Shield size={18} className="text-purple-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Team Leader</p>
            <p className="text-sm font-bold text-gray-900">{team.leaderName}</p>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Members</h3>
        </div>
        {!team.members?.length
          ? <EmptyState message="No members in this team" icon={Users} />
          : (
            <div className="divide-y divide-gray-100">
              {team.members.map(m => (
                <div key={m.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.firstName} {m.lastName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                        <Mail size={11} />
                        {m.email}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={m.role} />
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}