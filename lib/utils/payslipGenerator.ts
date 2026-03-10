// ─────────────────────────────────────────────
//  ClassyEndeavors — Payslip HTML Generator
// ─────────────────────────────────────────────

export interface PayslipInput {
  employeeName: string;
  /** ISO date string  e.g. "2025-03-10" */
  paymentDate: string;
  /** Net salary amount in INR (number) */
  amountINR: number;
}

export interface PayslipBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  net: number;
}

// ── Helpers ──────────────────────────────────

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numToWords(n: number): string {
  n = Math.floor(n);
  if (n === 0) return "Zero";
  if (n < 0)  return "Minus " + numToWords(-n);

  let result = "";
  if (n >= 10_000_000) { result += numToWords(Math.floor(n / 10_000_000)) + " Crore "; n %= 10_000_000; }
  if (n >= 100_000)    { result += numToWords(Math.floor(n / 100_000))    + " Lakh ";  n %= 100_000; }
  if (n >= 1_000)      { result += numToWords(Math.floor(n / 1_000))      + " Thousand "; n %= 1_000; }
  if (n >= 100)        { result += ONES[Math.floor(n / 100)]              + " Hundred "; n %= 100; }
  if (n >= 20)         { result += TENS[Math.floor(n / 10)] + " "; n %= 10; }
  if (n > 0)           { result += ONES[n] + " "; }

  return result.trim();
}

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function computeBreakdown(net: number): PayslipBreakdown {
  return {
    basic:            net * 0.50,
    hra:              net * 0.30,
    specialAllowance: net * 0.20,
    net,
  };
}

// ── Main export ───────────────────────────────

/**
 * Returns a fully self-contained HTML string for a ClassyEndeavors payslip.
 *
 * @example
 * const html = generatePayslip({
 *   employeeName: "Rohan Mehta",
 *   paymentDate:  "2025-03-10",
 *   amountINR:    75000,
 * });
 * fs.writeFileSync("payslip.html", html);
 */
export function generatePayslip(input: PayslipInput): string {
  const { employeeName, paymentDate, amountINR } = input;
  const b = computeBreakdown(amountINR);

  const amountWords = numToWords(amountINR) + " Rupees Only";
  const formattedDate = formatDate(paymentDate);

  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ClassyEndeavors – Payslip – ${employeeName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink:     #1a1410;
      --gold:    #b8933a;
      --gold-lt: #d4aa5a;
      --cream:   #faf7f2;
      --warm:    #f0ead8;
      --muted:   #7a6e60;
      --rule:    #d6c9a8;
    }

    @media print {
      body { background: #fff; }
      .page { box-shadow: none; margin: 0; max-width: 100%; }
    }

    body {
      font-family: 'Jost', sans-serif;
      background: #e8e0d0;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 20px;
    }

    /* ── Payslip page ── */
    .page {
      width: 100%;
      max-width: 720px;
      background: var(--cream);
      box-shadow: 0 4px 40px rgba(0,0,0,0.14);
      position: relative;
      overflow: hidden;
      border: 1px solid var(--rule);
    }

    .corner {
      position: absolute;
      width: 100px;
      height: 100px;
      opacity: 0.12;
    }
    .corner-tl { top: 0; left: 0; border-top: 3px solid var(--gold); border-left: 3px solid var(--gold); }
    .corner-tr { top: 0; right: 0; border-top: 3px solid var(--gold); border-right: 3px solid var(--gold); }
    .corner-bl { bottom: 0; left: 0; border-bottom: 3px solid var(--gold); border-left: 3px solid var(--gold); }
    .corner-br { bottom: 0; right: 0; border-bottom: 3px solid var(--gold); border-right: 3px solid var(--gold); }

    .header-band {
      background: var(--ink);
      padding: 36px 48px 28px;
    }
    .header-band::after {
      content: '';
      display: block;
      height: 3px;
      background: linear-gradient(90deg, var(--gold), var(--gold-lt), var(--gold));
      margin-top: 24px;
    }

    .company-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.4rem;
      font-weight: 300;
      letter-spacing: 0.18em;
      color: var(--cream);
      text-transform: uppercase;
    }
    .company-name span { color: var(--gold-lt); font-style: italic; }

    .doc-label {
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 6px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 28px 48px 0;
      gap: 20px;
    }
    .meta-block { display: flex; flex-direction: column; gap: 4px; }
    .meta-label {
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .meta-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      font-weight: 400;
      color: var(--ink);
      letter-spacing: 0.03em;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--rule), transparent);
      margin: 24px 48px;
    }

    .section-title {
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--gold);
      padding: 0 48px;
      margin-bottom: 16px;
    }

    .earnings-table {
      width: calc(100% - 96px);
      margin: 0 48px;
      border-collapse: collapse;
    }
    .earnings-table th {
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      text-align: left;
      padding: 8px 0;
      border-bottom: 1px solid var(--rule);
    }
    .earnings-table th:last-child { text-align: right; }
    .earnings-table td {
      font-size: 0.9rem;
      color: var(--ink);
      padding: 12px 0;
      border-bottom: 1px solid var(--warm);
    }
    .earnings-table td:last-child {
      text-align: right;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.05rem;
    }

    .net-pay-block {
      margin: 28px 48px;
      background: var(--ink);
      padding: 22px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .net-pay-block::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        45deg, transparent, transparent 12px,
        rgba(184,147,58,0.04) 12px, rgba(184,147,58,0.04) 13px
      );
    }
    .net-label {
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--gold-lt);
      position: relative;
    }
    .net-amount {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.2rem;
      font-weight: 300;
      color: #fff;
      letter-spacing: 0.04em;
      position: relative;
    }
    .currency-symbol {
      font-size: 1.3rem;
      vertical-align: super;
      color: var(--gold-lt);
      margin-right: 4px;
    }

    .amount-words {
      padding: 0 48px;
      font-size: 0.78rem;
      color: var(--muted);
      font-style: italic;
      font-family: 'Cormorant Garamond', serif;
      margin-bottom: 24px;
    }

    .ornament {
      text-align: center;
      color: var(--gold);
      opacity: 0.4;
      font-size: 1.1rem;
      letter-spacing: 0.5em;
      margin: 4px 0 8px;
    }

    .slip-footer {
      background: var(--warm);
      border-top: 1px solid var(--rule);
      padding: 22px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note {
      font-size: 0.68rem;
      color: var(--muted);
      letter-spacing: 0.06em;
      line-height: 1.6;
    }
    .seal {
      width: 64px; height: 64px;
      border: 2px solid var(--gold);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      flex-shrink: 0;
    }
    .seal-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 0.55rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
      text-align: center;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="page">

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Header -->
    <div class="header-band">
      <div class="company-name">Classy<span>Endeavors</span></div>
      <div class="doc-label">Employee Payslip &nbsp;·&nbsp; Confidential</div>
    </div>

    <!-- Meta -->
    <div class="meta-row">
      <div class="meta-block">
        <div class="meta-label">Employee Name</div>
        <div class="meta-value">${employeeName}</div>
      </div>
      <div class="meta-block" style="text-align:right">
        <div class="meta-label">Date of Payment</div>
        <div class="meta-value">${formattedDate}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Earnings -->
    <div class="section-title">Earnings</div>
    <table class="earnings-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td>&#8377; ${formatINR(b.basic)}</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA)</td>
          <td>&#8377; ${formatINR(b.hra)}</td>
        </tr>
        <tr>
          <td>Special Allowance</td>
          <td>&#8377; ${formatINR(b.specialAllowance)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Net Pay -->
    <div class="net-pay-block">
      <div class="net-label">Net Pay</div>
      <div class="net-amount">
        <span class="currency-symbol">&#8377;</span>${formatINR(b.net)}
      </div>
    </div>

    <!-- Amount in words -->
    <div class="amount-words">${amountWords}</div>

    <div class="ornament">&#10022; &nbsp; &#10022; &nbsp; &#10022;</div>

    <!-- Footer -->
    <div class="slip-footer">
      <div class="footer-note">
        This is a computer-generated payslip and requires no signature.<br/>
        For queries, contact hr@classyendeavors.com
      </div>
      <div class="seal">
        <div class="seal-text">CLASSY<br/>ENDEAVORS<br/>VERIFIED</div>
      </div>
    </div>

  </div>
</body>
</html>`;
}