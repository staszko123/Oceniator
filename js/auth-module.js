export function authInit(){
  const usersKey='oc_users_v1';
  const sessionKey='oc_session_v1';

  function users(){
    let u=JSON.parse(localStorage.getItem(usersKey)||'null');
    if(!u){
      u=[
        {id:1,l:'admin',p:'admin123',r:'admin'},
        {id:2,l:'lider',p:'lider123',r:'leader'},
        {id:3,l:'oceniajacy',p:'ocena123',r:'assessor'},
        {id:4,l:'podglad',p:'podglad123',r:'viewer'}
      ];
      localStorage.setItem(usersKey,JSON.stringify(u));
    }
    return u;
  }

  function session(){return JSON.parse(localStorage.getItem(sessionKey)||'null');}

  function loginUI(){
    const d=document.createElement('div');
    d.style='position:fixed;inset:0;z-index:9999;background:#0f172a;display:flex;align-items:center;justify-content:center';
    d.innerHTML='<div style="background:#fff;padding:20px;border-radius:12px;width:300px"><h3>Login</h3><input id="l" placeholder="login"><input id="p" type="password" placeholder="hasło"><button onclick="window._login()">Zaloguj</button></div>';
    document.body.appendChild(d);
  }

  window._login=function(){
    const l=document.getElementById('l').value;
    const p=document.getElementById('p').value;
    const u=users().find(x=>x.l===l&&x.p===p);
    if(!u)return alert('Błąd logowania');
    localStorage.setItem(sessionKey,JSON.stringify({id:u.id}));
    location.reload();
  }

  const s=session();
  if(!s){loginUI();return;}

  const u=users().find(x=>x.id===s.id);
  if(!u){loginUI();return;}

  adminData.access.role=u.r;
  saveAdminData();
  updateRoleBadge();
}
