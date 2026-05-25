'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Link from 'next/link';

export default function YearlyGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchYearlyData = async () => {
      const res = await fetch('/api/expense/yearly');
      const json = await res.json();
      if (res.ok) setData(json.data);
    };
    fetchYearlyData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{background:'#0f1120',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'10px 14px'}}>
        <p style={{color:'#94a3b8',fontSize:'12px',marginBottom:'4px'}}>{label}</p>
        <p style={{color:'#6366f1',fontSize:'14px',fontWeight:600}}>₹{payload[0].value?.toLocaleString()}</p>
      </div>
    );
  };

  const maxYear = data.reduce((m, d) => d.amount > m ? d.amount : m, 0);

  return (
    <div style={{minHeight:'100vh'}}>
      <header style={{borderBottom:'1px solid rgba(255,255,255,0.06)',backdropFilter:'blur(20px)',background:'rgba(7,8,16,0.8)'}} className="sticky top-0 z-50 px-6 py-4">
        <div style={{maxWidth:'1280px',margin:'0 auto',display:'flex',alignItems:'center',gap:'16px'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'8px',color:'var(--text-muted)',fontSize:'13px',textDecoration:'none',borderRadius:'8px',padding:'6px 12px',border:'1px solid var(--border)',background:'rgba(255,255,255,0.03)'}}>
            ← Dashboard
          </Link>
          <h1 className="syne" style={{fontSize:'18px',fontWeight:700,color:'var(--text-primary)'}}>Yearly Overview</h1>
        </div>
      </header>

      <main className="content" style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 24px'}}>
        <div style={{marginBottom:'32px'}}>
          <h2 className="syne" style={{fontSize:'26px',fontWeight:700,color:'var(--text-primary)',marginBottom:'8px'}}>Annual Expense Trends</h2>
          <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>See how your spending has changed over the years</p>
        </div>

        {/* Stats */}
        {data.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'16px',marginBottom:'32px'}}>
            <div className="card" style={{padding:'20px 24px'}}>
              <p style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Total All Time</p>
              <p className="syne" style={{fontSize:'24px',fontWeight:700,color:'var(--text-primary)'}}>
                ₹{data.reduce((s,d) => s+d.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="card" style={{padding:'20px 24px'}}>
              <p style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Highest Year</p>
              <p className="syne" style={{fontSize:'24px',fontWeight:700,color:'#ef4444'}}>
                ₹{maxYear.toLocaleString()}
              </p>
            </div>
            <div className="card" style={{padding:'20px 24px'}}>
              <p style={{color:'var(--text-muted)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>Years Tracked</p>
              <p className="syne" style={{fontSize:'24px',fontWeight:700,color:'var(--text-primary)'}}>{data.length}</p>
            </div>
          </div>
        )}

        {/* Line Chart */}
        <div className="card" style={{padding:'28px',marginBottom:'20px'}}>
          <h3 className="syne" style={{fontSize:'16px',fontWeight:600,marginBottom:'24px',color:'var(--text-primary)'}}>Spending Trend</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" tick={{fill:'#475569',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#475569',fontSize:12}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3}
                dot={{fill:'#6366f1',strokeWidth:0,r:5}} activeDot={{r:7,fill:'#818cf8'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{padding:'28px'}}>
          <h3 className="syne" style={{fontSize:'16px',fontWeight:600,marginBottom:'24px',color:'var(--text-primary)'}}>Year Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} barSize={40}>
              <XAxis dataKey="year" tick={{fill:'#475569',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#475569',fontSize:12}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill:'rgba(255,255,255,0.03)'}} />
              <Bar dataKey="amount" radius={[8,8,0,0]} fill="url(#yearGrad)" />
              <defs>
                <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
