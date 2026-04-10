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
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh', backgroundColor: 'var(--primary-bg)' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', letterSpacing: '0.05em' }}>Gchat.</h1>
        <p style={{ color: 'var(--text-primary)', marginTop: '10px', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7 }}>Secure Registration</p>
      </div>

      {error && <div style={{ padding: '15px', color: 'var(--text-primary)', border: '1px solid var(--text-primary)', marginBottom: '20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Error: {error}</div>}
      
      <form onSubmit={otpSent ? handleRegister : handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        
        <input 
          type="text" placeholder="USERNAME"
          required disabled={otpSent}
          style={{ width: '100%', padding: '16px', border: '1px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
        />

        <input 
          type="email" placeholder="EMAIL ADDRESS"
          required disabled={otpSent}
          style={{ width: '100%', padding: '16px', border: '1px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
        />

        <input 
          type="tel" placeholder="PHONE (+91...)"
          required disabled={otpSent}
          style={{ width: '100%', padding: '16px', border: '1px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
        />

        <input 
          type="password" placeholder="SECRET"
          required disabled={otpSent}
          style={{ width: '100%', padding: '16px', border: '1px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
        />

        <input 
          type="text" placeholder={formData.email.toLowerCase() === 'brucewayne19102005@gmail.com' ? "INSTAGRAM (OPTIONAL)" : "INSTAGRAM (REQUIRED)"}
          required={formData.email.toLowerCase() !== 'brucewayne19102005@gmail.com'} disabled={otpSent}
          style={{ width: '100%', padding: '16px', border: '1px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={formData.instaId} onChange={e => setFormData({...formData, instaId: e.target.value})}
        />

        <input 
          type="text" placeholder="SNAPCHAT (OPTIONAL)"
          disabled={otpSent}
          style={{ width: '100%', padding: '16px', border: '1px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          value={formData.snapId} onChange={e => setFormData({...formData, snapId: e.target.value})}
        />

        <div id="recaptcha-container"></div> {/* For Firebase OTP */}

        {otpSent && (
           <input 
             type="text" placeholder="SECURITY CODE"
             required 
             style={{ width: '100%', padding: '16px', border: '2px solid var(--text-primary)', background: 'transparent', color: 'var(--text-primary)', marginTop: '10px', fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center' }}
             value={otp} onChange={e => setOtp(e.target.value)}
           />
        )}

        <button type="submit" style={{
          width: '100%', padding: '16px', 
          background: 'var(--text-primary)', color: 'var(--primary-bg)', 
          fontWeight: '600', marginTop: '10px', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase'
        }}>
          {otpSent ? 'VERIFY & REGISTER' : 'TRANSMIT'}
        </button>

      </form>
      
      <div style={{ marginTop: 'auto', paddingBottom: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-primary)', opacity: 0.6, fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Returning user? <Link href="/login" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}
