# Implementation Plan — Member Portal (Revised)

We will build the member-specific portal for the Science Club website. This includes user authentication (with free and paid membership options), a responsive dashboard, a mock checkout for paid membership, profile settings, a digital certificate viewer, and a public certificate verification page.

Additionally, we are introducing a unique **Member ID** system for registration autofill, **dynamic group pricing** for event registration, and an **interactive UPI payment block** with dynamic QR code generation.

## User Review Required

> [!IMPORTANT]
> **Key Decisions & Parameters:**
> 1. **Configurable Membership Fee:** Instead of hardcoding the membership fee, we will store it inside the `site_content` database table under the key `'membership_settings'`. The default value will be **₹299/year**, and it can be updated in the database without touching code.
> 2. **Configurable UPI Details:** The recipient UPI ID (e.g. `scienceclub@okaxis`) and name will also be retrieved dynamically from the `site_content` `'membership_settings'` row.
> 3. **Dynamic UPI QR Code:** We will generate real UPI payment QR codes dynamically using the standard format:
>    `upi://pay?pa={UPI_ID}&pn={UPI_NAME}&am={AMOUNT}&cu=INR&tn={NOTE}`
>    This URL will be rendered via a responsive image helper (`https://api.qrserver.com/v1/create-qr-code/`). Scanning this with Google Pay, PhonePe, or Paytm will auto-fill the correct amount and transaction description.
> 4. **Group Registration & Certificates:** To ensure every participant registered in a group gets their respective certificate in their own dashboard, participants must enter their unique Member ID. For guests who do not have an account, the system will charge the non-member price and log them in the primary registrant's group details JSON.

## Proposed Changes

---

### 1. Database Migration (Member ID & Config Settings)

We need to add a unique Member ID to profiles, backfill existing records, protect it from user tampering, and seed the membership settings.

#### [NEW] [0018_member_portal.sql](file:///c:/Users/DELL/science-club-website/supabase/migrations/0018_member_portal.sql)
- **Table Alterations:** Add `member_id` (`text unique`) to `public.profiles`.
- **Member ID Generator Function:** Create a PG function `public.generate_unique_member_id()` that mints a unique identifier in the format `SC-YYYY-XXXXX` (e.g., `SC-2026-48392`) and checks for collisions.
- **Trigger Updates:**
  - Update `public.handle_new_user()` to call `generate_unique_member_id()` on new signup.
  - Update `public.protect_profile_columns()` to block regular members from editing their own `member_id`.
- **Backfill:** Generate unique IDs for all existing profile rows.
- **Config Seed:** Seed default values for `'membership_settings'` in `public.site_content`:
  ```json
  {
    "membership_fee": 299,
    "upi_id": "scienceclub@okaxis",
    "upi_name": "Science Club ASIET"
  }
  ```

---

### 2. Member ID Validation API

An endpoint to safely retrieve participant profiles for autofilling and verifying membership status client-side.

#### [NEW] [route.ts](file:///c:/Users/DELL/science-club-website/src/app/api/members/validate/route.ts)
- **GET /api/members/validate?id=SC-XXXX-XXXXX**
- Validates the provided Member ID. If found, returns the safe public details of the user:
  `{ success: true, user: { id, full_name, email, department, year_of_study, is_member } }`
- If invalid or not found, returns `{ success: false, error: "not_found" }`.

---

### 3. Redesigned Event Registration Block (Dynamic Group Pricing)

We will modify the registration flow to support multi-person registration, auto-fill verification, and UPI QR code payments.

#### [MODIFY] [RegisterButton.tsx](file:///c:/Users/DELL/science-club-website/src/components/RegisterButton.tsx)
- Instead of executing a single-click registration immediately, clicking "Register" will open a beautifully animated **Event Registration Dialog**.
- **Registration Form Steps:**
  1. **Participant List:**
     - The first slot is pre-filled with the logged-in user's details.
     - Allows adding additional slots (Group Registration).
     - Each slot has an optional **Member ID** field. Entering a Member ID triggers a call to `/api/members/validate` to verify and auto-fill Name, Email, and Membership Status (`is_member`).
     - If no Member ID is provided, the slot is filled manually (Name, Email) and treated as a Guest (priced at Non-Member Price).
     - The total price is calculated dynamically (e.g., 2 members @ ₹50 + 1 guest @ ₹100 = ₹200).
  2. **Payment Block:**
     - Fetches UPI settings and membership fee details.
     - Displays a **dynamic UPI QR Code** matching the total price.
     - Includes a field to submit the **UPI Transaction Ref ID (UTR)**.
     - On submit, POSTs the transaction details and participant list to `/api/events/[id]/register-group`.

#### [NEW] [route.ts](file:///c:/Users/DELL/science-club-website/src/app/api/events/%5Bid%5D/register-group/route.ts)
- **POST /api/events/[id]/register-group**
- Server-side endpoint using the `admin` client:
  1. Validates the event status, dates, and remaining seats.
  2. Computes the final price for all participants to verify client inputs.
  3. Saves registrations in `event_registrations` for *all* participants who provided a Member ID (so it shows up in their dashboards and links to their certificates).
  4. Stores guest data inside the primary registrant's registration `form_data` column.
  5. Updates seats remaining.

---

### 4. Authentication Flow (Login & Signup Tiers)

#### [MODIFY] [page.tsx](file:///c:/Users/DELL/science-club-website/src/app/login/page.tsx)
- Redesign the signup form to let users choose:
  - **Standard Account (Free):** ₹0/year. Direct signup.
  - **Premium Membership (Paid):** ₹{Membership Fee}/year.
- If Premium is selected, show the **Mock UPI Checkout Block** (QR Code + Card details) prefilled with the membership fee from database settings.
- On completion, call the Server Action to create the user, sign them in, and upgrade them to a paid member (`is_member = true`) for 1 year.

---

### 5. Member Dashboard (My Account)

#### [MODIFY] [page.tsx](file:///c:/Users/DELL/science-club-website/src/app/account/page.tsx)
- Update the page shell to fetch profile details, event registrations, and settings.
- Pass this data to the new Client Component.

#### [NEW] [AccountClient.tsx](file:///c:/Users/DELL/science-club-website/src/app/account/AccountClient.tsx)
- A dashboard with clean tab navigation:
  - **Overview:** Displays Member Card (shows Name, unique Member ID, and Membership Badge with Expiry Date). Includes an "Upgrade to Premium" banner for Free accounts.
  - **Registrations:** Shows participated/registered events with pricing and attendance status.
  - **Certificates:** Displays earned certificates. Clicking opens the high-fidelity Certificate viewer.
  - **Edit Profile:** Form to update Name, Department, and Year of Study.
  - **Security Settings:** Form to change password and sign out.
- Implements the Upgrade to Premium modal that pulls the fee and UPI details from `site_content` and simulates payment.

---

### 6. Interactive Certificate System

#### [NEW] Certificate Modal (inside AccountClient)
- A print-friendly digital certificate:
  - Custom border, "ASIET Science Club" badge.
  - Text: *"This is to certify that **[Full Name]** has actively participated in the event **[Event Title]** on **[Date]**."*
  - Unique ID: `[Certificate ID]`.
  - Signature blocks.
  - "Print / Save PDF" button (with CSS print rules).

#### [NEW] [page.tsx](file:///c:/Users/DELL/science-club-website/src/app/certificates/%5Bid%5D/page.tsx)
- A public verification route `/certificates/[id]`.
- Queries the database using the admin client. If found, displays a beautiful checkmark badge verifying the certificate's validity (Recipient, Event Name, Date, ID).

---

### 7. Main Header Navigation Integration

#### [MODIFY] [Header.tsx](file:///c:/Users/DELL/science-club-website/src/components/Header.tsx)
- Replace the static User button. Query current auth state:
  - If logged out: Link to `/login`.
  - If logged in: Show a badge with initials. Clicking opens a dropdown menu:
    - **Dashboard** (`/account`)
    - **Admin Panel** (visible only for role `admin` or `owner`)
    - **Sign Out**

---

## Verification Plan

### Manual Verification
1. **Migration & Member ID:**
   - Verify `0018_member_portal.sql` runs correctly in the Supabase editor.
   - Confirm existing users are backfilled with IDs (e.g. `SC-2026-XXXXX`).
   - Confirm trigger auto-assigns Member IDs on new account signups.
2. **Autofill & Pricing:**
   - On the registration form, enter a valid Member ID and check that details are fetched and the correct member price is computed.
   - Enter a non-member ID or manual details, confirm it charges the full price.
3. **Dynamic UPI Payments:**
   - Open registration, add multiple participants (e.g. 1 member and 1 guest), verify total is correct.
   - Scan the generated QR code with a phone to verify the correct UPI URI format (with exact amount and recipient settings).
4. **Upgrades & Expiry:**
   - Log in as a Free account, complete the upgrade checkout. Verify status immediately changes to Premium, and database profile updates `is_member` to `true` and sets the expiry date.
