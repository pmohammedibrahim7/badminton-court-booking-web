import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Trophy, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function MemberDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('book'); // book | card | tournaments
  const [selectedDate, setSelectedDate] = useState('');
  const [days, setDays] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  
  // Booking state
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Generate next 7 days
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${dateVal}`;
      
      list.push({
        formatted: formattedDate,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    setDays(list);
    setSelectedDate(list[0].formatted);
  }, []);

  // Fetch court availability
  useEffect(() => {
    if (!selectedDate || activeTab !== 'book') return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/api/availability?date=${selectedDate}`);
        setAvailability(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, activeTab]);

  // Fetch tournaments
  useEffect(() => {
    if (activeTab !== 'tournaments') return;

    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const data = await api.get('/api/tournaments');
        setTournaments(data.tournaments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, [activeTab]);

  // List of daily time slots (06:00 to 22:00)
  const timeSlots = [];
  for (let hour = 6; hour < 22; hour++) {
    const startStr = String(hour).padStart(2, '0') + ':00';
    const endStr = String(hour + 1).padStart(2, '0') + ':00';
    timeSlots.push({ start: startStr, end: endStr });
  }

  const handleSlotClick = (slot, isBooked) => {
    if (isBooked) return;
    setSelectedSlot(slot);
    setBookingSuccess(null);
    setErrorMsg('');
    setShowBookingModal(true);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    setErrorMsg('');
    setBookingLoading(true);

    try {
      const payload = {
        booking_date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        booking_type: 'member',
      };

      const response = await api.post('/api/bookings', payload);
      setBookingSuccess(response.booking);
      
      // Refresh availability
      const updatedAvail = await api.get(`/api/availability?date=${selectedDate}`);
      setAvailability(updatedAvail);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ padding: '0 16px 16px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Club Member</div>
        </div>

        <button 
          className={`sidebar-btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          <CalendarIcon size={18} /> Book Court
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'card' ? 'active' : ''}`}
          onClick={() => setActiveTab('card')}
        >
          <CreditCard size={18} /> Membership Card
        </button>

        <button 
          className={`sidebar-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy size={18} /> Tournaments
        </button>

        <button 
          className="sidebar-btn" 
          onClick={onLogout}
          style={{ marginTop: 'auto', color: 'var(--danger)' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {activeTab === 'book' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Reserve a Court Slot</h2>
            
            <div className="scheduler-container">
              {/* Day selector tabs */}
              <div className="calendar-header" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 600 }}>
                  <CalendarIcon size={20} className="brand-shuttle" />
                  <span>Choose Date</span>
                </div>
                <div className="calendar-day-selector">
                  {days.map((d) => (
                    <div 
                      key={d.formatted}
                      className={`day-tab ${selectedDate === d.formatted ? 'active' : ''}`}
                      onClick={() => setSelectedDate(d.formatted)}
                    >
                      <span className="day-name">{d.dayName}</span>
                      <span className="day-date">{d.dayNum}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.monthName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Court grid */}
              <div className="card">
                <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Court Slots Availability</span>
                  <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                    Selected Date: <strong>{selectedDate}</strong>
                  </span>
                </h3>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    Loading court schedules...
                  </div>
                ) : availability ? (
                  <div>
                    <div style={{ display: 'flex', gap: '20px', margin: '12px 0 24px 0', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent)', borderRadius: '3px' }}></div>
                        <span>Available (Including Reserved Hours)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--danger)', borderRadius: '3px' }}></div>
                        <span>Booked</span>
                      </div>
                    </div>

                    <div className="slots-grid">
                      {timeSlots.map((slot) => {
                        const isBooked = availability.bookings.some(b => 
                          b.start_time.startsWith(slot.start)
                        );
                        
                        const isReserved = availability.reserved_hours.some(rh => 
                          slot.start >= rh.start && slot.start < rh.end
                        );

                        let cardClass = 'slot-available';
                        let statusText = 'Available';
                        if (isBooked) {
                          cardClass = 'slot-booked';
                          statusText = 'Booked';
                        } else if (isReserved) {
                          // For members, we style reserved slots slightly differently but let them click and book
                          cardClass = 'slot-available';
                          statusText = 'Reserved (Access Allowed)';
                        }

                        return (
                          <div 
                            key={slot.start} 
                            className={`slot-card ${cardClass}`}
                            onClick={() => handleSlotClick(slot, isBooked)}
                            style={isReserved && !isBooked ? { borderLeft: '4px solid var(--warning)' } : {}}
                          >
                            <div className="slot-time">
                              {slot.start} - {slot.end}
                            </div>
                            <div className="slot-status-label" style={{
                              color: isBooked ? 'var(--danger)' : isReserved ? 'var(--warning)' : 'var(--accent)'
                            }}>
                              <Clock size={14} />
                              <span>{statusText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                    Failed to fetch availability.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>My Membership Card</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              {user.is_card_paid ? (
                <div className="membership-card-badge">
                  <div className="card-header-logo">
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>SMASH CLUB</div>
                      <div style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 600 }}>MEMBERSHIP PASS</div>
                    </div>
                    {user.profile_pic ? (
                      <img src={user.profile_pic} alt={user.name} className="card-holder-pic" />
                    ) : (
                      <div className="card-holder-pic" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
                        <UserIcon size={24} style={{ color: 'var(--accent)' }} />
                      </div>
                    )}
                  </div>
                  
                  <div className="card-number-text">
                    {user.card_number || 'MC-0000000000'}
                  </div>

                  <div className="card-details">
                    <div>
                      <label style={{ display: 'block', marginBottom: '2px', color: 'rgba(255,255,255,0.6)' }}>Card Holder</label>
                      <span style={{ fontSize: '15px', color: '#fff', fontWeight: 600 }}>{user.name}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '2px', color: 'rgba(255,255,255,0.6)' }}>Tier</label>
                      <span style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {user.membership_group?.tier?.name || 'Group Member'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                    <span>STATUS: ACTIVE / PAID</span>
                    <span>EXPIRY: {user.membership_group?.expires_at ? new Date(user.membership_group.expires_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '36px' }}>
                  <AlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '16px', margin: '0 auto 16px auto' }} />
                  <h4 style={{ fontSize: '18px', marginBottom: '12px' }}>Membership Card Not Paid / Generated</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    As of now, your membership card has not been generated by the admin because payment is marked as pending. Please complete your fee payment of <strong>₹{user.membership_group?.tier?.price || '0.00'}</strong> with the club administrator.
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Once payment is confirmed, the admin will enable card generation in the admin panel and your digital card will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Tournaments Announcements</h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                Loading tournament announcements...
              </div>
            ) : tournaments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p>No upcoming tournaments listed.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {tournaments.map((t) => (
                  <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '16px', margin: 0, color: 'var(--text-primary)' }}>{t.title}</h4>
                        <span className={`badge ${t.visibility === 'members_only' ? 'badge-warning' : 'badge-info'}`}>
                          {t.visibility === 'members_only' ? 'Exclusive' : 'Public'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Event Date: {new Date(t.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                      <p style={{ fontSize: '14px', marginBottom: '20px' }}>{t.description}</p>
                    </div>

                    {t.prizes && t.prizes.length > 0 && (
                      <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px'
                      }}>
                        <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '8px' }}>Prize Distribution:</div>
                        <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {t.prizes.map((p, i) => (
                            <li key={i}>
                              Place #{p.place}: <strong>{p.amount}</strong> ({p.type})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Booking confirmation modal */}
      {showBookingModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Court Booking</h3>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>&times;</button>
            </div>
            
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>Booking Successful!</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Your court booking was successfully confirmed. We have sent a confirmation email to you.
                </p>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '16px 0',
                  color: 'var(--accent)'
                }}>
                  ID: {bookingSuccess.booking_id}
                </div>
                <button className="btn-secondary" onClick={() => setShowBookingModal(false)}>Close</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', marginBottom: '20px' }}>
                  Are you sure you want to book the court on <strong>{selectedDate}</strong> at <strong>{selectedSlot.start} - {selectedSlot.end}</strong>?
                </p>

                {errorMsg && (
                  <div style={{
                    color: 'var(--danger)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                    fontSize: '13px'
                  }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setShowBookingModal(false)} disabled={bookingLoading}>Cancel</button>
                  <button className="btn-primary" onClick={handleBookSlot} disabled={bookingLoading}>
                    {bookingLoading ? 'Confirming...' : 'Yes, Book Court'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
