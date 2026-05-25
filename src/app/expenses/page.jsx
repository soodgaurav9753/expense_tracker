'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ViewAllExpenses() {
  const [expensesByYear, setExpensesByYear] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch('/api/expense');
        const data = await res.json();
        if (res.ok) {
          setExpensesByYear(data.expensesByYear);
          const years = Object.keys(data.expensesByYear).sort();
          setSelectedYear(years[years.length - 1]);
        } else toast.error(data.error || 'Failed to fetch');
      } catch { toast.error('Error fetching expenses'); }
      finally { setLoading(false); }
    };
    fetchExpenses();
  }, []);

  const allExpenses = expensesByYear[selectedYear] || [];
  const years = Object.keys(expensesByYear).sort();

  const filtered = allExpenses
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'amount' ? b.amount - a.amount : new Date(b.date) - new Date(a.date));

  const totalYear = allExpenses.reduce((s, e) => s + e.amount, 0);

  const handleDelete = async (expense) => {
    const res = await fetch('/api/expense', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: expense.title, amount: expense.amount, date: expense.date }),
    });
    if (res.ok) {
      const updated = allExpenses.filter(e => !(e.title === expense.title && e.date === expense.date && e.amount === expense.amount));
      setExpensesByYear({ ...expensesByYear, [selectedYear]: updated });
      toast.success('Deleted');
    } else { const err = await res.json(); toast.error(err.error || 'Failed'); }
  };

  const handleDownloadCSV = () => {
    const rows = [['Title', 'Category', 'Amount', 'Date']];
    filtered.forEach(e => rows.push([e.title, e.category, e.amount, e.date]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `expenses-${selectedYear}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const catColors = { Food:'#f97316',Travel:'#6366f1',Shopping:'#ec4899',Health:'#10b981',Bills:'#f59e0b',Entertainment:'#8b5cf6' };
  const getCatColor = (cat) => catColors[cat] || '#6366f1';

  return (
    <div style={{minHeight:'100vh'}}>
      <header style={{borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',background:'rgba(7,8,16,0.8)'}} className="sticky top-0 z-50 px-6 py-4">
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',color:'var(--text-muted)',fontSize:'13px',textDecoration:'none',borderRadius:'8px',padding:'6px 12px',border:'1px solid var(--border)',background:'rgba(255,255,255,0.03)'}}>
              ← Dashboard
            </Link>
            <h1 className="syne" style={{fontSize:'18px',fontWeight:700,color:'var(--text-primary)'}}>All Expenses</h1>
          </div>
          <button onClick={handleDownloadCSV} className="btn-primary" style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px'}}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </header>

      <main className="content" style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 24px'}}>

        {/* Year Tabs */}
        <div style={{display:'flex',gap:'8px',marginBottom:'24px',overflowX:'auto',paddingBottom:'4px'}}>
          {years.map(year => (
            <button key={year} onClick={() => setSelectedYear(year)}
              style={{
                padding:'8px 20px', borderRadius:'10px', fontSize:'14px', fontWeight:500, cursor:'pointer', whiteSpace:'nowrap',
                background: selectedYear === year ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                color: selectedYear === year ? 'white' : 'var(--text-secondary)',
                border: selectedYear === year ? 'none' : '1px solid var(--border)',
                transition:'all 0.2s'
              }}>
              {year}
            </button>
          ))}
        </div>

        {/* Summary Bar */}
        {!loading && allExpenses.length > 0 && (
          <div className="card" style={{padding:'20px 24px',marginBottom:'20px',display:'flex',flexWrap:'wrap',gap:'24px',alignItems:'center'}}>
            <div>
              <p style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Total in {selectedYear}</p>
              <p className="syne" style={{fontSize:'24px',fontWeight:700,color:'#ef4444'}}>₹{totalYear.toLocaleString()}</p>
            </div>
            <div style={{width:'1px',height:'40px',background:'var(--border)'}}></div>
            <div>
              <p style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Transactions</p>
              <p className="syne" style={{fontSize:'24px',fontWeight:700,color:'var(--text-primary)'}}>{allExpenses.length}</p>
            </div>
            <div style={{width:'1px',height:'40px',background:'var(--border)'}}></div>
            <div>
              <p style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>Avg per Transaction</p>
              <p className="syne" style={{fontSize:'24px',fontWeight:700,color:'var(--text-primary)'}}>₹{allExpenses.length ? Math.round(totalYear/allExpenses.length).toLocaleString() : 0}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
          <div style={{flex:'1',minWidth:'200px',position:'relative'}}>
            <svg style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..."
              className="input-field" style={{paddingLeft:'36px'}} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field" style={{width:'160px'}}>
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'80px',color:'var(--text-muted)'}}>
            <div style={{width:'32px',height:'32px',border:'2px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}></div>
            Loading expenses...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{padding:'60px',textAlign:'center'}}>
            <p style={{color:'var(--text-muted)',fontSize:'14px'}}>No expenses found for {selectedYear}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="card" style={{overflow:'hidden',display:'none'}} id="desktop-table">
              <table style={{width:'100%',borderCollapse:'collapse'}} className="expense-table">
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)'}}>
                    <th style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 16px',textAlign:'left'}}>#</th>
                    <th style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 16px',textAlign:'left'}}>Title</th>
                    <th style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 16px',textAlign:'left'}}>Category</th>
                    <th style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 16px',textAlign:'left'}}>Amount</th>
                    <th style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 16px',textAlign:'left'}}>Date</th>
                    <th style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',padding:'12px 16px',textAlign:'center'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exp, i) => (
                    <tr key={i} style={{borderBottom:'1px solid var(--border)',transition:'background 0.15s'}}>
                      <td style={{padding:'14px 16px',fontSize:'13px',color:'var(--text-muted)'}}>{i+1}</td>
                      <td style={{padding:'14px 16px',fontSize:'14px',fontWeight:500,color:'var(--text-primary)'}}>{exp.title}</td>
                      <td style={{padding:'14px 16px'}}>
                        <span style={{background:`${getCatColor(exp.category)}18`,color:getCatColor(exp.category),border:`1px solid ${getCatColor(exp.category)}30`,borderRadius:'20px',padding:'3px 10px',fontSize:'12px',fontWeight:500}}>{exp.category}</span>
                      </td>
                      <td style={{padding:'14px 16px',fontSize:'14px',fontWeight:600,color:'#ef4444'}}>₹{exp.amount.toLocaleString()}</td>
                      <td style={{padding:'14px 16px',fontSize:'13px',color:'var(--text-muted)'}}>{exp.date}</td>
                      <td style={{padding:'14px 16px',textAlign:'center'}}>
                        <button onClick={() => handleDelete(exp)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',borderRadius:'8px',padding:'6px 14px',fontSize:'12px',cursor:'pointer',transition:'all 0.2s'}}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (always show) */}
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {filtered.map((exp, i) => (
                <div key={i} className="card" style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px'}}>
                  <div style={{width:'42px',height:'42px',borderRadius:'12px',background:`${getCatColor(exp.category)}15`,border:`1px solid ${getCatColor(exp.category)}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'18px'}}>
                    {exp.category === 'Food' ? '🍔' : exp.category === 'Travel' ? '✈️' : exp.category === 'Shopping' ? '🛍️' : exp.category === 'Health' ? '💊' : exp.category === 'Bills' ? '📄' : '💳'}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'14px',fontWeight:500,color:'var(--text-primary)',marginBottom:'3px'}}>{exp.title}</p>
                    <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                      <span style={{background:`${getCatColor(exp.category)}18`,color:getCatColor(exp.category),border:`1px solid ${getCatColor(exp.category)}30`,borderRadius:'20px',padding:'2px 8px',fontSize:'11px',fontWeight:500}}>{exp.category}</span>
                      <span style={{fontSize:'12px',color:'var(--text-muted)'}}>{exp.date}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'14px',flexShrink:0}}>
                    <span style={{fontSize:'16px',fontWeight:700,color:'#ef4444'}}>₹{exp.amount.toLocaleString()}</span>
                    <button onClick={() => handleDelete(exp)} style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',borderRadius:'8px',padding:'6px 12px',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
