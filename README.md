# Clinics Backend

## Project Overview

This backend powers a clinic appointment system with support for:
- Patient registration, login, password reset, and verification.
- Doctor registration, profile management, availability scheduling, and license upload.
- Appointment booking, confirmation, completion, cancellation, and payment simulation.
- Role-based access control for `admin`, `doctor`, and `patient`.
- Notifications stored in database and optionally delivered via email.
- Specialty, location, and rating management.

## Stack

- Node.js (ESM)
- Express.js
- MongoDB with Mongoose
- Zod request validation
- JWT access tokens + refresh cookies
- Nodemailer email jobs
- Cloudinary file uploads

## Getting Started

### Requirements

- Node.js 18+ (recommended)
- MongoDB
- Cloudinary account (optional for license uploads)

### Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example` and configure values.

4. Start the server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

## Environment Variables

Required:
- `PORT`
- `MONGO_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV`
- `FRONTEND_URL`

Email settings:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

Cloudinary settings (optional):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Core Architecture

### Entry points

- `src/server.js` connects to MongoDB and starts the Express app.
- `src/app.js` sets up middleware, routes, and error handling.

### Middlewares

- `src/middlewares/auth.middleware.js` validates JWTs and sessions.
- `src/middlewares/validate.middleware.js` runs Zod schemas for request validation.
- `src/middlewares/upload.middleware.js` handles multipart uploads for doctor license files.

### Modules

Each feature is organized by module with route/controller/service/validation files.

- `src/modules/auth` - registration, login, password reset, refresh, logout.
- `src/modules/users` - profile updates and admin user management.
- `src/modules/patients` - patient profile updates.
- `src/modules/doctors` - doctor search, profile, availability, and slots.
- `src/modules/appointments` - patient booking and appointment queries.
- `src/modules/doctorAppointment` - doctor schedule actions.
- `src/modules/payments` - payment simulation and admin reports.
- `src/modules/locations` - location management.
- `src/modules/specialties` - specialty CRUD.
- `src/modules/ratings` - patient review system.
- `src/modules/notifications` - notifications and email jobs.

## Important Business Rules

### Appointment booking

- Only patients can book appointments.
- Booking requires `availabilityId`, `slotId`, and a future `appointmentDate`.
- The requested appointment date must fall on the same day of the week as the availability.
- The requested time must exactly match the slot start time.
- Duplicate non-cancelled appointments for the same availability/slot/date are prevented by a database partial unique index.
- Availability `is_booked` is not used as the primary booking source of truth.

### Appointment lifecycle

- Initial appointment status: `pending`.
- Confirmed by doctor.
- Completed after the appointment ends.
- Cancelled appointments are excluded from the unique booking constraint.

### Payments

- Payments are simulated through `POST /api/payments/simulate`.
- Only confirmed appointments can be paid.
- Payment uses the price preserved in `appointment.doctor_snapshot.price`.

### Availability and slots

- Doctors define day-based availability with `start_time`, `end_time`, and `slot_duration_minutes`.
- Slots are generated in minute units.
- Doctors cannot update or delete availability if active appointments exist.

## API Highlights

### Unauthenticated endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/auth/password-reset/verify`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`
- `POST /api/auth/resend-verification`
- `GET /api/doctors/:doctorId/available-slots?date=YYYY-MM-DD&locationId=<id>`

### Patient endpoints

- `POST /api/appointments`
- `PATCH /api/appointments/:id`
- `GET /api/appointments`
- `POST /api/payments/simulate`
- `GET /api/payments/appointment/:id`
- `GET /api/payments/me`
- `PATCH /api/patients/me`
- `GET /api/notifications`

### Doctor endpoints

- `GET /api/doctors`
- `GET /api/doctors/:doctorId`
- `POST /api/doctors/availability`
- `PATCH /api/doctors/availability/:availabilityId`
- `DELETE /api/doctors/availability/:availabilityId/slots/:slotId`
- `PATCH /api/doctors/profile`
- `POST /api/doctors/license`
- `GET /api/doctorAppointments`
- `POST /api/doctorAppointments/:appointmentId/confirm`
- `POST /api/doctorAppointments/:appointmentId/complete`
- `POST /api/doctorAppointments/:appointmentId/cancel`

### Admin endpoints

- `GET /api/users`
- `PATCH /api/users/:userid/block`
- `PATCH /api/users/:userid/unblock`
- `GET /api/specialties`
- `POST /api/specialties`
- `PATCH /api/specialties/:id`
- `DELETE /api/specialties/:id`
- `GET /api/specialties/deleted`
- `PATCH /api/specialties/:id/restore`
- `GET /api/payments`
- `GET /api/payments/revenue`
- `GET /api/ratings`
- `PATCH /api/ratings/:id/response`

## Notes for developers

- Keep controllers thin and push business rules into services.
- The notification helper deduplicates events by `event_key` and creates email jobs separately.
- `doctor_snapshot` ensures payment amounts remain fixed even if the doctor's displayed profile changes later.
- Appointment availability is evaluated at runtime against `Appointment` records, not `Availability.slots.is_booked`.

## Documentation

- `docs/PROJECT_FLOW.md` - project architecture and workflow audit.

## Next Improvements

- Add a dedicated API reference with request/response examples.
- Add tests for booking, availability, cancellation, and payment restrictions.
- Standardize `doctorAppointment` endpoint validation.
- Add stronger timezone handling in availability and slot calculation.
