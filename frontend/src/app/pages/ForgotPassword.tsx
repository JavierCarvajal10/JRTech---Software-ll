import { useState } from 'react';
import { Link } from 'react-router';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { requestPasswordReset } from '../api/auth';
import { friendlyErrorMessage } from '../api/client';
import { FIELD_LIMITS, PATTERNS, MESSAGES } from '../lib/validation';

interface FormValues {
  email: string;
}

export function ForgotPassword() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<FormValues>({ defaultValues: { email: '' } });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await requestPasswordReset(values.email);
      setSubmittedEmail(values.email);
    } catch (e) {
      setServerError(friendlyErrorMessage(e));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
        <Link to="/" className="mb-6 inline-block">
          <h1 className="text-3xl font-extrabold text-gray-900">
            JR<span className="text-[#9146FF]">Tech</span>
          </h1>
        </Link>

        {submittedEmail ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
            <p className="text-gray-600 mb-6">
              Si <span className="font-semibold text-gray-900">{submittedEmail}</span> está
              registrado, te enviamos un enlace para restablecer tu contraseña.
              El enlace expira en <strong>1 hora</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              ¿No te llegó? Revisa la carpeta de spam o intenta de nuevo en unos minutos.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[#9146FF] hover:text-[#772CE8] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-600 mb-6">
              Ingresa tu correo electrónico y te enviaremos un enlace para crear una
              nueva contraseña.
            </p>

            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    maxLength={FIELD_LIMITS.email}
                    {...form.register('email', {
                      required: 'Email obligatorio',
                      maxLength: { value: FIELD_LIMITS.email, message: MESSAGES.maxLength(FIELD_LIMITS.email) },
                      pattern: { value: PATTERNS.email, message: MESSAGES.email },
                    })}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105 uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {form.formState.isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Enviar enlace
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#9146FF] font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
