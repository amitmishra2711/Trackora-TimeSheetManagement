import axios from 'axios'

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5244/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
 
// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  return Promise.reject(err.response?.data || err)
  }
)
 
export default api
 
// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
}
 
// ─── Users ────────────────────────────────────────────────
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getEmployees: () => api.get('/users/employees'),
  getLeaders: () => api.get('/users/leaders'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}
 
// ─── Teams ────────────────────────────────────────────────
export const teamsApi = {
  getAll: (params) => api.get('/teams', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  getMyTeam: () => api.get('/teams/my'),
  getLeading: () => api.get('/teams/leading'),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  addMember: (teamId, userId) => api.post(`/teams/${teamId}/members`, { userId }),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`)
}
 
// ─── Projects ─────────────────────────────────────────────
export const projectsApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getMine: () => api.get('/projects/my'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  assignTeam: (projectId, teamId) => api.post(`/projects/${projectId}/teams/${teamId}`),
  removeTeam: (projectId, teamId) => api.delete(`/projects/${projectId}/teams/${teamId}`)
}
 
export const tasksApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getMine: () => api.get('/tasks/my'),
  getByUser: (userId) => api.get(`/tasks/user/${userId}`),
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  selfAssign: (data) => api.post('/tasks/self-assign', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`)
}
 
export const timesheetsApi = {
  getAll: (params) => api.get('/timesheets', { params }),
  getMine: () => api.get('/timesheets/my'),
  getByTeam: (teamId) => api.get(`/timesheets/team/${teamId}`),
  getByMyTeams: () => api.get('/timesheets/my-teams'),
  getById: (id) => api.get(`/timesheets/${id}`),
  getByMemberAndProject: (userId, projectId) =>
    api.get(`/timesheets/member/${userId}/project/${projectId}`),
  create: (data) => api.post('/timesheets', data),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  delete: (id) => api.delete(`/timesheets/${id}`),
  approve: (id, status) => api.patch(`/timesheets/${id}/approve`, { status })
}
 
// ─── Reports ──────────────────────────────────────────────
export const reportsApi = {
  getAll: (teamId) => api.get('/reports', { params: { teamId } }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' })
}
 
