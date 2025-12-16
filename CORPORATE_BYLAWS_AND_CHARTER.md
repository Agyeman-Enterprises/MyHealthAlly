# MyHealth Ally - Corporate Bylaws and Operating Charter

**Date:** December 2024  
**Status:** 🔴 **DRAFT - REQUIRES LEGAL REVIEW**  
**Purpose:** Founder control, ethical constraints, and operational governance

---

## ⚠️ **LEGAL NOTICE**

**This document is a DRAFT template based on Red Team Survival Rules.**  
**MUST be reviewed and finalized by a qualified corporate attorney before adoption.**

---

## I. FOUNDER CONTROL PROVISIONS

### **Section 1.1: Founder Veto Rights**

The Founder shall have absolute veto power over the following actions, which require Founder approval:

1. **Data Sale or Monetization**
   - Any sale, licensing, or monetization of patient data
   - Any data sharing agreements with third parties
   - Any change to data retention or privacy policies

2. **Clinical Scope Changes**
   - Any expansion of clinical capabilities beyond current scope
   - Any feature that could be interpreted as diagnosis or treatment
   - Any change to AI model behavior or clinical decision support

3. **Model Behavior Changes**
   - Any modification to AI/ML models that affect clinical outputs
   - Any change to clinical governance rules (CG-1 through CG-5)
   - Any modification to safety or compliance features

4. **Acquisition or Merger**
   - Any acquisition offer or merger proposal
   - Any change in corporate control
   - Any sale of substantial assets

5. **Board Replacement**
   - Any removal or replacement of Founder from Board
   - Any change to Board composition that reduces Founder control
   - Any change to voting rights or share structure

### **Section 1.2: Dual-Class Share Structure (Alternative)**

If dual-class shares are implemented:
- **Class A (Founder Shares):** 10 votes per share
- **Class B (Investor Shares):** 1 vote per share
- Founder must maintain >50% of voting control

### **Section 1.3: Founder Irreplaceability**

The Founder's clinical philosophy, ethical constraints, and operational knowledge are embedded in:
- Corporate charter (this document)
- System architecture and code
- Operational runbooks
- Clinical governance rules

**If the Founder can be removed without breaking the product, the system has failed.**

---

## II. CLINICAL PHILOSOPHY (HARD-CODED)

### **Section 2.1: Platform, Not Promise**

MyHealth Ally is legally and structurally defined as:
- ✅ A patient engagement platform
- ✅ Decision support and education tool
- ✅ Care coordination platform
- ❌ NOT a medical device
- ❌ NOT a diagnostic tool
- ❌ NOT a treatment provider
- ❌ NOT a replacement for clinicians

### **Section 2.2: No Autonomous Medical Action**

MyHealth Ally may:
- ✅ Suggest risk stratification
- ✅ Provide education
- ✅ Organize symptoms
- ✅ Generate questions
- ✅ Send follow-up reminders

MyHealth Ally may NOT:
- ❌ Finalize diagnoses
- ❌ Make treatment decisions
- ❌ Change medications autonomously
- ❌ Provide emergency triage without escalation

### **Section 2.3: Human-in-the-Loop Requirement**

All clinical decisions require:
- Explicit provider approval
- Logged provider action (accepted, modified, rejected)
- Audit trail of all AI suggestions and provider responses

---

## III. DATA GOVERNANCE

### **Section 3.1: Data Is Toxic Waste**

**Principle:** Assume all stored data will be subpoenaed, breached, or requested.

**Requirements:**
- Minimize data retention (see retention policies)
- Encrypt by default (at rest and in transit)
- Segment data by user
- Founder veto on secondary use

### **Section 3.2: No Data Resale**

**PROHIBITED:**
- Sale of patient data
- Licensing of patient data
- Data monetization
- Sharing with third parties for commercial purposes

**If monetization requires selling data → business model is wrong.**

### **Section 3.3: Users Own Their Data**

**Required:**
- Explicit export rights (GDPR, CCPA compliance)
- Explicit deletion rights
- No dark patterns
- Clear user controls

### **Section 3.4: Data Retention Policies**

- **Messages:** 90 days
- **Vitals:** 365 days
- **Medications:** 730 days (regulatory requirement)
- **Audit Logs:** 2555 days (7 years, HIPAA requirement)
- **Temp Data:** 1 day

---

## IV. REGULATORY COMPLIANCE

### **Section 4.1: Regulatory Shadow Mode**

MyHealth Ally must operate in one of three modes:

1. **Educational Mode**
   - No clinical claims
   - Educational content only
   - No clinical support features

2. **Clinical Support Mode**
   - Full clinical support with disclaimers
   - All features available
   - Standard operational mode

3. **Wellness Only Mode**
   - General wellness information only
   - No medical condition support
   - Non-clinical features only

**If regulators change rules → MHA downgrades mode instantly instead of dying.**

### **Section 4.2: Kill Switch Authority**

The Founder (or designated admin) has authority to:
- Activate feature kill switches
- Shut off API endpoints
- Disable by region
- Roll back model versions

**If regulators, investors, or partners push unsafe behavior → pull the plug.**

---

## V. INVESTOR INTERACTION RULES

### **Section 5.1: Red Flags**

**Immediate red flags (hostile trajectory):**
- "Can we automate clinicians out?"
- "Can we sell insights to pharma/insurers?"
- "Why do we need so many disclaimers?"
- "Can we move faster and ask forgiveness?"
- "Can we reframe this as diagnosis-lite?"

**Any of these = hostile trajectory. Terminate discussions.**

### **Section 5.2: Investor Requirements**

**Investors must:**
- ✅ Respect safety constraints
- ✅ Fund guardrails, not shortcuts
- ✅ Understand that MHA survives by being boring, compliant, trusted
- ❌ NOT push growth over safety
- ❌ NOT push liability onto founders

**If an investor pushes unsafe behavior → they are a threat actor.**

---

## VI. OPERATIONAL GOVERNANCE

### **Section 6.1: No Single Human Failure Point**

**System must be designed so:**
- Founder can step back
- Systems remain safe
- No single human is a failure point
- Automated safety checks
- Clear runbooks for all operations

### **Section 6.2: Burnout Is a Security Risk**

**Founder exhaustion leads to:**
- Bad compromises
- Investor capture
- Safety erosion

**System must operate safely without founder intervention.**

### **Section 6.3: Operational Documentation**

**Required:**
- Runbooks for all operations
- Alert escalation procedures
- Incident response procedures
- No "wait for founder" dependencies

---

## VII. AMENDMENT PROCEDURES

### **Section 7.1: Amendment Requirements**

This charter may only be amended with:
- Founder approval (absolute veto)
- Board supermajority (if applicable)
- Legal review
- Documentation of rationale

### **Section 7.2: Non-Amendable Provisions**

**The following provisions CANNOT be amended:**
- Founder veto rights (Section 1.1)
- Platform, Not Promise (Section 2.1)
- No Data Resale (Section 3.2)
- Kill Switch Authority (Section 4.2)

---

## VIII. ENFORCEMENT

### **Section 8.1: Violation Consequences**

Violations of this charter:
- Trigger immediate kill switch activation
- Require Founder intervention
- May result in termination of relationships
- Must be documented in audit logs

### **Section 8.2: Legal Defensibility**

This charter is designed for:
- Legal defensibility in court
- Regulatory compliance
- Investor protection
- Founder protection

---

## IX. DEFINITIONS

**Founder:** [FOUNDER NAME]  
**Company:** MyHealth Ally, Inc.  
**Platform:** MyHealth Ally patient engagement platform  
**Clinical Governance Rules:** CG-1 through CG-5 as defined in system documentation

---

## X. ACKNOWLEDGMENT

**By adopting this charter, the Board and Company acknowledge:**
- Founder control is non-negotiable
- Safety and compliance override growth
- Data is toxic waste, not an asset
- MHA survives by refusing to become dangerous

---

**Last Updated:** December 2024  
**Status:** 🔴 DRAFT - REQUIRES LEGAL REVIEW  
**Next Step:** Review with corporate attorney and finalize
