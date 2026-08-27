# Ish holati

> Bu vaqtinchalik fayl — ish tugagach o'chiriladi yoki README.md ga singdiriladi.
> Maqsadi: ishni boshqa mashinada uzilishsiz davom ettirish.

Oxirgi yangilanish: 2026-08-27, monoblok (Linux).

## Topshiriq

7 soatlik amaliy topshiriq: bitta loyihani ikki platformada ishga tushirish — veb-ilova va unga ulangan mobil ilova.

**Topshirish tarkibi:** repozitoriya havolasi · ishlaydigan veb-ilova havolasi · mobil build yoki demo video · ishlatilgan promptlar to'plami (`PROMPTS.md`).

**Baholash mezonlari:** ikki platforma bitta API dan ishlaydi · barcha holatlar ishlangan (loading / empty / error / offline) · testlar mavjud va o'tadi · xavfsizlik minimumi bajarilgan.

## Yondashuv

Noldan yozilmadi — mavjud `hisobim` (do'kon qarz daftari, Expo + Supabase) monorepo'ga aylantirilib, ustiga veb-ilova qurilmoqda. Git tarixi ochiq qoladi; README da bu ochiq yoziladi.

**Rollar:** mobil = kiritish qurilmasi (sotuvchi do'konda, offline ham ishlaydi) · veb = tahlil qurilmasi (ega hisobotni ko'radi, mijozlarni boshqaradi).

## Bosqichlar

| № | Bosqich | Holat |
|---|---------|-------|
| 1 | Monorepo + `@hisobim/shared` paketi | ✅ tugadi (`24341ab`) |
| 2 | Auth: SMS OTP → email + parol | ✅ tugadi |
| 3 | Veb-ilova (login, dashboard, mijozlar, mijoz detali) | ⬜ keyingi |
| 4 | Mobil: offline kesh + outbox + offline banner | ⬜ |
| 5 | Xavfsizlik tuzatishlari (pastda ro'yxat) | ⬜ |
| 6 | Testlar + GitHub Actions CI | ⬜ |
| 7 | Deploy (Vercel + EAS), README, demo video | ⬜ |

Har bosqich uchun avval `PROMPTS.md` ga prompt yoziladi, keyin shu prompt bajariladi.

## 1-bosqichda nima qilindi

```
hisobim/
├── apps/mobile/       — mavjud Expo kodi (git mv, tarix saqlangan)
├── apps/web/          — bo'sh, 3-bosqichda to'ldiriladi
└── packages/shared/   — tiplar, zod sxemalari, format, servislar,
                         React Query hooklari, zustand store'lar
```

Ikkita texnik qaror, ularni bilmasdan kodni o'qish qiyin:

1. **Client lazy proxy.** Servislar `supabase` ni ko'p qatorli zanjirda ishlatadi, shuning uchun `packages/shared/src/client.ts` da `supabase` Proxy sifatida eksport qilinadi — har murojaatda haqiqiy clientni oladi. Servis kodlariga tegilmadi, faqat import yo'li o'zgardi.

2. **Alohida `./init` kirish nuqtasi.** Zustand store'lari yaratilishi bilan saqlash adapterini so'raydi, ya'ni `initHisobim()` ulardan oldin bajarilishi shart. Barrel (`index.ts`) store'larni ham yuklagani uchun init `@hisobim/shared/init` dan import qilinadi. Mobil tomonda `apps/mobile/init.ts` → `app/_layout.tsx` ning eng birinchi importi. **Veb tomonda ham xuddi shu tartib kerak bo'ladi** (`main.tsx` da eng birinchi).

## 2-bosqichda nima qilindi

Auth telefon + SMS OTP dan email + parolga o'tkazildi (Supabase SMS uchun pullik provayder talab qiladi, baholovchi jonli havolada sinay olmaydi).

- `auth.service.ts`: `signUp(email, password, shopName)` · `signIn(email, password)` · `authErrorMessage(err)` — Supabase inglizcha xatosi hech qachon ekranga chiqmaydi.
- `signUp` ro'yxatdan o'tgach darhol do'kon yaratadi (`createShop`), chunki ilova `activeShop`siz ishlamaydi.
- Mobil: `(auth)/verify.tsx` o'chdi, `(auth)/register.tsx` qo'shildi.
- `normalizeUzbekPhone` o'chirildi — u faqat auth'da ishlatilgan edi.

**Ochiq:** Supabase dashboard'da Authentication → Email → "Confirm email" o'chirilishi kerak, aks holda baholovchi tasdiqlash xatini kutadi. Kod ikkala holatga chidamli: sessiya qaytmasa register ekrani "pochtangizni tasdiqlang" deydi.

## Boshqa mashinada boshlash

```bash
git clone https://github.com/AlisherSatimov/hisobim.git && cd hisobim && npm install
```

Keyin `.env` fayllarini yarating — ular git'ga tushmaydi:

```bash
cp .env.example apps/mobile/.env
```

Ichidagi qiymatlarni to'ldiring. Supabase loyihasi: **`hisobim`**, ref `ttgmhrrrrcmaaohwfwwo`, region `ap-southeast-1`. URL va publishable key: Supabase dashboard → Project Settings → API Keys. (Claude bilan ishlayotgan bo'lsangiz, bu qiymatlar xotirada ham saqlangan.)

Tekshirish:

```bash
npm run typecheck
```

Node 22 kerak (`.nvmrc` da yozilgan).

## Supabase

Loyiha bepul tarifda — **7 kun ishlatilmasa avtomatik pauzaga tushadi**. Pauzada bo'lsa Supabase dashboard'dan yoki Claude orqali tiklanadi, ma'lumot yo'qolmaydi. 2026-08-27 da pauzadan tiklandi.

Jadvallar: `shops` · `customers` · `debts` · `shop_users` · `profiles`. Hozir hammasi bo'sh.

`supabase/seed.sql` — 18 mijoz va ~50 qarz/to'lov yozuvi bilan demo ma'lumot. Ro'yxatdan o'tib, do'kon yaratilgandan keyin ishga tushiriladi (u mavjud `shops` yozuvini topib ishlatadi).

## Ochiq xavfsizlik kamchiliklari (5-bosqichda tuzatiladi)

1. **`shop_users`** — RLS yoqilgan, lekin birorta policy yo'q, ya'ni jadval butunlay kirib bo'lmaydi. Migratsiyada "keyingi faza uchun scaffold" deb belgilangan. Olib tashlanadi.
2. **`debts` insert policy** `created_by = auth.uid()` ni tekshirmaydi — foydalanuvchi boshqa odam nomidan yozuv qo'shishi mumkin.
3. **`profiles` jadvali** bazada bor, lekin `migration.sql` da ham, kodda ham yo'q — migratsiya fayli bazadan drift qilgan. Olib tashlanadi yoki migratsiyaga qo'shiladi.
4. **`npm audit`** 17 ta zaiflik ko'rsatdi (8 moderate, 9 high) — ko'rib chiqilmagan.

Tuzatilgani: `.gitignore` da oddiy `.env` yo'q edi (faqat `.env.development` va `.env*.local`) — 1-bosqichda qo'shildi.
