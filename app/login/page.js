'use client';
import { useState } from 'react';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, updatePassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | forgot | reset
  
  const [identifier, setIdentifier] = useState(''); // email, username, phone
  const [password, setPassword] = useState('');
  
  // For Forgot Password / OTP
  const [phoneForReset, setPhoneForReset] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let emailToLogin = identifier;
      
      // If identifier doesn't have @, it's a username or phone.
      // We must query Firestore for the actual email mapped to this identifier.
      if (!identifier.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where(identifier.startsWith('+') || !isNaN(identifier[0]) ? 'phone' : 'username', '==', identifier.toLowerCase()));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('No account found with this username or phone number.');
          setLoading(false);
          return;
        }
        
        emailToLogin = snapshot.docs[0].data().email;
      }
      
      await signInWithEmailAndPassword(auth, emailToLogin, password);
      router.push('/');
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
    setLoading(false);
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const formattedPhone = phoneForReset.startsWith('+') ? phoneForReset : `+91${phoneForReset}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      setMode('reset');
    } catch (err) {
      setError(err.message);
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Confirm OTP logs the user in dynamically
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      // Now authenticated safely via OTP, we can update password
      await updatePassword(user, newPassword);
      router.push('/');
    } catch (err) {
      setError('Password reset failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Gchat</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Ahmedabad Social & Dating</p>
      </div>

      {error && <div style={{ padding: '10px', background: 'rgba(255,50,50,0.1)', color: '#ff3366', borderRadius: 'var(--radius-md)', marginBottom: '15px', border: '1px solid #ff3366', fontSize: '0.9rem' }}>{error}</div>}

      {mode === 'login' && (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" placeholder="Username, Phone, or Email" required disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
            value={identifier} onChange={e => setIdentifier(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--primary-bg)', fontWeight: 'bold', marginTop: '10px' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          
          <button type="button" onClick={() => setMode('forgot')} style={{ color: 'var(--text-primary)', alignSelf: 'flex-end', fontSize: '0.9rem' }}>
            Forgot Password?
          </button>
        </form>
      )}

      {mode === 'forgot' && (
        <form onSubmit={handleSendResetOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Trouble Logging In?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>Enter your phone number and we'll send an OTP to reset your password.</p>
          <input 
            type="tel" placeholder="Phone Number" required disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
            value={phoneForReset} onChange={e => setPhoneForReset(e.target.value)}
          />
          <div id="recaptcha-container"></div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--primary-bg)', fontWeight: 'bold' }}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
          <button type="button" onClick={() => setMode('login')} style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>Back to Login</button>
        </form>
      )}

      {mode === 'reset' && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Secure Account</h2>
          <input 
            type="text" placeholder="Enter OTP" required disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
            value={otp} onChange={e => setOtp(e.target.value)}
          />
          <input 
            type="password" placeholder="New Password" required disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
            value={newPassword} onChange={e => setNewPassword(e.target.value)}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--primary-bg)', fontWeight: 'bold' }}>
            {loading ? 'Verifying...' : 'Reset Password & Login'}
          </button>
        </form>
      )}

      <div style={{ marginTop: 'auto', paddingBottom: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
