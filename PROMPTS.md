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

---

## 2. Auth: SMS OTP dan email + parolga o'tkazish

Ilovadagi autentifikatsiyani telefon + SMS OTP dan email + parolga o'tkaz. Sabab amaliy: Supabase o'zi SMS yubormaydi, uning uchun Twilio kabi pullik provayder ulash kerak. Topshiriqni baholovchi odam jonli havolaga kirib ilovani sinab ko'ra olishi shart, shuning uchun u o'zi ro'yxatdan o'tib, darhol kira oladigan usul kerak. Email + parol Supabase'da bepul va qo'shimcha sozlashsiz ishlaydi.

Hozirgi holat: `packages/shared/src/services/auth.service.ts` da `sendOtp` / `verifyOtp` bor, ular `signInWithOtp({ phone })` va `verifyOtp({ type: 'sms' })` ni chaqiradi, ichida `normalizeUzbekPhone` yordamchisi ishlaydi. Mobil tomonda ikki ekran: `app/(auth)/login.tsx` (telefon kiritish) va `app/(auth)/verify.tsx` (6 xonali kod). Validatsiya `packages/shared/src/validation.ts` da: `phoneSchema`, `loginSchema`, `otpSchema`.

Nima bo'lishi kerak:

**Shared qatlam.** `auth.service.ts` da OTP funksiyalari o'rniga `signUp(email, password, shopName)`, `signIn(email, password)` bo'lsin. `signOut` va `getSession` o'z holicha qoladi. `normalizeUzbekPhone` endi auth uchun kerak emas — lekin mijoz telefon raqami boshqa joyda ishlatilsa, o'chirmasdan tegishli joyga ko'chir. `validation.ts` da `loginSchema` email + parolga aylansin (parol kamida 6 belgi), `signUpSchema` qo'shilsin (email, parol, parol tasdig'i, do'kon nomi) — tasdiq parolga `refine` bilan moslik tekshiruvi qo'y. `otpSchema` va `phoneSchema` ni auth kontekstidan chiqar. Barcha xato matnlari o'zbekcha, mavjud uslubda.

**Ro'yxatdan o'tish oqimi.** Yangi foydalanuvchi birinchi kirganda do'koni bo'lmaydi, ilova esa `shop` bo'lmasa ishlamaydi. Shuning uchun `signUp` do'kon nomini ham olsin va foydalanuvchi yaratilgandan keyin `shop.service.ts` orqali unga do'kon yaratsin. Supabase'da email tasdiqlash (confirm email) yoqilgan bo'lsa sessiya darhol qaytmaydi — buni tekshir va agar shunday bo'lsa dashboard'dan o'chir, chunki baholovchi tasdiqlash xatini kutib o'tirmasligi kerak. Nima qilganingni ayt.

**Mobil ekranlar.** `(auth)/verify.tsx` o'chsin, o'rniga `(auth)/register.tsx` paydo bo'lsin. `login.tsx` telefon maydoni o'rniga email + parol maydonlarini ko'rsatsin, pastda "Hisobingiz yo'qmi? Ro'yxatdan o'ting" havolasi. `register.tsx` da: do'kon nomi, email, parol, parolni tasdiqlash. Parol maydonlarida `secureTextEntry` va ko'z ikonkasi bilan ko'rsatish/yashirish bo'lsin. Mavjud dizayn tilini saqla — bir xil ranglar (`#1B6CA8`), `SafeAreaView` + `KeyboardAvoidingView` + brand blok + oq karta tuzilishi, `react-hook-form` + `zodResolver`, `HelperText` bilan xato ko'rsatish. `app/_layout.tsx` dagi `Stack.Screen name="(auth)/verify"` o'rniga `(auth)/register` yozilsin.

**Holatlar.** Login va register ekranlarida loading (tugmada spinner, tugma disabled) va error holati ishlansin. Xatolar foydalanuvchiga tushunarli o'zbekcha matn bilan chiqsin, Supabase'ning inglizcha xabari to'g'ridan-to'g'ri ko'rsatilmasin: noto'g'ri email/parol, bu email allaqachon ro'yxatdan o'tgan, tarmoq yo'q — kamida shu uchtasi ajratilsin.

Tugagach `npm run typecheck` toza o'tsin. Telefon/OTP ga oid o'lik kod qolmasin — `grep` bilan tekshir. Kodni push qilma, avval menga ko'rsat.

---

## 3. Veb-ilova

Endi veb tomonini qur. Root `package.json` da `@hisobim/web` uchun skriptlar (`web`, `build:web`) allaqachon yozilgan, lekin `apps/web/` papkasining o'zi yo'q — uni noldan yaratasan.

**Rollarni yodda tut:** mobil = kiritish qurilmasi (sotuvchi do'konda qarz yozadi), veb = tahlil qurilmasi (do'kon egasi kompyuterda hisobotni ko'radi, mijozlarni boshqaradi). Veb mobil ekranlarning nusxasi bo'lmasin — u kengroq ekranga mos, jadval va ko'rsatkichlarga urg'u beradigan interfeys.

**Stack:** Vite + React + TypeScript. Marshrutlash uchun `react-router-dom`. Ma'lumot qatlami — `@hisobim/shared` dagi mavjud hooklar (`useCustomers`, `useCustomerById`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer`, `useDebts`, `useReports`) va servislar. **Shared paketga yangi ma'lumot funksiyasi yozishga to'g'ri kelsa, avval menga ayt** — maqsad ikkala klient bir xil qatlamdan ishlashini ko'rsatish, veb uchun alohida so'rov yozish emas. UI kutubxonasi: RN Paper vebda ishlamaydi, shuning uchun oddiy CSS yoz (CSS Modules yoki bitta global stil fayli — tanla, lekin izohlab ber). Mobil dizayn tilini saqla: asosiy rang `#1B6CA8`, aksent `#E8A020`, xato `#C0392B`, matn `#1A1A2E`, kulrang `#9CA3AF`.

**Init tartibi — eng nozik joyi.** `initHisobim()` zustand store'lari yaratilishidan oldin bajarilishi shart, aks holda ular saqlash adapterisiz ishga tushadi va ilova ishlamaydi. Shuning uchun `apps/web/src/init.ts` yaratilsin va u `main.tsx` ning **eng birinchi importi** bo'lsin (mobil tomonda `apps/mobile/init.ts` xuddi shunday ishlatilgan, undan namuna ol). Vebda saqlash adapteri `localStorage`, va `detectSessionInUrl: true` uzatilsin. Muhit o'zgaruvchilari `VITE_` prefiksi bilan (`import.meta.env.VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); `apps/web/.env` faylini `.env.example` dan nusxalab yaratasan, u git'ga tushmaydi.

**Ekranlar:**

1. **Login / Ro'yxatdan o'tish** — `signIn` / `signUp` bilan, 2-bosqichdagi mobil ekranlar bilan bir xil mantiq va bir xil o'zbekcha xato matnlari (`authErrorMessage`). Ikkalasi alohida marshrut.
2. **Dashboard** — `useReports` dan: umumiy qarz, mijozlar soni, qarzdorlar soni, qarzi yopilganlar soni — to'rtta ko'rsatkich kartasi; pastda top-5 qarzdor ro'yxati (`topDebtors`), har biri mijoz sahifasiga havola.
3. **Mijozlar ro'yxati** — jadval ko'rinishida (ism, telefon, joriy qarz, oxirgi yozuv sanasi), qidiruv maydoni bilan. Mijoz qo'shish va tahrirlash veb'da ham bo'lsin.
4. **Mijoz detali** — mijoz ma'lumoti, joriy qarzi va qarz/to'lov yozuvlari tarixi (`useDebts`). Yozuv qo'shish veb'da ham bo'lsin.

Faqat sessiyasi bor foydalanuvchi ilova sahifalariga kira olsin — himoyalangan marshrut qatlami yoz, `useAuthStore` dagi `session` va `isLoading` ga tayan (mobil tomonda `(auth)/_layout.tsx` shu ishni qiladi, mantiq bir xil bo'lsin). Sessiya tekshirilayotgan paytda ekran "yo'q" holatida qolmasin.

**Holatlar — bu baholash mezoni, har ekranda bajarilsin:** loading (skeleton yoki spinner) · empty (mijoz yo'q, yozuv yo'q — matn va harakatga chorlovchi tugma bilan) · error (qayta urinish tugmasi bilan) · offline (tarmoq yo'qligini `navigator.onLine` va `online`/`offline` hodisalari bilan aniqlab, yuqorida banner ko'rsat). Bo'sh holat matnlari o'zbekcha va foydali bo'lsin, "Ma'lumot yo'q" emas.

Pul summalari va sanalar `@hisobim/shared` dagi `formatAmount` / `formatDate` orqali chiqsin — veb'da alohida formatlash yozma.

Tugagach `npm run typecheck` toza o'tsin va `npm run build:web` xatosiz qurilsin. Dev serverni ishga tushirib o'zing tekshirma — men o'zim sinab ko'raman, tayyor bo'lganda ayt. Push qilma.
