import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  Shield, 
  Settings as SettingsIcon, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  Check, 
  X, 
  Upload, 
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';

export default function SuperAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('admins'); // admins | appSettings | tournaments
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Admins CRUD State
  const [admins, setAdmins] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminStatus, setAdminStatus] = useState('active');
  const [adminIsVisible, setAdminIsVisible] = useState(true);

  // App Info State
  const [appName, setAppName] = useState('');
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const logoInputRef = useRef(null);

  // Tournaments CRUD State
  const [tournaments, setTournaments] = useState([]);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState(null);
  const [tourTitle, setTourTitle] = useState('');
  const [tourDesc, setTourDesc] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [tourVisibility, setTourVisibility] = useState('all'); // all | members_only
  
  // Dynamic Prizes state
  const [prizes, setPrizes] = useState([
    { place: 1, amount: '₹500 Cash Prize', type: 'Cash' },
    { place: 2, amount: '₹200 Gift Voucher + Badminton Racket', type: 'Gift/Membership' }
  ]);

  // Load admins
  const loadAdmins = async () => {
    try {
      const data = await api.get('/api/super/admins');
      setAdmins(data.admins || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load app settings
  const loadAppInfo = async () => {
    try {
      const data = await api.get('/api/super/app-info');
      setAppName(data.app_name);
      setAppLogoUrl(data.app_logo);
    } catch (err) {
      console.error(err);
    }
  };

  // Load tournaments
  const loadTournaments = async () => {
    try {
      const data = await api.get('/api/super/tournaments');
      setTournaments(data.tournaments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'admins') {
      loadAdmins();
    } else if (activeTab === 'appSettings') {
      loadAppInfo();
    } else if (activeTab === 'tournaments') {
      loadTournaments();
    }
    setSuccessMsg('');
    setErrorMsg('');
  }, [activeTab]);

  // Add / Edit Admin Submit
  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        status: adminStatus,
        is_visible: adminIsVisible,
      };

      if (adminPassword) {
        payload.password = adminPassword;
      }

      if (editingAdminId) {
        await api.put(`/api/super/admins/${editingAdminId}`, payload);
        setSuccessMsg('Administrator updated successfully.');
      } else {
        if (!adminPassword) {
          setErrorMsg('Password is required when creating a new administrator.');
          return;
        }
        await api.post('/api/super/admins', payload);
        setSuccessMsg('Administrator created successfully.');
      }

      resetAdminForm();
      loadAdmins();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save admin.');
    }
  };

  const openAddAdmin = () => {
    setEditingAdminId(null);
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminPhone('');
    setAdminStatus('active');
    setAdminIsVisible(true);
    setShowAdminModal(true);
  };

  const openEditAdmin = (admin) => {
    setEditingAdminId(admin.id);
    setAdminName(admin.name);
    setAdminEmail(admin.email);
    setAdminPassword('');
    setAdminPhone(admin.phone || '');
    setAdminStatus(admin.status);
    setAdminIsVisible(admin.is_visible);
    setShowAdminModal(true);
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin account?')) return;
    try {
      await api.delete(`/api/super/admins/${id}`);
      setSuccessMsg('Admin account deleted.');
      loadAdmins();
    } catch (err) {
      setErrorMsg('Failed to delete admin.');
    }
  };

  const resetAdminForm = () => {
    setShowAdminModal(false);
    setEditingAdminId(null);
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminPhone('');
  };

  // Save App Settings
  const handleSaveAppInfo = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('app_name', appName);
      if (logoFile) {
        formData.append('app_logo', logoFile);
      }

      const response = await api.post('/api/super/app-info', formData, true);
      setAppLogoUrl(response.app_logo);
      setLogoFile(null);
      setSuccessMsg('Application information saved successfully.');
      
      // Refresh page or trigger navbar update
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save app information.');
    } finally {
      setLoading(false);
    }
  };

  // Tournament CRUD Operations
  const handleSaveTournament = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        title: tourTitle,
        description: tourDesc,
        date: tourDate,
        visibility: tourVisibility,
        prizes: prizes
      };

      if (editingTournamentId) {
        await api.put(`/api/super/tournaments/${editingTournamentId}`, payload);
        setSuccessMsg('Tournament updated successfully.');
      } else {
        await api.post('/api/super/tournaments', payload);
        setSuccessMsg('Tournament created successfully.');
      }

      resetTournamentForm();
      loadTournaments();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save tournament.');
    }
  };

  const openAddTournament = () => {
    setEditingTournamentId(null);
    setTourTitle('');
    setTourDesc('');
    setTourDate('');
    setTourVisibility('all');
    setPrizes([
      { place: 1, amount: '', type: 'Cash' },
      { place: 2, amount: '', type: 'Gift/Membership' }
    ]);
    setShowTournamentModal(true);
  };

  const openEditTournament = (t) => {
    setEditingTournamentId(t.id);
    setTourTitle(t.title);
    setTourDesc(t.description);
    setTourDate(t.date);
    setTourVisibility(t.visibility);
    setPrizes(t.prizes || []);
    setShowTournamentModal(true);
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Delete this tournament announcement?')) return;
    try {
      await api.delete(`/api/super/tournaments/${id}`);
      setSuccessMsg('Tournament deleted.');
      loadTournaments();
    } catch (err) {
      setErrorMsg('Failed to delete tournament.');
    }
  };

  const resetTournamentForm = () => {
    setShowTournamentModal(false);
    setEditingTournamentId(null);
    setTourTitle('');
    setTourDesc('');
    setTourDate('');
  };

  // Add Prize placement row
  const addPrizeRow = () => {
    const nextPlace = prizes.length + 1;
    setPrizes([...prizes, { place: nextPlace, amount: '', type: 'Cash' }]);
  };

  // Remove last prize placement row
  const removePrizeRow = (index) => {
    const copy = prizes.filter((_, i) => i !== index);
    // Reindex places
    const updated = copy.map((p, i) => ({ ...p, place: i + 1 }));
    setPrizes(updated);
  };

  const updatePrizeField = (index, field, value) => {
    const copy = [...prizes];
    copy[index][field] = value;
    setPrizes(copy);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ padding: '0 16px 16px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Super Admin</div>
        </div>

        <button 
          className={`sidebar-btn ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <Shield size={18} /> Manage Admins
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'appSettings' ? 'active' : ''}`}
          onClick={() => setActiveTab('appSettings')}
        >
          <SettingsIcon size={18} /> App Branding Setup
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy size={18} /> Manage Tournaments
        </button>

        <button 
          className="sidebar-btn" 
          onClick={onLogout}
          style={{ marginTop: 'auto', color: 'var(--danger)' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Content panel */}
      <main className="main-content">
        
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: '#10B981',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* TAB 1: ADMINS CRUD */}
        {activeTab === 'admins' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Club Administrators</h2>
              <button className="btn-primary" onClick={openAddAdmin}>
                <Plus size={16} /> Add Admin
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Access Status</th>
                    <th>Visible to Users</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>No administrators found.</td>
                    </tr>
                  ) : (
                    admins.map((adm) => (
                      <tr key={adm.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{adm.name}</td>
                        <td>{adm.email}</td>
                        <td>{adm.phone || 'N/A'}</td>
                        <td>
                          <span className={`badge ${adm.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {adm.status === 'active' ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${adm.is_visible ? 'badge-success' : 'badge-danger'}`}>
                            {adm.is_visible ? 'Show Contact' : 'Hidden'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-secondary" style={{ padding: '6px' }} onClick={() => openEditAdmin(adm)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteAdmin(adm.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATION SETTINGS */}
        {activeTab === 'appSettings' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>App Branding & Information</h2>

            <form onSubmit={handleSaveAppInfo} className="card" style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ap-name">Application Name</label>
                <input
                  id="ap-name"
                  type="text"
                  className="form-control"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Application Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {appLogoUrl ? (
                    <img 
                      src={appLogoUrl} 
                      alt="Logo preview" 
                      style={{ 
                        height: '64px', 
                        width: '64px', 
                        objectFit: 'contain',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '4px',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                      }} 
                    />
                  ) : (
                    <div style={{ 
                      height: '64px', 
                      width: '64px', 
                      borderRadius: '6px', 
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  
                  <div>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => logoInputRef.current.click()}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      <Upload size={16} /> Upload New Logo
                    </button>
                    <input
                      type="file"
                      ref={logoInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files[0])}
                    />
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {logoFile ? logoFile.name : 'PNG/JPG file up to 2MB'}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Update Application Settings'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: TOURNAMENTS CRUD */}
        {activeTab === 'tournaments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>Tournament Announcements</h2>
              <button className="btn-primary" onClick={openAddTournament}>
                <Plus size={16} /> Create Tournament
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tournament Title</th>
                    <th>Date</th>
                    <th>Visibility</th>
                    <th>No. of Prizes</th>
                    <th>Prizes Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>No tournaments registered.</td>
                    </tr>
                  ) : (
                    tournaments.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</td>
                        <td>{t.date}</td>
                        <td>
                          <span className={`badge ${t.visibility === 'members_only' ? 'badge-warning' : 'badge-info'}`}>
                            {t.visibility === 'members_only' ? 'Members Only' : 'Everyone'}
                          </span>
                        </td>
                        <td>{t.prizes ? t.prizes.length : 0}</td>
                        <td style={{ fontSize: '13px' }}>
                          {t.prizes && t.prizes.map(p => `#${p.place}: ${p.amount}`).join(' | ')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-secondary" style={{ padding: '6px' }} onClick={() => openEditTournament(t)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteTournament(t.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ADMIN EDIT / ADD MODAL */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={resetAdminForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingAdminId ? 'Edit Admin details' : 'Add Administrator'}</h3>
              <button className="modal-close" onClick={resetAdminForm}>&times;</button>
            </div>
            <form onSubmit={handleSaveAdmin}>
              <div className="form-group">
                <label className="form-label" htmlFor="adm-name-inp">Name</label>
                <input
                  id="adm-name-inp"
                  type="text"
                  className="form-control"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adm-email-inp">Email Address</label>
                <input
                  id="adm-email-inp"
                  type="email"
                  className="form-control"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adm-pwd-inp">
                  Password {editingAdminId && '(Leave blank to keep current password)'}
                </label>
                <input
                  id="adm-pwd-inp"
                  type="password"
                  className="form-control"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required={!editingAdminId}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="adm-phn-inp">Phone Number</label>
                <input
                  id="adm-phn-inp"
                  type="text"
                  className="form-control"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adm-status-inp">Access Privileges</label>
                  <select
                    id="adm-status-inp"
                    className="form-control"
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                    required
                  >
                    <option value="active">Enabled (Active)</option>
                    <option value="inactive">Disabled (No login)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adm-vis-inp">Display in Contacts</label>
                  <select
                    id="adm-vis-inp"
                    className="form-control"
                    value={adminIsVisible ? 'true' : 'false'}
                    onChange={(e) => setAdminIsVisible(e.target.value === 'true')}
                    required
                  >
                    <option value="true">Yes, Show to Users</option>
                    <option value="false">No, Hide Contact</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={resetAdminForm}>Cancel</button>
                <button type="submit" className="btn-primary">Save Administrator</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOURNAMENT ADD / EDIT MODAL */}
      {showTournamentModal && (
        <div className="modal-overlay" onClick={resetTournamentForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingTournamentId ? 'Edit Tournament' : 'Create Tournament'}</h3>
              <button className="modal-close" onClick={resetTournamentForm}>&times;</button>
            </div>
            <form onSubmit={handleSaveTournament}>
              <div className="form-group">
                <label className="form-label" htmlFor="tr-tit">Tournament Title</label>
                <input
                  id="tr-tit"
                  type="text"
                  className="form-control"
                  placeholder="Club Championship 2026"
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="tr-dt">Tournament Date</label>
                  <input
                    id="tr-dt"
                    type="date"
                    className="form-control"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tr-vis">Visibility Scope</label>
                  <select
                    id="tr-vis"
                    className="form-control"
                    value={tourVisibility}
                    onChange={(e) => setTourVisibility(e.target.value)}
                    required
                  >
                    <option value="all">Everyone (Public & Members)</option>
                    <option value="members_only">Club Members Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tr-des">Description & Registration Guidelines</label>
                <textarea
                  id="tr-des"
                  className="form-control"
                  rows="3"
                  placeholder="Registration requirements, match format, and details..."
                  value={tourDesc}
                  onChange={(e) => setTourDesc(e.target.value)}
                  required
                />
              </div>

              <h4 style={{ fontSize: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', margin: '20px 0 12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Tournament Prizes Configuration</span>
                <button type="button" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={addPrizeRow}>
                  + Add Place Award
                </button>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '24px' }}>
                {prizes.map((p, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 150px 40px', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Place #{p.place}</span>
                    <input
                      type="text"
                      placeholder="e.g. ₹500 Cash / Trophy"
                      className="form-control"
                      style={{ padding: '8px 12px' }}
                      value={p.amount}
                      onChange={(e) => updatePrizeField(index, 'amount', e.target.value)}
                      required
                    />
                    <select
                      className="form-control"
                      style={{ padding: '8px 12px' }}
                      value={p.type}
                      onChange={(e) => updatePrizeField(index, 'type', e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Gift/Membership">Gift/Gifts</option>
                      <option value="Membership">Membership Extension</option>
                    </select>
                    <button 
                      type="button" 
                      className="btn-danger" 
                      style={{ padding: '8px' }} 
                      disabled={prizes.length <= 1}
                      onClick={() => removePrizeRow(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={resetTournamentForm}>Cancel</button>
                <button type="submit" className="btn-primary">Save Tournament</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
