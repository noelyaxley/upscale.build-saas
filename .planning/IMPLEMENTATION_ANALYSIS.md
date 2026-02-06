# Upscale.Build Implementation Analysis

## Current State vs Base44 Specification

### What We Have Built (Phases 1-4)

| Area | Implemented | Status |
|------|-------------|--------|
| **Database** | 5 tables: organisations, profiles, companies, projects, project_members | ✅ Complete |
| **Auth** | Supabase Auth with email/password, session handling | ✅ Complete |
| **Landing** | Orange-themed marketing page | ✅ Complete |
| **Onboarding** | Create organisation flow | ✅ Complete |
| **Dashboard** | Stats grid + project cards | ✅ Complete |
| **Projects** | Detail page, create/edit/delete, client linking | ✅ Complete |
| **Companies** | CRUD, linked projects display | ✅ Complete |
| **Team** | Org members list, role badges | ✅ Complete |
| **Settings** | Profile + org settings | ✅ Complete |
| **Project Members** | Add/remove with roles (manager, member, viewer) | ✅ Complete |

### Base44 Specification Analysis

The JSON describes a **50+ entity system** built on a low-code platform. Key observations:

#### 1. Over-Engineering Concerns
- `DriveLink` - "For future external drive integration" - **Skip** (YAGNI)
- `DocVersion` with hash tracking - **Simplify** (overkill for MVP)
- `AuditLog` - **Skip** (use Supabase's built-in audit logging)
- `FileLink` - Generic file attachment - **Skip** (embed in entities)
- `LocationTag` - Niche feature - **Defer**

#### 2. Essential Construction PM Features (Missing)
- **Documents** - File storage, versioning, folders - **Critical**
- **RFIs** - Request for Information workflow - **Critical**
- **Defects** - Defects liability tracking - **Critical**
- **Variations** - Contract change management - **Important**
- **Program/Timeline** - Gantt-style scheduling - **Important**

#### 3. Complex Financial Modules (Defer)
- `ProgressClaim` + `ProgressClaimLineItem` + `ClaimLine` - Very complex
- `ConsultantContract` + phases/variations/disbursements - Complex
- `SaleTxn` + `Lot` - Only for development projects

#### 4. Architecture Differences

| Aspect | Base44 Spec | Our Implementation |
|--------|-------------|-------------------|
| Routing | `?id=projectId` query params | `/projects/[id]` dynamic routes ✅ Better |
| State | @tanstack/react-query | Server components + client state ✅ Simpler |
| Styling | Tailwind + shadcn | Same ✅ |
| Backend | Base44 BaaS | Supabase ✅ More flexible |
| RLS | Manual org_id checks | Supabase RLS policies ✅ More secure |

---

## Recommended Implementation Roadmap

### Phase 5: Documents Module
**Priority: Critical** | **Complexity: Medium**

Core feature for any construction PM tool. Users need to store and share drawings, specifications, contracts.

**Schema:**
```sql
-- Simplified from spec (skip DriveLink, reduce DocVersion complexity)
documents (
  id, org_id, project_id, folder_id?,
  document_number, title, discipline?,
  current_revision, file_url, file_name, file_size, file_type,
  uploaded_by_user_id, uploaded_at
)

document_folders (
  id, org_id, project_id, parent_folder_id?,
  name, created_by_user_id
)
```

**Features:**
- Folder tree navigation
- File upload (PDF, images, DWG indicator)
- Document preview (PDF/images)
- Download functionality
- Revision tracking (simple: upload new version)

**Skip for now:**
- DocVersion table (track in documents table)
- DriveLink (external sync)
- Complex permission_scope

---

### Phase 6: RFIs Module
**Priority: Critical** | **Complexity: Medium**

RFIs are the primary communication tool between contractors and consultants.

**Schema:**
```sql
rfis (
  id, org_id, project_id,
  number (auto-increment per project),
  subject, question (rich text),
  status (draft, open, closed),
  due_date,
  originator_user_id, assignee_user_id,
  closed_at
)

rfi_messages (
  id, rfi_id,
  author_user_id, body,
  created_at
)
```

**Features:**
- RFI register (list view with filters)
- Create RFI with assignee
- Message thread
- Status transitions (Draft → Open → Closed)
- Due date tracking
- File attachments (use file_url array)

**Skip for now:**
- CC user notifications
- Email integration

---

### Phase 7: Defects Module
**Priority: Critical** | **Complexity: Low**

Essential for defects liability period management.

**Schema:**
```sql
defects (
  id, org_id, project_id,
  defect_number (auto-increment),
  name, description,
  photo_url,
  status (open, contractor_complete, closed),
  contractor_comment,
  date_contractor_complete, date_closed
)
```

**Features:**
- Defect register with status filters
- Photo upload
- Status workflow with timestamps
- Simple reporting (open/closed counts)

---

### Phase 8: Project Enhancements
**Priority: Important** | **Complexity: Medium**

Enhance project detail with activity tracking and risk management.

**Schema:**
```sql
project_updates (
  id, project_id,
  title, description,
  update_type (milestone, progress, issue, general),
  visibility (internal, client),
  images (array),
  created_by_user_id
)

risks (
  id, org_id, project_id,
  description,
  level (low, medium, high),
  type (risk, opportunity),
  status (open, mitigated, closed)
)

decisions (
  id, org_id, project_id,
  description,
  status (pending, approved, rejected),
  due_date
)

action_items (
  id, project_id,
  description,
  assigned_to_user_id,
  due_date,
  status (pending, completed)
)
```

**Features:**
- Activity feed on project dashboard
- Risk/opportunity register
- Decisions log
- Action items with assignments

---

### Phase 9: Program/Timeline (Simplified Gantt)
**Priority: Important** | **Complexity: High**

Timeline visualization without full Gantt complexity.

**Schema:**
```sql
program_items (
  id, project_id,
  name,
  start_date, end_date,
  progress (0-100),
  parent_id (for hierarchy),
  sort_order
)
```

**Features:**
- Hierarchical task list
- Date range visualization (horizontal bars)
- Progress tracking
- No dependencies initially (complex)

---

### Phase 10+: Advanced Features (Future)

**Variations** (Phase 10)
- Contract change tracking
- Cost/schedule impact
- Approval workflow

**Progress Claims** (Phase 11)
- Complex financial module
- Line items, retention, GST
- Certificate generation

**Lot Sales** (Phase 12)
- For development projects only
- Unit inventory
- Sales tracking

**Feasibility** (Phase 13)
- Pre-project analysis
- Scenario modeling

---

## Entity Comparison Summary

| Base44 Entity | Our Approach | Phase |
|---------------|--------------|-------|
| Organisation | ✅ `organisations` | 1 |
| User/Profile | ✅ `profiles` | 1 |
| Project | ✅ `projects` | 1 |
| Company | ✅ `companies` | 3 |
| ProjectMember | ✅ `project_members` | 4 |
| TeamMember | Skip (use project_members) | - |
| Document | `documents` | 5 |
| DocumentFolder | `document_folders` | 5 |
| DocVersion | Skip (simplify into documents) | - |
| DriveLink | Skip (YAGNI) | - |
| RFI | `rfis` | 6 |
| RFIMessage | `rfi_messages` | 6 |
| Defect | `defects` | 7 |
| ProjectUpdate | `project_updates` | 8 |
| Risk | `risks` | 8 |
| Decision | `decisions` | 8 |
| ActionItem | `action_items` | 8 |
| ProgramItem | `program_items` | 9 |
| ProgramDependency | Defer | Future |
| Variation | `variations` | 10 |
| ProgressClaim | Complex - defer | 11 |
| ClaimLine | Complex - defer | 11 |
| Lot | `lots` | 12 |
| SaleTxn | `sale_transactions` | 12 |
| Feasibility* | `feasibility_scenarios` | 13 |
| ConsultantContract | Defer | Future |
| Submittal | Defer | Future |
| Approval* | Defer | Future |
| Meeting | Optional | Future |
| TenderPackage | Optional | Future |
| Photo | Embed in entities | - |
| AuditLog | Use Supabase audit | - |
| FileLink | Skip (embed in entities) | - |
| LocationTag | Skip | - |
| Issue | Merge with risks | 8 |
| SalesAgent | Skip | - |
| ProjectSettings | Embed in projects | - |

---

## Recommended Next Steps

1. **Phase 5: Documents** - Start with file upload/folders
2. **Phase 6: RFIs** - Core communication workflow
3. **Phase 7: Defects** - Simple status tracking
4. **Phase 8: Project Enhancements** - Activity feed, risks, decisions

This gives us a functional construction PM tool with the most critical features while avoiding over-engineering.

---

## Technical Notes

### File Storage
Use Supabase Storage for documents:
- Public bucket for shareable files
- Private bucket with signed URLs for sensitive docs

### Rich Text
For RFI questions and descriptions:
- Consider Tiptap editor (already works with shadcn)
- Or simple textarea with markdown support

### Permissions Model
Current: `isAdmin` for org-level admin
Needed: Project-level roles via `project_members.role`
- `manager` - Full access to project
- `member` - Read/write most things
- `viewer` - Read only

### Australian Specifics
- ABN validation (11 digits, checksum)
- GST calculations (10%)
- Date format: DD/MM/YYYY
- Currency: AUD with $ symbol
