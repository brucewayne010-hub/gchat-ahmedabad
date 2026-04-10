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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '20px' }}>
      {posts.map(post => (
        <article key={post.id} style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: '1px solid var(--text-primary)', paddingBottom: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-bg)', fontWeight: '800', fontSize: '1.2rem', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
              {post.username ? post.username[0].toUpperCase() : 'U'}
            </div>
            <div style={{ fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{post.username}</div>
          </div>
          
          {/* Image */}
          <div style={{ width: '100%', aspectRatio: '4/5', background: 'var(--primary-bg)', overflow: 'hidden', borderTop: '1px solid var(--text-primary)', borderBottom: '1px solid var(--text-primary)' }}>
             {post.imageUrl ? (
                <img src={post.imageUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) contrast(1.1)' }} />
             ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase' }}>NO IMAGE</div>
             )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '20px', padding: '0 20px', color: 'var(--text-primary)' }}>
            <button style={{ padding: 0 }}><Heart size={28} strokeWidth={1.5} /></button>
            <button style={{ padding: 0 }}><MessageCircle size={28} strokeWidth={1.5} /></button>
            <button style={{ padding: 0 }}><Send size={28} strokeWidth={1.5} /></button>
          </div>

          {/* Caption */}
          <div style={{ padding: '0 20px', fontSize: '0.85rem', lineHeight: '1.6' }}>
            <strong style={{ fontWeight: '800', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{post.username}</strong>
            <span style={{ color: 'var(--text-primary)', opacity: 0.9 }}>{post.caption}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
