import Link from 'next/link';
import { Home, Heart, PlusSquare, User, Users } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="glass" style={{ 
      position: 'fixed', 
      bottom: 0, 
      width: '100%', 
      maxWidth: '480px', // Mobile constraint
      height: 'var(--nav-height)', 
      display: 'flex', 
      justifyContent: 'space-around', 
      alignItems: 'center', 
      zIndex: 50 
    }}>
      <Link href="/" style={{ padding: '10px' }}>
        <Home size={28} />
      </Link>
      <Link href="/discover" style={{ padding: '10px', color: 'var(--accent-color)' }}>
        <Heart size={28} />
      </Link>
      <Link href="/create" style={{ padding: '10px' }}>
        <PlusSquare size={28} />
      </Link>
      <Link href="/groups" style={{ padding: '10px' }}>
        <Users size={28} />
      </Link>
      <Link href="/profile" style={{ padding: '10px' }}>
        <User size={28} />
      </Link>
    </nav>
  );
}
