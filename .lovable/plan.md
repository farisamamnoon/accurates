

## Plan: Add Logo + PDF Generation + Move Terms to Bottom

### Overview
1. Copy the uploaded logo to `src/assets/accurate-logo.png` for use in both the website header and generated PDF
2. Install `jspdf` and `jspdf-autotable` for client-side PDF generation
3. Create `src/utils/generatePDF.ts` — builds a professional A4 quotation PDF with logo, header info, items table, totals, and terms at the bottom
4. Update `QuotationForm.tsx`:
   - Display the logo in the website header next to the company name
   - Lift `terms` state up from `TermsSection` so it can be passed to the PDF generator
   - Replace `window.print()` with `generatePDF(header, items, terms)` in `handleSubmit`
   - Ensure Terms & Conditions section stays at the bottom (after the submit button in the form, and at the bottom in the PDF)

### PDF Layout

```text
┌──────────────────────────────────────────┐
│  [LOGO]  ACCURATE MANAGEMENT SYSTEM ...  │  (header with logo)
├──────────────────────────────────────────┤
│  Date: ...    QTN: ...                   │
│  To: ...      Tel: ...                   │
│  Attn: ...    Email: ...                 │
├──┬───────────────┬────┬────┬──────┬──────┤
│# │ Description   │Qty │Unit│Price │Total │
├──┼───────────────┼────┼────┼──────┼──────┤
│  │ ...           │    │    │      │      │
├──┴───────────────┴────┴────┴──────┼──────┤
│                       TOTAL SAR   │      │
│                       VAT 15%     │      │
│                  GRAND TOTAL SAR  │      │
├──────────────────────────────────────────┤
│  Terms & Conditions                      │
│  1. PAYMENT: 100% ADVANCE               │
│  2. VALIDITY: 5 DAYS                     │
└──────────────────────────────────────────┘
```

### Files changed

| File | Change |
|------|--------|
| `src/assets/accurate-logo.png` | Copy uploaded logo |
| `src/utils/generatePDF.ts` | New — builds PDF using jsPDF + autoTable, embeds logo as base64 |
| `src/components/QuotationForm.tsx` | Add logo to header, lift terms state, call `generatePDF()` instead of `window.print()`, reorder Terms section |
| `package.json` | Add `jspdf` and `jspdf-autotable` |

### Technical details
- The logo will be converted to a base64 data URL at build time (Vite handles this for imported images) and embedded in the PDF via `doc.addImage()`
- `jspdf-autotable` handles the items table with column alignment and styling
- Terms appear after the totals section in the PDF, rendered as simple text lines
- On the website, Terms & Conditions section moves below the Submit button

