# Detail Screen Components

Every data element across all 5 detail screens. All rows use the unified `DetailRow` component which supports three modes: **value** (static text), **linkTo** (navigable), **button** (action), and **chips** (status toggles).

---

## Maintenance Detail

### Title Section

| Element        | Data                          | Interactive? |
| -------------- | ----------------------------- | ------------ |
| Title          | `task.title`                  | No           |
| Priority badge | `task.priority` (color-coded) | No           |
| Status badge   | `task.status` (color-coded)   | No           |

### Detail Rows

| Element        | Data                                                                    | Type             | Conditional?                     |
| -------------- | ----------------------------------------------------------------------- | ---------------- | -------------------------------- |
| Description    | `task.description`                                                      | DetailRow value  | No                               |
| Vessel         | `task.vesselName`                                                       | DetailRow linkTo | No                               |
| Due Date       | `formatDueDate(task.dueDate)` — danger color if overdue + not completed | DetailRow value  | No                               |
| Assigned To    | `task.assignedToName`                                                   | DetailRow value  | Yes — only if assigned           |
| Frequency      | `"Every {value} {frequency}"`                                           | DetailRow value  | Yes — only if `task.isRecurring` |
| Estimated Cost | `$task.estimatedCost`                                                   | DetailRow value  | Yes — only if set                |
| Actual Cost    | `$task.actualCost`                                                      | DetailRow value  | Yes — only if set                |

### Notes Section

| Element    | Data         | Interactive? | Conditional?              |
| ---------- | ------------ | ------------ | ------------------------- |
| Notes text | `task.notes` | No           | Yes — only if notes exist |

### Completion History (list)

| Element         | Data                             | Interactive? | Conditional?                     |
| --------------- | -------------------------------- | ------------ | -------------------------------- |
| Section         | Mapped list of completionHistory | No           | Yes — only if history.length > 0 |
| Per item: Icon  | Checkmark circle (success)       | No           | No                               |
| Per item: Name  | `record.completedByName`         | No           | No                               |
| Per item: Date  | `formatDate(record.completedAt)` | No           | No                               |
| Per item: Notes | `record.notes`                   | No           | Yes — only if set                |
| Per item: Cost  | `$record.cost`                   | No           | Yes — only if set                |

### Status Chips

| Element             | Data                              | Type                | Conditional?                                              |
| ------------------- | --------------------------------- | ------------------- | --------------------------------------------------------- |
| Status chip row     | DetailRow with chips prop         | DetailRow chips     | Yes — `userRole !== "owner"` AND `status !== "completed"` |
| "Open" chip         | Sets status to `open`             | Chip (default)      | Selected state if current                                 |
| "In Progress" chip  | Sets status to `in_progress`      | Chip (accent color) | Selected state if current                                 |
| "Waiting on Parts"  | Sets status to `waiting_on_parts` | Chip (warning)      | Selected state if current                                 |

### Complete Task (form)

| Element                   | Data                                                            | Type            | Conditional?                                              |
| ------------------------- | --------------------------------------------------------------- | --------------- | --------------------------------------------------------- |
| Section                   | Completion form                                                 | —               | Yes — `userRole !== "owner"` AND `status !== "completed"` |
| Notes input               | TextInput (multiline, 3 lines)                                  | TextInput       | No                                                        |
| Cost input                | TextInput (numeric)                                             | TextInput       | No                                                        |
| "Mark as Complete" button | Calls completeMaintenanceTask with confirmation, navigates back | DetailRow button | No                                                        |

---

## Issue Detail

### Title Section

| Element        | Data                           | Interactive?                          |
| -------------- | ------------------------------ | ------------------------------------- |
| Title          | `issue.title`                  | No                                    |
| Priority badge | `issue.priority` (color-coded) | No                                    |
| Status badge   | `issue.status` (color-coded)   | No                                    |
| Category badge | `issue.category`               | No — conditional on category existing |

### Detail Rows

| Element     | Data                                   | Type             | Conditional?           |
| ----------- | -------------------------------------- | ---------------- | ---------------------- |
| Description | `issue.description`                    | DetailRow value  | No                     |
| Vessel      | `issue.vesselName`                     | DetailRow linkTo | No                     |
| Reported By | `issue.reportedByName`                 | DetailRow value  | No                     |
| Location    | `issue.location` or "Not specified"    | DetailRow value  | No                     |
| Created     | `formatDate(issue.createdAt)`          | DetailRow value  | No                     |
| Assigned To | `issue.assignedToName`                 | DetailRow value  | Yes — only if assigned |
| Resolved    | `formatDate(issue.resolvedAt)`         | DetailRow value  | Yes — only if resolved |

### Attachments (horizontal gallery)

| Element                     | Data                   | Interactive? | Conditional?                         |
| --------------------------- | ---------------------- | ------------ | ------------------------------------ |
| Section                     | Horizontal ScrollView  | —            | Yes — only if attachments.length > 0 |
| Per item: Image             | `Image` with `att.uri` | No           | Yes — if `att.type === "image"`      |
| Per item: Video placeholder | Play circle icon       | No           | Yes — if `att.type !== "image"`      |

### Comments (list + input)

| Element             | Data                                | Interactive?                        | Conditional?      |
| ------------------- | ----------------------------------- | ----------------------------------- | ----------------- |
| Section title       | `"Comments (N)"` with count         | No                                  | No — always shown |
| Per comment: Author | `comment.userName`                  | No                                  | No                |
| Per comment: Date   | `formatDate(comment.createdAt)`     | No                                  | No                |
| Per comment: Body   | `comment.text`                      | No                                  | No                |
| Comment TextInput   | Multiline input                     | **Yes** — local state `commentText` | No                |
| Send button         | Calls addIssueComment, clears input | **Yes** — disabled when empty       | No                |

### Actions

| Element                | Data                                | Type             | Conditional?                                       |
| ---------------------- | ----------------------------------- | ---------------- | -------------------------------------------------- |
| Section                | —                                   | —                | Yes — `owner/manager` AND `status !== "completed"` |
| "Assign to Me" button  | Calls updateIssue with current user | DetailRow button | Yes — only if `!issue.assignedToName`              |
| Status chip row        | DetailRow with chips prop           | DetailRow chips  | No (within section)                                |
| "Open" chip            | Sets status to `open`               | Chip (default)   | Selected state if current                          |
| "In Progress" chip     | Sets status to `in_progress`        | Chip (accent)    | Selected state if current                          |
| "Mark Resolved" button | Sets status to `completed`          | DetailRow button | No (within section)                                |

---

## Supply Detail

### Title Section

| Element        | Data                             | Interactive? |
| -------------- | -------------------------------- | ------------ |
| Title          | `request.itemName`               | No           |
| Status badge   | `request.status` (color-coded)   | No           |
| Priority badge | `request.priority` (color-coded) | No           |

### Detail Rows

| Element        | Data                                     | Type             | Conditional?          |
| -------------- | ---------------------------------------- | ---------------- | --------------------- |
| Description    | `request.description`                    | DetailRow value  | No                    |
| Quantity       | `"{quantity} {unit}"`                    | DetailRow value  | No                    |
| Estimated Cost | `$request.estimatedCost`                 | DetailRow value  | No                    |
| Actual Cost    | `$request.actualCost`                    | DetailRow value  | Yes — only if != null |
| Vessel         | `request.vesselName`                     | DetailRow linkTo | No                    |
| Category       | `request.category`                       | DetailRow value  | No                    |
| Requested By   | `request.requestedByName`                | DetailRow value  | No                    |
| Created        | `formatDate(request.createdAt)`          | DetailRow value  | No                    |
| Vendor         | `request.vendor`                         | DetailRow value  | Yes — only if set     |
| Approved By    | `request.approvedByName`                 | DetailRow value  | Yes — only if set     |
| Approved On    | `formatDate(request.approvedAt)`         | DetailRow value  | Yes — only if set     |
| Denial Reason  | `request.deniedReason`                   | DetailRow value  | Yes — only if set     |

### Notes Section

| Element    | Data            | Interactive? | Conditional?              |
| ---------- | --------------- | ------------ | ------------------------- |
| Notes text | `request.notes` | No           | Yes — only if notes exist |

### Actions — Pending

| Element          | Data                                                         | Type             | Conditional?                                     |
| ---------------- | ------------------------------------------------------------ | ---------------- | ------------------------------------------------ |
| "Approve" button | Calls approveSupplyRequest with confirmation, navigates back | DetailRow button | Yes — `owner/manager` AND `status === "pending"` |
| "Deny" button    | Calls denySupplyRequest with confirmation, navigates back    | DetailRow button | Yes — same gate                                  |

### Actions — Approved

| Element                  | Data                                          | Type             | Conditional?                                      |
| ------------------------ | --------------------------------------------- | ---------------- | ------------------------------------------------- |
| "Mark as Ordered" button | Calls updateSupplyRequest `status: "ordered"` | DetailRow button | Yes — `owner/manager` AND `status === "approved"` |

### Actions — Ordered

| Element                   | Data                                           | Type             | Conditional?                                     |
| ------------------------- | ---------------------------------------------- | ---------------- | ------------------------------------------------ |
| "Mark as Received" button | Calls updateSupplyRequest `status: "received"` | DetailRow button | Yes — `owner/manager` AND `status === "ordered"` |

---

## Document Detail

### Title Section

| Element           | Data                                          | Interactive?                          |
| ----------------- | --------------------------------------------- | ------------------------------------- |
| Title             | `doc.title`                                   | No                                    |
| Category badge    | `doc.category`                                | No                                    |
| "IMPORTANT" badge | Static label                                  | No — conditional on `doc.isImportant` |
| "EXPIRED" badge   | Static label (computed from `doc.expiryDate`) | No — conditional on `isExpired`       |

### Detail Rows

| Element     | Data                                                   | Type             | Conditional?                     |
| ----------- | ------------------------------------------------------ | ---------------- | -------------------------------- |
| Description | `doc.description`                                      | DetailRow value  | Yes — only if description exists |
| File Name   | `doc.fileName`                                         | DetailRow value  | No                               |
| File Size   | `formatFileSize(doc.fileSize)`                         | DetailRow value  | No                               |
| File Type   | `doc.fileType.toUpperCase()`                           | DetailRow value  | No                               |
| Vessel      | `doc.vesselName`                                       | DetailRow linkTo | No                               |
| Uploaded By | `doc.uploadedByName`                                   | DetailRow value  | No                               |
| Uploaded    | `formatDate(doc.uploadedAt)`                           | DetailRow value  | No                               |
| Expires     | `formatDate(doc.expiryDate)` — danger color if expired | DetailRow value  | Yes — only if expiryDate set     |

### Tags (pill list)

| Element   | Data                              | Interactive? | Conditional?                  |
| --------- | --------------------------------- | ------------ | ----------------------------- |
| Tag pills | `doc.tags` mapped to styled pills | No           | Yes — only if tags.length > 0 |

### Preview Card

| Element          | Data                        | Interactive? |
| ---------------- | --------------------------- | ------------ |
| File icon        | Doc icon (accent)           | No           |
| File name        | `doc.fileName`              | No           |
| File type + size | `"{fileType} · {fileSize}"` | No           |

### Actions (always visible)

| Element           | Data                         | Type             | Conditional? |
| ----------------- | ---------------------------- | ---------------- | ------------ |
| "Download" button | Triggers alert (placeholder) | DetailRow button | No           |
| "Share" button    | Triggers alert (placeholder) | DetailRow button | No           |

---

## Calendar Event Detail

### Title Section

| Element      | Data                                                       | Interactive? |
| ------------ | ---------------------------------------------------------- | ------------ |
| Title        | `event.title`                                              | No           |
| Type badge   | `getEventTypeLabel(event.type)` (color from getEventColor) | No           |
| Status badge | `event.status` (color-coded per status)                    | No           |

### Detail Rows

| Element     | Data                                               | Type             | Conditional?                     |
| ----------- | -------------------------------------------------- | ---------------- | -------------------------------- |
| Description | `event.description`                                | DetailRow value  | Yes — only if description exists |
| Date        | `formatEventDateRange(startDate, endDate, allDay)` | DetailRow value  | No                               |
| Vessel      | `event.vesselName`                                 | DetailRow linkTo | No                               |
| Location    | `event.location`                                   | DetailRow value  | Yes — only if set                |
| Attendees   | `event.attendeeNames.join(", ")`                   | DetailRow value  | Yes — only if length > 0         |
| Created By  | `event.createdByName`                              | DetailRow value  | No                               |
| Created     | `event.createdAt` as locale date string            | DetailRow value  | No                               |

### Notes Section

| Element    | Data          | Interactive? | Conditional?              |
| ---------- | ------------- | ------------ | ------------------------- |
| Notes text | `event.notes` | No           | Yes — only if notes exist |

### Actions

| Element                | Data                                                        | Type             | Conditional? |
| ---------------------- | ----------------------------------------------------------- | ---------------- | ------------ |
| Status chip row        | DetailRow with chips prop                                   | DetailRow chips  | No           |
| "Scheduled" chip       | Sets status to `scheduled`                                  | Chip (accent)    | Selected state if current |
| "Cancelled" chip       | Sets status to `cancelled`                                  | Chip (danger)    | Selected state if current |
| "Mark Complete" button | Calls updateCalendarEvent `status: "completed"`             | DetailRow button | No           |
| "Delete Event" button  | Calls deleteCalendarEvent with confirmation, navigates back | DetailRow button | No           |

---

## Cross-Screen Summary

### DetailRow Modes

All detail screens use a single `DetailRow` component with four modes:

| Mode       | Prop      | Renders                                                    |
| ---------- | --------- | ---------------------------------------------------------- |
| **Value**  | `value`   | Label + static text                                        |
| **Link**   | `linkTo`  | Label + accent text + chevron, navigates on press          |
| **Button** | `button`  | Label + colored action button                              |
| **Chips**  | `chips`   | Label + row of selectable chip toggles (selected/unselected) |

### Shared across all 5

- Title section (title text + 1-3 color-coded badges)
- Detail rows via `DetailRow` (value, linkTo, button, or chips)
- Vessel link (DetailRow with linkTo — present on every screen)

### Unique interactive elements per screen

| Screen          | Unique interactive elements                                                       |
| --------------- | --------------------------------------------------------------------------------- |
| **Maintenance** | Status chips (3), completion form (2 text inputs + button)                        |
| **Issue**       | Status chips (2) + Mark Resolved button, Assign button, comment input + send      |
| **Supply**      | Approve/Deny buttons, Mark as Ordered button, Mark as Received button (workflow)  |
| **Document**    | Download button, Share button (always visible)                                    |
| **Calendar**    | Status chips (2) + Mark Complete button, Delete Event button                      |

### Unique static sections per screen

| Screen          | Unique static sections             |
| --------------- | ---------------------------------- |
| **Maintenance** | Notes, Completion history list     |
| **Issue**       | Attachments gallery, Comments list |
| **Supply**      | Notes                              |
| **Document**    | Tags pills, Preview card           |
| **Calendar**    | Notes                              |
