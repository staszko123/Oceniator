/* ══════════════════════════════════════════════
   AUTH — lokalny system logowania i role użytkowników
   Etap lokalny. Dane przechodzą przez DataStore.
   Po podpięciu Supabase moduł można przepiąć na backend.
══════════════════════════════════════════════ */

var AUTH_USERS_KEY = 'oceniator_users_v1';
var AUTH_SESSION_KEY = 'oceniator_session_v1';
var AUTH_ROLES = {
  admin: 'Administrator',
  director: 'Dyrektor',
  leader: 'Lider',
  assessor: 'Oceniający',
  viewer: 'Podgląd'
};

function authDefaultUsers(){
  return [
    {id:1,login:'admin',name:'Administrator systemu',role:'admin',password:'admin123',active:true},
    {id:2,login:'lider',name:'Lider zespołu',role:'leader',password:'lider123',active:true},
    {id:3,login:'oceniajacy',name:'Oceniający',role:'assessor',password:'ocena123',active:true},
    {id:4,login:'dyrektor',name:'Dyrektor',role:'director',password:'dyrektor123',active:true},
    {id:5,login:'podglad',name:'Użytkownik podglądu',role:'viewer',password:'podglad123',active:true}
  ];
}

function authLoadUsers(){
  try{
    var raw = DataStore.getValue(AUTH_USERS_KEY, null);
    if(raw){
      var parsed = JSON.parse(raw) || [];
      authDefaultUsers().forEach(function(defaultUser){
        if(!parsed.some(function(user){return user.login===defaultUser.login;})){
          parsed.push(defaultUser);
        }
      });
      authSaveUsers(parsed);
      return parsed;
    }
  }catch(e){}
  var users = authDefaultUsers();
  authSaveUsers(users);
  return users;
}

function authSaveUsers(users){
  DataStore.setValue(AUTH_USERS_KEY, JSON.stringify(users || []));
}

function authSession(){
  try{return JSON.parse(DataStore.getValue(AUTH_SESSION_KEY,'null')||'null');}catch(e){return null;}
}

function authCurrentUser(){
  var session = authSession();
  if(!session) return null;
  var users = authLoadUsers();
  return users.find(function(u){return u.id===session.userId && u.active!==false;}) || null;
}

function authIsAdmin(){
  var u = authCurrentUser();
  return !!(u && u.role === 'admin');
}

function authEsc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}

function authRoleOptions(selected){
  return Object.keys(AUTH_ROLES).map(function(r){
    return '<option value="'+r+'" '+(selected===r?'selected':'')+'>'+AUTH_ROLES[r]+'</option>';
  }).join('');
}

function authInjectStyles(){
  if(document.getElementById('auth-style')) return;
  var s = document.createElement('style');
  s.id = 'auth-style';
  s.textContent = '\n.auth-screen{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a,#12323f);padding:20px;font-family:Poppins,Arial,sans-serif}.auth-card{width:min(430px,100%);background:var(--card,#fff);color:var(--text,#0f172a);border-radius:20px;padding:26px;box-shadow:0 24px 60px rgba(0,0,0,.28)}.auth-kicker{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3,#64748b);font-weight:700}.auth-title{font-size:24px;font-weight:800;margin:8px 0 5px}.auth-sub{font-size:13px;color:var(--text2,#475569);line-height:1.5;margin-bottom:18px}.auth-field{margin-bottom:12px}.auth-field label{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3,#64748b);font-weight:700;margin-bottom:5px}.auth-field input,.auth-field select{width:100%;box-sizing:border-box;border:1px solid var(--border,#dbe3ef);border-radius:10px;padding:11px 12px;font-family:Poppins,Arial,sans-serif;background:var(--bg,#fff);color:var(--text,#0f172a)}.auth-btn{width:100%;border:0;border-radius:12px;padding:12px 14px;background:#0d9488;color:#fff;font-weight:800;cursor:pointer}.auth-error{display:none;margin:10px 0 0;color:#dc2626;font-size:12px;font-weight:600}.auth-demo{margin-top:14px;border-top:1px solid var(--border,#e2e8f0);padding-top:12px;font-size:11px;color:var(--text3,#64748b);line-height:1.6}.auth-userbar{display:flex;align-items:center;gap:8px;margin-left:10px}.auth-pill{font-size:11px;border:1px solid var(--border,#dbe3ef);background:var(--card,#fff);color:var(--text2,#475569);border-radius:999px;padding:7px 10px}.auth-logout{border:1px solid var(--border,#dbe3ef);background:transparent;color:var(--text2,#475569);border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}.auth-users-box{margin-top:14px}.auth-users-grid{display:grid;grid-template-columns:1.2fr 1fr .8fr .6fr auto;gap:8px;align-items:center}.auth-users-grid input,.auth-users-grid select{width:100%;box-sizing:border-box;border:1px solid var(--border,#dbe3ef);border-radius:8px;padding:8px;font-family:Poppins,Arial,sans-serif;background:var(--bg,#fff);color:var(--text,#0f172a);font-size:11px}.auth-user-row{display:grid;grid-template-columns:1.2fr 1fr .8fr .6fr auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border,#e2e8f0);font-size:11px}.auth-small-btn{border:1px solid var(--border,#dbe3ef);background:var(--card,#fff);border-radius:8px;padding:8px 9px;font-size:11px;cursor:pointer}.auth-danger{color:#dc2626}.auth-muted{color:var(--text3,#64748b)}\n';
  document.head.appendChild(s);
}

function authShowLogin(){
  authInjectStyles();
  var old = document.getElementById('auth-screen');
  if(old) old.remove();
  var el = document.createElement('div');
  el.id = 'auth-screen';
  el.className = 'auth-screen';
  el.innerHTML = '<div class="auth-card">'+
    '<div class="auth-kicker">Oceniator</div>'+
    '<div class="auth-title">Logowanie</div>'+
    '<div class="auth-sub">Zaloguj się, aby korzystać z aplikacji. Uprawnienia zależą od roli użytkownika.</div>'+
    '<form onsubmit="authLogin(event)">'+
      '<div class="auth-field"><label>Login</label><input id="auth-login" autocomplete="username" autofocus></div>'+
      '<div class="auth-field"><label>Hasło</label><input id="auth-pass" type="password" autocomplete="current-password"></div>'+
      '<button class="auth-btn" type="submit">Zaloguj</button>'+
      '<div class="auth-error" id="auth-error">Nieprawidłowy login lub hasło.</div>'+
    '</form>'+
    '<div class="auth-demo"><strong>Konta startowe:</strong><br>admin / admin123<br>dyrektor / dyrektor123<br>lider / lider123<br>oceniajacy / ocena123<br>podglad / podglad123</div>'+
  '</div>';
  document.body.appendChild(el);
}

function authLogin(ev){
  if(ev) ev.preventDefault();
  var login = (document.getElementById('auth-login')?.value || '').trim();
  var pass = document.getElementById('auth-pass')?.value || '';
  var users = authLoadUsers();
  var user = users.find(function(u){return u.login===login && u.password===pass && u.active!==false;});
  if(!user){
    var er = document.getElementById('auth-error');
    if(er) er.style.display = 'block';
    return;
  }
  DataStore.setValue(AUTH_SESSION_KEY, JSON.stringify({userId:user.id,login:user.login,ts:new Date().toISOString()}));
  var screen = document.getElementById('auth-screen');
  if(screen) screen.remove();
  authApplyUser(user);
}

function authLogout(){
  DataStore.setValue(AUTH_SESSION_KEY, null);
  location.reload();
}

function authApplyUser(user){
  if(!user) return;
  normalizeAdminData();
  adminData.access.role = user.role;
  saveAdminData();
  updateRoleBadge();
  authRenderUserBar(user);
  authLockRoleSwitcher(user);
  if(typeof buildAdmin === 'function') buildAdmin();
  if(typeof renderEw === 'function') renderEw();
}

function authRenderUserBar(user){
  var bar = document.querySelector('.page-bar');
  if(!bar) return;
  var old = document.getElementById('auth-userbar');
  if(old) old.remove();
  var box = document.createElement('div');
  box.id = 'auth-userbar';
  box.className = 'auth-userbar';
  box.innerHTML = '<span class="auth-pill">'+authEsc(user.name)+' · '+AUTH_ROLES[user.role]+'</span><button class="auth-logout" onclick="authLogout()">Wyloguj</button>';
  bar.appendChild(box);
}

function authLockRoleSwitcher(user){
  var sw = document.getElementById('role-switcher');
  var sel = document.getElementById('role-sw-sel');
  if(sel){
    sel.value = user.role;
    sel.disabled = true;
    sel.title = 'Rola wynika z zalogowanego użytkownika';
  }
  if(sw) sw.dataset.role = user.role;
  if(sw) sw.style.display = 'none';
}

function authInit(){
  authInjectStyles();
  authLoadUsers();
  var user = authCurrentUser();
  if(user){
    authApplyUser(user);
  }else{
    authShowLogin();
  }
}

(function(){
  var originalAdmSetRole = window.admSetRole;
  window.admSetRole = function(role){
    var user = authCurrentUser();
    if(user){
      adminData.access.role = user.role;
      saveAdminData();
      updateRoleBadge();
      authLockRoleSwitcher(user);
      if(role !== user.role && typeof showToast === 'function') showToast('Rola wynika z zalogowanego użytkownika','warn');
      return;
    }
    if(typeof originalAdmSetRole === 'function') return originalAdmSetRole(role);
  };

  var originalBuildAdmin = window.buildAdmin;
  window.buildAdmin = function(){
    if(typeof originalBuildAdmin === 'function') originalBuildAdmin();
    authRenderAdminUsers();
    var user = authCurrentUser();
    if(user) authLockRoleSwitcher(user);
  };
})();

function authRenderAdminUsers(){
  var wrap = document.getElementById('wrap-admin');
  if(!wrap) return;
  var old = document.getElementById('auth-users-panel');
  if(old) old.remove();
  var user = authCurrentUser();
  if(!user || user.role !== 'admin') return;
  var users = authLoadUsers();
  var panel = document.createElement('div');
  panel.id = 'auth-users-panel';
  panel.className = 'adm-card auth-users-box';
  panel.innerHTML = '<div class="adm-hdr"><div><div class="adm-title">Użytkownicy i role</div><div class="adm-item-sub">Tylko administrator może tworzyć użytkowników, zmieniać role i aktywować konta.</div></div></div>'+
    '<div class="adm-body">'+
      '<div class="auth-users-grid">'+
        '<input id="auth-new-name" placeholder="Nazwa użytkownika">'+
        '<input id="auth-new-login" placeholder="Login">'+
        '<input id="auth-new-pass" placeholder="Hasło">'+
        '<select id="auth-new-role">'+authRoleOptions('assessor')+'</select>'+
        '<button class="auth-small-btn" onclick="authAddUser()">Dodaj</button>'+
      '</div>'+
      '<div id="auth-users-list">'+users.map(authUserRow).join('')+'</div>'+
    '</div>';
  wrap.prepend(panel);
}

function authUserRow(u){
  return '<div class="auth-user-row">'+
    '<div><strong>'+authEsc(u.name)+'</strong><div class="auth-muted">ID: '+u.id+'</div></div>'+
    '<div>'+authEsc(u.login)+'</div>'+
    '<select onchange="authChangeUserRole('+u.id+',this.value)" '+(u.role==='admin'&&u.login==='admin'?'disabled':'')+'>'+authRoleOptions(u.role)+'</select>'+
    '<button class="auth-small-btn" onclick="authToggleUser('+u.id+')">'+(u.active===false?'Aktywuj':'Dezaktywuj')+'</button>'+
    '<button class="auth-small-btn auth-danger" onclick="authDeleteUser('+u.id+')" '+(u.role==='admin'&&u.login==='admin'?'disabled':'')+'>Usuń</button>'+
  '</div>';
}

function authRequireAdmin(){
  if(!authIsAdmin()){
    if(typeof showToast === 'function') showToast('Tylko administrator może zarządzać użytkownikami','warn');
    return false;
  }
  return true;
}

function authAddUser(){
  if(!authRequireAdmin()) return;
  var name = (document.getElementById('auth-new-name')?.value || '').trim();
  var login = (document.getElementById('auth-new-login')?.value || '').trim();
  var pass = document.getElementById('auth-new-pass')?.value || '';
  var role = document.getElementById('auth-new-role')?.value || 'assessor';
  if(!name || !login || !pass){
    if(typeof showToast === 'function') showToast('Uzupełnij nazwę, login i hasło','err');
    return;
  }
  var users = authLoadUsers();
  if(users.some(function(u){return u.login===login;})){
    if(typeof showToast === 'function') showToast('Taki login już istnieje','warn');
    return;
  }
  var id = Date.now();
  users.push({id:id,name:name,login:login,password:pass,role:role,active:true});
  authSaveUsers(users);
  authRenderAdminUsers();
  if(typeof showToast === 'function') showToast('Dodano użytkownika','ok');
}

function authChangeUserRole(id,role){
  if(!authRequireAdmin()) return;
  var users = authLoadUsers();
  var u = users.find(function(x){return x.id===id;});
  if(!u) return;
  if(u.login==='admin' && u.role==='admin') return;
  u.role = role;
  authSaveUsers(users);
  authRenderAdminUsers();
}

function authToggleUser(id){
  if(!authRequireAdmin()) return;
  var users = authLoadUsers();
  var u = users.find(function(x){return x.id===id;});
  if(!u) return;
  if(u.login==='admin' && u.role==='admin') return;
  u.active = u.active===false;
  authSaveUsers(users);
  authRenderAdminUsers();
}

function authDeleteUser(id){
  if(!authRequireAdmin()) return;
  var users = authLoadUsers();
  var u = users.find(function(x){return x.id===id;});
  if(!u) return;
  if(u.login==='admin' && u.role==='admin') return;
  if(!confirm('Usunąć użytkownika '+u.login+'?')) return;
  users = users.filter(function(x){return x.id!==id;});
  authSaveUsers(users);
  authRenderAdminUsers();
}
