/* ══════════════════════════════════════════════
   SUPABASE CONFIG
   Uzupełnij wartości po utworzeniu projektu Supabase.
   Przy pustych wartościach aplikacja działa lokalnie przez localStorage.
   
   TRYBY PRACY:
   - enabled: true  → Supabase Auth + tabele zdalnie, konta z bazy, sesje w Auth
   - enabled: false → Akta lokalne w localStorage, konta demo, sesje w przeglądarce
══════════════════════════════════════════════ */

window.OCENIATOR_SUPABASE = {
  url: 'https://oemqmxqngwtxmhlmwubq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbXFteHFuZ3d0eG1obG13dWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODk1MTMsImV4cCI6MjA5MzU2NTUxM30.upbHqVN4hIb5wF3rTUY7l91M1k6DL7s_60i1HePK-OE',
  enabled: true
};

// Inicjalizacja klienta — uruchamia się gdy supabase-js jest już załadowany z CDN
(function initSbClient(){
  try{
    var c = window.OCENIATOR_SUPABASE;
    if(c.enabled && c.url && c.anonKey && window.supabase && window.supabase.createClient){
      window._sb = window.supabase.createClient(c.url, c.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
      console.log('[Supabase] Klient inicjalizowany — tryb zdalny aktywny');
    } else {
      console.log('[Supabase] Wyłączony — aplikacja pracuje lokalnie');
    }
  }catch(e){
    console.warn('[Supabase] Błąd inicjalizacji klienta:', e);
  }
})();
