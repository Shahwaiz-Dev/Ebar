# Admin Management Scripts

## Creating Admin Users

### Method 1: Firebase Console (Easiest)
1. Go to Firebase Console → Authentication → Users
2. Click "Add User" and create user with email/password
3. Go to Firestore Database → `users` collection
4. Create document with user's UID as document ID
5. Set the document data:
```json
{
  "uid": "USER_UID_HERE",
  "email": "admin@yourdomain.com",
  "firstName": "Admin",
  "lastName": "User",
  "type": "admin",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Method 2: Script (Automated)
1. Download your Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `service-account-key.json` in project root

2. Install dependencies:
```bash
npm install firebase-admin readline
```

3. Run the script:
```bash
node scripts/create-admin.js
```

4. Follow the prompts to create admin user

## Security Notes
- Keep service account key secure and never commit to git
- Add `service-account-key.json` to `.gitignore`
- Only create admin accounts for trusted team members
- Consider using environment variables for production

## Admin Features
Once created, admin users can:
- Access `/admin` route
- Verify/unverify bars
- See admin panel in header menu
- Manage all bar content
