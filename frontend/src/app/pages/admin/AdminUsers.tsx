import { useEffect, useState } from "react";
import { Search, Mail, Phone, ShieldCheck, ShieldOff, UserPlus, Crown, X, Loader2 } from "lucide-react";
import {
  listUsers,
  promoteUser,
  demoteUser,
  createAdmin,
  type AdminUser,
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { friendlyErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { ErrorState } from "../../components/admin/ErrorState";
import { FIELD_LIMITS, MIN_PASSWORD, PATTERNS, MESSAGES } from "../../lib/validation";

const ROLE_BADGE: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800 border-amber-200",
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  CLIENTE: "bg-gray-100 text-gray-700 border-gray-200",
};

export function AdminUsers() {
  const { user: currentUser, isOwner } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handlePromote = async (u: AdminUser) => {
    if (!confirm(`¿Promover a ${u.email} a ADMIN?`)) return;
    try {
      await promoteUser(u.id);
      await refresh();
      showSuccess('Usuario promovido', `${u.email} ahora es ADMIN`);
    } catch (e) {
      showError('No se pudo promover', friendlyErrorMessage(e));
    }
  };

  const handleDemote = async (u: AdminUser) => {
    if (!confirm(`¿Degradar a ${u.email} a CLIENTE? Perderá acceso al panel admin.`)) return;
    try {
      await demoteUser(u.id);
      await refresh();
      showSuccess('Usuario degradado', `${u.email} ahora es CLIENTE`);
    } catch (e) {
      showError('No se pudo degradar', friendlyErrorMessage(e));
    }
  };

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.primerNombre.toLowerCase().includes(q) ||
      u.primerApellido.toLowerCase().includes(q)
    );
  });

  const counts = {
    total: users.length,
    owners: users.filter((u) => u.rol === "OWNER").length,
    admins: users.filter((u) => u.rol === "ADMIN").length,
    clientes: users.filter((u) => u.rol === "CLIENTE").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de usuarios</h1>
          <p className="text-gray-600 mt-1">Administra roles y permisos de la plataforma</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Crear admin
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.total} color="text-gray-900" />
        <StatCard label="Owners" value={counts.owners} color="text-amber-600" />
        <StatCard label="Admins" value={counts.admins} color="text-[#9146FF]" />
        <StatCard label="Clientes" value={counts.clientes} color="text-gray-700" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={FIELD_LIMITS.searchQuery}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#9146FF]" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contacto</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Registrado</th>
                  {isOwner && (
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {u.primerNombre} {u.primerApellido}
                          {isSelf && <span className="ml-2 text-xs text-gray-500">(tú)</span>}
                        </div>
                        <div className="text-sm text-gray-500">ID: {u.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {u.email}
                          </div>
                          {u.telefono && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {u.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            ROLE_BADGE[u.rol] ?? ROLE_BADGE.CLIENTE
                          }`}
                        >
                          {u.rol === "OWNER" && <Crown className="w-3 h-3" />}
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(u.fechaCreacion).toLocaleDateString("es-CO")}
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.rol === "CLIENTE" && (
                              <button
                                onClick={() => handlePromote(u)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-50 text-[#9146FF] hover:bg-purple-100 rounded-lg transition-colors font-medium"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                Promover
                              </button>
                            )}
                            {u.rol === "ADMIN" && !isSelf && (
                              <button
                                onClick={() => handleDemote(u)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium"
                              >
                                <ShieldOff className="w-4 h-4" />
                                Degradar
                              </button>
                            )}
                            {u.rol === "OWNER" && (
                              <span className="text-xs text-gray-500 italic">Inmutable</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isOwner ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                      No hay usuarios que coincidan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function CreateAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    primerNombre: "",
    primerApellido: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.primerNombre.trim()) e.primerNombre = MESSAGES.required;
    else if (form.primerNombre.length > FIELD_LIMITS.firstName)
      e.primerNombre = MESSAGES.maxLength(FIELD_LIMITS.firstName);
    if (!form.primerApellido.trim()) e.primerApellido = MESSAGES.required;
    else if (form.primerApellido.length > FIELD_LIMITS.lastName)
      e.primerApellido = MESSAGES.maxLength(FIELD_LIMITS.lastName);
    if (!form.email.trim()) e.email = MESSAGES.required;
    else if (!PATTERNS.email.test(form.email)) e.email = MESSAGES.email;
    else if (form.email.length > FIELD_LIMITS.email)
      e.email = MESSAGES.maxLength(FIELD_LIMITS.email);
    if (!form.password) e.password = MESSAGES.required;
    else if (form.password.length < MIN_PASSWORD)
      e.password = MESSAGES.minLength(MIN_PASSWORD);
    else if (form.password.length > FIELD_LIMITS.password)
      e.password = MESSAGES.maxLength(FIELD_LIMITS.password);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createAdmin(form);
      onCreated();
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Crear nuevo admin</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Primer nombre" required error={errors.primerNombre}>
            <input
              type="text"
              required
              maxLength={FIELD_LIMITS.firstName}
              value={form.primerNombre}
              onChange={(e) => setForm({ ...form, primerNombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
            />
          </Field>
          <Field label="Primer apellido" required error={errors.primerApellido}>
            <input
              type="text"
              required
              maxLength={FIELD_LIMITS.lastName}
              value={form.primerApellido}
              onChange={(e) => setForm({ ...form, primerApellido: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              required
              maxLength={FIELD_LIMITS.email}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
            />
          </Field>
          <Field label={`Contraseña (mín. ${MIN_PASSWORD} caracteres)`} required error={errors.password}>
            <input
              type="password"
              required
              minLength={MIN_PASSWORD}
              maxLength={FIELD_LIMITS.password}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF]"
            />
          </Field>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </label>
  );
}
