import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signIn, authErrorMessage } from '@hisobim/shared';

type FormData = { email: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMsg(authErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-name">Hisobim</div>
          <div className="auth-brand-tagline">Do'koningiz uchun raqamli daftar</div>
        </div>

        <h1>Kirish</h1>
        <p className="subtitle">Email va parolingizni kiriting</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="misol@pochta.com"
              className={`input${errors.email ? ' invalid' : ''}`}
              {...register('email')}
            />
            {errors.email ? <div className="input-error">{errors.email.message}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="password">Parol</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`input${errors.password ? ' invalid' : ''}`}
                {...register('password')}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Yashirish' : "Ko'rsatish"}
              </button>
            </div>
            {errors.password ? <div className="input-error">{errors.password.message}</div> : null}
          </div>

          {errorMsg ? <div className="form-error">{errorMsg}</div> : null}

          <button type="submit" className="btn full" disabled={isLoading}>
            {isLoading ? 'Kirilmoqda…' : 'Kirish'}
          </button>
        </form>

        <div className="auth-switch">
          Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
        </div>
      </div>
    </div>
  );
}
