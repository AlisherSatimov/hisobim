# Ishlatilgan promptlar

Loyiha ustidagi ish Claude Code (Opus 5) bilan olib borildi. Quyida ishning har bosqichida berilgan promptlar tartib bilan keltirilgan.

---

## 1. Monorepo strukturasiga ko'chirish

Hisobim loyihasini monorepo strukturasiga o'tkaz. Hozir bu flat Expo ilovasi — root'da `app/`, `src/`, `assets/` yotibdi. Maqsad: bitta repo ichida mobil va veb ilova bo'lsin, ikkalasi umumiy kodni ulashsin.

Struktura shunday bo'lsin:

- `apps/mobile/` — mavjud Expo kodi shu yerga ko'chsin (`app/`, `assets/`, `app.json`, `eas.json`)
- `apps/web/` — hozircha bo'sh skelet, keyingi bosqichda to'ldiramiz
- `packages/shared/` — ikkala platforma ishlatadigan kod: tiplar, zod sxemalari, format funksiyalari, servis qatlami (customer, debt, reports, shop, auth) va Supabase client

npm workspaces ishlat — repo'da `package-lock.json` bor, pnpm yoki yarn'ga o'tma.

Eng nozik joyi shu: hozir `src/lib/supabase.ts` global singleton client yaratadi va barcha servislar uni to'g'ridan-to'g'ri import qiladi. Bu web'da ishlamaydi, chunki u yerda sessiya `localStorage` da saqlanadi, mobilda esa `AsyncStorage` da. Shuning uchun shared paketda client factory bo'lsin: `initClient(url, key, storage)` va `getClient()`. Servislar clientni `getClient()` orqali olsin, import qilmasin. Mobil tomonda init bir marta `app/_layout.tsx` da chaqirilsin.

Fayllarni `git mv` bilan ko'chir, tarix saqlanib qolsin. Import yo'llarini yangila. Ko'chirish tugagach `npx tsc --noEmit` bilan tekshir — TypeScript xatosiz bo'lishi kerak. Ilovaning ishlashi o'zgarmasin, bu faqat struktura o'zgarishi.
