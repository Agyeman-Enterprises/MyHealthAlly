# Red Team Survival Rules - Implementation Guide

**Date:** December 2024  
**Status:** Core modules implemented, integration in progress

---

## 📋 **What's Been Implemented**

### **Core Governance Modules**

1. **`RoleClarity.kt`** - Rule 4: Radical Role Clarity
   - Standard disclaimers
   - Emergency disclaimers
   - AI advisory disclaimers
   - User acknowledgment logging

2. **`RegulatoryMode.kt`** - Rule 6: Regulatory Shadow Mode
   - Three operational modes
   - Feature gating by mode
   - Mode switching with audit logging
   - Automatic downgrade capability

3. **`DataOwnership.kt`** - Rule 7 & 8: Data Control
   - Data retention policies
   - Export functionality (structure)
   - Deletion functionality (structure)
   - Secondary use veto

4. **`MisuseDetection.kt`** - Rule 9: Assume Users Will Misuse
   - Ignored warning tracking
   - Escalation prompt logging
   - Abuse detection

5. **`FounderControl.kt`** - Rule 1 & 3: Founder Control & Kill Switches
   - Kill switch activation with authorization
   - Data sale veto
   - Clinical scope change veto

6. **`UncertaintyFlags.kt`** - Rule 10: No One-Size-Fits-All
   - Uncertainty detection
   - Escalation prompts
   - Ambiguity handling

7. **UI Components**
   - `DisclaimerBanner.kt` (Android)
   - `DisclaimerBanner.tsx` (PWA)

---

## 🔧 **Integration Checklist**

### **Android App**

#### **Add Disclaimers to Screens**
- [ ] `VoiceRecordingScreen.kt` - Add disclaimer banner
- [ ] `VitalsScreen.kt` - Add disclaimer banner
- [ ] `MedicationsScreen.kt` - Add disclaimer banner
- [ ] `DashboardScreen.kt` - Add disclaimer banner
- [ ] All clinical screens

#### **Add Misuse Detection**
- [ ] Message sending - Log ignored warnings
- [ ] Refill requests - Log ignored warnings
- [ ] Emergency symptoms - Log escalation prompts
- [ ] Critical vitals - Log escalation prompts

#### **Add Regulatory Mode Checks**
- [ ] Check mode before showing features
- [ ] Gate features by mode
- [ ] Show mode-appropriate disclaimers

#### **Add Uncertainty Flags**
- [ ] AI responses - Flag uncertainty
- [ ] Vital interpretations - Flag uncertainty
- [ ] Medication suggestions - Flag uncertainty

### **PWA**

#### **Add Disclaimers to Pages**
- [x] `dashboard/page.tsx` - Added
- [x] `messages/[id]/page.tsx` - Added
- [x] `vitals/page.tsx` - Added
- [x] `medications/page.tsx` - Added
- [ ] All provider pages
- [ ] All clinical pages

#### **Add Misuse Detection**
- [ ] Message sending - Log ignored warnings
- [ ] Refill requests - Log ignored warnings
- [ ] Emergency symptoms - Log escalation prompts

#### **Add Regulatory Mode Checks**
- [ ] Check mode before showing features
- [ ] Gate features by mode
- [ ] Show mode-appropriate disclaimers

---

## 📝 **Code Examples**

### **Adding Disclaimer to Android Screen**

```kotlin
@Composable
fun YourScreen() {
    Column {
        // Rule 4: Radical Role Clarity
        DisclaimerBanner(
            disclaimerType = DisclaimerType.STANDARD,
            modifier = Modifier.padding(16.dp)
        )
        
        // Rest of your screen content
    }
}
```

### **Adding Misuse Detection**

```kotlin
// When user ignores warning
scope.launch {
    misuseDetection.logIgnoredWarning(
        userId = userId,
        patientId = patientId,
        warningType = WarningType.EMERGENCY_SYMPTOMS,
        warningText = "Emergency symptoms detected. Please call 911.",
        context = "Message sending"
    )
}
```

### **Checking Regulatory Mode**

```kotlin
// Before showing feature
val mode = RegulatoryMode.current()
if (!RegulatoryMode.isFeatureAllowed(mode, ClinicalFeature.CLINICAL_MESSAGING)) {
    // Show mode-appropriate message
    return
}
```

### **Flagging Uncertainty**

```kotlin
scope.launch {
    UncertaintyFlags.flagUncertainty(
        context = "Vital interpretation",
        uncertaintyType = UncertaintyType.AMBIGUOUS_SYMPTOMS,
        details = mapOf(
            "patient_id" to patientId,
            "vital_type" to "blood_pressure",
            "value" to "180/120"
        ),
        auditLogger = auditLogger
    )
    
    if (UncertaintyFlags.requiresEscalation(UncertaintyType.AMBIGUOUS_SYMPTOMS)) {
        val prompt = UncertaintyFlags.getEscalationPrompt(UncertaintyType.AMBIGUOUS_SYMPTOMS)
        // Show escalation prompt to user
    }
}
```

---

## 🎯 **Priority Integration Points**

### **Critical (Do First)**
1. Add disclaimers to all clinical screens
2. Add misuse detection to message sending
3. Add misuse detection to refill requests
4. Add regulatory mode checks to feature access

### **High Priority**
5. Add uncertainty flags to AI responses
6. Add data export/deletion UI
7. Add friction at critical points (cannot skip warnings)

### **Medium Priority**
8. Add clarifying questions
9. Enhance kill switches
10. Automatic data cleanup

---

## ⚖️ **Legal/Governance (Requires Attorney)**

### **Corporate Charter**
- [ ] Founder control provisions
- [ ] Founder veto rights
- [ ] Clinical philosophy embedded
- [ ] Ethical constraints hard-coded

### **Investor Agreements**
- [ ] Red flag detection terms
- [ ] Safety-first investment terms
- [ ] No data sale provisions

### **Operational Documentation**
- [ ] Runbooks for all operations
- [ ] Alert escalation procedures
- [ ] Incident response procedures
- [ ] No single human failure point

---

**Last Updated:** December 2024  
**Status:** Core modules ready, integration required
