# Email Window Flow

## Overview
The email window lets users send documents (BOLs, invoices) to contacts at
companies involved in a transaction. It shows company cards with contacts
and their email addresses, grouped by role in the transaction.

## Screenshot
See: library/email-window-screenshot.png
- Left (blue box): context company (Ingles Markets) with contacts + role badges
- Right (yellow boxes): other companies (Mama Jean's Farm, Life Family Farms)
- BOL document visible underneath

## Source Files
Copies in: library/email-window-source/
- newbol.htm — BOL document page (host page, opens email iframe)
- docsupport.js — document infrastructure (emailList, email_it, pdf_it, prntData)
- support.js — Clipper-style utilities (format1000, trim, whatKindOfBox3)
- emaillist.php — email window UI (439 lines, runs in iframe)
- al.prg — Clipper data engine (THEARAP→PULP→PEMAIL join)

## Testing with testharness.html

testharness.html simulates the opener window (_app) so the full chain
runs without needing the production application.

- Source: c:/clients/willdev/testharness.html
- URL: n2ag.com/willdev/testharness.html (basic auth george:matt)
- Loads tempdata.js (test data: Ingles Markets → American Cold Storage Texas, watermelons, 495 units)
- Sets opener variables: theWholeLoad, theLoad, Apallet, AlotPallet, Mext, MuserName

### Running via pMaster (localhost:3001)

```bash
# 1. Check pMaster is up
curl -s localhost:3001/status

# 2. Navigate to testharness
curl -s -X POST localhost:3001/navigate -H "Content-Type: application/json" \
  -d '{"url":"http://n2ag.com/willdev/testharness.html"}'

# 3. Click "Open Bill of Lading Document" — opens newbol.htm popup
curl -s -X POST localhost:3001/play -H "Content-Type: application/json" \
  -d '{"name":"testharness","params":{"click":"bol"}}'

# 4. Switch to the BOL tab
curl -s -X POST localhost:3001/switch-page -H "Content-Type: application/json" \
  -d '{"index": 2}'

# 5. Click the envelope icon (top-right) to open email window iframe
curl -s -X POST localhost:3001/evaluate -H "Content-Type: application/json" \
  -d '{"code":"document.querySelector(\"[onclick*=email]\").click(); \"clicked\""}'

# 6. Screenshot the result
curl -s -X POST localhost:3001/screenshot -H "Content-Type: application/json" \
  -d '{"name":"email-window.png"}'
# → c:/clients/logs/puppeteer/email-window.png
```

This exercises the full chain: testharness → newbol.htm → emaillist.php → AL.EXE → PULP/PEMAIL data rendered live.

## Architecture

```
testharness.html (opener — sets loadObj vars, simulates _app)
  └── newbol.htm?abc=B (popup — BOL document)
        ├── support.js (utilities)
        ├── docsupport.js (prntData, emailList(), email_it())
        └── hidden iframe: emaillist.php?{query}
              └── AL.EXE → answer.txt → thisComp[]/thoseComp[]
```

## Data Flow

### 1. BOL Opens (newbol.htm)
- Gets load data from `opener` window: loadObj.theLoad, theWholeLoad, theTrack
- Populates BOL form from ORDHEAD fields (company names, addresses, line items)
- Loads country-of-origin via `coo.php`
- Calls `emailList()` from docsupport.js — creates hidden iframe

### 2. emailList() Builds the Iframe (docsupport.js:92-109)
```javascript
emailList(Mload, Mext, abc, theWholeLoad)
// Builds iframe URL:
// /n2ag/prostan/emailList.php?{dataset}---{load}---{abc}---{A~ID_NO,B~ID_NO,...}
// dataset from: loadObj.theTrack.DATASET
// company codes from: iterating theWholeLoad, joining {abc}~{ORDHEAD.id_no}
```

### 3. User Clicks Envelope Icon
- `email()` → `$('#emailFrame').show()` — reveals the iframe
- `closeEmail()` → `$('#emailFrame').hide()` — hides it

### 4. emaillist.php Loads (inside iframe)
```
Query: willdev---29621---A---A~INGLES,B~MAMAJ,C~LIFEFA,D~ARMSTR,E~INGLES
         │        │      │   │
         │        │      │   └── Company codes (letter~ID_NO pairs)
         │        │      └────── Context company (which letter "owns" the doc)
         │        └───────────── Invoice/shipper number
         └────────────────────── Dataset
```
- PHP parses query, builds command: `al {dataset} {load} {context} "{codes}"`
- Logs to lastAl.txt, exec()s AL.EXE, readfile()s answer.txt into `<script>` tag

### 5. AL.EXE Runs (compiled from al.prg)
- Opens: THEARAP (index x1arap), PULP (index x1pulp), PEMAIL (index x1pemail)
- Parses company code list into arrays aId_no[] and aAbc[]
- First pass: context company (Mabc match) → `thisComp.push({...})`
- Second pass: other companies → `thoseComp.push({...})`
- For each company: seeks THEARAP → company info, then PULP → contacts, then PEMAIL → emails
- Writes nested JavaScript to answer.txt

### 6. Output Structure
```javascript
var thisComp=[];    // Context company (blue box, left)
var thoseComp=[];   // Other companies (yellow boxes, right)

thisComp.push({
  DATASET, ID_NO, ID_NAME, SHORT,
  ADDRESS1, ADDRESS2, ADDRESS3, ZIP,
  TELEPHONE, SALESPHONE, SALESFAX, ACCTPHONE, ACCTFAX,
  pulp: [
    { NAME, PULP, EMAIL: [{ LABEL, EMAIL }, ...] },
    ...
  ]
});
```

### 7. User Sends Email
- Clicks green send button next to an email address
- `emailThis(obj)` captures: name, email, subject, pulpId, dataset, companyId, companyName
- Gets sender info from `window.top.Ouser` (fullname, email)
- Sets fields on `parent.prntData` (crosses iframe boundary)
- Calls `parent.email_it(callback)` → POSTs to `../saveandemail.php`
- On success: send button changes to thumbs-up icon

### 8. saveandemail.php (docsupport.js:14-31)
```javascript
email_it(cb) {
  prntData.LOAD = loadObj.mload;
  prntData.WHO = loadObj.userName;
  prntData.EXT = loadObj.ext;
  prntData.LEVEL = 3;  // 3 = email, 2 = pdf
  prntData.ABC = loadObj.Mabc;
  prntData.THECODE = $('#DocContent')[0].innerHTML;
  // POSTs JSON to ../saveandemail.php
}
```

## CRUD Operations (emaillist.php, via $.getScript)
| Action | URL | Callback |
|--------|-----|----------|
| Add Person | addPerson.php?{dataset}---{id_no}---{name}--- | personAdded() → reload |
| Add Email | addEmail.php?{dataset}---{pulp}---{label}---{email}--- | emailAdded() → reload |
| Delete Email | delEmail.php?{dataset}---{pulp}---{label}---{email}--- | emailDeleted() → reload |
| Delete Contact | delContact.php?{dataset}---{pulp}--- | contactDeleted() → reload |

All CRUD goes: `$.getScript('http://n2ag.com/prostan/...')` → PHP → exec() → compiled EXE → DBF.

## Company Types (support.js:whatKindOfBox3)
The load contains multiple companies with different roles:
- **F** = truck (headtype='F') — motor carrier
- **B** = broker (headtype='B') — truck broker
- **invoice** = the seller/shipper
- **po** = purchase order buyer
- **storereq** = store requisition
- **inventory** = inventory record

## Button Panel (docsupport.js:68-90)
Three icons in the right column of the BOL:
- Envelope → `prePrint(); email()` — show email window
- Print → `prePrint(); pdf_it()` — generate PDF via saveandemail.php
- Download → `downloadIt()` — placeholder

## prntData Fields (set by emailThis in emaillist.php)
```
PRINT_NAME, PRINT_EMAIL, PRINT_SUBJECT
PRINT_FROMNAME, PRINT_FROMEMAIL
PRINT_PULPID, PRINT_PULPNAME
PRINT_COMPANYID, PRINT_COMPANYNAME, PRINT_DATASET
PRINT_DOCNAME (set by newbol.htm: "{load}_bol")
SUBJECT ("{load} Bill of Lading")
LOAD, WHO, EXT, ABC, LEVEL, THECODE (HTML)
LEFTMAR, RIGHTMAR, TOPMAR, BOTTOMMAR, ZOOM
FOOTFONTNAME, FOOTFONTSIZE, FOOTLEFT, FOOTCENTER, FOOTRIGHT
```

## emailListAPI.php (15 lines — likely unused)
Same PHP as emaillist.php header but returns only JavaScript data
with Content-Type: text/javascript. No HTML. emaillist.php does not call it.

## Redis Cache Layer
pulp2redis.js loads PEMAIL.JSN + PULP.JSN into Redis:
- Key pattern: `pemail:{dataset}:{email}`
- Value: JSON array of `pulpId:name:id_no` strings
- Used for email-to-company lookups in document processing
