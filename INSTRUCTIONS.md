# Front Desk Rockies — Build Instructions

## Architecture
Two completely separate apps:

### 1. Guest Tablet App (`/frontdesk-rockies`)
- Vite + React + Tailwind (existing code)
- Packaged as Android APK via Capacitor
- NO admin access whatsoever
- Guests: video call front desk, book amenities, view map, view payment link

### 2. Admin Portal (`/frontdesk-rockies-admin`)
- Next.js App Router
- Deployed to separate Vercel URL (e.g. frontdesk-rockies-admin.vercel.app)
- Staff only — accessible from computer browser
- Features:
  - Receive incoming video calls from guest tablets (JaaS)
  - Send payment links to guest (via SMS + email)
  - Manage bookings
  - Monitor devices
  - Settings (JaaS, Stripe, Telnyx config)

## Backend: Supabase
Use EXISTING Supabase project (xocfduqugghailalzlqy) — same as BirthdayBoard/Concierge.
Replace Base44 entirely.

### Tables to create:
- `fd_devices` — tablet devices (name, location, status, ip_address, last_active, current_map, jitsi_room)
- `fd_bookings` — guest bookings (guest_name, guest_email, room_number, booking_date, booking_time, booking_type, status, notes, parking_spot, locker_number)
- `fd_sessions` — active call sessions (device_id, guest_name, session_type, status, started_at, jitsi_room)
- `fd_payment_instructions` — payment requests (device_id, guest_name, guest_email, guest_phone, amount, description, status, stripe_payment_link, sent_via, sent_at, paid_at)

## Video: JaaS (8x8)
- AppID: vpaas-magic-cookie-e866a734fd5742ea83b9df9d3fab8807
- Key ID: vpaas-magic-cookie-e866a734fd5742ea83b9df9d3fab8807/740abb
- Private key: C:\Users\pargo_pxnd4wa\jitsi-jaas\jaas_private_key.pk
- JWT must be generated server-side (Next.js API route in admin portal)
- Guest app calls admin API to get a JWT for the room
- Room naming: `frontdesk-{device_id}` or `frontdesk-{random}`
- Guest initiates call → admin receives notification + can join same room

## Payments: Stripe Payment Links
- Generate a Stripe Payment Link via API (amount + description)
- Send the link to guest via:
  - Telnyx SMS to guest phone number (account already set up, +15878643090)
  - Resend email to guest email
- Guest opens link on their phone and pays
- Stripe webhook updates fd_payment_instructions status to 'paid'

## Telnyx SMS
- Account: svet@stproperties.com
- API key: (see .env.local — TELNYX_API_KEY)
- From number: +15878643090
- Use Telnyx SDK to send SMS

## Resend Email
- Already set up in BirthdayBoard project
- Pull API key from birthdayboard .env.local

## APK Build (Capacitor)
- Add @capacitor/core + @capacitor/android to frontdesk-rockies
- `npx cap init` then `npx cap add android`
- `npm run build` → `npx cap sync` → `npx cap open android` (or build via CLI)
- Target: Android tablet in landscape mode
- Output: app-debug.apk

## Environment Variables needed

### Admin Portal (.env.local):
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
JAAS_APP_ID=vpaas-magic-cookie-e866a734fd5742ea83b9df9d3fab8807
JAAS_KEY_ID=vpaas-magic-cookie-e866a734fd5742ea83b9df9d3fab8807/740abb
JAAS_PRIVATE_KEY=(contents of jaas_private_key.pk)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
TELNYX_API_KEY=
TELNYX_FROM_NUMBER=+15878643090
RESEND_API_KEY=

### Guest App (.env):
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_API_URL=https://frontdesk-rockies-admin.vercel.app

## Build Order
1. Create Supabase tables (migration script)
2. Build admin portal (Next.js) with:
   a. JaaS JWT API route
   b. Stripe payment link API route
   c. Telnyx SMS API route
   d. Resend email API route
   e. Admin UI pages
3. Update guest app:
   a. Remove Base44, add Supabase
   b. Wire JaaS (call admin API for JWT)
   c. Add payment link viewer page
4. Set up Capacitor + build APK
5. Deploy both to Vercel
6. Set up Stripe webhook

## Key Constraint
Admin portal URL is NEVER linked from guest app.
Guest app has zero knowledge of admin portal existence.
