// ===================================================================
// DO NOT MODIFY THE CODE BELOW - Call or reference them in your code as needed
// ===================================================================

// Takes in a number OR string and updates the readonly display input
function updateDisplay(value) {
  const display = document.getElementById("display");
  display.value = formatForDisplay(String(value));
}

// Gets the value from the readonly display input (string on screen)
function getDisplay() {
  const display = document.getElementById("display");
  return display.value;
}

//Set up display to show zero when starting
updateDisplay(0);

console.log("Initial value of display: ", getDisplay());

// ===================================================================
// DO NOT MODIFY THE CODE Above - Call or reference them in your code as needed
// ===================================================================

// ===================== Helpers for formatting & parsing =====================

// Remove thousands separators and normalize decimal to "." before parse
function normalizeNumberString(str) {
  // hapus semua koma ribuan
  const s = String(str).replace(/,/g, "");
  return s;
}

// Format with thousands separators but preserve typing states like trailing "."
function formatForDisplay(rawStr) {
  // Jangan format "Error"
  if (rawStr === "Error") return "Error";

  // Hapus semua spasi
  let s = rawStr.trim();

  // Map koma desimal locale ke titik (kalau ada yang mengetik pakai koma)
  // tapi JANGAN sentuh koma yang berfungsi sebagai ribuan (kita tidak pakai titik sebagai ribuan di sini)
  // Catatan: input angka dari tombol selalu angka/titik, jadi ini berjaga-jaga saja.
  if (s.includes(",") && !s.includes(".")) {
    // contoh "12,5" -> "12.5"
    const onlyDigitsAndComma = /^[\-\d,]+$/.test(s) === false; // kalau ada huruf dsb, abaikan
    if (!onlyDigitsAndComma) s = s.replace(",", ".");
  }

  // Pisahkan sign
  const isNegative = s.startsWith("-");
  if (isNegative) s = s.slice(1);

  // Khusus jika kosong
  if (s === "") s = "0";

  // Split desimal (pakai ".")
  const hasTrailingDot = s.endsWith(".");
  let [intPart, fracPart] = s.split(".");

  // Buang ribuan lama sebelum diformat ulang
  intPart = intPart.replace(/,/g, "");

  // Jika intPart bukan angka valid (mis. hanya "-"), fallback ke "0"
  if (!/^\d+$/.test(intPart)) intPart = "0";

  // Format ribuan pada intPart
  const formattedInt = Number(intPart).toLocaleString("en-US");

  let out;
  if (hasTrailingDot) {
    // Saat user baru mengetik titik di akhir (mis. "12.")
    out = formattedInt + ".";
  } else if (typeof fracPart === "string") {
    // Ada pecahan, jangan format pecahannya; tampilkan apa adanya
    // (tetap buang koma pada fracPart jika ada)
    fracPart = fracPart.replace(/,/g, "");
    out = formattedInt + "." + fracPart;
  } else {
    // Tanpa desimal
    out = formattedInt;
  }

  return isNegative ? "-" + out : out;
}

// Convert current display string (with commas) into Number
function toNumberFromDisplay(str) {
  const normalized = normalizeNumberString(str);
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

// ===================================================================

// State variables to track calculator state
let firstOperand = null;
let operator = null;
let shouldResetDisplay = false;

/**
 * Helper: flash error state on display without changing HTML
 */
function flashError() {
  const display = document.getElementById("display");
  display.classList.add("error");
  setTimeout(() => display.classList.remove("error"), 500);
}

/**
 * Main input handler called from HTML buttons
 * @param {string} input - The input value from button clicks
 */
function handleInput(input) {
  console.log(`Button clicked: ${input}`);

  // Terima koma sebagai desimal (locale)
  if (input === ",") input = ".";

  if (!isNaN(parseFloat(input)) && isFinite(input)) {
    handleNumber(input);
  } else if (input === "+" || input === "-" || input === "*" || input === "/") {
    handleOperator(input);
  } else if (input === ".") {
    handleDecimal();
  } else if (input === "=") {
    executeOperation();
  } else if (input === "C") {
    resetCalculator();
  } else if (input === "CE") {
    updateDisplay(0);
    shouldResetDisplay = false;
    console.log("Display cleared (CE)");
  } else {
    console.warn(`Unknown input received: ${input}`);
  }

  console.log(`Current display value: ${getDisplay()}`);
}

// ===================== Arithmetic =====================
function add(first, second) {
  const result = first + second;
  console.log(`Addition: ${first} + ${second} = ${result}`);
  return result;
}

function subtract(first, second) {
  const result = first - second;
  console.log(`Subtraction: ${first} - ${second} = ${result}`);
  return result;
}

function multiply(first, second) {
  const result = first * second;
  console.log(`Multiplication: ${first} * ${second} = ${result}`);
  return result;
}

function divide(first, second) {
  if (second === 0) {
    console.error("Division by zero attempted!");
    return "Error";
  }
  const result = first / second;
  console.log(`Division: ${first} / ${second} = ${result}`);
  return result;
}

// ===================== Handlers =====================

function handleNumber(digit) {
  const currentDisplay = getDisplay();
  const raw = normalizeNumberString(currentDisplay); // buang koma ribuan
  const hasDot = raw.includes(".");

  if (shouldResetDisplay) {
    updateDisplay(digit);
    shouldResetDisplay = false;
    console.log(`Starting new number: ${digit}`);
    return;
  }

  // Jika layar "0" (tanpa desimal), ganti dengan digit; jika "0." → tambahkan
  if (raw === "0" && !hasDot) {
    updateDisplay(digit);
  } else {
    updateDisplay(raw + digit); // raw dulu, nanti updateDisplay akan format ribuan
  }
  console.log(`Appending digit: ${digit}, new value: ${getDisplay()}`);
}

function handleDecimal() {
  const currentDisplay = getDisplay();
  const raw = normalizeNumberString(currentDisplay);

  if (shouldResetDisplay) {
    updateDisplay("0.");
    shouldResetDisplay = false;
    console.log('Started new decimal number: "0."');
    return;
  }

  if (raw.includes(".")) {
    console.warn("Decimal already present, ignored");
    return;
  }

  if (raw === "" || raw === "0") {
    updateDisplay("0.");
  } else {
    updateDisplay(raw + ".");
  }
  console.log(`Decimal added, new value: ${getDisplay()}`);
}

function handleOperator(nextOperator) {
  const currentValue = toNumberFromDisplay(getDisplay());

  if (firstOperand === null) {
    firstOperand = currentValue;
    console.log(`Stored first operand: ${firstOperand}`);
  } else if (operator && !shouldResetDisplay) {
    const result = executeOperation();
    if (result === "Error") return;
    firstOperand = toNumberFromDisplay(getDisplay());
  }

  operator = nextOperator;
  shouldResetDisplay = true;
  console.log(`Operator set: ${operator}, ready for second operand`);
}

function executeOperation() {
  if (firstOperand === null || operator === null) {
    console.warn("Cannot execute operation: missing operand or operator");
    return;
  }

  const secondOperand = toNumberFromDisplay(getDisplay());
  let result;

  if (operator === "+") result = add(firstOperand, secondOperand);
  else if (operator === "-") result = subtract(firstOperand, secondOperand);
  else if (operator === "*") result = multiply(firstOperand, secondOperand);
  else if (operator === "/") result = divide(firstOperand, secondOperand);
  else {
    console.error(`Unknown operator: ${operator}`);
    return "Error";
  }

  if (result === "Error") {
    flashError();
    resetCalculator();
    updateDisplay(0);
    return "Error";
  }

  updateDisplay(result); // akan terformat ribuan
  firstOperand = null;
  operator = null;
  shouldResetDisplay = true;

  console.log(`Operation completed. Result: ${result}`);
  return result;
}

function resetCalculator() {
  firstOperand = null;
  operator = null;
  shouldResetDisplay = false;
  updateDisplay(0);
  console.log("Calculator reset to initial state");
}
