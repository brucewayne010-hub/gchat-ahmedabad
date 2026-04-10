'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { rtdb } from '../../lib/firebase';
import { ref, push, onValue, set } from 'firebase/database';
import BottomNav from '../components/BottomNav';
import { Users, Send } from 'lucide-react';

export default function Groups() {
  const { user, userProfile, loading } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // Fetch groups
  useEffect(() => {
    const groupsRef = ref(rtdb, 'groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setGroups(groupList);
      } else {
        setGroups([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch active group messages
  useEffect(() => {
    if (!activeGroup) return;
    const msgRef = ref(rtdb, `messages/${activeGroup}`);
    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a,b) => a.timestamp - b.timestamp);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, [activeGroup]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newGroupRef = push(ref(rtdb, 'groups'));
    await set(newGroupRef, {
       name: newGroupName.trim(),
       createdBy: userProfile.username,
       createdAt: Date.now()
    });
    setNewGroupName('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeGroup) return;
    const newMsgRef = push(ref(rtdb, `messages/${activeGroup}`));
    await set(newMsgRef, {
      text: text.trim(),
      sender: userProfile.username,
      timestamp: Date.now()
    });
    setText('');
  };

  if (loading || !user) return null;

  if (activeGroup) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
         <div className="glass" style={{ padding: '15px', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setActiveGroup(null)} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>←</button>
            <h2 style={{ fontSize: '1.2rem' }}>{groups.find(g => g.id === activeGroup)?.name}</h2>
         </div>
         
         <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '80px' }}>
            {messages.map(msg => (
               <div key={msg.id} style={{ alignSelf: msg.sender === userProfile.username ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  {msg.sender !== userProfile.username && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '3px', marginLeft: '5px' }}>{msg.sender}</div>}
                  <div style={{ 
                     padding: '10px 15px', 
                     borderRadius: 'var(--radius-lg)',
                     background: msg.sender === userProfile.username ? 'var(--accent-gradient)' : 'var(--secondary-bg)',
                     color: msg.sender === userProfile.username ? '#fff' : 'var(--text-primary)'
                  }}>
                     {msg.text}
                  </div>
               </div>
            ))}
            {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>No messages yet. Say hi!</div>}
         </div>

         <form onSubmit={handleSendMessage} className="glass" style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', padding: '10px 15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input required type="text" placeholder="Message..." value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: '12px 15px', borderRadius: '25px', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }} />
            <button type="submit" style={{ background: 'transparent', color: 'var(--accent-color)' }}><Send size={24} /></button>
         </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', paddingBottom: '70px' }}>
       <h2 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
         <Users /> City Groups
       </h2>

       <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="text" placeholder="Create new group..."
            value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)' }}
          />
          <button type="submit" style={{ padding: '0 20px', background: 'var(--text-primary)', color: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>Create</button>
       </form>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {groups.map(group => (
             <button 
                key={group.id} onClick={() => setActiveGroup(group.id)} 
                style={{ width: '100%', textAlign: 'left', padding: '20px', background: 'var(--secondary-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
             >
                <div>
                   <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{group.name}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Created by {group.createdBy}</div>
                </div>
                <span style={{ color: 'var(--accent-color)' }}>Join →</span>
             </button>
          ))}
       </div>

       <BottomNav />
    </div>
  );
}
