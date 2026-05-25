
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
const Field = ({ label, children }) => (
    <div>
      <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>{label}</label>
      {children}
    </div>
  );
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', monthlyEarning: '', occupation: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/sign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyEarning: parseFloat(formData.monthlyEarning),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || data.error || 'Signup failed'); return; }

      // Send OTP
      const otpRes = await fetch('/api/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (otpRes.ok) { toast.success('OTP sent to your email'); setStep(2); }
      else toast.error('Failed to send OTP');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Invalid OTP'); return; }
      toast.success('Account verified! Please log in.');
      router.push('/login');
    } catch { toast.error('Server error'); }
    finally { setLoading(false); }
  };

  

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'460px'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <img src="/logo.png" alt="Logo" className="logo-glow" style={{height:'48px',margin:'0 auto 16px',display:'block'}} />
          <h1 className="syne" style={{fontSize:'26px',fontWeight:800,color:'var(--text-primary)',marginBottom:'6px'}}>
            {step === 1 ? 'Create Account' : 'Verify Your Email'}
          </h1>
          <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>
            {step === 1 ? 'Start tracking your expenses today' : `Enter the OTP sent to ${formData.email}`}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'28px'}}>
          {[1,2].map((s, i) => (
            <div key={s} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{
                width:'30px',height:'30px',borderRadius:'50%',
                background: step >= s ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                border: step >= s ? 'none' : '1px solid var(--border)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'12px',fontWeight:600,
                color: step >= s ? 'white' : 'var(--text-muted)',
                transition:'all 0.3s'
              }}>{s}</div>
              {i === 0 && <div style={{width:'40px',height:'1px',background: step >= 2 ? 'var(--accent)' : 'var(--border)',transition:'background 0.3s'}}></div>}
            </div>
          ))}
        </div>

        <div className="card" style={{padding:'32px'}}>
          {step === 1 ? (
            <form onSubmit={handleSignup} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <Field label="Full Name">
                <input type="text" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="input-field" placeholder="John Doe" required />
              </Field>

              <Field label="Email Address">
                <input type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="input-field" placeholder="you@example.com" required />
              </Field>

              <Field label="Password">
                <input type="password" value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="input-field" placeholder="Min. 8 characters" required minLength={8} />
              </Field>

              <Field label="Occupation">
                <input type="text" value={formData.occupation}
                  onChange={e => setFormData({...formData, occupation: e.target.value})}
                  className="input-field" placeholder="e.g. Software Engineer" required />
              </Field>

              <Field label="Monthly Earning (₹)">
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'14px',fontWeight:500}}>₹</span>
                  <input type="number" value={formData.monthlyEarning}
                    onChange={e => setFormData({...formData, monthlyEarning: e.target.value})}
                    className="input-field" placeholder="0" required min={0} style={{paddingLeft:'30px'}} />
                </div>
              </Field>

              <button type="submit" className="btn-primary" disabled={loading}
                style={{padding:'14px',fontSize:'15px',borderRadius:'14px',marginTop:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                {loading
                  ? <span style={{display:'inline-block',width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}></span>
                  : 'Create Account →'}
              </button>
            </form>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'18px'}}>
              <Field label="Verification OTP">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  className="input-field" placeholder="Enter 6-digit OTP" maxLength={6} />
              </Field>

              <button className="btn-primary" onClick={handleVerify} disabled={loading}
                style={{padding:'14px',fontSize:'15px',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                {loading
                  ? <span style={{display:'inline-block',width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}></span>
                  : 'Verify & Continue →'}
              </button>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{padding:'12px'}}>← Back</button>
            </div>
          )}

          <div style={{borderTop:'1px solid var(--border)',marginTop:'24px',paddingTop:'20px',textAlign:'center'}}>
            <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>
              Already have an account?{' '}
              <Link href="/login" style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
