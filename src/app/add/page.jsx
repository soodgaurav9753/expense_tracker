'use client';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AddExpensePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', amount: '', category: '', date: null });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        if (res.ok) setCategories(data.categories || []);
      } catch {}
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to add expense'); return; }
      toast.success('Expense Added!');
      setFormData({ title: '', amount: '', category: '', date: null });
      router.push('/');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  const catEmojis = { Food:'🍔',Travel:'✈️',Shopping:'🛍️',Health:'💊',Bills:'📄',Entertainment:'🎬' };

  return (
    <div style={{minHeight:'100vh'}}>
      <header style={{borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',background:'rgba(7,8,16,0.8)'}} className="sticky top-0 z-50 px-6 py-4">
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'flex',alignItems:'center',gap:'16px'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',color:'var(--text-muted)',fontSize:'13px',textDecoration:'none',borderRadius:'8px',padding:'6px 12px',border:'1px solid var(--border)',background:'rgba(255,255,255,0.03)'}}>
            ← Dashboard
          </Link>
          <h1 className="syne" style={{fontSize:'18px',fontWeight:700,color:'var(--text-primary)'}}>Add Expense</h1>
        </div>
      </header>

      <main className="content" style={{maxWidth:'560px',margin:'0 auto',padding:'48px 24px'}}>
        <div style={{marginBottom:'32px'}}>
          <h2 className="syne" style={{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',marginBottom:'8px'}}>New Transaction</h2>
          <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>Record a new expense to track your spending</p>
        </div>

        <div className="card" style={{padding:'32px'}}>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>

            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Expense Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData,title:e.target.value})}
                className="input-field" placeholder="e.g. Dinner at restaurant" required />
            </div>

            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Amount (₹)</label>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'15px',fontWeight:500}}>₹</span>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData,amount:e.target.value})}
                  className="input-field" placeholder="0.00" required style={{paddingLeft:'32px'}} />
              </div>
            </div>

            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData,category:e.target.value})}
                className="input-field" required>
                <option value="">Select a category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{catEmojis[cat] || '📌'} {cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Date</label>
              <DatePicker
                selected={formData.date} onChange={date => setFormData({...formData,date})}
                dateFormat="dd/MM/yyyy" placeholderText="Select date"
                className="input-field" showPopperArrow={false} required
                wrapperClassName="w-full"
              />
            </div>

            {/* Preview if filled */}
            {formData.title && formData.amount && formData.category && (
              <div style={{background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'14px',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <p style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'3px'}}>Preview</p>
                  <p style={{fontSize:'15px',fontWeight:500,color:'var(--text-primary)'}}>{formData.title}</p>
                  <p style={{fontSize:'12px',color:'var(--text-secondary)'}}>{formData.category}</p>
                </div>
                <p style={{fontSize:'20px',fontWeight:700,color:'#ef4444'}}>₹{parseFloat(formData.amount||0).toLocaleString()}</p>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{padding:'14px',fontSize:'15px',borderRadius:'14px',marginTop:'4px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              {loading ? (
                <span style={{display:'inline-block',width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}></span>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  Add Expense
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <style>{`.react-datepicker-wrapper{width:100%} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
