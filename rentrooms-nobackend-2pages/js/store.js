// js/store.js
const LS_KEY = 'rentrooms:data';
const LS_FILTERS = 'rentrooms:filters';
const LS_FLASH = 'rentrooms:flash';

const SeedData = [
  { id: 1, title: 'Phòng Q10 gần ĐH Bách Khoa', price: 3.5, district: 'Q10', address: '123 Lý Thường Kiệt, Q10', phone: '0329335212', description: 'Phòng sạch, WC riêng, để xe miễn phí', createdAt: Date.now()-86400000*2 },
  { id: 2, title: 'Căn hộ mini Q11 full nội thất', price: 5.2, district: 'Q11', address: '45 Ông Ích Khiêm, Q11', phone: '0329335212', description: 'Ban công thoáng, giờ giấc tự do', createdAt: Date.now()-86400000 }
];

window.DB = {
  load(){
    try { const raw = localStorage.getItem(LS_KEY); return raw ? (JSON.parse(raw) || []) : []; }
    catch { return []; }
  },
  save(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); },
  nextId(list){ return (list.reduce((m, r) => Math.max(m, Number(r.id)||0), 0) + 1); },
  upsert(payload){
    const list = this.load();
    if (payload.id){
      const idx = list.findIndex(r => Number(r.id) === Number(payload.id));
      if (idx !== -1) list[idx] = { ...list[idx], ...payload, updatedAt: Date.now() };
      else list.push({ ...payload, createdAt: Date.now() });
    } else {
      const id = this.nextId(list);
      list.push({ id, ...payload, createdAt: Date.now() });
      payload.id = id; // trả lại id mới cho caller
    }
    this.save(list);
    return payload.id;
  },
  remove(id){
    const list = this.load();
    const idx = list.findIndex(r => Number(r.id) === Number(id));
    if (idx !== -1){ list.splice(idx, 1); this.save(list); }
    return true;
  },
  ensureSeed(){ if (this.load().length === 0) this.save(SeedData); }
};

window.UI = {
  saveFilters(obj){ localStorage.setItem(LS_FILTERS, JSON.stringify(obj||{})); },
  loadFilters(){
    try { return JSON.parse(localStorage.getItem(LS_FILTERS) || '{}'); }
    catch { return {}; }
  },
  setFlash(msg, type='success'){ localStorage.setItem(LS_FLASH, JSON.stringify({msg, type, t:Date.now()})); },
  popFlash(){
    try {
      const raw = localStorage.getItem(LS_FLASH);
      if (!raw) return null;
      localStorage.removeItem(LS_FLASH);
      return JSON.parse(raw);
    } catch { return null; }
  },
  getQuery(){ return Object.fromEntries(new URLSearchParams(location.search).entries()); }
};
