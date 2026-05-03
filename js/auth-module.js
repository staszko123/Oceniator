export function authInit(){
  const usersKey='oc_users_v1';
  const sessionKey='oc_session_v1';
  const roles={admin:'Administrator',leader:'Lider',assessor:'Oceniający',viewer:'Podgląd'};

  function users(){
    let u=JSON.parse(localStorage.getItem(usersKey)||'null');
    if(!u){
      u=[
        {id:1,l:'admin',p:'admin123',r:'admin',n:'Administrator systemu'},
        {id:2,l:'lider',p:'lider123',r:'leader',n:'Lider zespołu'},
        {id:3,l:'oceniajacy',p:'ocena123',r:'assessor',n:'Oceniający'},
        {id:4,l:'podglad',p:'podglad123',r:'viewer',n:'Użytkownik podglądu'}
      ];
      localStorage.setItem(usersKey,JSON.stringify(u));
    }
    return u;
  }

  function session(){return JSON.parse(localStorage.getItem(sessionKey)||'null');}

  function injectStyle(){
    if(document.getElementById('oc-login-style')) return;
    const st=document.createElement('style');
    st.id='oc-login-style';
    st.textContent=`
      .oc-login-screen{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:28px;background:radial-gradient(circle at 18% 20%,rgba(13,148,136,.20),transparent 34%),linear-gradient(135deg,#0F172A,#13253B 52%,#134E4A);font-family:Poppins,Arial,sans-serif;color:#0F172A}
      .oc-login-wrap{width:min(1120px,100%);display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:stretch}
      .oc-welcome,.oc-login-card{background:rgba(255,255,255,.96);border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 70px rgba(2,6,23,.25);border-radius:28px;overflow:hidden}
      .oc-welcome{padding:34px;display:flex;flex-direction:column;justify-content:space-between;min-height:520px}
      .oc-kicker{display:inline-flex;align-items:center;gap:8px;width:max-content;padding:8px 12px;border-radius:999px;background:#DCFCE7;color:#166534;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}
      .oc-title{margin:18px 0 10px;font-size:38px;line-height:1.08;font-weight:800;color:#0F172A;letter-spacing:-.03em}
      .oc-lead{max-width:600px;margin:0;color:#475569;font-size:15px;line-height:1.7}
      .oc-login-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:30px}
      .oc-tile{border:1px solid #E2E8F0;border-radius:18px;padding:16px;background:#F8FAFC}
      .oc-tile-ico{font-size:24px;margin-bottom:8px}.oc-tile-title{font-size:13px;font-weight:800;color:#0F172A}.oc-tile-txt{margin-top:4px;font-size:11px;line-height:1.5;color:#64748B}
      .oc-footer-note{margin-top:24px;font-size:11px;color:#94A3B8}
      .oc-login-card{padding:30px;align-self:center}.oc-card-title{font-size:24px;font-weight:800;margin:0 0 6px;color:#0F172A}.oc-card-sub{margin:0 0 22px;font-size:13px;color:#64748B;line-height:1.55}
      .oc-field{margin-bottom:13px}.oc-field label{display:block;margin-bottom:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#64748B}.oc-field input{box-sizing:border-box;width:100%;border:1px solid #CBD5E1;background:#fff;color:#0F172A;border-radius:14px;padding:13px 14px;font:500 14px Poppins,Arial,sans-serif;outline:none}.oc-field input:focus{border-color:#0D9488;box-shadow:0 0 0 4px rgba(13,148,136,.12)}
      .oc-login-btn{width:100%;margin-top:6px;border:0;border-radius:15px;padding:13px 14px;background:#0D9488;color:#fff;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 12px 24px rgba(13,148,136,.25)}.oc-login-btn:hover{background:#0F766E}
      .oc-error{display:none;margin-top:12px;padding:10px 12px;border-radius:12px;background:#FEE2E2;color:#991B1B;font-size:12px;font-weight:700}.oc-demo{margin-top:18px;padding:14px;border:1px solid #E2E8F0;border-radius:16px;background:#F8FAFC;font-size:11px;color:#64748B;line-height:1.7}.oc-demo strong{color:#0F172A}
      .oc-userbar{display:flex;align-items:center;gap:8px;margin-left:auto}.oc-user-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border,#E2E8F0);background:var(--card,#fff);color:var(--text2,#475569);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:700}.oc-logout{border:1px solid var(--border,#E2E8F0);background:transparent;color:var(--text2,#475569);border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}
      @media(max-width:860px){.oc-login-wrap{grid-template-columns:1fr}.oc-welcome{min-height:auto}.oc-title{font-size:30px}.oc-login-actions{grid-template-columns:1fr}.oc-login-card{padding:24px}}
    `;
    document.head.appendChild(st);
  }

  function loginUI(){
    injectStyle();
    const old=document.getElementById('oc-login-screen');
    if(old) old.remove();
    const d=document.createElement('div');
    d.id='oc-login-screen';
    d.className='oc-login-screen';
    d.innerHTML=`
      <div class="oc-login-wrap">
        <section class="oc-welcome" aria-label="Ekran powitalny">
          <div>
            <div class="oc-kicker">📋 System Oceny Jakości</div>
            <h1 class="oc-title">Oceniator dla kontroli jakości PeP i P24</h1>
            <p class="oc-lead">Zaloguj się, aby rozpocząć ocenę rozmów, maili i działań w systemach. Po zalogowaniu przejdziesz do ewidencji, dashboardu, raportów oraz panelu administracyjnego zgodnie ze swoją rolą.</p>
            <div class="oc-login-actions">
              <div class="oc-tile"><div class="oc-tile-ico">📞</div><div class="oc-tile-title">Ocena rozmów</div><div class="oc-tile-txt">Karty jakości dla kontaktów telefonicznych.</div></div>
              <div class="oc-tile"><div class="oc-tile-ico">✉️</div><div class="oc-tile-title">Ocena maili</div><div class="oc-tile-txt">Weryfikacja odpowiedzi i kompletności spraw.</div></div>
              <div class="oc-tile"><div class="oc-tile-ico">📈</div><div class="oc-tile-title">Dashboard</div><div class="oc-tile-txt">Wyniki, cele, trendy i słabe punkty.</div></div>
              <div class="oc-tile"><div class="oc-tile-ico">⚙️</div><div class="oc-tile-title">Role i dostęp</div><div class="oc-tile-txt">Administrator zarządza użytkownikami i rolami.</div></div>
            </div>
          </div>
          <div class="oc-footer-note">Dane logowania w tej wersji są zapisane lokalnie w przeglądarce.</div>
        </section>
        <section class="oc-login-card" aria-label="Logowanie">
          <h2 class="oc-card-title">Zaloguj się</h2>
          <p class="oc-card-sub">Wybierz konto zgodne z rolą. Uprawnienia zostaną ustawione automatycznie.</p>
          <form onsubmit="window._login(event)">
            <div class="oc-field"><label>Login</label><input id="l" placeholder="np. admin" autocomplete="username" autofocus></div>
            <div class="oc-field"><label>Hasło</label><input id="p" type="password" placeholder="••••••••" autocomplete="current-password"></div>
            <button class="oc-login-btn" type="submit">Wejdź do aplikacji</button>
            <div class="oc-error" id="oc-login-error">Nieprawidłowy login lub hasło.</div>
          </form>
          <div class="oc-demo"><strong>Konta startowe:</strong><br>admin / admin123<br>lider / lider123<br>oceniajacy / ocena123<br>podglad / podglad123</div>
        </section>
      </div>`;
    document.body.appendChild(d);
  }

  window._login=function(ev){
    if(ev) ev.preventDefault();
    const l=document.getElementById('l').value.trim();
    const p=document.getElementById('p').value;
    const u=users().find(x=>x.l===l&&x.p===p);
    if(!u){
      const er=document.getElementById('oc-login-error');
      if(er) er.style.display='block';
      return;
    }
    localStorage.setItem(sessionKey,JSON.stringify({id:u.id}));
    location.reload();
  };

  window.authLogout=function(){
    localStorage.removeItem(sessionKey);
    location.reload();
  };

  const s=session();
  if(!s){loginUI();return;}

  const u=users().find(x=>x.id===s.id);
  if(!u){loginUI();return;}

  adminData.access.role=u.r;
  saveAdminData();
  updateRoleBadge();

  injectStyle();
  const bar=document.querySelector('.page-bar');
  if(bar && !document.getElementById('oc-userbar')){
    const box=document.createElement('div');
    box.id='oc-userbar';
    box.className='oc-userbar';
    box.innerHTML='<span class="oc-user-pill">👤 '+(u.n||u.l)+' · '+roles[u.r]+'</span><button class="oc-logout" onclick="authLogout()">Wyloguj</button>';
    bar.appendChild(box);
  }

  const sel=document.getElementById('role-sw-sel');
  if(sel){sel.value=u.r;sel.disabled=true;}
}
