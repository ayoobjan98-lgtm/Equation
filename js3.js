var range =[1, 2, 3, 4, 5, 6]; 
var key = "object"; 
var recv = localStorage.getItem(key); 
var data = JSON.parse(recv); 
var liked = data.like; 
var lendata = data.length; 

var html = "<p></p>"; 
var g = document.getElementById("maker");  

for (var i in data) {
  var d = data[i]; 
  
  if (d.like){
    console.log(78); 
    html += `<div class="rect" data-index="${i}">
    <div class="title">
      عنوان معادله : ${d.title}
    </div>
    <div class="discription">
      ${d.text}
    </div>
    <div class="actions">
      <button class="btn liked" data-index="${i}">حذف از علاقه مندی❤</button>
    </div>
  </div>`;
  } 
}

g.innerHTML = html; 

g.addEventListener("click", function (e){
  const delBtn = e.target.closest(".btn");
if (delBtn) {
  const confirmed = confirm("آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟");
  if (!confirmed) return;
  
  const index = delBtn.dataset.index;
  const rect = delBtn.closest(".rect");
  
  data[index].like = false; 
  localStorage.setItem(key, JSON.stringify(data));
  rect.remove();
}

}) 
