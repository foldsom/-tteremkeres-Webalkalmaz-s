# 🍽️ Étteremkereső Webalkalmazás

**Készítők:**  
Villás Attila  
Czövek Dominik  
Földi Soma  

---

## 📌 Projekt leírása
Az Étteremkereső egy webalapú alkalmazás, amely segít a felhasználóknak megtalálni az ízlésüknek megfelelő éttermeket. Az alkalmazás támogatja a felhasználói fiókok kezelését, éttermek kedvencekhez adását, értékelések és vélemények írását, valamint térképes megjelenítést.

A projekt ASP.NET alapú backenddel és SQLite relációs adatbázissal készül.

---

## 🎯 Funkcionális követelmények

### Felhasználói fiók
- Regisztráció
- Bejelentkezés és kijelentkezés
- Jelszavak biztonságos tárolása

### Preferenciák
- Regisztráció során étkezési preferenciák megadása
- Preferenciák tárolása és módosítása
- Étteremajánlások a preferenciák alapján

### Éttermek
- Éttermek listázása
- Étterem részletező oldal
- Éttermek kedvencekhez adása
- Értékelés (1–5)
- Szöveges vélemény írása

### Térkép és képek
- Éttermek megjelenítése térképen
- Éttermekhez tartozó képek megjelenítése

---

## 🛠️ Technológiai háttér

### Backend
- ASP.NET
- Web API architektúra

### Adatbázis
- SQLite
- Relációs adatmodell

### Frontend
- Webes felhasználói felület
- Backend API-val kommunikál

---

## 🗄️ Adatbázis felépítés (egyszerűsített)

### Felhasználók
- id
- felhasználónév
- email
- jelszó (hash)
- étkezési preferenciák
- létrehozás dátuma

### Éttermek
- id
- név
- leírás
- cím
- kategóriák
- földrajzi koordináták
- képek
- létrehozás dátuma

### Értékelések
- id
- felhasználó azonosító
- étterem azonosító
- értékelés
- vélemény
- létrehozás dátuma

### Kedvencek
- felhasználó azonosító
- étterem azonosító

---

## 🚀 Fejlesztési ütemterv

1. ASP.NET projekt létrehozása
2. SQLite adatbázis kialakítása
3. Regisztráció és bejelentkezés
4. Preferenciák kezelése
5. Éttermek listázása és részletezése
6. Kedvencek és értékelések
7. Térképes megjelenítés
8. Tesztelés és dokumentáció

---

## ▶️ Gyors indítás (frontend + backend)

Az alábbi lépésekkel egyből el tudod indítani az alkalmazást lokálisan.

### 1) Előfeltételek

- **.NET SDK 8.0** (backendhez)
- **Node.js 20+** és **npm** (frontendhez)

### 2) Backend indítása

```bash
cd backend/RestaurantFinder.Api
dotnet restore
dotnet run
```

Alapértelmezett URL: `http://localhost:5166`  
Swagger (Development módban): `http://localhost:5166/swagger`

> A backend induláskor automatikusan futtatja a migrációkat és seedeli az adatokat.

### 3) Frontend indítása

Új terminálban:

```bash
cd etteremkereso-frontend
npm install
npm run dev
```

Vite alapértelmezett URL: `http://localhost:5173`

### 4) Frontend API beállítás

A frontend az alábbi környezeti változót használja:

- `VITE_API_BASE_URL` (pl. `http://localhost:5166/api`)

Ha nem adod meg külön, az alapértelmezett cím: `http://localhost:5166/api`.

Példa (`etteremkereso-frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5166/api
```

### 5) Gyors ellenőrzés, hogy tényleg fut-e minden

1. **Backend health check** böngészőből:
   - `http://localhost:5166/api/health`
   - Ha jó, JSON választ kapsz (pl. `status: ok`).

2. **Frontend megnyitás**:
   - `http://localhost:5173`

3. **Alap teszt flow az oldalon**:
   - Regisztráció: `/register`
   - Bejelentkezés: `/login`
   - Éttermek listája: `/restaurants`
   - Kedvencek (csak belépve): `/favorites`
   - Profil (csak belépve): `/profile`

### 6) Hibakeresés (ha valami nem indul)

- **`dotnet: command not found`**  
  Nincs telepítve a .NET 8 SDK. Telepítsd a .NET 8-at, majd futtasd újra a backend parancsokat.

- **CORS hiba a frontendben**  
  Ellenőrizd, hogy a frontend `5173` portról fut-e, és a backend `5166`-on indul-e.

- **Frontend nem éri el az API-t**  
  Ellenőrizd az `.env` fájlt és a `VITE_API_BASE_URL` értékét:
  `http://localhost:5166/api`

- **Port foglalt**  
  Állíts be másik portot, majd igazítsd hozzá a `VITE_API_BASE_URL` értékét is.
