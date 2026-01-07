# Provider/Practice Dashboard Overview

## What the MHA Practice Dashboard Looks Like

The practice dashboard (`/provider/dashboard`) is a comprehensive provider portal for managing patients, messages, work items, and practice operations.

---

## Navigation Structure

### Top Navigation Bar
- **MyHealth Ally** (logo/brand) + "Provider Portal" label
- **Logout** button

### Main Navigation Tabs
1. **Dashboard** (`/provider/dashboard`) - Overview stats
2. **Messages** (`/provider/messages`) - Patient message queue
3. **Work Items** (`/provider/work-items`) - Tasks and to-dos
4. **Alerts** (`/provider/alerts`) - Critical alerts
5. **Patients** (`/provider/patients`) - Patient directory
6. **Settings** (`/provider/settings`) - Admin only

---

## Dashboard Page (`/provider/dashboard`)

### Overview Stats (4 Cards)

#### 1. **Messages Card** (Primary/Blue)
- **Total Messages**: Total count
- **Breakdown**:
  - New (unread)
  - In Progress
  - Overdue (SLA violations)
- **Auto-refreshes** every 30 seconds

#### 2. **Work Items Card** (Blue)
- **Total Work Items**: All tasks
- **Breakdown**:
  - New (pending)
  - In Progress
  - Overdue
- **By Type**:
  - Messages
  - Refills
  - Vital Alerts
  - Appointments

#### 3. **Patients Card** (Green)
- **Total Patients**: All patients
- **Active Patients**: Activity in last 30 days
- **New This Month**: New patient registrations

#### 4. **SLA Status Card** (Purple)
- **On-Time %**: SLA compliance percentage
- **At Risk**: Items approaching SLA deadline
- **Overdue**: Items past SLA deadline

### Detailed Breakdowns (2 Sections)

#### Message Urgency Breakdown
- **Red (Urgent)**: Count of urgent messages
- **Yellow (Moderate)**: Count of normal priority
- **Green (Routine)**: Count of routine messages

#### Work Items by Type
- **Messages**: Patient outreach tasks
- **Refills**: Medication refill requests
- **Vital Alerts**: Abnormal vital sign alerts
- **Appointments**: Appointment-related tasks

---

## Messages Page (`/provider/messages`)

### Features
- **Message Queue**: List of all patient message threads
- **Filters**:
  - Status: All, Open, In Progress, Closed
  - Priority: All, Urgent, Normal
- **Thread Display**:
  - Patient name
  - Last message preview
  - Unread count badge
  - Priority badge (Urgent/Normal)
  - Status badge (Open/In Progress/Closed)
  - Last message timestamp
- **Click to view** full conversation thread

---

## Work Items Page (`/provider/work-items`)

### Features
- **Task List**: All work items/tasks
- **Filters**:
  - Category: All, Messages, Refills, Vital Alerts, Appointments
  - Status: All, New, In Progress, Completed, Cancelled
  - Priority: All, Urgent, High, Medium, Low
- **Task Display**:
  - Task type/category
  - Patient name
  - Priority badge
  - Status badge
  - Due date
  - Assignee
- **Actions**: Update status, assign, complete

---

## Alerts Page (`/provider/alerts`)

### Features
- **Critical Alerts**: High-priority notifications
- **Vital Alerts**: Abnormal vital signs
- **SLA Alerts**: Approaching or overdue items
- **Urgent Messages**: Unread urgent messages

---

## Patients Page (`/provider/patients`)

### Features
- **Patient Directory**: List of all patients
- **Search**: By name, email, or MRN
- **Table Columns**:
  - Patient Name + MRN
  - Contact (email, phone)
  - Status (Active)
  - Last Activity (last updated)
  - Actions (View patient)
- **Click patient** → View detailed patient record

---

## Patient Detail Page (`/provider/patients/[id]`)

### Features
- **Patient Profile**: Name, DOB, contact info
- **Medical Record Number (MRN)**
- **Patient Messages**: All message threads with this patient
- **Vitals**: Recent vital signs
- **Medications**: Current medication list
- **Medical History**: Conditions, allergies
- **Documents**: Uploaded documents

---

## Settings Page (`/provider/settings`) - Admin Only

### Features
- **Practice Settings**: Name, address, contact info
- **Business Hours**: Operating hours by day
- **Timezone**: Practice timezone
- **Emergency Contact**: After-hours contact
- **Branding**: Logo, colors
- **Staff Management**: Add/remove staff members

---

## Key Features

### Real-Time Updates
- **Auto-refresh**: Dashboard stats refresh every 30 seconds
- **Live data**: Messages and work items update automatically

### SLA Tracking
- **Response time tracking
- **Overdue alerts**: Items past SLA deadline
- **At-risk warnings**: Items approaching deadline
- **SLA compliance percentage**

### Priority Management
- **Urgency levels**: Red (urgent), Yellow (moderate), Green (routine)
- **Priority badges**: Visual indicators throughout
- **Filtering**: Filter by priority/urgency

### Patient Management
- **Search**: Quick patient lookup
- **Patient records**: Full medical history access
- **Activity tracking**: Last activity timestamps

---

## Design & UI

### Visual Style
- **Clean, professional** medical interface
- **Color-coded** urgency/priority indicators
- **Card-based** layout for stats
- **Table views** for lists
- **Gradient backgrounds** for visual appeal

### Responsive
- **Mobile-friendly**: Works on tablets/phones
- **Desktop optimized**: Full-featured on large screens

### Accessibility
- **Clear labels**: All elements labeled
- **Color + text**: Priority shown with both color and text
- **Keyboard navigation**: Full keyboard support

---

## Data Sources

### Dashboard Stats
- **Messages**: From `message_threads` table
- **Work Items**: From `tasks` table
- **Patients**: From `patients` table
- **SLA**: Calculated from message timestamps and priority

### Real-Time
- **Auto-refresh**: React Query with 30-second intervals
- **Live updates**: Supabase real-time subscriptions (if configured)

---

## Security

### Access Control
- **Role-based**: Only `provider` or `admin` roles can access
- **Route protection**: All routes check authentication + role
- **Session management**: Secure session handling

### Data Privacy
- **RLS policies**: Row-level security on all tables
- **Patient data**: Only accessible to authorized providers
- **Audit trail**: All actions logged

---

## Current Implementation Status

✅ **Fully Implemented:**
- Dashboard overview with stats
- Messages queue
- Work items management
- Patients directory
- Patient detail pages
- Settings (admin)

✅ **Features:**
- Real-time stats
- SLA tracking
- Priority management
- Search and filtering
- Responsive design

---

## Summary

The practice dashboard provides a **comprehensive provider portal** with:
- **Overview stats** for quick insights
- **Message management** for patient communications
- **Work item tracking** for task management
- **Patient directory** for record access
- **SLA monitoring** for compliance
- **Real-time updates** for current data

It's a **full-featured practice management interface** designed for healthcare providers to efficiently manage their patient communications and workflow.
