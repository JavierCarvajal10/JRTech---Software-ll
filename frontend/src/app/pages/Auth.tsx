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
import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

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

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', loginData);
    // Aquí iría la lógica de autenticación
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', registerData);
    // Aquí iría la lógica de registro
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel - Form */}
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
          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleLoginSubmit} className="space-y-4 mt-8">
              {/* Email */}
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                required
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <a href="#" className="text-sm text-gray-600 hover:text-[#9146FF] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105 mt-6 uppercase tracking-wider"
              >
                Iniciar sesión
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="bg-white px-4 text-sm text-gray-500 absolute">o</span>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={() => {
                  alert('Iniciando sesión con Google...');
                  // Aquí iría la integración real con Google OAuth
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-8">
              {/* First Name & Last Name in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  placeholder="Primer nombre"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  required
                />
                <input
                  type="text"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  placeholder="Primer apellido"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  required
                />
              </div>

              {/* Email */}
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                required
              />

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:from-[#772CE8] hover:to-[#9146FF] text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-[#9146FF]/30 hover:shadow-[#9146FF]/50 hover:scale-105 mt-6 uppercase tracking-wider"
              >
                Registrarse
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="bg-white px-4 text-sm text-gray-500 absolute">o</span>
              </div>

              {/* Google Register */}
              <button
                type="button"
                onClick={() => {
                  alert('Registrándose con Google...');
                  // Aquí iría la integración real con Google OAuth
                }}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Registrarse con Google
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
        {/* Right Panel - Welcome Message */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#9146FF] to-[#772CE8] p-8 md:p-12 flex flex-col items-center justify-center text-white text-center order-1 md:order-2 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {isLogin ? (
              // Login Welcome
              <>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  ¡Hola, Amigo!
                </h2>
                <p className="text-lg md:text-xl mb-8 text-white/90 max-w-sm mx-auto">
                  Ingresa tus datos personales y comienza tu viaje con nosotros
                </p>
                <button
                  onClick={() => setIsLogin(false)}
                  className="px-10 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-[#9146FF] transition-all uppercase tracking-wider"
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
              // Register Welcome
              <>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  ¡Bienvenido de nuevo!
                </h2>
                <p className="text-lg md:text-xl mb-8 text-white/90 max-w-sm mx-auto">
                  Para mantenerte conectado con nosotros, inicia sesión con tu información personal
                </p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="px-10 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-[#9146FF] transition-all uppercase tracking-wider"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>

          <Link to="/" className="hidden md:inline-block absolute bottom-6 text-white/80 hover:text-white text-sm transition-colors underline">
          {/* Back to home link */}
          <Link 
            to="/" 
            className="absolute bottom-6 text-white/80 hover:text-white text-sm transition-colors underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
}
