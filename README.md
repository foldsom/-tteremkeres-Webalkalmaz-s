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
