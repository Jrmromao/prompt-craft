# PromptHive - Stable Prompt Versioning System

## Overview
This document outlines the fixed and stable prompt creation and versioning system for PromptHive.

## Core Principles

### 1. Every Prompt Has At Least One Version
- When a prompt is created, an initial version (v1) is automatically created
- The prompt's `content` field always matches the latest version
- Versions are immutable once created

### 2. Editing Creates New Versions
- When a prompt's content is modified, a new version is automatically created
- Metadata changes (name, description, isPublic) don't create new versions
- Only content changes trigger version creation

### 3. Version Numbering
- Versions are numbered sequentially starting from 1
- Latest version has the highest number
- Version numbers are calculated dynamically based on creation order

## API Endpoints

### Create Prompt
```
POST /api/prompts
```
**Behavior:**
- Creates new prompt with unique slug
- Creates initial version (v1) automatically
- Updates user's version usage counter
- Enforces free plan limits (10 prompts max)

### Update Prompt
```
PUT /api/prompts/[id]
```
**Behavior:**
- Updates prompt metadata (name, description, isPublic)
- If content changed: creates new version automatically
- If content unchanged: only updates metadata
- Enforces version limits for free users (3 versions per prompt)
- Returns `versionCreated: true/false` to indicate if new version was created

### Create New Version
```
POST /api/prompts/[id]/versions
```
**Behavior:**
- Creates new version with provided content
- Updates main prompt content to match new version
- Prevents duplicate versions (same content as latest)
- Returns version with calculated version number

### Get Versions
```
GET /api/prompts/[id]/versions
```
**Behavior:**
- Returns all versions for a prompt, ordered by creation date (newest first)
- Includes calculated version numbers
- Latest version = highest version number

## Components

### EditPromptDialog
- Allows editing prompt name, description, content, and visibility
- Shows warning when content changes (will create new version)
- Handles version limit errors gracefully
- Provides upgrade prompts for free users

### VersionManager
- Shows version history with version numbers
- Displays version content in read-only format
- Shows creation dates and character counts
- Highlights current/latest version

## User Experience Flow

### Creating a Prompt
1. User fills out prompt form (name, content, description)
2. System creates prompt + initial version (v1)
3. User sees success message
4. Prompt appears in their list with "1 version"

### Editing a Prompt
1. User clicks "Edit" on existing prompt
2. EditPromptDialog opens with current values
3. User modifies content
4. Warning shows: "Content changed - this will create a new version"
5. User submits
6. If content changed: new version created, success message shows "Prompt updated and new version created!"
7. If only metadata changed: success message shows "Prompt updated successfully!"

### Viewing Versions
1. User clicks "Versions" button on prompt
2. VersionManager opens showing all versions
3. User can click on any version to view its content
4. Latest version is clearly marked
5. Version numbers are displayed (v1, v2, v3, etc.)

## Plan Limits

### Free Plan
- **Prompts**: 10 maximum
- **Versions per prompt**: 3 maximum
- **Total versions**: Tracked in user.versionsUsed

### Pro Plan
- **Prompts**: Unlimited
- **Versions per prompt**: Unlimited
- **Total versions**: Unlimited

## Error Handling

### Version Limit Reached
```json
{
  "error": "Free users can create up to 3 versions per prompt. Upgrade to PRO for unlimited versions.",
  "code": "VERSION_LIMIT_REACHED",
  "upgradeRequired": true
}
```

### No Content Changes
```json
{
  "error": "Content is identical to the latest version",
  "code": "NO_CHANGES"
}
```

### Prompt Limit Reached
```json
{
  "error": "Free plan limit reached. Upgrade to PRO for unlimited prompts.",
  "code": "LIMIT_REACHED"
}
```

## Database Schema Usage

### Prompt Model
- `content`: Always matches latest version content
- `updatedAt`: Updated when prompt or new version is created
- Relations: `Version[]` (one-to-many)

### Version Model
- `content`: Immutable version content
- `promptId`: Links to parent prompt
- `userId`: Creator of the version
- `createdAt`: Version creation timestamp
- No version number field (calculated dynamically)

## Key Improvements Made

1. **Transactional Safety**: Prompt creation uses database transactions
2. **Automatic Versioning**: Content changes automatically create versions
3. **Duplicate Prevention**: Prevents creating versions with identical content
4. **Proper Error Handling**: Clear error messages with upgrade prompts
5. **Version Numbering**: Dynamic calculation ensures correct numbering
6. **UI Feedback**: Clear indicators when versions will be created
7. **Plan Enforcement**: Proper limits for free vs pro users

## Testing the System

### Test Prompt Creation
1. Create new prompt → Should create prompt + v1
2. Check versions API → Should return 1 version
3. Check prompt content → Should match version content

### Test Prompt Editing
1. Edit prompt content → Should create new version
2. Edit only metadata → Should not create new version
3. Edit with same content → Should show "no changes" error
4. Free user with 3 versions → Should show limit error

### Test Version Management
1. View versions → Should show all versions with correct numbers
2. Latest version → Should be marked as current
3. Version content → Should display correctly
4. Version ordering → Should be newest first

This system ensures stable, predictable prompt versioning that works reliably for all users.
