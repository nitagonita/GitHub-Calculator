// ===================================================================
// DO NOT MODIFY BELOW FUNCTIONS - call them as needed
// ===================================================================
function updateDisplay(value) {
  const display = document.getElementById("display");
  display.value = formatForDisplay(String(value));
}

function getDisplay() {
  const display = document.getElementById("display");
  return display.value;
}

updateDisplay(0);
console.log("Initial value of display: ", getDisplay());

// ===================== Helpers =====================

function normalizeNumberString(str) {
  return String(str).replace(/,/g, "");
}

function formatForDisplay(rawStr) {
  if (rawStr === "Error") return "Error";
  let s = rawStr.trim();
  const isNegative = s.startsWith("-");
  if (isNegative) s = s.slice(1);
  if (s === "") s = "0";
  const hasTrailingDot = s.endsWith(".");
  let [intPart, fracPart] = s.split(".");
  intPart = intPart.replace(/,/g, "");
  if (!/^\d+$/.test(intPart)) intPart = "0";
  const formattedInt = Number(intPart).toLocaleString("en-US");
  let out;
  if (hasTrailingDot) out = formattedInt + ".";
  else if (typeof fracPart === "string") {
    fracPart = fracPart.replace(/,/g, "");
    out = formattedInt + "." + fracPart;
  } else out = formattedInt;
  return isNegative ? "-" + out : out;
}

function toNumberFromDisplay(str) {
  const normalized = normalizeNumberString(str);
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function flashError() {
  const display = document.getElementById("display");
  display.classList.add("error");
  setTimeout(() => display.classList.remove("error"), 500);
}

// ===================== State Variables =====================
let firstOperand = null;
let operator = null;
let shouldResetDisplay = false;

// ===================== Arithmetic =====================
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) return "Error";
  return a / b;
}

// ===================== Main Handler =====================
function handleInput(input) {
  if (input === ",") input = ".";
  
  // loop example: cek apakah input adalah number atau operator
  const operators = ["+", "-", "*", "/"];
  const numbers = ["0","1","2","3","4","5","6","7","8","9"];
  let handled = false;

  for (let i = 0; i < numbers.length; i++) {
    if (input === numbers[i]) {
      handleNumber(input);
      handled = true;
      break;
    }
  }

  if (!handled) {
    for (let j = 0; j < operators.length; j++) {
      if (input === operators[j]) {
        handleOperator(input);
        handled = true;
        break;
      }
    }
  }

  if (!handled) {
    if (input === ".") handleDecimal();
    else if (input === "=") executeOperation();
    else if (input === "C") resetCalculator();
    else if (input === "CE") {
      updateDisplay(0);
      shouldResetDisplay = false;
    } else console.warn(`Unknown input: ${input}`);
  }
}

// ===================== Number & Decimal =====================
function handleNumber(digit) {
  const current = normalizeNumberString(getDisplay());
  if (shouldResetDisplay) {
    updateDisplay(digit);
    shouldResetDisplay = false;
  } else if (current === "0") {
    updateDisplay(digit);
  } else {
    updateDisplay(current + digit);
  }
}

function handleDecimal() {
  const current = normalizeNumberString(getDisplay());
  if (shouldResetDisplay) {
    updateDisplay("0.");
    shouldResetDisplay = false;
  } else if (!current.includes(".")) {
    updateDisplay(current + ".");
  }
}

// ===================== Operator & Execute =====================
function handleOperator(op) {
  const currentValue = toNumberFromDisplay(getDisplay());
  if (firstOperand === null) firstOperand = currentValue;
  else if (operator && !shouldResetDisplay) {
    const result = executeOperation();
    if (result === "Error") return;
    firstOperand = toNumberFromDisplay(getDisplay());
  }
  operator = op;
  shouldResetDisplay = true;
}

function executeOperation() {
  if (firstOperand === null || operator === null) return;
  const secondOperand = toNumberFromDisplay(getDisplay());
  let result;
  if (operator === "+") result = add(firstOperand, secondOperand);
  else if (operator === "-") result = subtract(firstOperand, secondOperand);
  else if (operator === "*") result = multiply(firstOperand, secondOperand);
  else if (operator === "/") result = divide(firstOperand, secondOperand);
  else result = "Error";

  if (result === "Error") {
    flashError();
    resetCalculator();
    updateDisplay(0);
    return "Error";
  }

  updateDisplay(result);
  firstOperand = null;
  operator = null;
  shouldResetDisplay = true;
  return result;
}

// ===================== Reset =====================
function resetCalculator() {
  firstOperand = null;
  operator = null;
  shouldResetDisplay = false;
  updateDisplay(0);
}
