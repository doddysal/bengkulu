insert into public.pengaturan_situs(kunci,nilai) values
('footer_judul','Palang Merah Indonesia Kota Bengkulu'),
('footer_alamat','Kota Bengkulu'),
('footer_telepon',''),
('footer_email',''),
('footer_keterangan',''),
('footer_sponsor',''),
('footer_instagram',''),
('footer_facebook',''),
('footer_youtube',''),
('footer_x','')
on conflict(kunci) do nothing;