# Logo Integration Guide

**Date:** December 2024  
**Status:** Ready for Logo Integration

---

## 📁 **Logo Files Needed**

### **PWA (Progressive Web App)**

Place these files in `pwa/public/`:

```
pwa/public/
├── favicon.ico              (16x16, 32x32, 48x48 - multi-size ICO)
├── icon-192x192.png         (192x192 PNG - PWA icon)
├── icon-512x512.png         (512x512 PNG - PWA icon)
├── apple-touch-icon.png     (180x180 PNG - iOS home screen)
└── logo.svg                 (Optional: SVG logo for header)
```

### **Android App**

Place these files in `app/src/main/res/`:

```
app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png          (48x48)
│   └── ic_launcher_round.png    (48x48 - round variant)
├── mipmap-hdpi/
│   └── ic_launcher.png          (72x72)
│   └── ic_launcher_round.png    (72x72)
├── mipmap-xhdpi/
│   └── ic_launcher.png          (96x96)
│   └── ic_launcher_round.png    (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png          (144x144)
│   └── ic_launcher_round.png    (144x144)
├── mipmap-xxxhdpi/
│   └── ic_launcher.png          (192x192)
│   └── ic_launcher_round.png    (192x192)
└── mipmap-anydpi-v26/
    └── ic_launcher.xml          (Adaptive icon foreground)
    └── ic_launcher_round.xml    (Adaptive icon foreground)
```

**Note:** Android also needs adaptive icon resources (foreground/background layers).

---

## 🎨 **Logo Specifications**

### **PWA Icons**

| File | Size | Format | Purpose |
|------|------|--------|---------|
| `favicon.ico` | 16x16, 32x32, 48x48 | ICO | Browser tab icon |
| `icon-192x192.png` | 192x192 | PNG | PWA icon (Android) |
| `icon-512x512.png` | 512x512 | PNG | PWA icon (high-res) |
| `apple-touch-icon.png` | 180x180 | PNG | iOS home screen |
| `logo.svg` | Scalable | SVG | Header logo (optional) |

### **Android Icons**

| Density | Size | Purpose |
|---------|------|---------|
| mdpi | 48x48 | Low density |
| hdpi | 72x72 | Medium density |
| xhdpi | 96x96 | High density |
| xxhdpi | 144x144 | Extra high density |
| xxxhdpi | 192x192 | Extra extra high density |

**Adaptive Icons (Android 8.0+):**
- Foreground: 108x108dp (safe zone: 72x72dp)
- Background: 108x108dp
- Both should be 432x432px for xxxhdpi

---

## ✅ **Integration Checklist**

### **PWA Integration**

- [ ] Place `favicon.ico` in `pwa/public/`
- [ ] Place `icon-192x192.png` in `pwa/public/`
- [ ] Place `icon-512x512.png` in `pwa/public/`
- [ ] Place `apple-touch-icon.png` in `pwa/public/`
- [ ] (Optional) Place `logo.svg` in `pwa/public/`
- [ ] Verify `manifest.json` references icons correctly
- [ ] Verify `app/layout.tsx` references favicon correctly
- [ ] Test PWA installation on mobile devices

### **Android Integration**

- [ ] Create `mipmap-*` directories in `app/src/main/res/`
- [ ] Place all density icons in respective directories
- [ ] Create adaptive icon XML files
- [ ] Update `AndroidManifest.xml` if needed
- [ ] Test app icon on Android devices
- [ ] Verify icon appears correctly in app drawer

---

## 🔧 **File Updates Required**

### **Already Configured:**

✅ `pwa/public/manifest.json` - References icon-192x192.png and icon-512x512.png  
✅ `pwa/app/layout.tsx` - References favicon.ico and apple-touch-icon

### **May Need Updates:**

- `app/src/main/AndroidManifest.xml` - Verify icon references
- `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` - Adaptive icon config

---

## 📝 **Quick Start**

1. **Get your logo files** in the required sizes
2. **Place PWA icons** in `pwa/public/`
3. **Place Android icons** in `app/src/main/res/mipmap-*/`
4. **Test** on devices/browsers
5. **Verify** icons appear correctly

---

## 🎨 **Logo Design Tips**

- **Use transparent backgrounds** for PNG icons
- **Keep important elements** in the center (safe zone)
- **Test at small sizes** to ensure readability
- **Use consistent colors** (lavender & sky blue theme)
- **Ensure contrast** for visibility on light/dark backgrounds

---

## 🚀 **After Integration**

Once logos are in place:

1. **PWA:** Icons will automatically appear in browser tabs, PWA install prompts, and home screens
2. **Android:** Icons will appear in app drawer, home screen, and notifications
3. **Test:** Install PWA on mobile, install Android app, verify all icon sizes

---

**Last Updated:** December 2024  
**Status:** Ready for Logo Files
