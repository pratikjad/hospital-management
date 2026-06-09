import React, { useState, useEffect } from 'react';
import './App.css';

const API = 'https://hospital-management-sw4d.onrender.com';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', experience: '', city: '', consultation_fee: '' });
  const [newPatient, setNewPatient] = useState({ name: '', age: '', disease: '', city: '', mobile: '', address: '', blood_group: '' });
  const [newApt, setNewApt] = useState({ patient_id: '', doctor_id: '', date: '', status: 'Pending', treatment: '', charges: '' });
  const [editDoctor, setEditDoctor] = useState(null);
  const [editApt, setEditApt] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [mobileError, setMobileError] = useState('');
  const [beds, setBeds] = useState([]);
  const [bedStats, setBedStats] = useState({});
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchPatients();
      fetchStats();
      fetchAppointments();
      fetchPendingBills();
      fetchBeds();
      fetchBedStats();
    }
  }, [token]);

  const authHeader = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  const handleLogin = async () => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) { setToken(data.token); setRole(data.role); }
    else { setError('Wrong username or password!'); }
  };

  const fetchDoctors = async () => {
    const res = await fetch(`${API}/doctors`);
    const data = await res.json();
    setDoctors(data.doctors);
  };

  const fetchPatients = async () => {
    const res = await fetch(`${API}/patients`, { headers: authHeader() });
    const data = await res.json();
    setPatients(data.patients);
  };

  const fetchStats = async () => {
    const res = await fetch(`${API}/stats`, { headers: authHeader() });
    const data = await res.json();
    setStats(data);
  };

  const fetchAppointments = async () => {
    const res = await fetch(`${API}/appointments`, { headers: authHeader() });
    const data = await res.json();
    setAppointments(data.appointments);
  };

  const fetchPendingBills = async () => {
    const res = await fetch(`${API}/bills/pending`, { headers: authHeader() });
    const data = await res.json();
    setPendingBills(data.pending_bills);
  };
  const fetchBeds = async () => {
    const res = await fetch(`${API}/beds`, { headers: authHeader() });
    const data = await res.json();
    setBeds(data.beds);
  };

  const fetchBedStats = async () => {
    const res = await fetch(`${API}/beds/stats`, { headers: authHeader() });
    const data = await res.json();
    setBedStats(data);
  };

  const assignBed = async (bed_id, patient_id) => {
    await fetch(`${API}/beds/assign/${bed_id}`, {
      method: 'PUT', headers: authHeader(),
      body: JSON.stringify({ patient_id: parseInt(patient_id) })
    });
    fetchBeds(); fetchBedStats();
  };

  const freeBed = async (bed_id) => {
    await fetch(`${API}/beds/free/${bed_id}`, { method: 'PUT', headers: authHeader() });
    fetchBeds(); fetchBedStats();
  };

  const calculateBill = async (appointment_id) => {
    const res = await fetch(`${API}/bills/calculate/${appointment_id}`, { headers: authHeader() });
    const data = await res.json();
    setInvoice(data);
  };

  const generateBill = async () => {
    await fetch(`${API}/bills/generate`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({
        appointment_id: invoice.appointment.id,
        patient_id: invoice.appointment.patient_id,
        total: invoice.total
      })
    });
    alert('Bill Generated! ✅');
    fetchPendingBills();
    fetchStats();
  };

  const printInvoice = () => {
    window.print();
  };

  const addDoctor = async () => {
    await fetch(`${API}/doctors/add`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({ ...newDoctor, experience: parseInt(newDoctor.experience) })
    });
    setNewDoctor({ name: '', specialty: '', experience: '', city: '' });
    fetchDoctors(); fetchStats();
  };

  const deleteDoctor = async (id) => {
    await fetch(`${API}/doctors/delete/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchDoctors(); fetchStats();
  };

  const updateDoctor = async () => {
    await fetch(`${API}/doctors/update/${editDoctor.id}`, {
      method: 'PUT', headers: authHeader(),
      body: JSON.stringify({ ...editDoctor, experience: parseInt(editDoctor.experience) })
    });
    setEditDoctor(null); fetchDoctors();
  };

  const addPatient = async () => {
    if (newPatient.mobile.length !== 10 || isNaN(newPatient.mobile)) {
      setMobileError('Mobile number 10 digits असणे compulsory आहे!');
      return;
    }
    setMobileError('');
    await fetch(`${API}/patients/add`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({ ...newPatient, age: parseInt(newPatient.age) })
    });
    setNewPatient({ name: '', age: '', disease: '', city: '', mobile: '', address: '', blood_group: '' });
    fetchPatients(); fetchStats();
  };

  const updatePatient = async () => {
    if (editPatient.mobile && (editPatient.mobile.length !== 10 || isNaN(editPatient.mobile))) {
      setMobileError('Mobile number 10 digits असणे compulsory आहे!');
      return;
    }
    setMobileError('');
    await fetch(`${API}/patients/update/${editPatient.id}`, {
      method: 'PUT', headers: authHeader(),
      body: JSON.stringify({ ...editPatient, age: parseInt(editPatient.age) })
    });
    setEditPatient(null);
    fetchPatients();
  };

  const deletePatient = async (id) => {
    await fetch(`${API}/patients/delete/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchPatients(); fetchStats();
  };

  const addAppointment = async () => {
    await fetch(`${API}/appointments/add`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({
        ...newApt,
        patient_id: parseInt(newApt.patient_id),
        doctor_id: parseInt(newApt.doctor_id),
        charges: parseInt(newApt.charges)
      })
    });
    setNewApt({ patient_id: '', doctor_id: '', date: '', status: 'Pending', treatment: '', charges: '' });
    fetchAppointments(); fetchStats(); fetchPendingBills();
  };

  const updateAppointment = async () => {
    await fetch(`${API}/appointments/update/${editApt.id}`, {
      method: 'PUT', headers: authHeader(),
      body: JSON.stringify({
        status: editApt.status,
        treatment: editApt.treatment,
        charges: parseInt(editApt.charges)
      })
    });
    setEditApt(null); fetchAppointments(); fetchPendingBills();
  };

  const payBill = async (id) => {
    await fetch(`${API}/bills/pay/${id}`, { method: 'PUT', headers: authHeader() });
    fetchPendingBills(); fetchStats();
  };

  // Login Page
  if (!token) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left Side — Hospital Photo */}
      <div style={{ flex: 1.1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=900&q=85')", backgroundSize: 'cover', backgroundPosition: 'center top' }}></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(13,110,100,0.82) 0%,rgba(22,60,100,0.75) 100%)' }}></div>
        <svg style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, opacity: 0.18 }} viewBox="0 0 600 60">
          <polyline points="0,30 80,30 100,10 115,50 130,5 145,55 160,30 260,30 280,10 295,50 310,5 325,55 340,30 440,30 460,10 475,50 490,5 505,55 520,30 600,30" fill="none" stroke="white" strokeWidth="2"/>
        </svg>
        <div style={{ position: 'relative', zIndex: 2, padding: '48px 40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏥</div>
            <div>
              <div style={{ color: 'white', fontSize: '17px', fontWeight: 600 }}>Hospital Management</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Advanced Care System</div>
            </div>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: 'white', lineHeight: 1.25, marginBottom: '12px' }}>
              Quality Care,<br/><span style={{ color: '#5DCAA5' }}>Every Patient</span><br/>Deserves
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '280px' }}>
              Manage doctors, patients, appointments and bills — all in one place.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🩺', title: 'Expert Doctors', sub: 'Specialists across all departments' },
              { icon: '📋', title: 'Smart Appointments', sub: 'Track & manage with ease' },
              { icon: '💊', title: '24/7 Patient Care', sub: 'Always available support' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{f.icon}</div>
                <div>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side — Login Card */}
      <div style={{ width: '400px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 36px' }}>
        <div style={{ width: '100%' }}>
          <div style={{ height: '4px', background: 'linear-gradient(90deg,#1D9E75,#185FA5)', borderRadius: '4px', marginBottom: '32px' }}></div>
          <div style={{ width: '58px', height: '58px', background: 'linear-gradient(135deg,#1D9E75,#185FA5)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px' }}>🔐</div>
          <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1a2a3a', marginBottom: '4px' }}>Welcome Back</h2>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginBottom: '28px' }}>Sign in to your hospital account</p>

          <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>Username</label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>👤</span>
            <input placeholder="Enter username" onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '11px 12px 11px 36px', border: '1.5px solid #e5f0f5', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f7fbfc' }} />
          </div>

          <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '5px' }}>Password</label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔒</span>
            <input placeholder="Enter password" type="password" onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '11px 12px 11px 36px', border: '1.5px solid #e5f0f5', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#f7fbfc' }} />
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}

          <button onClick={handleLogin}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#1D9E75,#185FA5)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            🔐 Sign In
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }}></div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>demo credentials</div>
            <div style={{ flex: 1, height: '1px', background: '#f0f4f8' }}></div>
          </div>

          <div style={{ background: '#f0fbf7', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#aaa' }}>Admin</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1D9E75' }}>admin / admin123</div>
            </div>
            <div style={{ width: '1px', height: '28px', background: '#d0ede5' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#aaa' }}>User</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1D9E75' }}>user / user123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div>
      {/* Invoice Modal */}
      {invoice && (
        <div className="invoice-overlay">
          <div className="invoice-box" id="invoice-print">
            <div className="invoice-header">
              <h2>🏥 Hospital Management System</h2>
              <p>Invoice / Bill Receipt</p>
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div className="invoice-section">
              <h4>👤 Patient Details</h4>
              <div className="invoice-row"><span>Name</span><span>{invoice.appointment.patient_name}</span></div>
              <div className="invoice-row"><span>Age</span><span>{invoice.appointment.age}</span></div>
              <div className="invoice-row"><span>Disease</span><span>{invoice.appointment.disease}</span></div>
              <div className="invoice-row"><span>Blood Group</span><span>{invoice.appointment.blood_group || '-'}</span></div>
              <div className="invoice-row"><span>Mobile</span><span>{invoice.appointment.mobile || '-'}</span></div>
            </div>

            <div className="invoice-section">
              <h4>👨‍⚕️ Doctor Details</h4>
              <div className="invoice-row"><span>Doctor</span><span>{invoice.appointment.doctor_name}</span></div>
              <div className="invoice-row"><span>Specialty</span><span>{invoice.appointment.specialty}</span></div>
              <div className="invoice-row"><span>Date</span><span>{invoice.appointment.date ? new Date(invoice.appointment.date).toLocaleDateString('en-IN') : '-'}</span></div>
              <div className="invoice-row"><span>Treatment</span><span>{invoice.appointment.treatment || '-'}</span></div>
            </div>

            <div className="invoice-section">
              <h4>💰 Bill Details</h4>
              <div className="invoice-row"><span>Consultation Fee</span><span>₹{invoice.consultation_fee}</span></div>
              <div className="invoice-row"><span>Treatment Charges</span><span>₹{invoice.treatment_charges}</span></div>
              <div className="invoice-total"><span>Total Amount</span><span>₹{invoice.total}</span></div>
            </div>

            <div className="invoice-btns">
              <button className="btn btn-purple" onClick={generateBill}>✅ Generate Bill</button>
              <button className="btn btn-green" onClick={printInvoice}>🖨️ Print Invoice</button>
              <button className="btn btn-grey" onClick={() => setInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <h2>🏥 Hospital Management System</h2>
        <div className="header-right">
          <span className={`role-badge ${role === 'admin' ? 'role-admin' : 'role-user'}`}>
            {role.toUpperCase()}
          </span>
          <button className="logout-btn" onClick={() => { setToken(''); setRole(''); }}>Logout</button>
        </div>
      </div>

      {/* Navbar */}
      <div className="navbar">
        <button className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>📊 Dashboard</button>
        <button className={`nav-btn ${page === 'doctors' ? 'active' : ''}`} onClick={() => setPage('doctors')}>👨‍⚕️ Doctors</button>
        <button className={`nav-btn ${page === 'patients' ? 'active' : ''}`} onClick={() => setPage('patients')}>🤒 Patients</button>
        <button className={`nav-btn ${page === 'appointments' ? 'active' : ''}`} onClick={() => setPage('appointments')}>📅 Appointments</button>
        <button className={`nav-btn ${page === 'bills' ? 'active' : ''}`} onClick={() => setPage('bills')}>💰 Pending Bills</button>
        <button className={`nav-btn ${page === 'beds' ? 'active' : ''}`} onClick={() => setPage('beds')}>🛏️ Beds</button>
      </div>

      <div className="main-content">

        {/* Dashboard */}
        {/* Dashboard */}
{page === 'dashboard' && (
  <div style={{ padding: '0.5rem 0' }}>

    {/* Top Bar */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#444' }}>
        Hospital <span style={{ color: '#1D9E75' }}>Management</span> System
      </div>
      <div style={{ fontSize: '12px', color: '#888', background: 'white', border: '1px solid #eee', borderRadius: '20px', padding: '6px 14px' }}>
        📅 {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </div>
    </div>

    {/* Stats Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '1.75rem' }}>
      {[
        { label: 'Total Doctors', value: stats.doctors, accent: '#534AB7', bg: '#EEEDFE', icon: '🩺' },
        { label: 'Total Patients', value: stats.patients, accent: '#1D9E75', bg: '#E1F5EE', icon: '🧑‍⚕️' },
        { label: 'Appointments', value: stats.appointments, accent: '#BA7517', bg: '#FAEEDA', icon: '📅' },
        { label: 'Pending Bills', value: stats.pending_bills, accent: '#D85A30', bg: '#FAECE7', icon: '🧾' },
      ].map((s, i) => (
        <div key={i} style={{ background: 'white', border: '1px solid #f0eef6', borderRadius: '14px', padding: '1.1rem 1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: s.accent, borderRadius: '4px 0 0 4px' }}></div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '18px' }}>{s.icon}</div>
          <div style={{ fontSize: '30px', fontWeight: '700', color: '#333', lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* Middle Row */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px', marginBottom: '1.75rem' }}>

      {/* Recent Appointments */}
      <div style={{ background: 'white', border: '1px solid #f0eef6', borderRadius: '14px', padding: '1.25rem' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }}>Recent Appointments</div>
        {appointments.slice(0, 4).map((apt, i) => {
          const colors = ['#EEEDFE:#534AB7', '#E1F5EE:#1D9E75', '#FAEEDA:#BA7517', '#E6F1FB:#185FA5'];
          const [bg, fg] = colors[i % colors.length].split(':');
          const initials = apt.patient_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
          return (
            <div key={apt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 3 ? '1px solid #f5f3fc' : 'none' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{apt.patient_name}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>{apt.doctor_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#999' }}>{apt.date ? new Date(apt.date).toLocaleDateString('en-IN') : '-'}</div>
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: apt.status === 'Completed' ? '#E1F5EE' : '#FAEEDA', color: apt.status === 'Completed' ? '#0F6E56' : '#854F0B', marginTop: '3px', display: 'inline-block' }}>{apt.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Summary */}
      <div style={{ background: 'white', border: '1px solid #f0eef6', borderRadius: '14px', padding: '1.25rem' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }}>Bill Summary</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ flex: 1, background: '#E1F5EE', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F6E56' }}> {stats.paid_bills || 0} </div>
            <div style={{ fontSize: '11px', color: '#0F6E56', marginTop: '3px' }}>Paid</div>
          </div>
          <div style={{ flex: 1, background: '#FAECE7', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#993C1D' }}>{stats.pending_bills || 0}</div>
            <div style={{ fontSize: '11px', color: '#993C1D', marginTop: '3px' }}>Pending</div>
          </div>
        </div>
        <div style={{ background: '#f8f7ff', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#999' }}>Quick Actions</div>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => setPage('appointments')} style={{ padding: '7px', background: '#EEEDFE', color: '#534AB7', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>📅 Appointments</button>
            <button onClick={() => setPage('bills')} style={{ padding: '7px', background: '#FAECE7', color: '#993C1D', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>💰 Pending Bills</button>
          </div>
        </div>
      </div>
    </div>

  </div>
)}

        {/* Doctors */}
        {page === 'doctors' && (
          <div>
            <p className="page-title">👨‍⚕️ Doctors</p>
            {role === 'admin' && (
              <div className="form-card">
                <h3>➕ Add Doctor Details</h3>
                <div className="form-row">
                  <input className="form-input" placeholder="Name" value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} />
                  <input className="form-input" placeholder="Specialty" value={newDoctor.specialty} onChange={e => setNewDoctor({ ...newDoctor, specialty: e.target.value })} />
                  <input className="form-input" placeholder="Experience (yrs)" value={newDoctor.experience} onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })} />
                  <input className="form-input" placeholder="City" value={newDoctor.city} onChange={e => setNewDoctor({ ...newDoctor, city: e.target.value })} />
                  <input className="form-input" placeholder="Consultation Fee (₹)" value={newDoctor.consultation_fee} onChange={e => setNewDoctor({ ...newDoctor, consultation_fee: e.target.value })} />
                  <button className="btn btn-purple" onClick={addDoctor}>✅ Add Doctor</button>
                  
                </div>
              </div>
            )}
            {editDoctor && (
              <div className="edit-card">
                <h3>✏️ Edit Doctor Details </h3>
                <div className="form-row">
                  <input className="form-input" value={editDoctor.name} onChange={e => setEditDoctor({ ...editDoctor, name: e.target.value })} />
                  <input className="form-input" value={editDoctor.specialty} onChange={e => setEditDoctor({ ...editDoctor, specialty: e.target.value })} />
                  <input className="form-input" value={editDoctor.experience} onChange={e => setEditDoctor({ ...editDoctor, experience: e.target.value })} />
                  <input className="form-input" value={editDoctor.city} onChange={e => setEditDoctor({ ...editDoctor, city: e.target.value })} />
                  <button className="btn btn-orange" onClick={updateDoctor}>Update</button>
                  <button className="btn btn-grey" onClick={() => setEditDoctor(null)}>Cancel</button>
                </div>
              </div>
            )}
           
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Specialty</th><th>Experience</th><th>City</th>
                    {role === 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td><strong>{doc.name}</strong></td>
                      <td>{doc.specialty}</td>
                      <td>{doc.experience} yrs</td>
                      <td>{doc.city}</td>
                      {role === 'admin' && (
                        <td>
                          <button className="btn btn-orange" onClick={() => setEditDoctor(doc)}>Edit</button>
                          &nbsp;
                          <button className="btn btn-red" onClick={() => deleteDoctor(doc.id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}




        {/* Patients */}
        {page === 'patients' && (
          <div>
            <p className="page-title">🤒 Patients</p>
            {role === 'admin' && (
              <div className="form-card">
                <h3>➕ Add Patient Details </h3>
                <div className="form-row">
                  <input className="form-input" placeholder="Name" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
                  <input className="form-input" placeholder="Age" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} />
                  <input className="form-input" placeholder="Disease" value={newPatient.disease} onChange={e => setNewPatient({ ...newPatient, disease: e.target.value })} />
                  <input className="form-input" placeholder="City" value={newPatient.city} onChange={e => setNewPatient({ ...newPatient, city: e.target.value })} />
                  <input className="form-input" placeholder="Mobile (10 digits)" value={newPatient.mobile} onChange={e => setNewPatient({ ...newPatient, mobile: e.target.value })} maxLength={10} />
                  {mobileError && <p style={{ color: 'red', fontSize: '13px' }}>{mobileError}</p>}
                  <input className="form-input" placeholder="Address" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} />
                  <select className="form-select" value={newPatient.blood_group} onChange={e => setNewPatient({ ...newPatient, blood_group: e.target.value })}>
                    <option value="">-- Blood Group --</option>
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option>
                    <option>AB+</option><option>AB-</option>
                  </select>
                <button className="btn btn-purple" onClick={addPatient}>✅ Add Patient</button>
                </div>
              </div>
            )}
            {editPatient && (
              <div className="edit-card">
                <h3>✏️ Patient Edit करा</h3>
                <div className="form-row">
                  <input className="form-input" placeholder="Name" value={editPatient.name} onChange={e => setEditPatient({ ...editPatient, name: e.target.value })} />
                  <input className="form-input" placeholder="Age" value={editPatient.age} onChange={e => setEditPatient({ ...editPatient, age: e.target.value })} />
                  <input className="form-input" placeholder="Disease" value={editPatient.disease} onChange={e => setEditPatient({ ...editPatient, disease: e.target.value })} />
                  <input className="form-input" placeholder="City" value={editPatient.city} onChange={e => setEditPatient({ ...editPatient, city: e.target.value })} />
                  <input className="form-input" placeholder="Mobile (10 digits)" value={editPatient.mobile || ''} onChange={e => setEditPatient({ ...editPatient, mobile: e.target.value })} maxLength={10} />
                  <input className="form-input" placeholder="Address" value={editPatient.address || ''} onChange={e => setEditPatient({ ...editPatient, address: e.target.value })} />
                  <select className="form-select" value={editPatient.blood_group || ''} onChange={e => setEditPatient({ ...editPatient, blood_group: e.target.value })}>
                    <option value="">-- Blood Group --</option>
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option>
                    <option>AB+</option><option>AB-</option>
                  </select>
                  <button className="btn btn-orange" onClick={updatePatient}>Update</button>
                  <button className="btn btn-grey" onClick={() => setEditPatient(null)}>Cancel</button>
                </div>
                  {mobileError && <p style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{mobileError}</p>}
              </div>
            )}

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Age</th><th>Blood Group</th><th>Disease</th><th>City</th><th>Mobile</th><th>Address</th>
                    {role === 'admin' && <th>Actions</th>}  
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.age}</td>
                      <td>{p.blood_group || '-'}</td>
                      <td>{p.disease}</td>
                      <td>{p.city}</td>
                      <td>{p.mobile || '-'}</td>
                      <td>{p.address || '-'}</td>
                      {role === 'admin' && (
                        <td>
                            <button className="btn btn-orange" onClick={() => setEditPatient(p)}>Edit</button>
                            &nbsp;
                            <button className="btn btn-red" onClick={() => deletePatient(p.id)}>Delete</button>
                          </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments */}
        {page === 'appointments' && (
          <div>
            <p className="page-title">📅 Appointments</p>
            {role === 'admin' && (
              <div className="form-card">
                <h3>➕ Book Appointment </h3>
                <div className="form-row">
                  <select className="form-select" value={newApt.patient_id} onChange={e => setNewApt({ ...newApt, patient_id: e.target.value })}>
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>)}
                  </select>
                  <select className="form-select" value={newApt.doctor_id} onChange={e => setNewApt({ ...newApt, doctor_id: e.target.value })}>
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}
                  </select>
                  <input className="form-input" type="date" value={newApt.date} onChange={e => setNewApt({ ...newApt, date: e.target.value })} />
                  <input className="form-input" placeholder="Treatment" value={newApt.treatment} onChange={e => setNewApt({ ...newApt, treatment: e.target.value })} />
                  <input className="form-input" placeholder="Charges (₹)" value={newApt.charges} onChange={e => setNewApt({ ...newApt, charges: e.target.value })} />
                  <select className="form-select" value={newApt.status} onChange={e => setNewApt({ ...newApt, status: e.target.value })}>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                  <button className="btn btn-purple" onClick={addAppointment}>✅ Add</button>
                </div>
              </div>
            )}
            {editApt && (
              <div className="edit-card">
                <h3>✏️ Appointment Updates </h3>
                <div className="form-row">
                  <input className="form-input" placeholder="Treatment" value={editApt.treatment || ''} onChange={e => setEditApt({ ...editApt, treatment: e.target.value })} />
                  <input className="form-input" placeholder="Charges" value={editApt.charges || ''} onChange={e => setEditApt({ ...editApt, charges: e.target.value })} />
                  <select className="form-select" value={editApt.status} onChange={e => setEditApt({ ...editApt, status: e.target.value })}>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                  <button className="btn btn-orange" onClick={updateAppointment}>Update</button>
                  <button className="btn btn-grey" onClick={() => setEditApt(null)}>Cancel</button>
                </div>
              </div>
            )}
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Treatment</th><th>Charges</th><th>Status</th>
                    {role === 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.id}</td>
                      <td><strong>{apt.patient_name}</strong></td>
                      <td>{apt.doctor_name}</td>
                      <td>{apt.date ? new Date(apt.date).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{apt.treatment || '-'}</td>
                      <td>₹{apt.charges || 0}</td>
                      <td>
                        <span className={`status-badge ${apt.status === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                          {apt.status}
                        </span>
                      </td>
                      {role === 'admin' && (
                      <td>
                        <button className="btn btn-orange" onClick={() => setEditApt(apt)}>Edit</button>
                        &nbsp;
                        <button className="btn btn-purple" onClick={() => calculateBill(apt.id)}>🧾 Bill</button>
                      </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Bills */}
        {page === 'bills' && (
          <div>
            <p className="page-title">💰 Pending Bills</p>
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Treatment</th><th>Charges</th><th>Total</th><th>Status</th>
                    {role === 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pendingBills.length === 0 ? (
                    <tr><td colSpan="9" className="empty-state">✅ No Any Pending Bills...!</td></tr>
                  ) : (
                    pendingBills.map(bill => (
                      <tr key={bill.id}>
                        <td>{bill.id}</td>
                        <td><strong>{bill.patient_name || '-'}</strong></td>
                        <td>{bill.doctor_name || '-'}</td>
                        <td>{bill.date ? new Date(bill.date).toLocaleDateString('en-IN') : '-'}</td>
                        <td>{bill.treatment || '-'}</td>
                        <td>₹{bill.treatment_charges || 0}</td>
                        <td><strong>₹{bill.amount}</strong></td>
                        <td><span className="status-badge status-pending">Pending</span></td>
                        {role === 'admin' && (
                          <td>
                            <button className="btn btn-green" onClick={() => payBill(bill.id)}>✅ Mark Paid</button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Beds Page */}
{page === 'beds' && (
  <div>
    <p className="page-title">🛏️ Bed Availability</p>

    {/* Bed Stats */}
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
      <div className="stat-card" style={{ borderTopColor: '#6c63ff' }}>
        <div className="stat-icon">🛏️</div>
        <div className="stat-value" style={{ color: '#6c63ff' }}>{bedStats.total}</div>
        <div className="stat-label">Total Beds</div>
      </div>
      <div className="stat-card" style={{ borderTopColor: '#11998e' }}>
        <div className="stat-icon">✅</div>
        <div className="stat-value" style={{ color: '#11998e' }}>{bedStats.available}</div>
        <div className="stat-label">Available Beds</div>
      </div>
      <div className="stat-card" style={{ borderTopColor: '#eb3349' }}>
        <div className="stat-icon">🚫</div>
        <div className="stat-value" style={{ color: '#eb3349' }}>{bedStats.occupied}</div>
        <div className="stat-label">Occupied Beds</div>
      </div>
    </div>

    {/* Beds Table */}
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Bed No.</th>
            <th>Ward</th>
            <th>Status</th>
            <th>Patient</th>
            {role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {beds.map(bed => (
            <tr key={bed.id}>
              <td><strong>{bed.bed_number}</strong></td>
              <td>{bed.ward}</td>
              <td>
                <span className={`status-badge ${bed.status === 'Available' ? 'status-completed' : 'status-pending'}`}>
                  {bed.status}
                </span>
              </td>
              <td>{bed.patient_name || '-'}</td>
              {role === 'admin' && (
                <td>
                  {bed.status === 'Available' ? (
                    <select className="form-select" style={{ width: '160px' }}
                      onChange={e => e.target.value && assignBed(bed.id, e.target.value)}>
                      <option value="">-- Patient निवडा --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <button className="btn btn-green" onClick={() => freeBed(bed.id)}>
                      🔓 Free Bed
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

      </div>
    </div>
  );
}



export default App;
