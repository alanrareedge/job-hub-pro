# Job Hub Pro Data Model

## Purpose

This document defines the first MVP data model for Job Hub Pro.

The MVP supports one simple operating loop:

1. Create customer
2. Add property
3. Create job
4. Schedule job
5. Assign operative
6. Add notes, photos and materials
7. Capture customer sign-off
8. Mark job complete
9. Track payment
10. Keep a full activity history

The MVP supports one scheduled visit per job.

---

## Business

Represents each trades business using the platform.

Fields:

* id
* business_name
* phone
* email
* address
* created_at
* updated_at

---

## User

Represents a person who can log in.

Fields:

* id
* business_id
* name
* email
* role
* is_active
* archived_at
* created_at
* updated_at

Roles:

* owner
* office
* operative

---

## Customer

Represents a customer of the trades business.

Fields:

* id
* business_id
* created_by_user_id
* first_name
* last_name
* email
* phone
* notes
* archived_at
* created_at
* updated_at

---

## Property

Represents a property linked to a customer.

Fields:

* id
* business_id
* customer_id
* created_by_user_id
* address_line_1
* address_line_2
* town
* postcode
* notes
* created_at
* updated_at

---

## Job

Represents a job carried out at a property.

Fields:

* id
* business_id
* customer_id
* property_id
* assigned_user_id
* created_by_user_id
* job_number
* title
* description
* job_status
* payment_status
* job_value
* deposit_amount
* balance_due
* scheduled_start_at
* completed_at
* access_notes
* internal_notes
* archived_at
* created_at
* updated_at

Job statuses:

* new
* scheduled
* in_progress
* awaiting_signoff
* completed
* cancelled

Payment statuses:

* not_requested
* requested
* part_paid
* paid
* overdue

Notes:

* Job status and payment status must remain separate.
* A job can be completed but unpaid.
* The activity log records job status changes.

---

## Job Note

Represents a note added to a job.

Fields:

* id
* business_id
* job_id
* user_id
* created_by_user_id
* note
* created_at
* updated_at

---

## Job Photo

Represents a photo uploaded against a job.

Fields:

* id
* business_id
* job_id
* uploaded_by_user_id
* created_by_user_id
* file_url
* caption
* created_at
* updated_at

---

## Material Used

Represents materials recorded against a job.

Fields:

* id
* business_id
* job_id
* created_by_user_id
* name
* quantity
* unit_cost
* total_cost
* created_at
* updated_at

---

## Sign-Off

Represents a customer sign-off for a job.

Fields:

* id
* business_id
* job_id
* created_by_user_id
* customer_name
* signature_url
* comments
* job_status_at_signing
* signed_job_summary_snapshot
* signed_at
* created_at
* updated_at

Notes:

* The signed job summary snapshot must record what the customer was signing at the time.
* This protects the business if the job details change later.
* The signature should be stored as an image or file URL.

---

## Payment

Represents a payment record linked to a job.

Fields:

* id
* business_id
* job_id
* created_by_user_id
* amount
* payment_type
* payment_status
* paid_at
* created_at
* updated_at

Payment types:

* deposit
* balance
* full_payment

Payment statuses:

* requested
* paid
* overdue

---

## Activity Log

Represents a permanent audit trail of important system activity.

Fields:

* id
* business_id
* user_id
* entity_type
* entity_id
* action
* details
* created_at

Details:

* details should be stored as structured JSON.
* It should capture useful change information, not just plain text.

Example activity events:

* customer_created
* property_created
* job_created
* job_status_changed
* payment_status_changed
* note_added
* photo_uploaded
* material_added
* signoff_captured
* payment_recorded

---

## Key Rules

1. Every major record belongs to a business.
2. Users only see data from their own business.
3. Jobs are the central record.
4. Customers can have multiple properties.
5. Properties can have multiple jobs.
6. Jobs can have notes, photos, materials, sign-offs and payments.
7. Job status and payment status are separate.
8. Records should be archived, not hard-deleted.
9. Activity logging should be built from the beginning.
10. The MVP supports one scheduled visit per job.
