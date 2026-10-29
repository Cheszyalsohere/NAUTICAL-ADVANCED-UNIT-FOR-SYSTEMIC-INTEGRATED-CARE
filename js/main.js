(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('site-config').textContent);
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  // Rincian fitur: tampilan interaktif di kiri, spesifikasi di kanan, tautan ke langkah demo di bawah.
  const seaScenarios = {
    tenang:{wave:'0,5–1,25 m',wind:'± 8 knot',status:'Aman',route:'Jalur langsung via utara Rinca',drift:'± 0,5 nm dari titik awal',zone:0},
    sedang:{wave:'1,25–2,5 m',wind:'± 16 knot',status:'Waspada',route:'Via utara Rinca, kecepatan dikurangi',drift:'± 1 nm dari titik awal',zone:.18},
    buruk:{wave:'2,5–4 m',wind:'± 25 knot',status:'Bahaya · peringatan dikirim',route:'Tunda keberangkatan, koordinasi SAR',drift:'± 2 nm dari titik awal',zone:.38}
  };
  const seg = (name, legend, opts, checked) => `<fieldset class="seg"><legend>${legend}</legend>${opts.map(([v,l]) => `<label><input type="radio" name="${name}" value="${v}"${v===checked?' checked':''}><span>${l}</span></label>`).join('')}</fieldset>`;
  const fd = (visual, lede, rows, step) => `<div class="fd"><div class="fd-visual">${visual}</div><aside class="fd-spec"><p class="fd-lede">${lede}</p><dl>${rows.map(([t,d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl></aside></div><footer class="fd-foot"><span>Semua data contoh. Tidak ada yang disimpan atau dikirim.</span><button class="btn btn-secondary" type="button" data-goto="${step}">Lihat di alur pasien · langkah 0${step+1}</button></footer>`;
  // Tren tanda vital 09.10–10.29 (data contoh), digambar sebagai garis kecil.
  const trend = {hr:[104,101,99,98,96,95,96,94,92,90], spo:[95,96,97,97,97,96,97,97,98,97], sys:[138,136,135,133,132,132,131,130,130,129]};
  const spark = (vals, lo, hi) => vals.map((v,i) => `${(i/(vals.length-1)*200).toFixed(1)},${(36-(v-lo)/(hi-lo)*32).toFixed(1)}`).join(' ');
  const trendRow = (k, label, unit, lo, hi, cls) => `<div class="tr-row ${cls}" data-trend="${k}"><dt>${label}</dt><dd><svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><polyline points="${spark(trend[k],lo,hi)}"/></svg><b>${trend[k].at(-1)}<small>${unit}</small></b></dd></div>`;

  const featureViews = {
    ticket:{title:'Smart Patient Ticket', kicker:'Fitur 01 · Registrasi & triase', html:fd(
      `<div class="fd-controls"><div class="field"><label for="fdName">Nama pasien (simulasi)</label><input id="fdName" value="Pasien A" maxlength="24" autocomplete="off"></div>${seg('fdTriage','Prioritas triase',[['emergensi','Emergensi'],['urgent','Urgent'],['non-urgent','Non-urgent']],'emergensi')}</div>
      <article class="ticket" data-level="emergensi" aria-live="polite"><header class="ticket-band"><span>Smart Patient Ticket</span><strong data-bind="level">Emergensi</strong></header><div class="ticket-body"><div class="ticket-no"><small>No. tiket</small><strong data-bind="no">NAU-0412</strong></div><dl class="ticket-data"><div><dt>Pasien</dt><dd data-bind="name">Pasien A</dd></div><div><dt>Lokasi</dt><dd>Selat Padar</dd></div><div><dt>Tujuan rujukan</dt><dd>IGD RSUD Komodo</dd></div></dl></div><footer class="ticket-foot"><span data-bind="time">Dibuat 09.10</span><span>Data contoh</span></footer></article>
      <button class="btn btn-primary fd-act" type="button" data-act="newTicket">Terbitkan tiket baru</button>`,
      'Tiket digital yang dibuat saat pasien naik ke kapal. Isinya menentukan urutan penanganan dan ikut bersama pasien sampai serah terima.',
      [['Data dicatat','Identitas, prioritas triase, ringkasan kebutuhan, tujuan rujukan'],['Pengguna','Tenaga medis kapal'],['Prioritas','Emergensi, Urgent, Non-urgent'],['Status prototipe','Formulir berjalan di browser, tanpa penyimpanan']],0)},
    ehr:{title:'Integrated EHR', kicker:'Fitur 02 · Rekam medis elektronik', html:fd(
      `<div class="fd-controls"><div class="field"><label for="fdRole">Lihat sebagai</label><select id="fdRole"><option value="medis">Tenaga medis kapal</option><option value="dokter">Dokter fasilitas rujukan</option><option value="koordinator">Koordinator evakuasi</option><option value="admin">Administrator</option></select></div></div>
      <article class="ehr"><header class="ehr-head"><div><small>Rekam medis</small><strong>NAU-0412 · Pasien A</strong></div><span class="ehr-access" data-bind="access">Baca &amp; tulis</span></header><dl class="ehr-rows"><div><dt>Prioritas</dt><dd>Emergensi</dd></div><div class="clinical"><dt>Keluhan utama</dt><dd>Cedera kepala setelah jatuh, tidak sadar ± 10 detik</dd></div><div class="clinical"><dt>Riwayat alergi</dt><dd>Belum diketahui, perlu konfirmasi keluarga</dd></div><div class="clinical"><dt>Tindakan</dt><dd><ul><li><time>09.12</time>Luka dibersihkan dan dibalut</li><li><time>09.13</time>Oksigen 4 L/menit</li></ul></dd></div></dl><p class="ehr-hidden" hidden>Data klinis disembunyikan untuk peran ini.</p></article>
      <div class="sync fd-sync" data-state="0"><ol class="sync-steps"><li>Tersimpan di kapal</li><li>Menunggu sinyal</li><li>Tersinkron ke RS</li></ol><button class="btn btn-secondary" type="button" data-act="sync">Simulasikan sinyal masuk</button></div>`,
      'Rekam medis digital yang dimulai dari tiket pasien. Karena sinyal di laut tidak selalu ada, data disimpan di kapal lalu disinkronkan saat jaringan tersedia.',
      [['Data dicatat','Identitas, keluhan utama, alergi, obat dan tindakan, status sinkronisasi'],['Hak akses','Dibatasi per peran: medis kapal, dokter rujukan, koordinator, administrator'],['Keamanan','Enkripsi dan kontrol akses'],['Status prototipe','Belum terhubung ke sistem rumah sakit']],1)},
    tele:{title:'Real-time Telemedicine', kicker:'Fitur 03 · Konsultasi jarak jauh', html:fd(
      `<div class="monitor"><div class="monitor-top"><span>Monitor · NAU-0412</span><span class="monitor-live">Terkirim ke RS</span></div><svg class="ecg" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true"><g class="ecg-trace"><path class="ecg-line"/></g></svg><dl class="monitor-vals"><div class="v-hr"><dt>HR</dt><dd>96<small>bpm</small></dd></div><div class="v-spo"><dt>SpO₂</dt><dd>97<small>%</small></dd></div><div class="v-bp"><dt>Tensi</dt><dd>132/84<small>mmHg</small></dd></div><div class="v-rr"><dt>Napas</dt><dd>20<small>/mnt</small></dd></div></dl></div>
      <ul class="consult-log fd-log" aria-live="polite"><li><b>Dokter jaga IGD</b><p>Pertahankan oksigen. Kabari segera kalau kesadaran menurun.</p><time>09.33</time></li></ul>
      <div class="fd-rx"><div class="field"><label for="fdDrug">E-resep: obat</label><input id="fdDrug" placeholder="Contoh: Obat A 500 mg" autocomplete="off"></div><div class="field"><label for="fdDose">Aturan pakai</label><input id="fdDose" placeholder="Contoh: bila nyeri" autocomplete="off"></div><button class="btn btn-primary" type="button" data-act="rx">Kirim resep</button></div>`,
      'Dokter di rumah sakit rujukan melihat tanda vital pasien selama perjalanan, berkonsultasi lewat video, dan mengirim resep digital ke kapal.',
      [['Tanda vital','SpO₂, tekanan darah, EKG, detak jantung, napas'],['Jaringan','Seluler atau satelit, tergantung cakupan di sepanjang rute'],['Pengguna','Tenaga medis kapal dan dokter fasilitas rujukan'],['Status prototipe','Belum terhubung ke alat medis atau layanan video']],3)},
    evac:{title:'Smart Evacuation', kicker:'Fitur 04 · Kondisi laut & rute', html:fd(
      `<div class="map-demo" data-slot="map"><div class="map-caption" style="top:12px;bottom:auto">Ilustrasi tidak berskala · bukan untuk navigasi</div></div>
      ${seg('fdSea','Kondisi laut (simulasi)',[['tenang','Tenang'],['sedang','Sedang'],['buruk','Buruk']],'sedang')}
      <dl class="sea-read" aria-live="polite"><div><dt>Gelombang</dt><dd data-bind="wave">1,25–2,5 m</dd></div><div><dt>Angin</dt><dd data-bind="wind">± 16 knot</dd></div><div><dt>Status</dt><dd><span class="sea-status" data-level="sedang" data-bind="status">Waspada</span></dd></div><div><dt>Jalur</dt><dd data-bind="route">Via utara Rinca, kecepatan dikurangi</dd></div><div><dt>Area pencarian</dt><dd data-bind="drift">± 1 nm dari titik awal</dd></div></dl>`,
      'Memantau kondisi laut, mengirim peringatan saat cuaca memburuk, menyarankan jalur evakuasi yang aman, dan memperkirakan arah hanyut korban.',
      [['Rute awal','Marina Labuan Bajo – Selat Padar'],['Fasilitas tujuan','RSUD Komodo, RS Siloam Labuan Bajo'],['Keputusan','Rute akhir tetap ditetapkan nakhoda dan tim SAR'],['Status prototipe','Belum memakai data cuaca dan geospasial tervalidasi']],2)},
    monitor:{title:'Pemantauan Pasien', kicker:'Fitur 05 · Monitoring klinis', html:fd(
      `<div class="monitor trend"><div class="monitor-top"><span>Tren perjalanan · 09.10–10.29</span><span>NAU-0412</span></div><dl class="tr-rows">${trendRow('hr','HR','bpm',85,110,'v-hr')}${trendRow('spo','SpO₂','%',88,100,'v-spo')}${trendRow('sys','Sistolik','mmHg',120,145,'v-bp')}</dl><p class="tr-alert" aria-live="polite" hidden></p></div>
      <button class="btn btn-secondary fd-act" type="button" data-act="drop">Simulasikan SpO₂ turun</button>`,
      'Panel tren tanda vital selama perjalanan. Perubahan yang perlu perhatian ditandai, supaya petugas dan dokter rujukan bisa segera mengevaluasi.',
      [['Dipantau','Detak jantung, saturasi oksigen, tekanan darah'],['Peringatan','Saat nilai melewati ambang, misalnya SpO₂ di bawah 94%'],['Keputusan klinis','Tetap oleh tenaga medis'],['Status prototipe','Angka contoh, bukan hasil pemeriksaan']],3)},
    referral:{title:'Koordinasi Rujukan', kicker:'Fitur 06 · Darat–laut terhubung', html:fd(
      `<div class="fd-controls"><div class="field"><label for="fdFacility">Fasilitas tujuan</label><select id="fdFacility"><option>IGD RSUD Komodo</option><option>IGD RS Siloam Labuan Bajo</option></select></div></div>
      <article class="handover"><header class="handover-head"><div><small>Rujukan NAU-0412</small><strong data-bind="facility">IGD RSUD Komodo</strong></div><span class="ref-badge" data-bind="badge">Menunggu</span></header>
      <div class="sync fd-ref" data-state="0"><ol class="sync-steps"><li>Data pasien dikirim dari kapal</li><li>Rumah sakit mengonfirmasi penerimaan</li><li>Pasien tiba dan diserahkan</li></ol></div>
      <footer class="handover-foot">Perkiraan sandar di Marina Labuan Bajo: <strong>10.29</strong> · data contoh</footer></article>
      <button class="btn btn-primary fd-act" type="button" data-act="ref">Perbarui status</button>`,
      'Menghubungkan kapal dengan rumah sakit rujukan, supaya tim darat sudah menyiapkan penerimaan sebelum pasien tiba.',
      [['Fasilitas','RSUD Komodo, RS Siloam Labuan Bajo'],['Yang diterima RS','Tiket, rekam medis, tanda vital, resep'],['Pengguna','Koordinator evakuasi dan dokter rujukan'],['Status prototipe','Status hanya berubah di tampilan ini']],4)}
  };
  const featureOverlay = $('#featureDetail');
  const fBody = $('#featureDetailBody');
  const fq = s => fBody.querySelector(s);
  function startEcg(svg) {
    svg.querySelector('path').setAttribute('d', $('#ecgPath').getAttribute('d'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
    [['attributeName','transform'],['type','translate'],['from','0 0'],['to','-400 0'],['dur','4s'],['repeatCount','indefinite']].forEach(([k,v]) => anim.setAttribute(k, v));
    svg.querySelector('g').append(anim);
  }
  function openFeature(key){
    const item=featureViews[key]; if(!item)return;
    $('#featureDetailKicker').textContent=item.kicker; $('#featureDetailTitle').textContent=item.title; fBody.innerHTML=item.html;
    const slot=fq('[data-slot="map"]'); if(slot) slot.prepend($('#jp-2 .sea-map').cloneNode(true));
    const ecg=fq('.ecg'); if(ecg) startEcg(ecg);
    featureOverlay.classList.add('open'); featureOverlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#closeFeatureDetail').focus();
  }
  function closeFeature(){ featureOverlay.classList.remove('open'); featureOverlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  $$('.feature-card[data-feature]').forEach(card=>{card.addEventListener('click',()=>openFeature(card.dataset.feature));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFeature(card.dataset.feature)}})});
  $('#closeFeatureDetail').addEventListener('click',closeFeature);
  featureOverlay.addEventListener('click',e=>{if(e.target===featureOverlay)closeFeature()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&featureOverlay.classList.contains('open'))closeFeature()});

  const fRoles = {medis:['Baca & tulis',true], dokter:['Baca & beri instruksi',true], koordinator:['Prioritas & lokasi saja',false], admin:['Kelola akun, tanpa data klinis',false]};
  const fTriage = {'emergensi':'Emergensi','urgent':'Urgent','non-urgent':'Non-urgent'};
  const bind = k => fq(`[data-bind="${k}"]`);
  fBody.addEventListener('input', e => { if (e.target.id === 'fdName') bind('name').textContent = e.target.value.trim() || 'Tanpa nama'; });
  fBody.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'fdTriage') { fq('.ticket').dataset.level = t.value; bind('level').textContent = fTriage[t.value]; }
    if (t.id === 'fdRole') { const [label, clinical] = fRoles[t.value]; bind('access').textContent = label; fq('.ehr').classList.toggle('restricted', !clinical); fq('.ehr-hidden').hidden = clinical; }
    if (t.name === 'fdSea') { const s = seaScenarios[t.value]; ['wave','wind','route','drift'].forEach(k => bind(k).textContent = s[k]); bind('status').textContent = s.status; bind('status').dataset.level = t.value; fq('.sea-zone').style.opacity = s.zone; }
    if (t.id === 'fdFacility') bind('facility').textContent = t.value;
  });
  let ticketSeq = 412;
  fBody.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    const act = btn.dataset.act;
    if (btn.dataset.goto) { closeFeature(); setStep(+btn.dataset.goto); $('#simulasi').scrollIntoView(); return; }
    if (act === 'newTicket') {
      ticketSeq++; bind('no').textContent = 'NAU-' + String(ticketSeq).padStart(4,'0');
      const d = new Date(); bind('time').textContent = 'Dibuat ' + String(d.getHours()).padStart(2,'0') + '.' + String(d.getMinutes()).padStart(2,'0');
    }
    if (act === 'sync') { const s = fq('.fd-sync'); s.dataset.state = '1'; btn.disabled = true; btn.textContent = 'Mencari sinyal…'; setTimeout(() => { s.dataset.state = '2'; btn.textContent = 'Tersinkron'; }, 1400); }
    if (act === 'rx') {
      const drug = fq('#fdDrug').value.trim(); if (!drug) { fq('#fdDrug').focus(); return; }
      const dose = fq('#fdDose').value.trim(), li = document.createElement('li');
      li.className = 'rx'; li.innerHTML = '<b></b><p></p><time>09.35</time>';
      li.querySelector('b').textContent = 'E-resep RX-' + String(ticketSeq).padStart(4,'0') + ' · terkirim ke kapal';
      li.querySelector('p').textContent = drug + (dose ? ', ' + dose : '');
      fq('.fd-log').append(li); fq('#fdDrug').value = ''; fq('#fdDose').value = '';
    }
    if (act === 'drop') {
      const row = fq('[data-trend="spo"]'), vals = [...trend.spo.slice(0,8), 94, 92];
      row.querySelector('polyline').setAttribute('points', spark(vals, 88, 100));
      row.querySelector('b').firstChild.textContent = '92'; row.classList.add('warn');
      const al = fq('.tr-alert'); al.hidden = false; al.textContent = '10.21 · SpO₂ 92%, di bawah ambang 94%. Dokter rujukan diberi tahu.';
      btn.disabled = true;
    }
    if (act === 'ref') {
      const r = fq('.fd-ref'), n = Math.min(+r.dataset.state + 1, 2);
      r.dataset.state = String(n); bind('badge').textContent = ['Menunggu','Dikonfirmasi','Diterima'][n];
      bind('badge').dataset.state = n;
      if (n === 2) { btn.disabled = true; btn.textContent = 'Serah terima selesai'; }
    }
  });
  $('#heroFullName').textContent = config.fullName;
  $('#heroSubtitle').textContent = config.subtitle;
  $('#contactEmail a').href = 'mailto:' + config.contactEmail;
  $('#contactEmail a').textContent = config.contactEmail;
  $('#dimensionValue').textContent = config.dimensions;
  $('#footerText').textContent = config.footer;
  document.title = config.brand + ' — Integrated Maritime Emergency Care';

  // Theme handling: default follows device; manual choice can override.
  const themeChoice = $('#themeChoice');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme(choice) {
    const theme = choice === 'auto' ? (media.matches ? 'dark' : 'light') : choice;
    document.documentElement.dataset.theme = theme;
    themeChoice.value = choice;
  }
  applyTheme('auto');
  media.addEventListener?.('change', () => { if (themeChoice.value === 'auto') applyTheme('auto'); });
  themeChoice.addEventListener('change', e => applyTheme(e.target.value));
  $('#themeToggle').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
  $('#colorChoice').addEventListener('change', e => {
    document.documentElement.style.setProperty('--color-primary', e.target.value);
    const stronger = {'#CC0000':'#990808','#00487C':'#00345A'}[e.target.value] || e.target.value;
    document.documentElement.style.setProperty('--color-primary-strong', stronger);
  });
  $('#fontChoice').addEventListener('change', e => document.documentElement.style.setProperty('--font-size', e.target.value));
  function setCustomizer(open) {
    $('#customizerBody').hidden = !open;
    $('#customizerToggle').setAttribute('aria-expanded', String(open));
  }
  $('#customizerToggle').addEventListener('click', () => setCustomizer($('#customizerBody').hidden));
  document.addEventListener('click', e => { if (!e.target.closest('.customizer')) setCustomizer(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setCustomizer(false); });
  $('#menuToggle').addEventListener('click', () => {
    const nav = $('#navLinks'), open = nav.classList.toggle('open');
    $('#menuToggle').setAttribute('aria-expanded', String(open));
    $('#menuToggle').textContent = open ? '×' : '☰';
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    $('#navLinks').classList.remove('open'); $('#menuToggle').setAttribute('aria-expanded','false'); $('#menuToggle').textContent='☰';
  }));

  // Demo sistem: satu pasien dalam lima langkah.
  const steps = $$('.journey-step'), panels = $$('.journey-panel');
  let current = 0;
  // Titik kapal berhenti tepat di awal langkah yang aktif, di garis atas deretan langkah.
  function placeShip() {
    const bar = steps[0].parentElement, start = steps[0].offsetLeft;
    bar.style.setProperty('--start', start + 'px');
    bar.style.setProperty('--fill', (steps[current].offsetLeft - start) + 'px');
  }
  window.addEventListener('resize', () => placeShip());
  function setStep(i, focus) {
    current = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, n) => {
      const on = n === current;
      s.setAttribute('aria-selected', String(on)); s.tabIndex = on ? 0 : -1;
      s.classList.toggle('done', n < current);
      panels[n].hidden = !on; panels[n].classList.toggle('active', on);
    });
    if (focus) steps[current].focus();
    const bar = steps[0].parentElement;
    bar.scrollTo({left: steps[current].offsetLeft - bar.offsetLeft - 16, behavior: 'smooth'});
    placeShip();
    $('#journeyPrev').disabled = current === 0;
    $('#journeyNext').disabled = current === steps.length - 1;
    $('#journeyCount').textContent = 'Langkah ' + (current + 1) + ' dari ' + steps.length;
  }
  steps.forEach((s, n) => {
    s.addEventListener('click', () => setStep(n));
    s.addEventListener('keydown', e => {
      const k = {ArrowRight:1, ArrowLeft:-1}[e.key];
      if (k) { e.preventDefault(); setStep(current + k, true); }
      if (e.key === 'Home') { e.preventDefault(); setStep(0, true); }
      if (e.key === 'End') { e.preventDefault(); setStep(steps.length - 1, true); }
    });
  });
  // Saat panel berganti dari tombol bawah, kembalikan pandangan ke deretan langkah bila sudah terlewat.
  const keepInView = () => { const top = $('.journey-steps').getBoundingClientRect().top; if (top < 0) $('.journey-steps').scrollIntoView({block:'start'}); };
  $('#journeyPrev').addEventListener('click', () => { setStep(current - 1); keepInView(); });
  $('#journeyNext').addEventListener('click', () => { setStep(current + 1); keepInView(); });
  $('#journeyRestart').addEventListener('click', () => { setStep(0, true); $('#sync').dataset.state = '0'; $('#syncToggle').disabled = false; $('#syncToggle').textContent = 'Simulasikan sinyal masuk'; });

  const triageNames = {'emergensi':'Emergensi','urgent':'Urgent','non-urgent':'Non-urgent'};
  $('#triageChoice').addEventListener('change', e => {
    $('#ticket').dataset.level = e.target.value;
    $$('.js-level').forEach(el => el.textContent = triageNames[e.target.value]);
  });

  $('#syncToggle').addEventListener('click', e => {
    const sync = $('#sync'), btn = e.currentTarget;
    sync.dataset.state = '1'; btn.disabled = true; btn.textContent = 'Mencari sinyal…';
    setTimeout(() => { sync.dataset.state = '2'; btn.textContent = 'Tersinkron 09.16'; }, 1400);
  });

  const roleAccess = {
    medis:{label:'Baca & tulis', clinical:true},
    dokter:{label:'Baca & beri instruksi', clinical:true},
    koordinator:{label:'Prioritas & lokasi saja', clinical:false},
    admin:{label:'Kelola akun, tanpa data klinis', clinical:false}
  };
  $('#journeyRole').addEventListener('change', e => {
    const r = roleAccess[e.target.value];
    $('#ehrAccess').textContent = r.label;
    $('#ehr').classList.toggle('restricted', !r.clinical);
    $('#ehrHidden').hidden = r.clinical;
  });

  const handoverRoute = {tenang:'Berangkat dari Selat Padar, jalur langsung via utara Rinca', sedang:'Berangkat dari Selat Padar via utara Rinca, kecepatan dikurangi', buruk:'Berangkat setelah koordinasi SAR, jalur terlindung'};
  $('#seaChoice').addEventListener('change', e => {
    const s = seaScenarios[e.target.value];
    $('#jWave').textContent = s.wave; $('#jWind').textContent = s.wind; $('#jRoute').textContent = s.route;
    $('#jStatus').textContent = s.status; $('#jStatus').dataset.level = e.target.value;
    $('#jp-2 .sea-zone').style.opacity = s.zone;
    $('#handoverRoute').textContent = handoverRoute[e.target.value];
  });

  // Garis EKG contoh: pola detak diulang, digeser terus kecuali reduced motion.
  const beat = x => `L${x+30} 50 Q${x+35} 43 ${x+40} 50 L${x+46} 50 L${x+49} 57 L${x+53} 10 L${x+57} 68 L${x+61} 50 L${x+70} 50 Q${x+78} 36 ${x+86} 50 L${x+100} 50`;
  let d = 'M0 50 '; for (let x = 0; x < 800; x += 100) d += beat(x) + ' ';
  $('#ecgPath').setAttribute('d', d);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
    [['attributeName','transform'],['type','translate'],['from','0 0'],['to','-400 0'],['dur','4s'],['repeatCount','indefinite']].forEach(([k,v]) => anim.setAttribute(k, v));
    $('#ecgTrace').append(anim);
  }
  setStep(0);
  let messageDraft = '';
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const values = {
      nama: $('#contactName').value.trim(),
      institusi: $('#contactOrg').value.trim() || 'Tidak disebutkan',
      email: $('#contactMail').value.trim(),
      topik: $('#contactTopic').value,
      pesan: $('#contactMessage').value.trim()
    };
    messageDraft = `Minat kolaborasi NAUSICA\nNama: ${values.nama}\nInstitusi: ${values.institusi}\nEmail: ${values.email}\nTopik: ${values.topik}\nPesan: ${values.pesan}`;
    $('#contactResult').textContent = 'Draf pesan siap. Salin draf untuk dikirim melalui email Anda.';
    $('#copyMessage').style.display = 'inline-flex';
  });
  $('#copyMessage').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(messageDraft); $('#contactResult').textContent = 'Draf berhasil disalin. Anda dapat menempelkannya ke email.'; }
    catch { const area = document.createElement('textarea'); area.value = messageDraft; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); $('#contactResult').textContent = 'Draf disalin jika izin browser mendukung. Anda juga dapat memilih dan menyalinnya secara manual.'; }
  });

  // Subtle reveal animation with a reduced-motion fallback.
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:0.12});
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('visible'));
})();
