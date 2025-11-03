# 📧 Gmail Email Setup Instructions

## 🎯 How to Enable Real Email Sending for OTP

Currently, OTP codes are shown in the console. To send actual emails to users' Gmail accounts, follow these steps:

### 📝 **Step 1: Enable 2-Factor Authentication in Gmail**

1. Go to your **Gmail Account Settings**: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under **"Signing in to Google"**, click **2-Step Verification**
4. Follow the setup process to enable 2FA

### 🔑 **Step 2: Generate Gmail App Password**

1. In Gmail Security settings, find **"App passwords"**
2. Click **"App passwords"** (you might need to sign in again)
3. Select **"Mail"** as the app
4. Select **"Other"** as the device and name it "Stock Market App"
5. Click **"Generate"**
6. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### ⚙️ **Step 3: Update Environment Variables**

Edit the `.env` file in the Backend folder:

```env
# Replace these with your actual Gmail credentials
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

**Example:**

```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### 🔄 **Step 4: Restart Backend Server**

```bash
cd Backend
npm run dev
```

### ✅ **Step 5: Test Email Sending**

1. Go to signup page: http://localhost:5174/signup
2. Create a new account with a real email address
3. Check your Gmail inbox for the OTP email
4. Use the OTP to verify your account

## 🚨 **Security Notes:**

- **Never share your App Password** with anyone
- **Don't commit the .env file** to version control
- App Password is **different from your regular Gmail password**
- If you suspect compromise, **revoke the App Password** and generate a new one

## 🛠️ **Troubleshooting:**

### Problem: "Invalid login credentials"

- **Solution**: Make sure you're using the **App Password**, not your regular Gmail password

### Problem: "Less secure app access"

- **Solution**: Use **App Password** instead of enabling "less secure apps"

### Problem: Emails not received

- **Solution**: Check spam folder, verify EMAIL_USER is correct

### Problem: "Username and Password not accepted"

- **Solution**:
  1. Verify 2FA is enabled
  2. Generate a new App Password
  3. Update .env file
  4. Restart server

## 🎉 **After Setup:**

Once configured correctly, users will receive:

- **Professional OTP emails** in their Gmail inbox
- **Beautiful HTML email templates** with your branding
- **Secure 6-digit OTP codes** valid for 10 minutes

## 📞 **Support:**

If you need help with setup, the system will:

- Show clear error messages in console
- Fall back to console logging if email fails
- Continue working even if email service is down

---

**Current Status**: Console-based OTP (Development Mode)
**After Setup**: Real Gmail delivery (Production Ready)
