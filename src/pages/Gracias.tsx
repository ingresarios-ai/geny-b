import { CheckCircle, Mail, KeyRound, ShieldCheck, Clock, MessageCircle } from 'lucide-react';

export default function Gracias() {
  return (
    <div style={styles.page}>
      {/* Background glows */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />
      <div style={styles.bgGlow3} />

      <div style={styles.container}>
        {/* ─── Header: Logo Ingresarios ─── */}
        <header style={styles.header}>
          <img
            src="/Ingresarios_logo_blanco.png"
            alt="Ingresarios"
            style={styles.headerLogo}
          />
        </header>

        {/* ─── Hero Card ─── */}
        <div style={styles.heroCard}>
          <div style={styles.successBadge}>
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <h1 style={styles.heroTitle}>¡Gracias por tu compra!</h1>
          <p style={styles.heroSubtitle}>
            Tu pago ha sido procesado exitosamente. A continuación te explicamos los siguientes pasos para acceder a tu plataforma.
          </p>
        </div>

        {/* ─── Video Section ─── */}
        <div style={styles.videoCard}>
          <div style={styles.videoWrapper}>
            {/* Placeholder para video — reemplaza el src con tu URL de video */}
            <div style={styles.videoPlaceholder}>
              <div style={styles.playButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" fill="#FFD700"/>
                </svg>
              </div>
              <p style={styles.videoPlaceholderText}>Video próximamente</p>
            </div>
          </div>
        </div>

        {/* ─── Instructions ─── */}
        <div style={styles.instructionsCard}>
          <div style={styles.instructionsHeader}>
            <h2 style={styles.instructionsTitle}>Próximos pasos</h2>
            <p style={styles.instructionsSubtitle}>Recibirás los siguientes correos en los próximos minutos</p>
          </div>

          {/* Step 1 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>
              <span style={styles.stepNumberText}>1</span>
            </div>
            <div style={styles.stepContent}>
              <div style={styles.stepIconRow}>
                <Mail size={18} color="#FFD700" />
                <h3 style={styles.stepTitle}>Confirmación de compra</h3>
              </div>
              <p style={styles.stepDescription}>
                Recibirás un correo de confirmación de compra de la plataforma de pago con los detalles de tu transacción.
              </p>
            </div>
          </div>

          <div style={styles.stepDivider} />

          {/* Step 2 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>
              <span style={styles.stepNumberText}>2</span>
            </div>
            <div style={styles.stepContent}>
              <div style={styles.stepIconRow}>
                <KeyRound size={18} color="#FFD700" />
                <h3 style={styles.stepTitle}>Acceso a la plataforma Ingresarios</h3>
              </div>
              <p style={styles.stepDescription}>
                Recibirás un correo con el asunto{' '}
                <strong style={styles.highlight}>"Tu nuevo acceso ha llegado"</strong>{' '}
                con las instrucciones para acceder a la plataforma principal de Ingresarios.
              </p>
            </div>
          </div>

          <div style={styles.stepDivider} />

          {/* Step 3 */}
          <div style={styles.step}>
            <div style={styles.stepNumber}>
              <span style={styles.stepNumberText}>3</span>
            </div>
            <div style={styles.stepContent}>
              <div style={styles.stepIconRow}>
                <ShieldCheck size={18} color="#FFD700" />
                <h3 style={styles.stepTitle}>Acceso a GENY B</h3>
              </div>
              <p style={styles.stepDescription}>
                Recibirás un correo con el asunto{' '}
                <strong style={styles.highlight}>"Crea tu cuenta en GENY B"</strong>{' '}
                que incluye un enlace único para configurar tu contraseña y activar tu acceso a la plataforma GENY B.
              </p>
              <div style={styles.stepNote}>
                <ShieldCheck size={14} color="#FFD700" />
                <span style={styles.stepNoteText}>
                  Tu nombre y correo ya estarán precargados. Solo necesitas crear tu contraseña.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Support Section ─── */}
        <div style={styles.supportCard}>
          <div style={styles.supportIconWrap}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <p style={styles.supportText}>
            Si en <strong style={styles.highlightTime}>15 minutos</strong> no recibes tus accesos, puedes escribir al correo{' '}
            <a href="mailto:alumnos@ingresarios.com" style={styles.supportLink}>
              alumnos@ingresarios.com
            </a>{' '}
            o al WhatsApp de soporte y con gusto alguien de mi equipo te ayudará a resolver el problema.
          </p>
          <a
            href="https://wa.link/3p0glu"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.whatsappBtn}
          >
            <MessageCircle size={20} />
            <span>Contactar por WhatsApp</span>
          </a>
        </div>

        {/* ─── Footer ─── */}
        <footer style={styles.footer}>
          <div style={styles.footerDivider} />
          <p style={styles.footerText}>
            © {new Date().getFullYear()} Ingresarios · Todos los derechos reservados
          </p>
        </footer>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0a0e1a',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#f0f4ff',
    position: 'relative',
    overflow: 'hidden',
    padding: '32px 16px 48px',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-15%',
    left: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow3: {
    position: 'absolute',
    top: '40%',
    right: '20%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.03) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '640px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },

  // Header
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0 16px',
  },
  headerLogo: {
    height: '44px',
    objectFit: 'contain',
  },

  // Hero Card
  heroCard: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '40px 28px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.1)',
    border: '2px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    background: 'linear-gradient(135deg, #f0f4ff, #FFD700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.7,
    maxWidth: '480px',
  },

  // Video
  videoCard: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9
  },
  videoPlaceholder: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(145deg, #111827, #0d1321)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(255,215,0,0.12)',
    border: '2px solid rgba(255,215,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  videoPlaceholderText: {
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
  },

  // Instructions
  instructionsCard: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  instructionsHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: '#f0f4ff',
  },
  instructionsSubtitle: {
    fontSize: 14,
    color: '#7b8cad',
    margin: 0,
  },

  // Steps
  step: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
    border: '1px solid rgba(255,215,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 15,
    fontWeight: 800,
    color: '#FFD700',
  },
  stepContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  stepIconRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    color: '#f0f4ff',
  },
  stepDescription: {
    fontSize: 14,
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.65,
  },
  highlight: {
    color: '#FFD700',
    fontWeight: 700,
  },
  stepNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: 6,
    padding: '8px 12px',
    background: 'rgba(255,215,0,0.06)',
    border: '1px solid rgba(255,215,0,0.12)',
    borderRadius: 8,
  },
  stepNoteText: {
    fontSize: 12,
    color: '#d4af37',
    lineHeight: 1.4,
  },
  stepDivider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    marginLeft: 52,
  },

  // Support
  supportCard: {
    width: '100%',
    background: 'rgba(245,158,11,0.05)',
    border: '1px solid rgba(245,158,11,0.15)',
    borderRadius: 20,
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  supportIconWrap: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'rgba(245,158,11,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#9ca3af',
    margin: 0,
    lineHeight: 1.7,
    maxWidth: '480px',
  },
  highlightTime: {
    color: '#f59e0b',
  },
  supportLink: {
    color: '#FFD700',
    textDecoration: 'none',
    fontWeight: 600,
  },
  whatsappBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 28px',
    background: '#25D366',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 12,
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  // Footer
  footer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px',
  },
  footerDivider: {
    width: '60%',
    height: 1,
    background: 'rgba(255,255,255,0.06)',
  },
  footerText: {
    fontSize: 12,
    color: '#4b5563',
    margin: 0,
    textAlign: 'center',
  },
};
