# Email Window Flow

## Overview
The email window (emaillist.php + al.prg) shows contacts for companies involved
in a transaction, with their email addresses grouped by company.

## Data Flow
```
emailListAPI.php
  receives: dataset, load params (comma-separated company list)
  calls: AL.EXE dataset load abc data
  reads: answer.txt (AL.EXE output)
  returns: JavaScript with thisComp[] and thoseComp[] arrays

AL.EXE (compiled from al.prg)
  opens: THEARAP (companies), PULP (people), PEMAIL (emails)
  parses: comma-separated data "A,123456,B,234567,C,345678"
  for each company:
    seeks THEARAP for company info (name, address, phones, faxes)
    seeks PULP for contacts at that company (dataset+id_no)
    for each contact:
      seeks PEMAIL for emails (dataset+pulp)
    builds nested JSON: company → contacts → emails
```

## Output Structure
```javascript
thisComp.push({
  DATASET, ID_NO, ID_NAME, SHORT,
  ADDRESS1, ADDRESS2, ADDRESS3, ZIP,
  TELEPHONE, SALESPHONE, SALESFAX, ACCTPHONE, ACCTFAX,
  pulp: [
    { NAME, PULP, EMAIL: [{ LABEL, EMAIL }, ...] },
    ...
  ]
})
```

## Web UI (emaillist.php)
- Displays company cards with contacts and emails
- Modal forms for: Add Person, Add Email, Delete Email, Delete Contact
- All modifications go through PHP → compiled EXE → DBF
- Page reloads after each change

## PHP Thin Wrappers
| PHP File | EXE Called | DBF Modified |
|----------|-----------|--------------|
| addperson.php | ADDPER.EXE | PULP.DBF |
| addemail.php | ADDMAIL.EXE | PEMAIL.DBF |
| delemail.php | DELMAIL.EXE | PEMAIL.DBF |
| delcontact.php | DELCONT.EXE | PULP.DBF |
| emailListAPI.php | AL.EXE | (read-only) |

## Redis Cache Layer
pulp2redis.js loads PEMAIL.JSN + PULP.JSN into Redis:
- Key pattern: `pemail:{dataset}:{email}`
- Value: JSON array of `pulpId:name:id_no` strings
- Used for email-to-company lookups in document processing
