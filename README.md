# FixItNow API 🔧

**Your Trusted Home Service Platform**

FixItNow is a REST API for a home-service marketplace where customers book technicians, technicians manage services and jobs, and administrators moderate the platform.

## Technology

- Node.js + Express 5
- TypeScript (strict mode)
- PostgreSQL
- Prisma ORM with PostgreSQL driver adapter
- JWT authentication with HTTP-only cookie support
- Zod request validation
- Stripe Checkout and SSLCOMMERZ hosted checkout

## Project Structure

```text
src/
├── config/                 # Validated environment configuration
├── core/                   # API error, response, pagination and async helpers
├── lib/                    # Prisma and Stripe clients
├── middlewares/            # Authentication, validation and error handling
├── modules/
│   ├── admin/
│   ├── auth/
│   ├── booking/
│   ├── category/
│   ├── payment/
│   ├── review/
│   ├── service/
│   ├── technician/
│   └── user/
├── routes/                 # Main API router
├── tests/                  # Unit tests for core business rules
├── types/                  # Express request type augmentation
└── utils/                  # JWT, time-slot and booking-state helpers
```

Each feature module separates schemas, services, controllers and routes.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the environment file:

   ```bash
   cp .env.example .env
   ```

3. Update `DATABASE_URL`, JWT secrets and any payment credentials in `.env`.

4. Generate Prisma Client and create the database migration:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name initial_schema
   ```

5. Seed demo data:

   ```bash
   npm run prisma:seed
   ```

6. Start development mode:

   ```bash
   npm run dev
   ```

The default API URL is `http://localhost:5000`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the TypeScript development server |
| `npm run build` | Compile the project |
| `npm start` | Run the compiled server |
| `npm test` | Build and run business-rule unit tests |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run prisma:seed` | Insert demo users, categories, availability and service data |

## Demo Accounts

After seeding:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fixitnow.local` | Value of `ADMIN_PASSWORD` in `.env` |
| Technician | `technician@fixitnow.local` | `Technician123!` |
| Customer | `customer@fixitnow.local` | `Customer123!` |

Change all demonstration passwords before deploying.

## Authentication

Send the access token as either:

```http
Authorization: Bearer <access-token>
```

or use the HTTP-only cookie created by the login endpoint.

## Main Endpoints

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public with refresh token |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Authenticated |
| PATCH | `/api/users/me` | Authenticated |

Registration accepts only `CUSTOMER` or `TECHNICIAN`. Admin accounts are created through the seed or directly by an existing trusted administrator.

### Public Services and Technicians

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List categories |
| GET | `/api/services` | Search/filter services |
| GET | `/api/services/:id` | View one service |
| GET | `/api/technicians` | Search/filter technicians |
| GET | `/api/technicians/:id` | Profile, services, availability and reviews |
| GET | `/api/reviews/technician/:technicianId` | Technician reviews |

Service filters include `search`, `categoryId`, `type`, `location`, `minRating`, `minPrice`, `maxPrice`, `technicianId`, `page`, `limit`, `sortBy` and `sortOrder`.

Technician filters include `search`, `skill`, `location`, `categoryId`, `serviceType`, `minRating`, `minPrice`, `maxPrice`, pagination and sorting.

### Technician Management

| Method | Endpoint | Description |
|---|---|---|
| PUT | `/api/technician/profile` | Update technician profile |
| PUT | `/api/technician/availability` | Replace weekly availability |
| GET | `/api/technician/bookings` | View assigned bookings |
| PATCH | `/api/technician/bookings/:id` | Accept, decline, start or complete a job |
| GET | `/api/services/mine` | View own service listings |
| POST | `/api/services` | Create service listing |
| PATCH | `/api/services/:id` | Update own service |
| DELETE | `/api/services/:id` | Soft-remove own service |

Availability uses `HH:mm` and rejects overlapping slots.

### Bookings

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/bookings` | Customer |
| GET | `/api/bookings` | Customer, technician or admin; results are role-scoped |
| GET | `/api/bookings/:id` | Authorized participant or admin |
| PATCH | `/api/bookings/:id/cancel` | Customer owner or admin |

The booking request verifies that the service is active, the technician is active, the requested time is in the future, the time falls inside weekly availability, and the exact slot is not already reserved.

### Payment

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create` | Create Stripe or SSLCOMMERZ checkout |
| POST | `/api/payments/confirm` | Server-side verification |
| GET | `/api/payments` | Customer payment history or all payments for admin |
| GET | `/api/payments/:id` | Authorized payment details |
| POST | `/api/payments/stripe/webhook` | Stripe webhook using raw request body |
| POST | `/api/payments/sslcommerz/success` | SSLCOMMERZ success callback |
| POST | `/api/payments/sslcommerz/ipn` | SSLCOMMERZ IPN callback |
| POST | `/api/payments/sslcommerz/fail` | SSLCOMMERZ failure callback |
| POST | `/api/payments/sslcommerz/cancel` | SSLCOMMERZ cancellation callback |

Create request example:

```json
{
  "bookingId": "uuid",
  "provider": "STRIPE"
}
```

or:

```json
{
  "bookingId": "uuid",
  "provider": "SSLCOMMERZ"
}
```

Payment is allowed only when the booking status is `ACCEPTED`. A payment becomes complete only after server-side gateway verification; the booking then moves to `PAID`.

### Reviews

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/reviews` | Customer who owns a completed booking |

Only one review is allowed per completed booking. The technician's average rating and review count are recalculated transactionally.

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Filter/paginate users |
| PATCH | `/api/admin/users/:id` | Block or activate a user |
| GET | `/api/admin/bookings` | View every booking |
| GET | `/api/admin/payments` | View every payment |
| GET | `/api/admin/categories` | View categories |
| POST | `/api/admin/categories` | Create category |
| PATCH | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete unused category |

## Booking State Rules

```text
REQUESTED ──technician accepts──> ACCEPTED ──verified payment──> PAID
    │                                  │                         │
    ├──technician declines──> DECLINED │                         └──technician starts──> IN_PROGRESS
    │                                  │                                                  │
    └──customer cancels──> CANCELLED   └──customer cancels──> CANCELLED                  └──technician completes──> COMPLETED
```

A customer may cancel only while the booking is `REQUESTED`, `ACCEPTED` or `PAID`, which enforces the assignment rule that cancellation must happen before `IN_PROGRESS`.

## Payment Configuration Notes

- Stripe requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- SSLCOMMERZ requires `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD`.
- Keep `SSLCOMMERZ_IS_LIVE=false` for sandbox testing.
- Public callback URLs must be reachable by the payment provider. Use a tunneling service during local webhook testing.
- Never commit `.env` or real payment credentials.

## Validation and Error Format

Successful response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved",
  "data": {}
}
```

Validation/error response:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Request validation failed",
  "details": []
}
```

## Verification Completed

The submitted source was checked with:

```bash
npm run build
npm test
```

Both commands pass in the prepared project. Live database migrations and payment-provider callbacks still require your own PostgreSQL database and gateway credentials.
