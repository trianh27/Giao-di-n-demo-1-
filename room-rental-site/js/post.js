
// post.js — form handling for post.html
document.addEventListener('DOMContentLoaded', () => {
  const els = {
    form: document.getElementById('postForm'),
    title: document.getElementById('title'),
    price: document.getElementById('price'),
    area: document.getElementById('area'),
    city: document.getElementById('city'),
    district: document.getElementById('district'),
    phone: document.getElementById('phone'),
    wifi: document.getElementById('amenity-wifi'),
    park: document.getElementById('amenity-park'),
    ac: document.getElementById('amenity-ac'),
    priv: document.getElementById('amenity-private'),
    imageUrl: document.getElementById('imageUrl'),
    imageFile: document.getElementById('imageFile'),
    preview: document.getElementById('preview'),
    desc: document.getElementById('desc'),
    msg: document.getElementById('msg')
  };

  // image previews
  els.imageUrl.addEventListener('input', () => {
    const url = els.imageUrl.value.trim();
    if (url){
      els.preview.src = url;
      els.preview.style.display = 'block';
    } else if (!els.imageFile.files.length){
      els.preview.style.display = 'none';
    }
  });

  els.imageFile.addEventListener('change', () => {
    const file = els.imageFile.files[0];
    if (!file){ 
      if(!els.imageUrl.value.trim()) els.preview.style.display='none';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => { els.preview.src = e.target.result; els.preview.style.display='block'; };
    reader.readAsDataURL(file);
  });

  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    if (!els.title.value.trim()) return tip('Vui lòng nhập tiêu đề.');
    if (!els.price.value || Number(els.price.value) <= 0) return tip('Giá phải lớn hơn 0.');
    if (!els.area.value || Number(els.area.value) <= 0) return tip('Diện tích phải lớn hơn 0.');
    if (!els.city.value.trim()) return tip('Vui lòng nhập thành phố.');
    if (!/^[0-9\s+()-]{8,}$/.test(els.phone.value.trim())) return tip('Số điện thoại chưa hợp lệ.');

    const image = await resolveImage();

    const room = {
      id: App.uuid(),
      createdAt: App.nowISO(),
      title: els.title.value.trim(),
      price: Number(els.price.value),
      area: Number(els.area.value),
      city: els.city.value.trim(),
      district: els.district.value.trim(),
      phone: els.phone.value.trim(),
      amenities: {
        wifi: !!els.wifi.checked,
        park: !!els.park.checked,
        ac: !!els.ac.checked,
        private: !!els.priv.checked
      },
      image,
      desc: els.desc.value.trim()
    };

    App.addRoom(room);
    els.msg.style.display = 'block';
    els.msg.innerHTML = '<span class="bold">Đã lưu!</span> Tin của bạn đã xuất hiện ở trang <a href="search.html">Tìm phòng</a>.';
    els.form.reset();
    els.preview.style.display = 'none';
    window.scrollTo({top:0, behavior:"smooth"});
  });

  function tip(text){
    els.msg.style.display = 'block';
    els.msg.textContent = text;
    els.msg.scrollIntoView({behavior:'smooth'});
  }

  function resolveImage(){
    // Priority: file upload > image URL > placeholder
    return new Promise(resolve => {
      const file = els.imageFile.files[0];
      if (file){
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      } else if (els.imageUrl.value.trim()){
        resolve(els.imageUrl.value.trim());
      } else {
        resolve(App.PLACEHOLDER);
      }
    });
  }
});
