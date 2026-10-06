-- =============================================
-- Etapa 17 — Menú completo Pollería Don CALEB
-- Categorías y productos extraídos de la carta virtual
-- =============================================

-- Reemplazar la carta actual
delete from public.products;
delete from public.categories;

insert into public.categories (name, slug, sort_order, is_active) values
  ('BRASA', 'brasa', 1, true),
  ('SALCHIBRASAS', 'salchibrasas', 2, true),
  ('BROASTER', 'broaster', 3, true),
  ('BROASTER ESPECIAL', 'broaster-especial', 4, true),
  ('SALCHIBROSTERS', 'salchibrosters', 5, true),
  ('HOTDOG BROSHER', 'hotdog-broster', 6, true),
  ('KIDS', 'kids', 7, true),
  ('PARA LLEVAR', 'para-llevar', 8, true),
  ('PROMOCIONES', 'promociones', 9, true),
  ('COMBOS ESPECIALES', 'combos-especiales', 10, true),
  ('PROMOCIÓN DE TIK-TOK', 'promocion-tiktok', 11, true),
  ('MENU BRASA', 'menu-brasa', 12, true),
  ('PORCIONES', 'porciones', 13, true),
  ('REFRESCO', 'refresco', 14, true),
  ('MATES', 'mates', 15, true),
  ('GASEOSA', 'gaseosa', 16, true),
  ('FRUGOS Y AGUA', 'frugos-agua', 17, true),
  ('ADICIONALES', 'adicionales', 18, true),
  ('DESCARTABLE', 'descartable', 19, true);

insert into public.products (category_id, name, price, image_url, sort_order)
select c.id, p.name, p.price, p.image_url, p.sort_order
from (values
  -- 01. BRASA
  ('brasa', '1 POLLO ENTERO', 50.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_9790694091_1720192386.jpg', 1),
  ('brasa', '1 POLLO ENTERO + CHAUFA', 58.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_4763975506_1720192368.jpg', 2),
  ('brasa', '1/2 POLLO', 25.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_2747818125_1720192707.jpg', 3),
  ('brasa', '1/2 POLLO + CHAUFA', 31.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6226417472_1758223394.png', 4),
  ('brasa', '1/4 MOSTRO', 16.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0994638872_1758221489.jpeg', 5),
  ('brasa', '1/4 POLLO', 12.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2489134060_1758218918.png', 6),
  ('brasa', '1/8 POLLO', 8.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6835123269_1758220166.jpeg', 7),
  ('brasa', 'Choribrasa', 17.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5659003352_1769536801.jpg', 8),
  ('brasa', 'Chorimostro', 18.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7958802676_1769537403.png', 9),
  ('brasa', 'MOSTRITO', 9.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_9057348010_1720192777.jpg', 10),
  ('brasa', 'Pechuga a la plancha', 18.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9535206208_1760040514.jpeg', 11),
  ('brasa', 'Pechuga a la plancha + CH', 19.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6252044264_1760040527.jpeg', 12),

  -- 02. SALCHIBRASAS
  ('salchibrasas', '1/4 SALCHIBRASA', 15.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4993513152_1758221115.jpeg', 1),
  ('salchibrasas', '1/4 SALCHICHAUFA', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4048404860_1769537425.png', 2),
  ('salchibrasas', '1/8 SALCHIBRASA', 12.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5337048149_1758220133.jpeg', 3),
  ('salchibrasas', '1/8 SALCHICHAUFA', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4711438860_1758220988.jpeg', 4),
  ('salchibrasas', 'SALCHIPAPAS', 8.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3980002290_1758219649.jpeg', 5),
  ('salchibrasas', 'SALCHIPAPAS MONTADA', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4836258059_1758219658.jpg', 6),

  -- 03. BROASTER
  ('broaster', 'ALITAS', 8.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9680608841_1769537849.jpg', 1),
  ('broaster', 'ALITAS + CHAUFA', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9374160116_1769537925.png', 2),
  ('broaster', 'MUSLITOS', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5842026800_1758217790.jpg', 3),
  ('broaster', 'MUSLITOS +CHAUFA', 11.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2706630450_1758217824.jpeg', 4),
  ('broaster', 'PECHITO', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0778745542_1769539725.jpg', 5),
  ('broaster', 'PECHITO+CHAUFA', 11.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3020022937_1758217846.jpg', 6),
  ('broaster', 'PIERNITAS', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2544656422_1758218188.jpeg', 7),
  ('broaster', 'PIERNITAS +CHAUFA', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1840940811_1758218200.png', 8),

  -- 04. BROASTER ESPECIAL
  ('broaster-especial', 'MUSLITOS (2).', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9110208093_1769542864.jpg', 1),
  ('broaster-especial', 'ALITAS (2)', 15.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9596400020_1769541321.jpg', 2),
  ('broaster-especial', 'ALITAS (3)', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6800706384_1758223738.jpg', 3),
  ('broaster-especial', 'ALITAS (3)+CHAUFA', 20.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3176790197_1769539542.jpg', 4),
  ('broaster-especial', 'ALITAS(2)+CHAUFA', 16.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2673743764_1769557290.jpg', 5),
  ('broaster-especial', 'Crokkis', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2550313020_1769558276.jpg', 6),
  ('broaster-especial', 'Crokkis+ chaufa', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9540020841_1769558268.jpg', 7),
  ('broaster-especial', 'MUSLITOS (2)+CHAUFA', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5572568033_1769538878.jpg', 8),
  ('broaster-especial', 'PECHUGA (2)', 20.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5426903304_1769541301.jpg', 9),
  ('broaster-especial', 'PECHUGA (2) C/N CHAUFA', 21.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9062800887_1769557027.jpg', 10),
  ('broaster-especial', 'PIERNITA (3)', 20.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_8218006703_1720193092.jpg', 11),
  ('broaster-especial', 'PIERNITA (2)+CHAUFA', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1250676943_1769556995.jpg', 12),
  ('broaster-especial', 'PIERNITA(2)', 17.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3912120804_1758224525.jpg', 13),
  ('broaster-especial', 'PIERNITAS (3)+CHAUFA', 21.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7173856563_1769539575.jpg', 14),

  -- 05. SALCHIBROSTERS
  ('salchibrosters', 'ALITA( 2)+HD + CH', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6086198199_1769625183.jpg', 1),
  ('salchibrosters', 'ALITA(3)+HD+CH', 22.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2944950542_1769625551.jpg', 2),
  ('salchibrosters', 'ALITAS 2+HOTDOG', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4510638278_1769542851.jpg', 3),
  ('salchibrosters', 'ALITAS 3+HOTDOG', 21.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2655797403_1769625199.jpg', 4),
  ('salchibrosters', 'MUSLITO (2)+HD+CH', 22.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9576600124_1769627777.jpg', 5),
  ('salchibrosters', 'MUSLITOS 2+HOTDOG', 21.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0400018151_1769627772.jpg', 6),
  ('salchibrosters', 'PECHO 2+HOTDOG', 23.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4034870160_1769627350.jpg', 7),
  ('salchibrosters', 'PECHO(2)+HD+CH', 24.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7829611299_1769627357.jpg', 8),
  ('salchibrosters', 'PIERNA(2)+HD+CH', 20.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1122514317_1769626022.jpg', 9),
  ('salchibrosters', 'PIERNA(3)+HD+CH', 23.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2586710078_1769626402.jpg', 10),
  ('salchibrosters', 'PIERNITAS 2+HOTDOG', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4504880961_1769625917.jpg', 11),
  ('salchibrosters', 'PIERNITAS 3+HOTDOG', 22.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6016472147_1769626425.jpg', 12),

  -- 06. HOTDOG BROSHER
  ('hotdog-broster', 'Alitas +CH+HD', 12.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8095965347_1769558448.jpg', 1),
  ('hotdog-broster', 'Alitas +hotdog', 11.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1679147667_1769559220.jpg', 2),
  ('hotdog-broster', 'crokkis + CH + HD', 22.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7157500067_1769560098.jpg', 3),
  ('hotdog-broster', 'Crokkis + HOTDOG', 21.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0168447115_1769560104.jpg', 4),
  ('hotdog-broster', 'MUSLITO+HOTDOG', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9805409077_1769542825.jpg', 5),
  ('hotdog-broster', 'Muslo+hod+chaufa', 14.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2502085613_1769559235.jpg', 6),
  ('hotdog-broster', 'PECHITO+HOTDOG', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5574788002_1769559244.jpg', 7),
  ('hotdog-broster', 'Pecho +CH+HD', 14.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9538430306_1769538765.jpg', 8),
  ('hotdog-broster', 'PIERNITA+HOTDOG', 12.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5061401000_1769559261.jpg', 9),
  ('hotdog-broster', 'Piernitas+CH+HD', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3107141786_1769558480.jpg', 10),

  -- 07. KIDS
  ('kids', '1/8 + CHORIZO + gaseosa', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4426548486_1769629284.jpg', 1),
  ('kids', '1/8 KIDS+GASEOSA', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0501911583_1769629400.jpg', 2),
  ('kids', 'Alita Krispy', 15.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8500173000_1769630715.jpg', 3),
  ('kids', 'Cono crunch', 15.00, null, 4),
  ('kids', 'Cono kids', 10.00, null, 5),
  ('kids', 'Crokkis kids', 14.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9953629680_1769631478.jpg', 6),
  ('kids', 'Crokkis kids + helado', 16.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2950004485_1769718548.jpg', 7),
  ('kids', 'Crokkis kids y chaufa', 15.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7005921692_1769631093.jpg', 8),
  ('kids', 'Master cono', 12.00, null, 9),
  ('kids', 'Piernitas Krispy + frugos', 16.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9399215816_1769630488.jpg', 10),

  -- 08. PARA LLEVAR
  ('para-llevar', '1/8 kids + CHORIZO para llevar', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2004060300_1769731277.jpg', 1),
  ('para-llevar', '1/8 kids + HOTDOG para llevar', 13.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7779680198_1769731283.jpg', 2),
  ('para-llevar', 'Crokkis + chaufa para llevar', 19.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5590064007_1769731288.jpg', 3),
  ('para-llevar', 'Crokkis kids para llevar', 14.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0770946347_1769731716.jpg', 4),
  ('para-llevar', 'Crokkis para llevar', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9630065982_1769731721.jpg', 5),

  -- 09. PROMOCIONES
  ('promociones', '½ pollo + chaufa y gaseosa descartable COCA de 1½Lt', 38.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0389560733_1774554598.jpg', 1),
  ('promociones', '½ pollo + chaufa y gaseosa descartable INCA de 1½Lt', 38.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7429270030_1774553449.jpg', 2),
  ('promociones', '½ pollo + chaufa y gaseosa vidrio COCA de 1½Lt', 38.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1609450060_1774554609.jpg', 3),
  ('promociones', '½ pollo + chaufa y gaseosa vidrio INCA de 1½Lt', 38.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7959057705_1774554616.jpg', 4),
  ('promociones', '½ pollo y gaseosa descartable COCA de 1½ Lt', 32.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3924771036_1774554876.jpg', 5),
  ('promociones', '½ pollo y gaseosa descartable INCA de 1½Lt', 32.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0000147260_1774554884.jpg', 6),
  ('promociones', '½ pollo y gaseosa vidrio COCA de 1½Lt', 32.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8918028939_1774554890.jpg', 7),
  ('promociones', '½ pollo y gaseosa vidrio INCA de 1½Lt', 32.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5346931269_1774554895.jpg', 8),
  ('promociones', '4 alitas + gaseosa', 25.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0804616946_1774555021.jpg', 9),
  ('promociones', '4 piernitas + gaseosa', 25.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6214580902_1774555025.jpg', 10),
  ('promociones', 'Pollo entero + chaufa y gaseosa descartable COCA de 1½ Lt', 65.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0297256724_1769732755.jpg', 11),
  ('promociones', 'Pollo entero + chaufa y gaseosa descartable INCA de 1½Lt', 65.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2108080047_1769732736.jpg', 12),
  ('promociones', 'Pollo entero + chaufa y gaseosa vidrio COCA de1½ Lt', 65.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0111260278_1769733518.jpg', 13),
  ('promociones', 'Pollo entero + chaufa y gaseosa vidrio INCA de 1½ Lt', 65.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5865203039_1769735731.jpg', 14),
  ('promociones', 'Pollo entero y gaseosa descartable COCA de 1½Lt', 57.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8429509406_1769732694.jpg', 15),
  ('promociones', 'Pollo entero y gaseosa descartable INCA de 1½Lt', 57.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0813885065_1769732671.jpg', 16),
  ('promociones', 'Pollo entero y gaseosa vidrio COCA de 1½Lt', 57.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8617402721_1769732659.jpg', 17),
  ('promociones', 'Pollo entero y gaseosa vidrio INCA de 1½Lt', 57.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6052295500_1769733512.jpg', 18),

  -- 10. COMBOS ESPECIALES
  ('combos-especiales', '½ pollo + limonada', 32.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5058139865_1774549608.jpg', 1),
  ('combos-especiales', '½ pollo + maracuyá', 32.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_5209357508_1774549614.jpg', 2),
  ('combos-especiales', '½ pollo con chaufa+ limonada', 38.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3907005852_1774549621.jpg', 3),
  ('combos-especiales', '½ pollo con chaufa+ maracuyá', 38.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4534774010_1774549891.jpg', 4),
  ('combos-especiales', 'Crokkis + anís', 17.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4433043053_1774550988.jpg', 5),
  ('combos-especiales', 'Crokkis + manzanilla', 17.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3178473585_1774551708.jpg', 6),
  ('combos-especiales', 'Crokkis + te', 17.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8489159006_1774551405.jpg', 7),
  ('combos-especiales', 'Crokkis con chaufa + manzanilla', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8643609071_1774551713.jpg', 8),
  ('combos-especiales', 'Crokkis con chaufa + te', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1231359291_1774551410.jpg', 9),
  ('combos-especiales', 'Crokkis con chaufa+ anís', 18.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9566991805_1774550996.jpg', 10),
  ('combos-especiales', 'Pollo entero + limonada', 56.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6948662098_1774548644.jpg', 11),
  ('combos-especiales', 'Pollo entero + maracuyá', 56.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0214603909_1774548638.jpg', 12),
  ('combos-especiales', 'Pollo entero con chaufa + maracuyá', 64.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8606753135_1774548625.jpg', 13),
  ('combos-especiales', 'Pollo entero con chaufa+ limonada', 64.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7060084456_1774548570.jpg', 14),

  -- 11. PROMOCIÓN DE TIK-TOK
  ('promocion-tiktok', '1/4+chaufa+hoddog+pepsi (Pecho, pierna)', 18.00, null, 1),
  ('promocion-tiktok', '1/4+chorizo+chaufa+pepsi', 18.00, null, 2),

  -- 12. MENU BRASA
  ('menu-brasa', '1/8 + SOPA', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_3728306092_1720192740.jpg', 1),
  ('menu-brasa', '1/8 + SOPA + CHAUFA', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_3591401805_1720192759.jpg', 2),

  -- 13. PORCIONES
  ('porciones', '1 PORCION DE ARROZ BLANCO', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0584304000_1758768372.png', 1),
  ('porciones', '1/2 de chaufa', 4.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1720305050_1758768357.png', 2),
  ('porciones', '1/2 porcion de papa', 4.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0379194933_1758769719.jpg', 3),
  ('porciones', '1/2 porción de ensalada', 3.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3626600036_1758769790.jpg', 4),
  ('porciones', 'Aguadito', 1.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3972700576_1758768060.jpg', 5),
  ('porciones', 'PORCION DE CHAUFA', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_9970655347_1720193737.jpg', 6),
  ('porciones', 'PORCION DE PAPA', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_9630108006_1720193745.jpg', 7),
  ('porciones', 'PORCION ENSALADA', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1816110097_1758769587.jpg', 8),

  -- 14. REFRESCO
  ('refresco', '1 L de naranja', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4099368221_1746321868.jpeg', 1),
  ('refresco', '1 LT MAIZ MORADA', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_8686488205_1720192289.jpg', 2),
  ('refresco', '1 LT MARACUYA', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_8880474990_1720192351.jpg', 3),
  ('refresco', '1.L refresco de piña', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2007690697_1758768196.jpg', 4),
  ('refresco', '1/2 de limonada', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2046506549_1758765241.jpeg', 5),
  ('refresco', '1/2 de morada', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3930456003_1758765436.jpeg', 6),
  ('refresco', '1/2 L de Piña', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3630821077_1758769887.jpg', 7),
  ('refresco', '1/2 L naranja', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9572889813_1758765419.jpg', 8),
  ('refresco', '1/2 maracuya', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9101910758_1758765426.jpeg', 9),
  ('refresco', '1L DE LIMONADA', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_9495331054_1720192092.jpg', 10),
  ('refresco', 'Naranja 1L', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000001_5038268018_1757629112.jpeg', 11),

  -- 15. MATES
  ('mates', 'ANIS', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1738620059_1758770440.png', 1),
  ('mates', 'Café ☕', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2130003793_1746310174.jpeg', 2),
  ('mates', 'MANZANILLA', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_0472330604_1720193609.jpg', 3),
  ('mates', 'TE', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2050760954_1758770450.jpg', 4),
  ('mates', 'Una jarra de infusión', 10.00, null, 5),

  -- 16. GASEOSA
  ('gaseosa', 'PERSONAL', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1760272405_1746310230.jpeg', 1),
  ('gaseosa', 'COCA 1LT', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8677036974_1768073063.jpg', 2),
  ('gaseosa', 'COCA 1 1/2 LT', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8857418002_1768073077.jpg', 3),
  ('gaseosa', 'FANTA 1 1/2 LT', 8.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_2446000009_1720193339.jpg', 4),
  ('gaseosa', 'GORDITA', 4.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4107491381_1763677681.jpg', 5),
  ('gaseosa', 'INCA 1 1/2 LT', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9594994573_1768073119.jpg', 6),
  ('gaseosa', 'INCA 1LT', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1457700205_1768073180.jpg', 7),
  ('gaseosa', 'JUMBO', 4.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7800275981_1763677871.jpg', 8),
  ('gaseosa', 'pirañita', 1.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_6573804584_1758769336.png', 9),

  -- 17. FRUGOS Y AGUA
  ('frugos-agua', 'Agua "Don Caleb" de 600ml.', 1.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4089330180_1778693747.jpg', 1),
  ('frugos-agua', 'AGUA LA "DON CALEN" DE 1L.', 2.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1203099770_1778693727.jpg', 2),
  ('frugos-agua', 'Agua San Luis 750ml', 2.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1942122008_1778693633.jpg', 3),
  ('frugos-agua', 'FRUGOS 1 1/2 LT', 7.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3095556015_1758769014.jpg', 4),
  ('frugos-agua', 'FRUGOS 1 LT', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1938018703_1758769046.jpeg', 5),
  ('frugos-agua', 'FRUGOS CAJITA 235 ML', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_5497220197_1720193399.jpg', 6),

  -- 18. ADICIONALES
  ('adicionales', '1/2 pollo presa sola', 16.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0212883917_1758765492.jpg', 1),
  ('adicionales', '1/4 presa solo', 8.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0076904104_1758767706.jpg', 2),
  ('adicionales', '1/8 presa solo', 4.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_8431543524_1758767816.jpg', 3),
  ('adicionales', 'Alita presa solo', 4.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4507251704_1758768117.jpg', 4),
  ('adicionales', 'Crema 0.50', 0.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0657418265_1768082694.png', 5),
  ('adicionales', 'Ensalada pequeña', 1.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0029408009_1758768795.jpg', 6),
  ('adicionales', 'Helado', 3.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4600990290_1769282489.jpg', 7),
  ('adicionales', 'HELADOS????????', 3.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_6671979067_1789148926.jpg', 8),
  ('adicionales', 'Huevo frito', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7102983217_1758769206.jpg', 9),
  ('adicionales', 'Muslo presa solo', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0196850303_1768083293.jpg', 10),
  ('adicionales', 'Pecho presa solo', 7.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4677616457_1769713170.jpg', 11),
  ('adicionales', 'Pierna presa solo', 5.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_4075858894_1769713502.jpg', 12),
  ('adicionales', 'POLLO entero presa solo', 31.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_1184879000_1758769297.jpg', 13),
  ('adicionales', 'Porción de chorizo', 5.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9446034330_1769282701.jpg', 14),
  ('adicionales', 'Porción de HOTDOG', 3.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0364005649_1768082576.jpg', 15),

  -- 21. DESCARTABLE
  ('descartable', 'bombita', 2.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2065268904_1768069304.jpg', 1),
  ('descartable', 'COCA 2 1/2 LT', 12.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3834440809_1768072144.jpg', 2),
  ('descartable', 'COCA 3LT', 15.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0570729502_1768071977.jpg', 3),
  ('descartable', 'COCA COLA 600 ML', 3.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_3563092262_1758770058.jpeg', 4),
  ('descartable', 'Coca cola descartable de 1½ lt', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_9903873743_1768071393.jpg', 5),
  ('descartable', 'FANTA 3LT', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7285685909_1768071451.jpg', 6),
  ('descartable', 'FANTA 500 ML', 2.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_0281650967_1720193360.jpg', 7),
  ('descartable', 'INCA 3LT', 15.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_0631858006_1768071952.jpg', 8),
  ('descartable', 'INCA 2 1/2 LT', 12.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_7099164598_1768071939.jpg', 9),
  ('descartable', 'Inca cola descartable de 1½ lt', 9.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2494991720_1768071411.jpg', 10),
  ('descartable', 'INCA KOLA 600 ML', 3.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_7039283431_1720193591.jpg', 11),
  ('descartable', 'POWER PERSONAL', 2.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_8475956223_1720193803.jpg', 12),
  ('descartable', 'SPORADE 1 1/2 LT', 6.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_5893471721_1720193821.jpg', 13),
  ('descartable', 'SPORADE PERSONAL', 2.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_6535091852_1720193828.jpg', 14),
  ('descartable', 'SPORATE 3LT', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_8000482515_1789155616.jpg', 15),
  ('descartable', 'SPRITE 3LT', 10.00, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/202400000002_2663602007_1768071428.jpg', 16),
  ('descartable', 'SPRITE 500 ML', 2.50, 'https://restopolloybrostercaleb1.apiworking.co/archivos/productos/201900000001_2067951700_1789155642.jpg', 17)
) as p(cat_slug, name, price, image_url, sort_order)
join public.categories c on c.slug = p.cat_slug;

-- Nombre del negocio
update public.business_settings
set business_name = 'Pollería Don CALEB'
where id = 1;
