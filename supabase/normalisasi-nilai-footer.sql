update public.pengaturan_situs
set nilai = substring(nilai from 'href="([^"]+)"')
where kunci in ('social_ig','social_fb','social_tw','social_yt','social_tt','sponsor_logos')
  and nilai like '%href="%';

insert into public.pengaturan_situs(kunci,nilai,diperbarui_pada)
values
('social_ig','https://www.instagram.com/pmi_kotabengkulu/?hl=en',now()),
('sponsor_logos','["https://www.pmi.or.id/png/logo.png"]',now())
on conflict(kunci) do update set nilai=excluded.nilai,diperbarui_pada=now();