-- =============================================
-- Etapa 18 — Ajustes oficiales Pollería Don Caleb
-- =============================================

update public.business_settings
set
  business_name = 'Pollería Don Caleb',
  whatsapp = '986749190',
  open_time = '12:00',
  close_time = '22:30',
  is_open = true
where id = 1;
