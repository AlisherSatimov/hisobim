import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, signUp, authErrorMessage, useShopStore } from '@hisobim/shared';

type FormData = {
  shopName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const navigate = useNavigate();
  const setShop = useShopStore((s) => s.setShop);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { shopName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async ({ shopName, email, password }: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const { session, shop } = await signUp(email.trim(), password, shopName.trim());

      // Sessiya yo'q = Supabase'da email tasdiqlash yoqilgan; do'kon ham
      // yaratilmagan, foydalanuvchi pochtasini tasdiqlab qaytadi.
      if (!session) {
        setInfoMsg('Hisob yaratildi. Pochtangizga yuborilgan xatni tasdiqlab, keyin kiring.');
        return;
      }

      setShop(shop);
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

        <h1>Ro'yxatdan o'tish</h1>
        <p className="subtitle">Do'koningiz uchun hisob yarating</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="shopName">Do'kon nomi</label>
            <input
              id="shopName"
              placeholder="Baraka do'koni"
              className={`input${errors.shopName ? ' invalid' : ''}`}
              {...register('shopName')}
            />
            {errors.shopName ? <div className="input-error">{errors.shopName.message}</div> : null}
          </div>

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
                autoComplete="new-password"
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

          <div className="field">
            <label htmlFor="confirmPassword">Parolni tasdiqlang</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input${errors.confirmPassword ? ' invalid' : ''}`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <div className="input-error">{errors.confirmPassword.message}</div>
            ) : null}
          </div>

          {errorMsg ? <div className="form-error">{errorMsg}</div> : null}
          {infoMsg ? <div className="form-info">{infoMsg}</div> : null}

          <button type="submit" className="btn full" disabled={isLoading}>
            {isLoading ? 'Yaratilmoqda…' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <div className="auth-switch">
          Hisobingiz bormi? <Link to="/login">Kiring</Link>
        </div>
      </div>
    </div>
  );
}
