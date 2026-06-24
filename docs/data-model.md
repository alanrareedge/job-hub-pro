# Job Hub Pro Data Model

## Business

Represents each trades business using the platform.

Fields:
- id
- business_name
- phone
- email
- address
- created_at

## User

Represents a person who can log in.

Fields:
- id
- business_id
- name
- email
- role
- created_at

Roles:
- owner
- office
- operative

## Customer

Represents a customer of the trades business.

Fields:
- id
- business_id
- first_name
- last_name
- email
- phone
- notes
- created_at

## Property

Represents a property linked to a customer.

Fields:
- id
- business_id
- customer_id
- address_line_1
- address_line_2
- town
- postcode
- notes
- created_at

## Job

Represents a job carried out at a property.

Fields:
- id
- business_id
- customer_id
- property_id
- assigned_user_id
- title
- description
- status
- job_value
- deposit_amount
- balance_due
- scheduled_date
- completed_date
- access_notes
- internal_notes
- created_at

Statuses:
- new
- scheduled
- in_progress
- awaiting_signoff
- completed
- invoiced
- paid
- cancelled

## Job Note

Fields:
- id
- business_id
- job_id
- user_id
- note
- created_at

## Job Photo

Fields:
- id
- business_id
- job_id
- uploaded_by_user_id
- file_url
- caption
- created_at

## Material Used

Fields:
- id
- business_id
- job_id
- name
- quantity
- unit_cost
- total_cost
- created_at

## Sign-Off

Fields:
- id
- business_id
- job_id
- customer_name
- signature_url
- comments
- signed_at

## Payment

Fields:
- id
- business_id
- job_id
- amount
- payment_type
- status
- paid_at
- created_at

Payment types:
- deposit
- balance
- full_payment

Payment statuses:
- requested
- paid
- overdue

## Activity Log

Fields:
- id
- business_id
- user_id
- entity_type
- entity_id
- action
- details
- created_at