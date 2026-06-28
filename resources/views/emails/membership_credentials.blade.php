<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Membership Credentials</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
        .credential-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .credential-item { margin-bottom: 10px; font-size: 16px; }
        .credential-label { font-weight: bold; color: #4b5563; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; text-align: center; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Smash Badminton Club</div>
        </div>
        
        <h2>Hello {{ $memberName }},</h2>
        
        @if($isUpdate)
            <p>Your membership credentials have been successfully updated. Please use the new details below to log in to your account.</p>
        @else
            <p>Welcome to Smash Badminton Club! An account has been created for you. You can now log in and book courts, view your membership status, and see court availability during reserved hours.</p>
        @endif
        
        <div class="credential-box">
            <div class="credential-item">
                <span class="credential-label">Login Email:</span> {{ $email }}
            </div>
            <div class="credential-item">
                <span class="credential-label">Temporary Password:</span> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 16px;">{{ $password }}</code>
            </div>
        </div>
        
        <p>For security, please change your password after logging in for the first time.</p>
        
        <div style="text-align: center;">
            <a href="{{ url('/') }}" class="btn">Log In to Booking Portal</a>
        </div>
        
        <div class="footer">
            <p>This is an automated message from Smash Badminton Club.</p>
            <p>&copy; {{ date('Y') }} Smash Badminton Club. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
