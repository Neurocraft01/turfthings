# 📱 Twilio WhatsApp Integration — Complete Setup Guide

This guide covers everything you need to do to get WhatsApp confirmation messages working for bookings in the Turf Things app.

---

## How It Works

When an admin creates a booking (or a user books via the website), the app uses Twilio's WhatsApp API to:
1. Send a confirmation message to the **player's WhatsApp number**
2. Send a notification to the **admin's WhatsApp number**

The code is already implemented in [`src/lib/twilio.ts`](src/lib/twilio.ts) and called from the bookings API route.

---

## Step 1: Create a Twilio Account

1. Go to **[https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)**
2. Sign up for a free account
3. Verify your phone number
4. You'll land on the **Twilio Console Dashboard**

---

## Step 2: Get Your Credentials

On the Twilio Console homepage ([console.twilio.com](https://console.twilio.com)):

| Field | Where to Find It |
|-------|-----------------|
| **Account SID** | Dashboard homepage → "Account Info" section |
| **Auth Token** | Dashboard homepage → "Account Info" section (click to reveal) |

Copy both and paste into your `.env` file:

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
```

> [!IMPORTANT]
> Your Account SID always starts with `AC`. If it doesn't, you've copied the wrong value.

---

## Step 3: Set Up the WhatsApp Sandbox

> The Sandbox lets you test WhatsApp messaging for free without a verified business account.

1. In Twilio Console, go to **Messaging → Try it Out → Send a WhatsApp message**
2. You'll see a sandbox number like: `+1 415 523 8886`
3. **On your phone**, send the join code to that number via WhatsApp:
   ```
   join <your-sandbox-keyword>
   ```
   (The keyword is shown on that page, e.g. `join purple-mountain`)

4. You'll get a confirmation WhatsApp message: _"You are now connected to the sandbox."_

5. Set this in `.env`:
   ```env
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   ```

> [!NOTE]
> Every person who wants to **receive** sandbox messages must join the sandbox by sending the keyword to the Twilio number. This is a sandbox limitation only.

---

## Step 4: Set the Admin Number

This is the number that receives booking notifications:

```env
ADMIN_WHATSAPP_NUMBER="+917030499191"
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER="+917030499191"
```

Make sure the admin number has also **joined the sandbox** (for testing).

---

## Step 5: Complete `.env` Configuration

Your final `.env` should look like:

```env
DATABASE_URL="mysql://..."

# Twilio
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_32_chars"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Admin Contact
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER="+917030499191"
ADMIN_WHATSAPP_NUMBER="+917030499191"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="turf_gallery"
```

---

## Step 6: Test It

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/admin/bookings`
3. Click **Add Booking** and create a test booking with **your own mobile number** (formatted as `+91XXXXXXXXXX`)
4. You should receive a WhatsApp message within a few seconds

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Twilio not configured` in logs | Check that `TWILIO_ACCOUNT_SID` starts with `AC` |
| Message says "sent" but not received | Recipient hasn't joined the sandbox — send the join keyword |
| `Error 63032` | Your Twilio trial balance is out — top up or upgrade |
| `Error 21614` | Phone number format is wrong — use `+91XXXXXXXXXX` |
| `Error 63016` | The "from" number must be prefixed with `whatsapp:` |

---

## Going Live (Production)

When you're ready to send to anyone without sandbox restrictions:

1. **Apply for WhatsApp Business API access** in Twilio Console → Messaging → Senders → WhatsApp Senders
2. Submit your business details and wait for Meta approval (~1–5 business days)
3. Once approved, you'll get a dedicated WhatsApp Business number
4. Update `TWILIO_WHATSAPP_NUMBER` to your new number: `whatsapp:+91XXXXXXXXXX`
5. **Message Templates**: Production WhatsApp requires pre-approved message templates for outbound messages. Create them in Twilio Console → Content Template Builder

---

## Message Format

The booking confirmation message is sent automatically when a booking is created. You can customize it in [`src/app/api/bookings/route.ts`](src/app/api/bookings/route.ts) by editing the `message` string passed to `sendWhatsAppMessage()`.

---

*For more help, see the [Twilio WhatsApp documentation](https://www.twilio.com/docs/whatsapp/quickstart/node).*
