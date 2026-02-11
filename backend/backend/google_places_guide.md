# Google Places fájlok – mit hova rakj, hogy működjön

Ez a repo már tartalmaz mindent a Google Places importhoz. Neked csak 3 dolgot kell beállítani.

## 1) Konfig fájl helye és tartalma

1. Másold ezt a fájlt:
   - `backend/google_places.config.example.json`
2. Új néven mentsd el ide:
   - `backend/google_places.config.json`
3. Ebben a fájlban ezeket töltsd ki:
   - `apiKey`: ide a saját Google API kulcsod
   - `query`: pl. `etterem budapest`
   - `maxResults`: hány éttermet kérjen le

## 2) Script fájl helye

- A futtatható import script már kész, helye:
  - `backend/tools/google_places_import.py`

## 3) Futtatás pontos parancsa

A repo gyökeréből futtasd:

```bash
python backend/tools/google_places_import.py --config backend/google_places.config.json
```

## 4) Hol lesz az eredmény

A konfigban beállított helyekre ment:
- nyers JSON: `backend/data/google_places_raw.json`
- SQL seed: `backend/data/google_places_seed.sql`

## 5) SQL betöltés (SQLite példa)

Ha az adatbázis fájlod `backend/app.db`, akkor:

```bash
sqlite3 backend/app.db < backend/data/google_places_seed.sql
```

## 6) Mi legyen GitHub-ra feltöltve

Feltölthető:
- `backend/tools/google_places_import.py`
- `backend/google_places.config.example.json`
- `backend/google_places_guide.md`

Ne töltsd fel:
- `backend/google_places.config.json` (mert ebben van a valódi API kulcs)

## 7) Gyors ellenőrzés

```bash
sqlite3 backend/app.db "SELECT Id, Name, Address FROM Restaurants ORDER BY Id DESC LIMIT 10;"
```
