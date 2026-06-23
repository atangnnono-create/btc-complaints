import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials (pre-filled)
const SUPABASE_URL = 'https://mbgoxqqwtvqwenkimfgw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ho2IAkvQt7bqJ98PHoFrIQ_r4kVeeDS';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Colors
const C = {
  bg: '#0A0E27',
  surface: '#141B2F',
  surfaceHigh: '#1A2540',
  border: '#2A3550',
  red: '#EF4444',
  redDim: '#7F1D1D',
  amber: '#F59E0B',
  amberDim: '#78350F',
  green: '#10B981',
  greenDim: '#065F46',
  blue: '#3B82F6',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  mutedLight: '#D1D5DB',
};

// ─── REPORT FORM ──────────────────────────────────────────────
function ReportForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    issueType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await supabase.from('complaints').insert([{
        name: form.name,
        phone: form.phone,
        area: form.area,
        issue_type: form.issueType,
        description: form.description,
        status: 'new',
        created_at: new Date().toISOString(),
      }]);
      
      setSuccess(true);
      setForm({ name: '', phone: '', area: '', issueType: '', description: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error:', err);
      alert('Error submitting complaint. Please try again.');
    }
    
    setLoading(false);
  };

  const inp = {
    width: '100%',
    padding: '10px 12px',
    background: C.surfaceHigh,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    color: C.text,
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '12px',
  };

  return (
    <div style={{ background: C.surface, borderRadius: '12px', padding: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: C.text }}>
        Report a Network Issue
      </h2>
      
      {success && (
        <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: '8px', padding: '12px', marginBottom: '16px', color: C.green, fontSize: '13px' }}>
          ✓ Your complaint has been recorded. Check the status using your phone number.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input style={inp} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input style={inp} placeholder="Your phone number (e.g. 76123456)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input style={inp} placeholder="Area name (e.g. Gaborone, Francistown)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
        <select style={inp} value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })} required>
          <option value="">Select issue type</option>
          <option value="slow_speed">Slow Speed</option>
          <option value="no_signal">No Signal</option>
          <option value="router_broken">Router Not Working</option>
          <option value="transaction_failed">Transaction Failed</option>
          <option value="intermittent">Intermittent Connection</option>
          <option value="other">Other</option>
        </select>
        <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} placeholder="Describe the issue in detail" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: C.red, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}

// ─── TRACK COMPLAINT ──────────────────────────────────────────
function TrackComplaint() {
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setComplaint(null);

    try {
      const { data } = await supabase.from('complaints').select('*').eq('phone', phone).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        setComplaint(data[0]);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Error:', err);
      setNotFound(true);
    }

    setLoading(false);
  };

  const statusColor = (status) => {
    switch (status) {
      case 'new': return C.amber;
      case 'investigating': return C.blue;
      case 'resolved': return C.green;
      default: return C.muted;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'new': return 'New - We received your report';
      case 'investigating': return 'Investigating - Our team is working on it';
      case 'resolved': return 'Resolved - Issue has been fixed';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ background: C.surface, borderRadius: '12px', padding: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: C.text }}>Track Your Complaint</h2>
      <p style={{ fontSize: '13px', color: C.muted, marginBottom: '16px' }}>Enter the phone number you used when reporting to see the status.</p>

      <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
        <input style={{ width: '100%', padding: '10px 12px', background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }} placeholder="Your phone number (e.g. 76123456)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: C.blue, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Searching...' : 'Find My Complaint'}
        </button>
      </form>

      {notFound && <div style={{ background: C.redDim, border: `1px solid ${C.red}`, borderRadius: '8px', padding: '12px', color: C.red, fontSize: '13px' }}>No complaint found for this number.</div>}

      {complaint && (
        <div style={{ background: C.surfaceHigh, borderRadius: '10px', padding: '16px', borderLeft: `4px solid ${statusColor(complaint.status)}` }}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>STATUS</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: statusColor(complaint.status) }}>{statusLabel(complaint.status)}</div>
          </div>
          <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '6px' }}>YOUR ISSUE</div>
            <span style={{ background: C.amber, color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', display: 'inline-block', marginBottom: '8px' }}>{complaint.issue_type.replace(/_/g, ' ').toUpperCase()}</span>
            <div style={{ fontSize: '12px', color: C.mutedLight, marginTop: '8px' }}>{complaint.description}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div><div style={{ color: C.muted, marginBottom: '4px' }}>Area</div><div style={{ color: C.text, fontWeight: '600' }}>{complaint.area}</div></div>
            <div><div style={{ color: C.muted, marginBottom: '4px' }}>Reported</div><div style={{ color: C.text, fontWeight: '600' }}>{new Date(complaint.created_at).toLocaleDateString()}</div></div>
          </div>
          <div style={{ marginTop: '14px', padding: '12px', background: C.surface, borderRadius: '8px', fontSize: '12px', color: C.mutedLight, borderLeft: `2px solid ${C.blue}` }}>
            BTC's technical team is working on network issues in {complaint.area}. We will follow up with you soon.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');

  const DASHBOARD_PASSWORD = 'BTC2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchComplaints();
      const interval = setInterval(fetchComplaints, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  const fetchComplaints = async () => {
    try {
      const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(200);
      if (data) setComplaints(data);
    } catch (err) {
      console.error('Error fetching:', err);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ background: C.surface, borderRadius: '12px', padding: '32px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: C.text }}>BTC Dashboard</h2>
        <p style={{ color: C.muted, fontSize: '13px', marginBottom: '24px' }}>For authorized BTC personnel only</p>
        <form onSubmit={handleLogin}>
          <input style={{ width: '100%', padding: '10px 12px', background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text, fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }} type="password" placeholder="Enter dashboard password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={{ width: '100%', padding: '12px', background: C.red, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.issue_type === filter);
  const byArea = {};
  complaints.forEach(c => { byArea[c.area] = (byArea[c.area] || 0) + 1; });
  const topArea = Object.keys(byArea).length > 0 ? Object.entries(byArea).sort((a, b) => b[1] - a[1])[0] : null;

  const issueColor = (type) => {
    switch (type) {
      case 'slow_speed': return C.amber;
      case 'no_signal': return C.red;
      case 'router_broken': return C.red;
      default: return C.blue;
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: C.surface, borderRadius: '10px', padding: '14px', borderLeft: `4px solid ${C.red}` }}>
          <div style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>TOTAL COMPLAINTS</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: C.text }}>{complaints.length}</div>
        </div>
        <div style={{ background: C.surface, borderRadius: '10px', padding: '14px', borderLeft: `4px solid ${C.amber}` }}>
          <div style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>HOTSPOT</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: C.text }}>{topArea?.[0] || 'N/A'}</div>
          <div style={{ fontSize: '11px', color: C.muted }}>({topArea?.[1] || 0})</div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: C.text }}>FILTER</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'slow_speed', 'no_signal', 'router_broken'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 12px', background: filter === f ? C.red : C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: '6px', color: C.text, fontSize: '12px', cursor: 'pointer' }}>
              {f.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: C.text }}>Complaints ({filtered.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((complaint) => (
          <div key={complaint.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px', borderLeft: `4px solid ${issueColor(complaint.issue_type)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>{complaint.name}</div>
              <div style={{ fontSize: '11px', color: C.muted }}>{new Date(complaint.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ fontSize: '11px', color: C.muted, marginBottom: '6px' }}>{complaint.area} • {complaint.phone}</div>
            <div style={{ fontSize: '10px', fontWeight: '700', background: issueColor(complaint.issue_type), color: '#000', display: 'inline-block', padding: '2px 6px', borderRadius: '3px', marginBottom: '6px' }}>
              {complaint.issue_type.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div style={{ fontSize: '11px', color: C.mutedLight, lineHeight: '1.4' }}>{complaint.description.substring(0, 100)}...</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('report');

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px', color: C.text }}>BTC Network Support</h1>
        <p style={{ fontSize: '12px', color: C.muted, margin: 0 }}>Report • Track • Dashboard</p>
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.surface, overflowX: 'auto' }}>
        {[{ id: 'report', label: 'Report Issue' }, { id: 'track', label: 'Track Complaint' }, { id: 'dashboard', label: 'BTC Dashboard' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: '1 0 auto', padding: '14px', background: activeTab === tab.id ? C.bg : 'transparent', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${C.red}` : 'none', color: C.text, cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {activeTab === 'report' && <ReportForm />}
        {activeTab === 'track' && <TrackComplaint />}
        {activeTab === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}
