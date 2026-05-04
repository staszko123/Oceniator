export function initLoginMobileFix(){
  function inject(){
    if(document.getElementById('oc-login-mobile-fix-style')) return;
    var style=document.createElement('style');
    style.id='oc-login-mobile-fix-style';
    style.textContent=`
      @media(max-width:860px){
        html,body{
          min-height:100%;
        }
        .oc-login-screen{
          position:fixed !important;
          inset:0 !important;
          display:block !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
          padding:12px !important;
          min-height:100dvh !important;
          height:100dvh !important;
          box-sizing:border-box !important;
          -webkit-overflow-scrolling:touch !important;
        }
        .oc-login-wrap{
          width:100% !important;
          max-width:440px !important;
          min-height:auto !important;
          display:flex !important;
          flex-direction:column !important;
          gap:10px !important;
          margin:0 auto !important;
          padding:0 0 28px !important;
          box-sizing:border-box !important;
        }
        .oc-welcome{
          min-height:auto !important;
          padding:14px 16px !important;
          border-radius:20px !important;
        }
        .oc-title{
          font-size:22px !important;
          line-height:1.08 !important;
          margin:10px 0 0 !important;
        }
        .oc-lead,
        .oc-login-actions,
        .oc-footer-note{
          display:none !important;
        }
        .oc-kicker{
          max-width:100% !important;
          white-space:normal !important;
          font-size:9px !important;
          line-height:1.25 !important;
          padding:6px 9px !important;
        }
        .oc-login-card{
          width:100% !important;
          box-sizing:border-box !important;
          padding:18px !important;
          border-radius:20px !important;
          align-self:stretch !important;
        }
        .oc-card-title{
          font-size:22px !important;
          margin:0 0 4px !important;
        }
        .oc-card-sub{
          font-size:12px !important;
          line-height:1.45 !important;
          margin:0 0 14px !important;
        }
        .oc-field{
          margin-bottom:11px !important;
        }
        .oc-field label{
          font-size:9px !important;
          margin-bottom:5px !important;
        }
        .oc-field input{
          min-height:46px !important;
          height:46px !important;
          padding:10px 12px !important;
          border-radius:13px !important;
          font-size:16px !important;
        }
        .oc-login-btn{
          min-height:48px !important;
          padding:12px 14px !important;
          border-radius:14px !important;
          font-size:14px !important;
        }
        .oc-demo{
          margin-top:12px !important;
          max-height:86px !important;
          overflow:auto !important;
          padding:10px !important;
          border-radius:14px !important;
          font-size:10px !important;
          line-height:1.55 !important;
        }
        .oc-login-copyright{
          position:fixed !important;
          right:10px !important;
          bottom:8px !important;
          font-size:9px !important;
        }
      }
      @media(max-width:380px){
        .oc-login-screen{
          padding:8px !important;
        }
        .oc-welcome{
          padding:12px !important;
        }
        .oc-title{
          font-size:20px !important;
        }
        .oc-login-card{
          padding:14px !important;
        }
        .oc-demo{
          max-height:72px !important;
        }
      }
      @media(max-height:660px) and (max-width:860px){
        .oc-welcome{
          display:none !important;
        }
        .oc-login-wrap{
          padding-top:8px !important;
        }
        .oc-demo{
          max-height:68px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function mark(){
    var login=document.getElementById('oc-login-screen');
    if(login) login.classList.add('oc-mobile-ready');
  }

  inject();
  mark();
  setInterval(mark,500);
}
