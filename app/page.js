'use client';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import Feed from './components/Feed';
import BottomNav from './components/BottomNav';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--primary-bg)' }}>
        <div className="spinner" style={{ border: '2px solid transparent', borderTopColor: 'var(--text-primary)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) {
    return (
      <main style={{ paddingBottom: '70px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="glass" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>Gchat.</h1>
        </div>
        <Feed />
        <BottomNav />
      </main>
    );
  }

  return (
    <main style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: 'var(--primary-bg)' }}>
      <h1 className="text-gradient" style={{ fontSize: '5rem', marginBottom: '10px' }}>
        Gchat.
      </h1>
      <p style={{ color: 'var(--text-primary)', marginBottom: '80px', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>
        Ahmedabad Exclusive
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '320px' }}>
        <Link href="/login" style={{
          background: 'var(--text-primary)',
          color: 'var(--primary-bg)',
          padding: '16px',
          fontWeight: '600',
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          border: '1px solid var(--text-primary)',
          transition: 'all 0.3s'
        }}>
          Log In
        </Link>
        <Link href="/signup" style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          padding: '16px',
          fontWeight: '600',
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          border: '1px solid var(--text-primary)',
          transition: 'all 0.3s'
        }}>
          Apply
        </Link>
      </div>
    </main>
  );
}
