'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); return; }
      toast.success('Welcome back!');
      window.location.href = '/';
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!resetEmail) return toast.error('Enter your registered email');
    try {
      const res = await fetch('/api/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to send OTP');
      toast.success('OTP sent to your email');
      setShowOTPModal(false);
      setShowNewPasswordModal(true);
      setOtpCooldown(true);
      let t = 60;
      setCooldownTime(t);
      const interval = setInterval(() => { t--; setCooldownTime(t); if(t<=0){clearInterval(interval);setOtpCooldown(false);} }, 1000);
    } catch { toast.error('Server error'); }
  };

const handleVerifyOTP = async () => {
  if (!otp || !newPassword) {
    return toast.error('Enter OTP and new password');
  }

  try {
    setLoading(true);

    // STEP 1: Verify OTP
    const verifyRes = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, otp }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      return toast.error(verifyData.message || 'Invalid OTP');
    }

    // STEP 2: Change Password
    const passRes = await fetch('/api/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, password: newPassword }),
    });

    const passData = await passRes.json();

    if (!passRes.ok) {
      return toast.error(passData.message || 'Password update failed');
    }

    toast.success('Password reset successful! 🎉');

    // reset UI
    setShowNewPasswordModal(false);
    setOtp('');
    setNewPassword('');
    setResetEmail('');

  } catch (err) {
    toast.error('Server error');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <img src="/logo.png" alt="Logo" className="logo-glow" style={{height:'48px',margin:'0 auto 16px',display:'block'}} />
          <h1 className="syne" style={{fontSize:'28px',fontWeight:800,color:'var(--text-primary)',marginBottom:'6px'}}>Welcome back</h1>
          <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>Sign in to your ExpenseIQ account</p>
        </div>

        <div className="card" style={{padding:'32px'}}>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'18px'}}>
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Email</label>
              <input type="email" name="email" value={formData.email}
                onChange={e => setFormData({...formData,email:e.target.value})}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Password</label>
              <input type="password" name="password" value={formData.password}
                onChange={e => setFormData({...formData,password:e.target.value})}
                className="input-field" placeholder="••••••••" required />
            </div>

            <div style={{textAlign:'right',marginTop:'-8px'}}>
              <button type="button" onClick={() => setShowOTPModal(true)}
                style={{background:'none',border:'none',color:'var(--accent)',fontSize:'13px',cursor:'pointer',padding:0}}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{padding:'14px',fontSize:'15px',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              {loading ? <span style={{display:'inline-block',width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}></span> : 'Sign In'}
            </button>
          </form>

          <div style={{borderTop:'1px solid var(--border)',marginTop:'24px',paddingTop:'24px',textAlign:'center'}}>
            <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>
              No account?{' '}
              <Link href="/sign" style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>Create one →</Link>
            </p>
          </div>
        </div>
      </div>

      {showOTPModal && (
        <div className="modal-overlay" onClick={() => setShowOTPModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="syne" style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Reset Password</h2>
            <p style={{color:'var(--text-secondary)',fontSize:'13px',marginBottom:'24px'}}>Enter your registered email to receive an OTP</p>
            <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
              className="input-field" placeholder="your@email.com" style={{marginBottom:'20px'}} />
            <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
              <button className="btn-ghost" onClick={() => setShowOTPModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSendOTP} disabled={otpCooldown}>
                {otpCooldown ? `Resend in ${cooldownTime}s` : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowNewPasswordModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="syne" style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Verify & Reset</h2>
            <p style={{color:'var(--text-secondary)',fontSize:'13px',marginBottom:'24px'}}>Enter the OTP sent to {resetEmail}</p>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
              className="input-field" placeholder="6-digit OTP" style={{marginBottom:'12px'}} />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="input-field" placeholder="New password" style={{marginBottom:'20px'}} />
            <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
              <button className="btn-ghost" onClick={() => setShowNewPasswordModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleVerifyOTP}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
