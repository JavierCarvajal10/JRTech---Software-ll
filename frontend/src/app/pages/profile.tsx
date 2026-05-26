import { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Lock,
  MapPin,
  Mail,
  Calendar,
  ShieldCheck,
  Crown,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchMe, type AuthUser } from '../api/auth';
import {
  updateMyProfile,
  changeMyPassword,
  fetchMyAddresses,
  createMyAddress,
  updateMyAddress,
  deleteMyAddress,
  type MyAddress,
  type AddressInput,
} from '../api/users';
import { friendlyErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FIELD_LIMITS, MIN_PASSWORD, PASSWORD_RULES, PATTERNS, MESSAGES, getPasswordError } from '../lib/validation';

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all disabled:opacity-60 disabled:cursor-not-allowed';

type TabKey = 'datos' | 'seguridad' | 'direcciones';

const TABS: { key: TabKey; label: string; icon: typeof UserIcon }[] = [
  { key: 'datos', label: 'Datos personales', icon: UserIcon },
  { key: 'seguridad', label: 'Seguridad', icon: Lock },
  { key: 'direcciones', label: 'Direcciones', icon: MapPin },
];

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>('datos');
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMe();
      setProfile(data);
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9146FF]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">{error ?? 'No pudimos cargar tu perfil'}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi perfil</h1>
          <p className="text-gray-600">Gestiona tus datos, contraseña y direcciones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar con info read-only y tabs */}
          <aside className="lg:col-span-1 space-y-4">
            <ProfileSummary profile={profile} />
            <nav className="bg-white rounded-2xl border-2 border-gray-200 p-2 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      isActive
                        ? 'bg-[#F5F0FF] text-[#9146FF] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-2">
            {activeTab === 'datos' && (
              <PersonalDataTab profile={profile} onUpdated={(p) => setProfile(p)} />
            )}
            {activeTab === 'seguridad' && <SecurityTab />}
            {activeTab === 'direcciones' && <AddressesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: AuthUser }) {
  const initial = profile.primerNombre.charAt(0).toUpperCase();
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3">
        {initial}
      </div>
      <h2 className="text-lg font-bold text-gray-900">
        {profile.primerNombre} {profile.primerApellido}
      </h2>
      <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
        <Mail className="w-3.5 h-3.5" />
        {profile.email}
      </div>
      <div className="mt-3">
        <RoleBadge role={profile.rol} />
      </div>
      {profile.fechaCreacion && (
        <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-3">
          <Calendar className="w-3 h-3" />
          Miembro desde {new Date(profile.fechaCreacion).toLocaleDateString('es-CO')}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: AuthUser['rol'] }) {
  if (role === 'OWNER') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
        <Crown className="w-3 h-3" /> OWNER
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-[#9146FF] text-xs font-bold rounded-full border border-purple-200">
        <ShieldCheck className="w-3 h-3" /> ADMIN
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-200">
      CLIENTE
    </span>
  );
}

function PersonalDataTab({
  profile,
  onUpdated,
}: {
  profile: AuthUser;
  onUpdated: (p: AuthUser) => void;
}) {
  const { refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    primerNombre: profile.primerNombre ?? '',
    segundoNombre: profile.segundoNombre ?? '',
    primerApellido: profile.primerApellido ?? '',
    segundoApellido: profile.segundoApellido ?? '',
    telefono: profile.telefono ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.primerNombre.trim()) e.primerNombre = MESSAGES.required;
    else if (form.primerNombre.length > FIELD_LIMITS.firstName)
      e.primerNombre = MESSAGES.maxLength(FIELD_LIMITS.firstName);
    if (form.segundoNombre.length > FIELD_LIMITS.firstName)
      e.segundoNombre = MESSAGES.maxLength(FIELD_LIMITS.firstName);
    if (!form.primerApellido.trim()) e.primerApellido = MESSAGES.required;
    else if (form.primerApellido.length > FIELD_LIMITS.lastName)
      e.primerApellido = MESSAGES.maxLength(FIELD_LIMITS.lastName);
    if (form.segundoApellido.length > FIELD_LIMITS.lastName)
      e.segundoApellido = MESSAGES.maxLength(FIELD_LIMITS.lastName);
    if (form.telefono.trim() && !PATTERNS.phone.test(form.telefono))
      e.telefono = MESSAGES.phone;
    else if (form.telefono.length > FIELD_LIMITS.phone)
      e.telefono = MESSAGES.maxLength(FIELD_LIMITS.phone);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const updated = await updateMyProfile(form);
      onUpdated(updated);
      await refreshUser();
      showSuccess('Datos actualizados', 'Tu perfil se guardó correctamente');
    } catch (err) {
      showError('No se pudo guardar', friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Datos personales</h2>
      <p className="text-sm text-gray-600 mb-6">Información básica de tu cuenta</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Primer nombre" required error={errors.primerNombre}>
            <input
              type="text"
              required
              maxLength={FIELD_LIMITS.firstName}
              value={form.primerNombre}
              onChange={(e) => setForm({ ...form, primerNombre: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Segundo nombre" error={errors.segundoNombre}>
            <input
              type="text"
              maxLength={FIELD_LIMITS.firstName}
              value={form.segundoNombre}
              onChange={(e) => setForm({ ...form, segundoNombre: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Primer apellido" required error={errors.primerApellido}>
            <input
              type="text"
              required
              maxLength={FIELD_LIMITS.lastName}
              value={form.primerApellido}
              onChange={(e) => setForm({ ...form, primerApellido: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Segundo apellido" error={errors.segundoApellido}>
            <input
              type="text"
              maxLength={FIELD_LIMITS.lastName}
              value={form.segundoApellido}
              onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Teléfono" error={errors.telefono}>
          <input
            type="tel"
            maxLength={FIELD_LIMITS.phone}
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="+57 300 000 0000"
            className={INPUT_CLASS}
          />
        </Field>

        <div className="pt-2 border-t border-gray-200 mt-6">
          <Field label="Email">
            <input type="email" value={profile.email} disabled className={`${INPUT_CLASS} text-gray-500`} />
          </Field>
          <p className="text-xs text-gray-500 mt-1">
            Para cambiar tu email contacta soporte.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const passwordError = getPasswordError(form.newPassword);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    if (form.newPassword !== form.confirm) {
      setValidationError(MESSAGES.passwordsDontMatch);
      return;
    }

    setSubmitting(true);
    try {
      await changeMyPassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      showSuccess('Contraseña actualizada', 'Tu nueva contraseña está activa');
    } catch (err) {
      showError('No se pudo actualizar', friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Seguridad</h2>
      <p className="text-sm text-gray-600 mb-6">Cambia tu contraseña periódicamente</p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <Field label="Contraseña actual" required>
          <input
            type="password"
            required
            maxLength={FIELD_LIMITS.password}
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label={`Nueva contraseña (mín. ${MIN_PASSWORD}, 1 mayúscula y 1 número)`} required>
          <input
            type="password"
            required
            minLength={MIN_PASSWORD}
            maxLength={PASSWORD_RULES.max}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Confirma la nueva contraseña" required>
          <input
            type="password"
            required
            maxLength={FIELD_LIMITS.password}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className={INPUT_CLASS}
          />
        </Field>

        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {validationError}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Cambiar contraseña
          </button>
        </div>
      </form>
    </div>
  );
}

function AddressesTab() {
  const { showSuccess, showError } = useToast();
  const [addresses, setAddresses] = useState<MyAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<MyAddress | 'new' | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyAddresses();
      setAddresses(data);
    } catch (e) {
      setError(friendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    try {
      await deleteMyAddress(id);
      await load();
      showSuccess('Dirección eliminada');
    } catch (err) {
      showError('No se pudo eliminar', friendlyErrorMessage(err));
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Mis direcciones</h2>
          <p className="text-sm text-gray-600">
            Guarda tus direcciones para que el checkout sea más rápido
          </p>
        </div>
        <button
          onClick={() => setEditingAddress('new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] transition-colors font-semibold flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#9146FF]" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#9146FF] text-white rounded-lg font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Intentar de nuevo
          </button>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>Aún no tienes direcciones guardadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border-2 border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-[#9146FF] transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <MapPin className="w-5 h-5 text-[#9146FF] flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{addr.direccion}</div>
                  <div className="text-sm text-gray-600">
                    {[addr.ciudad, addr.departamento, addr.pais].filter(Boolean).join(', ')}
                    {addr.codigoPostal && ` · ${addr.codigoPostal}`}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingAddress(addr)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingAddress && (
        <AddressModal
          address={editingAddress === 'new' ? null : editingAddress}
          onClose={() => setEditingAddress(null)}
          onSaved={async () => {
            setEditingAddress(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function AddressModal({
  address,
  onClose,
  onSaved,
}: {
  address: MyAddress | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<AddressInput>({
    direccion: address?.direccion ?? '',
    ciudad: address?.ciudad ?? '',
    departamento: address?.departamento ?? '',
    pais: address?.pais ?? 'Colombia',
    codigoPostal: address?.codigoPostal ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (address) {
        await updateMyAddress(address.id, form);
        showSuccess('Dirección actualizada');
      } else {
        await createMyAddress(form);
        showSuccess('Dirección agregada');
      }
      onSaved();
    } catch (err) {
      showError('No se pudo guardar', friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {address ? 'Editar dirección' : 'Nueva dirección'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Dirección" required>
            <input
              type="text"
              required
              maxLength={FIELD_LIMITS.address}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle, número, apartamento..."
              className={INPUT_CLASS}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ciudad">
              <input
                type="text"
                maxLength={FIELD_LIMITS.city}
                value={form.ciudad}
                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Departamento">
              <input
                type="text"
                maxLength={FIELD_LIMITS.city}
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="País">
              <input
                type="text"
                maxLength={FIELD_LIMITS.city}
                value={form.pais}
                onChange={(e) => setForm({ ...form, pais: e.target.value })}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Código postal">
              <input
                type="text"
                maxLength={20}
                value={form.codigoPostal}
                onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                className={INPUT_CLASS}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#9146FF] text-white rounded-lg hover:bg-[#7d3ce0] font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
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
      <span className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </label>
  );
}