import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, UsersRound, FolderKanban, CheckSquare,
  Clock, FileText, MessageSquare, Bell, Activity, LogOut,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'

const navConfig = {
  Admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/teams', label: 'Teams', icon: UsersRound },
    { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { to: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/admin/timesheets', label: 'Timesheets', icon: Clock },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/activity', label: 'Activity Log', icon: Activity },
    { to: '/admin/chat', label: 'Chat', icon: MessageSquare },
  ],
  Leader: [
    { to: '/leader', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/leader/team', label: 'My Team', icon: UsersRound },
    { to: '/leader/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/leader/timesheets', label: 'Timesheets', icon: Clock },
    { to: '/leader/reports', label: 'Daily Reports', icon: FileText },
    { to: '/leader/chat', label: 'Chat', icon: MessageSquare },
  ],
  Employee: [
    { to: '/employee', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/employee/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/employee/timesheets', label: 'Timesheets', icon: Clock },
    { to: '/employee/chat', label: 'Chat', icon: MessageSquare },
  ]
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = navConfig[user?.role] || []
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase()

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300
      ${mobile ? 'w-64' : collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Clock size={16} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="text-lg font-bold text-gray-900">Trackora</span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
               ${collapsed && !mobile ? 'justify-center' : ''}`
            }>
            <Icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`p-3 border-t border-gray-100 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} title="Logout"
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex flex-col h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
            {initials}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const load = async () => {
    try {
      const { notificationsApi } = await import('../../api')
      const res = await notificationsApi.getAll()
      setNotifications(res.data)
    } catch {}
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); load() }}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-900">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No notifications</p>
            ) : notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
