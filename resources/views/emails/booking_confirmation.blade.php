<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: bold; color: #10B981; }
        .details-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #f3f4f6; padding-bottom: 8px; }
        .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .detail-label { font-weight: bold; color: #4b5563; }
        .booking-id-badge { display: inline-block; padding: 6px 12px; background: #10B981; color: #ffffff; font-weight: bold; border-radius: 4px; font-size: 16px; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Smash Badminton Club</div>
        </div>
        
        <h2>Booking Confirmed!</h2>
        <p>Thank you for booking with us. Your court reservation has been confirmed. Below are your booking details:</p>
        
        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="booking-id-badge">{{ $booking->booking_id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span>{{ $booking->name ?? 'Member' }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>{{ \Carbon\Carbon::parse($booking->booking_date)->format('F j, Y (l)') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time Slot:</span>
                <span>{{ \Carbon\Carbon::parse($booking->start_time)->format('h:i A') }} - {{ \Carbon\Carbon::parse($booking->end_time)->format('h:i A') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Booking Type:</span>
                <span style="text-transform: capitalize;">{{ $booking->type }} Booking</span>
            </div>
        </div>
        
        <p>Please present this email or the Booking ID <strong>{{ $booking->booking_id }}</strong> at the venue counter on arrival.</p>
        <p>If you need to make changes or cancel your booking, please contact the admin.</p>
        
        <div class="footer">
            <p>This is an automated confirmation email from Smash Badminton Club.</p>
            <p>&copy; {{ date('Y') }} Smash Badminton Club. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
