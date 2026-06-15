-- Demo seed — ຂໍ້ມູນຕົວຢ່າງໂຮງແຮມ (ອີງຈາກ seed-hotel-demo.ts + seed-billing-demo.ts)
-- ວັນທີການຈອງໃຊ້ CURRENT_DATE ເພື່ອໃຫ້ປະຕິທິນ ແລະ ລາຍງານຍັງໃຊ້ງານໄດ້ຫຼັງ migrate

--> statement-breakpoint
INSERT INTO hotel_settings (id, name, name_en, address, phone, tax_id, updated_at) VALUES
(
  'default',
  'ໂຮງແຮມສາຍແສງ',
  'Sai Saeng Hotel',
  'ບ້ານທາດຫຼວງ, ນະຄອນຫຼວງວຽງຈັນ',
  '+856 21 123 456',
  'TAX-001',
  NOW()
);

--> statement-breakpoint
INSERT INTO room_type (id, name, description, base_price, capacity) VALUES
(
  'demo-room-type-standard',
  'ຫ້ອງມາດຕະຖານ',
  'ຫ້ອງພັກມາດຕະຖານ ມີຕຽງຄູ່ ແລະ ຫ້ອງນ້ຳສ່ວນຕົວ',
  450000,
  2
),
(
  'demo-room-type-deluxe',
  'ຫ້ອງດີລັກ',
  'ຫ້ອງກວ້າງຂວາງ ມີວິວເມືອງ ແລະ ມິນິບາ',
  750000,
  2
),
(
  'demo-room-type-suite',
  'ຊຸດ',
  'ຫ້ອງຊຸດພິເສດ ມີຫ້ອງນັ່ງລິວິງ ແລະ ອ່າງອາບນ້ຳ',
  1200000,
  4
);

--> statement-breakpoint
INSERT INTO room (id, room_number, floor, room_type_id, status) VALUES
('demo-room-101', '101', 1, 'demo-room-type-standard', 'available'),
('demo-room-102', '102', 1, 'demo-room-type-standard', 'occupied'),
('demo-room-103', '103', 1, 'demo-room-type-deluxe', 'available'),
('demo-room-104', '104', 1, 'demo-room-type-deluxe', 'cleaning'),
('demo-room-201', '201', 2, 'demo-room-type-deluxe', 'available'),
('demo-room-202', '202', 2, 'demo-room-type-suite', 'available'),
('demo-room-203', '203', 2, 'demo-room-type-suite', 'maintenance');

--> statement-breakpoint
INSERT INTO guest (id, full_name, phone, id_document, nationality) VALUES
('demo-guest-somchai', 'ສົມໄຊ ວົງສະຫວັນ', '020 55123456', 'P1234567', 'ລາວ'),
('demo-guest-noy', 'ນ້ອຍ ພົມມະຈັນ', '020 99887766', 'N9876543', 'ລາວ'),
('demo-guest-john', 'John Smith', '+66 81 234 5678', 'US44556677', 'ອາເມລິກາ'),
('demo-guest-lin', 'Lin Wei', '+86 138 0000 1111', 'CN88990011', 'ຈີນ'),
('demo-guest-anna', 'Anna Müller', '+49 170 1234567', 'DE11223344', 'ເຢຍລະມັນ');

--> statement-breakpoint
INSERT INTO reservation (
  id, guest_id, room_id, check_in_date, check_out_date, guests_count, status, created_at
) VALUES
(
  'demo-res-101-upcoming',
  'demo-guest-somchai',
  'demo-room-101',
  (CURRENT_DATE + INTERVAL '2 days')::date,
  (CURRENT_DATE + INTERVAL '5 days')::date,
  2,
  'booked',
  NOW()
),
(
  'demo-res-102-stay',
  'demo-guest-noy',
  'demo-room-102',
  (CURRENT_DATE - INTERVAL '1 day')::date,
  CURRENT_DATE,
  1,
  'checked_in',
  NOW()
),
(
  'demo-res-103-booked',
  'demo-guest-john',
  'demo-room-103',
  (CURRENT_DATE + INTERVAL '7 days')::date,
  (CURRENT_DATE + INTERVAL '10 days')::date,
  2,
  'booked',
  NOW()
),
(
  'demo-res-201-booked',
  'demo-guest-lin',
  'demo-room-201',
  CURRENT_DATE,
  (CURRENT_DATE + INTERVAL '3 days')::date,
  3,
  'booked',
  NOW()
),
(
  'demo-res-202-suite',
  'demo-guest-anna',
  'demo-room-202',
  (CURRENT_DATE + INTERVAL '14 days')::date,
  (CURRENT_DATE + INTERVAL '18 days')::date,
  4,
  'booked',
  NOW()
),
(
  'demo-res-cancelled',
  'demo-guest-john',
  'demo-room-104',
  (CURRENT_DATE - INTERVAL '10 days')::date,
  (CURRENT_DATE - INTERVAL '7 days')::date,
  2,
  'cancelled',
  NOW()
),
(
  'demo-res-done',
  'demo-guest-john',
  'demo-room-103',
  (CURRENT_DATE - INTERVAL '3 days')::date,
  (CURRENT_DATE - INTERVAL '1 day')::date,
  2,
  'checked_out',
  NOW()
),
(
  'demo-res-done-2',
  'demo-guest-anna',
  'demo-room-202',
  (CURRENT_DATE - INTERVAL '5 days')::date,
  (CURRENT_DATE - INTERVAL '2 days')::date,
  4,
  'checked_out',
  NOW()
);

--> statement-breakpoint
-- ໃບບິນ demo-res-done: ຫ້ອງ 103 × 2 ຄືນ (750,000) + ມິນິບາ 50,000 + ພາສี 10%
INSERT INTO invoice (id, reservation_id, subtotal, tax_rate, tax_amount, total, status, created_at) VALUES
(
  'demo-inv-unpaid',
  'demo-res-done',
  1550000,
  10,
  155000,
  1705000,
  'unpaid',
  NOW()
),
(
  'demo-inv-partial',
  'demo-res-done-2',
  3680000,
  10,
  368000,
  4048000,
  'partially_paid',
  NOW()
);

--> statement-breakpoint
INSERT INTO invoice_item (id, invoice_id, description, qty, unit_price, amount) VALUES
(
  'demo-inv-item-1-room',
  'demo-inv-unpaid',
  'ຄ່າຫ້ອງ 103 (ຫ້ອງດີລັກ) × 2 ຄືນ',
  2,
  750000,
  1500000
),
(
  'demo-inv-item-1-extra',
  'demo-inv-unpaid',
  'ມິນິບາ',
  1,
  50000,
  50000
),
(
  'demo-inv-item-2-room',
  'demo-inv-partial',
  'ຄ່າຫ້ອງ 202 (ຊຸດ) × 3 ຄືນ',
  3,
  1200000,
  3600000
),
(
  'demo-inv-item-2-extra',
  'demo-inv-partial',
  'ບໍລິການຊາກຜົນ',
  1,
  80000,
  80000
);

--> statement-breakpoint
INSERT INTO payment (id, invoice_id, method, amount, paid_at, recorded_by_user_id) VALUES
(
  'demo-payment-partial',
  'demo-inv-partial',
  'bank_transfer',
  2024000,
  NOW(),
  'receptionist_default'
);
