update public.pengaturan_situs set
  header_atas=regexp_replace(coalesce(header_atas,''),'[Ã‚ÃƒÃ¢Ã¯Ã°ï¿½]','','g'),
  header_bawah=regexp_replace(coalesce(header_bawah,''),'[Ã‚ÃƒÃ¢Ã¯Ã°ï¿½]','','g'),
  footer_text=regexp_replace(coalesce(footer_text,''),'[Ã‚ÃƒÃ¢Ã¯Ã°ï¿½]','','g'),
  footer_address=regexp_replace(coalesce(footer_address,''),'[Ã‚ÃƒÃ¢Ã¯Ã°ï¿½]','','g');