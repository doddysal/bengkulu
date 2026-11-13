insert into public.pengaturan_situs(kunci,nilai) values
('footer_text','Kemanusiaan Untuk Semua.'),
('footer_address','Kota Bengkulu'),
('footer_phone',''),
('footer_email',''),
('footer_bg_color','#380a0a'),
('social_ig',''),('social_fb',''),('social_yt',''),('social_tw',''),('social_tt',''),
('sponsor_logos','')
on conflict(kunci) do nothing;