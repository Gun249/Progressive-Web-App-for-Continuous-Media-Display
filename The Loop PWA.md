# The Loop PWA

Progressive Web App สำหรับแสดงผลสื่อ (รูปภาพและวิดีโอ) แบบต่อเนื่องในรูปแบบสไลด์โชว์ที่ทำงานแบบออฟไลน์ได้

## ✨ คุณสมบัติหลัก

### 🎬 การจัดการสื่อ (Media Handling)
- รองรับการแสดงผลรูปภาพ (JPG, PNG, GIF, WebP)
- รองรับการเล่นวิดีโอ (MP4, WebM, OGG)
- รับข้อมูลเป็น Array ของ JavaScript Objects
- โครงสร้างข้อมูลที่ยืดหยุ่นและใช้งานง่าย

### ⚡ การเล่นอัตโนมัติ (Autoplay & Looping)
- เริ่มเล่นสื่อชิ้นแรกโดยอัตโนมัติ
- เปลี่ยนสื่อตามเวลาที่กำหนด (duration)
- วนลูปไปเรื่อยๆ เมื่อเล่นถึงสื่อชิ้นสุดท้าย
- รองรับการหยุดชั่วคราวและเล่นต่อ

### 🎮 การควบคุมด้วยมือ (Manual Controls)
- คลิกฝั่งขวาเพื่อไปยังสื่อถัดไป
- คลิกฝั่งซ้ายเพื่อย้อนกลับ
- คลิกตรงกลางเพื่อหยุด/เล่นต่อ
- รองรับการควบคุมด้วยคีย์บอร์ด (Arrow Keys, Space)

### 🌐 PWA เต็มรูปแบบ (Full PWA Functionality)
- ติดตั้งได้บนอุปกรณ์ทุกประเภท
- ทำงานแบบออฟไลน์ได้
- แคชรูปภาพอัตโนมัติ
- Service Worker สำหรับประสิทธิภาพสูง

## 🎨 ดีไซน์และสไตล์

- **สไตล์**: มินิมอล, สะอาดตา, ทันสมัย
- **Layout**: แสดงผลแบบเต็มหน้าจอ (Fullscreen)
- **สี**: Dark Mode เป็นธีมหลัก
- **การควบคุม**: ปุ่มโปร่งแสงที่ปรากฏเมื่อใช้งาน

## 📁 โครงสร้างไฟล์

```
the-loop-pwa/
├── index.html          # ไฟล์ HTML หลัก
├── style.css           # ไฟล์ CSS สำหรับสไตล์
├── app.js              # ไฟล์ JavaScript หลัก
├── manifest.json       # PWA Manifest
├── sw.js               # Service Worker
├── icon-192x192.png    # ไอคอนแอป 192x192
├── icon-512x512.png    # ไอคอนแอป 512x512
└── README.md           # เอกสารนี้
```

## 🚀 การติดตั้งและใช้งาน

### 1. การติดตั้งพื้นฐาน

1. ดาวน์โหลดไฟล์ทั้งหมดไปยังโฟลเดอร์เดียวกัน
2. เปิด Terminal/Command Prompt ในโฟลเดอร์นั้น
3. เริ่ม HTTP Server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (ถ้าติดตั้ง http-server)
npx http-server -p 8000
```

4. เปิดเบราว์เซอร์และไปที่ `http://localhost:8000`

### 2. การกำหนดข้อมูลสื่อ

แก้ไขไฟล์ `app.js` ในส่วน `loadSampleMedia()` หรือใช้ `setMediaList()`:

```javascript
const mediaList = [
    {
        type: 'image',
        url: 'path/to/image1.jpg',
        duration: 5000 // 5 วินาที
    },
    {
        type: 'video',
        url: 'path/to/video1.mp4',
        duration: 0 // ใช้ความยาวจริงของวิดีโอ
    },
    {
        type: 'image',
        url: 'path/to/image2.png',
        duration: 7000 // 7 วินาที
    }
];

// ตั้งค่าสื่อใหม่
window.theLoopApp.setMediaList(mediaList);
```

### 3. การติดตั้งเป็น PWA

1. เปิดแอปในเบราว์เซอร์
2. ในเบราว์เซอร์ Chrome/Edge: คลิก "Install" หรือไอคอน "+" ในแถบที่อยู่
3. ในมือถือ: เลือก "Add to Home Screen" จากเมนูเบราว์เซอร์
4. แอปจะติดตั้งและสามารถเปิดได้เหมือนแอปปกติ

## 🎮 การใช้งาน

### การควบคุมด้วยเมาส์/Touch
- **คลิกฝั่งซ้าย**: ย้อนกลับไปสื่อก่อนหน้า
- **คลิกตรงกลาง**: หยุด/เล่นต่อ
- **คลิกฝั่งขวา**: ไปยังสื่อถัดไป
- **ขยับเมาส์**: แสดงปุ่มควบคุม (จะหายไปใน 3 วินาที)

### การควบคุมด้วยคีย์บอร์ด
- **← (Arrow Left)**: ย้อนกลับไปสื่อก่อนหน้า
- **→ (Arrow Right)**: ไปยังสื่อถัดไป
- **Space**: หยุด/เล่นต่อ
- **Escape**: ซ่อนปุ่มควบคุม

## ⚙️ การปรับแต่ง

### เปลี่ยนเวลาแสดงผลเริ่มต้น
แก้ไขใน `app.js`:
```javascript
// เปลี่ยนเวลาเริ่มต้นสำหรับรูปภาพ
const DEFAULT_IMAGE_DURATION = 5000; // 5 วินาที
```

### เปลี่ยนเวลาซ่อนปุ่มควบคุม
แก้ไขใน `app.js`:
```javascript
// เปลี่ยนเวลาซ่อนปุ่มควบคุม
this.controlsTimer = setTimeout(() => {
    this.hideControls();
}, 3000); // 3 วินาที
```

### เปลี่ยนสีธีม
แก้ไขใน `style.css`:
```css
:root {
    --bg-color: #000000;        /* สีพื้นหลัง */
    --text-color: #ffffff;      /* สีข้อความ */
    --accent-color: #ffffff;    /* สีเน้น */
}
```

## 🔧 การพัฒนาต่อ

### API สำหรับนักพัฒนา

```javascript
// เข้าถึง App Instance
const app = window.theLoopApp;

// ตั้งค่าสื่อใหม่
app.setMediaList(mediaArray);

// ควบคุมการเล่น
app.startSlideshow();
app.stopSlideshow();
app.pauseSlideshow();
app.resumeSlideshow();

// นำทางสื่อ
app.nextMedia();
app.previousMedia();

// ดึงข้อมูลปัจจุบัน
const currentMedia = app.getCurrentMedia();
const currentIndex = app.currentIndex;
const isPlaying = app.isPlaying;
```

### Event Listeners
```javascript
// ฟังการเปลี่ยนสื่อ
document.addEventListener('mediaChanged', (event) => {
    console.log('เปลี่ยนไปสื่อ:', event.detail);
});

// ฟังการเล่น/หยุด
document.addEventListener('playStateChanged', (event) => {
    console.log('สถานะการเล่น:', event.detail.isPlaying);
});
```

## 🌐 การใช้งานในการผลิต (Production)

### 1. การ Deploy บน Web Server
- อัปโหลดไฟล์ทั้งหมดไปยัง Web Server
- ตรวจสอบให้แน่ใจว่า HTTPS เปิดใช้งาน (จำเป็นสำหรับ PWA)
- กำหนด MIME Types ที่ถูกต้องสำหรับไฟล์ต่างๆ

### 2. การปรับแต่งสำหรับ Production
- เปลี่ยน URL ในข้อมูลสื่อเป็น URL จริง
- ปรับแต่ง Cache Strategy ใน `sw.js` ตามความต้องการ
- เพิ่ม Error Handling และ Fallback สำหรับสื่อที่โหลดไม่ได้

### 3. การ Optimize ประสิทธิภาพ
- บีบอัดไฟล์ CSS และ JavaScript
- ปรับขนาดรูปภาพให้เหมาะสม
- ใช้ CDN สำหรับไฟล์สื่อขนาดใหญ่

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

**1. Service Worker ไม่ทำงาน**
- ตรวจสอบว่าเปิดผ่าน HTTP/HTTPS (ไม่ใช่ file://)
- ล้าง Cache ของเบราว์เซอร์
- ตรวจสอบ Console สำหรับข้อผิดพลาด

**2. รูปภาพ/วิดีโอไม่แสดง**
- ตรวจสอบ URL ของไฟล์สื่อ
- ตรวจสอบ CORS Policy
- ดู Network Tab ใน Developer Tools

**3. ปุ่มควบคุมไม่ปรากฏ**
- ลองขยับเมาส์หรือแตะหน้าจอ
- ตรวจสอบ CSS สำหรับ `.hidden` และ `.visible`

**4. PWA ติดตั้งไม่ได้**
- ตรวจสอบ `manifest.json`
- ต้องเปิดผ่าน HTTPS
- ตรวจสอบ Service Worker ลงทะเบียนสำเร็จ

## 📱 การรองรับอุปกรณ์

### เบราว์เซอร์ที่รองรับ
- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

### อุปกรณ์ที่รองรับ
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Tablet (iPad, Android Tablet)
- ✅ Smart TV (ที่รองรับเบราว์เซอร์สมัยใหม่)

## 📄 ลิขสิทธิ์

โปรเจกต์นี้เป็น Open Source และสามารถนำไปใช้งานได้อย่างอิสระ

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบเอกสารนี้อีกครั้ง
2. ดู Console ของเบราว์เซอร์สำหรับข้อผิดพลาด
3. ทดสอบในเบราว์เซอร์อื่น

---

**The Loop PWA** - สร้างประสบการณ์การแสดงผลสื่อที่ไร้รอยต่อและสวยงาม 🎬✨

