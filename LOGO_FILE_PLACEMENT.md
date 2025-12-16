# Logo File Placement - Quick Reference

**Where to put your logo files once you have them**

---

## 📂 **PWA Logo Files**

Put these files in: `c:\DEV\myHealthAlly\pwa\public\`

```
pwa/public/
├── favicon.ico              ← Browser tab icon
├── icon-192x192.png         ← PWA icon (small)
├── icon-512x512.png         ← PWA icon (large)
├── apple-touch-icon.png     ← iOS home screen (180x180)
└── logo.svg                 ← Optional: Header logo
```

**Files are already configured in:**
- ✅ `manifest.json` (references icon-192x192.png and icon-512x512.png)
- ✅ `app/layout.tsx` (references favicon.ico and apple-touch-icon.png)

---

## 📱 **Android Logo Files**

Put these files in: `c:\DEV\myHealthAlly\app\src\main\res\`

**You'll need to create these directories first:**

```
app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png          (48x48)
│   └── ic_launcher_round.png    (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png          (72x72)
│   └── ic_launcher_round.png    (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png          (96x96)
│   └── ic_launcher_round.png    (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png          (144x144)
│   └── ic_launcher_round.png    (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png          (192x192)
    └── ic_launcher_round.png    (192x192)
```

**Minimum required:** Just place `ic_launcher.png` files in each `mipmap-*` folder.

---

## ✅ **Quick Checklist**

### **PWA (5 files)**
- [ ] `favicon.ico` → `pwa/public/`
- [ ] `icon-192x192.png` → `pwa/public/`
- [ ] `icon-512x512.png` → `pwa/public/`
- [ ] `apple-touch-icon.png` → `pwa/public/`
- [ ] (Optional) `logo.svg` → `pwa/public/`

### **Android (5-10 files)**
- [ ] Create `mipmap-mdpi/` folder
- [ ] Create `mipmap-hdpi/` folder
- [ ] Create `mipmap-xhdpi/` folder
- [ ] Create `mipmap-xxhdpi/` folder
- [ ] Create `mipmap-xxxhdpi/` folder
- [ ] Place `ic_launcher.png` in each folder (5 files)
- [ ] (Optional) Place `ic_launcher_round.png` in each folder (5 files)

---

## 🎨 **Logo Specifications**

### **PWA**
- **favicon.ico**: Multi-size ICO (16x16, 32x32, 48x48)
- **icon-192x192.png**: 192x192 PNG, transparent background
- **icon-512x512.png**: 512x512 PNG, transparent background
- **apple-touch-icon.png**: 180x180 PNG, transparent background

### **Android**
- **mdpi**: 48x48 PNG
- **hdpi**: 72x72 PNG
- **xhdpi**: 96x96 PNG
- **xxhdpi**: 144x144 PNG
- **xxxhdpi**: 192x192 PNG

**All Android icons should:**
- Be PNG format
- Have transparent backgrounds
- Keep important content in center (safe zone)
- Use your lavender/blue skies color scheme

---

## 🚀 **After Placing Files**

1. **PWA:** Icons will work automatically - test by installing PWA
2. **Android:** Rebuild app in Android Studio to see new icons
3. **Verify:** Check browser tab, PWA install, app drawer

---

**That's it!** Just place the files in the correct folders and you're done.
