'use client';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import Feed from './components/Feed';
import BottomNav from './components/BottomNav';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) {
    return (
      <main style={{ paddingBottom: '70px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="glass" style={{ position: 'sticky', top: 0, zIndex: 10, padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gchat</h1>
        </div>
        <Feed />
        <BottomNav />
      </main>
    );
  }

  return (
    <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
        Gchat
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
        Ahmedabad's exclusive social & dating network.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
        <Link href="/login" style={{
          background: 'var(--text-primary)',
          color: 'var(--primary-bg)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '1.1rem'
        }}>
          Log In
        </Link>
        <Link href="/signup" style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 'bold',
          border: '2px solid var(--border-color)',
          textDecoration: 'none',
          fontSize: '1.1rem'
        }}>
          Sign Up
        </Link>
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        100% Cloud Secure 🔒
      </div>
    </main>
  );
}
