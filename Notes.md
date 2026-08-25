 ## Day 1 (22 Aug 2026):

- **Kya kiya** : Backend + frontend setup complete, MySQL 5 tables banayi, 
  Express server + DB connect kiya, Tailwind configure kiya
- **Naya kya seekha**: connection pool, middleware, Tailwind v3 vs v4 ka difference, 
  npm package versioning (@3 se specific version install karna)
- Stuck kahan hua: Tailwind v4 accidentally install ho gaya tha (init -p error), 
  v3 explicitly install karke fix kiya
- Kal kya karna hai: JWT + bcrypt ka concept samajhna


 ## Day 2 (23 Aug 2026):
- Kya kiya: JWT + bcrypt concept theory se samjha (pure theory day, no code)
- Naya kya seekha: 
  - Hashing vs Encryption (one-way vs two-way)
  - bcrypt slow kyun hai (brute-force resistance) + salt kya karta hai
  - Session-based vs JWT-based auth, "stateless" ka matlab
  - JWT ke 3 parts: Header, Payload, Signature — signature security kaise deta hai
- Quiz: 100% score, concepts clear
- Kal kya karna hai: Actual code likhna shuru — Register API (bcrypt se password hash karna)


## Day 3 (26 Aug 2026) — Register API

### Kya Banaya
Register API — naya user create karta hai, password securely hash karke store karta hai.

### Files Banayi
- controllers/authController.js → register logic
- routes/authRoutes.js → URL route define kiya
- index.js → route ko app mein connect kiya

### Naye Concepts Seekhe

**1. Controller-Route Pattern (MVC jaisa)**
- Controller = actual logic (kya karna hai)
- Route = URL mapping (kis URL pe kya chalega)
- Isse code organized rehta hai, sab kuch ek file mein nahi thoosa

**2. express.Router()**
- Mini-app jaisa hota hai, alag-alag feature (auth, rooms, etc.) ke routes 
  alag files mein rakhne deta hai

**3. module.exports / require destructuring**
- `module.exports = { register }` → ek object export kiya
- `const { register } = require(...)` → us object se specific 
  cheez nikaali (destructuring)

**4. HTTP Methods Route Matching**
- Express route match karte waqt METHOD + PATH dono check karta hai
- GET vs POST alag treat hote hain, chahe URL same ho
- Isi wajah se 404 aaya tha jab method galat tha (GET tha, POST hona chahiye tha)

**5. Parameterized Queries (?)**
- `WHERE email = ?` — ye SQL Injection se bachata hai
- Values array mein alag se bhejte hain, directly string mein nahi jodte

**6. bcrypt.hash(password, 10)**
- 10 = salt rounds, jitna zyada utna secure/slow
- Result hamesha ek scrambled hash hota hai, reversible nahi

### Errors Jo Aaye Aur Fix Kiye
- Typo: `requirre` likha tha `require` ki jagah
- Postman mein method GET tha, POST karna tha (isse 404 aaya) — 
  ye samjha ki Express route match karte waqt method bhi check karta hai

### Kal Kya Karna Hai
Login API — bcrypt se password verify karna, JWT token generate karna