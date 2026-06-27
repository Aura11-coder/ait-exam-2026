# AIT Career Exam 2026
## Aura Institute & Technology — Online Examination Portal

---

## 📁 Project Structure

```
ait-exam/
├── index.html              ← Landing page + Registration
├── exam.html               ← Exam interface
├── thankyou.html           ← Post-submission page
├── css/
│   └── style.css           ← All styles (glassmorphism theme)
├── js/
│   ├── api.js              ← API layer & storage helpers
│   ├── script.js           ← Landing page logic
│   ├── exam.js             ← Exam engine
│   ├── timer.js            ← Countdown timer
│   ├── security.js         ← Anti-cheat & fullscreen
│   └── questions.js        ← Question bank (50 MCQs)
├── assets/
│   └── logo.png            ← Aura Institute logo
└── google-apps-script/
    └── Code.gs             ← Google Apps Script backend
```

---

## 🚀 Setup Guide

### Step 1 — Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet named **"AIT Exam 2026 Database"**
3. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**SHEET_ID_HERE**/edit`

### Step 2 — Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Create a new project → Name it **"AIT Exam 2026 API"**
3. Paste the contents of `google-apps-script/Code.gs`
4. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
5. Click **Run → setupSheets** (authorize when prompted) to create sheet headers
6. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** → copy the Web App URL

### Step 3 — Connect Frontend to API
1. Open `js/api.js`
2. Find this line:
   ```js
   SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec',
   ```
3. Replace with your deployment URL

### Step 4 — Deploy to GitHub Pages
1. Create a GitHub repository
2. Upload all files (maintaining folder structure)
3. Go to **Settings → Pages → Source: main branch → / (root)**
4. Your exam portal will be live at `https://yourusername.github.io/repo-name/`

---

## ⚙️ Customization

### Change exam duration
In `js/api.js`:
```js
EXAM_DURATION_MINUTES: 90,   // Change to desired minutes
TOTAL_QUESTIONS: 50,          // Number of questions per exam
```

### Add more questions
In `js/questions.js`, add to the `QUESTION_BANK` array:
```js
{
  id: 51, subject: 'Your Subject',
  text: 'Your question here?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  _c: 'b'  // Correct answer: a=1st, b=2nd, c=3rd, d=4th option
}
```

### Change warning limit
In `js/api.js`:
```js
WARNING_LIMIT: 3,  // Auto-submit after this many violations
```

---

## 🔒 Security Features

| Feature | Status |
|---|---|
| Right-click disabled | ✅ |
| Copy/Paste/Cut blocked | ✅ |
| Text selection disabled | ✅ |
| Ctrl+C/V/U/P/S blocked | ✅ |
| F12 / DevTools blocked | ✅ |
| Tab switch detection | ✅ |
| Window blur detection | ✅ |
| Fullscreen enforcement | ✅ |
| Browser back blocked | ✅ |
| Page refresh detection | ✅ |
| Auto-submit on violations | ✅ |
| All events logged to GSheet | ✅ |

---

## 📊 Google Sheet Columns (Registrations tab)

| # | Column | Description |
|---|---|---|
| A | Timestamp | Registration time |
| B | Name | Full name |
| C | Email | Email address |
| D | Phone | Phone number |
| E | College | Institution |
| F | District | District |
| G | Course | Course interested |
| H | Start Time | Exam start |
| I | End Time | Exam end |
| J | Duration | Time taken |
| K | Score | Correct answers |
| L | Percentage | Score % |
| M | Scholarship | Scholarship tier |
| N | Questions Attempted | Total attempted |
| O | Correct | Correct count |
| P | Wrong | Wrong count |
| Q | Tab Switch Count | Security log |
| R | Fullscreen Exit Count | Security log |
| S | Copy Attempts | Security log |
| T | Paste Attempts | Security log |
| U | Refresh Attempts | Security log |
| V | DevTools Attempts | Security log |
| W | Warnings | Total warnings |
| X | Status | SUBMITTED / AUTO_SUBMITTED |
| Y | Browser | Browser info |
| Z | OS | Operating system |
| AA | Device | Desktop/Mobile |

---

## 🎓 Scholarship Tiers

| Score | Benefits |
|---|---|
| 90%+ | FREE Course + FREE Internship + FREE Certificate |
| 75–89% | 50% Scholarship + FREE Internship |
| Below 75% | 25% Scholarship + 50% Internship Offer |

---

## 📞 Contact

**Aura Institute & Technology**  
🌐 www.aurainstitute.co.in  
📧 info@aurainstitute.co.in

---

*AIT Career Exam 2026 — All Rights Reserved*
