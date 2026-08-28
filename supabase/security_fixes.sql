-- ============================================================
-- Hisobim — 5-bosqich xavfsizlik tuzatishlari
--
-- `migration.sql` noldan qurish uchun yagona manba; bu fayl esa mavjud
-- bazani o'sha holatga keltiruvchi delta. Har bir o'zgarishning sababi
-- yozilgan, chunki README'da "topildi va tuzatildi" deb keltiriladi.
-- ============================================================

-- ------------------------------------------------------------
-- 1. `shop_users` — RLS yoqilgan, lekin birorta policy yo'q
--
-- Jadval "keyingi faza uchun scaffold" deb qo'shilgan, kodda umuman
-- ishlatilmaydi. Policysiz RLS = hech kim kira olmaydigan bo'sh jadval.
-- Ishlatilmaydigan jadval — ortiqcha hujum yuzasi. Ko'p foydalanuvchili
-- rejim kerak bo'lganda qaytadan, o'z policy'lari bilan qo'shiladi.
-- ------------------------------------------------------------
drop table if exists public.shop_users;

-- ------------------------------------------------------------
-- 2. `profiles` — migratsiyada ham, kodda ham yo'q edi (drift)
--
-- Tashlab ketilgan "username bilan kirish" tajribasidan qolgan. Undan ham
-- muhimi: SELECT policy'si `using (true)` bo'lgan, ya'ni istalgan
-- foydalanuvchi jadvaldagi BARCHA `auth_email` qiymatlarini o'qiy olardi.
-- Bu haqiqiy ma'lumot sizishi. Jadval ishlatilmagani uchun olib tashlanadi.
-- ------------------------------------------------------------
drop table if exists public.profiles;

-- ------------------------------------------------------------
-- 3. `debts` — insert policy `created_by` ni tekshirmasdi
--
-- Foydalanuvchi boshqa odam nomidan yozuv qo'sha olardi, ya'ni audit izi
-- ishonchsiz edi. Update'da ham `created_by` ni almashtirib bo'lmaydi.
-- ------------------------------------------------------------
drop policy if exists "Owner: insert debts" on public.debts;
create policy "Owner: insert debts"
  on public.debts for insert
  to authenticated
  with check (public.is_shop_owner(shop_id) and created_by = auth.uid());

drop policy if exists "Owner: update debts" on public.debts;
create policy "Owner: update debts"
  on public.debts for update
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id) and created_by = auth.uid());

-- ------------------------------------------------------------
-- 4. Funksiyalarda search_path qat'iy emas edi
--
-- `security definer` funksiya chaqiruvchining search_path'iga tayansa,
-- chaqiruvchi soxta sxema yasab funksiyani o'z kodini bajarishga
-- majburlashi mumkin.
-- ------------------------------------------------------------
alter function public.is_shop_owner(uuid) set search_path = public, pg_temp;
alter function public.sync_customer_total_debt() set search_path = public, pg_temp;

-- Eslatma: advisor funksiyalar REST orqali chaqirilishi mumkinligidan ham
-- ogohlantiradi. EXECUTE huquqi ataylab qoldirildi — `is_shop_owner` RLS
-- policy ichida chaqiriladi va uni olib tashlash ilovani sindirishi mumkin.
-- Ma'lumotni RLS himoyalaydi, funksiyaning o'zi hech narsa oshkor qilmaydi.
