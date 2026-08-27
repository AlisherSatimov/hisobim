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
