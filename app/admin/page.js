'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { ShieldAlert, Users, Heart } from 'lucide-react';

export default function AdminDashboard() {
  const { user, userProfile, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMatches: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    
    // Strict enforcement: Only this email can view the global directory
    if (userProfile?.email?.toLowerCase() !== 'brucewayne19102005@gmail.com') {
      setError('Access Denied. You do not have Master Admin rights.');
      return;
    }

    const fetchMasterData = async () => {
      try {
        // Fetch ALL users globally regardless of privacy settings
        const usersSnap = await getDocs(collection(db, 'users'));
        const allUsers = usersSnap.docs.map(doc => doc.data());
        setUsers(allUsers);

        // Fetch ALL Swipes to deduce matches
        const swipesSnap = await getDocs(collection(db, 'swipes'));
        const allSwipes = swipesSnap.docs.map(doc => doc.data());
        
        // Dedup matches (A right swipes B, B right swipes A)
        const rightSwipes = allSwipes.filter(s => s.direction === 'right');
        let foundMatches = [];
        for (let i = 0; i < rightSwipes.length; i++) {
          const A = rightSwipes[i].swiperUid;
          const B = rightSwipes[i].swipedUid;
          const matchExists = rightSwipes.some(s => s.swiperUid === B && s.swipedUid === A);
          if (matchExists && !foundMatches.some(m => (m.A === A && m.B === B) || (m.A === B && m.B === A))) {
            foundMatches.push({ A, B });
          }
        }
        setMatches(foundMatches);

        setStats({
          totalUsers: allUsers.length,
          totalMatches: foundMatches.length
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch admin data. Make sure Firestore rules allow admin reads.');
      }
    };
    fetchMasterData();
  }, [user, userProfile, loading]);

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading Secure Terminal...</div>;

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-primary)', marginTop: '100px', backgroundColor: 'var(--primary-bg)' }}>
         <ShieldAlert size={64} style={{ margin: '0 auto 20px', display: 'block' }} strokeWidth={1} />
         <h2 style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '1rem' }}>{error}</h2>
         <Link href="/" style={{ padding: '15px 30px', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', marginTop: '40px', display: 'inline-block', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>Return</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: 'var(--primary-bg)', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '30px', borderBottom: '1px solid var(--text-primary)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px', fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 600 }}>
            <ShieldAlert strokeWidth={1} /> God Mode
          </h1>
          <p style={{ opacity: 0.7, marginTop: '5px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Master Terminal</p>
        </div>
        <Link href="/" style={{ border: '1px solid var(--text-primary)', padding: '10px 20px', color: 'var(--text-primary)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Exit</Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
        <div style={{ flex: 1, border: '1px solid var(--text-primary)', padding: '30px', textAlign: 'center' }}>
           <h3 style={{ opacity: 0.7, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}><Users size={16} /> Users</h3>
           <div style={{ fontSize: '4rem', fontWeight: '800', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>{stats.totalUsers}</div>
        </div>
        <div style={{ flex: 1, border: '1px solid var(--text-primary)', padding: '30px', textAlign: 'center' }}>
           <h3 style={{ opacity: 0.7, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}><Heart size={16} /> Matches</h3>
           <div style={{ fontSize: '4rem', fontWeight: '800', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>{stats.totalMatches}</div>
        </div>
      </div>

      <h2 style={{ marginTop: '60px', marginBottom: '30px', borderBottom: '1px solid var(--text-primary)', paddingBottom: '15px', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Global Directory</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        {users.map(u => (
          <div key={u.uid} style={{ border: '1px solid var(--text-primary)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <strong style={{ fontSize: '1.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{u.username}</strong>
                 <span style={{ border: '1px solid var(--text-primary)', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                   {u.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                 </span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, letterSpacing: '0.05em' }}>
               <p>TEL: {u.phone} &nbsp; // &nbsp; EMAIL: {u.email}</p>
            </div>
            <div style={{ borderTop: '1px solid var(--text-primary)', paddingTop: '15px', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
              <p>INSTAGRAM: <span style={{ fontWeight: 600 }}>{u.instaId}</span></p>
              <p style={{ marginTop: '5px' }}>SNAPCHAT: <span style={{ fontWeight: 600 }}>{u.snapId || 'NULL'}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
