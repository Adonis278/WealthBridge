'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCreditCard, FaChartLine, FaCheckCircle, FaTrophy,
  FaBook, FaTimes, FaChevronRight, FaChevronLeft, FaBolt,
  FaHome, FaWallet, FaShieldAlt, FaStar,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { saveEducationProgress, getEducationProgress, saveQuizScore } from '@/lib/educationService';
import { addPoints } from '@/lib/gamificationService';

interface LessonContent {
  id: number;
  title: string;
  duration: string;
  content: string[];
  keyTakeaways: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface Module {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  tag: string;
  gradient: string;
  lessons: LessonContent[];
  quiz: QuizQuestion[];
}


const MODULES: Module[] = [
  // ── CREDIT ──────────────────────────────────────────────────────────────────
  {
    id: 'credit',
    title: 'Credit Optimization',
    icon: FaCreditCard,
    description: 'Master how FICO 10T and VantageScore 4.0 work in 2026 and build an exceptional score.',
    tag: 'Credit',
    gradient: 'from-primary to-secondary',
    lessons: [
      {
        id: 1, title: 'How Credit Scores Work in 2026', duration: '6 min',
        content: [
          'In 2026, most lenders use FICO Score 10T — the "T" stands for trended data. Unlike older models that capture a single snapshot, FICO 10T analyzes 24 months of account history to evaluate whether your habits are improving or declining. Consistent progress now matters more than a single good month.',
          'VantageScore 4.0, used by all three major bureaus for many consumer products, also uses trended data and now incorporates rental and utility payment history — a landmark shift that lets millions of "credit invisible" Americans build a score from everyday payments.',
          'The 300–850 scale: Poor (300–579), Fair (580–669), Good (670–739), Very Good (740–799), Exceptional (800–850). Mortgage lenders in 2026 typically require 740+ for their best rates.',
          'A major 2026 development: buy-now-pay-later (BNPL) loans — Affirm, Klarna, Apple Pay Later — now appear on all three credit reports. Missing a BNPL payment can hurt your score just like a missed credit card payment.',
        ],
        keyTakeaways: [
          'FICO 10T uses 24 months of trended data — consistent improvement is directly rewarded.',
          'BNPL loans (Affirm, Klarna, etc.) now appear on all three bureaus as of 2025.',
          'VantageScore 4.0 can include on-time rent and utility payments to build your file.',
          'Target 740+ score for the best mortgage rates available in 2026.',
        ],
      },
      {
        id: 2, title: 'The 5 Score Factors & Their Real Weight', duration: '7 min',
        content: [
          'Payment History (35%) — The single largest factor. Even one 30-day late payment can drop your score 60–110 points. Set autopay for the minimum on every account. In 2026, BNPL late payments now fall into this category too.',
          'Credit Utilization (30%) — Your balance-to-limit ratio. The "stay under 30%" guideline is conservative: people with 800+ scores average just 7% utilization. Track each card individually — FICO looks at per-card and aggregate utilization separately.',
          'Length of Credit History (15%) — The age of your oldest account, newest account, and average age all matter. Closing old cards reduces this metric permanently. If you must close one, close the newest, not your oldest.',
          'Credit Mix (10%) — Managing both revolving (credit cards) and installment debt (auto, student, personal loans) signals that you handle different debt types responsibly. A secured installment loan can help build a thin credit file.',
          'New Credit (10%) — Each hard inquiry stays on your report for 2 years but only affects your score for 12 months. Rate shopping for a mortgage or auto loan within a 14–45 day window counts as ONE inquiry under FICO models.',
        ],
        keyTakeaways: [
          'Payment history (35%) — one missed payment can cost 60–110 points.',
          'Keep each individual card below 10% utilization, not just aggregate.',
          'FICO treats mortgage/auto rate-shopping within 45 days as a single inquiry.',
          'Never close your oldest card — account age is permanently locked in once you open.',
        ],
      },
      {
        id: 3, title: 'Disputing Credit Report Errors (2026)', duration: '8 min',
        content: [
          'The FTC estimates roughly 1 in 5 Americans has an error on at least one credit report. Common errors: accounts belonging to someone else, incorrect account status (delinquent when paid), duplicate accounts, and outdated negatives that should have aged off.',
          'Under the FCRA, most negatives must be removed after 7 years from the date of first delinquency. Chapter 7 bankruptcy is an exception at 10 years. Watch for "re-aged" debts — some collectors illegally reset the delinquency date to extend their collection window.',
          'As of 2026, free weekly credit reports from all three bureaus are available permanently at AnnualCreditReport.com (this became permanent in 2023). File disputes online directly with whichever bureau is reporting the error — each must investigate within 30 days.',
          'Document everything. Gather account statements, payment confirmations, and any correspondence. Submit to each bureau separately. If they side with the furnisher, add a 100-word Consumer Statement to your file. File a CFPB complaint (consumerfinance.gov) if bureaus are unresponsive — it creates a formal record that typically accelerates resolution.',
        ],
        keyTakeaways: [
          'Check all 3 reports weekly at AnnualCreditReport.com — now free and permanent.',
          'Negative items must be removed after 7 years (10 for Chapter 7 bankruptcy).',
          'File disputes with each bureau separately — they investigate within 30 days.',
          'A CFPB complaint triggers faster resolution when bureaus are unresponsive.',
        ],
      },
      {
        id: 4, title: 'Rapid Score Growth Strategies', duration: '7 min',
        content: [
          'Authorized User Method: Being added as an authorized user on a family member or friend\'s old, low-utilization card can add significant history and boost your score 20–50 points. The account holder does not need to give you the physical card — you just inherit the account\'s history on your report.',
          'Credit Limit Increases: Request CLI every 6–12 months. Most issuers (Chase, Capital One, Discover) allow soft-pull CLI requests in 2026 — no hard inquiry. Higher limits immediately lower your utilization ratio if your balances stay flat.',
          'Experian Boost (3rd iteration, 2026): Add Netflix, Hulu, rent, insurance, and some utility payments to your Experian file for free. Average gain: 13 points on Experian-based models. Many lenders use these models, making it a meaningful quick win.',
          'Balance Reporting Timing: Credit card balances are reported on your statement closing date — not the payment due date. Pay your balance down before the statement closes and your reported utilization that month will be very low, even if you charge it back up afterward and pay in full by the due date.',
          'The fastest 90-day playbook: (1) dispute any errors, (2) pay all cards under 10% utilization, (3) request CLI on 1–2 cards, (4) activate Experian Boost, (5) do not open or close any accounts.',
        ],
        keyTakeaways: [
          'Authorized user status can boost scores 20–50 points — no card needed.',
          'Pay card balances before the statement closing date for lower reported utilization.',
          'Experian Boost adds streaming, rent, and utility payments — average +13 points, free.',
          'CLI requests every 6–12 months via soft-pull lower utilization without a hard inquiry.',
        ],
      },
      {
        id: 5, title: 'Credit Cards: Choosing & Using Wisely', duration: '6 min',
        content: [
          'The Credit Card Competition Act (passed 2025) requires banks with $100B+ in assets to offer merchants a choice of at least two card networks. This is reshaping rewards economics — some premium cards have raised annual fees while others enhanced rewards to stay competitive.',
          'Building credit (score under 670): secured cards (Capital One Secured, Discover it Secured) or fintech credit-builder cards are your entry point. Above 700, no-annual-fee cards like Chase Freedom Unlimited or Citi Double Cash offer solid rewards with less risk.',
          'The "product change" (PC) strategy: instead of closing an unwanted card, ask your issuer to convert it to a different card in their lineup. This preserves the account age, credit limit, and entire history — critical for your score.',
          'Average credit card APR in February 2026: 22.4% — near historic highs. Any interest charges will easily exceed any cashback earned. Treat your card like a debit card: only charge what is already in your bank account and pay the full statement balance every month.',
        ],
        keyTakeaways: [
          'Average credit card APR is 22.4% in 2026 — never carry a balance.',
          'Product-change instead of closing cards — preserves account age and history.',
          'Secured cards (Capital One, Discover) are the best entry for scores under 670.',
          'The Credit Card Competition Act (2025) is actively reshaping rewards and fees.',
        ],
      },
      {
        id: 6, title: 'Credit Utilization: Advanced Playbook', duration: '5 min',
        content: [
          'The data is clear: people with 800+ FICO scores carry an average of 7% overall utilization — not 30%. The optimal range is 1–9%. Zero utilization can slightly hurt you because FICO may see no recent account activity.',
          'FICO 10T introduced "trended utilization" — it now tracks whether your balances are consistently moving toward zero (positive signal) or creeping upward (negative signal) across 24 months. Month-over-month paydowns are now rewarded directly.',
          'Installment vs. revolving: installment loan utilization (how much of a personal loan or auto loan remains) is calculated separately. A loan at 20% remaining principal shows favorably — it means 80% has been repaid responsibly.',
          'For large purchases that will spike utilization, pay mid-cycle (before statement close) or split across multiple cards to keep each card\'s individual utilization low. FICO evaluates both per-card and aggregate utilization.',
        ],
        keyTakeaways: [
          '800+ scorers average just 7% utilization — aim for 1–9%, not simply under 30%.',
          'FICO 10T rewards consistent downward utilization trends over 24 months.',
          'FICO evaluates per-card AND aggregate utilization — manage both.',
          '0% utilization can slightly hurt — keep at least one small charge per card monthly.',
        ],
      },
    ],
    quiz: [
      {
        question: 'What does the "T" in FICO 10T stand for, and what does it change?',
        options: ['Total — it weighs all accounts equally', 'Trended — it analyzes 24 months of account history to see improvement or decline', 'Traditional — same model as FICO 8', 'Tiered — different weights based on income'],
        answer: 1,
        explanation: 'FICO 10T uses "trended data," analyzing 24 months of account behavior. Consistent improvement is now directly rewarded, and gradual deterioration sends negative signals even if current numbers look acceptable.',
      },
      {
        question: 'You have a card with a $10,000 limit and a $2,500 balance (25% utilization). Is this optimal for an 800+ score?',
        options: ['Yes — 25% is under the 30% guideline', 'No — 800+ scorers average just 7%', 'Yes — utilization only matters if it exceeds 50%', 'It depends on how long you have had the card'],
        answer: 1,
        explanation: 'While under 30% is the common threshold, FICO data shows those with 800+ scores average just 7% utilization. 25% is far from optimal. Aim for 1–9% per card and in aggregate.',
      },
      {
        question: 'How long can a Chapter 7 bankruptcy stay on your credit report?',
        options: ['5 years', '7 years', '10 years', '15 years'],
        answer: 2,
        explanation: 'Chapter 7 bankruptcy can remain for 10 years from the filing date. Most other negatives — late payments, charge-offs, collections — are removed after 7 years from the date of first delinquency.',
      },
      {
        question: 'You rate-shop 3 mortgage lenders in the same month. How does FICO treat these hard inquiries?',
        options: ['As 3 separate inquiries, each hurting your score', 'As 1 inquiry if done within a 14–45 day window', 'They are completely ignored for mortgage applications', 'As 2 — first counts, then the rest are grouped'],
        answer: 1,
        explanation: 'FICO groups mortgage, auto, and student loan inquiries made within 14–45 days (depending on FICO version) into a single inquiry — encouraging you to shop without score penalty.',
      },
      {
        question: 'What is the single best way to lower your reported utilization for a given month?',
        options: ['Pay the full balance on the payment due date', 'Pay the balance down before the statement closing date', 'Call the bank and ask them to report a lower balance', 'Stop using the card for the rest of the month'],
        answer: 1,
        explanation: 'Balances are reported to bureaus on the statement closing date — not the payment due date. Paying down before closing means a lower balance gets reported, even if you charge back up and pay in full by the due date.',
      },
    ],
  },

  // ── INVESTING ────────────────────────────────────────────────────────────────
  {
    id: 'investing',
    title: 'Investing in 2026',
    icon: FaChartLine,
    description: 'Navigate AI-driven markets, updated tax rules, and the best investment vehicles for 2026.',
    tag: 'Investing',
    gradient: 'from-secondary to-darkwood',
    lessons: [
      {
        id: 1, title: 'The 2026 Investing Landscape', duration: '7 min',
        content: [
          'AI-driven algorithmic trading now accounts for an estimated 73% of all U.S. equity volume. Short-term trading against these systems is a losing game for most individuals. Long-term, low-cost index investing remains the most reliable wealth-building strategy for retail investors.',
          'The S&P 500 has averaged ~10.5% annual returns over 100 years — that story is unchanged. What has changed: the top 10 companies now represent ~36% of the entire index by market cap, the highest concentration ever. This means broad index funds are less diversified than they appear.',
          'Interest rates have stabilized but remain elevated. High-yield savings accounts yield 4.2–4.8% APY in February 2026 — genuinely competitive with stocks on a risk-adjusted basis for goals under 5 years. Short-term T-bills offer similar yields with no state income tax on interest.',
          'Bitcoin and Ethereum ETFs (approved 2024) are now mainstream. Many advisors recommend a 1–5% allocation for those who want crypto exposure without direct custody risk.',
        ],
        keyTakeaways: [
          'AI trading dominates short-term markets — long-term index investing still wins for individuals.',
          'Top 10 S&P 500 stocks are 36% of the index — international diversification is increasingly important.',
          'HYSAs yield 4.2–4.8% APY — a real option for short-term goals under 5 years.',
          'Bitcoin and Ethereum ETFs (2024) make crypto exposure accessible without direct custody.',
        ],
      },
      {
        id: 2, title: 'Index Funds & ETFs — The Smart Core', duration: '7 min',
        content: [
          'Both index funds and ETFs hold a basket of securities tracking an index. Key difference: index funds trade once daily at end-of-day prices; ETFs trade throughout the day like stocks. For long-term investors, this distinction rarely affects outcomes.',
          'Expense ratio is the annual fee as a percentage. Vanguard S&P 500 ETF (VOO) charges 0.03% — $3/year on $10,000. The average actively managed fund charges ~0.67% — $67/year. The difference compounded over 30 years at 10% annual returns costs over $30,000 on an initial $10K.',
          'The "three-fund portfolio": (1) U.S. total market ETF (VTI or FSKAX), (2) International developed + emerging ETF (VXUS or FZILX), (3) U.S. Bond ETF (BND or FXNAX). Adjust bond allocation based on timeline — more bonds as you approach your goal date.',
          'ETFs are more tax-efficient in taxable accounts due to the in-kind redemption mechanism, which avoids triggering taxable capital gains distributions. For a taxable brokerage, ETFs like VOO and VTI are generally preferred over mutual funds.',
        ],
        keyTakeaways: [
          'Expense ratio matters enormously — 0.03% vs 0.67% can cost $30K+ over 30 years on $10K.',
          'The three-fund portfolio (U.S., International, Bonds) covers the investing universe simply.',
          'ETFs are more tax-efficient than mutual funds in taxable brokerage accounts.',
          'ETFs trade intraday; index mutual funds trade end-of-day — same long-run outcome for most.',
        ],
      },
      {
        id: 3, title: 'Retirement Accounts in 2026', duration: '8 min',
        content: [
          '2026 contribution limits: 401(k) — $23,500 ($31,000 if 50+). Traditional and Roth IRA — $7,000 ($8,000 if 50+). SECURE 2.0 "super catch-up": ages 60–63 can contribute an extra $11,250 to their 401(k) for a maximum of $34,750 total.',
          'Always contribute enough to capture your full employer 401(k) match — it is a 50–100% guaranteed return. Under SECURE 2.0, employers can now make matching contributions to Roth 401(k) accounts, not just traditional — check your plan documents.',
          'Traditional IRA: contributions may be tax-deductible if you lack a workplace plan or earn below phase-out thresholds ($79K single, $126K married in 2026). You get a tax break now and pay taxes on withdrawals in retirement. Best if you expect a lower tax bracket later.',
          'Roth IRA: after-tax contributions; all withdrawals in retirement are 100% tax-free including all accumulated gains. Contribute directly if income is under $150K (single) or $236K (married) in 2026. Above those limits, use the "backdoor Roth" — contribute to a Traditional IRA then convert. No required minimum distributions (RMDs) — a major estate-planning advantage.',
          'Optimal order: (1) 401(k) to full employer match, (2) HSA if eligible, (3) max Roth IRA, (4) max 401(k) to $23,500, (5) taxable brokerage.',
        ],
        keyTakeaways: [
          '2026 401(k) limit: $23,500 ($31K if 50+). IRA limit: $7,000 ($8K if 50+).',
          'Always capture the full employer 401(k) match — guaranteed return.',
          'SECURE 2.0 super catch-up: ages 60–63 can contribute up to $34,750 to 401(k).',
          'Roth IRA: tax-free growth, tax-free withdrawals, and no RMDs — open one early.',
        ],
      },
      {
        id: 4, title: 'Investment Taxes in 2026', duration: '6 min',
        content: [
          'Short-term capital gains (assets held under 1 year) are taxed as ordinary income — up to 37% for high earners. Long-term gains (held over 1 year) are taxed at 0%, 15%, or 20% depending on income. For most households the rate is 15%.',
          '0% long-term gains rate applies to single filers with taxable income under ~$48,350 and married filers under ~$96,700 in 2026. In lower-income years, you can "harvest gains" — sell appreciated assets and immediately rebuy to reset your cost basis completely tax-free.',
          'Tax-loss harvesting: sell losing investments to realize the loss, offset it against gains (or up to $3,000 of ordinary income), and immediately buy a similar (not identical) fund. Many robo-advisors (Betterment, Wealthfront) automate this in 2026.',
          'Wash sale rule: you cannot claim a loss if you buy the same or substantially identical security within 30 days before or after the sale. Selling VOO and buying IVV (both S&P 500 ETFs) the same day is a wash sale — buy VTI (total market) instead to maintain exposure while avoiding the rule.',
        ],
        keyTakeaways: [
          'Long-term gains rates (0%/15%/20%) are far below ordinary income rates up to 37%.',
          '0% long-term rate applies to taxable income under ~$48K single in 2026.',
          'Tax-loss harvesting offsets gains or up to $3,000 of ordinary income per year.',
          'Wash sale: buying substantially identical securities within 30 days disallows the loss.',
        ],
      },
    ],
    quiz: [
      {
        question: 'What was the 2026 Roth IRA contribution limit for someone under 50?',
        options: ['$6,500', '$7,000', '$8,000', '$23,500'],
        answer: 1,
        explanation: '2026 IRA limits are $7,000 under age 50 and $8,000 for those 50+. The $23,500 limit applies to 401(k) workplace plans, not IRAs.',
      },
      {
        question: 'Vanguard\'s VOO has a 0.03% expense ratio. An actively managed fund charges 0.67%. On $10,000 over 30 years at 10%/year, roughly how much more do fees cost with the 0.67% fund?',
        options: ['About $640', 'About $3,000', 'About $30,000', 'Fees do not matter much over time'],
        answer: 2,
        explanation: 'Fees compound against you every year because they reduce the base that grows. The difference between 0.03% and 0.67% on $10,000 over 30 years at 10% annual returns exceeds $30,000.',
      },
      {
        question: 'How are short-term capital gains (assets held under 1 year) taxed in 2026?',
        options: ['At a flat 10%', 'At 0%, 15%, or 20% like long-term gains', 'As ordinary income — up to 37% for high earners', 'Not taxed until retirement withdrawals'],
        answer: 2,
        explanation: 'Short-term gains are taxed as ordinary income at your marginal rate — potentially 37% for high earners. This is why holding positions over 1 year to qualify for long-term rates is so valuable.',
      },
      {
        question: 'Which account type has NO Required Minimum Distributions during the owner\'s lifetime?',
        options: ['Traditional IRA', 'Traditional 401(k)', 'Roth IRA', 'SEP-IRA'],
        answer: 2,
        explanation: 'Roth IRAs have no RMDs during the account owner\'s lifetime, making them powerful long-term compounding and estate-planning vehicles. All traditional accounts (401k, Traditional IRA, SEP-IRA) require withdrawals starting at age 73.',
      },
      {
        question: 'You sell VOO at a loss for tax-loss harvesting and immediately buy IVV (also an S&P 500 ETF). What problem does this create?',
        options: ['No problem — different tickers are always allowed', 'A wash sale — both track the same index, disallowing the loss', 'A tax event that triggers short-term gains', 'A rebalancing penalty under 2026 IRS rules'],
        answer: 1,
        explanation: 'Buying substantially identical securities (both are S&P 500 ETFs) within 30 days of selling triggers the wash sale rule, disallowing the loss deduction. Buy VTI (total market) or a different-index ETF instead to maintain exposure while preserving the tax loss.',
      },
    ],
  },

  // ── BUDGETING ────────────────────────────────────────────────────────────────
  {
    id: 'budgeting',
    title: 'Personal Finance & Budgeting',
    icon: FaWallet,
    description: 'Build a money system that works — from zero-based budgeting to the 2026 high-yield savings landscape.',
    tag: 'Budgeting',
    gradient: 'from-amber to-primary',
    lessons: [
      {
        id: 1, title: 'The Paycheck Flow System', duration: '6 min',
        content: [
          'The most effective personal finance system is not about restricting yourself — it is about automating your priorities. The Paycheck Flow System: the moment your paycheck lands, automatic transfers immediately send money to pre-assigned destinations before you ever see it in your checking account.',
          'Steps: (1) Calculate take-home pay after taxes, 401k, and benefits. (2) List non-negotiable fixed expenses: rent/mortgage, insurance, minimum debt payments, subscriptions. (3) Set a "pay yourself first" savings/investment amount. (4) Whatever remains is your flexible spending.',
          'The 50/30/20 guideline: 50% of after-tax income to needs, 30% to wants, 20% to savings and debt repayment. In high-cost cities like NYC or SF, housing alone often consumes 40–50% — requiring a modified approach.',
          'Zero-based budgeting gives every dollar a job. Income minus all categories equals zero. AI-powered tools in 2026 (YNAB, Copilot Money) auto-categorize transactions and project cash flow 30–90 days ahead.',
        ],
        keyTakeaways: [
          'Automate transfers on payday so savings happen before spending decisions.',
          'The 50/30/20 rule: 50% needs, 30% wants, 20% savings/debt repayment.',
          'Zero-based budgeting: assign every dollar a job until income minus categories = $0.',
          'High-cost city residents often need a modified ratio — housing regularly exceeds 50% of take-home.',
        ],
      },
      {
        id: 2, title: 'Emergency Funds & HYSAs in 2026', duration: '5 min',
        content: [
          'An emergency fund is not optional — it is the foundation everything else rests on. Without it, any unexpected expense forces you into high-interest debt. Target: 3–6 months of essential expenses in a liquid account you can access within 1–2 business days.',
          'In February 2026, top high-yield savings accounts (HYSAs) from online banks pay 4.2–4.8% APY. Leading options: Marcus by Goldman Sachs, Ally, SoFi, Bread Financial. All are FDIC-insured to $250,000 — dramatically better than the 0.01% standard big bank savings rate.',
          'For even higher yields or amounts above $250K: 3–6 month T-bills at TreasuryDirect.gov yield 4.3–4.6% with no state income tax on interest. Fidelity\'s SPAXX money market fund yields ~4.4% in 2026.',
          'Where NOT to keep your emergency fund: in the stock market (too volatile for short-term needs), in a traditional savings account (0.01% means guaranteed inflation erosion at 3.2% annually), or in a penalty-CD you cannot access quickly.',
        ],
        keyTakeaways: [
          'Build 3–6 months of essential expenses in a HYSA before aggressive investing.',
          'Top HYSAs pay 4.2–4.8% APY in February 2026 vs. 0.01% at major banks.',
          'T-bills at TreasuryDirect.gov: 4.3–4.6% yield with no state income tax on interest.',
          'Never keep emergency savings in the stock market or a standard savings account.',
        ],
      },
      {
        id: 3, title: 'Eliminating Debt: Proven Strategies', duration: '7 min',
        content: [
          'Debt Avalanche: list debts by interest rate, highest to lowest. Pay minimums on all, put every extra dollar toward the highest-rate debt. Once it is gone, roll that payment to the next. Mathematically optimal — minimizes total interest paid.',
          'Debt Snowball: list debts by balance, smallest to largest. Attack the smallest first. A 2016 Harvard Business Review study confirms this method has higher completion rates because early wins build real momentum.',
          'Balance transfers: 0% APR offers (12–21 months, 3–5% transfer fee) can save hundreds while you pay down. Requires 680+ credit to qualify. You must pay the full balance before the promo period ends — after which rates shoot to 22%+.',
          'Personal loan consolidation: 8–15% APR for 700+ score borrowers in 2026 — far below the 22.4% average credit card rate. Simplifies payments and cuts interest cost, provided you do not run cards back up afterward.',
        ],
        keyTakeaways: [
          'Debt Avalanche saves the most money; Debt Snowball has higher completion rates.',
          '0% APR balance transfer: save hundreds — essential to pay off before promo expires.',
          'Consolidation loans: 8–15% APR vs. 22.4% average credit card — significant savings.',
          'SAVE plan borrowers should monitor DOE communications — the program is in legal flux in 2026.',
        ],
      },
      {
        id: 4, title: 'Insurance: The Financial Safety Net', duration: '5 min',
        content: [
          'Insurance is risk transfer: pay a small known cost (premium) to avoid a large potential catastrophic cost. Critical coverages: health, auto, renter\'s/homeowner\'s, and term life if anyone depends on your income.',
          '2026 HSA limits: $4,300 for individual, $8,550 for family HDHP coverage. HSA is triple tax-advantaged — pre-tax contributions, tax-free growth, tax-free withdrawals for medical expenses. After 65, withdraw for any reason (paying only ordinary income tax) like a Traditional IRA.',
          'Term life insurance: buy 10–12 times annual income in coverage if you have dependents. A healthy 30-year-old can get a $1M 20-year term policy for ~$30–40/month in 2026. Avoid whole life and universal life — fees are enormous and investment returns underperform.',
          'Renter\'s insurance: $10–20/month is one of the best financial values available. It covers your belongings against theft and damage, plus liability if someone is injured in your home. Your landlord\'s policy covers the building — not your possessions.',
        ],
        keyTakeaways: [
          '2026 HSA limits: $4,300 individual / $8,550 family — invest it like a retirement account.',
          'Term life: 10–12× annual income in coverage if anyone depends on your income.',
          'Renter\'s insurance at $10–20/month — your landlord\'s policy does not cover your belongings.',
          'HSA after age 65: withdraw for any reason, paying only ordinary income tax.',
        ],
      },
    ],
    quiz: [
      {
        question: 'In the 50/30/20 budget, what does the "20" represent?',
        options: ['20% for housing costs', '20% for entertainment', '20% for savings and debt repayment above minimums', '20% for transportation'],
        answer: 2,
        explanation: 'The 50/30/20 guideline: 50% to needs, 30% to wants, 20% to savings and aggressive debt repayment. This "pay yourself forward" allocation builds long-term financial security.',
      },
      {
        question: 'Which debt payoff method saves the most total interest?',
        options: ['Debt Snowball — smallest balance first', 'Debt Avalanche — highest interest rate first', 'Balance transfer to 0% APR', 'Minimum payments only until rates drop'],
        answer: 1,
        explanation: 'The Debt Avalanche (highest rate first) minimizes total interest because you eliminate your most expensive debt fastest. The Snowball provides better psychological momentum but typically costs more overall.',
      },
      {
        question: 'What is the 2026 HSA family coverage contribution limit?',
        options: ['$4,300', '$7,000', '$8,550', '$23,500'],
        answer: 2,
        explanation: 'The 2026 HSA limits are $4,300 for self-only HDHP coverage and $8,550 for family coverage. These limits are indexed to inflation and increase annually.',
      },
      {
        question: 'Approximately what APY were top HYSAs offering in February 2026?',
        options: ['0.5–1.0%', '1.5–2.5%', '4.2–4.8%', '7–8%'],
        answer: 2,
        explanation: 'Top HYSAs from online banks like Marcus, Ally, SoFi, and Bread Financial were offering 4.2–4.8% APY in February 2026 — far above the 0.01% at major traditional banks and above the 3.2% inflation rate.',
      },
      {
        question: 'How much term life insurance is generally recommended for someone with dependents?',
        options: ['$100,000 flat', '3–5× annual income', '10–12× annual income', 'Enough to cover the mortgage only'],
        answer: 2,
        explanation: 'Experts recommend 10–12 times annual income in term life coverage — enough to replace income for a decade+, pay off major debts, and allow dependents to invest the remainder for ongoing support.',
      },
    ],
  },

  // ── HOME BUYING ──────────────────────────────────────────────────────────────
  {
    id: 'homebuying',
    title: 'Home Buying in 2026',
    icon: FaHome,
    description: 'Navigate the 2026 housing market, mortgage qualification, and true cost of ownership.',
    tag: 'Real Estate',
    gradient: 'from-darkwood to-secondary',
    lessons: [
      {
        id: 1, title: 'The 2026 Housing Market', duration: '6 min',
        content: [
          'The U.S. housing market in early 2026 remains challenging for buyers. National median home price is approximately $420,000 in Q1 2026. The Midwest and parts of the Southeast still offer relative affordability compared to coastal metros.',
          '30-year fixed mortgage rates are 6.4–6.8% in February 2026 — down from the 2023 peak above 8%, but well above the 2020–2021 historic low of 2.7–3.1%. At 6.6%, a $400,000 home with 20% down produces a $2,056/month principal and interest payment, before taxes, insurance, and HOA.',
          'The "lock-in effect": homeowners who locked in 2–3% rates in 2020–2021 are reluctant to sell and take on a 6%+ mortgage. This keeps existing home inventory suppressed, supporting prices even as demand softens.',
          'New construction has picked up the slack. Builder incentives — particularly permanent mortgage rate buydowns to 5.5–6% — are common in 2026. These can save tens of thousands in total interest over the loan life.',
        ],
        keyTakeaways: [
          'Median U.S. home price ~$420K in Q1 2026. 30-year rates: 6.4–6.8%.',
          'The lock-in effect keeps existing inventory low — new construction fills the gap.',
          'Builder mortgage rate buydowns (to ~5.5–6%) are common and worth negotiating.',
          'At 6.6%, a $320K loan costs ~$2,056/month in principal and interest alone.',
        ],
      },
      {
        id: 2, title: 'Qualifying for a Mortgage in 2026', duration: '7 min',
        content: [
          'Lenders evaluate four pillars: credit score, debt-to-income ratio (DTI), down payment, and income/employment stability. Optimizing each before you apply can mean the difference between an approval and a denial — or a 6.4% vs. 7.2% rate.',
          'Credit score requirements: conventional loans typically need 620 minimum, with best rates at 740+. FHA loans allow 580 with 3.5% down, or 500 with 10% down. VA loans (veterans) and USDA loans (rural) have no official minimum but lenders typically require 580–620.',
          'DTI: total monthly debt payments including the new mortgage PITI (Principal, Interest, Taxes, Insurance) divided by gross monthly income. Must be 43% or under for conventional loans; front-end DTI (housing only) should be under 28%.',
          'Self-employed borrowers need 2 years of tax returns — lenders use a 2-year average of net income. Consult a mortgage broker 12–18 months before applying to optimize your tax reporting strategy.',
          'Get pre-approved, not just pre-qualified. Pre-approval involves a hard pull and income verification — sellers in 2026 routinely require it before accepting showings.',
        ],
        keyTakeaways: [
          'Conventional: 620 minimum, best rates at 740+. FHA: 580 with 3.5% down.',
          'Total DTI under 43%; front-end (housing only) DTI under 28%.',
          'Self-employed: 2-year tax return average — plan your filing strategy 12–18 months ahead.',
          'Get pre-approved — sellers require it before showing homes in 2026.',
        ],
      },
      {
        id: 3, title: 'Down Payments, PMI & Closing Costs', duration: '6 min',
        content: [
          '20% down eliminates Private Mortgage Insurance (PMI) — typically 0.5–1.5% of the loan balance annually. On a $400,000 loan that is $2,000–6,000/year added to your payment. But 20% on a $400K home is $80,000 — out of reach for many first-time buyers.',
          'Lower down payment programs: 3% down for first-time buyers via Fannie Mae HomeReady and Freddie Mac Home Possible. FHA: 3.5% with 580+ score. PMI applies to all of these. Once you reach 20% equity, you can request PMI cancellation on conventional loans.',
          'State and local assistance programs: many states offer first-time buyer grants and forgivable down payment loans of $5,000–$40,000. Check your state housing finance agency. Some are income-limited; others are geographically targeted.',
          'Closing costs: 2–5% of the loan amount, due at closing IN ADDITION to your down payment. On a $380K loan: $7,600–$19,000. Includes origination fee, appraisal ($500–800), title insurance, prepaid homeowner\'s insurance, and 2–3 months of property taxes in escrow. Request your Loan Estimate within 3 business days of applying.',
        ],
        keyTakeaways: [
          '20% down eliminates PMI; 3–3.5% down programs are viable with PMI cost.',
          'Check your state housing finance agency — grants of $5K–$40K may be available.',
          'Closing costs are 2–5% of the loan — budget for this separately from the down payment.',
          'Request the Loan Estimate within 3 days of applying — it legally itemizes every cost.',
        ],
      },
      {
        id: 4, title: 'True Cost of Homeownership', duration: '6 min',
        content: [
          'The mortgage is just part of the cost. True monthly cost = principal & interest + property taxes + homeowner\'s insurance + PMI (if applicable) + HOA fees + maintenance reserve. Budget 1–2% of your home\'s value annually for maintenance — $4,000–8,000/year on a $400K home.',
          'Property taxes vary enormously: NJ averages 2.2% effective rate ($8,800/year on a $400K home); Hawaii averages 0.29% ($1,160/year). This single factor can swing your total monthly payment by $600+. Research local rates before targeting any neighborhood.',
          'Rent vs. buy in 2026: with rates at 6.6% and elevated prices, renting is mathematically cheaper in many markets over a 1–5 year horizon. Homeownership typically wins on cost starting around year 5–7 once equity builds and transaction costs are amortized. Use the NYT Rent vs. Buy Calculator with your specific numbers.',
          'Amortization reality: in year 1 of a 6.6% 30-year mortgage, roughly 80% of each payment is interest. Equity builds primarily through appreciation in the early years. Extra principal payments made early save enormous total interest over the life of the loan.',
        ],
        keyTakeaways: [
          'Budget 1–2% of home value annually for maintenance — $4K–8K/year on a $400K home.',
          'Property taxes: 0.29% (Hawaii) to 2.2% (NJ) — a $600+/month swing. Research carefully.',
          'Renting is cheaper than buying for the first 5–7 years in many 2026 markets.',
          'Year 1 at 6.6%: ~80% of each payment is interest — equity builds slowly at first.',
        ],
      },
    ],
    quiz: [
      {
        question: 'Minimum credit score for an FHA loan with 3.5% down in 2026?',
        options: ['500', '580', '620', '680'],
        answer: 1,
        explanation: 'FHA loans allow 580 minimum with 3.5% down. Scores 500–579 can qualify with 10% down. This makes FHA the primary mortgage path for buyers rebuilding credit.',
      },
      {
        question: 'PMI on a conventional loan is required when the down payment is less than what?',
        options: ['5%', '10%', '15%', '20%'],
        answer: 3,
        explanation: 'PMI is required on conventional loans with less than 20% down. It typically costs 0.5–1.5% of the loan annually and can be canceled once you reach 20% equity.',
      },
      {
        question: 'Approximate closing costs as a percent of the loan amount?',
        options: ['0.5–1%', '2–5%', '7–10%', 'They are rolled into the loan by default'],
        answer: 1,
        explanation: 'Closing costs run 2–5% of the loan amount, paid in cash at closing on top of the down payment. On a $380K loan: $7,600–$19,000.',
      },
      {
        question: '30-year fixed mortgage rates in February 2026 were approximately:',
        options: ['2.7–3.1%', '4.0–4.5%', '6.4–6.8%', '9.0–9.5%'],
        answer: 2,
        explanation: 'Rates in February 2026 are approximately 6.4–6.8%, down from the 2023 peak above 8% but still significantly above the 2020–2021 historic lows of 2.7–3.1%.',
      },
      {
        question: 'In year 1 of a 6.6% 30-year mortgage, roughly what percentage of each payment is interest?',
        options: ['About 20%', 'About 50%', 'About 80%', 'About 95%'],
        answer: 2,
        explanation: 'Due to amortization, roughly 80% of year-1 payments go toward interest at a 6.6% rate. Extra principal payments made early save enormous amounts in total interest over 30 years.',
      },
    ],
  },

  // ── DEBT ─────────────────────────────────────────────────────────────────────
  {
    id: 'debtmanagement',
    title: 'Debt Management',
    icon: FaShieldAlt,
    description: 'Know your rights with collectors, negotiate strategically, and build a payoff ladder.',
    tag: 'Debt',
    gradient: 'from-primary to-amber',
    lessons: [
      {
        id: 1, title: 'Taking Stock: A Clearheaded Debt Inventory', duration: '5 min',
        content: [
          'Start with clarity. List every debt: outstanding balance, interest rate (APR), minimum payment, and whether it reports to credit bureaus. Many people discover they have been making minimum payments on 22% credit card debt while holding cash in a savings account earning 0.5% — a guaranteed negative return on the delta between those rates.',
          'Priority tiers: (1) Secured debt (home, car as collateral) — always prioritize to avoid losing critical assets. (2) High-interest unsecured debt (credit cards at 22%+) — mathematical priority. (3) Federal student loans — income-driven repayment makes these manageable even in hardship. (4) Medical debt — the most negotiable category; hospitals routinely discount for cash payment. (5) Time-barred collections — understand the statute of limitations before contacting anyone.',
          'The debt-free threshold: if a debt carries a rate above your realistic after-tax investment return (~7% for diversified stocks), pay it off before investing beyond a 401k match. Paying off 22% credit card debt is a guaranteed 22% return — no investment can match that risk-free.',
        ],
        keyTakeaways: [
          'List all debts with balance, APR, minimum, and bureau-reporting status.',
          'Paying off a 22% card is a guaranteed 22% return — before investing beyond 401k match.',
          'Medical debt is highly negotiable — hospitals often accept 40–60 cents on the dollar.',
          'Prioritize secured debt (home, car) above all to protect critical assets.',
        ],
      },
      {
        id: 2, title: 'Your Rights Under the FDCPA (2026)', duration: '6 min',
        content: [
          'The Fair Debt Collection Practices Act (FDCPA) protects you from abusive, unfair, and deceptive collection practices. The 2021 CFPB Regulation F extended these rules to digital channels — collectors can contact you via email, text, and social media only under strict conditions with opt-out rights.',
          'Collectors CANNOT: call before 8am or after 9pm local time; use threatening or harassing language; threaten legal action they do not intend; claim you owe more than you do; contact you at work after being told your employer disapproves; call more than 7 times in any 7-day period, or within 7 days of a conversation.',
          'Debt validation: within 5 days of first contact, collectors must provide written notice of the amount owed, the creditor\'s name, and your right to dispute. Send a written dispute within 30 days and collection must stop until they verify — send it certified mail with return receipt.',
          'Statute of limitations (SOL): the window for collectors to sue varies by state and debt type — typically 3–6 years. After the SOL expires, the debt is time-barred. Critical: any payment — even $1 — or verbal acknowledgment of a time-barred debt can restart the clock in many states.',
          'If collectors violate the FDCPA, you can sue in federal court for up to $1,000 in statutory damages, actual damages, and attorney fees. Report violations to the CFPB at consumerfinance.gov.',
        ],
        keyTakeaways: [
          'Collectors cannot call before 8am or after 9pm, or more than 7 times per 7 days.',
          'Request debt validation within 30 days — collection must stop until verified.',
          'SOL bars lawsuits after 3–6 years — any payment can restart the clock.',
          'FDCPA violations: you can sue for up to $1,000 + actual damages + attorney fees.',
        ],
      },
      {
        id: 3, title: 'Negotiating With Creditors', duration: '6 min',
        content: [
          'Creditors prefer collecting something over nothing — which gives you real leverage. Hardship programs: most major card issuers have unpublicized programs that temporarily reduce your rate to 0–6% while you pay down. Call and specifically ask for the "hardship department."',
          'Settlement: for charged-off debts, collectors often purchased your account for 1–5 cents on the dollar and may accept 25–50 cents as settlement. Get any agreement in writing before making any payment.',
          'Goodwill adjustment letters: an isolated late payment on an otherwise clean account can sometimes be removed by sending a written goodwill letter explaining the circumstances. Some issuers policy-allow one removal per account lifetime, particularly for long-standing customers.',
          'Pay-for-delete: negotiate with a collection agency to delete the collection entry from your report in exchange for payment. Not legally required but many agencies agree, especially when settling for less. Always get it in writing first.',
          'Tax consequence: forgiven debt over $600 is reported to the IRS on Form 1099-C as potentially taxable income — unless you qualify for the insolvency exclusion (total debts exceeded total assets at time of settlement).',
        ],
        keyTakeaways: [
          'Ask specifically for the "hardship department" — issuers offer unpublicized 0–6% temporary rates.',
          'Collection agencies paid pennies for your debt — they may accept 25–50 cents on the dollar.',
          'Goodwill letters can remove isolated late payments, especially for long-term accounts.',
          'Forgiven debt over $600 triggers IRS Form 1099-C — plan for the potential tax impact.',
        ],
      },
    ],
    quiz: [
      {
        question: 'Under the FDCPA, what is the maximum number of calls a debt collector can make in a 7-day period?',
        options: ['3', '5', '7', 'Unlimited'],
        answer: 2,
        explanation: 'Under the 2021 CFPB Regulation F, collectors may not call more than 7 times in any 7-day period and cannot call within 7 days of actually speaking with you.',
      },
      {
        question: 'You have $5,000 in a 4.5% HYSA and $5,000 on a 22% credit card. What should you do?',
        options: ['Keep both — the emergency fund provides security', 'Pay the card — the guaranteed 22% payoff beats 4.5% by 17+ points', 'Invest in stocks instead for higher returns', 'Make minimums and max Roth IRA first'],
        answer: 1,
        explanation: 'Paying off a 22% debt is a guaranteed 22% return. This beats 4.5% savings by 17.5 percentage points. Eliminate high-interest debt before keeping excess savings beyond a small emergency cushion.',
      },
      {
        question: 'What is a "pay-for-delete" agreement?',
        options: ['Asking a bureau to delete your credit report', 'Negotiating with a collection agency to remove the collection entry from your report in exchange for payment', 'Paying a credit repair company to delete negatives', 'Deleting an account to improve your score'],
        answer: 1,
        explanation: 'Pay-for-delete is a negotiated deal where you pay the collection agency and they agree to delete the collection from your credit report. Not legally required but many agree as part of a settlement. Always get it in writing before paying.',
      },
      {
        question: 'You make a $1 payment on a 6-year-old debt with a 5-year state SOL. What likely happens?',
        options: ['Nothing — the SOL already expired', 'The debt is reduced by $1', 'The payment may restart the SOL in many states', 'The creditor must now accept it as payment in full'],
        answer: 2,
        explanation: 'In many states, any payment — even $1 — on a time-barred (past-SOL) debt can restart the statute of limitations, giving the creditor a fresh window to sue. Research your state\'s specific rules before contacting anyone about old accounts.',
      },
      {
        question: 'You settle a $8,000 debt for $3,500. The $4,500 difference is forgiven. Which IRS form will you likely receive?',
        options: ['W-2', '1099-INT', '1099-C', '1098-E'],
        answer: 2,
        explanation: 'Forgiven debt of $600 or more is reported on IRS Form 1099-C (Cancellation of Debt). This amount may be taxable ordinary income unless you qualify for the insolvency exclusion or another IRS exception.',
      },
    ],
  },
];

const ALL_TAGS = ['All', 'Credit', 'Investing', 'Budgeting', 'Real Estate', 'Debt'];


export default function EducationPage() {
  const { user } = useAuth();
  const [activeTag, setActiveTag] = useState('All');
  const [completedLessons, setCompletedLessons] = useState<Record<string, Set<number>>>({});
  const [loading, setLoading] = useState(true);
  const [viewingLesson, setViewingLesson] = useState<{ module: Module; lesson: LessonContent } | null>(null);
  const [quizModule, setQuizModule] = useState<Module | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSavedPoints, setQuizSavedPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(MODULES.map((m) => getEducationProgress(user.uid, m.id)));
        const map: Record<string, Set<number>> = {};
        MODULES.forEach((m, i) => {
          const d = results[i];
          map[m.id] = d.success && d.data?.lessons
            ? new Set<number>(d.data.lessons.filter((l: any) => l.completed).map((l: any) => Number(l.id)))
            : new Set<number>();
        });
        setCompletedLessons(map);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const isDone = (mid: string, lid: number) => completedLessons[mid]?.has(lid) ?? false;

  const modProgress = (m: Module) => {
    const done = m.lessons.filter((l) => isDone(m.id, l.id)).length;
    return Math.round((done / m.lessons.length) * 100);
  };

  const filtered = activeTag === 'All' ? MODULES : MODULES.filter((m) => m.tag === activeTag);
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const totalDone = MODULES.reduce((s, m) => s + m.lessons.filter((l) => isDone(m.id, l.id)).length, 0);

  const completeLesson = async (m: Module, lesson: LessonContent) => {
    if (!user) return;
    const prev = completedLessons[m.id] ?? new Set<number>();
    if (prev.has(lesson.id)) { setViewingLesson(null); return; }
    const next = new Set(prev).add(lesson.id);
    setCompletedLessons((c) => ({ ...c, [m.id]: next }));
    setViewingLesson(null);
    try {
      const ld = m.lessons.map((l) => ({ id: l.id, title: l.title, completed: next.has(l.id) }));
      await saveEducationProgress(user.uid, m.id, m.title, ld);
      await addPoints(user.uid, 50);
    } catch (e) { console.error(e); }
  };

  const openQuiz = (m: Module) => { setQuizModule(m); setQuizStep(0); setQuizAnswers([]); setQuizSubmitted(false); setQuizSavedPoints(null); };
  const selectAnswer = (idx: number) => { if (quizSubmitted) return; const a = [...quizAnswers]; a[quizStep] = idx; setQuizAnswers(a); };
  const nextStep = () => { if (!quizModule) return; quizStep < quizModule.quiz.length - 1 ? setQuizStep((s) => s + 1) : submitQuiz(); };

  const submitQuiz = async () => {
    if (!quizModule) return;
    setQuizSubmitted(true);
    const correct = quizModule.quiz.filter((q, i) => quizAnswers[i] === q.answer).length;
    const score = Math.round((correct / quizModule.quiz.length) * 100);
    setQuizSavedPoints(score);
    if (user) {
      try { await saveQuizScore(user.uid, quizModule.id, score); await addPoints(user.uid, score); }
      catch (e) { console.error(e); }
    }
  };

  const quizScore = quizModule
    ? Math.round((quizModule.quiz.filter((q, i) => quizAnswers[i] === q.answer).length / quizModule.quiz.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-5xl font-bold text-secondary mb-3 font-serif">Financial Education Hub</h1>
          <p className="text-lg text-darkwood mb-6">
            Up-to-date 2026 courses — credit, investing, budgeting, home buying, and debt.
          </p>
          {user && !loading && (
            <div className="inline-flex items-center gap-3 bg-white/70 border border-accent rounded-full px-6 py-2 shadow-sm">
              <FaBolt className="text-primary" />
              <span className="text-darkwood text-sm font-medium">{totalDone} / {totalLessons} lessons completed</span>
              <div className="w-32 h-2 bg-accent/30 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-amber rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((totalDone / totalLessons) * 100)}%` }} />
              </div>
            </div>
          )}
        </motion.div>

        {!user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-md mx-auto mb-8 bg-white/80 border border-accent rounded-2xl p-6 text-center shadow">
            <p className="text-darkwood mb-4">Log in to track your progress and earn XP!</p>
            <a href="/login" className="inline-block bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition-all">Log In</a>
          </motion.div>
        )}

        {loading && user && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-darkwood">Loading your progress…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Tag filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {ALL_TAGS.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    activeTag === tag
                      ? 'bg-primary text-white border-primary shadow'
                      : 'bg-white/60 text-darkwood border-accent hover:border-primary hover:text-primary'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>

            {/* Module grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {filtered.map((module, index) => {
                const Icon = module.icon;
                const pct = modProgress(module);
                return (
                  <motion.div key={module.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-white/80 backdrop-blur-sm border border-accent/40 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">

                    {/* Card header */}
                    <div className={`bg-gradient-to-r ${module.gradient} p-6`}>
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{module.tag}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <Icon className="text-3xl text-white" />
                        <h2 className="text-2xl font-bold text-white font-serif">{module.title}</h2>
                      </div>
                      <p className="text-white/80 mt-2 text-sm leading-relaxed">{module.description}</p>
                      <div className="mt-4">
                        <div className="flex justify-between text-white/80 text-xs mb-1">
                          <span>{module.lessons.filter((l) => isDone(module.id, l.id)).length}/{module.lessons.length} lessons</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-2">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }} className="h-2 rounded-full bg-white/90" />
                        </div>
                      </div>
                    </div>

                    {/* Lessons list */}
                    <div className="p-5 space-y-2">
                      {module.lessons.map((lesson) => {
                        const done = isDone(module.id, lesson.id);
                        return (
                          <button key={lesson.id} onClick={() => setViewingLesson({ module, lesson })}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${
                              done
                                ? 'bg-primary/10 border-primary/30 text-secondary'
                                : 'bg-background/60 border-accent/50 hover:border-primary hover:bg-primary/5 text-darkwood'
                            }`}>
                            <div className="flex items-center gap-3">
                              {done
                                ? <FaCheckCircle className="text-primary text-lg flex-shrink-0" />
                                : <FaBook className="text-accent text-lg flex-shrink-0" />}
                              <div>
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <p className="text-xs text-darkwood/60">{lesson.duration}</p>
                              </div>
                            </div>
                            <FaChevronRight className="text-darkwood/40 group-hover:text-primary transition-colors flex-shrink-0" />
                          </button>
                        );
                      })}

                      <button onClick={() => openQuiz(module)}
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-sm">
                        <FaTrophy className="text-accent" />
                        Take Module Quiz ({module.quiz.length} questions)
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Lesson viewer modal */}
      <AnimatePresence>
        {viewingLesson && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingLesson(null)}>
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
              className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}>

              <div className={`bg-gradient-to-r ${viewingLesson.module.gradient} p-6 rounded-t-2xl`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">{viewingLesson.module.title}</p>
                    <h3 className="text-2xl font-bold text-white font-serif mt-1">{viewingLesson.lesson.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{viewingLesson.lesson.duration} read</p>
                  </div>
                  <button onClick={() => setViewingLesson(null)} className="text-white/70 hover:text-white text-xl p-1">
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {viewingLesson.lesson.content.map((para, i) => (
                  <p key={i} className="text-darkwood leading-relaxed text-sm">{para}</p>
                ))}

                <div className="mt-6 bg-accent/20 border border-accent rounded-xl p-5">
                  <h4 className="font-bold text-secondary font-serif mb-3 flex items-center gap-2">
                    <FaStar className="text-primary" /> Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {viewingLesson.lesson.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-darkwood">
                        <FaCheckCircle className="text-primary mt-0.5 flex-shrink-0" />{t}
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => completeLesson(viewingLesson.module, viewingLesson.lesson)}
                  className={`w-full py-3 rounded-xl font-bold transition-all mt-4 ${
                    isDone(viewingLesson.module.id, viewingLesson.lesson.id)
                      ? 'bg-primary/20 text-primary border border-primary/40 cursor-default'
                      : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow'
                  }`}>
                  {isDone(viewingLesson.module.id, viewingLesson.lesson.id) ? '✓ Lesson Completed' : 'Mark as Complete (+50 XP)'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz modal */}
      <AnimatePresence>
        {quizModule && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => !quizSubmitted && setQuizModule(null)}>
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
              className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}>

              <div className={`bg-gradient-to-r ${quizModule.gradient} p-6 rounded-t-2xl flex items-center justify-between`}>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">{quizModule.title}</p>
                  <h3 className="text-2xl font-bold text-white font-serif mt-1">Module Quiz</h3>
                </div>
                {!quizSubmitted && (
                  <button onClick={() => setQuizModule(null)} className="text-white/70 hover:text-white text-xl p-1">
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="p-6">
                {!quizSubmitted ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-darkwood font-semibold">Question {quizStep + 1} of {quizModule.quiz.length}</span>
                      <span className="text-xs text-darkwood">{Math.round((quizStep / quizModule.quiz.length) * 100)}% done</span>
                    </div>
                    <div className="w-full bg-accent/30 rounded-full h-1.5 mb-6">
                      <div className="h-1.5 bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(quizStep / quizModule.quiz.length) * 100}%` }} />
                    </div>

                    <p className="text-secondary font-semibold text-base leading-relaxed mb-5">
                      {quizModule.quiz[quizStep].question}
                    </p>

                    <div className="space-y-3 mb-8">
                      {quizModule.quiz[quizStep].options.map((opt, i) => (
                        <button key={i} onClick={() => selectAnswer(i)}
                          className={`w-full text-left p-4 rounded-xl border-2 text-sm transition-all ${
                            quizAnswers[quizStep] === i
                              ? 'border-primary bg-primary/10 text-secondary font-semibold'
                              : 'border-accent/50 bg-white/60 text-darkwood hover:border-primary/50'
                          }`}>
                          <span className="font-bold text-primary/70 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <button onClick={() => setQuizStep((s) => Math.max(0, s - 1))} disabled={quizStep === 0}
                        className="flex items-center gap-2 text-sm text-darkwood hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <FaChevronLeft /> Previous
                      </button>
                      <button onClick={nextStep} disabled={quizAnswers[quizStep] === undefined}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {quizStep === quizModule.quiz.length - 1 ? 'Submit Quiz' : 'Next'} <FaChevronRight />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <FaTrophy className={`text-7xl mx-auto mb-4 ${quizScore >= 80 ? 'text-amber' : quizScore >= 60 ? 'text-primary' : 'text-secondary'}`} />
                    <h3 className="text-3xl font-bold text-secondary font-serif mb-2">
                      {quizScore >= 80 ? 'Excellent!' : quizScore >= 60 ? 'Good Job!' : 'Keep Learning!'}
                    </h3>
                    <p className="text-5xl font-bold text-primary mb-1">{quizScore}%</p>
                    <p className="text-darkwood text-sm mb-6">
                      {quizModule.quiz.filter((q, i) => quizAnswers[i] === q.answer).length} of {quizModule.quiz.length} correct
                      {quizSavedPoints != null && ` · +${quizSavedPoints} XP earned`}
                    </p>

                    <div className="text-left space-y-4 mb-6">
                      {quizModule.quiz.map((q, i) => {
                        const correct = quizAnswers[i] === q.answer;
                        return (
                          <div key={i} className={`rounded-xl p-4 border ${correct ? 'bg-primary/10 border-primary/30' : 'bg-accent/10 border-primary/20'}`}>
                            <p className="text-sm font-semibold text-secondary mb-1">Q{i + 1}. {q.question}</p>
                            <p className={`text-xs font-medium mb-2 ${correct ? 'text-primary' : 'text-secondary'}`}>
                              {correct ? '✓ Correct' : `✗ You chose: ${q.options[quizAnswers[i]] ?? 'No answer'}`}
                            </p>
                            {!correct && (
                              <p className="text-xs text-darkwood/80 mb-1">
                                <span className="font-semibold">Correct answer:</span> {q.options[q.answer]}
                              </p>
                            )}
                            <p className="text-xs text-darkwood/70 italic">{q.explanation}</p>
                          </div>
                        );
                      })}
                    </div>

                    <button onClick={() => setQuizModule(null)}
                      className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-secondary transition-all">
                      Done
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
