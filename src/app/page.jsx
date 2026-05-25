'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Sector,
  AreaChart, Area, CartesianGrid
} from 'recharts';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

const NavBar = ({ onIncome, onCategory }) => (
  <header style={{borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', background:'rgba(7,8,16,0.8)'}} className="sticky top-0 z-50 px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-20 w-auto logo-glow" />

      </div>
      <nav className="flex items-center gap-1 flex-wrap justify-end">
        <Link href="/add" className="nav-link">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          Add Expense
        </Link>
        <Link href="/expenses" className="nav-link">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          All Expenses
        </Link>
        <button onClick={onCategory} className="nav-link">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h8m-8 6h16"/></svg>
          Categories
        </button>
        <Link href="/year" className="nav-link">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Yearly
        </Link>
        <Link href="/settings" className="nav-link">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </Link>
      </nav>
    </div>
  </header>
);

const StatCard = ({ label, value, sub, color, icon, action, actionLabel }) => (
  <div className="card p-6 fade-up" style={{animationDelay:'0.05s'}}>
    <div className="flex items-start justify-between mb-4">
      <p style={{color:'var(--text-muted)',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</p>
      <div style={{background:`${color}18`,border:`1px solid ${color}30`,borderRadius:'10px',padding:'8px',color}}>{icon}</div>
    </div>
    <p className="stat-value" style={{fontSize:'32px',lineHeight:1.1,color:'var(--text-primary)',marginBottom:'6px'}}>{value}</p>
    {sub && <p style={{fontSize:'12px',color:'var(--text-secondary)'}}>{sub}</p>}
    {action && (
      <button onClick={action} className="btn-ghost mt-3" style={{padding:'6px 14px',fontSize:'12px'}}>
        {actionLabel}
      </button>
    )}
  </div>
);

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy-8} textAnchor="middle" fill="white" style={{fontSize:'13px',fontFamily:'Syne,sans-serif',fontWeight:600}}>{payload.name}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fill="#94a3b8" style={{fontSize:'12px'}}>₹{payload.value.toLocaleString()}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius+8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <text x={cx} y={cy+32} textAnchor="middle" fill={fill} style={{fontSize:'11px',fontWeight:600}}>{(percent*100).toFixed(0)}%</text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#0f1120',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'12px',padding:'10px 14px'}}>
      <p style={{color:'#94a3b8',fontSize:'12px',marginBottom:'4px'}}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{color:p.color||'#6366f1',fontSize:'14px',fontWeight:600}}>₹{p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [user, setUser] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeIncrement, setIncomeIncrement] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [savingsData, setSavingsData] = useState([]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/home');
        if (!res.ok) return router.push('/login');
        const user = await res.json();
        setUser(user);
        setCategories(user.categories || []);
        const catMap = {};
        const monthMap = {};
        const allExpenses = user.expenses || [];
        const thisMonthExpenses = [];
        allExpenses.forEach((e) => {
          const dateObj = new Date(e.date);
          const month = dateObj.getMonth();
          const year = dateObj.getFullYear();
          if (month === currentMonth && year === currentYear) {
            catMap[e.category] = (catMap[e.category] || 0) + e.amount;
            thisMonthExpenses.push(e);
          }
          if (year === currentYear) {
            const monthName = dateObj.toLocaleString('default', { month: 'short' });
            monthMap[monthName] = (monthMap[monthName] || 0) + e.amount;
          }
        });
        const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
        const barData = Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));
        setCategoryData(pieData);
        setMonthlyData(barData);
        setSavingsData(barData.map(({ month, amount }) => ({
          month, savings: (user?.monthlyEarning || 0) - amount
        })));
        setExpenses(thisMonthExpenses.reverse());
      } catch (err) {
        toast.error('Error loading dashboard');
      }
    };
    fetchUserData();
  }, []);

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);
  const savings = (user?.monthlyEarning || 0) - totalExpense;

  const handleIncomeUpdate = async () => {
    const incrementValue = parseFloat(incomeIncrement);
    if (isNaN(incrementValue) || incrementValue <= 0) return toast.error('Enter valid amount');
    try {
      const res = await fetch('/api/income', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add: incrementValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, monthlyEarning: data.newIncome });
        setShowIncomeModal(false);
        setIncomeIncrement('');
        toast.success('Income updated');
      } else toast.error(data.error);
    } catch { toast.error('Server error'); }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error('Enter category');
    try {
      const res = await fetch('/api/category', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory }),
      });
      const data = await res.json();
      if (res.ok) { setCategories([...categories, newCategory]); setNewCategory(''); toast.success('Category added'); }
      else toast.error(data.error);
    } catch { toast.error('Server error'); }
  };

  const handleDeleteCategory = async (name) => {
    try {
      const res = await fetch('/api/category', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) { setCategories(categories.filter(c => c !== name)); toast.success('Deleted'); }
      else { const data = await res.json(); toast.error(data.error); }
    } catch { toast.error('Server error'); }
  };

  const savingsColor = savings > 1000 ? '#10b981' : savings > 0 ? '#34d399' : savings === 0 ? '#f59e0b' : '#ef4444';
  const savingsMsg = savings > 1000 ? '💰 Excellent savings!' : savings > 0 ? '🟢 In the green' : savings === 0 ? '⚠️ Break-even' : '🔴 Over budget';

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div style={{minHeight:'100vh'}}>
      <NavBar onIncome={() => setShowIncomeModal(true)} onCategory={() => setShowCategoryModal(true)} />

      <main className="content" style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 24px'}}>

        {/* Greeting */}
        <div style={{marginBottom:'32px'}}>
          <p style={{color:'var(--text-muted)',fontSize:'13px',fontWeight:500,marginBottom:'6px'}}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
          </p>
          <h1 className="syne" style={{fontSize:'28px',fontWeight:700,color:'var(--text-primary)'}}>
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
          <p style={{color:'var(--text-secondary)',fontSize:'14px',marginTop:'4px'}}>Here's your financial overview for {monthName}</p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'16px',marginBottom:'32px'}}>
          <StatCard
            label="Monthly Income"
            value={`₹${(user?.monthlyEarning||0).toLocaleString()}`}
            sub="Your total monthly earning"
            color="#10b981"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            action={() => setShowIncomeModal(true)}
            actionLabel="+ Add Income"
          />
          <StatCard
            label={`Spent in ${monthName}`}
            value={`₹${totalExpense.toLocaleString()}`}
            sub={`${categoryData.length} categories`}
            color="#ef4444"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
          />
          <StatCard
            label="Remaining Balance"
            value={`₹${savings.toLocaleString('en-IN', {minimumFractionDigits:0})}`}
            sub={savingsMsg}
            color={savingsColor}
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4m-4 0h4"/></svg>}
          />
          <StatCard
            label="Budget Used"
            value={user?.monthlyEarning ? `${Math.min(100,(totalExpense/(user.monthlyEarning)*100)).toFixed(0)}%` : 'N/A'}
            sub={`of ₹${(user?.monthlyEarning||0).toLocaleString()} budget`}
            color="#6366f1"
            icon={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>}
          />
        </div>

        {/* Charts Row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>

          {/* Pie Chart */}
          <div className="card" style={{padding:'28px',minWidth:0}}>
            <div style={{marginBottom:'20px'}}>
              <h2 className="syne" style={{fontSize:'16px',fontWeight:600,color:'var(--text-primary)',marginBottom:'4px'}}>Spending by Category</h2>
              <p style={{color:'var(--text-muted)',fontSize:'12px'}}>{monthName} breakdown</p>
            </div>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={categoryData}
                      cx="50%" cy="50%" innerRadius={65} outerRadius={95}
                      dataKey="value" onMouseEnter={(_, i) => setActiveIndex(i)}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'16px'}}>
                  {categoryData.map((item, i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:COLORS[i%COLORS.length],display:'inline-block'}}></span>
                      <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <p style={{color:'var(--text-muted)',fontSize:'13px'}}>No expenses this month</p>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="card" style={{padding:'28px',minWidth:0}}>
            <div style={{marginBottom:'20px'}}>
              <h2 className="syne" style={{fontSize:'16px',fontWeight:600,color:'var(--text-primary)',marginBottom:'4px'}}>Monthly Spending</h2>
              <p style={{color:'var(--text-muted)',fontSize:'12px'}}>{currentYear} overview</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barSize={28}>
                <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{fill:'rgba(255,255,255,0.03)'}} />
                <Bar dataKey="amount" radius={[6,6,0,0]} fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Area Chart */}
        <div className="card" style={{padding:'28px',marginBottom:'20px'}}>
          <div style={{marginBottom:'20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <h2 className="syne" style={{fontSize:'16px',fontWeight:600,color:'var(--text-primary)',marginBottom:'4px'}}>Savings Trend</h2>
              <p style={{color:'var(--text-muted)',fontSize:'12px'}}>Monthly savings across {currentYear}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={savingsData}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v>=1000?`${(v/1000).toFixed(0)}k`:v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" dot={{fill:'#10b981',strokeWidth:0,r:3}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Expenses */}
        <div className="card" style={{padding:'28px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
            <div>
              <h2 className="syne" style={{fontSize:'16px',fontWeight:600,color:'var(--text-primary)',marginBottom:'4px'}}>Recent Transactions</h2>
              <p style={{color:'var(--text-muted)',fontSize:'12px'}}>This month</p>
            </div>
            <Link href="/expenses" className="btn-ghost" style={{padding:'8px 16px',fontSize:'12px',textDecoration:'none'}}>View All →</Link>
          </div>
          {expenses.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px',color:'var(--text-muted)',fontSize:'14px'}}>
              No expenses this month. <Link href="/add" style={{color:'var(--accent)'}}>Add one →</Link>
            </div>
          ) : (
            <div>
              {expenses.slice(0, 6).map((exp, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:i<Math.min(expenses.length,6)-1?'1px solid var(--border)':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
                      {exp.category === 'Food' ? '🍔' : exp.category === 'Travel' ? '✈️' : exp.category === 'Shopping' ? '🛍️' : exp.category === 'Health' ? '💊' : exp.category === 'Bills' ? '📄' : '💳'}
                    </div>
                    <div>
                      <p style={{fontSize:'14px',fontWeight:500,color:'var(--text-primary)',marginBottom:'2px'}}>{exp.title}</p>
                      <p style={{fontSize:'12px',color:'var(--text-muted)'}}>{exp.category} · {exp.date}</p>
                    </div>
                  </div>
                  <span style={{fontSize:'15px',fontWeight:600,color:'#ef4444'}}>-₹{exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="syne" style={{fontSize:'20px',fontWeight:700,marginBottom:'8px'}}>Add to Monthly Income</h2>
            <p style={{color:'var(--text-secondary)',fontSize:'13px',marginBottom:'24px'}}>Current: ₹{(user?.monthlyEarning||0).toLocaleString()}</p>
            <input type="number" value={incomeIncrement} onChange={e => setIncomeIncrement(e.target.value)}
              placeholder="Enter amount (₹)" className="input-field" style={{marginBottom:'20px'}} />
            <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
              <button className="btn-ghost" onClick={() => setShowIncomeModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleIncomeUpdate}>Save Income</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="syne" style={{fontSize:'20px',fontWeight:700,marginBottom:'24px'}}>Manage Categories</h2>
            <div style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                placeholder="New category name" className="input-field" style={{flex:1}}
                onKeyDown={e => e.key==='Enter' && handleAddCategory()} />
              <button className="btn-primary" onClick={handleAddCategory} style={{whiteSpace:'nowrap'}}>Add</button>
            </div>
            <div style={{maxHeight:'240px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
              {categories.map((cat, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:'10px',padding:'10px 14px'}}>
                  <span style={{fontSize:'14px',color:'var(--text-primary)'}}>{cat}</span>
                  <button onClick={() => handleDeleteCategory(cat)} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',cursor:'pointer'}}>Remove</button>
                </div>
              ))}
              {categories.length === 0 && <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:'13px',padding:'20px'}}>No categories yet</p>}
            </div>
            <button className="btn-ghost" onClick={() => setShowCategoryModal(false)} style={{width:'100%',marginTop:'20px'}}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
