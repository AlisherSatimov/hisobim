# Hisobim

Do'kon qarz daftari — bitta tizim, ikki platforma: **mobil ilova** (sotuvchi qarz yozadi, internetsiz ham) va **veb-ilova** (do'kon egasi hisobotni ko'radi, mijozlarni boshqaradi).

Ikkala klient ham bitta Supabase API'sidan, bitta umumiy kod qatlami (`packages/shared`) orqali ishlaydi.

- **Jonli veb:** https://web-beta-orcin-36.vercel.app
- **Mobil:** Expo Go orqali (`npm run mobile`)
- **Promptlar:** [PROMPTS.md](PROMPTS.md) — ish qanday olib borilgani

---

## Nega ikki platforma

Ikkalasi bir xil ekranlarning nusxasi emas — rollari boshqa:

| | Mobil | Veb |
|---|---|---|
| Kim | Sotuvchi, do'kon ichida | Ega, kompyuter oldida |
| Nima uchun | Tez kiritish: qarz, to'lov, yangi mijoz | Tahlil: umumiy qarz, qarzdorlar, tarix |
| Internet | **Shart emas** — offline ishlaydi, navbatga yozadi | Kerak (banner bilan ogohlantiradi) |

Do'konda internet uzilib turadi. Sotuvchi yozgan qarz yo'qolsa, ilovaning ma'nosi qolmaydi — shuning uchun offline rejim mobilga qo'yilgan, vebga emas.

## Ochiq aytilgan holat

Bu **avvalgi shaxsiy loyiham** (2026-04-08 da to'xtagan Expo + Supabase ilovasi). Topshiriq doirasida uni 7 soatda ikki platformali tizimga aylantirdim. Git tarixi yashirilmagan — birinchi commitlardan boshlab ko'rish mumkin.

**Avvaldan tayyor edi:** ma'lumot modeli (`shops → customers → debts`), CRUD, RLS policy'lari, `total_debt` trigger'i, mobil ekranlar, servis qatlami.

**Shu topshiriqda qo'shildi:** monorepo + umumiy paket · auth SMS OTP dan email+parolga · veb-ilova butunlay · mobil offline rejim (kesh + outbox) · xavfsizlik tuzatishlari · testlar + CI.

## Ikki platforma bitta API dan

```
packages/shared/          ← yagona manba: tiplar, zod sxemalari, servislar,
                            React Query hooklari, zustand store'lar
      ↑                ↑
apps/mobile/       apps/web/
(Expo Router)      (Vite + React)
```

Veb o'zi uchun birorta yangi so'rov yozmaydi — `useCustomers`, `useDebts`, `useReports`, `useCreateDebt` va servislarni mobil bilan ayni holda chaqiradi. Platformaga xos narsalar (saqlash, tarmoq holati) shared qatlamga **tashqaridan uzatiladi**, shared hech qachon `AsyncStorage` yoki `netinfo` ni import qilmaydi.

## Ishga tushirish

Node 22 kerak (`.nvmrc`).

```bash
npm install
```

`.env` fayllari git'ga tushmaydi, qo'lda yaratiladi:

```bash
cp .env.example apps/mobile/.env
cp .env.example apps/web/.env
```

Ichiga Supabase URL va publishable key yoziladi (mobil `EXPO_PUBLIC_` prefiksi, veb `VITE_`).

```bash
npm run web        # veb — http://localhost:5173
npm run mobile     # mobil — Expo Go
npm test           # testlar
npm run typecheck  # TypeScript
```

## Sinash

Baholovchi o'zi ro'yxatdan o'tadi: **Ro'yxatdan o'tish** → do'kon nomi + email + parol. Hisob yaratilishi bilan do'kon ham ochiladi, ilova darhol ishlaydi. SMS yoki tasdiqlash xati kerak emas.

> Auth ataylab SMS OTP dan email+parolga o'tkazildi: Supabase SMS yuborish uchun pullik provayder (Twilio) talab qiladi, ya'ni jonli havolada hech kim kira olmasdi.

Offline'ni sinash: mobilda aviarejimni yoqib mijoz yoki qarz qo'shing — yuqorida "Aloqa yo'q — 1 ta yozuv navbatda" chiqadi. Aviarejimni o'chirsangiz yozuv o'zi yuboriladi.

## Holatlar

Har ekranda: **loading** (skeleton/spinner) · **empty** (nima qilish kerakligini aytadigan matn va tugma) · **error** (qayta urinish tugmasi) · **offline** (banner; mobilda navbat soni bilan).

## Testlar

```bash
npm test
```

23 ta test (`packages/shared/src/__tests__/`): validatsiya sxemalari, summa/sana formatlash, va offline navbat mantig'i. Supabase mock qilinadi, testlar haqiqiy bazaga chiqmaydi.

CI (`.github/workflows/ci.yml`) har push va PR da: `npm ci` → `typecheck` → `test` → `build:web`.

## Xavfsizlik

Loyihani qayta ochganda bazada topilgan kamchiliklar tuzatildi (`supabase/security_fixes.sql`, har biri sababi bilan):

| Muammo | Nima uchun xavfli | Yechim |
|---|---|---|
| `profiles` jadvalining SELECT policy'si `using (true)` | Istalgan foydalanuvchi barcha hisoblarning email manzilini o'qiy olardi | Jadval o'chirildi (kodda ishlatilmasdi) |
| `debts` insert policy `created_by` ni tekshirmasdi | Boshqa odam nomidan yozuv qo'shish mumkin edi — audit izi ishonchsiz | `created_by = auth.uid()` majburiy qilindi |
| `shop_users` — RLS yoqilgan, policy yo'q | Ishlatilmaydigan, kirib bo'lmaydigan jadval — ortiqcha hujum yuzasi | O'chirildi |
| `security definer` funksiyalarda `search_path` erkin | Chaqiruvchi soxta sxema orqali funksiyani chalg'itishi mumkin | `public, pg_temp` qat'iy belgilandi |

**Ataylab qoldirilgani:**

- **`npm audit` 17 ta zaiflik** — hammasi `image-size`, `postcss`, `uuid` dan keladi va faqat qurish vositalarida (metro, xcode). Ilova kodiga tushmaydi. `npm audit fix` force'siz hech narsani o'zgartirmaydi, `--force` esa Expo 54 ni buzadi.
- **Funksiyalarga `EXECUTE` huquqi** — Supabase advisor'i REST orqali chaqirilishidan ogohlantiradi. `revoke` qilib ko'rildi va qaytarildi: `is_shop_owner` RLS policy ichida ishlatiladi, huquqni olib tashlash ilovani sindirishi mumkin. Ma'lumotni RLS himoyalaydi, funksiyaning o'zi hech narsa oshkor qilmaydi.
- **Leaked password protection** — Supabase dashboard sozlamasi, kod bilan yoqilmaydi.

## Arxitektura qarorlari

Uchtasini bilmasdan kodni o'qish qiyin:

**1. Lazy client proxy.** Servislar `supabase` ni ko'p qatorli zanjirda ishlatadi, lekin client ilova ishga tushganda yaratiladi. `packages/shared/src/client.ts` da `supabase` Proxy sifatida eksport qilinadi — har murojaatda haqiqiy clientni oladi, servis kodi odatdagidek yoziladi.

**2. Alohida `./init` kirish nuqtasi.** Zustand store'lari yaratilishi bilan saqlash adapterini so'raydi, ya'ni `initHisobim()` ulardan oldin bajarilishi shart. Barrel store'larni ham yuklagani uchun init `@hisobim/shared/init` dan import qilinadi va `_layout.tsx` / `main.tsx` ning **eng birinchi importi** bo'ladi.

**3. Outbox xato ajratishi.** Offline navbat yuborishda xato ikkiga bo'linadi: Postgres kodi bor xato (42501 RLS, 23505 takror) — server rad etgan, qayta urinilmaydi, element "xato" holatiga o'tadi; kodsiz xato — tarmoq uzilishi, element navbatda qoladi. Busiz navbat cheksiz aylanardi.

## Struktura

```
apps/mobile/       Expo Router + React Native Paper
apps/web/          Vite + React + react-router-dom
packages/shared/   umumiy qatlam (ikkala klient ishlatadi)
supabase/          migration.sql, security_fixes.sql, seed.sql
```
