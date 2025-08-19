# Firebase Setup Guide

## Authentication Configuration

### Step 1: Enable Authentication Methods

1. **Open Firebase Console**: 
   https://console.firebase.google.com/project/productreview-52e51/authentication/providers

2. **Enable Email/Password Authentication**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

3. **Enable Google Sign-In**:
   - Click on "Google"
   - Toggle "Enable" to ON
   - Select your project support email
   - Click "Save"

### Step 2: Update Security Rules for User Data Isolation

1. **Open Firestore Rules**: 
   https://console.firebase.google.com/project/productreview-52e51/firestore/rules

2. **Replace the current rules** with this secure code:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId} {
         // Allow users to read and write their own profile
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         // Allow users to read and write their own products
         match /products/{productId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         
         // Allow users to read and write their own dashboard data
         match /dashboard/{document} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

3. **Click "Publish"** to deploy the rules

## Data Structure

With authentication enabled, the Firestore database structure is:

```
/users/{userId}/
├── profile data (email, displayName, etc.)
├── /products/{productId}
│   ├── product data
│   └── timestamps
└── /dashboard/summary
    └── calculated statistics
```

### Benefits of This Structure:
- ✅ **Data Isolation**: Each user's data is completely separate
- ✅ **Security**: Users can only access their own data
- ✅ **Scalability**: Supports unlimited users
- ✅ **Privacy**: No data sharing between users

## Development vs Production Rules

### Development (Less Secure - Testing Only):
```javascript
match /{document=**} {
  allow read, write: if true;
}
```

### Production (Secure - Recommended):
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  // ... rest of the rules
}
```
2. Enable "Anonymous" authentication
3. This allows the app to authenticate users anonymously

## After Updating Rules

1. Wait 1-2 minutes for the rules to propagate
2. Refresh your dashboard at: http://localhost:3004
3. The data should load successfully

## Verify Rules Are Active

Check the Firebase Console Firestore Rules tab to ensure the new rules are published and active.
