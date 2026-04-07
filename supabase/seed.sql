DO $$
DECLARE
  v_shop_id uuid;
  v_user_id uuid;
  v_ids     uuid[];
BEGIN
  SELECT id, owner_id INTO v_shop_id, v_user_id FROM shops LIMIT 1;

  -- =====================
  -- MIJOZLAR (18 ta)
  -- =====================
  WITH ins AS (
    INSERT INTO customers (shop_id, name, phone, note) VALUES
      (v_shop_id, 'Alibek Toshmatov',   '+998901112233', null),
      (v_shop_id, 'Jasur Karimov',      '+998912223344', 'Har juma to''laydi'),
      (v_shop_id, 'Bobur Rahimov',      '+998933334455', null),
      (v_shop_id, 'Sardor Umarov',      '+998944445566', 'Ishonchli mijoz'),
      (v_shop_id, 'Ulugbek Nazarov',    '+998955556677', null),
      (v_shop_id, 'Sherzod Hasanov',    '+998901234567', null),
      (v_shop_id, 'Doniyor Yusupov',    '+998911111222', null),
      (v_shop_id, 'Mirzo Ergashev',     '+998932222333', 'Qo''shni'),
      (v_shop_id, 'Nodir Mirzayev',     '+998943333444', null),
      (v_shop_id, 'Otabek Xolmatov',    '+998954444555', null),
      (v_shop_id, 'Malika Abdullayeva', '+998905555666', null),
      (v_shop_id, 'Dilnoza Qodirova',   '+998916666777', 'Har oy oxirida to''laydi'),
      (v_shop_id, 'Feruza Sultonova',   '+998937777888', null),
      (v_shop_id, 'Zulfiya Baxtiyorova','+998948888999', null),
      (v_shop_id, 'Kamola Ismoilova',   '+998959999000', null),
      (v_shop_id, 'Ravshan Sotvoldiyev','+998901010101', null),
      (v_shop_id, 'Sanjar Normatov',    '+998912020202', 'Do''stim'),
      (v_shop_id, 'Jamshid Qosimov',    '+998933030303', null)
    RETURNING id
  )
  SELECT array_agg(id ORDER BY id) INTO v_ids FROM ins;

  -- =====================
  -- QARZLAR va TO'LOVLAR
  -- =====================
  INSERT INTO debts (shop_id, customer_id, amount, description, created_by, created_at) VALUES

  -- Alibek Toshmatov [1]
  (v_shop_id, v_ids[1],  250000, 'Un, yog''',          v_user_id, NOW() - INTERVAL '45 days'),
  (v_shop_id, v_ids[1],  180000, 'Guruch, shakar',      v_user_id, NOW() - INTERVAL '30 days'),
  (v_shop_id, v_ids[1], -150000, 'Qisman to''lov',      v_user_id, NOW() - INTERVAL '20 days'),
  (v_shop_id, v_ids[1],  120000, 'Non, tuxum',          v_user_id, NOW() - INTERVAL '10 days'),

  -- Jasur Karimov [2]
  (v_shop_id, v_ids[2],  350000, 'Ulgurji xarid',       v_user_id, NOW() - INTERVAL '40 days'),
  (v_shop_id, v_ids[2], -200000, 'To''lov',             v_user_id, NOW() - INTERVAL '25 days'),
  (v_shop_id, v_ids[2], -150000, 'To''lov',             v_user_id, NOW() - INTERVAL '5 days'),

  -- Bobur Rahimov [3]
  (v_shop_id, v_ids[3],  90000,  'Go''sht',             v_user_id, NOW() - INTERVAL '20 days'),
  (v_shop_id, v_ids[3],  60000,  'Sabzavotlar',         v_user_id, NOW() - INTERVAL '12 days'),
  (v_shop_id, v_ids[3], -50000,  'To''lov',             v_user_id, NOW() - INTERVAL '3 days'),

  -- Sardor Umarov [4]
  (v_shop_id, v_ids[4],  500000, 'Oylik xarid',         v_user_id, NOW() - INTERVAL '35 days'),
  (v_shop_id, v_ids[4], -300000, 'To''lov',             v_user_id, NOW() - INTERVAL '15 days'),
  (v_shop_id, v_ids[4],  150000, 'Qo''shimcha xarid',   v_user_id, NOW() - INTERVAL '7 days'),
  (v_shop_id, v_ids[4], -100000, 'To''lov',             v_user_id, NOW() - INTERVAL '2 days'),

  -- Ulugbek Nazarov [5]
  (v_shop_id, v_ids[5],  200000, 'Yog'', un',           v_user_id, NOW() - INTERVAL '28 days'),
  (v_shop_id, v_ids[5],  80000,  'Non, sut',            v_user_id, NOW() - INTERVAL '14 days'),

  -- Sherzod Hasanov [6]
  (v_shop_id, v_ids[6],  75000,  'Choy, shakar',        v_user_id, NOW() - INTERVAL '18 days'),
  (v_shop_id, v_ids[6], -75000,  'To''liq to''lov',     v_user_id, NOW() - INTERVAL '5 days'),

  -- Doniyor Yusupov [7]
  (v_shop_id, v_ids[7],  430000, 'Ulgurji xarid',       v_user_id, NOW() - INTERVAL '50 days'),
  (v_shop_id, v_ids[7], -100000, 'To''lov',             v_user_id, NOW() - INTERVAL '35 days'),
  (v_shop_id, v_ids[7], -100000, 'To''lov',             v_user_id, NOW() - INTERVAL '20 days'),
  (v_shop_id, v_ids[7],  120000, 'Qo''shimcha',         v_user_id, NOW() - INTERVAL '8 days'),

  -- Mirzo Ergashev [8]
  (v_shop_id, v_ids[8],  55000,  'Non, tuxum',          v_user_id, NOW() - INTERVAL '10 days'),
  (v_shop_id, v_ids[8],  45000,  'Yog''',               v_user_id, NOW() - INTERVAL '4 days'),

  -- Nodir Mirzayev [9]
  (v_shop_id, v_ids[9],  310000, 'Oylik oziq-ovqat',    v_user_id, NOW() - INTERVAL '32 days'),
  (v_shop_id, v_ids[9], -150000, 'To''lov',             v_user_id, NOW() - INTERVAL '18 days'),
  (v_shop_id, v_ids[9], -100000, 'To''lov',             v_user_id, NOW() - INTERVAL '6 days'),

  -- Otabek Xolmatov [10]
  (v_shop_id, v_ids[10], 185000, 'Guruch, yog''',       v_user_id, NOW() - INTERVAL '22 days'),
  (v_shop_id, v_ids[10], -85000, 'To''lov',             v_user_id, NOW() - INTERVAL '9 days'),

  -- Malika Abdullayeva [11]
  (v_shop_id, v_ids[11], 95000,  'Sabzavot, meva',      v_user_id, NOW() - INTERVAL '15 days'),
  (v_shop_id, v_ids[11], 65000,  'Non, sut',            v_user_id, NOW() - INTERVAL '6 days'),
  (v_shop_id, v_ids[11],-60000,  'To''lov',             v_user_id, NOW() - INTERVAL '2 days'),

  -- Dilnoza Qodirova [12]
  (v_shop_id, v_ids[12], 270000, 'Oylik xarid',         v_user_id, NOW() - INTERVAL '31 days'),
  (v_shop_id, v_ids[12],-270000, 'To''liq to''lov',     v_user_id, NOW() - INTERVAL '1 days'),

  -- Feruza Sultonova [13]
  (v_shop_id, v_ids[13], 140000, 'Un, shakar, choy',    v_user_id, NOW() - INTERVAL '25 days'),
  (v_shop_id, v_ids[13], -70000, 'To''lov',             v_user_id, NOW() - INTERVAL '11 days'),

  -- Zulfiya Baxtiyorova [14]
  (v_shop_id, v_ids[14], 88000,  'Meva-sabzavot',       v_user_id, NOW() - INTERVAL '17 days'),

  -- Kamola Ismoilova [15]
  (v_shop_id, v_ids[15], 220000, 'Ulgurji xarid',       v_user_id, NOW() - INTERVAL '38 days'),
  (v_shop_id, v_ids[15],-120000, 'To''lov',             v_user_id, NOW() - INTERVAL '22 days'),
  (v_shop_id, v_ids[15], 80000,  'Qo''shimcha',         v_user_id, NOW() - INTERVAL '8 days'),

  -- Ravshan Sotvoldiyev [16]
  (v_shop_id, v_ids[16], 160000, 'Go''sht, guruch',     v_user_id, NOW() - INTERVAL '13 days'),
  (v_shop_id, v_ids[16], -80000, 'To''lov',             v_user_id, NOW() - INTERVAL '4 days'),

  -- Sanjar Normatov [17]
  (v_shop_id, v_ids[17], 50000,  'Non, tuxum',          v_user_id, NOW() - INTERVAL '8 days'),
  (v_shop_id, v_ids[17], 70000,  'Yog'', shakar',       v_user_id, NOW() - INTERVAL '3 days'),

  -- Jamshid Qosimov [18]
  (v_shop_id, v_ids[18], 390000, 'Katta xarid',         v_user_id, NOW() - INTERVAL '44 days'),
  (v_shop_id, v_ids[18],-200000, 'To''lov',             v_user_id, NOW() - INTERVAL '30 days'),
  (v_shop_id, v_ids[18], 110000, 'Qo''shimcha xarid',   v_user_id, NOW() - INTERVAL '12 days'),
  (v_shop_id, v_ids[18],-100000, 'To''lov',             v_user_id, NOW() - INTERVAL '3 days');

END $$;
