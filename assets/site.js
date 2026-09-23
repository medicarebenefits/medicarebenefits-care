
(function(){
  // --- sortable tables with indicators
  document.querySelectorAll('table[data-sortable]').forEach(function(t){
    [].forEach.call(t.tHead.rows[0].cells,function(th,i){th.setAttribute('data-sort','');th.addEventListener('click',function(){
      var asc=!th.classList.contains('asc');[].forEach.call(t.tHead.rows[0].cells,function(h){h.classList.remove('asc','desc')});th.classList.add(asc?'asc':'desc');
      var rows=[].slice.call(t.tBodies[0].rows);
      rows.sort(function(a,b){var x=a.cells[i].dataset.v!==undefined?a.cells[i].dataset.v:a.cells[i].textContent.trim(),y=b.cells[i].dataset.v!==undefined?b.cells[i].dataset.v:b.cells[i].textContent.trim();
        var nx=parseFloat(x),ny=parseFloat(y);if(!isNaN(nx)&&!isNaN(ny)){return asc?nx-ny:ny-nx}return asc?x.localeCompare(y):y.localeCompare(x)});
      rows.forEach(function(r){t.tBodies[0].appendChild(r)})})})});
  // --- simple text filter (state tables, state directory)
  var f=document.querySelector('input[data-filter]');if(f){f.addEventListener('input',function(){var q=f.value.toLowerCase();var n=0;
    document.querySelectorAll('[data-filter-row]').forEach(function(r){var ok=r.textContent.toLowerCase().indexOf(q)>-1;r.style.display=ok?'':'none';if(ok)n++});
    var c=document.querySelector('[data-filter-count]');if(c)c.textContent=n+' shown'})}
  // --- county plan filters
  var fb=document.querySelector('[data-plan-filters]');if(fb){
    var rows=[].slice.call(document.querySelectorAll('tr[data-plan]'));var total=rows.length;
    function apply(){var q=(fb.querySelector('[name=q]').value||'').toLowerCase(),car=fb.querySelector('[name=carrier]').value,typ=fb.querySelector('[name=type]').value,snp=fb.querySelector('[name=snp]').value,
      prem=parseFloat(fb.querySelector('[name=prem]').value),moop=parseFloat(fb.querySelector('[name=moop]').value),st=parseFloat(fb.querySelector('[name=stars]').value);
      var flags=[].map.call(fb.querySelectorAll('input[type=checkbox]:checked'),function(c){return c.value});var n=0;
      rows.forEach(function(r){var d=r.dataset;var ok=true;
        if(q&&r.textContent.toLowerCase().indexOf(q)<0)ok=false;
        if(car&&d.carrier!==car)ok=false;if(typ&&d.type!==typ)ok=false;if(snp&&d.snp!==snp)ok=false;
        if(!isNaN(prem)&&parseFloat(d.prem)>prem)ok=false;if(!isNaN(moop)&&(d.moop===''||parseFloat(d.moop)>moop))ok=false;
        if(!isNaN(st)&&st>0&&(d.stars===''||parseFloat(d.stars)<st))ok=false;
        flags.forEach(function(k){if(d[k]!=='1')ok=false});
        r.style.display=ok?'':'none';if(ok)n++});
      fb.querySelector('.count').textContent=total+' plans · '+n+' shown'}
    fb.addEventListener('input',apply);fb.addEventListener('change',apply);apply()}
  // --- county search (type-ahead over /data/county_index.json)
  var s=document.querySelector('[data-county-search]');if(s){var inp=s.querySelector('input'),list=s.querySelector('ul'),idx=null,act=-1;
    function load(cb){if(idx)return cb();fetch('/data/county_index.json').then(function(r){return r.json()}).then(function(j){idx=j;cb()})}
    function render(items){list.innerHTML='';act=-1;items.slice(0,12).forEach(function(it){var li=document.createElement('li');li.innerHTML=it.n+' <small>'+it.s+'</small>';li.addEventListener('mousedown',function(){location.href=it.u});list.appendChild(li)});list.style.display=items.length?'block':'none'}
    inp.addEventListener('focus',function(){load(function(){})});
    inp.addEventListener('input',function(){var q=inp.value.trim().toLowerCase();if(q.length<2){list.style.display='none';return}load(function(){
      var hits=idx.filter(function(it){return it.k.indexOf(q)>-1});hits.sort(function(a,b){return a.k.indexOf(q)-b.k.indexOf(q)||a.n.localeCompare(b.n)});render(hits)})});
    inp.addEventListener('keydown',function(e){var lis=list.querySelectorAll('li');if(!lis.length)return;if(e.key==='ArrowDown'){act=Math.min(act+1,lis.length-1)}else if(e.key==='ArrowUp'){act=Math.max(act-1,0)}else if(e.key==='Enter'){e.preventDefault();lis[act>=0?act:0].dispatchEvent(new Event('mousedown'));return}else return;
      lis.forEach(function(l,i){l.classList.toggle('active',i===act)})});
    inp.addEventListener('blur',function(){setTimeout(function(){list.style.display='none'},150)})}
})();
window.MBC = window.MBC || {};
MBC.initPro = function(cfg){
  var body=document.body;function state(s,msg){body.setAttribute('data-pro',s);if(msg){var e=document.querySelector('[data-pro-status]');if(e)e.textContent=msg}}
  if(!cfg.firebase||!cfg.firebase.apiKey){state('off');return}
  var srcs=['firebase-app-compat','firebase-auth-compat','firebase-firestore-compat','firebase-storage-compat'];
  (function next(i){if(i>=srcs.length)return ready();var sc=document.createElement('script');sc.src='https://www.gstatic.com/firebasejs/10.12.0/'+srcs[i]+'.js';sc.onload=function(){next(i+1)};sc.onerror=function(){state('err','Could not load the sign-in library. Try again later.')};document.head.appendChild(sc)})(0);
  function ready(){
    try{firebase.initializeApp(cfg.firebase)}catch(e){state('err','Sign-in is not configured correctly.');return}
    var auth=firebase.auth(),db=firebase.firestore();
    document.querySelectorAll('[data-pro-signin]').forEach(function(b){b.addEventListener('click',function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(e){state('err',e.message)})})});
    document.querySelectorAll('[data-pro-signout]').forEach(function(b){b.addEventListener('click',function(){auth.signOut()})});
    auth.onAuthStateChanged(function(u){
      if(!u){state('out');return}
      state('in','Signed in as '+u.email+'. Checking subscription…');
      db.collection('customers').doc(u.uid).collection('subscriptions').where('status','in',['trialing','active']).get().then(function(snap){
        if(snap.empty){state('in','Signed in as '+u.email+'. No active Pro subscription.');return}
        state('pro','Pro active for '+u.email+'. Downloads are unlocked.');
        document.querySelectorAll('[data-pro-download]').forEach(function(el){el.textContent='Preparing…';
          firebase.storage().ref(el.dataset.proDownload).getDownloadURL().then(function(url){el.href=url;el.textContent='Download CSV'}).catch(function(){el.textContent='Not yet uploaded for this release'})});
      }).catch(function(e){state('err',e.message)});
      document.querySelectorAll('[data-pro-checkout]').forEach(function(b){b.onclick=function(){
        if(!cfg.stripe_price_id){state('err','Checkout is not configured yet. Email us to subscribe.');return}
        db.collection('customers').doc(u.uid).collection('checkout_sessions').add({price:cfg.stripe_price_id,success_url:location.href,cancel_url:location.href})
          .then(function(ref){ref.onSnapshot(function(snap){var x=snap.data();if(x&&x.url)location.assign(x.url);if(x&&x.error)state('err',x.error.message)})})}});
    });
  }
};
