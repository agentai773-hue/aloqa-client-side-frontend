# Forgot Password Feature - Documentation

## Overview
This document outlines the complete forgot password implementation for the Aloqa AI Calling System, including backend APIs, frontend pages, and email service integration.

## Flow Diagram

```
User → Forgot Password Page (Email) → OTP Sent via Email → Reset Page (OTP + New Password) → Success
```

## Backend Implementation

### 1. Environment Variables (.env)

Add the following to your `.env` file:

```bash
# Email Configuration for Client Forgot Password
CLIENT_EMAIL_HOST=smtp.gmail.com
CLIENT_EMAIL_PORT=587
CLIENT_EMAIL_USER=your-client-email@gmail.com
CLIENT_EMAIL_PASSWORD=your-client-app-password

# Client URL for password reset link (production)
CLIENT_URL=http://localhost:3000
```

**Note for Gmail:** If using Gmail, you need to:
1. Enable 2-factor authentication on your Google Account
2. Create an "App Password" and use that instead of your regular password
3. Use it in the `CLIENT_EMAIL_PASSWORD` field

### 2. Email Service (clientEmailService.js)

Location: `src/utils/clientEmailService.js`

Provides:
- `generateOTP()` - Generates a 6-digit OTP
- `sendForgotPasswordOTP(user, otp)` - Sends OTP email
- `sendPasswordResetConfirmation(user)` - Sends success confirmation email

### 3. Database Model

The User model (`src/models/User.js`) already has:
```javascript
otp: String              // Stores the OTP
otpExpires: Date        // OTP expiration timestamp (10 minutes)
```

### 4. Backend API Routes

#### Request Password Reset (Send OTP)
```
POST /auth/forgot-password/request
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your email address",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "User not found with this email"
}
```

#### Reset Password with OTP
```
POST /auth/forgot-password/reset
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Response (Error - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**Response (Error - Expired OTP):**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one"
}
```

## Frontend Implementation

### 1. API Integration

Location: `src/api/forgot-password.ts`

**Functions:**
- `requestPasswordReset(email)` - Requests OTP
- `resetPasswordWithOTP(data)` - Resets password with OTP

### 2. React Query Hook

Location: `src/hooks/useForgotPassword.ts`

**Hooks:**
- `useRequestPasswordReset()` - Mutation for requesting OTP
- `useResetPasswordWithOTP()` - Mutation for resetting password

### 3. Frontend Pages

#### Page 1: Forgot Password (Email Request)
```
URL: /forgot-password
File: src/app/(dashboard)/forgot-password/page.tsx
```

**Features:**
- Email validation
- OTP request functionality
- Loading states
- Error handling
- Redirect to reset page on success
- Links to login and signup

#### Page 2: Reset Password (OTP + New Password)
```
URL: /forgot-password/reset?email=user@example.com
File: src/app/(dashboard)/forgot-password/reset/page.tsx
```

**Features:**
- Display email being reset
- OTP input (6 digits only)
- New password input with show/hide toggle
- Confirm password input with validation
- Password strength validation (min 6 chars)
- Password match validation
- Loading states
- Success message with redirect to login
- Error handling

### 4. Navigation Integration

The "Forgot Password" route has been added to the sidebar navigation:
```
Icon: Lock icon
Route: /forgot-password
Position: Before Logout
```

## User Journey

### Step 1: Request Password Reset
1. User navigates to `/forgot-password`
2. User enters their registered email
3. System validates email format and existence
4. Backend generates OTP and sends via email
5. Frontend shows success message and redirects

### Step 2: Reset Password
1. User receives OTP email with password reset instructions
2. User navigates to reset page with email in URL
3. User enters:
   - OTP from email (6 digits)
   - New password (min 6 characters)
   - Confirm password
4. System validates all fields
5. Backend verifies OTP and updates password
6. Confirmation email is sent
7. User is redirected to login page

## Security Features

✅ **OTP Expiration**: OTPs expire after 10 minutes
✅ **OTP Validation**: OTP is verified before password reset
✅ **Password Hashing**: Passwords are hashed using bcryptjs (cost 12)
✅ **Email Verification**: User must own the email address
✅ **Confirmation Email**: User receives confirmation of password reset
✅ **HTTPS Only**: Secure cookie transmission in production
✅ **Input Validation**: All inputs are validated on both frontend and backend

## Email Templates

### OTP Email
- Professional HTML template
- Shows OTP prominently (28px, bold, monospace)
- Security warnings
- Instructions for reset process
- Account information
- 10-minute expiration notice
- Support contact option

### Confirmation Email
- Success message
- Account security note
- Link to login page
- Support contact option

## Testing

### Manual Testing Steps

1. **Test OTP Request:**
   ```bash
   curl -X POST http://localhost:8080/auth/forgot-password/request \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com"}'
   ```

2. **Test Password Reset:**
   ```bash
   curl -X POST http://localhost:8080/auth/forgot-password/reset \
     -H "Content-Type: application/json" \
     -d '{
       "email":"user@example.com",
       "otp":"123456",
       "newPassword":"NewPass123",
       "confirmPassword":"NewPass123"
     }'
   ```

3. **Test via Frontend:**
   - Go to `/forgot-password`
   - Enter registered email
   - Check email inbox for OTP
   - Navigate to reset page
   - Enter OTP and new password
   - Verify login works with new password

## Error Handling

| Error | Status | Solution |
|-------|--------|----------|
| User not found | 404 | Ensure email is registered |
| Invalid OTP | 400 | Check if OTP is correct |
| OTP expired | 400 | Request new OTP |
| Passwords don't match | 400 | Ensure both passwords are identical |
| Password too short | 400 | Use minimum 6 characters |
| Invalid email format | 400 | Enter valid email address |

## Email Configuration Guide

### Using Gmail

1. **Enable 2FA on Gmail:**
   - Go to myaccount.google.com
   - Security section
   - Enable "2-Step Verification"

2. **Create App Password:**
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

3. **Update .env:**
   ```bash
   CLIENT_EMAIL_USER=your-email@gmail.com
   CLIENT_EMAIL_PASSWORD=your-16-char-app-password
   ```

### Using Other Email Providers

Update the SMTP settings in `.env`:
```bash
CLIENT_EMAIL_HOST=smtp.provider.com
CLIENT_EMAIL_PORT=587
CLIENT_EMAIL_USER=your-email@provider.com
CLIENT_EMAIL_PASSWORD=your-password
```

## Files Modified/Created

### Backend
- ✅ `src/utils/clientEmailService.js` - NEW
- ✅ `src/clients/controllers/authController.js` - MODIFIED
- ✅ `src/clients/routes/authRoutes.js` - MODIFIED
- ✅ `.env.example` - MODIFIED

### Frontend
- ✅ `src/api/forgot-password.ts` - NEW
- ✅ `src/hooks/useForgotPassword.ts` - NEW
- ✅ `src/app/(dashboard)/forgot-password/page.tsx` - NEW
- ✅ `src/app/(dashboard)/forgot-password/reset/page.tsx` - NEW
- ✅ `src/components/layout/Sidebar.tsx` - MODIFIED

## Future Enhancements

- [ ] Resend OTP functionality
- [ ] OTP rate limiting
- [ ] Forgot password analytics
- [ ] SMS OTP option
- [ ] Social login integration
- [ ] Password strength meter
- [ ] Recent login locations
- [ ] Suspicious activity alerts

## Support

For issues or questions about the forgot password feature, please contact support or check the logs:

**Backend Logs:**
```bash
npm run dev  # Check terminal output for email sending logs
```

**Frontend Logs:**
Browser DevTools → Console tab for network requests and errors
