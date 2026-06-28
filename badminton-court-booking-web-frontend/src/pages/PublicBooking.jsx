import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  User, 
  Trophy, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Mail
} from 'lucide-react';

export default function PublicBooking({ onGoToLogin }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [days, setDays] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  
  // Modals state
  const [selectedSlot, setSelectedSlot] = useState(null); // { start, end }
  const [showReservedModal, setShowReservedModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Booking Form State
  const [bookingUserType, setBookingUserType] = useState('public'); // public | member
  const [publicName, setPublicName] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [publicPhone, setPublicPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null); // { booking_id }
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Generate next 7 days for the quick tab selector
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

  // Fetch court availability and tournaments
  useEffect(() => {
    if (!selectedDate) return;

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
  }, [selectedDate]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.get('/api/tournaments');
        setTournaments(data.tournaments || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTournaments();
  }, []);

  // List of daily time slots (06:00 to 22:00)
  const timeSlots = [];
  for (let hour = 6; hour < 22; hour++) {
    const startStr = String(hour).padStart(2, '0') + ':00';
    const endStr = String(hour + 1).padStart(2, '0') + ':00';
    timeSlots.push({ start: startStr, end: endStr });
  }

  const handleSlotClick = (slot, isBooked, isReserved) => {
    setSelectedSlot(slot);
    setBookingSuccess(null);
    setErrorMsg('');
    if (isBooked) return;

    if (isReserved) {
      setShowReservedModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setErrorMsg('');
    setBookingLoading(true);

    try {
      const payload = {
        booking_date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        booking_type: 'public',
        name: publicName,
        email: publicEmail,
        phone: publicPhone
      };

      const response = await api.post('/api/bookings', payload);
      setBookingSuccess(response.booking);
      
      // Refresh availability
      const updatedAvail = await api.get(`/api/availability?date=${selectedDate}`);
      setAvailability(updatedAvail);

      // Reset form
      setPublicName('');
      setPublicEmail('');
      setPublicPhone('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      
      {/* Hero Welcome banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, oklch(19% 0.03 240) 0%, oklch(15% 0.02 240) 100%)',
        textAlign: 'center',
        padding: '48px 24px',
        marginBottom: '40px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '38px', color: 'var(--text-primary)', fontWeight: 800 }}>
          Reserve Your <span style={{ color: 'var(--accent)' }}>Court</span>
        </h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Select a date, choose an available slot, and book instantly. Members can log in to book exclusive reserved hours.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '32px'
      }}>
        {/* Main Scheduler Area */}
        <div>
          <div className="scheduler-container">
            
            {/* Quick 7 Days Day Selector */}
            <div className="calendar-header" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 600 }}>
                <CalendarIcon size={20} className="brand-shuttle" />
                <span>Select Booking Date</span>
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

            {/* Availability Slots Grid */}
            <div className="card">
              <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Court Availability Schedule</span>
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>
                  Date: <strong>{selectedDate}</strong>
                </span>
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                  Loading schedule details...
                </div>
              ) : availability ? (
                <div>
                  <div style={{ display: 'flex', gap: '20px', margin: '12px 0 24px 0', fontSize: '13px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent)', borderRadius: '3px' }}></div>
                      <span>Available</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--warning)', borderRadius: '3px' }}></div>
                      <span>Reserved (Members Only)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--danger)', borderRadius: '3px' }}></div>
                      <span>Booked</span>
                    </div>
                  </div>

                  <div className="slots-grid">
                    {timeSlots.map((slot) => {
                      // Check if slot is booked
                      const isBooked = availability.bookings.some(b => 
                        b.start_time.startsWith(slot.start)
                      );
                      
                      // Check if slot overlaps with reserved hours
                      const isReserved = availability.reserved_hours.some(rh => 
                        slot.start >= rh.start && slot.start < rh.end
                      );

                      let cardClass = 'slot-available';
                      let statusText = 'Available';
                      if (isBooked) {
                        cardClass = 'slot-booked';
                        statusText = 'Booked';
                      } else if (isReserved) {
                        cardClass = 'slot-reserved';
                        statusText = 'Reserved Hours';
                      }

                      return (
                        <div 
                          key={slot.start} 
                          className={`slot-card ${cardClass}`}
                          onClick={() => handleSlotClick(slot, isBooked, isReserved)}
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

        {/* Sidebar Announcements / Contact Info */}
        <div>
          {/* Admin contact detail card */}
          {availability && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 className="card-title" style={{ fontSize: '16px' }}>
                <Phone size={16} className="brand-shuttle" />
                <span>Admin Contacts</span>
              </h4>
              <p style={{ fontSize: '14px', margin: '4px 0' }}>
                For special inquiries or block bookings, contact the administration.
              </p>
              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {availability.admin_details.name}
                </div>
                <div style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>
                  {availability.admin_details.phone}
                </div>
              </div>
            </div>
          )}

          {/* Tournaments List */}
          <div className="card">
            <h4 className="card-title" style={{ fontSize: '16px' }}>
              <Trophy size={16} style={{ color: '#F59E0B' }} />
              <span>Tournaments</span>
            </h4>
            {tournaments.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No upcoming tournaments announced yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tournaments.map((t) => (
                  <div key={t.id} style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '12px' 
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>
                      Date: {t.date}
                    </div>
                    <p style={{ fontSize: '13px', margin: '4px 0 8px 0' }}>{t.description}</p>
                    
                    {t.prizes && t.prizes.length > 0 && (
                      <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>Prizes & Awards:</div>
                        <ul style={{ paddingLeft: '14px', margin: 0 }}>
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
        </div>
      </div>

      {/* Reserved timing contact admin warning modal */}
      {showReservedModal && selectedSlot && availability && (
        <div className="modal-overlay" onClick={() => setShowReservedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderTop: '4px solid var(--warning)' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
                <AlertTriangle /> Reserved Timing Slot
              </h3>
              <button className="modal-close" onClick={() => setShowReservedModal(false)}>&times;</button>
            </div>
            <p style={{ marginBottom: '20px' }}>
              The slot <strong>{selectedSlot.start} - {selectedSlot.end}</strong> on <strong>{selectedDate}</strong> is reserved for club membership persons.
            </p>
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
                Public bookings are disabled during reserved hours. Please contact the administrator to request a special booking:
              </p>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                {availability.admin_details.name}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
                {availability.admin_details.phone}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowReservedModal(false)}>Close</button>
              <button className="btn-primary" onClick={() => {
                setShowReservedModal(false);
                onGoToLogin();
              }}>Member Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Public / Member Select & Public Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Court Reservation Form</h3>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>&times;</button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} style={{ color: '#10B981', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Booking Confirmed!</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Your court reservation was completed successfully. A booking confirmation email containing your ID was sent to your inbox.
                </p>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '20px 0',
                  color: 'var(--accent)',
                  letterSpacing: '1px'
                }}>
                  Booking ID: {bookingSuccess.booking_id}
                </div>
                <button className="btn-secondary" onClick={() => setShowBookingModal(false)}>Close Window</button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', marginBottom: '20px' }}>
                  Reserve court on <strong>{selectedDate}</strong> for slot <strong>{selectedSlot.start} - {selectedSlot.end}</strong>.
                </p>

                {/* Switcher Tab */}
                <div style={{ 
                  display: 'flex', 
                  backgroundColor: 'var(--bg-input)', 
                  border: '1px solid var(--border-color)',
                  padding: '4px', 
                  borderRadius: '6px', 
                  marginBottom: '20px' 
                }}>
                  <button 
                    onClick={() => { setBookingUserType('public'); setErrorMsg(''); }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: bookingUserType === 'public' ? 'var(--bg-card)' : 'transparent',
                      color: bookingUserType === 'public' ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Public Booking
                  </button>
                  <button 
                    onClick={() => { setBookingUserType('member'); setErrorMsg(''); }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: bookingUserType === 'member' ? 'var(--bg-card)' : 'transparent',
                      color: bookingUserType === 'member' ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Membership Account
                  </button>
                </div>

                {errorMsg && (
                  <div style={{
                    color: 'var(--danger)',
                    fontSize: '13px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px'
                  }}>
                    {errorMsg}
                  </div>
                )}

                {bookingUserType === 'public' ? (
                  <form onSubmit={handleBookSlot}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="pub-name">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="pub-name"
                          type="text"
                          className="form-control"
                          style={{ paddingLeft: '40px' }}
                          placeholder="John Doe"
                          value={publicName}
                          onChange={(e) => setPublicName(e.target.value)}
                          required
                        />
                        <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="pub-email">Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="pub-email"
                          type="email"
                          className="form-control"
                          style={{ paddingLeft: '40px' }}
                          placeholder="john@example.com"
                          value={publicEmail}
                          onChange={(e) => setPublicEmail(e.target.value)}
                          required
                        />
                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label" htmlFor="pub-phone">Mobile Number</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="pub-phone"
                          type="tel"
                          className="form-control"
                          style={{ paddingLeft: '40px' }}
                          placeholder="9876543210"
                          value={publicPhone}
                          onChange={(e) => setPublicPhone(e.target.value)}
                          required
                        />
                        <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={bookingLoading}>
                        {bookingLoading ? 'Confirming...' : 'Book Court'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Lock size={32} style={{ color: 'var(--brand)', marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Registered members must log in to their account to proceed with booking. Members can book courts during reserved times.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button className="btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
                      <button className="btn-primary" onClick={() => {
                        setShowBookingModal(false);
                        onGoToLogin();
                      }}>Go to Login</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
