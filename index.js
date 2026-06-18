document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("change");
  const container = document.getElementById("solverContainer");
  const solveBtn = document.getElementById("solveBtn");
  const resultBox = document.getElementById("resultBox");
  const stepsBox = document.getElementById("stepsBox");

  let n = parseInt(select.value) || 2;
  const STORAGE_KEY = "object";

  // ---- نام مجهولات ----
  function getVarName(n, idx) {
    if (n === 1) return 'x';
    if (n === 2) return (idx === 0 ? 'x' : 'y');
    if (n === 3) return ['x', 'y', 'z'][idx];
    if (n === 4) return ['x', 'y', 'z', 'w'][idx];
    return `x${idx+1}`;
  }

  // ---- placeholder ضرایب (سمت چپ) ----
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
      const coeffs = [
        ['a', 'b', 'c', 'd'],
        ['f', 'g', 'h', 'i'],
        ['k', 'l', 'm', 'n'],
        ['p', 'q', 'r', 's']
      ];
      return coeffs[row][col];
    }
    return `a${row+1}${col+1}`;
  }

  // ---- placeholder جمله ثابت (فقط برای n=1) ----
  function getConstPlaceholder(n) {
    if (n === 1) return 'b';
    return '';
  }

  // ---- placeholder سمت راست معادله ----
  function getRHSPlaceholder(n, row) {
    if (n === 1) return 'c';
    if (n === 2) return (row === 0 ? 'c' : 'f');
    if (n === 3) return (row === 0 ? 'd' : row === 1 ? 'h' : 'l');
    if (n === 4) return (row === 0 ? 'e' : row === 1 ? 'j' : row === 2 ? 'o' : 't');
    return `b${row+1}`;
  }

  // ---- ساخت ورودی‌ها ----
  function buildInputs(size) {
    container.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const row = document.createElement("div");
      row.className = "equation-row";
      row.dir = "ltr";

      // ---- برای n=1: ax + b = c ----
      if (size === 1) {
        // ورودی ضریب a
        const inputA = document.createElement("input");
        inputA.type = "number";
        inputA.className = "coef";
        inputA.dataset.row = 0;
        inputA.dataset.col = 0;
        inputA.placeholder = "a";
        inputA.step = "any";
        row.appendChild(inputA);

        const labelX = document.createElement("span");
        labelX.className = "var-label";
        labelX.textContent = "x";
        row.appendChild(labelX);

        const plus = document.createElement("span");
        plus.className = "op";
        plus.textContent = "+";
        row.appendChild(plus);

        // ورودی جمله ثابت b
        const inputB = document.createElement("input");
        inputB.type = "number";
        inputB.className = "const";
        inputB.dataset.row = 0;
        inputB.placeholder = "b";
        inputB.step = "any";
        row.appendChild(inputB);

        const eq = document.createElement("span");
        eq.className = "eq-sign";
        eq.textContent = "=";
        row.appendChild(eq);

        // ورودی سمت راست c
        const inputC = document.createElement("input");
        inputC.type = "number";
        inputC.className = "rhs";
        inputC.dataset.row = 0;
        inputC.placeholder = "c";
        inputC.step = "any";
        row.appendChild(inputC);

        container.appendChild(row);
        continue;
      }

      // ---- برای n >= 2 به صورت استاندارد ----
      for (let j = 0; j < size; j++) {
        const input = document.createElement("input");
        input.type = "number";
        input.className = "coef";
        input.dataset.row = i;
        input.dataset.col = j;
        input.placeholder = getCoeffPlaceholder(size, i, j);
        input.step = "any";
        row.appendChild(input);

        const label = document.createElement("span");
        label.className = "var-label";
        label.textContent = getVarName(size, j);
        row.appendChild(label);

        if (j < size - 1) {
          const op = document.createElement("span");
          op.className = "op";
          op.textContent = "+";
          row.appendChild(op);
        }
      }

      const eq = document.createElement("span");
      eq.className = "eq-sign";
      eq.textContent = "=";
      row.appendChild(eq);

      const rhsInput = document.createElement("input");
      rhsInput.type = "number";
      rhsInput.className = "rhs";
      rhsInput.dataset.row = i;
      rhsInput.placeholder = getRHSPlaceholder(size, i);
      rhsInput.step = "any";
      row.appendChild(rhsInput);

      container.appendChild(row);
    }
  }

  buildInputs(n);

  select.addEventListener("change", function () {
    n = parseInt(this.value);
    buildInputs(n);
    resultBox.style.display = "none";
    stepsBox.style.display = "none";
  });

  // ---- جمع‌آوری ماتریس ----
  function getMatrix() {
    const A = Array.from({ length: n }, () => Array(n).fill(0));
    const b = Array(n).fill(0);

    document.querySelectorAll(".coef").forEach(inp => {
      const r = parseInt(inp.dataset.row);
      const c = parseInt(inp.dataset.col);
      A[r][c] = parseFloat(inp.value) || 0;
    });

    document.querySelectorAll(".rhs").forEach(inp => {
      const r = parseInt(inp.dataset.row);
      b[r] = parseFloat(inp.value) || 0;
    });

    // ---- برای n=1: ax + b = c  =>  ax = c - b ----
    if (n === 1) {
      const constInputs = document.querySelectorAll(".const");
      if (constInputs.length > 0) {
        const bVal = parseFloat(constInputs[0].value) || 0;
        b[0] = b[0] - bVal;
      }
    }

    return { A, b };
  }

  // ---- حل با گاوس-جردن و ذخیره مراحل ----
  function solveWithSteps(A, b) {
    const M = A.map(row => row.slice());
    const rhs = [...b];
    const size = M.length;
    const steps = [];
    const EPS = 1e-10;

    function matrixToString(mat, vec) {
      let s = "";
      for (let i = 0; i < mat.length; i++) {
        s += "[ " + mat[i].map(v => v.toFixed(3)).join("  ") + " | " + vec[i].toFixed(3) + " ]\n";
      }
      return s;
    }

    steps.push("📌 ماتریس اولیه:\n" + matrixToString(M, rhs));

    let rank = 0;
    for (let col = 0; col < size; col++) {
      let pivot = -1;
      let maxVal = 0;
      for (let r = rank; r < size; r++) {
        if (Math.abs(M[r][col]) > maxVal) {
          maxVal = Math.abs(M[r][col]);
          pivot = r;
        }
      }
      if (pivot === -1 || maxVal < EPS) continue;

      if (pivot !== rank) {
        [M[rank], M[pivot]] = [M[pivot], M[rank]];
        [rhs[rank], rhs[pivot]] = [rhs[pivot], rhs[rank]];
        steps.push(`↕️ جابجایی سطر ${rank+1} و ${pivot+1}:\n` + matrixToString(M, rhs));
      }

      const pivVal = M[rank][col];
      for (let c = col; c < size; c++) M[rank][c] /= pivVal;
      rhs[rank] /= pivVal;
      steps.push(`➗ نرمال‌سازی سطر ${rank+1} (تقسیم بر ${pivVal.toFixed(3)}):\n` + matrixToString(M, rhs));

      for (let r = 0; r < size; r++) {
        if (r === rank) continue;
        const factor = M[r][col];
        if (Math.abs(factor) < EPS) continue;
        for (let c = col; c < size; c++) {
          M[r][c] -= factor * M[rank][c];
        }
        rhs[r] -= factor * rhs[rank];
        steps.push(`✖️ حذف از سطر ${r+1} (ضریب ${factor.toFixed(3)}):\n` + matrixToString(M, rhs));
      }

      rank++;
    }

    for (let r = 0; r < size; r++) {
      const allZero = M[r].every(v => Math.abs(v) < EPS);
      if (allZero && Math.abs(rhs[r]) > EPS) {
        return { type: "inconsistent", steps };
      }
    }

    if (rank === size) {
      return { type: "unique", solution: rhs, steps };
    } else {
      return { type: "infinite", steps };
    }
  }

  // ---- دکمه حل ----
  solveBtn.addEventListener("click", function () {
    const { A, b } = getMatrix();

    // چک کردن پر بودن همه فیلدها
    let allFilled = true;
    document.querySelectorAll(".coef, .rhs, .const").forEach(inp => {
      if (inp.value.trim() === "") allFilled = false;
    });
    if (!allFilled) {
      resultBox.style.display = "block";
      resultBox.style.background = "#ffeaa7";
      resultBox.style.borderColor = "#fdcb6e";
      resultBox.innerHTML = "⚠️ لطفاً همه کادرها را پر کنید.";
      stepsBox.style.display = "none";
      return;
    }

    const result = solveWithSteps(A, b);

    resultBox.style.display = "block";
    resultBox.style.background = "#e8f4fd";
    resultBox.style.borderColor = "#0984e3";

    let displayText = "";
    if (result.type === "unique") {
      const vars = result.solution.map((val, idx) =>
        `${getVarName(n, idx)} = ${val.toFixed(4)}`
      );
      displayText = "✅ جواب یکتا: " + vars.join(" | ");
      resultBox.innerHTML = displayText;
    } else if (result.type === "infinite") {
      displayText = "♾️ دستگاه بی‌نهایت جواب دارد";
      resultBox.innerHTML = displayText;
    } else {
      displayText = "❌ دستگاه ناسازگار (بدون جواب)";
      resultBox.innerHTML = displayText;
    }

    // نمایش مراحل حل
    if (result.steps && result.steps.length > 0) {
      stepsBox.style.display = "block";
      stepsBox.innerHTML = "🧾 <strong>مراحل حل (گاوس-جردن):</strong><br><br>" +
        result.steps.map((s, i) => `<div style="margin-bottom:12px;background:#fff;padding:10px;border-radius:10px;border-right:4px solid #0984e3;">${s.replace(/\n/g, '<br>')}</div>`).join("");
    } else {
      stepsBox.style.display = "none";
    }

    // ذخیره در localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    let history = stored ? JSON.parse(stored) : [];
    const entry = {
      title: `${n} معادله و ${n} مجهول`,
      text: displayText.replace(/<[^>]*>/g, ''),
      like: false,
      date: new Date().toISOString()
    };
    history.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  });
});
