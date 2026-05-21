# CrudFab Case

Kişi kayıtları ve meslek grupları üzerinde CRUD, filtreleme, sayfalama ve rol bazlı yetkilendirme
sunan tam yığın uygulama.

- **Backend:** FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, JWT (httpOnly cookie), pytest
- **Frontend:** React 18, TypeScript, Vite, MUI v6, Redux Toolkit, react-hook-form + Zod, i18next (TR/EN)
- **DB:** SQLite / PostgreSQL

## Hızlı başlangıç

### Docker

```bash
docker compose up --build
```

| Servis      | URL                          |
| ----------- | ---------------------------- |
| Frontend    | http://localhost:3800        |
| Backend API | http://localhost:8000        |
| Swagger     | http://localhost:8000/docs   |
| PostgreSQL  | localhost:5432               |

Frontend konteyneri içinde Nginx 80 portunda çalışır; dışarıda **3800** portuna map edilir
(`3800:80`). Tarayıcıda uygulamayı şu adresten açın:

**http://localhost:3800**

İlk açılışta oturum olmadığı için uygulama sizi giriş sayfasına yönlendirir. Adres çubuğunda
örneğin şunu görmeniz normaldir:

`http://localhost:3800/login?returnTo=%2F`

- `/login` — giriş ekranı
- `returnTo=%2F` — girişten sonra dönülecek sayfa (`%2F` = `/`, yani kişi listesi)

Doğrudan giriş sayfası: http://localhost:3800/login

Varsayılan hesaplarla giriş yaptıktan sonra kişi listesine (`/`) yönlendirilirsiniz. `/api`
istekleri aynı origin üzerinden Nginx proxy ile backend'e gider; ekstra CORS ayarı gerekmez.

Volume'ları da silmek için: `docker compose down -v`.

### Lokal geliştirme

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend (ayrı terminal):

```bash
cd frontend
npm install
npm run dev
```

Vite, `/api` isteklerini `http://127.0.0.1:8000`'a proxy'ler. Frontend `http://localhost:5173`
üzerinde çalışır.

## Varsayılan hesaplar

Seed otomatik oluşturur:

| Rol   | E-posta             | Şifre      |
| ----- | ------------------- | ---------- |
| Admin | admin@example.com   | Admin123!  |
| User  | user@example.com    | User123!   |

`backend/.env` içindeki `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` ile değiştirilebilir.

## Ortam değişkenleri

### Backend

| Değişken                    | Varsayılan                                                         | Not                                          |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| `DATABASE_URL`              | `sqlite:///./crudfab.db`                                           | DB bağlantı dizesi                           |
| `SECRET_KEY`                | dev anahtarı                                                       | JWT imzalama anahtarı                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                                                             | JWT geçerlilik (dakika)                      |
| `ALGORITHM`                 | `HS256`                                                            | JWT algoritması                              |
| `SESSION_COOKIE_NAME`       | `crudfab_session`                                                  | Cookie adı                                   |
| `SESSION_COOKIE_SECURE`     | `false`                                                            | HTTPS arkasında `true`                       |
| `SESSION_COOKIE_SAMESITE`   | `lax`                                                              | `lax` / `strict` / `none`                    |
| `CORS_ORIGINS`              | `["http://localhost:5173","http://localhost:3800"]`                | İzinli origin listesi                        |
| `SEED_ENABLED`              | `true`                                                             | Seed'i kapatmak için `false`                 |
| `SEED_PERSON_COUNT`         | `1000`                                                             | Seed kişi sayısı                             |

### Frontend

| Değişken            | Not                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Boşsa same-origin. Farklı domain için tam URL girin; CORS ayarını da güncelleyin.     |

## Kimlik doğrulama

JWT, **httpOnly cookie** içinde taşınır; frontend token'a erişemez.

1. `POST /api/v1/auth/login` → `Set-Cookie: crudfab_session=<jwt>; HttpOnly; SameSite=Lax`.
   Response body: `{ "role": "admin" }`.
2. Sonraki istekler `credentials: "include"` ile cookie'yi taşır.
3. `GET /api/v1/auth/me` ile sayfa yenilenmesinde rol restore edilir.
4. `POST /api/v1/auth/logout` cookie'yi temizler.

`Authorization: Bearer <token>` header'ı da kabul edilir (test ve programatik erişim için).

## API uç noktaları

| Metod    | Endpoint                          | Yetki        | Açıklama                            |
| -------- | --------------------------------- | ------------ | ----------------------------------- |
| `POST`   | `/api/v1/auth/login`              | herkese açık | Giriş, cookie set                   |
| `POST`   | `/api/v1/auth/logout`             | herkese açık | Cookie temizle                      |
| `GET`    | `/api/v1/auth/me`                 | auth         | Rol bilgisi                         |
| `GET`    | `/api/v1/profession-groups`       | auth         | Meslek gruplarını listele           |
| `POST`   | `/api/v1/profession-groups`       | admin        | Yeni meslek grubu                   |
| `GET`    | `/api/v1/persons`                 | auth         | Kişi listesi (filtre + sayfa)       |
| `GET`    | `/api/v1/persons/{id}`            | auth         | Detay (TCKN tam)                    |
| `POST`   | `/api/v1/persons`                 | admin        | Yeni kişi                           |
| `PUT`    | `/api/v1/persons/{id}`            | admin        | Güncelle                            |
| `DELETE` | `/api/v1/persons/{id}`            | admin        | Sil                                 |

### Hata kodları

`400` iş kuralı · `401` kimlik · `403` yetki · `404` bulunamadı · `409` benzersizlik · `422` validasyon.

### Liste parametreleri

`GET /api/v1/persons` query parametreleri:

| Param                   | Örnek               | Açıklama                                        |
| ----------------------- | ------------------- | ----------------------------------------------- |
| `page`                  | `1`                 | Sayfa numarası                                  |
| `size`                  | `20`                | Max 100                                         |
| `sort`                  | `last_name,asc`     | `first_name`, `last_name`, `email`, `created_at`|
| `profession_group_ids`  | `1&profession_group_ids=2` | Çoklu seçim                              |
| `name_contains`         | `Ahmet`             | Ad veya soyadda geçer                           |
| `tckn_prefix`           | `123`               | TCKN başlangıcı                                 |

### Örnek

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

curl "http://127.0.0.1:8000/api/v1/persons?page=1&sort=last_name,asc" -b cookies.txt
```

## Proje yapısı

```
backend/
  app/
    api/v1/        # auth, persons, profession_groups
    core/          # config, security, deps
    models/        # User, ProfessionGroup, Person
    schemas/       # Pydantic istek/yanıt modelleri
    services/      # iş mantığı
    utils/         # TCKN validasyon & maskeleme
    main.py        # FastAPI uygulaması
    database.py
    seed.py
  alembic/         # migration
  tests/
frontend/
  src/
    api/           # api-client, auth-api, persons-api
    auth/guard/    # RouteGuard, AdminGuard
    components/    # auth, common, layout, persons
    i18n/          # tr.json, en.json
    pages/
    routes/
    schemas/       # Zod
    store/         # auth/persons/professionGroups slice
    theme/
    types/
    utils/
```


## Geliştirme komutları

Backend:

```bash
cd backend
pytest -v
```

Frontend:

```bash
cd frontend
npm run lint
npm run format
npm run build
```

## Testler

| Dosya                        | Kapsam                                              |
| ---------------------------- | --------------------------------------------------- |
| `test_auth.py`               | Login cookie, `/me`, `/logout`, korumalı route      |
| `test_persons.py`            | CRUD, filtre, TCKN validasyon, 409, 403             |
| `test_profession_groups.py`  | Admin ekleyebilir, user ekleyemez                   |

Testler bellek içi SQLite kullanır.
