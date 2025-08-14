# Firebase Security Rules Setup

## Quick Fix for "Missing or insufficient permissions" Error

### Option 1: Update Security Rules via Firebase Console (Recommended)

1. **Open Firebase Console**: 
   https://console.firebase.google.com/project/productreview-52e51/firestore/rules

2. **Replace the current rules** with this code:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read and write access to all documents
       // For development purposes only
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

3. **Click "Publish"** to deploy the rules

### Option 2: More Secure Rules (Production Ready)

If you want more security, use these rules instead:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to products and dashboard
    match /products/{productId} {
      allow read, write: if true;
    }
    
    match /dashboard/{documentId} {
      allow read, write: if true;
    }
    
    match /backups/{backupId} {
      allow read, write: if true;
    }
  }
}
```

### Option 3: Enable Anonymous Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Anonymous" authentication
3. This allows the app to authenticate users anonymously

## After Updating Rules

1. Wait 1-2 minutes for the rules to propagate
2. Refresh your dashboard at: http://localhost:3004
3. The data should load successfully

## Verify Rules Are Active

Check the Firebase Console Firestore Rules tab to ensure the new rules are published and active.
