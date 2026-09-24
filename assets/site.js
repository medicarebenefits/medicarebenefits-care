
(function(){
  // --- sortable tables with indicators
  function sortify(root){(root||document).querySelectorAll('table[data-sortable]').forEach(function(t){if(t.__s)return;t.__s=1;
    [].forEach.call(t.tHead.rows[0].cells,function(th,i){th.setAttribute('data-sort','');th.addEventListener('click',function(){
      var asc=!th.classList.contains('asc');[].forEach.call(t.tHead.rows[0].cells,function(h){h.classList.remove('asc','desc')});th.classList.add(asc?'asc':'desc');
      var rows=[].slice.call(t.tBodies[0].rows);
      rows.sort(function(a,b){var x=a.cells[i].dataset.v!==undefined?a.cells[i].dataset.v:a.cells[i].textContent.trim(),y=b.cells[i].dataset.v!==undefined?b.cells[i].dataset.v:b.cells[i].textContent.trim();
        var nx=parseFloat(x),ny=parseFloat(y);if(!isNaN(nx)&&!isNaN(ny)){return asc?nx-ny:ny-nx}return asc?x.localeCompare(y):y.localeCompare(x)});
      rows.forEach(function(r){t.tBodies[0].appendChild(r)})})})})}
  window.MBC=window.MBC||{};MBC.sortify=sortify;sortify(document);
  // --- choropleth tooltips (home / states / state pages); the <title> inside each shape covers screen readers
  (function(){var tip;
    function show(el,e){var t=el.getAttribute('data-tip');if(!t)return;if(!tip){tip=document.createElement('div');tip.className='maptip';document.body.appendChild(tip)}
      var p=t.split('|');tip.textContent='';var b=document.createElement('b');b.textContent=p[0];tip.appendChild(b);tip.appendChild(document.createTextNode(p.slice(1).join(' · ')));tip.style.display='block';move(e)}
    function move(e){if(!tip||tip.style.display==='none')return;var x=e.clientX+14,y=e.clientY+16,r=tip.getBoundingClientRect();
      if(x+r.width>window.innerWidth-8)x=e.clientX-r.width-10;if(y+r.height>window.innerHeight-8)y=e.clientY-r.height-12;tip.style.left=x+'px';tip.style.top=y+'px'}
    function hide(){if(tip)tip.style.display='none'}
    document.querySelectorAll('figure.map [data-tip]').forEach(function(el){el.addEventListener('mouseenter',function(e){show(el,e)});el.addEventListener('mousemove',move);el.addEventListener('mouseleave',hide);
      el.addEventListener('focus',function(){var r=el.getBoundingClientRect();show(el,{clientX:r.left+r.width/2,clientY:r.top+r.height/2})});el.addEventListener('blur',hide)});
    window.addEventListener('scroll',hide,{passive:true})})();
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
    function render(items,hint){list.innerHTML='';act=-1;if(hint){var h=document.createElement('li');h.className='hint';h.textContent=hint;list.appendChild(h)}
      items.slice(0,12).forEach(function(it){var li=document.createElement('li');li.innerHTML=it.n+' <small>'+it.s+(it.z?' · ZIP '+it.z:'')+'</small>';li.addEventListener('mousedown',function(){if(s.hasAttribute('data-select-only')){inp.value=it.n+', '+it.s;list.style.display='none';s.dispatchEvent(new CustomEvent('countyselect',{detail:it}))}else{location.href=it.u}});list.appendChild(li)});list.style.display=(items.length||hint)?'block':'none'}
    var zc={};function zipLookup(z,cb){var k=z.slice(0,3);if(zc[k])return cb(zc[k][z]||[]);fetch('/data/zip/'+k+'.json').then(function(r){return r.ok?r.json():{}}).then(function(j){zc[k]=j;cb(j[z]||[])}).catch(function(){zc[k]={};cb([])})}
    inp.addEventListener('focus',function(){load(function(){})});
    inp.addEventListener('input',function(){var q=inp.value.trim().toLowerCase();
      if(/^\d{1,5}$/.test(q)){if(q.length<5){render([],'Keep typing — enter all 5 digits of your ZIP code');return}
        load(function(){zipLookup(q,function(fl){var byF={};idx.forEach(function(it){byF[it.f]=it});var hits=fl.map(function(f){return byF[f]}).filter(Boolean).map(function(it){return{n:it.n,s:it.s,u:it.u,z:q}});
          render(hits,hits.length>1?'ZIP '+q+' crosses county lines — plans are filed by county, so pick the county you live in':(hits.length?null:'No Medicare Advantage plans are filed for ZIP '+q+' in the CMS files, or the ZIP is not mapped to a county. Try your county name.'))})});return}
      if(q.length<2){list.style.display='none';return}load(function(){
      var hits=idx.filter(function(it){return it.k.indexOf(q)>-1});hits.sort(function(a,b){return a.k.indexOf(q)-b.k.indexOf(q)||a.n.localeCompare(b.n)});render(hits)})});
    inp.addEventListener('keydown',function(e){var lis=list.querySelectorAll('li:not(.hint)');if(!lis.length)return;if(e.key==='ArrowDown'){act=Math.min(act+1,lis.length-1)}else if(e.key==='ArrowUp'){act=Math.max(act-1,0)}else if(e.key==='Enter'){e.preventDefault();lis[act>=0?act:0].dispatchEvent(new Event('mousedown'));return}else return;
      lis.forEach(function(l,i){l.classList.toggle('active',i===act)})});
    inp.addEventListener('blur',function(){setTimeout(function(){list.style.display='none'},150)})}
  // --- plan pages: keep the county the visitor came from (?from=FIPS) in the breadcrumb and a back link
  var bl=document.querySelector('[data-backlink]');if(bl){var m=location.search.match(/[?&]from=(\d{5})\b/);if(m){var a=document.querySelector('[data-service-area] a[href="/counties/'+m[1]+'.html"]');if(a){
    var txt=a.textContent,i=txt.lastIndexOf(', '),county=i>0?txt.slice(0,i):txt,state=i>0?txt.slice(i+2):'';
    bl.innerHTML='<a href="'+a.getAttribute('href')+'">\u2190 Back to '+county+' County, '+state+' plans</a>';bl.classList.add('on');
    var nav=document.querySelector('[data-plan-crumbs] nav');if(nav&&state){var st=nav.querySelectorAll('a')[2];if(st){st.textContent=state;st.href='/states/'+state.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.html';
      var sep=document.createElement('span');sep.textContent='\u203a';var c=document.createElement('a');c.href=a.getAttribute('href');c.textContent=county+' County';st.after(sep,c)}}}}}
})();
window.MBC = window.MBC || {};
// ---------------------------------------------------------------- Part D drug coverage
(function(){
  var cache={};MBC.getJSON=function(u){if(!cache[u])cache[u]=fetch(u).then(function(r){if(!r.ok)throw new Error(u);return r.json()});return cache[u]};
  MBC.money=function(v){v=Math.round(v*100)/100;return '$'+(Number.isInteger(v)?v.toLocaleString():v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}))};
  MBC.cost=function(c){if(!c||!c[0])return '\u2014';return c[0]===1?MBC.money(c[1]):(Math.round(c[1]*100)+'%')};
  MBC.retail=function(t){if(!t)return '\u2014';var c=(t.r30&&t.r30[0])?t.r30:t.n30;return MBC.cost(c)+((t.r30&&t.r30[0])?'':(t.n30&&t.n30[0]?' <small>(standard pharmacy)</small>':''))};
  MBC.flags=function(f){var h='';if(f&2)h+='<span class="rxflag pa" title="Prior authorization required">PA</span>';if(f&4)h+='<span class="rxflag st" title="Step therapy">ST</span>';if(f&1)h+='<span class="rxflag ql" title="Quantity limit">QL</span>';return h||'<span class="rxflag" title="No utilization management reported">none</span>'};
  MBC.shard=function(rx){var n=parseInt(rx,10)%200;return '/data/rx/cov/'+('00'+n).slice(-3)+'.json'};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  // drug type-ahead: navigates to the drug page (optionally carrying ?county=) or dispatches 'drugselect' when data-select-only
  document.querySelectorAll('[data-drug-search]').forEach(function(box){var inp=box.querySelector('input'),list=box.querySelector('ul'),idx=null,act=-1;
    function load(cb){if(idx)return cb();MBC.getJSON('/data/rx/drugs.json').then(function(j){idx=j;cb()})}
    function render(items){list.innerHTML='';act=-1;items.slice(0,12).forEach(function(it){var li=document.createElement('li');li.innerHTML=esc(it.n)+(it.b&&it.b.length?' <small>'+esc(it.b.join(', '))+'</small>':'')+' <small>'+it.c+'% of formularies</small>';
      li.addEventListener('mousedown',function(){if(box.hasAttribute('data-select-only')){inp.value=it.n;list.style.display='none';box.dispatchEvent(new CustomEvent('drugselect',{detail:it}))}else{var c=box.getAttribute('data-county');location.href='/drugs/'+it.g+'.html'+(c?'?county='+c:'')}});list.appendChild(li)});list.style.display=items.length?'block':'none'}
    inp.addEventListener('focus',function(){load(function(){})});
    inp.addEventListener('input',function(){var q=inp.value.trim().toLowerCase();if(q.length<2){list.style.display='none';return}load(function(){var hits=idx.filter(function(it){return it.k.indexOf(q)>-1});
      hits.sort(function(a,b){var ia=a.k.indexOf(q),ib=b.k.indexOf(q);var sa=a.n.toLowerCase().indexOf(q)===0?0:1,sb=b.n.toLowerCase().indexOf(q)===0?0:1;return sa-sb||ia-ib||a.n.localeCompare(b.n)});render(hits)})});
    inp.addEventListener('keydown',function(e){var lis=list.querySelectorAll('li');if(!lis.length)return;if(e.key==='ArrowDown'){act=Math.min(act+1,lis.length-1)}else if(e.key==='ArrowUp'){act=Math.max(act-1,0)}else if(e.key==='Enter'){e.preventDefault();lis[act>=0?act:0].dispatchEvent(new Event('mousedown'));return}else return;lis.forEach(function(l,i){l.classList.toggle('active',i===act)})});
    inp.addEventListener('blur',function(){setTimeout(function(){list.style.display='none'},150)})});
  // drug page: county lookup across MA-PD plans (county file) and PDPs (region file)
  var lk=document.querySelector('[data-drug-lookup]');if(lk){var forms=JSON.parse(lk.getAttribute('data-forms')),sel=lk.querySelector('select[name=form]'),res=lk.querySelector('[data-results]'),st=lk.querySelector('.lookup-status'),cs=lk.querySelector('[data-county-search]');var county=null;
    function run(){if(!county)return;var rx=sel.value;st.textContent='Loading plans for '+county.n+'…';res.innerHTML='';
      Promise.all([MBC.getJSON('/data/pd/counties/'+county.f+'.json'),MBC.getJSON('/data/pd/tiersets.json'),MBC.getJSON(MBC.shard(rx))]).then(function(r){var c=r[0],ts=r[1],cov=r[2][rx]||{};
        var reg=c.r?MBC.getJSON('/data/pdp/regions/'+c.r+'.json').catch(function(){return null}):Promise.resolve(null);
        return reg.then(function(rg){
          function row(p,href){var f=cov[p.fid];var t=f?(ts[p.ts]||{})[String(f[0])]:null;
            return '<tr data-cov="'+(f?1:0)+'"><td><a href="'+href+'">'+esc(p.name)+'</a><br><small>'+esc(p.org)+(p.snp?' · '+esc(p.snp):'')+'</small></td><td class="num" data-v="'+(p.prem==null?'':p.prem)+'">'+(p.prem==null?'\u2014':MBC.money(p.prem))+'</td>'+
              '<td class="num" data-v="'+(p.ded==null?'':p.ded)+'">'+(p.ded==null?'\u2014':MBC.money(p.ded))+'</td><td data-v="'+(f?f[0]:99)+'">'+(f?'<span class="tierpill">'+f[0]+'</span>'+(t&&t.sp?' <small>specialty</small>':'')+(t&&!t.ded?' <small>deductible waived</small>':''):'<span class="tierpill none">Not on formulary</span>')+'</td>'+
              '<td>'+(f?MBC.flags(f[1])+(f[2]!=null?'<br><small>limit '+f[2]+' per '+f[3]+' days</small>':''):'')+'</td><td class="num">'+(f&&t?MBC.retail(t):'\u2014')+'</td><td class="num">'+(f&&t&&t.m90?MBC.cost(t.m90):'\u2014')+'</td></tr>'}
          var ma=c.p.map(function(a){return{bid:a[0],name:a[1],org:a[2],type:a[3],snp:a[4],prem:a[5],ded:a[6],fid:a[7],ts:a[8]}});
          function sortp(arr){return arr.sort(function(a,b){var fa=cov[a.fid],fb=cov[b.fid];if(!!fa!==!!fb)return fa?-1:1;if(fa&&fb&&fa[0]!==fb[0])return fa[0]-fb[0];return (a.prem||0)-(b.prem||0)})}
          var head='<div class="tbl"><table data-sortable><thead><tr><th>Plan</th><th class="num">Premium</th><th class="num">Part D deductible</th><th>Tier</th><th>Restrictions</th><th class="num">30-day retail</th><th class="num">90-day mail</th></tr></thead><tbody>';
          var h='<h3>Medicare Advantage plans with drug coverage filed in '+esc(county.n)+', '+esc(county.s)+' ('+ma.length+')</h3>'+head+sortp(ma).map(function(p){return row(p,'/plans/'+p.bid+'.html?from='+county.f)}).join('')+'</tbody></table></div>';
          var nma=ma.filter(function(p){return cov[p.fid]}).length;
          if(rg){var pd=rg.plans.filter(function(p){return !p.suppressed}).map(function(p){return{bid:p.id,name:p.plan_name,org:p.organization,snp:'',prem:p.premium,ded:p.deductible,fid:p.fid,ts:p.ts}});var npd=pd.filter(function(p){return cov[p.fid]}).length;
            h+='<h3>Stand-alone Part D plans in the '+esc(rg.name)+' region ('+pd.length+') — for people on Original Medicare</h3>'+head+sortp(pd).map(function(p){return row(p,'/pdp/plans/'+p.bid+'.html')}).join('')+'</tbody></table></div>';
            st.textContent=nma+' of '+ma.length+' Medicare Advantage plans and '+npd+' of '+pd.length+' stand-alone Part D plans list this form on their formulary.'}
          else st.textContent=nma+' of '+ma.length+' Medicare Advantage plans list this form on their formulary.';
          res.innerHTML=h;if(window.MBC.sortify)MBC.sortify(res);
          lk.querySelector('[data-legend]').classList.remove('hidden');
          try{history.replaceState(null,'',location.pathname+'?county='+county.f+'&rx='+rx)}catch(e){}
        })}).catch(function(e){st.textContent='Could not load plan data for this county ('+e.message+').'})}
    cs.addEventListener('countyselect',function(e){county=e.detail;run()});sel.addEventListener('change',run);
    var m=location.search.match(/[?&]county=(\d{5})/),mr=location.search.match(/[?&]rx=(\d+)/);
    if(mr){for(var i=0;i<sel.options.length;i++)if(sel.options[i].value===mr[1])sel.selectedIndex=i}
    if(m){MBC.getJSON('/data/county_index.json').then(function(idx){var it=idx.filter(function(x){return x.f===m[1]})[0];if(it){county=it;cs.querySelector('input').value=it.n+', '+it.s;run()}})}}
  // plan page: check any drug against this plan's formulary
  var pc=document.querySelector('[data-plan-drugcheck]');if(pc){var fid=pc.getAttribute('data-fid'),tiers=JSON.parse(pc.getAttribute('data-tiers')||'{}'),out=pc.querySelector('[data-results]'),ds=pc.querySelector('[data-drug-search]');
    ds.addEventListener('drugselect',function(e){var g=e.detail;out.innerHTML='<p class="lookup-status">Checking '+esc(g.n)+'…</p>';
      MBC.getJSON('/data/rx/groups/'+g.g+'.json').then(function(grp){var shards={};grp.forms.forEach(function(f){shards[MBC.shard(f.rxcui)]=1});
        return Promise.all(Object.keys(shards).map(MBC.getJSON)).then(function(sh){var cov={};sh.forEach(function(x){Object.assign(cov,x)});
          var rows=grp.forms.map(function(f){var c=(cov[f.rxcui]||{})[fid];var t=c?tiers[String(c[0])]:null;return '<tr><td>'+esc(f.name)+'<br><small>'+(f.tty==='SBD'||f.tty==='BPCK'?'brand':'generic')+'</small></td><td>'+(c?'<span class="tierpill">'+c[0]+'</span>'+(t&&t.sp?' <small>specialty</small>':''):'<span class="tierpill none">Not on formulary</span>')+'</td><td>'+(c?MBC.flags(c[1])+(c[2]!=null?'<br><small>limit '+c[2]+' per '+c[3]+' days</small>':''):'')+'</td><td class="num">'+(c&&t?MBC.retail(t):'\u2014')+'</td><td class="num">'+(c&&t&&t.m90?MBC.cost(t.m90):'\u2014')+'</td></tr>'}).join('');
          out.innerHTML='<h3 style="margin-top:.6em">'+esc(grp.name)+(grp.brands.length?' <small>('+esc(grp.brands.join(', '))+')</small>':'')+' on this plan\u2019s formulary</h3><div class="tbl"><table><thead><tr><th>Form / strength</th><th>Tier</th><th>Restrictions</th><th class="num">30-day retail</th><th class="num">90-day mail</th></tr></thead><tbody>'+rows+'</tbody></table></div><p><small>Tier cost sharing is the plan\u2019s initial-coverage amount as filed with CMS; PA = prior authorization, ST = step therapy, QL = quantity limit. <a href="/drugs/'+g.g+'.html">All plans covering '+esc(grp.name)+' \u2192</a></small></p>'})
      }).catch(function(e){out.innerHTML='<p class="lookup-status">Could not load drug data ('+e.message+').</p>'})})}
})();
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
