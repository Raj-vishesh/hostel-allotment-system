# Hostel Allotment System — Progress Log

---

## Day 1 — Project Setup
**Kya banaya:** Backend (Express) + Frontend (React+Vite+Tailwind) setup, MySQL mein 5 tables banayi (users, students, rooms, preferences, allotments), backend ko DB se connect kiya.

**Concepts seekhe:**
- Connection pool — multiple DB connections ready rakhta hai, reuse hote hain (fast/efficient)
- Middleware (`cors`, `express.json()`) — request route tak pahunchne se pehle chalta hai
- `.env` file — secrets code se alag rakhne ke liye

**Bugs/Errors:**
- Tailwind v4 accidentally install ho gaya (`init -p` error) — `tailwindcss@3` explicitly install karke fix kiya

---

## Day 2 — JWT + bcrypt Theory
**Kya seekha:** Password security aur authentication ka poora theory, koi code nahi likha.

**Concepts seekhe:**
- Hashing (one-way, irreversible) vs Encryption (two-way, reversible)
- bcrypt jaan-boojh kar slow hai — brute-force attacks mushkil ho jate hain
- Salt — same password ke bhi different hash banata hai (rainbow table attacks se bachata hai)
- Session-based auth (server state store karta hai) vs JWT (stateless, khud-nirbhar token)
- JWT structure: Header.Payload.Signature — payload sirf encoded hota hai (encrypted nahi), isliye sensitive data (password) kabhi payload mein nahi daalte

**Quiz:** 100% score

---

## Day 3 — Register API
**Kya banaya:** Register API — naya user create karta hai, password bcrypt se hash karke store karta hai.

**Concepts seekhe:**
- Controller-Route pattern — Controller mein logic, Route mein URL mapping (code organized rehta hai)
- `express.Router()` — alag-alag features (auth, rooms) ke routes alag files mein rakhne deta hai
- Parameterized queries (`?` placeholders) — SQL Injection se bachata hai
- `bcrypt.hash(password, 10)` — `10` = salt rounds, jitna zyada utna secure/slow
- `module.exports`/`require` destructuring (`{ }`)

**Bugs/Errors:**
- Typo: `requirre` likha tha `require` ki jagah
- Postman mein method GET tha (POST hona chahiye tha) → 404 error — seekha ki Express route match karte waqt method + path dono check karta hai

---

## Day 4 — Login API + JWT
**Kya banaya:** Login API — email/password verify karta hai, sahi hone par JWT token generate karta hai.

**Concepts seekhe:**
- `bcrypt.compare(plainPassword, storedHash)` — login ke time password verify karta hai (reverse nahi, compare karta hai)
- `jwt.sign(payload, secret, options)` — token banata hai; `expiresIn` se token ki validity set hoti hai
- Generic error message ("Invalid credentials") — email exist karta hai ya nahi ye leak nahi karte (security best practice)
- Status codes: `401` = Unauthorized (auth fail), `400` = Bad Request (validation fail)

**Bugs/Errors:**
- Server temporarily crash hua tha (nodemon restart ke beech request bhej di thi)
- Postman URL bar mein galti se "post" word type ho gaya (method dropdown se select karna tha, URL mein nahi) — seekha Method dropdown aur URL bar alag cheezein hain

