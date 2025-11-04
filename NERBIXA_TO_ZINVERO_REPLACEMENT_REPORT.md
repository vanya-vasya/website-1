# Nerbixa → Zinvero Global Replacement Report
**Generated:** October 31, 2025  
**Status:** DRY RUN - AWAITING APPROVAL

---

## Executive Summary

**Total Matches Found:** 588 occurrences across 88 files  
**Search Scope:** Entire workspace excluding node_modules and binary files  
**Search Type:** Case-insensitive with variant detection

### Match Distribution by Category

| Category | Files | Occurrences | Priority |
|----------|-------|-------------|----------|
| **Production Code** | 17 | ~35 | 🔴 **CRITICAL** |
| **Documentation** | 60 | 480+ | 🟡 **MEDIUM** |
| **Test Files** | 7 | ~40 | 🟢 **LOW** |
| **Scripts** | 3 | ~15 | 🟡 **MEDIUM** |
| **Configuration** | 1 | 2 | 🟡 **MEDIUM** |

---

## 🔴 CRITICAL: Production Code Files (Requires Immediate Action)

### 1. Component Files - Logo/Icon References

#### **`components/landing/footer.tsx`**
**Lines:** 74, 216  
**Occurrences:** 2

```diff
Line 74:
- <Image width={"98"} height={"39"} src="/logos/nerbixa-logo.png" alt="Nerbixa Logo" />
+ <Image width={"98"} height={"39"} src="/logos/zinvero-logo.png" alt="Zinvero Logo" />

Line 216:
- Nerbixa, Copyright © {year}. All Rights Reserved.
+ Zinvero, Copyright © {year}. All Rights Reserved.
```

#### **`components/pdf/receipt.tsx`**
**Lines:** 143  
**Occurrences:** 1

```diff
Line 143:
- logo: "./public/logos/nerbixa-logo.png",
+ logo: "./public/logos/zinvero-logo.png",
```

#### **`components/ui/empty.tsx`**
**Lines:** 15  
**Occurrences:** 1

```diff
Line 15:
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/bot-avatar.tsx`**
**Lines:** 6  
**Occurrences:** 1

```diff
Line 6:
- <AvatarImage className="p-1" src="/logos/nerbixa-icon.png" />
+ <AvatarImage className="p-1" src="/logos/zinvero-icon.png" />
```

#### **`components/ui/bot-avatar.tsx`**
**Lines:** ~6  
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/ui/ChatInterface.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/sidebar.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/shared/TransformedImage.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/shared/MediaUploader.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/pro-modal.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/main-nav.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/loader.tsx`**
**Occurrences:** 2

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/landing/header.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-logo.png"
+ src="/logos/zinvero-logo.png"
```

#### **`components/landing-navbar.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/guest-sidebar.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/guest-mobile-sidebar.tsx`**
**Occurrences:** 1

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

#### **`components/mobile-nav.tsx`**
**Occurrences:** 2

```diff
- src="/logos/nerbixa-icon.png"
+ src="/logos/zinvero-icon.png"
```

### 2. Layout and Metadata

#### **`app/layout.tsx`**
**Lines:** 37, 55, 66  
**Occurrences:** 3

```diff
Line 37:
- url: "/logos/nerbixa-icon.png",
+ url: "/logos/zinvero-icon.png",

Line 55:
- url: "/logos/nerbixa-icon.png",
+ url: "/logos/zinvero-icon.png",

Line 66:
- images: ["/logos/nerbixa-icon.png"],
+ images: ["/logos/zinvero-icon.png"],
```

### 3. Configuration Files

#### **`public/site.webmanifest`**
**Lines:** 17  
**Occurrences:** 1

```diff
Line 17:
- "src": "/logos/nerbixa-icon.png",
+ "src": "/logos/zinvero-icon.png",
```

#### **`public/browserconfig.xml`**
**Lines:** 5  
**Occurrences:** 1

```diff
Line 5:
- <square150x150logo src="/logos/nerbixa-icon.png"/>
+ <square150x150logo src="/logos/zinvero-icon.png"/>
```

#### **`package-lock.json`**
**Occurrences:** 2

```diff
- "name": "nerbixa"
+ "name": "zinvero"
```

---

## 🟡 MEDIUM PRIORITY: Scripts and Test Files

### Scripts

#### **`test-secure-processor-webhook-manual.sh`**
**Lines:** 18, 36, 46  
**Occurrences:** 3

```diff
Line 18:
- "description": "Nerbixa Generations Purchase (50 Tokens)",
+ "description": "Zinvero Generations Purchase (50 Tokens)",

Line 36:
- echo "URL: https://www.nerbixa.com/api/webhooks/secure-processor"
+ echo "URL: https://www.zinvero.com/api/webhooks/secure-processor"

Line 46:
- https://www.nerbixa.com/api/webhooks/secure-processor)
+ https://www.zinvero.com/api/webhooks/secure-processor)
```

#### **`scripts/verify-webhook-production.ts`**
**Occurrences:** 3

#### **`scripts/diagnose-payment-redirect.ts`**
**Occurrences:** 3

### Test Files

#### **`__tests__/integration/payment-dashboard-redirect.integration.test.ts`**
**Occurrences:** 21

#### **`__tests__/integration/secure-processor-webhook.integration.test.ts`**
**Occurrences:** 1

#### **`__tests__/integration/navigation.test.ts`**
**Occurrences:** 2

#### **`__tests__/e2e/payment-redirect.e2e.test.ts`**
**Occurrences:** 7

#### **`__tests__/e2e/payment-dashboard-redirect.e2e.test.ts`**
**Occurrences:** 3

#### **`__tests__/unit/token-topup.test.ts`**
**Occurrences:** 1

#### **`__tests__/README.md`**
**Occurrences:** 1

---

## 🟢 LOW PRIORITY: Documentation Files

### Recently Created Migration Reports

- `DOMAIN_MIGRATION_REPORT.md` - **95 occurrences**
- `_scan/FINAL_REBRAND_REPORT.md` - **17 occurrences**
- `_scan/replacement_report.json` - **71 occurrences**
- `_scan/global_replace.diff` - **28 occurrences**

### Implementation Guides

- `docs/TOKEN_TOPUP_INTEGRATION_GUIDE.md` - **11 occurrences**
- `docs/TOKEN_TOPUP_IMPLEMENTATION_SUMMARY.md` - **6 occurrences**
- `README_WEBHOOK_IMPLEMENTATION.md` - **1 occurrence**

### Webhook Documentation

- `WEBHOOK_QUICK_FIX_GUIDE.md` - **4 occurrences**
- `WEBHOOK_NOT_RECEIVED_DIAGNOSTIC.md` - **8 occurrences**
- `WEBHOOK_FIX_EXECUTION_RESULTS.md` - **5 occurrences**
- `WEBHOOK_DIAGNOSTIC_IMPLEMENTATION_SUMMARY.md` - **3 occurrences**
- `WEBHOOK_DIAGNOSTIC_FINAL_REPORT.md` - **9 occurrences**
- `WEBHOOK_COMPLETE_FIX_SUMMARY.md` - **6 occurrences**

### Payment Documentation

- `PAYMENT_TEST_MODE_QUICKSTART.md` - **1 occurrence**
- `PAYMENT_TEST_MODE_INVESTIGATION.md` - **3 occurrences**
- `PAYMENT_TEST_MODE_DIAGNOSTIC_FLOW.md` - **3 occurrences**
- `PAYMENT_REDIRECT_TO_DASHBOARD.md` - **11 occurrences**
- `PAYMENT_REDIRECT_QUICKSTART.md` - **3 occurrences**
- `PAYMENT_REDIRECT_IMPLEMENTATION.md` - **3 occurrences**
- `PAYMENT_REDIRECT_FIX_SUMMARY.md` - **4 occurrences**
- `PAYMENT_REDIRECT_DIAGNOSTIC_REPORT.md` - **10 occurrences**
- `PAYMENT_REDIRECT_COMPLETE_SOLUTION.md` - **18 occurrences**
- `PAYMENT_FLOW_QUICK_REFERENCE.md` - **2 occurrences**
- `PAYMENT_FLOW_FIXED.md` - **1 occurrence**
- `PAYMENT_FIXES_COMPLETE.md` - **11 occurrences**
- `PAYMENT_DASHBOARD_REDIRECT_IMPLEMENTATION.md` - **11 occurrences**
- `PAYMENT_DASHBOARD_REDIRECT.md` - **13 occurrences**

### Network Configuration

- `SECURE_PROCESSOR_WEBHOOK_FIX_SUMMARY.md` - **7 occurrences**
- `SECURE_PROCESSOR_ENV_SETUP.md` - **4 occurrences**

### Git and Deployment

- `GIT_PUSH_WEBSITE_2_SUCCESS.md` - **3 occurrences**
- `GIT_PUSH_WEBHOOK_FIX_SUMMARY.md` - **1 occurrence**
- `GIT_PUSH_SUMMARY_WEBSITE_1.md` - **2 occurrences**
- `GIT_PUSH_SUCCESS_SUMMARY.md` - **1 occurrence**
- `GIT_PUSH_COMPLETE_PROJECT_GUIDE.md` - **1 occurrence**
- `GIT_CONFIGURATION.md` - **1 occurrence**
- `GIT_BRANCH_WEBHOOK_FIXES_SUMMARY.md` - **5 occurrences**
- `DEPLOYMENT_STEPS.md` - **2 occurrences**
- `FINAL_DEPLOYMENT_SUMMARY.md` - **1 occurrence**

### Icon and UI

- `ICON_UPDATE_SUMMARY.md` - **12 occurrences**
- `ICON_REPLACEMENT_CHANGELOG.md` - **17 occurrences**
- `ICON_MIGRATION_COMPLETE.md` - **17 occurrences**
- `FAVICON_UPDATE_SUMMARY.md` - **15 occurrences**

### Other Documentation

- `RELEASE_V1.0_SUMMARY.md` - **20 occurrences**
- `QUICK_START_TOKEN_TOPUP.md` - **8 occurrences**
- `QUICK_START_GIT.md` - **2 occurrences**
- `POST_TRANSACTION_FIX_SUMMARY.md` - **6 occurrences**
- `POST_TRANSACTION_FIX_ANALYSIS.md` - **6 occurrences**
- `NAVIGATION_FIXES_DOCUMENTATION.md` - **3 occurrences**
- `INVESTIGATION_DELIVERABLES_SUMMARY.md` - **1 occurrence**
- `FIX_CLERK_WEBHOOK_CHECKLIST.md` - **5 occurrences**
- `VERCEL_ENV_SETUP.md` - **4 occurrences**
- `URGENT_FIX_VLADIMIR_USER.md` - **3 occurrences**
- `CONVERSATION_API_500_ERROR_FIX.md` - **1 occurrence**
- `CLERK_WEBHOOK_SETUP_README.md` - **5 occurrences**
- `DIAGNOSTIC_REPORT_USER_TRANSACTION_WRITES.md` - **1 occurrence**
- `check-webhook-logs.md` - **1 occurrence**

---

## ⚠️ IMPORTANT PREREQUISITE: File System Changes Required

### Logo Files Must Be Renamed

**Current Logo Files:**
```
/public/logos/nerbixa-logo.png
/public/logos/nerbixa-icon.png
```

**Required New Names:**
```
/public/logos/zinvero-logo.png
/public/logos/zinvero-icon.png
```

**Action Required:** Before applying code changes, either:
1. **Rename the logo files** to match the new references
2. **Or** keep old filenames and skip logo path replacements (not recommended)

---

## Replacement Strategy

### Phase 1: Critical Files (MUST DO)
1. ✅ Component files (17 files)
2. ✅ App layout metadata (1 file)
3. ✅ Configuration files (2 files)

### Phase 2: Scripts & Tests (RECOMMENDED)
1. ✅ Shell scripts (3 files)
2. ✅ Test files (7 files)

### Phase 3: Documentation (OPTIONAL)
1. ⚠️ Keep for historical reference OR
2. ✅ Update for consistency

---

## Replacement Rules

### Case Preservation
- `nerbixa` → `zinvero`
- `Nerbixa` → `Zinvero`
- `NERBIXA` → `ZINVERO`
- `nerbixa.com` → `zinvero.com`
- `www.nerbixa.com` → `www.zinvero.com`
- `support@nerbixa.com` → `support@zinvero.com`
- `noreply@nerbixa.com` → `noreply@zinvero.com`

### File Paths
- `/logos/nerbixa-logo.png` → `/logos/zinvero-logo.png`
- `/logos/nerbixa-icon.png` → `/logos/zinvero-icon.png`

---

## Exclusions

The following are automatically excluded:
- ✅ `node_modules/`
- ✅ `.git/`
- ✅ Binary files
- ✅ `.next/` build output
- ✅ `dist/` directories

---

## Risk Assessment

### 🟢 LOW RISK
- Documentation files
- Test files
- Comments in code

### 🟡 MEDIUM RISK
- Configuration files (requires validation)
- Shell scripts (requires testing)
- Package metadata

### 🔴 HIGH RISK
- Component files (UI may break if logo files don't exist)
- Layout metadata (affects SEO and social sharing)
- Receipt generation (affects customer-facing documents)

---

## Validation Checklist

After replacement, the following must be validated:

### Build & Tests
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run test:ci` passes
- [ ] TypeScript compilation succeeds

### Visual Verification
- [ ] Landing page footer displays correctly
- [ ] Dashboard sidebar shows correct logo
- [ ] Empty states show correct icon
- [ ] Bot avatar displays correctly
- [ ] Receipt PDF generates correctly

### Functional Testing
- [ ] Payment receipts generate with correct branding
- [ ] Social media sharing shows correct metadata
- [ ] PWA manifest works correctly
- [ ] Browser config tiles show correct icon

### External Services
- [ ] Update Clerk webhook URLs
- [ ] Update Secure-processor webhook URLs
- [ ] Update payment gateway URLs
- [ ] Update email service sender addresses

---

## Backup Strategy

### Git Backup
1. Create branch: `migration/nerbixa-to-zinvero-final`
2. Commit all current changes
3. Apply replacements
4. Test thoroughly
5. Create PR with detailed changelist

### File Backup
Before replacement:
```bash
# Create timestamped backup
tar -czf backup-nerbixa-references-$(date +%Y%m%d-%H%M%S).tar.gz \
  components/ app/ public/ scripts/ __tests__/
```

---

## Deployment Plan

### Step 1: Pre-Deployment
1. ✅ Rename logo files in `/public/logos/`
2. ✅ Apply all code replacements
3. ✅ Run full test suite
4. ✅ Build and verify locally

### Step 2: Staging Deployment
1. ✅ Deploy to staging/preview environment
2. ✅ Visual regression testing
3. ✅ Test all payment flows
4. ✅ Test webhook endpoints

### Step 3: Production Deployment
1. ✅ Deploy to production
2. ✅ Monitor error logs
3. ✅ Test payment flow
4. ✅ Verify receipts

### Step 4: External Service Updates
1. ✅ Update Clerk webhooks
2. ✅ Update Secure-processor webhooks
3. ✅ Update DNS if needed
4. ✅ Update email service

---

## Rollback Plan

If issues are discovered:

1. **Immediate:** Revert deployment via Vercel dashboard
2. **Code:** `git revert <commit-hash>` and redeploy
3. **Assets:** Restore logo files from backup
4. **External Services:** Revert webhook URLs

---

## Recommendations

### ✅ DO
1. Apply replacements to **all production code** (Phase 1)
2. Apply replacements to **scripts and tests** (Phase 2)
3. Rename logo files **before** applying code changes
4. Create comprehensive PR with changelist
5. Deploy to staging first

### ⚠️ CONSIDER
1. Updating documentation files (Phase 3) - helpful for future reference
2. Archiving old documentation to `_archive/` folder
3. Creating a migration summary document

### ❌ DON'T
1. Apply replacements without renaming logo files first
2. Skip testing after replacements
3. Deploy directly to production
4. Delete old documentation (keep for reference)

---

## Next Steps

### Option A: Full Replacement (Recommended)
```bash
# 1. Rename logo files first
mv public/logos/nerbixa-logo.png public/logos/zinvero-logo.png
mv public/logos/nerbixa-icon.png public/logos/zinvero-icon.png

# 2. Apply code replacements (awaiting your approval)
# 3. Test locally
# 4. Create PR
# 5. Deploy to staging
# 6. Deploy to production
```

### Option B: Selective Replacement
```bash
# Apply only to critical production code
# Keep documentation as-is for historical reference
```

### Option C: Manual Review
```bash
# Review each file individually
# Decide on a case-by-case basis
```

---

## Approval Required

Please review this report and confirm:

1. ✅ Approve full replacement (Option A) - **RECOMMENDED**
2. ⚠️ Approve selective replacement (Option B)
3. 📋 Request manual review (Option C)

Once approved, I will:
1. Rename logo files
2. Apply all replacements to production code
3. Run tests and validation
4. Generate final changelist
5. Create PR with detailed documentation

---

**Report End**

*Generated by AI Assistant on October 31, 2025*

