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
      <div style={{ padding: '20px', textAlign: 'center', color: '#ff3366', marginTop: '100px' }}>
         <ShieldAlert size={64} style={{ margin: '0 auto 20px' }} />
         <h2>{error}</h2>
         <Link href="/" style={{ color: '#fff', textDecoration: 'underline', marginTop: '20px', display: 'block' }}>Return Home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#0a0a0a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
        <div>
          <h1 style={{ color: '#ff3366', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert /> God Mode
          </h1>
          <p style={{ color: '#888' }}>Master Dashboard - Ahmedabad Global View</p>
        </div>
        <Link href="/" style={{ padding: '10px 20px', background: '#222', borderRadius: '8px', color: '#fff' }}>Exit</Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
           <h3 style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}><Users /> Total Users</h3>
           <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>{stats.totalUsers}</div>
        </div>
        <div style={{ flex: 1, background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
           <h3 style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}><Heart /> Total Matches</h3>
           <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>{stats.totalMatches}</div>
        </div>
      </div>

      <h2 style={{ color: '#fff', marginTop: '40px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Global User Directory (Bypass Privacy)</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {users.map(u => (
          <div key={u.uid} style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                 <strong style={{ color: '#fff', fontSize: '1.2rem' }}>{u.username}</strong>
                 <span style={{ marginLeft: '10px', padding: '3px 8px', background: u.isPrivate ? '#ff3366' : '#33ff88', color: '#000', fontSize: '0.7rem', borderRadius: '10px', fontWeight: 'bold' }}>
                   {u.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                 </span>
                 <p style={{ color: '#888', marginTop: '5px' }}>Phone: {u.phone} | Email: {u.email}</p>
              </div>
            </div>
            <div style={{ marginTop: '15px', background: '#000', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>
              <p style={{ color: '#ccc' }}><strong>Instagram ID:</strong> {u.instaId}</p>
              <p style={{ color: '#ccc' }}><strong>Snapchat ID:</strong> {u.snapId || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
