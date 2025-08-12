// ====== “No backend” storage: localStorage ======
const LS_KEY = 'rentrooms:data';

const SeedData = [
  { id: 1, title: 'Phòng Q10 gần ĐH Bách Khoa', price: 3.5, district: 'Q10', address: '123 Lý Thường Kiệt, Q10', description: 'Phòng sạch, WC riêng, để xe miễn phí', createdAt: Date.now()-86400000*2 },
  { id: 2, title: 'Căn hộ mini Q11 full nội thất', price: 5.2, district: 'Q11', address: '45 Ông Ích Khiêm, Q11', description: 'Ban công thoáng, giờ giấc tự do', createdAt: Date.now()-86400000 },
  { id: 3, title: 'Phòng Q5 gần BV Chợ Rẫy', price: 4.0, district: 'Q5', address: 'Nguyễn Chí Thanh, Q5', description: 'Máy lạnh, có thang máy', createdAt: Date.now()-3600000 }
];

const store = {
  load(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    }catch(e){ console.warn('Parse LS error', e); return []; }
  },
  save(list){
    try{
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      return true;
    }catch(e){
      alert('Lưu thất bại (có thể đầy bộ nhớ trình duyệt).');
      return false;
    }
  },
  nextId(list){
    const max = list.reduce((m, r) => Math.max(m, Number(r.id)||0), 0);
    return max + 1;
  }
};

// ====== DOM ======
const $list = $('#list');
const $count = $('#count');
const $price = $('#maxPrice');
const $priceVal = $('#priceVal');
const $district = $('#district');
const $keyword = $('#keyword');
const $sort = $('#sort');
const $form = $('#formRoom');
const $btnCancel = $('#btnCancel');

$price.on('input', () => $priceVal.text($price.val()));

// ====== Render ======
function cardNode(room){
  const tpl = document.querySelector('#card-tpl');
  const frag = tpl.content.cloneNode(true);
  const root = $(frag).find('.card');

  $(frag).find('.title').text(room.title);
  $(frag).find('.meta').text(`${room.price} triệu · ${room.district} · ${room.address}`);
  $(frag).find('.desc').text(room.description || '');

  root.find('.edit').on('click', () => fillForm(room));
  root.find('.delete').on('click', () => onDelete(room.id));

  return root;
}

function render(list){
  $list.empty();
  if (!list.length) {
    $list.append(`<p class="muted">Không có kết quả phù hợp.</p>`);
  } else {
    list.forEach(r => $list.append(cardNode(r)));
  }
  $count.text(`Có ${list.length} phòng`);
}

// ====== Filter / Sort ======
function queryAndRender(){
  const all = store.load();

  const max = parseFloat($price.val());
  const d = $district.val().trim();
  const kw = $keyword.val().trim().toLowerCase();
  const sort = $sort.val();

  let out = all.filter(r => r.price <= max);
  if (d) out = out.filter(r => (r.district||'').toLowerCase() === d.toLowerCase());
  if (kw){
    out = out.filter(r => {
      const hay = `${r.title||''} ${r.address||''} ${r.description||''}`.toLowerCase();
      return hay.includes(kw);
    });
  }

  if (sort === 'latest') out.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if (sort === 'price_asc') out.sort((a,b)=>a.price - b.price);
  if (sort === 'price_desc') out.sort((a,b)=>b.price - a.price);

  render(out);
}

// ====== CRUD ======
function fillForm(room){
  $form[0].id.value = room.id;
  $form[0].title.value = room.title;
  $form[0].price.value = room.price;
  $form[0].district.value = room.district;
  $form[0].address.value = room.address;
  $form[0].description.value = room.description || '';
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function onDelete(id){
  if (!confirm('Xoá phòng này?')) return;
  const list = store.load();
  const idx = list.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return;
  list.splice(idx, 1);
  store.save(list);
  queryAndRender();
  // nếu form đang mở đúng item, huỷ form
  if ($form[0].id.value && Number($form[0].id.value) === Number(id)) {
    $form.trigger('reset');
  }
}

$form.on('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const payload = {
    title: f.title.value.trim(),
    price: Number(f.price.value),
    district: f.district.value.trim(),
    address: f.address.value.trim(),
    description: f.description.value.trim()
  };
  if (!payload.title || isNaN(payload.price) || !payload.district || !payload.address){
    alert('Vui lòng điền đủ các trường bắt buộc.');
    return;
  }
  let list = store.load();
  const now = Date.now();

  if (f.id.value){ // update
    const id = Number(f.id.value);
    const idx = list.findIndex(r => Number(r.id) === id);
    if (idx === -1) return alert('Không tìm thấy bản ghi để cập nhật.');
    list[idx] = { ...list[idx], ...payload, updatedAt: now };
  } else { // create
    const id = store.nextId(list);
    list.push({ id, ...payload, createdAt: now });
  }
  store.save(list);
  f.reset();
  queryAndRender();
});

$btnCancel.on('click', () => $form[0].reset());

// ====== Backup / Restore ======
$('#btnExport').on('click', () => {
  const dataStr = JSON.stringify(store.load(), null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'rooms-backup.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

$('#fileImport').on('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr)) throw new Error('JSON không phải mảng.');
      // kiểm tra sơ bộ
      arr.forEach(x => {
        if (typeof x.title !== 'string' || typeof x.price !== 'number') {
          throw new Error('Dữ liệu không hợp lệ.');
        }
      });
      store.save(arr);
      queryAndRender();
      alert('Nhập dữ liệu thành công.');
      e.target.value = '';
    }catch(err){
      alert('Lỗi nhập JSON: ' + err.message);
    }
  };
  reader.readAsText(file, 'utf-8');
});

$('#btnSeed').on('click', () => {
  if (!confirm('Ghi đè dữ liệu hiện tại bằng dữ liệu mẫu?')) return;
  store.save(SeedData);
  queryAndRender();
});

$('#btnClear').on('click', () => {
  if (!confirm('Xoá toàn bộ dữ liệu?')) return;
  store.save([]);
  queryAndRender();
});

// ====== Events ======
$('#btnSearch').on('click', queryAndRender);
$('#btnReset').on('click', () => {
  $price.val(6).trigger('input');
  $district.val('');
  $keyword.val('');
  $sort.val('');
  queryAndRender();
});

// ====== Init ======
$(function(){
  // nếu chưa có dữ liệu, nạp seed mặc định (1 lần)
  if (store.load().length === 0) {
    store.save(SeedData);
  }
  $price.trigger('input');
  queryAndRender();
});
