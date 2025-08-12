// js/search.js
const $list = $('#list');
const $count = $('#count');
const $price = $('#maxPrice');
const $priceVal = $('#priceVal');
const $district = $('#district');
const $keyword = $('#keyword');
const $sort = $('#sort');

$price.on('input', ()=> $priceVal.text($price.val()));

function cardNode(room){
  const tpl = document.querySelector('#card-tpl');
  const frag = tpl.content.cloneNode(true);
  const root = $(frag).find('.card');

  $(frag).find('.title').text(room.title);
  $(frag).find('.meta').text(`${room.price} triệu · ${room.district} · ${room.address} · 📞 **${room.phone||'0329335212'}**`);
  $(frag).find('.desc').text(room.description || '');

  const tel = (room.phone || '0329335212').replace(/\s+/g,'');
  $(frag).find('#callLink').attr('href', `tel:${tel}`);

  return root;
}

function render(list){
  $list.empty();
  if (!list.length) {
    $list.append('<p class="muted">Không có kết quả phù hợp.</p>');
  } else {
    list.forEach(r => $list.append(cardNode(r)));
  }
  $count.text(`Có ${list.length} phòng`);
}

function queryAndRender(){
  const all = DB.load();
  const max = parseFloat($price.val());
  const d = $district.val().trim().toLowerCase();
  const kw = $keyword.val().trim().toLowerCase();
  const sort = $sort.val();

  let out = all.filter(r => Number(r.price) <= max);
  if (d) out = out.filter(r => (r.district||'').toLowerCase() === d);
  if (kw){
    out = out.filter(r => {
      const hay = `${r.title||''} ${r.address||''} ${r.description||''}`.toLowerCase();
      return hay.includes(kw);
    });
  }

  if (sort === 'latest') out.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if (sort === 'price_asc') out.sort((a,b)=>a.price-b.price);
  if (sort === 'price_desc') out.sort((a,b)=>b.price-a.price);

  render(out);
}

$('#btnSearch').on('click', queryAndRender);
$('#btnReset').on('click', () => {
  $price.val(6).trigger('input');
  $district.val(''); $keyword.val(''); $sort.val('');
  queryAndRender();
});

$(function(){
  DB.ensureSeed();
  $price.trigger('input');
  queryAndRender();
});
