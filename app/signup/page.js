'use client';
import { useState } from 'react';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, updatePassword, updateEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    instaId: '',
    snapId: ''
  });
  
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (formData.phone.length < 10) {
      setError('Enter a valid phone number with country code (e.g., +91...)');
      setLoading(false);
      return;
    }
    
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User already exists via phone. Error out.
        await auth.signOut(); // Log them out so they go to login
        setError('An account with this phone number already exists! Please log in.');
        setLoading(false);
        return;
      }
      
      // Update Password and Email strictly (required if they want to login via email/password later)
      if (formData.password) await updatePassword(user, formData.password);
      if (formData.email) await updateEmail(user, formData.email);
      
      // Save Core User Logic
      await setDoc(userDocRef, {
        uid: user.uid,
        username: formData.username.toLowerCase(),
        email: formData.email,
        phone: user.phoneNumber,
        instaId: formData.instaId,
        snapId: formData.snapId,
        bio: '',
        isPrivate: false,
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        city: 'Ahmedabad',
        isDatingEnabled: false,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      
      router.push('/');
    } catch (err) {
      setError('Registration failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
      <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>←</Link>
        <h2 style={{ margin: '0 auto', fontSize: '1.2rem' }}>Create Account</h2>
      </div>

      {error && <div style={{ padding: '10px', background: 'rgba(255,50,50,0.1)', color: '#ff3366', borderRadius: 'var(--radius-md)', marginBottom: '15px', border: '1px solid #ff3366', fontSize: '0.9rem' }}>{error}</div>}
      
      <form onSubmit={otpSent ? handleRegister : handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
        
        <input 
          type="text" placeholder="Username" required disabled={otpSent}
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
        />

        <input 
          type="email" placeholder="Email" required disabled={otpSent}
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <input 
          type="tel" placeholder="Phone Number (for OTP)" required disabled={otpSent}
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
        />

        <input 
          type="password" placeholder="Password" required disabled={otpSent}
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <input 
          type="text" placeholder="Instagram ID (Required)" required disabled={otpSent}
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          value={formData.instaId} onChange={e => setFormData({...formData, instaId: e.target.value})}
        />

        <input 
          type="text" placeholder="Snapchat ID (Optional)" disabled={otpSent}
          style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          value={formData.snapId} onChange={e => setFormData({...formData, snapId: e.target.value})}
        />

        <div id="recaptcha-container"></div> {/* For Firebase OTP */}

        {otpSent && (
           <input 
             type="text" placeholder="Enter OTP" required 
             style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)', marginTop: '10px' }}
             value={otp} onChange={e => setOtp(e.target.value)}
           />
        )}

        <button type="submit" style={{
          width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', 
          background: 'var(--text-primary)', color: 'var(--primary-bg)', 
          fontWeight: 'bold', marginTop: '10px'
        }}>
          {otpSent ? 'Verify & Register' : 'Send OTP'}
        </button>

      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Log In</Link>
      </p>
    </div>
  );
}
