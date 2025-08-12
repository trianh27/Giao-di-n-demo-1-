
// search.js — filtering & rendering logic for search.html
document.addEventListener('DOMContentLoaded', () => {
  const els = {
    q: document.getElementById('q'),
    minPrice: document.getElementById('minPrice'),
    maxPrice: document.getElementById('maxPrice'),
    minArea: document.getElementById('minArea'),
    city: document.getElementById('city'),
    sort: document.getElementById('sort'),
    wifi: document.getElementById('amenity-wifi'),
    park: document.getElementById('amenity-park'),
    ac: document.getElementById('amenity-ac'),
    priv: document.getElementById('amenity-private'),
    apply: document.getElementById('apply'),
    clear: document.getElementById('clear'),
    seed: document.getElementById('seed'),
    results: document.getElementById('results'),
    empty: document.getElementById('empty'),
  };

  // If there's no data, offer to seed
  els.seed.addEventListener('click', () => {
    App.seedDemoData();
    render();
  });

  // Bind events
  [els.q, els.minPrice, els.maxPrice, els.minArea, els.city, els.sort]
    .forEach(input => input.addEventListener('input', render));
  [els.wifi, els.park, els.ac, els.priv]
    .forEach(chk => chk.addEventListener('change', render));

  els.apply.addEventListener('click', (e) => {
    e.preventDefault();
    render();
  });

  els.clear.addEventListener('click', (e) => {
    e.preventDefault();
    els.q.value='';
    els.minPrice.value='';
    els.maxPrice.value='';
    els.minArea.value='';
    els.city.value='';
    els.sort.value='new';
    els.wifi.checked=false;
    els.park.checked=false;
    els.ac.checked=false;
    els.priv.checked=false;
    render();
  });

  function matchesAmenity(room){
    if (els.wifi.checked && !room.amenities?.wifi) return false;
    if (els.park.checked && !room.amenities?.park) return false;
    if (els.ac.checked && !room.amenities?.ac) return false;
    if (els.priv.checked && !room.amenities?.private) return false;
    return true;
  }

  function render(){
    const list = App.getRooms();
    if (list.length === 0){
      els.results.innerHTML = '';
      els.empty.style.display = 'block';
      return;
    }

    const q = els.q.value.trim().toLowerCase();
    const minP = Number(els.minPrice.value || 0);
    const maxP = Number(els.maxPrice.value || Number.MAX_SAFE_INTEGER);
    const minA = Number(els.minArea.value || 0);
    const city = els.city.value.trim().toLowerCase();

    let filtered = list.filter(r => {
      const text = [r.title, r.city, r.district, r.desc].join(' ').toLowerCase();
      const kwOK = q ? text.includes(q) : true;
      const cityOK = city ? (r.city || '').toLowerCase().includes(city) : true;
      const priceOK = (r.price ?? 0) >= minP && (r.price ?? 0) <= maxP;
      const areaOK = (r.area ?? 0) >= minA;
      const amenOK = matchesAmenity(r);
      return kwOK && cityOK && priceOK && areaOK && amenOK;
    });

    switch(els.sort.value){
      case 'price-asc': filtered.sort((a,b)=> (a.price||0)-(b.price||0)); break;
      case 'price-desc': filtered.sort((a,b)=> (b.price||0)-(a.price||0)); break;
      case 'area-desc': filtered.sort((a,b)=> (b.area||0)-(a.area||0)); break;
      default: filtered.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)); break;
    }

    els.results.innerHTML = filtered.map(r => cardHTML(r)).join('');
    els.empty.style.display = filtered.length ? 'none' : 'block';
  }

  function cardHTML(r){
    const tags = [
      r.amenities?.wifi ? '<span class="tag">Wifi</span>' : '',
      r.amenities?.park ? '<span class="tag">Để xe</span>' : '',
      r.amenities?.ac ? '<span class="tag">Máy lạnh</span>' : '',
      r.amenities?.private ? '<span class="tag">WC riêng</span>' : '',
    ].filter(Boolean).join(' ');

    const when = new Date(r.createdAt).toLocaleString('vi-VN');

    return `
    <article class="card">
      <img src="${r.image || App.PLACEHOLDER}" alt="${escapeHTML(r.title)}" onerror="this.src='${App.PLACEHOLDER}'">
      <div class="body">
        <div class="row" style="justify-content:space-between">
          <h3 style="margin:0">${escapeHTML(r.title)}</h3>
          <span class="price">${App.formatVND(Number(r.price||0))}</span>
        </div>
        <div class="small muted">${r.area || '—'} m² • ${escapeHTML(r.city || '')} ${r.district?('— '+escapeHTML(r.district)) : ''}</div>
        <div class="row" style="margin-top:6px">${tags}</div>
        <p class="small" style="margin:8px 0 0">${escapeHTML(r.desc || '')}</p>
        <div class="row" style="margin-top:8px;justify-content:space-between;">
          <span class="phone">☎ <strong>${escapeHTML(r.phone || '')}</strong></span>
          <span class="small muted">${when}</span>
        </div>
      </div>
    </article>`;
  }

  function escapeHTML(s=''){
    return s.replace(/[&<>"]/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
    }[c]));
  }

  // initial render
  render();
});
