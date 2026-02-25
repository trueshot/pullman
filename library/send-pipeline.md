# Send Pipeline — What Happens When You Click the Green Button

## Overview

The green send button in the email window triggers a 4-stage pipeline that
transforms PULP identity data into a PDF document email with portal integration.
This document traces every step from click to delivery.

## The Button

Each contact email in the email window has a green send button with PULP
identity embedded as data attributes:

```html
<button class="btn btn-success btn-xs"
  data-email="george@produceflow.com"
  data-name="George Burt"
  data-subject="Load: 29621"
  data-pulp="123820"
  data-dataset="willdev"
  data-companyid="INGLES"
  data-companyname="Ingles Markets"
  onclick="emailThis(this)">
```

## Stage 1: emailThis() — emaillist.php:397-436

**Where:** Inside the email window iframe (our code)
**Owner:** pullman

1. Disables button (prevents double-click)
2. Reads all data-* attributes from the clicked button
3. Gets sender info from `window.top.Ouser` (fullname, email)
4. Gets `parent.prntData` reference — crosses iframe → parent frame boundary
5. Sets identity fields on prntData:
   - PRINT_PULPID = 123820 (PULP code — person identity)
   - PRINT_DATASET = willdev
   - PRINT_COMPANYID = INGLES (PLUG code — company identity)
   - PRINT_COMPANYNAME = Ingles Markets
   - PRINT_NAME = George Burt
   - PRINT_EMAIL = george@produceflow.com
   - PRINT_SUBJECT = "Load: 29621"
   - PRINT_FROMNAME, PRINT_FROMEMAIL from Ouser
6. Calls `parent.email_it(callback)` — hands off to parent frame

## Stage 2: email_it() — docsupport.js:14-31

**Where:** Parent frame (newbol.htm)
**Owner:** not pullman (document infrastructure)

1. Adds load context to prntData:
   - LOAD = loadObj.mload
   - WHO = loadObj.userName
   - EXT = loadObj.ext
   - ABC = loadObj.Mabc
2. Sets LEVEL = 3 (email mode; LEVEL 2 = PDF only, LEVEL 1 = save only)
3. Captures BOL HTML: `$('#DocContent')[0].innerHTML`
4. POSTs `JSON.stringify({Data: prntData})` to `../saveandemail.php`

## Stage 3: saveandemail.php

**Where:** Server-side PHP
**Owner:** savoy (billet: savoyDocDelivery)

Three sequential operations:

### 3a. Save HTML

- Creates directory tree: `loads/prnthist/{LOAD}/{DATE}/{WHO}/{EXT}/`
- Writes BOL HTML to `{PRINT_DOCNAME}_{count}.htm`
- Auto-increments count to avoid overwriting previous sends

### 3b. Generate PDF

- Builds URL to saved HTML: `http://george:matt@n2ag.com/{dataset}/loads/prnthist/...`
- Runs wkhtmltopdf with margin/zoom/footer settings from prntData
- Output: `{PRINT_DOCNAME}_{count}.pdf` alongside the .htm
- Debug: writes command to `dcom.txt`, pdf path to `dcom1.txt`

### 3c. Prepare Email JSON + Launch sendemail.js

- Creates `email/` subdirectory in the prnthist path
- Writes `{count}.json` with all identity fields:

```json
{
  "name": "George Burt",
  "email": "george@produceflow.com",
  "subject": "29621 Bill of Lading",
  "fromName": "...",
  "fromEmail": "...",
  "pdfFile": "loads/prnthist/29621/20260225/.../29621_bol_1.pdf",
  "companyId": "INGLES",
  "companyName": "Ingles Markets",
  "pulpId": "123820",
  "pulpName": "George Burt",
  "abc": "B"
}
```

- Executes: `node nodejs/sendemail.js -c {pdfPath}`

## Stage 4: sendemail.js

**Where:** Server-side Node.js
**Owner:** savoy (billet: savoyDocDelivery)
**Email template:** emsworth (billet: emsworthEmailTemplates)

### 4a. Setup

- Parses PDF path from `-c` arg to locate `email/{count}.json`
- Reads the JSON written by saveandemail.php
- Loads company tracking data from `data/i_track.js`
- Connects to AWS SES (`d:/secrets/config.json`)

### 4b. Portal Cache

- Generates email token: random 32-char hex via `crypto.randomBytes(16)`
- Generates company token: SHA-256 of `{dataset}:{companyId}:portal_salt_2025`
- Creates `portal/cache/email/{emailToken}.json` — full identity + journey metadata
- Runs `i_emlpart {emailToken}` — updates DBF records
- Creates/updates `portal/cache/company/{companyToken}.json`:
  - Tracks document count per company
  - Stores up to 500 recent documents with full identity context

### 4c. Identity Check

- POSTs to `172.31.28.199:3006/api/check-prostan-partner` (Monkey server, verifyApi.js)
- Checks if recipient email is already a ProduceStandards.org registered partner
- Result determines email template:
  - **Registered partner** → existing user template (no upgrade prompt)
  - **New user** → upgrade prompt with contextual registration URL
- Graceful degradation: network errors, timeouts, parse errors all default to "new user"

### 4d. Email Construction

- Builds HTML via `createConditionalHtmlEmail()` (owned by emsworth)
- Template includes:
  - Document view link: `https://{dataset}.produceflow.com/portal/document/{docName}?token={emailToken}`
  - Company portal link: `https://{dataset}.produceflow.com/portal/company/{companyToken}`
  - ProduceStandards.org registration CTA (if new user)
  - Contextual upgrade URL with pre-populated: source, token, company, email, dataset, name, load, doctype
- Saves debug copy to `latest_debug_email.html` (viewable via testharness "Open Latest Email Template" button)
- Plain text fallback via `createPlainTextEmail()`

### 4e. Send via AWS SES

- From: sender's verified domain or `documents@produceflow.com` (fallback)
- Reply-To: actual sender email (separated from From for deliverability)
- Verified sending domains: produceflow.com, producestandards.org, prodicon.com, jungledevices.com
- Tags email with dataset for SES analytics

## Return to Browser

saveandemail.php returns:
```json
{"success": true, "link": "http://n2ag.com/{dataset}/loads/prnthist/.../29621_bol_1.pdf"}
```

Back in the iframe, emailThis's callback changes the green button icon
from envelope to thumbs-up.

## Testing End-to-End

With testharness running via pMaster (see --email-window facet):
1. Open BOL, click envelope icon to show email window
2. Click green send button next to george@produceflow.com
3. PDF is generated and emailed to george@produceflow.com
4. Debug email template saved to `latest_debug_email.html`
5. Testharness "Open Latest Email Template" button shows the sent email

## Crew Involvement

| Stage | Owner | What They Own |
|-------|-------|---------------|
| 1. emailThis | **pullman** | PULP identity → prntData handoff |
| 2. email_it | (document infra) | BOL HTML capture, AJAX POST |
| 3. saveandemail.php | **savoy** | HTML save, PDF generation, email JSON |
| 4. sendemail.js | **savoy** | Portal cache, identity check, SES send |
| 4. emailTemplate.js | **emsworth** | HTML/text email template rendering |
| 4. verifyApi.js | (Monkey server) | ProStan partner identity lookup |

## File Locations

- emaillist.php: c:/clients/prostan/emaillist.php (pullman)
- docsupport.js: c:/clients/willdev/docs/docsupport.js
- saveandemail.php: c:/clients/willdev/saveandemail.php (savoy)
- sendemail.js: c:/clients/willdev/nodejs/sendemail.js (savoy)
- emailTemplate.js: c:/clients/willdev/nodejs/emailTemplate.js (emsworth)
