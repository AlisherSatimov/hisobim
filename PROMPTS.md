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

---

## 4. Mobil: offline rejim

Mobil ilova offline ishlashi kerak. Sabab rollardan kelib chiqadi: sotuvchi do'konda telefonda qarz yozadi, do'kon podvalida yoki bozorda internet uzilib turadi. Yozuv yo'qolsa ilovaning ma'nosi qolmaydi. Veb tomonda bu shart emas — u ofisdagi tahlil qurilmasi, u yerda faqat "aloqa yo'q" bannerini ko'rsatish kifoya (3-bosqichda qilingan).

Hozirgi holat: `apps/mobile/app/_layout.tsx` da `QueryClient` `staleTime: 0` bilan yaratilgan va hech qanday persister yo'q — ilova yopilsa kesh yo'qoladi, internet bo'lmasa ekranlar bo'sh qoladi. Tarmoq holatini aniqlaydigan kod ham yo'q (`netinfo` o'rnatilmagan).

Uch qismdan iborat:

**1. Kesh saqlanadigan bo'lsin.** `@tanstack/react-query-persist-client` va AsyncStorage persister'ini ulа, `staleTime` ni mazmunli qiymatga ko'tar (masalan 5 daqiqa) va `gcTime` keshni saqlash muddatidan uzun bo'lsin. Maqsad: internetsiz ochilganda mijozlar ro'yxati va yozuvlar oxirgi holatida ko'rinsin. `onlineManager` ni netinfo bilan bog'la — React Query tarmoq qaytganda o'zi qayta so'rov yuborsin.

**2. Outbox — offline yozuvlar navbati.** Bu bosqichning asosiy qismi. Internetsiz paytda qo'shilgan qarz/to'lov yozuvi va yangi mijoz yo'qolmasin: navbatga tushsin, aloqa qaytganda avtomatik yuborilsin.

- Navbat `packages/shared` da zustand store sifatida yozilsin va saqlansin (`persist`, mavjud store'lar bilan bir xil uslubda) — shunda ilova yopilib qayta ochilsa ham navbat joyida qoladi.
- Har element: turi (mijoz yoki yozuv), yuborilishi kerak bo'lgan payload, yaratilgan vaqti, urinishlar soni.
- Aloqa qaytganda navbat tartib bilan yuborilsin. Muvaffaqiyatda element o'chsin va tegishli query'lar `invalidate` qilinsin.
- **Xatolarni ajrat:** tarmoq xatosi = keyin qayta urinamiz, element navbatda qoladi; server rad etgan bo'lsa (masalan RLS yoki validatsiya xatosi) qayta urinishning ma'nosi yo'q — elementni "xato" holatiga o'tkaz va foydalanuvchiga ko'rsat. Cheksiz aylanma bo'lmasin.
- Foydalanuvchi navbatdagi yozuvni ekranda ko'rsin — ro'yxatda "yuborilmagan" belgisi bilan, yoki bannerda "3 ta yozuv yuborilmagan" ko'rinishida. Sotuvchi nima saqlanmaganini bilishi shart.

**3. Offline banner.** Ilovaning yuqorisida, barcha ekranlarda. Aloqa yo'qligini va navbatda nechta yozuv turganini ko'rsatsin. Veb tomondagi banner bilan bir xil ohangda, mobil dizayn tilida (`#E8A020` aksent rangi).

Muhim: outbox mantig'i `packages/shared` da bo'lsin, `apps/mobile` da emas — u platformaga bog'liq emas va veb keyinchalik xohlasa ishlata oladi. Lekin netinfo mobilga xos, shuning uchun tarmoq holati shared'ga tashqaridan uzatilsin (init paytida yoki funksiya argumenti sifatida) — shared kod hech qachon `@react-native-community/netinfo` ni import qilmasin, bu 1-bosqichdagi qoidaning davomi.

Mavjud hooklar (`useCreateDebt`, `useCreateCustomer`) chaqiruv joyidan qaraganda o'zgarmasin — ekran kodi "offline bo'lsa navbatga qo'y" degan shartni bilmasin, buni ma'lumot qatlami hal qilsin.

Yangi paket o'rnatishing kerak bo'ladi (`@tanstack/react-query-persist-client`, `@react-native-community/netinfo` va persister). Expo bilan mos versiyani tanla — `npx expo install` ishlat. Tugagach `npm run typecheck` toza o'tsin. Ilovani o'zing ishga tushirib sinama — men Expo'da sinab ko'raman. Push qilma.

---

## 5. Xavfsizlik tuzatishlari

Bazadagi xavfsizlik kamchiliklarini tuzat. Bular 1-bosqichda kodni o'qiyotganda topilgan edi va HOLAT.md da ro'yxatga olingan; ular README'da "topildi va tuzatildi" deb yoziladi, shuning uchun har birining sababi tushunarli bo'lsin.

Avval jonli bazani Supabase advisor'i bilan tekshir (`get_advisors`, security) — ro'yxatdagilardan tashqari yana nima borligini ko'r, chunki `supabase/migration.sql` bazadan drift qilgan.

Ma'lum kamchiliklar:

1. **`shop_users`** — RLS yoqilgan, lekin birorta policy yo'q. Bu jadval "keyingi faza uchun scaffold" deb qo'shilgan, hozir kodda umuman ishlatilmaydi, ya'ni hech kim kira olmaydigan bo'sh jadval turibdi. Olib tashlansin — ishlatilmaydigan jadval hujum yuzasi.
2. **`debts` insert policy** faqat `is_shop_owner(shop_id)` ni tekshiradi, `created_by = auth.uid()` ni tekshirmaydi. Ya'ni foydalanuvchi boshqa odam nomidan yozuv qo'sha oladi — audit izi ishonchsiz bo'lib qoladi. `with check` ga `created_by = auth.uid()` qo'shilsin. `update` policy'da ham `created_by` o'zgartirib yuborilmasin.
3. **`profiles` jadvali** bazada bor, lekin `migration.sql` da ham, kodda ham yo'q — migratsiya fayli bazadan ajralib ketgan. Ishlatilmasa olib tashlansin, ishlatilsa migratsiyaga qo'shilsin. Avval ichida ma'lumot bor-yo'qligini tekshir.
4. **`npm audit`** 17 ta zaiflik ko'rsatadi (8 moderate, 9 high). Ko'rib chiq: qaysilari haqiqiy xavf, qaysilari faqat dev-bog'liqlikda. `npm audit fix --force` ni ko'r-ko'rona ishlatma — u Expo yoki Vite versiyasini buzishi mumkin. Nima tuzatilgani va nima ataylab qoldirilgani yozilsin.

Migratsiya fayli va jonli baza bir-biriga mos bo'lishi kerak. `supabase/migration.sql` ni yangi holatga moslab yangila (u noldan qurish uchun yagona manba), o'zgarishlarni jonli bazaga ham qo'lla. **Jonli bazaga tegishdan oldin menga ayt** — nima o'zgarishini ko'rsat, keyin qo'llaymiz.

Tugagach advisor'ni qayta ishga tushir va nima yopilgani, nima ochiq qolgani (va nega) ro'yxat qilib ber. Push qilma.

---

## 6. Testlar va CI

Baholash mezonlaridan biri — "testlar mavjud va o'tadi". Ko'p test kerak emas, mantiqning eng muhim joylari qoplansin.

`packages/shared` da Vitest o'rnat (`npm test` skripti root'da allaqachon shu paketga qaratilgan). Nimani test qil:

- **Validatsiya sxemalari** — `loginSchema`, `signUpSchema` (parol tasdig'i mos kelmasa xato berishi), `addCustomerSchema`, `addDebtSchema`.
- **`formatAmount` / `formatDate`** — manfiy summa, nol, joriy yil va o'tgan yil sanalari.
- **Outbox xato ajratish** — bu eng qimmatli test: tarmoq xatosi navbatda qoldirishi, Postgres kodli xato esa elementni "xato" holatiga o'tkazishi. Busiz navbat cheksiz aylanishi mumkin edi.

Servislar va Supabase so'rovlari mock qilinsin, haqiqiy bazaga chiqilmasin.

Keyin GitHub Actions workflow qo'sh: har push va PR da `npm ci`, `npm run typecheck`, `npm test`, `npm run build:web`. Node 22 ishlatilsin (`.nvmrc` bilan bir xil). Veb build uchun `.env` kerak bo'lsa, sir bo'lmagan qiymatlarni workflow ichida bersan bo'ladi (publishable key baribir klientda ochiq), lekin repo sirlariga tayanma.

Murakkablashtirma — maqsad ishlaydigan, o'tadigan test to'plami va yashil CI. Tugagach `npm test` va `npm run typecheck` toza o'tsin. Push qilma.
