# Message Translation Flow - MHA ↔ Solopractice

## ✅ Translation Flow Implementation

### Core Principle
**All messages sent TO Solopractice are in English. All messages received FROM Solopractice are translated to the patient's preferred language when displayed in MHA.**

## 🔄 Complete Flow

### 1. Sending Messages (MHA → Solopractice)

```
Patient types/speaks message in foreign language (e.g., Korean, Spanish, Chinese)
    ↓
MHA detects language and translates to English
    ↓
Message sent to Solopractice in English
    ↓
Subject also translated to English
    ↓
detected_language field preserved for reference
    ↓
Solopractice receives message in English ✅
```

**Implementation:**
- `app/messages/new/page.tsx`: Translates `form.message` and `form.subject` to English before sending
- `app/messages/[id]/page.tsx`: Translates reply to English before sending
- Original language is detected and stored in `detected_language` field

### 2. Receiving Messages (Solopractice → MHA)

```
Solopractice sends message in English
    ↓
MHA receives message via API or webhook
    ↓
MHA gets patient's preferred language
    ↓
Message translated from English to patient's preferred language
    ↓
Patient sees message in their preferred language ✅
```

**Implementation:**
- `app/messages/[id]/page.tsx`: Translates care team messages when loading thread
- `app/messages/page.tsx`: Translates message previews in thread list
- `app/api/patient/message/route.ts`: Webhook endpoint translates incoming messages
- Patient's own messages are NOT translated (they're already in their language)

## 📋 Code Locations

### Sending (Translate to English)

1. **New Message** (`app/messages/new/page.tsx`)
   ```typescript
   // Translate message to English before sending
   const { translatedText: englishMessage, detectedLang: lang } = 
     await translateText(form.message, 'en');
   const { translatedText: englishSubject } = 
     await translateText(form.subject, 'en');
   
   // Send English version to Solopractice
   await sendMessageToSolopractice(englishMessage, englishSubject, ...);
   ```

2. **Reply Message** (`app/messages/[id]/page.tsx`)
   ```typescript
   // Translate reply to English before sending
   const { translatedText: englishReply, detectedLang: lang } = 
     await translateText(reply, 'en');
   
   // Send English version to Solopractice
   await sendMessageToSolopractice(englishReply, ...);
   ```

### Receiving (Translate to Patient Language)

1. **Message Detail Page** (`app/messages/[id]/page.tsx`)
   ```typescript
   // Get patient's preferred language
   const preferredLang = user?.preferredLanguage || 'en';
   
   // Translate care team messages (not patient's own)
   if (!isFromPatient && preferredLang !== 'en') {
     const { translatedText } = await translateText(msg.content, preferredLang);
     displayContent = translatedText || msg.content;
   }
   ```

2. **Message List Page** (`app/messages/page.tsx`)
   ```typescript
   // Translate message previews and subjects
   if (!isFromPatient && preferredLang !== 'en') {
     const { translatedText } = await translateText(preview, preferredLang);
     preview = translatedText || preview;
   }
   ```

3. **Webhook Endpoint** (`app/api/patient/message/route.ts`)
   ```typescript
   // Get patient's preferred language
   const preferredLang = patientRow?.preferred_language || 'en';
   
   // Translate message from English to patient's language
   const { translatedText } = await translateText(body.body, preferredLang);
   ```

## 🎯 Key Points

1. **Solopractice Always Receives English**
   - All messages sent to Solopractice are translated to English first
   - This ensures care team can read and respond in English
   - Original language is preserved in `detected_language` field

2. **MHA Always Displays in Patient's Language**
   - Messages from care team (in English) are translated to patient's preferred language
   - Patient's own messages are NOT translated (already in their language)
   - Subject lines are also translated for better UX

3. **Language Detection**
   - Source language is detected when patient types/speaks
   - Detected language is stored but message is sent in English
   - Helps with future improvements and analytics

4. **Translation Service**
   - Uses `translateText()` from `@/lib/utils/translate`
   - Requires `TRANSLATE_API_URL` and `TRANSLATE_API_KEY` environment variables
   - Falls back to original text if translation fails

## ✅ Verification Checklist

- [x] New messages translated to English before sending
- [x] Reply messages translated to English before sending
- [x] Subject lines translated to English before sending
- [x] Care team messages translated to patient language when displayed
- [x] Message previews translated to patient language
- [x] Webhook messages translated to patient language
- [x] Patient's own messages NOT translated (already in their language)
- [x] Language detection preserved for reference

## 📝 Example Flow

**Patient (Korean speaker) sends message:**

1. Patient types: "안녕하세요, 약물에 대해 질문이 있습니다"
2. MHA detects: Korean
3. MHA translates to English: "Hello, I have a question about medication"
4. MHA sends to Solopractice: English version
5. Care team sees: "Hello, I have a question about medication" ✅

**Care team responds:**

1. Care team types: "We can help with that. What medication are you asking about?"
2. Solopractice sends to MHA: English version
3. MHA gets patient's preferred language: Korean
4. MHA translates to Korean: "도와드릴 수 있습니다. 어떤 약물에 대해 질문하시나요?"
5. Patient sees: Korean version ✅

## ✅ Status: COMPLETE

The translation flow is fully implemented. All messages sent to Solopractice are in English, and all messages received from Solopractice are translated to the patient's preferred language when displayed in MHA.

