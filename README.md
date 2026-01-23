# 🍽️ Étteremkereső Webalkalmazás

**Készítők:**  
Villás Attila  
Czövek Dominik  
Földi Soma  

---

## 📌 Projekt leírása
Az Étteremkereső egy webalapú alkalmazás, amelynek célja, hogy a felhasználók személyes étkezési preferenciáik alapján találjanak számukra megfelelő éttermeket. Az alkalmazás lehetőséget biztosít regisztrációra, bejelentkezésre, éttermek kedvencekhez adására, értékelésére, véleményezésére, valamint térképes megjelenítésre.

A projekt modern frontend technológiákkal készül, React, TypeScript és Vite használatával, backend API-val és adatbázissal kiegészítve.

---

## 🎯 Funkcionális követelmények

### Felhasználói fiók
- Regisztráció API-n keresztül
- Bejelentkezés és kijelentkezés
- Hitelesítés token alapú megoldással

### Preferenciák kezelése
- Regisztráció során étkezési preferenciák megadása
- Preferenciák módosítása később
- Étteremajánlások a megadott preferenciák alapján

### Éttermek
- Éttermek listázása
- Éttermek részletes adatlapja
- Éttermek kedvencekhez adása és eltávolítása
- Értékelés csillagos rendszerrel
- Szöveges vélemény írása és megjelenítése

### Térkép és média
- Éttermek megjelenítése térképen
- Éttermekhez tartozó fényképek megjelenítése

---

## 🛠️ Technológiai háttér

### Frontend
- React
- TypeScript
- Vite
- REST API kommunikáció

### Backend
- REST API
- Node.js alapú szerver
- Hitelesítés JWT használatával

### Adatbázis
- Relációs vagy NoSQL adatbázis
- Felhasználók, éttermek, értékelések és preferenciák tárolása

---

## 🗄️ Tervezett adatstruktúra

### Felhasználó
- Egyedi azonosító
- Felhasználónév
- Email cím
- Jelszó (titkosítva)
- Étkezési preferenciák
- Kedvenc éttermek

### Étterem
- Egyedi azonosító
- Név
- Kategóriák
- Cím
- Földrajzi koordináták
- Képek

### Értékelés
- Egyedi azonosító
- Felhasználó azonosító
- Étterem azonosító
- Értékelés
- Vélemény
- Létrehozás dátuma

---

## 🚀 Fejlesztési ütemterv

1. Projekt inicializálása (Vite + React + TypeScript)
2. Frontend alapoldalak létrehozása
3. Backend API kialakítása
4. Adatbázis kapcsolat és modellek
5. Regisztráció és bejelentkezés megvalósítása
6. Preferenciák kezelése és ajánlórendszer
7. Éttermek kezelése, értékelések és kedvencek
8. Térkép és képfeltöltés integrálása
9. Tesztelés és véglegesítés
