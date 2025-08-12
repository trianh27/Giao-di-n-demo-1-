
// app.js — utilities shared across pages. No frameworks, just vanilla JS.
const App = (() => {
  const STORAGE_KEY = 'rooms_v1';

  function getRooms() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e) { console.warn(e); return []; }
  }

  function saveRooms(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addRoom(room) {
    const list = getRooms();
    list.unshift(room);
    saveRooms(list);
  }

  function uuid() {
    return 'id-' + Math.random().toString(36).slice(2,9) + Date.now().toString(36);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function formatVND(n) {
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND', maximumFractionDigits:0 }).format(n);
  }

  const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%236b7280'>No Photo</text></svg>";

  function seedDemoData() {
    const has = getRooms();
    if (has.length) return;
    const demo = [
      {
        id: uuid(),
        createdAt: nowISO(),
        title: "Phòng 18m² gần ĐH Bách Khoa, có máy lạnh",
        price: 2500000,
        area: 18,
        city: "TP.HCM",
        district: "Quận 10",
        phone: "0329335212",
        amenities: { wifi: true, park: true, ac: true, private: true },
        image: PLACEHOLDER,
        desc: "Phòng sạch, giờ giấc tự do, có cửa sổ thoáng. Điện 3.5k, nước 15k."
      },
      {
        id: uuid(),
        createdAt: nowISO(),
        title: "Căn hộ mini 25m² full nội thất",
        price: 4200000,
        area: 25,
        city: "Hà Nội",
        district: "Cầu Giấy",
        phone: "0329335212",
        amenities: { wifi: true, park: true, ac: true, private: true },
        image: PLACEHOLDER,
        desc: "Gần công viên, ban công thoáng, bếp riêng."
      },
      {
        id: uuid(),
        createdAt: nowISO(),
        title: "Phòng trọ giá rẻ 12m²",
        price: 1500000,
        area: 12,
        city: "Đà Nẵng",
        district: "Hải Châu",
        phone: "0329335212",
        amenities: { wifi: false, park: true, ac: false, private: true },
        image: PLACEHOLDER,
        desc: "Khu yên tĩnh, thích hợp sinh viên."
      }
    ];
    saveRooms(demo);
  }

  return { getRooms, saveRooms, addRoom, formatVND, seedDemoData, PLACEHOLDER, uuid, nowISO };
})();

