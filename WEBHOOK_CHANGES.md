# Webhook & Database Integration Changes

## Summary

Updated the Stripe webhook handler and database layer to:

1. Log errors properly with detailed information
2. Use the backend API at `http://localhost:8000` instead of direct Supabase calls
3. Added missing backend endpoints to support webhook functionality

## Changes Made

### Frontend (yetti-new)

#### 1. `app/api/stripe/webhook/route.ts`

- **Enhanced error logging**: All error handlers now log detailed error information including:
  - Error message
  - Error code
  - Error details
  - Error hint
  - Stack trace
  - Context information (sessionId, invoiceId, subscriptionId, etc.)
- **Added try-catch blocks**: Wrapped all handler functions with proper error handling:
  - `handleCheckoutSessionCompleted()`
  - `handleInvoicePaymentSucceeded()`
  - `handleSubscriptionUpdated()`
  - `handleSubscriptionDeleted()`

- **Removed unused imports**: Removed `supabaseAdmin` import as we now use the backend API

#### 2. `lib/database.ts`

- **Replaced Supabase with API calls**: Completely rewrote database functions to use HTTP requests to the backend API at `http://localhost:8000`
- **Added API helper function**: Created `apiRequest()` helper for consistent API calls with error handling
- **Updated all service methods**:
  - `userPlansService.create()` → POST `/api/billing/plan`
  - `userPlansService.getByUserAndWorkspace()` → GET `/api/billing/plan?user_id=...&workspace_id=...`
  - `userPlansService.update()` → PUT `/api/billing/plan/{id}`
  - `userPlansService.getByStripeSubscription()` → GET `/api/billing/plan/stripe/{stripe_subscription_id}`
  - `userCreditsService.create()` → POST `/api/credits/transaction`
  - `userCreditsService.getBalance()` → GET `/api/credits?user_id=...&workspace_id=...`
  - `userCreditsService.getTransactionHistory()` → GET `/api/credits/transactions?user_id=...&workspace_id=...&limit=...`

#### 3. `.env.example`

- Added `API_URL=http://localhost:8000` configuration

### Backend (agent-dispatch-v2-server)

#### 1. `ad-server/app/routes/billing_route.py`

Added new endpoints:

- **POST `/api/billing/plan`**: Create or update a user plan
- **PUT `/api/billing/plan/{plan_id}`**: Update a user plan by ID
- **GET `/api/billing/plan/stripe/{stripe_subscription_id}`**: Get plan by Stripe subscription ID

#### 2. `ad-server/app/routes/credits_route.py`

Added new endpoint:

- **POST `/api/credits/transaction`**: Create a new credit transaction
  - Handles both credit and debit transactions
  - Automatically calculates new balance
  - Validates sufficient credits for debit transactions
  - Stores transaction records with all metadata (source, invoice, description)

## API Endpoints Summary

### Billing Endpoints

| Method | Endpoint                                            | Description                        |
| ------ | --------------------------------------------------- | ---------------------------------- |
| GET    | `/api/billing/invoices`                             | Get billing invoices for a user    |
| GET    | `/api/billing/plan`                                 | Get user plan for a workspace      |
| POST   | `/api/billing/plan`                                 | Create a new user plan             |
| PUT    | `/api/billing/plan/{id}`                            | Update a user plan by ID           |
| GET    | `/api/billing/plan/stripe/{stripe_subscription_id}` | Get plan by Stripe subscription ID |

### Credits Endpoints

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| GET    | `/api/credits`              | Get credit balance for a user   |
| GET    | `/api/credits/transactions` | Get credit transaction history  |
| POST   | `/api/credits/transaction`  | Create a new credit transaction |

## Environment Configuration

Make sure your `.env` file includes:

```env
API_URL=http://localhost:8000
```

## Testing

To test the webhook integration:

1. Start the backend server: `cd agent-dispatch-v2-server && python -m uvicorn app.main:app --reload --port 8000`
2. Start the frontend: `cd yetti-new && npm run dev`
3. Use Stripe CLI to send test webhooks: `stripe listen --forward-to localhost:3000/api/webhook`
4. Trigger test events: `stripe trigger checkout.session.completed`

## Error Logs Format

Errors are now logged with the following structure:

```json
{
  "message": "Error message",
  "code": "Error code (if available)",
  "details": "Additional details",
  "hint": "Error hint",
  "stack": "Stack trace",
  "context": {
    "sessionId": "...",
    "invoiceId": "...",
    "subscriptionId": "..."
  }
}
```

This makes debugging webhook issues much easier!

## Known Issues & Notes

1. The webhook currently uses empty strings (`""`) for `workspace_id` since credits are not workspace-specific. If you plan to make credits workspace-specific in the future, update this logic.

2. The backend API responses are expected in the format `{ plan: {...} }` or `{ credit: {...} }`. Make sure the backend response format matches this.

3. All API calls use proper URL encoding for query parameters to handle special characters in user IDs and workspace IDs.



