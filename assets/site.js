
// Site JS: compare/sort helpers + Pro gating (Firebase Auth + Stripe extension). Static site, no server.
(function(){
  document.querySelectorAll('table[data-sortable]').forEach(function(t){
    t.querySelectorAll('th').forEach(function(th,i){th.style.cursor='pointer';th.addEventListener('click',function(){
      var rows=[].slice.call(t.tBodies[0].rows);var asc=th.dataset.asc!=='1';th.dataset.asc=asc?'1':'0';
      rows.sort(function(a,b){var x=a.cells[i].dataset.v||a.cells[i].textContent,y=b.cells[i].dataset.v||b.cells[i].textContent;
        var nx=parseFloat(x),ny=parseFloat(y);if(!isNaN(nx)&&!isNaN(ny)){return asc?nx-ny:ny-nx}return asc?x.localeCompare(y):y.localeCompare(x)});
      rows.forEach(function(r){t.tBodies[0].appendChild(r)})})})});
  var f=document.querySelector('input[data-filter]');if(f){f.addEventListener('input',function(){var q=f.value.toLowerCase();
    document.querySelectorAll('[data-filter-row]').forEach(function(r){r.style.display=r.textContent.toLowerCase().indexOf(q)>-1?'':'none'})})}
})();
window.MBC = window.MBC || {};
MBC.initPro = function(cfg){
  if(!cfg.firebase||!cfg.firebase.apiKey){document.querySelectorAll('[data-pro-status]').forEach(function(e){e.textContent='Pro sign-in is not connected yet.'});return}
  var s=document.createElement('script');s.src='https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js';
  var a=document.createElement('script');a.src='https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js';
  var d=document.createElement('script');d.src='https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js';
  var st=document.createElement('script');st.src='https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js';
  s.onload=function(){document.head.appendChild(a)};a.onload=function(){document.head.appendChild(d)};d.onload=function(){document.head.appendChild(st)};
  st.onload=function(){
    firebase.initializeApp(cfg.firebase);var auth=firebase.auth(),db=firebase.firestore();
    var status=document.querySelectorAll('[data-pro-status]');function say(t){status.forEach(function(e){e.textContent=t})}
    document.querySelectorAll('[data-pro-signin]').forEach(function(b){b.addEventListener('click',function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())})});
    document.querySelectorAll('[data-pro-signout]').forEach(function(b){b.addEventListener('click',function(){auth.signOut()})});
    auth.onAuthStateChanged(function(u){
      if(!u){say('Not signed in.');document.body.classList.remove('is-pro');return}
      say('Checking subscription for '+u.email+' …');
      db.collection('customers').doc(u.uid).collection('subscriptions').where('status','in',['trialing','active']).get().then(function(snap){
        var pro=!snap.empty;document.body.classList.toggle('is-pro',pro);say(pro?'Pro active — exports unlocked.':'Signed in, no active Pro subscription.');
        document.querySelectorAll('[data-pro-download]').forEach(function(el){el.classList.toggle('pro-only',!pro);if(pro){
          firebase.storage().ref(el.dataset.proDownload).getDownloadURL().then(function(url){el.href=url}).catch(function(){})}});
      });
      document.querySelectorAll('[data-pro-checkout]').forEach(function(b){b.addEventListener('click',function(){
        if(!cfg.stripe_price_id){alert('Stripe price is not configured yet.');return}
        db.collection('customers').doc(u.uid).collection('checkout_sessions').add({price:cfg.stripe_price_id,success_url:location.href,cancel_url:location.href})
          .then(function(ref){ref.onSnapshot(function(snap){var x=snap.data();if(x&&x.url)location.assign(x.url);if(x&&x.error)alert(x.error.message)})})})});
    });
  };
  document.head.appendChild(s);
};
