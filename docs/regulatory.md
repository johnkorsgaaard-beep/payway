# Payway - Regulatory & Stripe Analysis

## Regulatory Framework (Faroe Islands)

### Key Findings

The Faroe Islands are an autonomous territory within the Kingdom of Denmark but are **NOT part of the EU/EEA**. This has implications for financial regulation:

1. **PSD2**: The EU Payment Services Directive (PSD2) does not directly apply to the Faroe Islands. However, Danish financial legislation often extends partially to the Faroe Islands through bilateral agreements.

2. **Finanstilsynet (Danish FSA)**: The Danish Financial Supervisory Authority oversees financial regulation in Denmark. For the Faroe Islands, financial supervision may fall under the Faroese government's own authority (Landsstýrið).

3. **E-Money License**: Operating a wallet-based payment service likely requires an e-money license or equivalent. Two practical approaches:
   - **Option A (Recommended)**: Register the company in Denmark, obtain an e-money license from the Danish Finanstilsynet, and serve Faroese customers from a Danish legal entity.
   - **Option B**: Apply for authorization under Faroese law — requires legal counsel familiar with Faroese financial regulation.

4. **KYC/AML**: Anti-money laundering regulations apply regardless. All users must be verified. Implement tiered KYC:
   - **Tier 1** (basic): Phone number + name — low transaction limits (e.g., 5,000 DKK/month)
   - **Tier 2** (verified): Government ID upload — full transaction limits

### Recommended Actions Before Launch

- [ ] Engage a Danish/Faroese financial regulatory lawyer
- [ ] Determine if a Danish e-money license covers Faroese operations
- [ ] Establish AML compliance procedures
- [ ] Set up KYC verification flow (tiered approach)

---

## Stripe Connect Analysis

### Platform Setup

**Recommended approach**: Register the Stripe platform account in **Denmark** (supported Stripe country, EEA member). This provides:

- Full Stripe Connect functionality
- DKK as settlement currency
- EEA cross-border payout support

### Faroese Bank Accounts

Faroese banks (BankNordik, Betri Banki) use **Danish IBAN format** (DK prefix) and operate within the Danish banking infrastructure. This means:

- Payouts to Faroese bank accounts should work via Danish Stripe, as IBAN format is compatible
- Settlement in DKK is natively supported
- Standard Stripe Denmark fees apply (1.5% + 1.80 DKK for European cards)

### Connect Architecture

- **Platform**: Danish Stripe account (processes all charges)
- **Connected Accounts (Merchants)**: Stripe Express or Custom accounts for each merchant
- **Wallet Top-ups**: Direct charges to platform account
- **Merchant Payouts**: Transfers to connected accounts, then automatic payout to bank

### Fees

| Operation | Stripe Fee | Payway Fee (configurable) |
|-----------|-----------|--------------------------|
| Wallet top-up (card charge) | ~1.5% + 1.80 DKK | 0-1% |
| Merchant payout | Included in charge fee | 1-2% |
| Cross-border (if applicable) | +0.25% | Pass-through |

### Verified: Stripe Supports

- [x] Denmark as platform country
- [x] DKK currency
- [x] IBAN-based payouts (DK format)
- [x] Stripe Connect (Express + Custom accounts)
- [x] Card payments (Visa, Mastercard)
- [ ] Confirm: Faroese IBANs accepted (test required with Stripe support)
