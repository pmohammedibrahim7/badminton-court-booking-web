import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  Users, 
  Layers, 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon,
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  LogOut,
  CreditCard,
  Shield,
  Upload,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('groups'); // groups | tiers | bookings | settings
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Groups State
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTierId, setNewGroupTierId] = useState('');
  const [newGroupStatus, setNewGroupStatus] = useState('pending');
  const [newGroupExpiresAt, setNewGroupExpiresAt] = useState('');

  // Group Members State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [memberIdToEdit, setMemberIdToEdit] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberStatus, setMemberStatus] = useState('active');
  const [memberPicFile, setMemberPicFile] = useState(null);
  const fileInputRef = useRef(null);

  // Card Modal State
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardMember, setCardMember] = useState(null);
  const [cardStatusPaid, setCardStatusPaid] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  // Tiers State
  const [tiers, setTiers] = useState([]);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [showEditTierModal, setShowEditTierModal] = useState(false);
  const [editingTierId, setEditingTierId] = useState(null);
  const [tierName, setTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('');
  const [tierType, setTierType] = useState('monthly');
  const [tierDesc, setTierDesc] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [resDate, setResDate] = useState('');
  const [resStart, setResStart] = useState('');
  const [resEnd, setResEnd] = useState('');
  const [resName, setResName] = useState('Admin Maintenance');
  const [resType, setResType] = useState('reserved');

  // Settings State
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [reservedHours, setReservedHours] = useState([]);

  // Fetch groups
  const loadGroups = async () => {
    try {
      const data = await api.get('/api/admin/groups');
      setGroups(data.groups || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch tiers
  const loadTiers = async () => {
    try {
      const data = await api.get('/api/admin/tiers');
      setTiers(data.tiers || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch bookings
  const loadBookings = async () => {
    try {
      const data = await api.get('/api/admin/bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch settings
  const loadSettings = async () => {
    try {
      const data = await api.get('/api/admin/settings');
      setAdminName(data.settings.admin_name);
      setAdminPhone(data.settings.admin_phone);
      setReservedHours(data.settings.reserved_hours || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'groups') {
      loadGroups();
      loadTiers();
    } else if (activeTab === 'tiers') {
      loadTiers();
    } else if (activeTab === 'bookings') {
      loadBookings();
    } else if (activeTab === 'settings') {
      loadSettings();
    }
    setSelectedGroup(null);
    setSuccessMsg('');
    setErrorMsg('');
  }, [activeTab]);

  // Group Details View
  const handleViewGroupDetails = async (id) => {
    try {
      const data = await api.get(`/api/admin/groups/${id}`);
      setSelectedGroup(data.group);
    } catch (err) {
      setErrorMsg('Failed to load group details.');
    }
  };

  // CRUD Group
  const handleAddGroup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/api/admin/groups', {
        name: newGroupName,
        tier_id: newGroupTierId,
        status: newGroupStatus,
        expires_at: newGroupExpiresAt || null,
      });
      setNewGroupName('');
      setNewGroupExpiresAt('');
      setShowAddGroupModal(false);
      setSuccessMsg('Group created successfully.');
      loadGroups();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create group.');
    }
  };

  const handleUpdateGroupStatus = async (group, newStatus) => {
    try {
      await api.put(`/api/admin/groups/${group.id}`, {
        name: group.name,
        tier_id: group.tier_id,
        status: newStatus,
        expires_at: group.expires_at,
      });
      loadGroups();
      setSuccessMsg('Group status updated successfully.');
      if (selectedGroup && selectedGroup.id === group.id) {
        handleViewGroupDetails(group.id);
      }
    } catch (err) {
      setErrorMsg('Failed to update group.');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Delete group? This will permanently remove all associated members.')) return;
    try {
      await api.delete(`/api/admin/groups/${id}`);
      setSuccessMsg('Group and its members deleted.');
      setSelectedGroup(null);
      loadGroups();
    } catch (err) {
      setErrorMsg('Failed to delete group.');
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', memberName);
      formData.append('email', memberEmail);
      formData.append('phone', memberPhone);
      if (memberPicFile) {
        formData.append('profile_pic', memberPicFile);
      }

      await api.post(`/api/admin/groups/${selectedGroup.id}/members`, formData, true);
      
      setMemberName('');
      setMemberEmail('');
      setMemberPhone('');
      setMemberPicFile(null);
      setShowAddMemberModal(false);
      setSuccessMsg('Member added and credential email triggered.');
      handleViewGroupDetails(selectedGroup.id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  // Open edit member dialog
  const openEditMember = (member) => {
    setMemberIdToEdit(member.id);
    setMemberName(member.name);
    setMemberEmail(member.email);
    setMemberPhone(member.phone);
    setMemberStatus(member.status);
    setMemberPicFile(null);
    setShowEditMemberModal(true);
  };

  // Update Member
  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !memberIdToEdit) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', memberName);
      formData.append('email', memberEmail);
      formData.append('phone', memberPhone);
      formData.append('status', memberStatus);
      if (memberPicFile) {
        formData.append('profile_pic', memberPicFile);
      }

      await api.post(`/api/admin/members/${memberIdToEdit}`, formData, true);
      
      setMemberName('');
      setMemberEmail('');
      setMemberPhone('');
      setMemberPicFile(null);
      setShowEditMemberModal(false);
      setMemberIdToEdit(null);
      setSuccessMsg('Member details updated successfully.');
      handleViewGroupDetails(selectedGroup.id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update member.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Delete this member? They will lose booking access.')) return;
    try {
      await api.delete(`/api/admin/members/${id}`);
      setSuccessMsg('Member removed.');
      if (selectedGroup) {
        handleViewGroupDetails(selectedGroup.id);
      }
    } catch (err) {
      setErrorMsg('Failed to remove member.');
    }
  };

  // Membership Card Setup
  const openCardGenerator = (member) => {
    setCardMember(member);
    setCardStatusPaid(member.is_card_paid);
    setCardNumber(member.card_number || '');
    setShowCardModal(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardMember) return;
    try {
      await api.post(`/api/admin/members/${cardMember.id}/card`, {
        is_card_paid: cardStatusPaid,
        card_number: cardNumber,
      });
      setShowCardModal(false);
      setSuccessMsg('Membership card updated.');
      if (selectedGroup) {
        handleViewGroupDetails(selectedGroup.id);
      }
    } catch (err) {
      setErrorMsg('Failed to configure card.');
    }
  };

  // ─── Tiers CRUD ───────────────────────────────────────────────────────────
  const resetTierForm = () => {
    setTierName('');
    setTierPrice('');
    setTierType('monthly');
    setTierDesc('');
    setEditingTierId(null);
  };

  const handleAddTier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/tiers', {
        name: tierName,
        price: parseFloat(tierPrice),
        tier_type: tierType,
        description: tierDesc,
      });
      resetTierForm();
      setShowAddTierModal(false);
      setSuccessMsg('Membership tier created.');
      loadTiers();
    } catch (err) {
      setErrorMsg('Failed to create tier.');
    }
  };

  const openEditTier = (tier) => {
    setEditingTierId(tier.id);
    setTierName(tier.name);
    setTierPrice(tier.price);
    setTierType(tier.tier_type);
    setTierDesc(tier.description || '');
    setShowEditTierModal(true);
  };

  const handleUpdateTier = async (e) => {
    e.preventDefault();
    if (!editingTierId) return;
    try {
      await api.put(`/api/admin/tiers/${editingTierId}`, {
        name: tierName,
        price: parseFloat(tierPrice),
        tier_type: tierType,
        description: tierDesc,
      });
      resetTierForm();
      setShowEditTierModal(false);
      setSuccessMsg('Fee tier updated successfully.');
      loadTiers();
    } catch (err) {
      setErrorMsg('Failed to update tier.');
    }
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm('Delete tier? Groups using this tier will be affected.')) return;
    try {
      await api.delete(`/api/admin/tiers/${id}`);
      setSuccessMsg('Tier deleted.');
      loadTiers();
    } catch (err) {
      setErrorMsg('Failed to delete tier.');
    }
  };

  // Bookings CRUD
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this court booking?')) return;
    try {
      await api.delete(`/api/admin/bookings/${id}`);
      setSuccessMsg('Booking cancelled.');
      loadBookings();
    } catch (err) {
      setErrorMsg('Failed to cancel booking.');
    }
  };

  const handleAdminReserve = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/bookings', {
        booking_date: resDate,
        start_time: resStart,
        end_time: resEnd,
        name: resName,
        type: resType,
      });
      setResDate('');
      setResStart('');
      setResEnd('');
      setShowReserveModal(false);
      setSuccessMsg('Slot reserved successfully.');
      loadBookings();
    } catch (err) {
      setErrorMsg(err.message || 'Overlap collision or error reserving slot.');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/settings', {
        admin_name: adminName,
        admin_phone: adminPhone,
        reserved_hours: reservedHours,
      });
      setSuccessMsg('Settings updated.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    }
  };

  const handleUpdateReservedHoursTime = (index, field, value) => {
    const copy = [...reservedHours];
    copy[index][field] = value;
    setReservedHours(copy);
  };

  // Tier type badge color
  const tierTypeBadge = (type) => {
    if (type === 'monthly') return 'badge-info';
    if (type === 'quarterly') return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div style={{ padding: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Administrator</div>
        </div>

        <button 
          className={`sidebar-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <Users size={18} /> Membership Groups
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'tiers' ? 'active' : ''}`}
          onClick={() => setActiveTab('tiers')}
        >
          <Layers size={18} /> Fee Tiers
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <CalendarIcon size={18} /> Bookings Console
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={18} /> Reserved Hours &amp; Info
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
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: '#10B981',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* ─── TAB 1: MEMBERSHIP GROUPS LIST ─────────────────────────────── */}
        {activeTab === 'groups' && !selectedGroup && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Membership Groups</h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                  Manage groups and their members. Each group can hold up to 50 persons.
                </p>
              </div>
              <button className="btn-primary" onClick={() => {
                if (tiers.length === 0) {
                  setErrorMsg('Create a membership tier first before adding groups.');
                  return;
                }
                setNewGroupTierId(tiers[0].id);
                setShowAddGroupModal(true);
              }}>
                <Plus size={16} /> Create Group
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Group Name</th>
                    <th>Fee Tier</th>
                    <th>Price</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th>Expires At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No membership groups found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    groups.map((group) => (
                      <tr key={group.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{group.name}</td>
                        <td>
                          <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                            {group.tier?.name}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{group.tier?.price}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{group.members_count}</span>
                          <span style={{ color: 'var(--text-muted)' }}> / 50</span>
                        </td>
                        <td>
                          <select 
                            value={group.status}
                            onChange={(e) => handleUpdateGroupStatus(group, e.target.value)}
                            style={{
                              backgroundColor: 'var(--bg-input)',
                              color: '#fff',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="expired">Expired</option>
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          {group.expires_at ? new Date(group.expires_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 14px', fontSize: '13px' }} 
                              onClick={() => handleViewGroupDetails(group.id)}
                            >
                              <Users size={13} /> Manage
                            </button>
                            <button 
                              className="btn-danger" 
                              style={{ padding: '7px 10px' }} 
                              onClick={() => handleDeleteGroup(group.id)}
                            >
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

        {/* ─── TAB 1b: GROUP DETAIL (Members) ────────────────────────────── */}
        {activeTab === 'groups' && selectedGroup && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '7px 16px', fontSize: '13px', marginBottom: '16px' }} 
                onClick={() => setSelectedGroup(null)}
              >
                ← Back to Groups
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '24px', margin: '0 0 6px 0' }}>Group: {selectedGroup.name}</h2>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Tier: <strong>{selectedGroup.tier?.name}</strong>
                    &nbsp;·&nbsp;
                    Status: <strong style={{ textTransform: 'uppercase', color: selectedGroup.status === 'paid' ? '#10B981' : 'var(--warning)' }}>{selectedGroup.status}</strong>
                    &nbsp;·&nbsp;
                    <span style={{ color: 'var(--text-muted)' }}>{selectedGroup.members?.length ?? 0} / 50 members</span>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    if (selectedGroup.members?.length >= 50) {
                      setErrorMsg('Group is full (Max 50 members allowed).');
                      return;
                    }
                    setShowAddMemberModal(true);
                  }}
                >
                  <Plus size={16} /> Add Member
                </button>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Card Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.members?.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No persons in this group yet. Add a member above.
                      </td>
                    </tr>
                  ) : (
                    selectedGroup.members?.map((member) => (
                      <tr key={member.id}>
                        <td>
                          {member.profile_pic ? (
                            <img src={member.profile_pic} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>
                              {member.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</td>
                        <td style={{ fontSize: '13px' }}>{member.email}</td>
                        <td style={{ fontSize: '13px' }}>{member.phone}</td>
                        <td>
                          <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`badge ${member.is_card_paid ? 'badge-success' : 'badge-warning'}`}>
                              {member.is_card_paid ? 'Paid & Active' : 'Unpaid'}
                            </span>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '4px 10px', fontSize: '11px' }} 
                              onClick={() => openCardGenerator(member)}
                            >
                              <CreditCard size={11} /> Card
                            </button>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => openEditMember(member)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteMember(member.id)}>
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

        {/* ─── TAB 2: FEE TIERS ──────────────────────────────────────────── */}
        {activeTab === 'tiers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Membership Fee Tiers</h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                  Define pricing plans assigned to membership groups.
                </p>
              </div>
              <button className="btn-primary" onClick={() => { resetTierForm(); setShowAddTierModal(true); }}>
                <Plus size={16} /> Create Tier
              </button>
            </div>

            {tiers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
                <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
                  No fee tiers created yet.
                </p>
                <button className="btn-primary" onClick={() => { resetTierForm(); setShowAddTierModal(true); }}>
                  <Plus size={16} /> Create First Tier
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {tiers.map((t) => (
                  <div 
                    key={t.id} 
                    className="card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '24px'
                    }}
                  >
                    {/* Card Top */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>{t.name}</h4>
                        <span className="badge badge-success" style={{ fontSize: '15px', padding: '6px 14px', fontWeight: 700 }}>
                          ₹{t.price}
                        </span>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <span className={`badge ${tierTypeBadge(t.tier_type)}`} style={{ textTransform: 'capitalize' }}>
                          {t.tier_type} Billing
                        </span>
                      </div>
                      {t.description && (
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.6 }}>
                          {t.description}
                        </p>
                      )}
                    </div>
                    {/* Card Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ flex: 1, padding: '9px 12px', fontSize: '14px' }} 
                        onClick={() => openEditTier(t)}
                      >
                        <Edit size={15} /> Edit
                      </button>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '9px 14px' }} 
                        onClick={() => handleDeleteTier(t.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: BOOKINGS CONSOLE ────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>Bookings Management</h2>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                  View all bookings, reservations, and block time slots.
                </p>
              </div>
              <button className="btn-primary" onClick={() => setShowReserveModal(true)}>
                <Plus size={16} /> Block / Reserve Slot
              </button>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No bookings found yet.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>{b.booking_id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</td>
                        <td>
                          <div style={{ fontSize: '13px' }}>{b.email}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.phone}</div>
                        </td>
                        <td style={{ fontSize: '13px' }}>{b.booking_date}</td>
                        <td style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {b.start_time?.substring(0, 5)} – {b.end_time?.substring(0, 5)}
                        </td>
                        <td>
                          <span className={`badge ${b.type === 'member' ? 'badge-info' : b.type === 'reserved' ? 'badge-warning' : 'badge-success'}`}>
                            {b.type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.status === 'confirmed' ? (
                            <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleCancelBooking(b.id)}>
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 4: SETTINGS ────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 6px 0' }}>Court &amp; Administration Settings</h2>
            <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Configure admin contact info and daily reserved time slots.
            </p>

            <form onSubmit={handleSaveSettings} className="card" style={{ maxWidth: '760px' }}>
              <h3 style={{ fontSize: '17px', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                Admin Details (Displayed to Public Users)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '8px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="adm-name">Admin Name</label>
                  <input
                    id="adm-name"
                    type="text"
                    className="form-control"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="adm-phone">Admin Mobile / Contact</label>
                  <input
                    id="adm-phone"
                    type="text"
                    className="form-control"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <h3 style={{ fontSize: '17px', margin: '12px 0 12px 0', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                Daily Reserved Hours (Members Only Slots)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                During these hours, only logged-in members can book. Public users will see a popup directing them to the admin contact above.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {reservedHours.map((rh, index) => (
                  <div key={rh.day} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '16px', alignItems: 'end' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Day</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px', padding: '11px 0' }}>{rh.day}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Reserved Start</label>
                      <input
                        type="time"
                        className="form-control"
                        value={rh.start}
                        onChange={(e) => handleUpdateReservedHoursTime(index, 'start', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>Reserved End</label>
                      <input
                        type="time"
                        className="form-control"
                        value={rh.end}
                        onChange={(e) => handleUpdateReservedHoursTime(index, 'end', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary">
                <Check size={16} /> Save Settings
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ═══════════ MODAL: ADD GROUP ═══════════ */}
      {showAddGroupModal && (
        <div className="modal-overlay" onClick={() => setShowAddGroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Membership Group</h3>
              <button className="modal-close" onClick={() => setShowAddGroupModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddGroup}>
              <div className="form-group">
                <label className="form-label" htmlFor="grp-name">Group Name</label>
                <input
                  id="grp-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Smith Family / Team Rocket"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grp-tier">Select Membership Tier</label>
                <select
                  id="grp-tier"
                  className="form-control"
                  value={newGroupTierId}
                  onChange={(e) => setNewGroupTierId(e.target.value)}
                  required
                >
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (₹{t.price})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="grp-status">Payment Status</label>
                <select
                  id="grp-status"
                  className="form-control"
                  value={newGroupStatus}
                  onChange={(e) => setNewGroupStatus(e.target.value)}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" htmlFor="grp-expiry">Expiration Date</label>
                <input
                  id="grp-expiry"
                  type="date"
                  className="form-control"
                  value={newGroupExpiresAt}
                  onChange={(e) => setNewGroupExpiresAt(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddGroupModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: ADD MEMBER ═══════════ */}
      {showAddMemberModal && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Member to Group</h3>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label" htmlFor="mem-name">Full Name</label>
                <input
                  id="mem-name"
                  type="text"
                  className="form-control"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mem-email">Email Address (Login Username)</label>
                <input
                  id="mem-email"
                  type="email"
                  className="form-control"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px', display: 'block' }}>
                  A temporary login password will be auto-generated and logged.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mem-phone">Phone Number</label>
                <input
                  id="mem-phone"
                  type="text"
                  className="form-control"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Profile Picture (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => fileInputRef.current.click()}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Upload size={15} /> Choose File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => setMemberPicFile(e.target.files[0])}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {memberPicFile ? memberPicFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddMemberModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: EDIT MEMBER ═══════════ */}
      {showEditMemberModal && (
        <div className="modal-overlay" onClick={() => setShowEditMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Member Details</h3>
              <button className="modal-close" onClick={() => setShowEditMemberModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateMember}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-mem-name">Full Name</label>
                <input
                  id="edit-mem-name"
                  type="text"
                  className="form-control"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-mem-email">Email Address</label>
                <input
                  id="edit-mem-email"
                  type="email"
                  className="form-control"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--warning)', fontSize: '11px', marginTop: '6px', display: 'block' }}>
                  ⚠ Changing the email will generate a new login password.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-mem-phone">Phone Number</label>
                <input
                  id="edit-mem-phone"
                  type="text"
                  className="form-control"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-mem-status">Status</label>
                <select
                  id="edit-mem-status"
                  className="form-control"
                  value={memberStatus}
                  onChange={(e) => setMemberStatus(e.target.value)}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Profile Picture (Optional update)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => fileInputRef.current.click()}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Upload size={15} /> Choose File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => setMemberPicFile(e.target.files[0])}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {memberPicFile ? memberPicFile.name : 'Keep existing picture'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditMemberModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: CARD GENERATOR ═══════════ */}
      {showCardModal && cardMember && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Configure Membership Card</h3>
              <button className="modal-close" onClick={() => setShowCardModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCard}>
              <div style={{ marginBottom: '20px', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Member</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{cardMember.name}</div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={cardStatusPaid}
                    onChange={(e) => setCardStatusPaid(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                  />
                  <span>Membership fees paid — Authorize Card Generation</span>
                </label>
              </div>

              {cardStatusPaid && (
                <div className="form-group" style={{ marginBottom: '28px' }}>
                  <label className="form-label" htmlFor="crd-num">Card Number (Optional override)</label>
                  <input
                    id="crd-num"
                    type="text"
                    className="form-control"
                    placeholder="Auto-generated if left blank"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCardModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Configuration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: CREATE TIER ═══════════ */}
      {showAddTierModal && (
        <div className="modal-overlay" onClick={() => setShowAddTierModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Membership Fee Tier</h3>
              <button className="modal-close" onClick={() => setShowAddTierModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddTier}>
              <div className="form-group">
                <label className="form-label" htmlFor="tr-name">Tier Name</label>
                <input
                  id="tr-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Monthly Basic / Gold Premium"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="tr-price">Price (₹)</label>
                  <input
                    id="tr-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="0.00"
                    value={tierPrice}
                    onChange={(e) => setTierPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tr-type">Billing Cycle</label>
                  <select
                    id="tr-type"
                    className="form-control"
                    value={tierType}
                    onChange={(e) => setTierType(e.target.value)}
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" htmlFor="tr-desc">Description (Optional)</label>
                <textarea
                  id="tr-desc"
                  className="form-control"
                  rows="3"
                  placeholder="What's included in this tier..."
                  value={tierDesc}
                  onChange={(e) => setTierDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddTierModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Tier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: EDIT TIER ═══════════ */}
      {showEditTierModal && (
        <div className="modal-overlay" onClick={() => { setShowEditTierModal(false); resetTierForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Fee Tier</h3>
              <button className="modal-close" onClick={() => { setShowEditTierModal(false); resetTierForm(); }}>&times;</button>
            </div>
            <form onSubmit={handleUpdateTier}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-tr-name">Tier Name</label>
                <input
                  id="edit-tr-name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Monthly Basic / Gold Premium"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-tr-price">Price (₹)</label>
                  <input
                    id="edit-tr-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    placeholder="0.00"
                    value={tierPrice}
                    onChange={(e) => setTierPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-tr-type">Billing Cycle</label>
                  <select
                    id="edit-tr-type"
                    className="form-control"
                    value={tierType}
                    onChange={(e) => setTierType(e.target.value)}
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" htmlFor="edit-tr-desc">Description (Optional)</label>
                <textarea
                  id="edit-tr-desc"
                  className="form-control"
                  rows="3"
                  placeholder="What's included in this tier..."
                  value={tierDesc}
                  onChange={(e) => setTierDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowEditTierModal(false); resetTierForm(); }}>Cancel</button>
                <button type="submit" className="btn-primary">Update Tier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: BLOCK / RESERVE SLOT ═══════════ */}
      {showReserveModal && (
        <div className="modal-overlay" onClick={() => setShowReserveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Block / Reserve Court Slot</h3>
              <button className="modal-close" onClick={() => setShowReserveModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAdminReserve}>
              <div className="form-group">
                <label className="form-label" htmlFor="res-dt">Booking Date</label>
                <input
                  id="res-dt"
                  type="date"
                  className="form-control"
                  value={resDate}
                  onChange={(e) => setResDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="res-st">Start Time</label>
                  <input
                    id="res-st"
                    type="time"
                    className="form-control"
                    value={resStart}
                    onChange={(e) => setResStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="res-en">End Time</label>
                  <input
                    id="res-en"
                    type="time"
                    className="form-control"
                    value={resEnd}
                    onChange={(e) => setResEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-nm">Reservation Tag / Customer Name</label>
                <input
                  id="res-nm"
                  type="text"
                  className="form-control"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" htmlFor="res-tp">Reservation Category</label>
                <select
                  id="res-tp"
                  className="form-control"
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  required
                >
                  <option value="reserved">Admin Reservation (Maintenance / Coaching)</option>
                  <option value="public">Booked on behalf of Public Guest</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowReserveModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Reserve Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
