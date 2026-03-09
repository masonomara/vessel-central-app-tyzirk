## Overview

There are 5 detail screens are in good working order:

- Documents
- Maintenence
- Issues
- Supplies
- Events

Each of these detail screens are accessible from a "Card"

- Documents Card
- Maintence Card
- Issue Card
- Supplies Card
- Event Card

These cards live on the Issues index, supplies index, maintence index, calendar, and documents index

## Statuses

Four of the detail screens have statuses that can be updated.

- Event: Scheduled, In Progres, Completed, and Cancelled
- Maintence: Open, In Progress, Waiting on parts, Completed
- Issues: Open, In Progress, Waiting on parts, Completed
- Supplies (see below)

**Special Case:**

Supplies have two statuses that are currently mixed into one: Approval and Status

- Approval should be Approved and Denied
- Status should be Pending, Ordered, & Recieved

On the detail page for supplies, if the supply is niether approved or denied, there needs to be two buttons between the priority row and the detail row that has priority for Approve or Deny for Managers and Owners only.

the status bar shoudl only show Pending, Ordered, and Delivered.

## Goal

**Supplies Detail Screen:**

- If approved, supplies status needs to only have options for Pending, Ordered, and Delivered
- If denied, the status shoudl automatically say "Denied (red)"
- there needs to be two buttons between the priority row and the detail row that has priority for Approve or Deny for Managers and Owners only.
- if approved, there does not need to be any further signal on the supply detail screen

**Supplies Card:**

In the supplies index screen, if a supply is neither approved or denied, there shoudl be an approve or deny button on the supply card

Supply requests that need to be approved or denied shoudl be shown on a lsit above the list of approved requests, then a list of denied requests in the supplies index screen
