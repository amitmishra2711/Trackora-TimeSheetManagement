import { useEffect, useState } from "react";
import { usersApi } from "../../api";
import {
  Modal,
  ConfirmDialog,
  StatusBadge,
  PageHeader,
  SearchInput,
  Pagination,
  Spinner,
  EmptyState,
} from "../../components/common";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const ROLES = ["Admin", "Leader", "Employee"];

function UserForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(
    initial || {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Employee",
      isActive: true,
    },
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isEdit = !!initial?.id;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">First Name</label>
          <input
            className="input"
            value={form.firstName}
            onChange={set("firstName")}
            required
          />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input
            className="input"
            value={form.lastName}
            onChange={set("lastName")}
            required
          />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          value={form.email}
          onChange={set("email")}
          required
        />
      </div>
      {!isEdit && (
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={set("password")}
            required
          />
        </div>
      )}
      <div>
        <label className="label">Role</label>
        <select className="input" value={form.role} onChange={set("role")}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
            className="rounded"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active
          </label>
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : isEdit ? "Update" : "Create User"}
        </button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const [data, setData] = useState({ items: [], totalCount: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page, pageSize: 10, search });
      setData(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal?.id) {
        await usersApi.update(modal.id, form);
        toast.success("User updated");
      } else {
        await usersApi.create(form);
        toast.success("User created");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await usersApi.delete(deleteTarget.id);
      toast.success("User deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${data.totalCount} users`}
        action={
          <button onClick={() => setModal("create")} className="btn-primary">
            <Plus size={16} /> Add User
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
            placeholder="Search users..."
          />
        </div>
        <div className="table-wrap rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
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
                    <EmptyState message="No users found" />
                  </td>
                </tr>
              ) : (
                data.items.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="text-gray-500">{u.email}</td>
                    <td>
                      <StatusBadge status={u.role} />
                    </td>
                    <td>
                      <span
                        className={
                          u.isActive ? "badge-approved" : "badge-rejected"
                        }
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal(u)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
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
        title={modal?.id ? "Edit User" : "Add New User"}
      >
        <UserForm
          initial={modal?.id ? modal : null}
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
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}?`}
      />
    </div>
  );
}
