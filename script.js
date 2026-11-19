const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

let current = "0";      // number being typed
let previous = null;    // first operand
let operator = null;    // + − × ÷
let justEvaluated = false;

function format(value) {
  if (value === "Error") return value;
  const [int, dec] = String(value).split(".");
  const withCommas = Number(int).toLocaleString("en-US");
  const sign = int === "-0" ? "-0" : withCommas;
  return dec !== undefined ? `${sign}.${dec}` : sign;
}

function updateDisplay() {
  currentEl.textContent = format(current);
  historyEl.textContent =
    previous !== null && operator ? `${format(previous)} ${operator}` : "";
  document.querySelectorAll(".key.op").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.op === operator && justEvaluated === false && current === "");
  });
}

function compute(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  let result;
  if (op === "+") result = a + b;
  if (op === "−") result = a - b;
  if (op === "×") result = a * b;
  if (op === "÷") {
    if (b === 0) return "Error";
    result = a / b;
  }
  // avoid floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(result.toPrecision(12)));
}

function inputNumber(n) {
  if (current === "Error" || justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (current.replace(/[-.]/g, "").length >= 15) return;
  current = current === "0" ? n : current + n;
  updateDisplay();
}

function inputDecimal() {
  if (current === "Error" || justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (!current.includes(".")) current += ".";
  updateDisplay();
}

function chooseOperator(op) {
  if (current === "Error") return;
  if (operator && previous !== null && !justEvaluated && current !== "") {
    // chain: 2 + 3 + ... → evaluate first
    previous = compute(previous, current, operator);
    if (previous === "Error") { current = "Error"; previous = null; operator = null; updateDisplay(); return; }
  } else if (previous === null || justEvaluated) {
    previous = current;
  }
  operator = op;
  current = "";
  justEvaluated = false;
  updateDisplay();
  currentEl.textContent = format(previous);
}

function equals() {
  if (operator === null || previous === null || current === "") return;
  const expr = `${format(previous)} ${operator} ${format(current)} =`;
  const result = compute(previous, current, operator);
  current = result;
  previous = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
  historyEl.textContent = expr;
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

function backspace() {
  if (justEvaluated || current === "Error") { clearAll(); return; }
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  updateDisplay();
}

function percent() {
  if (current === "" || current === "Error") return;
  current = String(parseFloat((parseFloat(current) / 100).toPrecision(12)));
  updateDisplay();
}

// Button clicks
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === "decimal") inputDecimal();
  else if (btn.dataset.action === "equals") equals();
  else if (btn.dataset.action === "clear") clearAll();
  else if (btn.dataset.action === "backspace") backspace();
  else if (btn.dataset.action === "percent") percent();
});

// Keyboard support (bonus)
const keyOps = { "+": "+", "-": "−", "*": "×", "/": "÷" };
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (e.key === ".") inputDecimal();
  else if (keyOps[e.key]) { e.preventDefault(); chooseOperator(keyOps[e.key]); }
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
  else if (e.key === "%") percent();
});

updateDisplay();
