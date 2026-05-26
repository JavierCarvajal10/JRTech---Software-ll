import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../api/auth';
import { friendlyErrorMessage } from '../api/client';
import { PASSWORD_RULES, MIN_PASSWORD, MESSAGES, getPasswordError } from '../lib/validation';

interface FormValues {
  newPassword: string;
  confirm: string;
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({ defaultValues: { newPassword: '', confirm: '' } });

  const newPasswordValue = form.watch('newPassword');

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    if (!token) {
      setServerError('Falta el token de recuperación');
      return;
    }
    try {
      await resetPassword(token, values.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (e) {
      setServerError(friendlyErrorMessage(e));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
          <p className="text-gray-600 mb-6">
            Este enlace de recuperación no es válido. Solicita uno nuevo.
          </p>
          <Link
            to="/recuperar-password"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9146FF] text-white rounded-full font-semibold hover:bg-[#7d3ce0] transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <Link to="/" className="mb-6 inline-block">
          <h1 className="text-3xl font-extrabold text-gray-900">
            JR<span className="text-[#9146FF]">Tech</span>
          </h1>
        </Link>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-gray-600">
              Tu contraseña se cambió correctamente. Te redirigimos al inicio de sesión…
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea una nueva contraseña</h2>
            <p className="text-gray-600 mb-6">
              Elige una contraseña segura de al menos {MIN_PASSWORD} caracteres.
            </p>

            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={PASSWORD_RULES.max}
                    {...form.register('newPassword', {
                      required: 'Contraseña obligatoria',
                      validate: (v) => getPasswordError(v) ?? true,
                    })}
                    placeholder={`Mínimo ${MIN_PASSWORD} caracteres, 1 mayúscula y 1 número`}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {form.formState.errors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  maxLength={PASSWORD_RULES.max}
                  {...form.register('confirm', {
                    required: 'Confirma tu contraseña',
                    validate: (value) =>
                      value === newPasswordValue || MESSAGES.passwordsDontMatch,
                  })}
                  placeholder="Confirma tu contraseña"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                />
                {form.formState.errors.confirm && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.confirm.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105 uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {form.formState.isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Cambiar contraseña
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
