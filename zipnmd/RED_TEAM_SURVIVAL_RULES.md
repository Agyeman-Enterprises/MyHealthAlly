# MyHealth Ally - Red Team Survival Rules

**Date:** December 2024  
**Status:** 🔴 **IMPLEMENTATION REQUIRED**  
**Purpose:** Protect MHA from hostile investors, regulatory ambushes, misuse, and founder displacement

---

## 🎯 **Core Principle**

**MHA must survive by refusing to become dangerous.**

The companies that die in health tech:
- ❌ Chase speed
- ❌ Sell data
- ❌ Replace humans
- ❌ Overpromise outcomes
- ❌ Let investors rewrite ethics

The ones that survive:
- ✅ Stay narrow
- ✅ Stay boring
- ✅ Stay human-centered
- ✅ Stay legally uninteresting
- ✅ Stay founder-controlled

---

## I. EXISTENTIAL THREATS WE ASSUME ARE REAL

Red Team starts by assuming bad faith exists.

We plan for:
- 🦈 Hostile investors (control grabs, dilution, forced exits)
- 🧨 Scope creep & misuse (MHA used as diagnosis engine or liability sponge)
- ⚖️ Regulatory & legal ambushes (AI + health = target-rich)
- 🧠 Founder displacement (you become "replaceable")
- 🧻 Operational misuse (users ignore safeguards → lawsuits)
- 🧬 Data exploitation (data monetization pressure)

Everything below is designed to neutralize these.

---

## II. GOVERNANCE & CONTROL RULES (ANTI-HOSTILE INVESTOR)

### **Rule 1: Founder Control Is Non-Negotiable**

**Legal/Governance:**
- Dual-class shares OR
- Founder veto on:
  - Data sale
  - Clinical scope changes
  - Model behavior changes
  - Acquisition
  - Board replacement

**Code Implementation:**
- Kill switches require founder/admin authorization
- Data export/deletion requires admin approval
- System mode changes require admin approval

**🛑 If an investor requires operational control → they are a threat actor.**

---

### **Rule 2: MHA Is a Platform, Not a Promise**

**Legally and structurally:**
- MHA never guarantees outcomes
- MHA never replaces clinicians
- MHA never diagnoses
- MHA never prescribes
- MHA = Decision support + education + coordination, always.

**Code Implementation:**
- Disclaimers on all interfaces
- Role clarity in every interaction
- No outcome guarantees in UI copy
- AI advisory boundary enforced

**This prevents:**
- Malpractice liability transfer
- Investor pressure to "automate medicine"
- Regulatory reclassification as a medical device

---

### **Rule 3: Kill Switch Is Mandatory**

**Founder-controlled:**
- Feature kill switch
- API shutoff
- Region-based disable
- Model rollback

**Code Implementation:**
- Enhanced `KillSwitches.kt` with founder authorization
- Admin-only kill switch controls
- Audit logging of all kill switch activations

**If regulators, investors, or partners push unsafe behavior → you pull the plug.**

---

## III. LEGAL & REGULATORY DEFENSE RULES

### **Rule 4: Radical Role Clarity**

**MHA must always declare:**
- "I am not your doctor. I assist you in understanding and navigating care."

**Code Implementation:**
- Disclaimers on every screen
- User acknowledgment required
- Logged user acceptance
- Cannot be bypassed

**Every interface:**
- Reinforces human-in-the-loop
- Requires clinician confirmation
- Logs user acknowledgment

**This protects against:**
- Negligence claims
- Off-label usage lawsuits
- AI misinterpretation cases

---

### **Rule 5: No Autonomous Medical Action**

**Red Team rule:**
- If MHA can act without a human clinician signing off → it's a liability.

**Allowed:**
- ✅ Risk stratification
- ✅ Education
- ✅ Symptom organization
- ✅ Question generation
- ✅ Follow-up reminders

**Forbidden:**
- ❌ Diagnosis
- ❌ Treatment decisions
- ❌ Medication changes
- ❌ Emergency triage without escalation

**Code Implementation:**
- `AiAdvisoryBoundary.kt` enforced everywhere
- Provider approval required for all clinical actions
- No autonomous clinical mutations

---

### **Rule 6: Regulatory Shadow Mode**

**MHA must always be able to operate in:**
- "Educational Mode" - No clinical claims
- "Clinical Support Mode" - With disclaimers
- "Non-medical Wellness Mode" - Wellness only

**Code Implementation:**
- System mode configuration
- Mode-based feature gating
- Mode-based disclaimer display
- Instant mode switching

**If regulators move the goalposts → MHA downgrades mode instantly instead of dying.**

---

## IV. DATA & PRIVACY (ANTI-EXPLOITATION)

### **Rule 7: Data Is Toxic Waste**

**Assume all stored data will be:**
- Subpoenaed
- Breached
- Requested by investors
- Requested by insurers
- Requested by governments

**Therefore:**
- Minimize retention
- Encrypt by default
- Segment by user
- Founder veto on secondary use

**Code Implementation:**
- Automatic data retention policies
- Encryption at rest and in transit
- User data segmentation
- Admin-only data access controls

**🛑 No data resale. Ever.**
**If monetization requires selling data → business model is wrong.**

---

### **Rule 8: Users Own Their Data**

**Explicit rights:**
- Export rights
- Deletion rights
- No dark patterns

**Code Implementation:**
- Data export functionality
- Data deletion functionality
- Clear user controls
- No hidden data retention

**This:**
- Builds trust
- Reduces regulatory risk
- Removes investor leverage ("data is the asset")

---

## V. PRODUCT & USAGE ABUSE DEFENSE

### **Rule 9: Assume Users Will Misuse MHA**

**Red Team assumption:**
- Someone will use MHA instead of seeing a doctor.

**Countermeasures:**
- Friction at critical points
- Clear escalation prompts
- Mandatory "seek care now" triggers
- Logging of ignored warnings

**Code Implementation:**
- Warning dialogs that cannot be skipped
- Escalation prompts logged
- Ignored warnings tracked
- Abuse detection

**This protects you legally and ethically.**

---

### **Rule 10: No One-Size-Fits-All Medicine**

**If MHA starts:**
- Giving generic protocols
- Optimizing for speed over safety
- Reducing nuance
- → You are drifting toward harm.

**MHA must always:**
- Ask clarifying questions
- Flag uncertainty
- Escalate ambiguity

**Code Implementation:**
- Uncertainty flags in AI responses
- Escalation prompts for ambiguous cases
- No generic protocols
- Safety over speed

---

## VI. INVESTOR INTERACTION RULES (RED FLAGS)

### **🚨 Immediate Red Flags**

- "Can we automate clinicians out?"
- "Can we sell insights to pharma/insurers?"
- "Why do we need so many disclaimers?"
- "Can we move faster and ask forgiveness?"
- "Can we reframe this as diagnosis-lite?"

**Any of these = hostile trajectory.**

---

### **Rule 11: Investors Fund Guardrails, Not Shortcuts**

**If an investor:**
- ✅ Respects safety constraints → green
- ⚠️ Pushes growth over safety → yellow
- 🔴 Pushes liability onto founders → red

**MHA survives by being boring, compliant, trusted—not reckless.**

---

## VII. FOUNDER PROTECTION RULES (YOU)

### **Rule 12: You Are Not Replaceable**

**Structurally:**
- Clinical philosophy embedded in charter
- Ethical constraints hard-coded
- Founder knowledge encoded in system design

**If they can remove you without breaking the product → you failed Red Team.**

---

### **Rule 13: Burnout Is a Security Risk**

**Founder exhaustion leads to:**
- Bad compromises
- Investor capture
- Safety erosion

**MHA must be designed so:**
- You can step back
- Systems remain safe
- No single human is a failure point

**Code Implementation:**
- Automated safety checks
- No manual-only processes
- System can operate without founder intervention
- Clear runbooks for all operations

---

## VIII. FINAL RED TEAM COMMANDMENT

**MHA must survive by refusing to become dangerous.**

---

## 📋 **Implementation Checklist**

### **Code Implementation (Can Do Now)**
- [ ] Rule 2: Add disclaimers to all interfaces
- [ ] Rule 3: Enhance kill switches with founder control
- [ ] Rule 4: Add role clarity disclaimers everywhere
- [ ] Rule 5: Enforce AI advisory boundary everywhere
- [ ] Rule 6: Implement regulatory mode switching
- [ ] Rule 7: Add data retention and encryption policies
- [ ] Rule 8: Implement data export and deletion
- [ ] Rule 9: Add misuse detection and warning logging
- [ ] Rule 10: Add uncertainty flags and escalation prompts

### **Legal/Governance (Requires Legal)**
- [ ] Rule 1: Founder control in corporate charter
- [ ] Rule 11: Investor agreement terms
- [ ] Rule 12: Founder protection in charter
- [ ] Rule 13: Operational documentation

---

**Last Updated:** December 2024  
**Status:** 🔴 Implementation Required
