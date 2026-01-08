# MHA Feature Access Matrix

**Key Principle:** Wellness features are ALWAYS available. Provider features are ADDITIVE.

---

## User Journey

```
User → Wellness Mode (Always Available)
     ↓
     ├─→ Self-Tracking (meds, labs, vitals, care plans)
     ├─→ Optional: Find Provider in Marketplace
     ├─→ Optional: One-Off Consultation
     ├─→ Optional: Temporary Relationship
     └─→ Optional: Make Provider Permanent
```

---

## Feature Access by Relationship Type

| Feature | Wellness Mode | One-Off | Temporary | Permanent |
|---------|--------------|---------|-----------|-----------|
| **Enter Medications** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Track Vitals** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Enter Labs** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Create Care Plans** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **View Medical History** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **AI Assistant** | ✅ Always | ✅ Always | ✅ Always | ✅ Always |
| **Share Data with Provider** | ❌ No provider | ✅ On-demand | ✅ Based on permissions | ✅ Ongoing |
| **Message Provider** | ❌ No provider | ✅ During consultation | ✅ During relationship | ✅ Always |
| **Request Appointments** | ❌ No provider | ✅ One-time | ✅ During relationship | ✅ Always |
| **Request Refills** | ❌ No provider | ❌ One-off only | ✅ During relationship | ✅ Always |
| **Provider Calendar** | ❌ No provider | ❌ One-off only | ⚠️ If enabled | ✅ Always |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ Always | Feature available without restriction |
| ✅ On-demand | Feature available when user initiates |
| ✅ During consultation | Available only during active consultation window |
| ✅ During relationship | Available while relationship is active |
| ⚠️ If enabled | Available if provider has enabled this feature |
| ❌ | Feature not available in this mode |

---

## Relationship Types Explained

| Type | Duration | When to Use |
|------|----------|-------------|
| **Wellness Mode** | Forever | Self-tracking, no provider needed |
| **One-Off** | Single visit | Acute need, second opinion, quick question |
| **Temporary** | Days to weeks | Post-surgery, acute illness, short-term care |
| **Permanent** | Ongoing | Primary care, chronic condition management |

---

## Escalation Path

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Wellness   │ ──→ │   One-Off    │ ──→ │  Temporary   │ ──→ │  Permanent   │
│    Mode      │     │ Consultation │     │ Relationship │     │     PCP      │
├──────────────┤     ├──────────────┤     ├──────────────┤     ├──────────────┤
│ Self-track   │     │ Single visit │     │ Short-term   │     │ Longitudinal │
│ No commitment│     │ No commitment│     │ Can end      │     │ Full access  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       ↑                    ↑                    ↑                    ↑
       │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┘
                    User can always step back down
```

---

*Last Updated: January 9, 2026*
