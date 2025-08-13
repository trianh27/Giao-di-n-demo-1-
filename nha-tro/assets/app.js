const KHOA_LUU = 'duLieuPhongTro_v1';

function layDanhSachPhong(){
  const thung = localStorage.getItem(KHOA_LUU);
  return thung ? JSON.parse(thung) : [];
}
function luuDanhSachPhong(danhSach){
  localStorage.setItem(KHOA_LUU, JSON.stringify(danhSach));
}
function taoId(){ return 'p' + Date.now().toString(36); }
function dinhDangTien(n){ return Number(n||0).toLocaleString('vi-VN'); }
function _esc(s){ return (s??'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function _xuongDong(s){ return String(s||'').replace(/\n/g,'<br>'); }

// lọc
function locPhongTheoNhuCau(danhSach, boLoc){
  return danhSach.filter(p=>{
    const matchTuKhoa = !boLoc.tuKhoa
      || [p.tieuDe,p.moTa,p.diaChi,p.khuVuc,(p.tienNghi||[]).join(' ')].join(' ').toLowerCase().includes(boLoc.tuKhoa.toLowerCase());
    const matchKhuVuc = !boLoc.khuVuc || p.khuVuc.toLowerCase().includes(boLoc.khuVuc.toLowerCase());
    const matchGiaMin = !boLoc.giaMin || p.giaThue >= boLoc.giaMin;
    const matchGiaMax = !boLoc.giaMax || p.giaThue <= boLoc.giaMax;
    const matchDtMin  = !boLoc.dienTichMin || p.dienTich >= boLoc.dienTichMin;
    const matchDtMax  = !boLoc.dienTichMax || p.dienTich <= boLoc.dienTichMax;
    return matchTuKhoa && matchKhuVuc && matchGiaMin && matchGiaMax && matchDtMin && matchDtMax;
  }).sort((a,b)=>b.ngayDang - a.ngayDang);
}

// thẻ phòng tìm trọ
function taoThePhongLon(p){
  const hinh = p.hinhAnh || 'https://i.pinimg.com/736x/a3/36/4e/a3364e6012107f9028ff3664dd0c2fc7.jpg';
  return `
    <article class="phong">
      <img class="anh" src="${hinh}" alt="Hình phòng trọ">
      <div class="noi-dung">
        <div class="tieu-de">${_esc(p.tieuDe)}</div>
        <div class="phu">📍 ${_esc(p.khuVuc)}</div>
        <div class="phu">💰 ${dinhDangTien(p.giaThue)} đ/tháng • 📐 ${p.dienTich} m²</div>
        <a class="btn btn-ghost" href="chi-tiet.html?id=${p.idPhong}">Xem chi tiết</a>
      </div>
    </article>`;
}

// thẻ trang chủ
function taoThePhongNho(p){
  const hinh = p.hinhAnh || 'https://i.pinimg.com/736x/a3/36/4e/a3364e6012107f9028ff3664dd0c2fc7.jpg';
  return `
    <article class="phong">
      <img class="anh" src="${hinh}" alt="Hình phòng trọ">
      <div class="noi-dung">
        <div class="tieu-de">${_esc(p.tieuDe)}</div>
        <div class="phu">📍 ${_esc(p.khuVuc)}</div>
        <div class="phu">💰 ${dinhDangTien(p.giaThue)} đ/tháng • 📐 ${p.dienTich} m²</div>
        <a class="btn btn-ghost" href="chi-tiet.html?id=${p.idPhong}">Xem</a>
      </div>
    </article>`;
}

// tạo mẫu
function taoDuLieuMauNeuChuaCo(){
  if (layDanhSachPhong().length) return;
  const mau = [
    {
      idPhong: taoId(),
      tieuDe: "Phòng trọ A",
      moTa: "Phòng có cửa sổ, có gác.\nGiờ giấc tự do, để xe tầng trệt.",
      diaChi: "36 đường 36, P.Linh Trung",
      khuVuc: "TP Thủ Đức, TP.HCM",
      giaThue: 3000000,
      dienTich: 18,
      hinhAnh: "",
      tienNghi: ["Giờ giấc tự do","Chỗ để xe"],
      nguoiDang: { hoTen:"Chị Mai", soDienThoai:"0912345678", email:"" },
      ngayDang: Date.now()-1000*60*60*24*2
    },
    {
      idPhong: taoId(),
      tieuDe: "Căn hộ mini 30m², có máy lạnh",
      moTa: "Giường, tủ, bếp từ nhỏ, ban công.\nPhù hợp 1-2 người.",
      diaChi: "45/2 Lê Văn Việt",
      khuVuc: "TP Thủ Đức, TP.HCM",
      giaThue: 5500000,
      dienTich: 30,
      hinhAnh: "https://i.pinimg.com/736x/16/ff/9e/16ff9ec659b7b5d0ac7c338c7595f723.jpg",
      tienNghi: ["Máy lạnh","Cho nấu ăn"],
      nguoiDang: { hoTen:"Anh Hùng", soDienThoai:"+84987654321", email:"" },
      ngayDang: Date.now()-1000*60*60*24
    },
    {
      idPhong: taoId(),
      tieuDe: "Phòng 12m² giá SV, gần bến xe",
      moTa: "Khu yên tĩnh, có máy giặt dùng chung.",
      diaChi: "Khu phố 6",
      khuVuc: "Dĩ An, Bình Dương",
      giaThue: 1500000,
      dienTich: 12,
      hinhAnh: "https://i.pinimg.com/736x/de/b5/a2/deb5a20742a17bd22d0dd9793c0c4f20.jpg",
      tienNghi: ["Máy giặt"],
      nguoiDang: { hoTen:"Cô Lan", soDienThoai:"0900000000", email:"" },
      ngayDang: Date.now()-1000*60*60*12
    }
  ];
  luuDanhSachPhong(mau);
}

// tạo mẫu all
document.addEventListener('DOMContentLoaded', taoDuLieuMauNeuChuaCo);
