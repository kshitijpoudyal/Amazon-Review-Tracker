# Amazon Review Dashboard - Firebase Edition

A modern React.js dashboard application built with TypeScript, Vite, Tailwind CSS, and Firebase to track Amazon product orders, reviews, and financial performance with cloud storage.

> **Disclaimer**: This website was fully created with the help of GitHub Copilot AI assistant.

## Features

- ✅ **Cloud Storage**: All data stored in Firebase Firestore
- ✅ **Real-time Sync**: Changes synchronized across all devices
- ✅ **Automatic Backups**: Every save creates a backup in Firestore
- ✅ **Product Management**: Add, edit, void products with status tracking
- ✅ **Advanced Filtering**: Filter by status, search, and financial deltas
- ✅ **Financial Tracking**: Track paid amounts, received amounts, and profit/loss
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 🎨 **Modern UI**: Beautiful gradient design with glass-morphism effects

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **State Management**: React Hooks (useState, useEffect, useMemo)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
Update `src/firebase/config.ts` with your Firebase project credentials:
- Get your web app config from Firebase Console > Project Settings > General > Web apps
- Replace the placeholder values with your actual Firebase config

### 3. Start the Application
```bash
npm run dev
```

Access the dashboard at: **http://localhost:3000** (or the next available port)

## Firebase Project Details
- **Project ID**: `productreview-52e51`
- **Database**: Firestore
- **Collections**: 
  - `products` - Individual product records
  - `dashboard` - Summary statistics
  - `backups` - Automatic backup records

## Usage

### Product Management
1. **Add Products**: Click "Add Product" to create new entries
2. **Edit Products**: Click "Edit" on any product row to modify details
3. **Void Products**: Use the void checkbox in edit mode to mark items as void
4. **Save Changes**: Click "Save to Firebase" to persist changes to the cloud

### Data Operations
- **Export**: Download current data as JSON
- **Refresh**: Pull latest data from Firebase
- **Reset**: Discard local changes and reload from Firebase

### Status Workflow
Products automatically move through statuses based on their properties:
1. **New** - Order placed but not delivered
2. **Review Not Added** - Delivered but review not added
3. **Review Pending** - Review added but not live
4. **Pending Refund** - Review screenshot sent, awaiting payment
5. **Complete** - All steps finished
6. **Void** - Marked as void (excluded from active workflow)

## Project Structure

```
src/
├── components/          # React components
│   ├── StatCard.tsx     # Statistics display cards
│   ├── ProductTable.tsx # Product data table
│   ├── FilterControls.tsx # Search and filter controls
│   ├── ProductToolbar.tsx # Action buttons and tools
│   ├── AddProductForm.tsx # New product form
│   └── EditableProductRow.tsx # Inline editing
├── hooks/              # Custom hooks for Firebase operations
│   ├── useFirebaseData.ts # Firebase data operations
│   └── useProductCrudFirebase.ts # CRUD operations
├── firebase/           # Firebase configuration
│   └── config.ts       # Firebase app configuration
└── types/              # TypeScript definitions
    └── Product.ts      # Product-related types
```

## Firebase Console Access
- **Main Console**: https://console.firebase.google.com/project/productreview-52e51
- **Firestore Database**: https://console.firebase.google.com/project/productreview-52e51/firestore

## Build for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory, ready for deployment.

## Security
- Service account credentials are in `.gitignore`
- Only authenticated requests can access the database
- Automatic backups provide data recovery options
