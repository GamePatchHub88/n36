// ============ العناصر ============
const textInputs = document.querySelectorAll(".plob input"); // المبلغ، المدة، الفائدة
const [amountInput, termInput, rateInput] = textInputs;
const radios = document.querySelectorAll('input[name="mortgage-type"]');
const typeGroup = document.querySelector(".mortgage-type");
const submitBtn = document.querySelector('.button input[type="submit"]');
const clearBtn = document.querySelector(".header h3");
const con2 = document.querySelector(".con2");

// حفظ الحالة الفاضية الأصلية لاسترجاعها عند Clear All
const emptyHTML = con2.innerHTML;

// ============ أدوات مساعدة ============
function getGroup(input) {
  return input.closest(".plob").parentElement;
}

const fmt = (num) =>
  num.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

// ============ تنسيق المبلغ أثناء الكتابة (300,000) ============
amountInput.addEventListener("input", () => {
  const digits = amountInput.value.replace(/[^0-9]/g, "");
  amountInput.value = digits ? Number(digits).toLocaleString("en-US") : "";
});

// ============ الفائدة: أرقام ونقطة واحدة فقط ============
rateInput.removeAttribute("oninput");
rateInput.addEventListener("input", () => {
  let v = rateInput.value.replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  rateInput.value = v;
});

// ============ التحقق ============
function validate() {
  let isValid = true;

  textInputs.forEach((input) => {
    const empty = input.value.trim() === "";
    getGroup(input).classList.toggle("error", empty);
    if (empty) isValid = false;
  });

  const typeSelected = [...radios].some((r) => r.checked);
  typeGroup.classList.toggle("error", !typeSelected);
  if (!typeSelected) isValid = false;

  return isValid;
}

// ============ الحساب ============
function calculate(P, years, rate, type) {
  const n = years * 12; // عدد الأقساط
  const i = rate / 100 / 12; // الفائدة الشهرية

  let monthly;
  if (type === "interest-only") {
    monthly = P * i;
  } else if (i === 0) {
    monthly = P / n;
  } else {
    const f = Math.pow(1 + i, n);
    monthly = (P * i * f) / (f - 1);
  }

  const total = monthly * n;
  return { monthly, total };
}

// ============ عرض النتيجة ============
function showResults({ monthly, total }) {
  con2.classList.add("has-results");
  con2.innerHTML = `
    <div class="results">
      <h1>Your results</h1>
      <p>Your results are shown below based on the information you provided.
         To adjust the results, edit the form and click “calculate repayments” again.</p>
      <div class="results__box">
        <span>Your monthly repayments</span>
        <strong class="results__monthly">${fmt(monthly)}</strong>
        <hr />
        <span>Total you'll repay over the term</span>
        <strong class="results__total">${fmt(total)}</strong>
      </div>
    </div>
  `;
}

// ============ زر الحساب ============
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const P = parseFloat(amountInput.value.replace(/,/g, ""));
  const years = parseFloat(termInput.value);
  const rate = parseFloat(rateInput.value);
  const type = document.querySelector('input[name="mortgage-type"]:checked').id;

  if (!(P > 0) || !(years > 0) || isNaN(rate)) return;

  showResults(calculate(P, years, rate, type));
});

// ============ إزالة الخطأ أثناء الكتابة/الاختيار ============
textInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value.trim() !== "") getGroup(input).classList.remove("error");
  });
});

radios.forEach((radio) => {
  radio.addEventListener("change", () => typeGroup.classList.remove("error"));
});

// ============ Clear All ============
clearBtn.addEventListener("click", () => {
  textInputs.forEach((input) => {
    input.value = "";
    getGroup(input).classList.remove("error");
  });
  radios.forEach((r) => (r.checked = false));
  typeGroup.classList.remove("error");

  con2.innerHTML = emptyHTML;
  con2.classList.remove("has-results");
});