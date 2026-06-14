let key = "object";
let recv = localStorage.getItem(key);
let data = recv ? JSON.parse(recv) : [];
var g = document.getElementById("m");

// --- اضافه کردن ساختار مودال به بدنه صفحه ---
const modalHTML = `
<div id="customModal" class="custom-modal-overlay">
  <div class="custom-modal">
    <p id="modalMessage">آیا مطمئن هستید؟</p>
    <div class="modal-buttons">
      <button id="modalConfirm" class="btn-confirm">بله</button>
      <button id="modalCancel" class="btn-cancel">انصراف</button>
    </div>
  </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const modalOverlay = document.getElementById("customModal");
const modalMessage = document.getElementById("modalMessage");
const modalConfirmBtn = document.getElementById("modalConfirm");
const modalCancelBtn = document.getElementById("modalCancel");

let onConfirmCallback = null; // ذخیره کردن عملیاتی که پس از تایید باید انجام شود

// تابع کمکی برای باز کردن مودال
function showCustomConfirm(message, callback) {
  modalMessage.innerText = message;
  modalOverlay.style.display = "flex";
  onConfirmCallback = callback;
}

// بستن مودال
modalCancelBtn.onclick = () => {
  modalOverlay.style.display = "none";
  onConfirmCallback = null;
};

// اجرای عملیات تایید شده
modalConfirmBtn.onclick = () => {
  if (onConfirmCallback) onConfirmCallback();
  modalOverlay.style.display = "none";
  onConfirmCallback = null;
};

// --- منطق اصلی نمایش داده‌ها ---
var html = "";
if (data.length === 0) {
  html += "<h2 class='mk'>هنوز معادله‌ای اضافه نکرداید</h2>";
} else {
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (!d.s) {
      html += `<div class="rect" data-index="${i}">
                <div class="title">عنوان معادله : ${d.title}</div>
                <p class="num1"></p> <p class="num">${i + 1}</p> 
                <div class="discription">${d.text}</div>
                <div class="actions">
                  <button class="like" data-index="${i}" style="background:${d.like ? '#e74c3c' : '#2ecc71'}; color:white;">${d.like ? '❤️' : '🤍'}</button>
                  <button class="btn" data-index="${i}">🗑</button>
                </div>
            </div>`;
    }
  }
}
g.innerHTML = html;

// Event Delegation
g.addEventListener("click", function(e) {
  // لایک
  const likeBtn = e.target.closest(".like");
  if (likeBtn) {
    const index = likeBtn.dataset.index;
    data[index].like = !data[index].like;
    localStorage.setItem(key, JSON.stringify(data));
    
    // تغییر ظاهر بلافاصله
    likeBtn.textContent = data[index].like ? "❤️" : "🤍";
    likeBtn.style.background = data[index].like ? "#e74c3c" : "#2ecc71";
    return;
  }
  
  // حذف تک مورد با مودال جدید
  const delBtn = e.target.closest(".btn");
  if (delBtn) {
    const index = delBtn.dataset.index;
    showCustomConfirm("آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟", () => {
      data.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(data));
      location.reload(); // ساده‌ترین راه برای بروزرسانی ظاهر
    });
  }
});

// بخش حذف همه
if (data.length > 0) {
  const headerHtml = `<button id="deleteAllBtn" style="background:#c0392b; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; position:fixed; top:10px; z-index:5;">🗑️ حذف همه!</button>`;
  g.insertAdjacentHTML("afterbegin", headerHtml);
  
  document.getElementById("deleteAllBtn").addEventListener("click", function() {
    showCustomConfirm("این عمل قابل بازگشت نیست! آیا واقعاً می‌خواهید تمام معادلات را حذف کنید؟", () => {
      data = [];
      localStorage.setItem(key, JSON.stringify(data));
      location.reload();
    });
  });
                                                     }
