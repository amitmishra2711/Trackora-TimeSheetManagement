import { useEffect, useState } from "react";
import { teamsApi, usersApi, projectsApi } from "../../api";
import {
  Modal,
  ConfirmDialog,
  Pagination,
  PageHeader,
  SearchInput,
  Spinner,
  EmptyState,
  StatusBadge,
} from "../../components/common";
import { Plus, Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";
import toast from "react-hot-toast";

export function TeamsPage() {
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [memberModal, setMemberModal] = useState(null);
  const [addUserId, setAddUserId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamsApi.getAll({ page, pageSize: 10, search });
      setData(res.data);
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);
  useEffect(() => {
    usersApi
      .getLeaders()
      .then((r) => setLeaders(r.data))
      .catch(() => {});
    usersApi
      .getEmployees()
      .then((r) => setEmployees(r.data))
      .catch(() => {});
  }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal?.id) {
        await teamsApi.update(modal.id, form);
        toast.success("Team updated");
      } else {
        await teamsApi.create(form);
        toast.success("Team created");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await teamsApi.delete(deleteTarget.id);
      toast.success("Team deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    if (!addUserId) return;
    try {
      await teamsApi.addMember(memberModal.id, Number(addUserId));
      toast.success("Member added");
      load();
      setMemberModal(null);
    } catch {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await teamsApi.removeMember(teamId, userId);
      toast.success("Member removed");
      load();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle={`${data.totalCount} teams`}
        action={
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={16} /> New Team
          </button>
        }
      />

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search teams..."
          />
        </div>
        <div className="table-wrap rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Leader</th>
                <th>Members</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <Spinner />
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState message="No teams" />
                  </td>
                </tr>
              ) : (
                data.items.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.name}</td>
                    <td>{t.leaderName}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {t.members.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="badge bg-gray-100 text-gray-700 flex items-center gap-1"
                          >
                            {m.firstName} {m.lastName}
                            <button
                              onClick={() => handleRemoveMember(t.id, m.id)}
                              className="hover:text-red-500"
                            >
                              <UserMinus size={10} />
                            </button>
                          </span>
                        ))}
                        {t.members.length > 3 && (
                          <span className="badge bg-gray-100 text-gray-500">
                            +{t.members.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMemberModal(t)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600"
                          title="Add Member"
                        >
                          <UserPlus size={14} />
                        </button>
                        <button
                          onClick={() => setModal(t)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPage={setPage}
          />
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.id ? "Edit Team" : "Create Team"}
      >
        <TeamForm
          initial={modal}
          leaders={leaders}
          employees={employees}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      </Modal>

      <Modal
        open={!!memberModal}
        onClose={() => setMemberModal(null)}
        title={`Add Member to ${memberModal?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <select
            className="input"
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
          >
            <option value="">Select employee...</option>
            {employees
              .filter((e) => !memberModal?.members?.find((m) => m.id === e.id))
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
          </select>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setMemberModal(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleAddMember} className="btn-primary">
              Add
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Team"
        message={`Delete team "${deleteTarget?.name}"?`}
      />
    </div>
  );
}

function TeamForm({ initial, leaders, employees, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    leaderId: initial?.leaderId || "",
    memberIds: initial?.members?.map((m) => m.id) || [],
  });
  const toggleMember = (id) =>
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter((x) => x !== id)
        : [...f.memberIds, id],
    }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, leaderId: Number(form.leaderId) });
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Team Name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="label">Team Leader</label>
        <select
          className="input"
          value={form.leaderId}
          onChange={(e) => setForm((f) => ({ ...f, leaderId: e.target.value }))}
          required
        >
          <option value="">Select leader...</option>
          {leaders.map((l) => (
            <option key={l.id} value={l.id}>
              {l.firstName} {l.lastName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Members</label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
          {employees.map((e) => (
            <label
              key={e.id}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.memberIds.includes(e.id)}
                onChange={() => toggleMember(e.id)}
              />
              <span className="text-sm">
                {e.firstName} {e.lastName}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : initial?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}

export function ProjectsPage() {
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [teams, setTeams] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll({ page, pageSize: 10, search });
      setData(res.data);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);
  useEffect(() => {
    teamsApi
      .getAll({ page: 1, pageSize: 100 })
      .then((r) => setTeams(r.data.items || []))
      .catch(() => {});
  }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal?.id) {
        await projectsApi.update(modal.id, form);
        toast.success("Project updated");
      } else {
        await projectsApi.create(form);
        toast.success("Project created");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await projectsApi.delete(deleteTarget.id);
      toast.success("Deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Project Management"
        subtitle={`${data.totalCount} projects`}
        action={
          <button onClick={() => setModal({})} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        }
      />

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search projects..."
          />
        </div>
        <div className="table-wrap rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Status</th>
                <th>Teams</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Spinner />
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState message="No projects" />
                  </td>
                </tr>
              ) : (
                data.items.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td className="text-gray-500 max-w-xs truncate">
                      {p.description || "—"}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {p.teams?.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="badge bg-indigo-50 text-indigo-700"
                          >
                            {t.name}
                          </span>
                        ))}
                        {p.teams?.length > 2 && (
                          <span className="badge bg-gray-100 text-gray-500">
                            +{p.teams.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal(p)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPage={setPage}
          />
        </div>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.id ? "Edit Project" : "Create Project"}
      >
        <ProjectForm
          initial={modal}
          teams={teams}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete Project"
        message={`Delete project "${deleteTarget?.name}"?`}
      />
    </div>
  );
}

function ProjectForm({ initial, teams, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    status: initial?.status || "Active",
    teamIds: initial?.teams?.map((t) => t.id) || [],
  });
  const toggleTeam = (id) =>
    setForm((f) => ({
      ...f,
      teamIds: f.teamIds.includes(id)
        ? f.teamIds.filter((x) => x !== id)
        : [...f.teamIds, id],
    }));
  const STATUSES = ["Active", "Completed", "OnHold"];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Project Name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
      {initial?.id && (
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="label">Assign Teams</label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
          {teams.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.teamIds.includes(t.id)}
                onChange={() => toggleTeam(t.id)}
              />
              <span className="text-sm">
                {t.name} <span className="text-gray-400">({t.leaderName})</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : initial?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
