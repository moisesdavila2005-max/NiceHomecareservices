# Nice Home Care Services - Deployment Setup Guide

## 🎯 Email & Phone Integration Setup

This guide covers the enhanced email and SMS/call integration for your Nice Home Care Services deployment.

---

## 📧 Email Configuration

### Email Flow
- **Send From**: `info@nicehomecareservices.com`
- **Send To**: 
  - `moisesdavila2005@gmail.com` (Primary)
  - `info@nicehomecareservices.com` (Secondary)
- **CC**: `migdaliadav.usa@gmail.com`
- **Service**: Resend

### Setup Steps

1. **Set up Custom Domain with Resend**:
   - Go to [Resend Dashboard](https://resend.com)
   - Add your domain `nicehomecareservices.com`
   - Follow DNS verification steps
   - Add SPF and DKIM records to your domain registrar

2. **Environment Variables** (Add to Vercel project):
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM="Nice Home Care Services <info@nicehomecareservices.com>"
   ```

3. **Verify in Resend Dashboard**:
   - Domain status should be "Verified"
   - Test sending emails with the domain

---

## 📱 Twilio SMS & Call Integration

### Features
- **Receive SMS messages** to `+1(669) 331 4949`
- **Receive incoming calls** to `+1(669) 331 4949`
- **Automatic notifications** sent via email
- **Call recordings** linked in notification emails

### Setup Steps

#### 1. Get Twilio Account
- Sign up at [Twilio Console](https://www.twilio.com/console)
- Purchase phone number: `+1(669) 331 4949` (or verify you own it)
- Get your Account SID and Auth Token

#### 2. Configure Environment Variables
Add to your Vercel project settings:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1(669) 331 4949
```

#### 3. Set Up SMS Webhook
In Twilio Console:
- Go to **Phone Numbers** → Select your number
- Under **Messaging**, set **Webhook URL** to:
  ```
  https://your-domain.com/api/trpc/twilio.smsWebhook
  ```
- Method: POST
- Use similar URL for status callbacks if desired

#### 4. Set Up Incoming Call Webhook
In Twilio Console:
- Go to **Phone Numbers** → Select your number
- Under **Voice**, set **Webhook URL** to:
  ```
  https://your-domain.com/api/trpc/twilio.callWebhook
  ```
- Method: POST
- Enable **Call Recording** if desired

#### 5. Test Webhooks
- Send a test SMS to your Twilio number
- Make a test call to your Twilio number
- Check email for notifications

---

## 📧 Contact Form Email Routing

### What Happens When Someone Submits the Contact Form:

1. **Form Submission**:
   - Name, Email, Phone, Message validated
   - Data stored in database

2. **Email Notifications**:
   - Email sent FROM: `info@nicehomecareservices.com`
   - Email TO: 
     - `moisesdavila2005@gmail.com`
     - `info@nicehomecareservices.com`
   - CC: `migdaliadav.usa@gmail.com`
   - Includes formatted HTML template with submission details

3. **SMS Alert** (if Twilio configured):
   - Brief SMS sent to `+1(669) 331 4949`
   - Includes sender name, email, and message preview
   - Allows quick mobile notification

4. **Status Tracking**:
   - Submission marked as "SENT" if emails succeed
   - Marked as "FAILED" if email delivery fails
   - All attempts logged for debugging

---

## 🔄 SMS/Call Flow

### Incoming SMS
1. Person texts `+1(669) 331 4949`
2. Twilio receives message
3. Webhook called with SMS details
4. Email notification sent to your team:
   - Sender phone number
   - Full message content
   - Message ID for reference
   - Direct reply option

### Incoming Call
1. Person calls `+1(669) 331 4949`
2. Twilio receives call
3. Webhook called with call details
4. Email notification sent to your team:
   - Caller phone number
   - Call status (answered, missed, etc.)
   - Duration (if completed)
   - Recording link (if enabled)

---

## 🔧 Environment Variables Summary

### Required
```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_key_here
EMAIL_FROM="Nice Home Care Services <info@nicehomecareservices.com>"

# SMS/Call Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1(669) 331 4949
```

### Optional
```bash
# Additional configuration
TWILIO_RECORDING_ENABLED=true  # Auto-record calls
```

---

## 📋 Email Recipients Configuration

To change email recipients, edit `/vercel/share/v0-project/contact.ts`:

```typescript
const CONTACT_EMAILS = {
  primary: "moisesdavila2005@gmail.com",      // Change here
  secondary: "info@nicehomecareservices.com",  // Change here
  cc: "migdaliadav.usa@gmail.com",            // Change here
} as const;
```

Then redeploy the application.

---

## 🧪 Testing

### Test Contact Form
1. Go to contact form on your website
2. Fill in test information:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "555-1234"
   - Message: "This is a test message"
3. Submit and check email inbox

### Test SMS
```bash
# Use Twilio CLI or send SMS from any phone to your Twilio number
twilio api:core:messages:create \
  --from=+1(669)331-4949 \
  --to=+1(669)331-4949 \
  --body="Hello, testing incoming SMS"
```

### Test Incoming Call
```bash
# Use Twilio CLI to make test call
twilio api:core:calls:create \
  --from=+1(669)331-4949 \
  --to=+1(669)331-4949
```

---

## 🚀 Deployment Checklist

- [ ] Resend API key configured
- [ ] Custom domain verified in Resend
- [ ] Twilio Account SID and Auth Token configured
- [ ] SMS webhook URL set in Twilio Console
- [ ] Call webhook URL set in Twilio Console
- [ ] Email addresses configured correctly
- [ ] Test contact form submission
- [ ] Test incoming SMS
- [ ] Test incoming call
- [ ] Monitor first week for any issues

---

## 📊 Monitoring

### Check Logs
- Monitor Vercel logs: https://vercel.com/your-project/logs
- Check Twilio logs: Twilio Console → Logs → Messages/Calls
- Check Resend logs: Resend Dashboard → Logs

### Common Issues

**Emails not received**:
- Check Resend API key is valid
- Verify domain is verified in Resend
- Check email spam folder
- Review error logs in Vercel

**SMS not working**:
- Verify Twilio Account SID and Auth Token
- Check webhook URL is correct and accessible
- Ensure Twilio phone number is active
- Check Twilio logs for webhook errors

**Calls not notifying**:
- Verify call webhook URL in Twilio Console
- Check if recording is enabled (if desired)
- Review Twilio call logs

---

## 💡 Support

For issues:
1. Check Vercel deployment logs
2. Review Twilio Console logs
3. Verify all environment variables are set
4. Test webhooks with Twilio's test feature
5. Check email spam folders

---

## 📞 Contact Information

**Business Phone**: +1(669) 331 4949
**Business Email**: info@nicehomecareservices.com
**Primary Contact**: moisesdavila2005@gmail.com
**Secondary Contact**: migdaliadav.usa@gmail.com
