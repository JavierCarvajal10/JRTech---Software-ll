import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { FIELD_LIMITS, MIN_PASSWORD, PATTERNS, MESSAGES } from '../lib/validation';

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register: registerUser } = useAuth();

  const fromPath = (location.state as { from?: string } | null)?.from ?? null;

  useEffect(() => {
    if (user) {
      const dest = fromPath ?? (user.role === 'ADMIN' ? '/admin' : '/');
      navigate(dest, { replace: true });
    }
  }, [user, fromPath, navigate]);

  const loginForm = useForm<LoginFormValues>({ defaultValues: { email: '', password: '' } });
  const registerForm = useForm<RegisterFormValues>({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const onLogin = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const u = await login(values.email, values.password);
      navigate(fromPath ?? (u.role === 'ADMIN' ? '/admin' : '/'), { replace: true });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    }
  };

  const onRegister = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const u = await registerUser(values);
      navigate(u.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
          <Link to="/" className="mb-8 inline-block">
            <h1 className="text-3xl font-extrabold text-gray-900">
              JR<span className="text-[#9146FF]">Tech</span>
            </h1>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </h2>

          {serverError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 mt-6">
              <div>
                <input
                  type="email"
                  maxLength={FIELD_LIMITS.email}
                  {...loginForm.register('email', {
                    required: 'Email obligatorio',
                    maxLength: { value: FIELD_LIMITS.email, message: MESSAGES.maxLength(FIELD_LIMITS.email) },
                    pattern: { value: PATTERNS.email, message: MESSAGES.email },
                  })}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-600 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={FIELD_LIMITS.password}
                    {...loginForm.register('password', {
                      required: 'Contraseña obligatoria',
                      maxLength: { value: FIELD_LIMITS.password, message: MESSAGES.maxLength(FIELD_LIMITS.password) },
                    })}
                    placeholder="Contraseña"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-600 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  to="/recuperar-password"
                  className="text-sm text-[#9146FF] hover:text-[#772CE8] font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105 mt-6 uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loginForm.formState.isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Iniciar sesión
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.firstName}
                    {...registerForm.register('firstName', {
                      required: 'Nombre obligatorio',
                      maxLength: { value: FIELD_LIMITS.firstName, message: MESSAGES.maxLength(FIELD_LIMITS.firstName) },
                    })}
                    placeholder="Primer nombre"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    maxLength={FIELD_LIMITS.lastName}
                    {...registerForm.register('lastName', {
                      required: 'Apellido obligatorio',
                      maxLength: { value: FIELD_LIMITS.lastName, message: MESSAGES.maxLength(FIELD_LIMITS.lastName) },
                    })}
                    placeholder="Primer apellido"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="email"
                  maxLength={FIELD_LIMITS.email}
                  {...registerForm.register('email', {
                    required: 'Email obligatorio',
                    maxLength: { value: FIELD_LIMITS.email, message: MESSAGES.maxLength(FIELD_LIMITS.email) },
                    pattern: { value: PATTERNS.email, message: MESSAGES.email },
                  })}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={FIELD_LIMITS.password}
                    {...registerForm.register('password', {
                      required: 'Contraseña obligatoria',
                      minLength: { value: MIN_PASSWORD, message: MESSAGES.minLength(MIN_PASSWORD) },
                      maxLength: { value: FIELD_LIMITS.password, message: MESSAGES.maxLength(FIELD_LIMITS.password) },
                    })}
                    placeholder={`Contraseña (mínimo ${MIN_PASSWORD} caracteres)`}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-red-600 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105 mt-6 uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {registerForm.formState.isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Registrarse
              </button>
            </form>
          )}
        </div>

        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#9146FF] to-[#772CE8] p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center text-white text-center order-1 md:order-2 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 py-4 md:py-0">
            {isLogin ? (
              <>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2 md:mb-4">¡Hola, Amigo!</h2>
                <p className="text-sm sm:text-base md:text-xl mb-4 md:mb-8 text-white/90 max-w-sm mx-auto">
                  Ingresa tus datos personales y comienza tu viaje con nosotros
                </p>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setServerError(null);
                  }}
                  className="px-8 sm:px-10 py-2.5 sm:py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-[#9146FF] transition-all uppercase tracking-wider text-sm sm:text-base"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2 md:mb-4">¡Bienvenido de nuevo!</h2>
                <p className="text-sm sm:text-base md:text-xl mb-4 md:mb-8 text-white/90 max-w-sm mx-auto">
                  Para mantenerte conectado con nosotros, inicia sesión con tu información personal
                </p>
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setServerError(null);
                  }}
                  className="px-8 sm:px-10 py-2.5 sm:py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-[#9146FF] transition-all uppercase tracking-wider text-sm sm:text-base"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>

          <Link to="/" className="hidden md:inline-block absolute bottom-6 text-white/80 hover:text-white text-sm transition-colors underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
