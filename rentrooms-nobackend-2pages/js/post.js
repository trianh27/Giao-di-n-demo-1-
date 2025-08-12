// js/post.js
const $list = $('#list');
const $form = $('#formRoom');
const $alert = $('#alertBox');

function showAlert(msg, type='success'){
  $alert.removeClass('success error').addClass(type).text(msg).show();
  setTimeout(()=> $alert.hide(), 1800);
}

function cardNode(room){
  const tpl = document.querySelector('#card-tpl');
  const frag = tpl.content.cloneNode(true);
  const root = $(frag).find('.card');

  $(frag).find('.title').text(room.title);
  $(frag).find('.meta').text(`${room.price} triệu · ${room.district} · ${room.address} · 📞 **${room.phone||'0329335212'}**`);
  $(frag).find('.desc').text(room.description || '');

  root.find('.edit').on('click', ()=> fillForm(room));
  root.find('.delete').on('click', ()=> onDelete(room.id));

  return root;
}

function renderList(){
  const list = DB.load().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  $list.empty();
  if (!list.length){
    $list.append('<p class="muted">Chưa có phòng nào. Hãy thêm mới.</p>');
  } else {
    list.forEach(r => $list.append(cardNode(r)));
  }
}

function fillForm(room){
  const f = $form[0];
  f.id.value = room.id;
  f.title.value = room.title || '';
  f.price.value = room.price ?? '';
  f.district.value = room.district || '';
  f.address.value = room.address || '';
  f.phone.value = room.phone || '0329335212';
  f.description.value = room.description || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function onDelete(id){
  if (!confirm('Xoá phòng này?')) return;
  DB.remove(id);
  renderList();
  showAlert('Đã xoá.', 'success');
  const f = $form[0];
  if (f.id.value && Number(f.id.value) === Number(id)) f.reset();
}

$form.on('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const payload = {
    id: f.id.value ? Number(f.id.value) : undefined,
    title: f.title.value.trim(),
    price: Number(f.price.value),
    district: f.district.value.trim(),
    address: f.address.value.trim(),
    phone: (f.phone.value.trim() || '0329335212'),
    description: f.description.value.trim()
  };
  if (!payload.title || isNaN(payload.price) || !payload.district || !payload.address){
    return showAlert('Vui lòng điền đủ các trường bắt buộc.', 'error');
  }
  const id = DB.upsert(payload); // trả về id (mới hoặc cũ)

  // flash + điều hướng về trang tìm kiếm, giữ bộ lọc cũ
  UI.setFlash('Đã lưu phòng.', 'success');
  const filters = UI.loadFilters();
  const qs = new URLSearchParams(filters).toString();
  location.href = './search.html' + (qs ? ('?' + qs) : '');
});

$('#btnResetForm').on('click', ()=> $form[0].reset());

// Backup/Restore
$('#btnExport').on('click', () => {
  const dataStr = JSON.stringify(DB.load(), null, 2);
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
      DB.save(arr);
      renderList();
      showAlert('Nhập JSON thành công.');
      e.target.value = '';
    }catch(err){
      showAlert('Lỗi nhập JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file, 'utf-8');
});

$('#btnClear').on('click', () => {
  if (!confirm('Xoá toàn bộ dữ liệu?')) return;
  DB.save([]);
  renderList();
  showAlert('Đã xoá toàn bộ dữ liệu.', 'success');
});

$(function(){
  DB.ensureSeed();
  renderList();

  // Nếu có ?id= trên URL → vào chế độ sửa
  const q = UI.getQuery();
  if (q.id){
    const list = DB.load();
    const found = list.find(r => String(r.id) === String(q.id));
    if (found) {
      fillForm(found);
      showAlert('Đang sửa phòng #' + found.id, 'success');
    } else {
      showAlert('Không tìm thấy phòng cần sửa.', 'error');
    }
  }
});
