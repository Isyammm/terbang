import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Plane, AlertCircle, CheckCircle2 } from 'lucide-react';
import './LoginModal.css';

export interface UserAccount {
  id?: number;
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

type ModalMode = 'login' | 'register';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const ACCOUNTS_KEY = 'flyease_accounts';
const DEFAULT_ACCOUNTS: UserAccount[] = [
  { name: 'Hisyam Yassar', email: 'hisyam.yassar@gmail.com', password: 'password123' },
  { name: 'Hisyam', email: 'hisyam@example.com', password: 'hisyam123' },
];

const getStoredAccounts = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(ACCOUNTS_KEY);
    if (saved) {
      let accounts: UserAccount[] = JSON.parse(saved);
      // Migrate: hapus akun lama adrian.wijaya jika masih ada
      const hasOld = accounts.some(a => a.email === 'adrian.wijaya@gmail.com');
      if (hasOld) {
        accounts = accounts.filter(a => a.email !== 'adrian.wijaya@gmail.com');
        if (!accounts.find(a => a.email === 'hisyam.yassar@gmail.com')) {
          accounts.unshift({ name: 'Hisyam Yassar', email: 'hisyam.yassar@gmail.com', password: 'password123' });
        }
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      }
      return accounts;
    }
  } catch {}
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
};

// --- Validation Helpers ---
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email tidak boleh kosong.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid (contoh: nama@domain.com).';
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password tidak boleh kosong.';
  if (password.length < 6) return 'Password minimal harus 6 karakter.';
};

const validateName = (name: string): string | undefined => {
  if (!name.trim()) return 'Nama tidak boleh kosong.';
  if (name.trim().length < 3) return 'Nama minimal 3 karakter.';
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Nama hanya boleh berisi huruf dan spasi.';
};

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<ModalMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when mode changes or modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => resetForm(), 300);
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const switchMode = () => {
    resetForm();
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors: FormErrors = { ...errors };
    if (field === 'name' && mode === 'register') {
      newErrors.name = validateName(name);
    }
    if (field === 'email') {
      newErrors.email = validateEmail(email);
    }
    if (field === 'password') {
      newErrors.password = validatePassword(password);
    }
    if (field === 'confirmPassword' && mode === 'register') {
      if (!confirmPassword) newErrors.confirmPassword = 'Konfirmasi password tidak boleh kosong.';
      else if (confirmPassword !== password) newErrors.confirmPassword = 'Password dan konfirmasi password tidak cocok.';
      else newErrors.confirmPassword = undefined;
    }
    setErrors(newErrors);
  };

  const getFieldStatus = (field: string, value: string): 'idle' | 'valid' | 'invalid' => {
    if (!touched[field]) return 'idle';
    if (field === 'name') return validateName(value) ? 'invalid' : 'valid';
    if (field === 'email') return validateEmail(value) ? 'invalid' : 'valid';
    if (field === 'password') return validatePassword(value) ? 'invalid' : 'valid';
    if (field === 'confirmPassword') {
      if (!value) return 'invalid';
      return value === password ? 'valid' : 'invalid';
    }
    return 'idle';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = { email: true, password: true };
    if (mode === 'register') { allTouched.name = true; allTouched.confirmPassword = true; }
    setTouched(allTouched);

    // Validate all fields
    const newErrors: FormErrors = {};
    if (mode === 'register') {
      newErrors.name = validateName(name);
    }
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    if (mode === 'register') {
      if (!confirmPassword) newErrors.confirmPassword = 'Konfirmasi password tidak boleh kosong.';
      else if (confirmPassword !== password) newErrors.confirmPassword = 'Password dan konfirmasi password tidak cocok.';
    }

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // ── Coba gunakan backend API (XAMPP) ──────────────────────
    try {
      if (window.location.hostname !== 'localhost') {
        throw new Error('Not on localhost');
      }
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { name: name.trim(), email, password };

      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        // Error dari server (email salah, sudah terdaftar, dll)
        if (res.status === 409) setErrors({ email: data.error });
        else if (res.status === 401) setErrors({ general: data.error });
        else setErrors({ general: data.error || 'Terjadi kesalahan.' });
        setIsSubmitting(false);
        return;
      }

      // Sukses via backend
      const user: UserAccount = { ...data.user, password };
      onLoginSuccess(user);
      onClose();
      return;
    } catch {
      // Backend tidak tersedia → fallback ke localStorage
      console.warn('Backend tidak tersedia, menggunakan localStorage fallback');
    }

    // ── Fallback: localStorage (tanpa backend) ─────────────────
    const accounts = getStoredAccounts();
    if (mode === 'login') {
      const user = accounts.find(a => a.email === email && a.password === password);
      if (!user) {
        setErrors({ general: 'Email atau password salah. Periksa kembali akun Anda.' });
        setIsSubmitting(false);
        return;
      }
      onLoginSuccess(user);
      onClose();
    } else {
      // Register mode
      const exists = accounts.find(a => a.email === email);
      if (exists) {
        setErrors({ email: 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.' });
        setIsSubmitting(false);
        return;
      }
      const newUser: UserAccount = { name: name.trim(), email, password };
      const updatedAccounts = [...accounts, newUser];
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      onLoginSuccess(newUser);
      onClose();
    }
  };

  if (!isOpen) return null;

  const emailStatus = getFieldStatus('email', email);
  const passwordStatus = getFieldStatus('password', password);
  const nameStatus = mode === 'register' ? getFieldStatus('name', name) : 'idle';
  const confirmStatus = mode === 'register' ? getFieldStatus('confirmPassword', confirmPassword) : 'idle';

  return (
    <div className="login-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-modal animated-fade-in">
        {/* Header */}
        <div className="login-modal-header">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Plane size={20} />
            </div>
            <span className="login-brand-name">FlyEase</span>
          </div>
          <button className="login-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div className="login-modal-title-block">
          <h2 className="login-title">
            {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h2>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Masuk untuk mengakses riwayat pemesanan dan fitur premium.'
              : 'Daftar gratis dan mulai pesan tiket penerbangan impianmu.'}
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="login-error-banner">
            <AlertCircle size={15} />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          
          {/* Name Field (register only) */}
          {mode === 'register' && (
            <div className="form-field">
              <label className="form-label" htmlFor="login-name">Nama Lengkap</label>
              <div className={`input-wrapper ${nameStatus !== 'idle' ? nameStatus : ''}`}>
                <User size={16} className="input-icon" />
                <input
                  id="login-name"
                  type="text"
                  className="login-input"
                  placeholder="Nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  autoComplete="name"
                />
                {nameStatus === 'valid' && <CheckCircle2 size={16} className="status-icon valid" />}
                {nameStatus === 'invalid' && <AlertCircle size={16} className="status-icon invalid" />}
              </div>
              {touched.name && errors.name && (
                <p className="field-error-msg"><AlertCircle size={12} />{errors.name}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">Email</label>
            <div className={`input-wrapper ${emailStatus !== 'idle' ? emailStatus : ''}`}>
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
              />
              {emailStatus === 'valid' && <CheckCircle2 size={16} className="status-icon valid" />}
              {emailStatus === 'invalid' && <AlertCircle size={16} className="status-icon invalid" />}
            </div>
            {touched.email && errors.email && (
              <p className="field-error-msg"><AlertCircle size={12} />{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className={`input-wrapper ${passwordStatus !== 'idle' ? passwordStatus : ''}`}>
              <Lock size={16} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(p => !p)}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="field-error-msg"><AlertCircle size={12} />{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field (register only) */}
          {mode === 'register' && (
            <div className="form-field">
              <label className="form-label" htmlFor="login-confirm-password">Konfirmasi Password</label>
              <div className={`input-wrapper ${confirmStatus !== 'idle' ? confirmStatus : ''}`}>
                <Lock size={16} className="input-icon" />
                <input
                  id="login-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Ulangi password Anda"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="field-error-msg"><AlertCircle size={12} />{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            id="login-submit-button"
            disabled={isSubmitting}
          >
            {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}
          </button>
        </form>

        {/* Mode Switch Footer */}
        <div className="login-footer">
          <span>
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          </span>
          <button className="switch-mode-btn" onClick={switchMode} type="button">
            {mode === 'login' ? 'Daftar di sini' : 'Masuk'}
          </button>
        </div>

        {/* Demo Hint */}
        {mode === 'login' && (
          <div className="demo-hint">
            <span>Demo: <strong>hisyam.yassar@gmail.com</strong> / <strong>password123</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
