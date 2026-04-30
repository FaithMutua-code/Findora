{{-- resources/views/emails/otp.blade.php --}}
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f0eeff; padding: 20px; }
    .card { background: #fff; border-radius: 16px; padding: 32px; max-width: 480px; margin: 0 auto; }
    .logo { color: #6C5CE7; font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    .otp { font-size: 40px; font-weight: 800; color: #6C5CE7; letter-spacing: 10px;
           background: #f4f3ff; padding: 16px 24px; border-radius: 12px;
           text-align: center; margin: 24px 0; }
    .note { color: #888; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🔍 Findora</div>
    <h2 style="color:#1a1040;">Password Reset</h2>
    <p style="color:#555;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
    <div class="otp">{{ $otp }}</div>
    <p class="note">If you didn't request this, please ignore this email.</p>
  </div>
</body>
</html>