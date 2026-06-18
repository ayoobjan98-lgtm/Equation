document.addEventListener("DOMContentLoaded", function() {
  const STORAGE_KEY = "object";
  const mainContainer = document.getElementById("mainContent");
  
  // ---- دریافت داده از localStorage ----
  let data = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    data = stored ? JSON.parse(stored) : [];
  } catch (e) {
    data = [];
  }
  
  // ---- نمایش لیست معادلات ----
  function renderList() {
    if (data.length === 0) {
      mainContainer.innerHTML = `
        <div class="empty-state">
          <span class="icon">📭</span>
          <p>هنوز معادله‌ای اضافه نکردی</p>
          <p style="font-size:14px; color:#b2bec3;">به صفحه «جدید» برو و اولین معادله رو حل کن</p>
        </div>
      `;
      return;
    }
    
    let html = "";
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      html += `
        <div class="equation-card" data-index="${i}">
          <div class="eq-index">#${i + 1}</div>
          <div class="eq-title">${item.title || 'معادله'}</div>
          <div class="eq-text">${item.text || ''}</div>
          <div class="eq-actions">
            <button class="btn-like" data-action="like" data-index="${i}">
              ${item.like ? '❤️' : '🤍'}
            </button>
            <button class="btn-delete" data-action="delete" data-index="${i}">
              🗑️
            </button>
          </div>
        </div>
      `;
    }
    mainContainer.innerHTML = html;
    
    // دکمه حذف همه در بالای صفحه (اگر حداقل یک آیتم باشد)
    const deleteAllBtn = document.createElement("button");
    deleteAllBtn.className = "btn btn-danger";
    deleteAllBtn.style.cssText = "margin-bottom:16px; width:100%;";
    deleteAllBtn.textContent = "🗑️ حذف همه معادلات";
    deleteAllBtn.addEventListener("click", function() {
      showModal("آیا مطمئنی؟ همه معادلات برای همیشه حذف می‌شن!", function() {
        data = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderList();
      });
    });
    mainContainer.prepend(deleteAllBtn);
  }
  
  // ---- مودال سفارشی ----
  function showModal(message, onConfirm) {
    const overlay = document.getElementById("modalOverlay");
    const msg = document.getElementById("modalMessage");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");
    
    msg.textContent = message;
    overlay.style.display = "flex";
    
    // حذف رویدادهای قبلی
    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    
    newConfirm.addEventListener("click", function() {
      overlay.style.display = "none";
      if (onConfirm) onConfirm();
    });
    newCancel.addEventListener("click", function() {
      overlay.style.display = "none";
    });
  }
  
  // ---- مدیریت رویدادها با Event Delegation ----
  mainContainer.addEventListener("click", function(e) {
    const target = e.target.closest("button");
    if (!target) return;
    
    const action = target.dataset.action;
    const index = parseInt(target.dataset.index);
    if (isNaN(index)) return;
    
    // لایک
    if (action === "like") {
      data[index].like = !data[index].like;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      renderList(); // رندر مجدد برای بروزرسانی نمایش
      return;
    }
    
    // حذف تکی
    if (action === "delete") {
      showModal("آیا مطمئنی که می‌خوای این معادله رو حذف کنی؟", function() {
        data.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderList();
      });
    }
  });
  
  // ---- اجرا ----
  renderList();
});};

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
