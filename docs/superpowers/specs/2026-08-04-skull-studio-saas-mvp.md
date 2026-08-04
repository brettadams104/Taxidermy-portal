# Skull Studio SaaS MVP: Multi-Tenancy & Customizable Stages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Skull Studio from a personal app into a multi-tenant SaaS product where taxidermists can log in, manage their own business data, and customize their workflow to match their unique processes.

**Architecture:** Multi-tenant isolation via `business_id` on all tables with RLS policies. Customizable stages stored as ordered JSON array per business, replacing hardcoded 9-stage workflow. Dynamic validation and rendering adapts all features (dashboard, progress bar, notifications) to each business's custom workflow.

**Scope:** MVP includes multi-tenancy auth, customizable stages in settings, data isolation, dynamic dashboard/analytics, and preservation of existing notification system. Does NOT include: team members, custom branding, payment processing, API access.

---

## 1. Multi-Tenancy Model

### Business Owner Signup Flow
1. Taxidermist creates account (email/password via Supabase auth)
2. New `business` record auto-created, linked to their `profiles` record
3. Default stages assigned: `["Received", "In Progress", "Completed"]`
4. Redirected to isolated dashboard (only their data visible)

### Login & Data Isolation
- User logs in via Supabase auth
- App fetches their `business_id` from `profiles` table
- All subsequent queries filtered: `WHERE business_id = current_user.business_id`
- RLS policies enforce isolation at database level (can't access other business data)

### Key Principle
- **One business owner = one account** (no multi-business users in MVP)
- All taxidermists use same app, completely isolated workspaces
- Shared infrastructure, zero data cross-contamination

---

## 2. Database Schema Changes

### New Table: `businesses`
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL UNIQUE (FK to auth.users),
  business_name TEXT,
  stages JSONB DEFAULT '["Received", "In Progress", "Completed"]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Rationale:**
- One record per business
- `owner_id` links to single auth user
- `stages` array is ordered (index = stage number)
- Easy to query and update

### Modified: `profiles` table
```sql
ALTER TABLE profiles ADD COLUMN business_id UUID NOT NULL (FK to businesses);
ALTER TABLE profiles ADD CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
```

**Rationale:**
- Links user to their business
- Used in queries: `WHERE profiles.business_id = current_business_id`

### Modified: `skulls` table
```sql
ALTER TABLE skulls ADD COLUMN business_id UUID NOT NULL (FK to businesses);
-- REMOVE: ALTER TABLE skulls DROP CONSTRAINT check_valid_status;
-- Application-layer validation replaces hardcoded CHECK constraint
```

**Rationale:**
- Data isolation: can't query skulls from other businesses
- Status validation moved to app layer (compares against `businesses.stages` array)

### Modified: All Other Tables
Add `business_id` to: `clients`, `notifications`, any future tables

**Rationale:**
- Consistent isolation pattern across entire schema
- Every query automatically scoped to current business

---

## 3. Customizable Stages System

### Stage Storage
- Stored in `businesses.stages` as ordered JSON array
- Example: `["Received", "Maceration", "Cleaning", "Whitening", "Final"]`
- Index position = stage number (0-indexed in code, 1-indexed in UI)
- **Final stage = last index** (auto-detected, no separate field)

### Stage Validation
- Before saving skull status: check `status IN current_business.stages`
- If status doesn't exist in their stages, reject with error
- No hardcoded CHECK constraint—validation in application

### In-Progress vs. Completed
- **In-progress:** Skull status != final stage (index < stages.length - 1)
- **Completed:** Skull status == final stage (index == stages.length - 1)
- Dashboard filters dynamically based on this logic

---

## 4. Settings UI: Stage Editor

### Location
`/admin/settings/stages` (new page)

### Component Layout
```
Business Settings > Project Stages

Current Workflow:
┌──────────────────────────────────────────────────┐
│ 1. [Received         ] ↑ ↓ × ⋮ drag             │
│ 2. [Maceration       ] ↑ ↓ × ⋮ drag             │
│ 3. [Cleaning         ] ↑ ↓ × ⋮ drag             │
│ 4. [Final Processing ] ↑ ↓ × ⋮ drag             │
└──────────────────────────────────────────────────┘

[+ Add Stage]  [Save Changes]  [Cancel]

⚠️ Warning (conditional):
"You have 3 skulls in progress. Changing stages will reset 
them to Stage 1. This action cannot be undone."
[Cancel] [Confirm & Reset]
```

### Behavior
- **Edit:** Click stage name → text becomes editable → type new name → blur to save locally
- **Add:** Click "+ Add Stage" → new numbered input appears at bottom
- **Delete:** Click × → stage removed from local array
- **Reorder:** Drag stage or use ↑/↓ buttons to move up/down
- **Save:** Click "Save Changes" → if in-progress skulls exist, show warning
- **Confirm:** User acknowledges reset warning → API call saves new stages and resets in-progress skulls

### API Endpoint
`PATCH /api/businesses/{businessId}/stages`
- Body: `{ stages: ["Received", "Processing", ...] }`
- Check if in-progress skulls exist: if yes, include warning in response
- On confirmation: save stages, reset all non-completed skulls to stage 1 (or status = first stage name)

---

## 5. Impact on Existing Features

### Dashboard (Refactored)
**Before:** Hardcoded filters for 7 stages + Pending Pickup + Picked Up  
**After:** Dynamic filters based on `business.stages`

- **Active Projects:** All skulls where status != final stage
- **Completed:** All skulls where status == final stage
- Stats cards calculate counts dynamically
- Progress bar receives `stages` array as prop

### Progress Bar Component
**Before:** Hardcoded 9 stages in SKULL_STATUSES constant  
**After:** Receives `stages` array from parent, renders dynamically

```typescript
<StatusProgressBar 
  currentStatus={skull.status} 
  allStages={business.stages} 
/>
```

- Renders `allStages.length` segments
- Colors: green (passed), blue (current), gray (future)
- Displays stage name + progress

### Auto-Transitions & Notifications
**Before:** When skull status = "Finished", auto-transition to "Pending Pickup" + notify  
**After:** When skull status = final stage, send notification

Logic:
```typescript
if (skull.status === business.stages[business.stages.length - 1]) {
  // Final stage reached → send notification
  await sendNotification(skull.client_id, 'Skull completed');
}
```

### Status Validation
**Before:** `CHECK (status IN ('Received', 'Processing', ...))`  
**After:** Application-layer validation

```typescript
if (!business.stages.includes(newStatus)) {
  throw new Error('Invalid status for this workflow');
}
```

### Financial Tracking & Analytics
- No changes to logic, just scope all queries by `business_id`
- Reports show data for current business only
- No cross-business data leakage

---

## 6. Data Migration Strategy

### For Existing User (Brett)
1. Create `businesses` record with Brett's details
2. Set `stages` to current 9-stage workflow
3. Add `business_id` to all existing skulls/clients/etc.
4. No data loss; seamless transition to multi-tenant model

### For New Taxidermists
1. Sign up flow creates `business` record with defaults
2. They customize in settings as needed

### Safety
- Existing RLS policies remain unchanged (just add business_id filter)
- No breaking changes to existing functionality
- Backward compatible: Brett's app works same as before, now with customization option

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create `businesses` table migration
- [ ] Add `business_id` to all tables (migration)
- [ ] Update RLS policies to include business_id filter
- [ ] Migrate existing user data to multi-tenant model
- [ ] Create signup flow (auth + auto-create business)

### Phase 2: Dynamic Stages (Week 2-3)
- [ ] Replace hardcoded SKULL_STATUSES with database queries
- [ ] Refactor status validation (hardcoded CHECK → runtime check)
- [ ] Update progress bar component to accept `stages` array
- [ ] Refactor dashboard filtering for dynamic stages
- [ ] Update auto-transition logic to work with any final stage

### Phase 3: Settings UI (Week 3-4)
- [ ] Build `/admin/settings/stages` page
- [ ] Implement stage editor component (text, drag, add, delete)
- [ ] Add "in-progress skulls" warning
- [ ] Implement stage reset logic
- [ ] API endpoint for saving stage changes

### Phase 4: Testing & Polish (Week 4+)
- [ ] Test multi-tenancy isolation (can't access other business data)
- [ ] Test stage customization (add, delete, reorder)
- [ ] Test stage change warning + reset
- [ ] Test all features with custom workflows
- [ ] Performance testing with larger datasets
- [ ] Security audit (RLS policies, data isolation)

---

## 8. Success Criteria

### Multi-Tenancy
- ✅ Multiple business owners can sign up and log in independently
- ✅ Each business sees only their own data (skulls, clients, finances)
- ✅ RLS policies prevent cross-business data access
- ✅ Each business has isolated notifications and settings

### Customizable Stages
- ✅ Each business can edit their stage workflow in settings
- ✅ Stages can be added, deleted, renamed, reordered
- ✅ Changes persist in database
- ✅ In-progress skulls reset on workflow change (with warning)
- ✅ Completed skulls unaffected by workflow changes

### Feature Compatibility
- ✅ Dashboard works with any workflow (1-20 stages)
- ✅ Progress bar renders correctly for custom workflows
- ✅ Auto-transitions work regardless of stage count/names
- ✅ Notifications trigger on final stage (whatever it's named)
- ✅ Financial tracking and analytics isolated per business

### Code Quality
- ✅ No hardcoded stage references in code (all database-driven)
- ✅ Dynamic queries and components
- ✅ RLS policies enforce data isolation
- ✅ Clear separation of concerns

---

## 9. Technical Notes

### Database Queries Pattern
All queries must include `business_id` filter:
```typescript
const skulls = await supabase
  .from('skulls')
  .select('*')
  .eq('business_id', currentBusinessId)  // Always include
  .order('created_at', { ascending: false });
```

### RLS Policy Template
```sql
CREATE POLICY "businesses_isolation" ON public.skulls
  FOR SELECT USING (
    auth.uid() = (
      SELECT owner_id FROM businesses WHERE id = business_id
    )
  );
```

### Stage Array as Source of Truth
- `businesses.stages` is the single source of truth for valid statuses
- No caching of stage lists; query fresh on each request
- If stage order matters (e.g., for progress bar), use index

### Handling Stage Name Changes
- Old skulls keep their status value
- Status validation checks if status exists in current stages array
- If someone removes a stage: existing skulls at that stage become "orphaned" but data isn't deleted

---

## 10. Future Enhancements (v2+)
- Team members (multiple users per business)
- Custom branding (business colors, logo)
- Advanced auto-transitions (configurable per stage)
- API access for integrations
- Bulk operations
- Custom reports
- Mobile app

