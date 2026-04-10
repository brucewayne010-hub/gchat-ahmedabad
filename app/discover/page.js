'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import { Heart, X, Sparkles } from 'lucide-react';

export default function Discover() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [fetching, setFetching] = useState(true);
  
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDatingProfiles = async () => {
      if (!userProfile?.isDatingEnabled) {
        setFetching(false);
        return;
      }
      try {
        const swipedQuery = query(collection(db, 'swipes'), where('swiperUid', '==', user.uid));
        const swipedSnap = await getDocs(swipedQuery);
        const swipedIds = swipedSnap.docs.map(doc => doc.data().swipedUid);

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('isDatingEnabled', '==', true));
        const snapshot = await getDocs(q);
        
        let filtered = snapshot.docs
          .map(doc => doc.data())
          .filter(p => p.uid !== user.uid && !swipedIds.includes(p.uid));
          
        setProfiles(filtered);
      } catch (err) {
        console.error(err);
      }
      setFetching(false);
    };
    if (userProfile) fetchDatingProfiles();
  }, [userProfile, user]);

  const handleOptIn = async () => {
    setFetching(true);
    await updateDoc(doc(db, 'users', user.uid), { isDatingEnabled: true });
    window.location.reload();
  };

  const handleSwipe = async (direction) => {
    const targetProfile = profiles[currentProfileIndex];
    await addDoc(collection(db, 'swipes'), {
      swiperUid: user.uid,
      swipedUid: targetProfile.uid,
      direction,
      timestamp: new Date().toISOString()
    });

    if (direction === 'right') {
       alert(`You liked ${targetProfile.username}! Their social links are instantly unlocked.\nInstagram: ${targetProfile.instaId}\nSnapchat: ${targetProfile.snapId || 'N/A'}`);
    }

    setCurrentProfileIndex(prev => prev + 1);
  };

  if (loading || fetching || !user) return null;

  if (!userProfile?.isDatingEnabled) {
    return (
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
         <Sparkles size={60} color="var(--accent-color)" style={{ marginBottom: '20px' }} />
         <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Dating Mode</h2>
         <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
           Opt-in to verify your profile and start discovering potential matches in Ahmedabad.
         </p>
         <button onClick={handleOptIn} style={{ padding: '15px 30px', background: 'var(--accent-gradient)', borderRadius: 'var(--radius-lg)', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Enable Dating Mode
         </button>
         <BottomNav />
      </main>
    );
  }

  const target = profiles[currentProfileIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '70px', overflow: 'hidden' }}>
      <div style={{ padding: '15px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--primary-bg)' }}>
         <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Discover</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
        {!target ? (
           <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
             <h3>No more profiles</h3>
             <p>Check back later for more people in your area!</p>
           </div>
        ) : (
           <div className="glass" style={{ position: 'relative', width: '100%', maxWidth: '380px', height: '550px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: 'var(--secondary-bg)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                {target.uid}
              </div>
              <div style={{ padding: '20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', position: 'absolute', bottom: 0, width: '100%', color: '#fff' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{target.username}</h3>
                <p>{target.bio || 'Living in Ahmedabad'}</p>
              </div>
           </div>
        )}
      </div>

      {target && (
        <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '20px' }}>
          <button onClick={() => handleSwipe('left')} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,50,50,0.1)', color: '#ff3366', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ff3366' }}>
            <X size={32} />
          </button>
          <button onClick={() => handleSwipe('right')} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(50,255,100,0.1)', color: '#33ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #33ff88' }}>
            <Heart size={32} />
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
