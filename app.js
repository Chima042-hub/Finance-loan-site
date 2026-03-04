const ratesByType = {
  personal: 14.5,
  business: 12.0,
  home: 8.5,
  salary: 10.0
};

const formatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0
});

function formatRand(value) {
  return formatter.format(Number(value) || 0);
}

function calculateEmi(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
}

const calcForm = document.getElementById("calculator-form");
const calcType = document.getElementById("calc-loan-type");
const calcAmount = document.getElementById("calc-amount");
const calcRate = document.getElementById("calc-rate");
const calcTenure = document.getElementById("calc-tenure");

const monthlyEmiEl = document.getElementById("monthly-emi");
const totalPayEl = document.getElementById("total-pay");
const totalInterestEl = document.getElementById("total-interest");

const payoffForm = document.getElementById("payoff-form");
const payoffPrincipal = document.getElementById("payoff-principal");
const payoffRate = document.getElementById("payoff-rate");
const payoffTenure = document.getElementById("payoff-tenure");
const payoffExtra = document.getElementById("payoff-extra");
const payoffNewTenureEl = document.getElementById("payoff-new-tenure");
const payoffMonthsSavedEl = document.getElementById("payoff-months-saved");
const payoffInterestSavedEl = document.getElementById("payoff-interest-saved");
const payoffNoteEl = document.getElementById("payoff-note");

function renderCalculatorResult() {
  const principal = Number(calcAmount.value);
  const rate = Number(calcRate.value);
  const tenure = Number(calcTenure.value);

  if (!principal || !rate || !tenure || tenure <= 0) {
    return;
  }

  const emi = calculateEmi(principal, rate, tenure);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - principal;

  monthlyEmiEl.textContent = formatRand(emi);
  totalPayEl.textContent = formatRand(totalPayment);
  totalInterestEl.textContent = formatRand(totalInterest);
}

calcType.addEventListener("change", () => {
  calcRate.value = ratesByType[calcType.value] || 12;
  renderCalculatorResult();
});

calcForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderCalculatorResult();
  document.getElementById("amount").value = calcAmount.value;
  document.getElementById("loan-type").value = calcType.value;
  document.getElementById("tenure").value = calcTenure.value;
  payoffPrincipal.value = calcAmount.value;
  payoffRate.value = calcRate.value;
  payoffTenure.value = calcTenure.value;
  renderPayoffResult();
});

calcAmount.addEventListener("input", renderCalculatorResult);
calcRate.addEventListener("input", renderCalculatorResult);
calcTenure.addEventListener("input", renderCalculatorResult);

function renderPayoffResult() {
  const principal = Number(payoffPrincipal.value);
  const annualRate = Number(payoffRate.value);
  const tenure = Number(payoffTenure.value);
  const extraPayment = Number(payoffExtra.value);

  if (!principal || !annualRate || !tenure || tenure <= 0 || extraPayment < 0) {
    return;
  }

  const baselineEmi = calculateEmi(principal, annualRate, tenure);
  const monthlyRate = annualRate / 12 / 100;
  const acceleratedPayment = baselineEmi + extraPayment;

  let newTenure = tenure;
  let monthsSaved = 0;
  let interestSaved = 0;
  let note = "Increase extra payment to generate stronger savings.";

  if (extraPayment > 0) {
    const minimumPayment = monthlyRate > 0 ? principal * monthlyRate : 0;

    if (acceleratedPayment > minimumPayment) {
      const rawMonths = monthlyRate === 0
        ? principal / acceleratedPayment
        : Math.log(acceleratedPayment / (acceleratedPayment - principal * monthlyRate)) / Math.log(1 + monthlyRate);

      if (Number.isFinite(rawMonths) && rawMonths > 0) {
        newTenure = Math.max(1, Math.ceil(rawMonths));
        monthsSaved = Math.max(tenure - newTenure, 0);

        const baselineInterest = baselineEmi * tenure - principal;
        const acceleratedInterest = acceleratedPayment * newTenure - principal;
        interestSaved = Math.max(baselineInterest - acceleratedInterest, 0);

        note = monthsSaved > 0
          ? `Great move: this plan could close your loan about ${monthsSaved} month(s) earlier.`
          : "This extra amount has minimal payoff impact. Try increasing it.";
      }
    }
  }

  payoffNewTenureEl.textContent = `${newTenure} months`;
  payoffMonthsSavedEl.textContent = String(monthsSaved);
  payoffInterestSavedEl.textContent = formatRand(interestSaved);
  payoffNoteEl.textContent = note;
}

payoffForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderPayoffResult();
});

payoffPrincipal.addEventListener("input", renderPayoffResult);
payoffRate.addEventListener("input", renderPayoffResult);
payoffTenure.addEventListener("input", renderPayoffResult);
payoffExtra.addEventListener("input", renderPayoffResult);

const eligibilityForm = document.getElementById("eligibility-form");
const eligibilityStatus = document.getElementById("eligibility-status");
const eligibleAmount = document.getElementById("eligible-amount");
const dtiRatioEl = document.getElementById("dti-ratio");
const coachSummaryEl = document.getElementById("coach-summary");
const eligibilityCoachEl = document.getElementById("eligibility-coach");

eligibilityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const income = Number(document.getElementById("income").value);
  const expenses = Number(document.getElementById("expenses").value);
  const existingEmi = Number(document.getElementById("existing-emi").value);
  const creditScore = Number(document.getElementById("credit-score").value);
  const employment = document.getElementById("employment").value;

  const disposable = income - expenses - existingEmi;
  const dti = income > 0 ? (existingEmi / income) * 100 : 100;

  let score = 0;

  if (income >= 40000) score += 35;
  else if (income >= 25000) score += 25;
  else if (income >= 12000) score += 15;

  if (disposable >= 20000) score += 25;
  else if (disposable >= 10000) score += 15;

  if (creditScore >= 700) score += 25;
  else if (creditScore >= 620) score += 18;
  else if (creditScore >= 560) score += 10;

  if (dti <= 25) score += 15;
  else if (dti <= 35) score += 8;

  if (employment === "salaried") score += 5;
  if (employment === "business") score += 3;

  const maxLoan = Math.max(disposable, 0) * 12;

  if (score >= 70) {
    eligibilityStatus.textContent = "Likely Eligible";
    coachSummaryEl.textContent = "Strong profile. Keep documents ready for faster final approval.";
  } else if (score >= 50) {
    eligibilityStatus.textContent = "Needs Further Review";
    coachSummaryEl.textContent = "Moderate profile. Improve the areas below to strengthen approval chances.";
  } else {
    eligibilityStatus.textContent = "Currently Not Eligible";
    coachSummaryEl.textContent = "Current profile is below preferred threshold. Use these steps before reapplying.";
  }

  dtiRatioEl.textContent = `${dti.toFixed(1)}%`;

  const coachTips = [];

  if (dti > 35) {
    coachTips.push("Lower monthly debt to keep debt-to-income below 35%.");
  }

  if (creditScore < 620) {
    coachTips.push("Improve credit score above 620 by paying obligations on time and reducing utilization.");
  }

  if (disposable < 10000) {
    coachTips.push("Increase disposable income by reducing non-essential expenses or requesting a lower loan amount.");
  }

  if (income < 25000) {
    coachTips.push("Provide additional verified income sources to improve affordability checks.");
  }

  if (coachTips.length === 0) {
    coachTips.push("Excellent affordability profile. Maintain stable income and current repayment behavior.");
  }

  eligibilityCoachEl.textContent = "";
  coachTips.forEach((tip) => {
    const tipItem = document.createElement("li");
    tipItem.textContent = tip;
    eligibilityCoachEl.appendChild(tipItem);
  });

  eligibleAmount.textContent = formatRand(maxLoan);
});

const applicationForm = document.getElementById("application-form");
const successBox = document.getElementById("application-success");
const phoneInput = document.getElementById("phone");
const saveDraftBtn = document.getElementById("save-draft-btn");
const resumeDraftBtn = document.getElementById("resume-draft-btn");
const clearAllDataBtn = document.getElementById("clear-all-data-btn");
const draftStatusEl = document.getElementById("draft-status");
const latestReferenceBox = document.getElementById("latest-reference-box");
const latestReferenceEl = document.getElementById("latest-reference");
const trackerForm = document.getElementById("tracker-form");
const trackerReferenceInput = document.getElementById("tracker-reference");
const trackerFeedbackEl = document.getElementById("tracker-feedback");
const trackerCurrentStageEl = document.getElementById("tracker-current-stage");
const trackerLastUpdatedEl = document.getElementById("tracker-last-updated");
const trackerSummaryEl = document.getElementById("tracker-summary");
const clearTrackerBtn = document.getElementById("clear-tracker-btn");
const trackerStepEls = Array.from(document.querySelectorAll("#tracker-steps .tracker-step"));

const saPhonePattern = /^0\d{2} \d{3} \d{4}$/;
const applicationDraftKey = "chima-loan-service-application-draft-v1";
const trackerStorageKey = "chima-loan-service-tracker-v1";
const applicationFieldIds = ["loan-type", "amount", "tenure", "consent"];
const draftTtlDays = 7;
const draftTtlMs = draftTtlDays * 24 * 60 * 60 * 1000;

function setDraftStatus(message, isReady = false) {
  draftStatusEl.textContent = message;
  draftStatusEl.classList.toggle("ready", isReady);
}

function collectApplicationDraft() {
  const payload = {
    updatedAt: new Date().toISOString()
  };

  applicationFieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) {
      return;
    }

    payload[fieldId] = fieldId === "consent" ? field.checked : field.value;
  });

  return payload;
}

function applyApplicationDraft(data) {
  applicationFieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    if (!field || !(fieldId in data)) {
      return;
    }

    if (fieldId === "consent") {
      field.checked = Boolean(data[fieldId]);
      return;
    }

    field.value = data[fieldId] ?? "";
  });

  phoneInput.value = formatSouthAfricanPhone(phoneInput.value);
}

function getStoredValidDraft() {
  try {
    const raw = localStorage.getItem(applicationDraftKey);

    if (!raw) {
      return { draft: null, reason: "missing" };
    }

    const parsed = JSON.parse(raw);
    const updatedAtMs = new Date(parsed.updatedAt || 0).getTime();

    if (!Number.isFinite(updatedAtMs) || Date.now() - updatedAtMs > draftTtlMs) {
      localStorage.removeItem(applicationDraftKey);
      return { draft: null, reason: "expired" };
    }

    return { draft: parsed, reason: "ok" };
  } catch (error) {
    localStorage.removeItem(applicationDraftKey);
    return { draft: null, reason: "invalid" };
  }
}

function saveApplicationDraft(showMessage = true) {
  try {
    const payload = collectApplicationDraft();
    localStorage.setItem(applicationDraftKey, JSON.stringify(payload));

    if (showMessage) {
      const stamp = new Date(payload.updatedAt).toLocaleString();
      setDraftStatus(`Draft saved on ${stamp}.`, true);
    }
  } catch (error) {
    setDraftStatus("Could not save draft on this browser. Try submitting directly.");
  }
}

function resumeApplicationDraft(showMessage = true) {
  const storedDraft = getStoredValidDraft();

  if (!storedDraft.draft) {
    if (showMessage) {
      if (storedDraft.reason === "expired") {
        setDraftStatus(`Saved draft expired after ${draftTtlDays} days and was removed.`);
      } else {
        setDraftStatus("No saved draft found on this device.");
      }
    }
    return false;
  }

  applyApplicationDraft(storedDraft.draft);

  if (showMessage) {
    const stamp = storedDraft.draft.updatedAt ? new Date(storedDraft.draft.updatedAt).toLocaleString() : "previous session";
    setDraftStatus(`Draft resumed from ${stamp}.`, true);
  }

  return true;
}

function clearApplicationDraft() {
  localStorage.removeItem(applicationDraftKey);
  setDraftStatus("No saved draft yet. Only loan preferences are stored when you save draft.");
}

function maskPhoneForTracker(value) {
  const digits = value.replace(/\D/g, "");
  const lastFour = digits.slice(-4);

  if (!lastFour) {
    return "";
  }

  return `***${lastFour}`;
}

function getStoredTrackerRecords() {
  try {
    const raw = localStorage.getItem(trackerStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveStoredTrackerRecords(records) {
  localStorage.setItem(trackerStorageKey, JSON.stringify(records.slice(0, 25)));
}

function normalizeReferenceInput(value) {
  return value.trim().toUpperCase();
}

function generateReferenceId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CLS-${datePart}-${randomPart}`;
}

function getTrackerStage(record) {
  const createdMs = new Date(record.createdAt).getTime();
  if (!Number.isFinite(createdMs)) {
    return 0;
  }

  const elapsedHours = (Date.now() - createdMs) / (1000 * 60 * 60);
  if (elapsedHours >= 72) {
    return 2;
  }

  if (elapsedHours >= 24) {
    return 1;
  }

  return 0;
}

function renderTrackerRecord(record, feedbackMessage = "") {
  if (!record) {
    trackerCurrentStageEl.textContent = "Not available";
    trackerLastUpdatedEl.textContent = "-";
    trackerSummaryEl.textContent = "Submit an application to generate a reference ID.";
    trackerStepEls.forEach((stepEl) => {
      stepEl.classList.remove("is-complete", "is-current");
    });

    if (feedbackMessage) {
      trackerFeedbackEl.textContent = feedbackMessage;
    }

    return;
  }

  const stage = getTrackerStage(record);
  const stageNames = ["Submitted", "Under Review", "Approved"];
  const loanTypeLabels = {
    personal: "Personal Loan",
    business: "Business Loan",
    home: "Home Loan",
    salary: "Salary Advance"
  };

  trackerCurrentStageEl.textContent = stageNames[stage];
  trackerLastUpdatedEl.textContent = new Date(record.createdAt).toLocaleString();

  const applicantLabel = record.maskedPhone ? `Applicant (${record.maskedPhone})` : "Applicant";

  if (stage === 0) {
    trackerSummaryEl.textContent = `${applicantLabel}: your ${loanTypeLabels[record.loanType] || "loan"} request is submitted and queued.`;
  } else if (stage === 1) {
    trackerSummaryEl.textContent = `${applicantLabel}: verification is in progress for ${formatRand(record.amount || 0)} requested.`;
  } else {
    trackerSummaryEl.textContent = `${applicantLabel}: your request is approved and ready for offer confirmation.`;
  }

  trackerStepEls.forEach((stepEl, index) => {
    stepEl.classList.toggle("is-complete", index < stage);
    stepEl.classList.toggle("is-current", index === stage);
  });

  trackerFeedbackEl.textContent = feedbackMessage || `Status loaded for ${record.referenceId}.`;
}

function addTrackerRecord(record) {
  const records = getStoredTrackerRecords().filter((item) => item.referenceId !== record.referenceId);
  records.unshift(record);
  saveStoredTrackerRecords(records);
  return record;
}

function toSaLocalDigits(value) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0027")) {
    return `0${digits.slice(4)}`.slice(0, 10);
  }

  if (digits.startsWith("27")) {
    return `0${digits.slice(2)}`.slice(0, 10);
  }

  return digits.slice(0, 10);
}

function formatSouthAfricanPhone(value) {
  const digits = toSaLocalDigits(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

phoneInput.addEventListener("input", (event) => {
  const currentValue = event.target.value;
  const cursorPosition = event.target.selectionStart ?? currentValue.length;
  const digitsBeforeCursor = toSaLocalDigits(currentValue.slice(0, cursorPosition)).length;
  const formattedValue = formatSouthAfricanPhone(currentValue);

  event.target.value = formattedValue;

  let nextCursor = 0;
  let digitCount = 0;

  while (nextCursor < formattedValue.length && digitCount < digitsBeforeCursor) {
    if (/\d/.test(formattedValue[nextCursor])) {
      digitCount += 1;
    }
    nextCursor += 1;
  }

  event.target.setSelectionRange(nextCursor, nextCursor);
  event.target.setCustomValidity("");
});

phoneInput.addEventListener("blur", () => {
  if (!phoneInput.value) {
    return;
  }

  phoneInput.value = formatSouthAfricanPhone(phoneInput.value);
  phoneInput.setCustomValidity(
    saPhonePattern.test(phoneInput.value) ? "" : "Please use SA format: 072 123 4567"
  );
});

saveDraftBtn.addEventListener("click", () => {
  saveApplicationDraft(true);
});

resumeDraftBtn.addEventListener("click", () => {
  resumeApplicationDraft(true);
});

trackerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const reference = normalizeReferenceInput(trackerReferenceInput.value);
  trackerReferenceInput.value = reference;

  if (!reference) {
    renderTrackerRecord(null, "Enter a valid reference ID to check status.");
    return;
  }

  const records = getStoredTrackerRecords();
  const foundRecord = records.find((item) => item.referenceId === reference);

  if (!foundRecord) {
    renderTrackerRecord(null, `No application found for ${reference} on this device.`);
    return;
  }

  renderTrackerRecord(foundRecord, `Reference ${reference} found.`);
});

clearTrackerBtn.addEventListener("click", () => {
  localStorage.removeItem(trackerStorageKey);
  trackerReferenceInput.value = "";
  latestReferenceEl.textContent = "Not generated yet";
  latestReferenceBox.classList.add("hidden");
  renderTrackerRecord(null, "Tracker data cleared on this device.");
});

clearAllDataBtn.addEventListener("click", () => {
  localStorage.removeItem(applicationDraftKey);
  localStorage.removeItem(trackerStorageKey);
  trackerReferenceInput.value = "";
  latestReferenceEl.textContent = "Not generated yet";
  latestReferenceBox.classList.add("hidden");
  renderTrackerRecord(null, "All local draft/tracker data cleared on this device.");
  setDraftStatus("No saved draft yet. Only loan preferences are stored when you save draft.");
});

applicationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  phoneInput.value = formatSouthAfricanPhone(phoneInput.value);

  if (!saPhonePattern.test(phoneInput.value)) {
    phoneInput.setCustomValidity("Please use SA format: 072 123 4567");
    phoneInput.reportValidity();
    return;
  }

  phoneInput.setCustomValidity("");
  const trackerRecord = addTrackerRecord({
    referenceId: generateReferenceId(),
    createdAt: new Date().toISOString(),
    maskedPhone: maskPhoneForTracker(phoneInput.value),
    loanType: document.getElementById("loan-type").value,
    amount: Number(document.getElementById("amount").value) || 0
  });

  latestReferenceEl.textContent = trackerRecord.referenceId;
  latestReferenceBox.classList.remove("hidden");
  trackerReferenceInput.value = trackerRecord.referenceId;
  renderTrackerRecord(trackerRecord, `Reference ${trackerRecord.referenceId} generated successfully.`);

  successBox.textContent = `Application received. Reference ID: ${trackerRecord.referenceId}. A loan specialist will contact you within 24 hours.`;
  successBox.style.display = "block";
  localStorage.removeItem(applicationDraftKey);
  applicationForm.reset();
  clearApplicationDraft();
  setTimeout(() => {
    successBox.style.display = "none";
  }, 4500);
});

document.getElementById("year").textContent = new Date().getFullYear();
renderPayoffResult();

const initialStoredDraft = getStoredValidDraft();
if (initialStoredDraft.draft) {
  setDraftStatus("A saved draft is available. Click “Resume Draft” to load it.", true);
} else if (initialStoredDraft.reason === "expired") {
  setDraftStatus(`Saved draft expired after ${draftTtlDays} days and was removed.`);
} else {
  setDraftStatus("No saved draft yet. Only loan preferences are stored when you save draft.");
}

const initialTrackerRecords = getStoredTrackerRecords();
if (initialTrackerRecords.length > 0) {
  latestReferenceEl.textContent = initialTrackerRecords[0].referenceId;
  latestReferenceBox.classList.remove("hidden");
  trackerReferenceInput.value = initialTrackerRecords[0].referenceId;
  renderTrackerRecord(initialTrackerRecords[0], "Latest saved application has been loaded into tracker.");
} else {
  renderTrackerRecord(null, "No local tracker record yet. Submit an application to generate one.");
}

renderCalculatorResult();
