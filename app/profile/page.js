'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { db, auth } from '../../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import { Lock, Unlock, LogOut, Settings } from 'lucide-react';

export default function Profile() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isPrivate, setIsPrivate] = useState(userProfile?.isPrivate || false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio);
      setIsPrivate(userProfile.isPrivate);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'posts'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserPosts();
  }, [user]);

  const handleSaveBio = async () => {
    if (bio.split(' ').length > 100) return alert('Bio exceeds 100 words max limit.');
    await updateDoc(doc(db, 'users', user.uid), { bio });
    setIsEditingBio(false);
  };

  const handleTogglePrivacy = async () => {
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    await updateDoc(doc(db, 'users', user.uid), { isPrivate: newValue });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading || !user || !userProfile) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '70px' }}>
      <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
         <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{userProfile.username}</h2>
         <button onClick={handleLogout}><LogOut size={24} color="#ff3366" /></button>
      </div>

      <div style={{ padding: '20px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
              {userProfile.username ? userProfile.username[0].toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', gap: '20px', flex: 1, justifyContent: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{posts.length}/5</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Posts</div>
               </div>
               <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{userProfile.followersCount || 0}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Followers</div>
               </div>
            </div>
         </div>

         <div style={{ marginTop: '20px' }}>
           <strong style={{ display: 'block' }}>{userProfile.username}</strong>
           {isEditingBio ? (
              <div style={{ marginTop: '10px' }}>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--secondary-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                 <button onClick={handleSaveBio} style={{ marginTop: '5px', padding: '5px 15px', background: 'var(--text-primary)', color: 'var(--primary-bg)', borderRadius: 'var(--radius-md)' }}>Save</button>
              </div>
           ) : (
              <p style={{ marginTop: '5px', fontSize: '0.95rem' }} onClick={() => setIsEditingBio(true)}>
                 {userProfile.bio || 'Add a bio... (Max 100 words)'}
              </p>
           )}
         </div>

         <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleTogglePrivacy} style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', fontWeight: 'bold' }}>
               {isPrivate ? <><Lock size={18} /> Private Account</> : <><Unlock size={18} /> Public Account</>}
            </button>
            <button style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Settings size={20} />
            </button>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginTop: '10px' }}>
        {posts.map(post => (
           <div key={post.id} style={{ aspectRatio: '1/1', background: 'var(--border-color)', position: 'relative' }}>
             {post.imageUrl && <img src={post.imageUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
           </div>
        ))}
      </div>

      {posts.length === 0 && (
         <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <h3>No Posts Yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Capture the moment!</p>
         </div>
      )}

      <BottomNav />
    </div>
  );
}
