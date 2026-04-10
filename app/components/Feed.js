'use client';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Heart, MessageCircle, Send } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(fetched);
      } catch (err) {
        console.error('Error fetching posts', err);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Feed...</div>;
  }

  if (posts.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
        <h3>No posts yet</h3>
        <p style={{ fontSize: '0.9rem' }}>Be the first to post something in Ahmedabad!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' }}>
      {posts.map(post => (
        <article key={post.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(45deg, #ff3366, #ff9933)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              {post.username ? post.username[0].toUpperCase() : 'U'}
            </div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{post.username}</div>
          </div>
          
          {/* Image */}
          <div style={{ width: '100%', aspectRatio: '4/5', background: 'var(--secondary-bg)', overflow: 'hidden' }}>
             {post.imageUrl ? (
                <img src={post.imageUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Image Unavailable</div>
             )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '15px', padding: '0 15px', color: 'var(--text-primary)' }}>
            <button style={{ padding: 0 }}><Heart size={26} /></button>
            <button style={{ padding: 0 }}><MessageCircle size={26} /></button>
            <button style={{ padding: 0 }}><Send size={26} /></button>
          </div>

          {/* Caption */}
          <div style={{ padding: '0 15px', fontSize: '0.95rem' }}>
            <strong style={{ fontWeight: '600', marginRight: '8px' }}>{post.username}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>{post.caption}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
