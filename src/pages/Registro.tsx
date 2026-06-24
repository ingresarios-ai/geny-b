import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Eye, EyeOff, Lock, User, Mail, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const SUPABASE_FUNCTIONS_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://fduresfcgczpiijfzmeb.supabase.co') + '/functions/v1';

interface Invitation {
  name: string;
  email: string;
  expires_at: string;
}

type PageState = 'loading' | 'form' | 'success' | 'error';

export default function Registro() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setErrorMessage('No se proporcionó un enlace válido.');
      setPageState('error');
      return;
    }

    const fetchInvitation = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('name, email, expires_at, used_at')
        .eq('token', token)
        .single();

      if (error || !data) {
        setErrorMessage('Este enlace no es válido o no existe.');
        setPageState('error');
        return;
      }

      if (data.used_at) {
        setErrorMessage('Este enlace ya fue utilizado. Si necesitas ayuda, contacta a soporte.');
        setPageState('error');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setErrorMessage('Este enlace ha expirado. Solicita uno nuevo.');
        setPageState('error');
        return;
      }

      setInvitation({ name: data.name, email: data.email, expires_at: data.expires_at });
      setPageState('form');
    };

    fetchInvitation();
  }, [token]);

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: '', color: '', width: '0%' };
    if (pw.length < 6) return { label: 'Muy débil', color: '#ef4444', width: '20%' };
    if (pw.length < 8) return { label: 'Débil', color: '#f97316', width: '40%' };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [pw.length >= 10, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 3) return { label: 'Fuerte', color: '#22c55e', width: '100%' };
    if (score >= 2) return { label: 'Buena', color: '#eab308', width: '70%' };
    return { label: 'Regular', color: '#f97316', width: '50%' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/register-with-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'USER_EXISTS') {
          setFormError('Ya existe una cuenta con este correo. Intenta iniciar sesión.');
        } else {
          setFormError(data.error || 'Error al crear la cuenta.');
        }
        setSubmitting(false);
        return;
      }

      // Account created — now auto-login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: invitation!.email,
        password,
      });

      if (loginError) {
        console.warn('Auto-login failed:', loginError);
      }

      // Redirect directly to the app
      window.location.href = 'https://genyapp.ingresarios.ai/geny';
    } catch (_err) {
      setFormError('Error de conexión. Verifica tu internet e intenta de nuevo.');
      setSubmitting(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logo}>G</div>
          <span style={styles.logoText}>GENY</span>
        </div>

        {/* Loading State */}
        {pageState === 'loading' && (
          <div style={styles.card}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#FFD700' }} />
            <p style={styles.loadingText}>Verificando tu enlace...</p>
          </div>
        )}

        {/* Error State */}
        {pageState === 'error' && (
          <div style={styles.card}>
            <AlertCircle size={48} color="#ef4444" />
            <h2 style={styles.errorTitle}>Enlace no válido</h2>
            <p style={styles.errorText}>{errorMessage}</p>
            <a href="mailto:soporte@ingresarios.ai" style={styles.supportLink}>
              Contactar soporte
            </a>
          </div>
        )}

        {/* Success State */}
        {pageState === 'success' && (
          <div style={styles.card}>
            <div style={styles.successIcon}>
              <CheckCircle size={56} color="#22c55e" />
            </div>
            <h2 style={styles.successTitle}>¡Cuenta creada!</h2>
            <p style={styles.successText}>
              Tu cuenta ha sido creada exitosamente. Ya puedes acceder a la plataforma.
            </p>
            <a href="https://genyapp.ingresarios.ai/geny" style={styles.ctaButton}>
              Ir a la plataforma →
            </a>
          </div>
        )}

        {/* Registration Form */}
        {pageState === 'form' && invitation && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <ShieldCheck size={24} color="#FFD700" />
              <h2 style={styles.cardTitle}>Crea tu cuenta</h2>
              <p style={styles.cardSubtitle}>Solo necesitas definir tu contraseña para acceder.</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Name field — disabled */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <User size={14} style={{ marginRight: 6 }} />
                  Nombre
                </label>
                <div style={styles.disabledFieldWrap}>
                  <input
                    type="text"
                    value={invitation.name}
                    disabled
                    style={styles.disabledInput}
                  />
                  <Lock size={14} style={styles.lockIcon} />
                </div>
              </div>

              {/* Email field — disabled */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  <Mail size={14} style={{ marginRight: 6 }} />
                  Correo electrónico
                </label>
                <div style={styles.disabledFieldWrap}>
                  <input
                    type="email"
                    value={invitation.email}
                    disabled
                    style={styles.disabledInput}
                  />
                  <Lock size={14} style={styles.lockIcon} />
                </div>
              </div>

              {/* Password field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contraseña</label>
                <div style={styles.inputWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={styles.input}
                    autoFocus
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {password.length > 0 && (
                  <div style={styles.strengthWrap}>
                    <div style={styles.strengthBar}>
                      <div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} />
                    </div>
                    <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirmar contraseña</label>
                <div style={styles.inputWrap}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    style={styles.input}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p style={styles.mismatch}>Las contraseñas no coinciden</p>
                )}
              </div>

              {/* Form Error */}
              {formError && (
                <div style={styles.formErrorWrap}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || password.length < 8 || password !== confirmPassword}
                style={{
                  ...styles.submitBtn,
                  opacity: (submitting || password.length < 8 || password !== confirmPassword) ? 0.5 : 1,
                  cursor: (submitting || password.length < 8 || password !== confirmPassword) ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear mi cuenta'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <p style={styles.footer}>
          © {new Date().getFullYear()} Ingresarios · Todos los derechos reservados
        </p>
      </div>

      {/* Keyframes for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Inline Styles ───────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0a0e1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#f0f4ff',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px 16px',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #ffd700, #c5a300)',
    boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
    fontSize: 22,
    fontWeight: 900,
    color: '#0a0e1a',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 4,
    color: '#FFD700',
  },

  // Card
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '36px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },

  // Loading
  loadingText: {
    color: '#7b8cad',
    fontSize: 14,
    margin: 0,
  },

  // Error
  errorTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: '#f0f4ff',
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6,
  },
  supportLink: {
    color: '#FFD700',
    fontSize: 14,
    textDecoration: 'none',
    marginTop: 8,
  },

  // Success
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    color: '#f0f4ff',
  },
  successText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #ffd700, #c5a300)',
    color: '#0a0e1a',
    fontWeight: 700,
    fontSize: 15,
    borderRadius: 12,
    textDecoration: 'none',
    marginTop: 8,
    boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  // Form
  cardHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    color: '#f0f4ff',
  },
  cardSubtitle: {
    color: '#7b8cad',
    fontSize: 14,
    margin: 0,
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 0.3,
  },
  disabledFieldWrap: {
    position: 'relative',
  },
  disabledInput: {
    width: '100%',
    padding: '12px 40px 12px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    fontSize: 15,
    color: '#6b7280',
    outline: 'none',
    cursor: 'not-allowed',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  lockIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#4b5563',
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px 44px 12px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    fontSize: 15,
    color: '#f0f4ff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  strengthWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: 2,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s, background 0.3s',
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: 600,
    minWidth: 60,
    textAlign: 'right',
  },
  mismatch: {
    fontSize: 12,
    color: '#ef4444',
    margin: 0,
  },
  formErrorWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10,
    color: '#ef4444',
    fontSize: 13,
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #ffd700, #c5a300)',
    color: '#0a0e1a',
    fontWeight: 700,
    fontSize: 15,
    border: 'none',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(255,215,0,0.25)',
    transition: 'opacity 0.2s, transform 0.2s',
    fontFamily: 'inherit',
    marginTop: 4,
  },

  // Footer
  footer: {
    fontSize: 12,
    color: '#4b5563',
    margin: 0,
    textAlign: 'center',
  },
};
