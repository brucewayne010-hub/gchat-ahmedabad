'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import { db, storage } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function CreatePost() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    if (!image) {
      setError('Please select an image first.');
      setIsUploading(false);
      return;
    }

    try {
      // Check the 5 post limit
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (snapshot.size >= 5) {
        setError('Strict Limit Exceeded: You can only have a maximum of 5 posts. Please delete a post to upload a new one.');
        setIsUploading(false);
        return;
      }

      // Upload to Firebase Storage
      const imageRef = ref(storage, `posts/${user.uid}/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);

      // Save to Firestore
      await addDoc(postsRef, {
        uid: user.uid,
        username: userProfile.username || 'Anonymous',
        imageUrl: url,
        caption: caption,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString()
      });

      // Update user count
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, { postsCount: snapshot.size + 1 });

      router.push('/');
    } catch (err) {
      setError(err.message);
    }
    setIsUploading(false);
  };

  if (loading || !user) return null;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: 'var(--primary-bg)' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>←</Link>
        <h2 style={{ margin: '0 auto', fontSize: '1.2rem' }}>New Post</h2>
      </div>

      {error && (
         <div style={{ padding: '10px', background: 'rgba(255,50,50,0.1)', color: '#ff3366', borderRadius: 'var(--radius-md)', marginBottom: '15px', border: '1px solid #ff3366', fontSize: '0.9rem' }}>
            {error}
         </div>
      )}

      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, marginTop: '20px' }}>
        <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--secondary-bg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '2px dashed var(--border-color)' }}>
          {image ? (
             <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <span style={{ color: 'var(--text-secondary)' }}>Select an image</span>
          )}
        </div>

        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          style={{ width: '100%', padding: '10px', color: 'var(--text-primary)' }}
        />

        <textarea 
          placeholder="Write a caption..." 
          value={caption} 
          onChange={e => setCaption(e.target.value)}
          maxLength={200}
          style={{ width: '100%', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)', minHeight: '100px', resize: 'none' }}
        />

        <button disabled={isUploading} type="submit" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 'auto' }}>
          {isUploading ? 'Uploading...' : 'Share Post'}
        </button>
      </form>
    </div>
  );
}
