# Hostel Allotment System — Progress Log

---  git add .
     git commit -m "Day 5: Auth middleware for JWT verification, protected route tested"
     git push

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

## Day 5 — Auth Middleware
**Kya banaya:** JWT verify karne wala middleware, aur ek protected test route (`/profile`).

**Concepts seekhe:**
- Middleware `next()` function se control agle step ko pass karta hai — agar `next()` na bulaye to request wahi ruk jati hai
- Route mein multiple functions chain kar sakte hain: `router.get(path, middleware, handler)`
- `Authorization: Bearer <token>` header format — standard convention hai
- `jwt.verify(token, secret)` — signature check karta hai, valid hone par payload return karta hai
- `req.user = decoded` — middleware se controller tak data pass karne ka tarika (bina dobara DB query kiye)

**Bugs/Errors:**
- ECONNREFUSED baar baar aaya — server/nodemon restart ke beech request bhej dete the (timing issue, code ki galti nahi thi)
- Postman ka apna internal crash "Body" tab kholne par GET request mein — Body tab ki zarurat hi nahi thi is route ke liye, seedha Headers use kiya

## Day 6 -- Revision

## Day 7 — Rooms CRUD (Backend)
**Kya banaya:** Room Create, Read, Delete APIs — admin room add/delete kar sake, sab room list dekh sakein.

**Concepts seekhe:**
- CRUD (Create, Read, Update, Delete) — har app ka basic data pattern
- REST API convention — same URL (`/api/rooms`), different HTTP methods se alag operations
- `req.params` — URL ke andar se dynamic value nikaalta hai (jaise `:id`), `req.body` se alag
- Middleware selectively lagana — Create/Delete protected (verifyToken), Read public rakha

**Bugs/Errors:**
- `app.use()` lines `const app = express()` se pehle likh di thi — "Cannot access 'app' before initialization" error. Seekha: JS top-to-bottom execute hoti hai, variable use karne se pehle define hona chahiye
- MySQL Server band ho gaya tha (laptop restart ki wajah se) — `ECONNREFUSED 3306` error aaya login mein bhi. Services se MySQL start karke fix kiya

## Day 8 — Frontend: Login + Add Room Form
**Kya banaya:** Login page aur Room-Add page (React), dono backend APIs se connected.

**Concepts seekhe:**
- Controlled components — `useState` + `value` + `onChange` se form input control karna
- `fetch()` se backend API call karna — method, headers, body kaise structure karte hain
- `e.preventDefault()` — form submit pe page reload rokta hai
- `localStorage` — token persist karne ke liye (setItem/getItem)
- Template literals (`` `Bearer ${token}` ``) — string ke andar variable daalne ka clean tarika
- Conditional rendering (`{error && <p>...}`) aur dynamic className (ternary se)

**Bugs/Errors:**
- `localStorage.setItem('token', data.user.role)` — dusri line mein galti se key `'token'` hi rakh diya (`'role'` hona chahiye tha), isse token overwrite ho gaya. Seekha: same key use karne se pehli value replace ho jati hai
- App.jsx mein temporary syntax error (component switch karte waqt)

## Day 9 — Room List Display (Frontend)
**Kya banaya:** RoomList page — saare rooms card-grid format mein dikhata hai, backend se fetch karke.

**Concepts seekhe:**
- `useEffect(() => {...}, [])` — component load hote hi automatically code chalata hai (khali dependency array = sirf ek baar)
- `useEffect` ke andar async function alag banate hain (direct async allowed nahi hai useEffect callback mein)
- `.map()` — array ke har element se JSX bana deta hai (list render karne ka tarika)
- `key={room.id}` — list render karte waqt har item ko unique key deni zaroori hai (React ke liye)
- `try/catch/finally` — finally hamesha chalta hai, success ho ya error (loading state clear karne ke liye use kiya)
- Tailwind responsive classes (`md:grid-cols-2`, `lg:grid-cols-3`) — screen size ke hisaab se layout badalta hai

**Bugs/Errors:**
- Import naam aur usage naam mismatch tha (`import AddRoom from './pages/RoomList'` lekin `<RoomList />` use kiya) — fix kiya consistent naam rakh ke

## Day 10 — Preferences API (Backend)
**Kya banaya:** Preferences Submit aur Get APIs — student apni ranked room choices bhej sake.

**Concepts seekhe:**
- SQL JOIN — do tables ko common column se jodkar ek query mein combined data lana
- `req.user.userId` — middleware se pehle se verified user ki info reuse karna
- `for...of` loop — array ke har element pe async operation (DB insert) chalane ke liye
- `Array.isArray()` — validate karna ki input array hai ya nahi

**Bugs/Errors:**
- `express.json()` middleware order/missing hone se `req.body` undefined aa raha tha
- Token expire/mismatch ki wajah se 401 aaya — fresh login se fix hota hai

## Day 11 and 12 — Preference Form (Frontend)
**Kya banaya:** PreferenceForm page — student rooms dekh ke unhe rank de sake, backend ko submit ho.

**Concepts seekhe:**
- Object state (`ranks = {}`) — har room ki rank ko `room_id` key se track karna
- Spread operator (`...prev`) — state update karte waqt purani values preserve karna
- `Object.entries()` — object ko array mein convert karna taaki `.filter()`/`.map()` use ho sake
- Dynamic object key (`[roomId]: value`) — variable se key naam banana

**Bugs/Errors:**
- Token expire/galat ho gaya tha switch karte waqt — fresh login se fix hua
- Background color off dikh raha tha (browser extension ki wajah se, Tailwind sahi tha)

## Day 15 — Gale-Shapley Algorithm (Code)
**Kya banaya:** `galeShapley.js` — standalone function jo student preferences aur room capacities leke stable matching return karta hai. Sample data pe test kiya, manual trace se match kiya.

**Concepts seekhe:**
- `for...in` (object keys pe loop) vs `for...of` (array elements pe loop)
- `while` loop — condition-based, jab tak free students bache hain
- `.filter()` se array se specific item hatana
- `continue` keyword — loop ko turant agle iteration pe le jana
- Object keys hamesha strings hoti hain (chahe number jaisi dikhein)
- Simplified Gale-Shapley — rooms "prefer" nahi karte, sirf capacity ke hisaab se accept/reject karte hain

**Bugs/Errors:**
- Test file create nahi ki thi, sirf dekhi thi — "Module not found" error. Seekha: code dekhna aur file banana alag cheezein hain


## Day 16 — Gale-Shapley Edge Cases (Complete)

Saare 4 edge cases test kiye: students>capacity, rooms>students, multi-capacity rooms, 
same-first-preference competition. Sab sahi result de rahe hain.

## Day 18 — Match Trigger API
**Kya banaya:** `POST /api/match/run` — DB se preferences+rooms nikaal ke Gale-Shapley chalata hai, result `allotments` table mein save karta hai.

**Concepts seekhe:**
- Database rows ko algorithm-friendly format (object) mein convert karna — real-world common pattern
- `if (!obj[key])` pattern — object mein dynamically array banane ke liye
- `ORDER BY col1, col2 ASC` — multi-level SQL sorting
- Nested loops (`for...in` ke andar `for...of`) — nested data structure (object of arrays) process karne ke liye

**Result:** Test kiya real DB data se — matchedCount aur allotments table dono sahi update hue