'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [saving, setSaving] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/home');
        const data = await res.json();
        if (res.ok) setUser({ name: data.name, email: data.email });
        else toast.error(data.error || 'Error fetching user');
      } catch { toast.error('Failed to load user'); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return toast.error('Fill all fields');
    setSaving('password');
    try {
      const res = await fetch('/api/change-password', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Password changed!'); setOldPassword(''); setNewPassword(''); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Server error'); }
    finally { setSaving(''); }
  };

  const handleFeedback = async () => {
    if (!feedback.trim()) return toast.error('Enter feedback');
    setSaving('feedback');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedback }),
      });
      if (res.ok) { toast.success('Feedback sent! Thank you.'); setFeedback(''); }
      else toast.error('Failed to send');
    } catch { toast.error('Server error'); }
    finally { setSaving(''); }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch { toast.error('Logout failed'); }
  };

  const SectionCard = ({ title, icon, children }) => (
    <div className="card" style={{padding:'28px',marginBottom:'16px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px'}}>
        <span style={{fontSize:'20px'}}>{icon}</span>
        <h2 className="syne" style={{fontSize:'16px',fontWeight:600,color:'var(--text-primary)'}}>{title}</h2>
      </div>
      {children}
    </div>
  );

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'32px',height:'32px',border:'2px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{minHeight:'100vh'}}>
      <header style={{borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',background:'rgba(7,8,16,0.8)'}} className="sticky top-0 z-50 px-6 py-4">
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'flex',alignItems:'center',gap:'16px'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',color:'var(--text-muted)',fontSize:'13px',textDecoration:'none',borderRadius:'8px',padding:'6px 12px',border:'1px solid var(--border)',background:'rgba(255,255,255,0.03)'}}>
            ← Dashboard
          </Link>
          <h1 className="syne" style={{fontSize:'18px',fontWeight:700,color:'var(--text-primary)'}}>Settings</h1>
        </div>
      </header>

      <main className="content" style={{maxWidth:'680px',margin:'0 auto',padding:'32px 24px'}}>

        {/* Profile */}
        <div style={{marginBottom:'32px',display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'linear-gradient(135deg,var(--accent),var(--accent-2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:700,flexShrink:0}}>
            {user.name?user.name[0].toUpperCase():'U'}
          </div>
          <div>
            <h2 className="syne" style={{fontSize:'20px',fontWeight:700,color:'var(--text-primary)',marginBottom:'2px'}}>{user.name || 'User'}</h2>
            <p style={{color:'var(--text-secondary)',fontSize:'13px'}}>{user.email}</p>
          </div>
        </div>

        {/* Change Password */}
        <SectionCard title="Change Password" icon="🔒">
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Current Password</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
            <button className="btn-primary" onClick={handleChangePassword} disabled={saving==='password'}
              style={{alignSelf:'flex-start',padding:'10px 20px',marginTop:'4px'}}>
              {saving==='password' ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </SectionCard>

        {/* Feedback */}
        <SectionCard title="Send Feedback" icon="💬">
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
              className="input-field" placeholder="Share your thoughts, suggestions, or report an issue..."
              rows={4} style={{resize:'vertical',lineHeight:'1.6'}} />
            <button className="btn-primary" onClick={handleFeedback} disabled={saving==='feedback'}
              style={{alignSelf:'flex-start',padding:'10px 20px'}}>
              {saving==='feedback' ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard title="Account" icon="⚠️">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px',background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'12px'}}>
            <div>
              <p style={{fontSize:'14px',fontWeight:500,color:'var(--text-primary)',marginBottom:'3px'}}>Sign Out</p>
              <p style={{fontSize:'12px',color:'var(--text-muted)'}}>You'll need to sign in again</p>
            </div>
            <button onClick={handleLogout}
              style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',borderRadius:'10px',padding:'8px 16px',fontSize:'13px',fontWeight:500,cursor:'pointer'}}>
              Sign Out
            </button>
          </div>
        </SectionCard>
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
