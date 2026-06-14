document.addEventListener("DOMContentLoaded", function() {
  const select = document.getElementById("change");
  const solverDiv = document.getElementById("solver");
  const solveBtn = document.getElementById("solveBtn");
  
  if (!select || !solverDiv || !solveBtn) return;
  
  let n = parseInt(select.value) || 1;
  const localStorageKey = "object";
  let history = [];
  let liked = false;

  const stored = localStorage.getItem(localStorageKey);
  if (stored) {
    try { history = JSON.parse(stored); } catch (e) { history = []; }
  }

  // نام مجهول‌ها بر اساس n و ایندکس
  function getVariableName(n, index) {
    if (n === 1) return 'x';
    if (n === 2) return (index === 0 ? 'x' : 'y');
    if (n === 3) return ['x', 'y', 'z'][index];
    if (n === 4) return ['x', 'y', 'z', 'w'][index]; // w کنار z
    return `x${index+1}`;
  }

  // دریافت placeholder ضریب بر اساس n، شماره سطر و شماره ستون
  // حروف ضرایب مطابق فرمت ارائه‌شده، اما بر اساس ترتیب جدید مجهول‌ها
  function getCoeffPlaceholder(n, row, col) {
    if (n === 1) return 'a';
    if (n === 2) {
      const coeffs = [
        ['a', 'b'],
        ['d', 'e']
      ];
      return coeffs[row][col];
    }
    if (n === 3) {
      const coeffs = [
        ['a', 'b', 'c'],
        ['e', 'f', 'g'],
        ['i', 'j', 'k']
      ];
      return coeffs[row][col];
    }
    if (n === 4) {
      // ضرایب مطابق با ترتیب x,y,z,w
      const coeffs = [
        ['a', 'b', 'c', 'd'], // معادله اول: a x + b y + c z + d w = e
        ['f', 'g', 'h', 'i'], // معادله دوم: f x + g y + h z + i w = j
        ['k', 'l', 'm', 'n'], // معادله سوم: k x + l y + m z + n w = o
        ['p', 'q', 'r', 's']  // معادله چهارم: p x + q y + r z + s w = t
      ];
      return coeffs[row][col];
    }
    return `a${row+1}${col+1}`;
  }

  // دریافت placeholder سمت راست معادله
  function getRHSPlaceholder(n, row) {
    if (n === 1) return 'c';
    if (n === 2) return (row === 0 ? 'c' : 'f');
    if (n === 3) return (row === 0 ? 'd' : row === 1 ? 'h' : 'l');
    if (n === 4) return (row === 0 ? 'e' : row === 1 ? 'j' : row === 2 ? 'o' : 't');
    return `c${row+1}`;
  }

  function areAllInputsFilled() {
    if (n === 1) {
      const inputs = document.querySelectorAll(".coef, .const, .res-const");
      return Array.from(inputs).every(input => input.value.trim() !== "");
    } else {
      const inputs = document.querySelectorAll(".coef, .res-const");
      return Array.from(inputs).every(input => input.value.trim() !== "");
    }
  }

  function createInputs(size) {
    solverDiv.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const equationContainer = document.createElement("div");
      equationContainer.className = "equation-container";
      equationContainer.style.cssText = `
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 8px; 
        margin: 0 auto 15px auto; 
        padding: 12px 20px; 
        border: 1px solid #e0e0e0; 
        border-radius: 10px; 
        background-color: #f9f9f9;
        width: fit-content;
        min-width: 300px;
        direction: ltr;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      `;
      
      // حلقه ضرایب و مجهولات
      for (let j = 0; j < size; j++) {
        const coefGroup = document.createElement("div");
        coefGroup.style.cssText = "display: flex; align-items: center; gap: 4px;";
        
        const coef = document.createElement("input");
        coef.type = "number";
        coef.className = "coef";
        coef.dataset.row = i;
        coef.dataset.col = j;
        coef.placeholder = getCoeffPlaceholder(size, i, j);
        coef.style.cssText = "width:55px; padding:5px; border:1px solid #ccc; border-radius:4px; text-align: center;";
        coefGroup.appendChild(coef);
        
        const label = document.createElement("span");
        label.textContent = getVariableName(size, j);
        label.style.cssText = "font-size:14px; font-weight:bold; color:#333;";
        coefGroup.appendChild(label);
        
        equationContainer.appendChild(coefGroup);
        
        if (j < size - 1) {
          const plus = document.createElement("span");
          plus.textContent = "+";
          plus.style.cssText = "font-weight: bold; color: #666;";
          equationContainer.appendChild(plus);
        }
      }
      
      // فقط برای n==1 جمله ثابت (b) را اضافه کن
      if (size === 1) {
        const plusForConst = document.createElement("span");
        plusForConst.textContent = "+";
        plusForConst.style.cssText = "font-weight: bold; color: #666;";
        equationContainer.appendChild(plusForConst);
        
        const constant = document.createElement("input");
        constant.type = "number";
        constant.className = "const";
        constant.dataset.row = i;
        constant.placeholder = "b";
        constant.style.cssText = "width:55px; padding:5px; border:1px solid #ccc; border-radius:4px; text-align: center;";
        equationContainer.appendChild(constant);
      }
      
      // علامت مساوی
      const eqSpan = document.createElement("span");
      eqSpan.textContent = "=";
      eqSpan.style.cssText = "margin:0 5px; font-weight: bold; font-size:18px; color: #333;";
      equationContainer.appendChild(eqSpan);
      
      // سمت راست معادله
      const resultConstant = document.createElement("input");
      resultConstant.type = "number";
      resultConstant.className = "res-const";
      resultConstant.dataset.row = i;
      resultConstant.placeholder = getRHSPlaceholder(size, i);
      resultConstant.style.cssText = "width:55px; padding:5px; border:1px solid #ccc; border-radius:4px; text-align: center;";
      equationContainer.appendChild(resultConstant);
      
      solverDiv.appendChild(equationContainer);
    }
  }
  
  createInputs(n);
  
  select.addEventListener("change", function() {
    n = parseInt(this.value) || 1;
    createInputs(n);
  });

  function solveSystem(A, b) {
    const n = A.length;
    const M = A.map(row => row.slice());
    const rhs = [...b];
    const EPS = 1e-12;
    let rank = 0;
    
    for (let col = 0; col < n; col++) {
      let pivotRow = -1;
      let maxAbs = 0;
      for (let r = rank; r < n; r++) {
        const val = Math.abs(M[r][col]);
        if (val > maxAbs) { maxAbs = val; pivotRow = r; }
      }
      if (pivotRow === -1 || maxAbs < EPS) continue;
      
      if (pivotRow !== rank) {
        [M[rank], M[pivotRow]] = [M[pivotRow], M[rank]];
        [rhs[rank], rhs[pivotRow]] = [rhs[pivotRow], rhs[rank]];
      }
      
      const piv = M[rank][col];
      for (let c = col; c < n; c++) M[rank][c] /= piv;
      rhs[rank] /= piv;
      
      for (let r = 0; r < n; r++) {
        if (r === rank) continue;
        const factor = M[r][col];
        if (Math.abs(factor) < EPS) continue;
        for (let c = col; c < n; c++) M[r][c] -= factor * M[rank][c];
        rhs[r] -= factor * rhs[rank];
      }
      rank++;
    }
    
    for (let r = 0; r < n; r++) {
      const allZero = M[r].every(v => Math.abs(v) < EPS);
      if (allZero && Math.abs(rhs[r]) > EPS) return { type: "inconsistent" };
    }
    
    if (rank === n) return { type: "unique", solution: rhs };
    return { type: "infinite" };
  }
  
  solveBtn.addEventListener("click", function(e) {
    e.preventDefault();
    const oldResult = document.querySelector(".result-box");
    if (oldResult) oldResult.remove();

    if (!areAllInputsFilled()) {
      const errorBox = document.createElement("div");
      errorBox.className = "result-box";
      errorBox.style.color = "red";
      errorBox.textContent = "⚠️ لطفا تمام کادرها را پر کنید.";
      solverDiv.appendChild(errorBox);
      return;
    }

    const A = Array.from({ length: n }, () => Array(n).fill(0));
    const rhs = Array(n).fill(0);
    
    document.querySelectorAll(".coef").forEach(input => {
      A[parseInt(input.dataset.row)][parseInt(input.dataset.col)] = parseFloat(input.value) || 0;
    });

    document.querySelectorAll(".res-const").forEach(input => {
      rhs[parseInt(input.dataset.row)] = parseFloat(input.value) || 0;
    });

    // اگر n==1 باشد: ax + b = c  =>  ax = c - b
    if (n === 1) {
      const constantInputs = document.querySelectorAll(".const");
      if (constantInputs.length) {
        const b = parseFloat(constantInputs[0].value) || 0;
        rhs[0] = rhs[0] - b;
      }
    }
    
    const result = solveSystem(A, rhs);
    const resultBox = document.createElement("div");
    resultBox.className = "result-box";
    resultBox.style.cssText = "margin-top:20px; padding:15px; border-radius:8px; background:#f0f7ff; font-weight:bold; text-align:center;";

    let displayText = "";
    if (result.type === "unique") {
      const vars = result.solution.map((val, idx) => `${getVariableName(n, idx)} = ${val.toFixed(4)}`);
      displayText = "✅ جواب یکتا: " + vars.join(" | ");
    } else if (result.type === "infinite") {
      displayText = "♾ دستگاه بی‌نهایت جواب دارد";
    } else {
      displayText = "❌ دستگاه ناسازگار است";
    }
    
    resultBox.innerHTML = displayText;
    solverDiv.appendChild(resultBox);
    
    const entry = {
      title: `${n} معادله و ${n} مجهول`,
      text: displayText.replace(/<sub>|<\/sub>/g, ''),
      like: liked,
      date: new Date().toISOString(),
      s: false
    };
    history.push(entry);
    localStorage.setItem(localStorageKey, JSON.stringify(history));
  });
});
