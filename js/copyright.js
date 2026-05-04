export function initCopyright(){
  var text='Copyright 2026 Oceniator · Jakub Stachura';

  if(!document.getElementById('oc-copyright-style')){
    var style=document.createElement('style');
    style.id='oc-copyright-style';
    style.textContent='.app-copyright,.oc-login-copyright{position:fixed;right:16px;bottom:10px;z-index:9000;font-family:Poppins,Arial,sans-serif;font-size:10px;font-weight:700;color:rgba(100,116,139,.72);pointer-events:none;user-select:none}.oc-login-copyright{z-index:10000;color:rgba(226,232,240,.72)}[data-theme="dark"] .app-copyright{color:rgba(148,163,184,.62)}';
    document.head.appendChild(style);
  }

  function addApp(){
    if(!document.querySelector('.app-copyright')){
      var el=document.createElement('div');
      el.className='app-copyright';
      el.textContent=text;
      document.body.appendChild(el);
    }
  }

  function addLogin(){
    var login=document.getElementById('oc-login-screen');
    var existing=document.querySelector('.oc-login-copyright');
    if(login && !existing){
      var el=document.createElement('div');
      el.className='oc-login-copyright';
      el.textContent=text;
      document.body.appendChild(el);
    }
    if(!login && existing){existing.remove();}
  }

  addApp();
  addLogin();
  setInterval(function(){addApp();addLogin();},1000);
}
