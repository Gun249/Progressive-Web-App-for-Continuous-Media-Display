/**
 * The Loop PWA - Service Worker
 * จัดการการแคชไฟล์และการทำงานแบบออฟไลน์
 */

// ชื่อและเวอร์ชันของ Cache
const CACHE_NAME = 'the-loop-v1.0.0';
const STATIC_CACHE_NAME = 'the-loop-static-v1.0.0';
const IMAGE_CACHE_NAME = 'the-loop-images-v1.0.0';

// ไฟล์หลักที่ต้องแคชเสมอ (Core App Files)
const CORE_FILES = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// ไฟล์ไอคอนที่ต้องแคช (เฉพาะที่มีจริง)
const ICON_FILES = [
    './icon-192x192.png',
    './icon-512x512.png'
];

/**
 * Event: Install
 * ติดตั้ง Service Worker และแคชไฟล์หลัก
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: กำลังติดตั้ง...');
    
    event.waitUntil(
        Promise.all([
            // แคชไฟล์หลัก
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('📦 กำลังแคชไฟล์หลัก...');
                return cache.addAll(CORE_FILES);
            }),
            
            // แคชไฟล์ไอคอน (ถ้ามี)
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('🎨 กำลังแคชไฟล์ไอคอน...');
                // ใช้ Promise.allSettled เพื่อไม่ให้ล้มเหลวถ้าไอคอนบางตัวไม่มี
                return Promise.allSettled(
                    ICON_FILES.map(file => cache.add(file).catch(() => console.warn(`⚠️ ไม่พบไอคอน: ${file}`)))
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker: ติดตั้งสำเร็จ');
            // บังคับให้ Service Worker ใหม่เข้าควบคุมทันที
            return self.skipWaiting();
        })
    );
});

/**
 * Event: Activate
 * เปิดใช้งาน Service Worker และล้าง Cache เก่า
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: กำลังเปิดใช้งาน...');
    
    event.waitUntil(
        Promise.all([
            // ล้าง Cache เก่า
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== IMAGE_CACHE_NAME && 
                            cacheName !== CACHE_NAME) {
                            console.log(`🗑️ ลบ Cache เก่า: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // เข้าควบคุม Client ทั้งหมดทันที
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker: เปิดใช้งานสำเร็จ');
        })
    );
});

/**
 * Event: Fetch
 * จัดการการร้องขอไฟล์ต่างๆ
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // ข้าม request ที่ไม่ใช่ HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // จัดการตามประเภทของ request
    if (isImageRequest(request)) {
        // สำหรับรูปภาพ: ใช้ Cache First Strategy
        event.respondWith(handleImageRequest(request));
    } else if (isCoreFileRequest(request)) {
        // สำหรับไฟล์หลัก: ใช้ Cache First Strategy
        event.respondWith(handleCoreFileRequest(request));
    } else if (isVideoRequest(request)) {
        // สำหรับวิดีโอ: ใช้ Network Only Strategy (ไม่แคช)
        event.respondWith(handleVideoRequest(request));
    } else {
        // สำหรับไฟล์อื่นๆ: ใช้ Network First Strategy
        event.respondWith(handleNetworkFirstRequest(request));
    }
});

/**
 * ตรวจสอบว่าเป็น request สำหรับรูปภาพหรือไม่
 * @param {Request} request 
 * @returns {boolean}
 */
function isImageRequest(request) {
    return request.destination === 'image' || 
           /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(request.url);
}

/**
 * ตรวจสอบว่าเป็น request สำหรับไฟล์หลักหรือไม่
 * @param {Request} request 
 * @returns {boolean}
 */
function isCoreFileRequest(request) {
    const url = new URL(request.url);
    return CORE_FILES.some(file => url.pathname.endsWith(file.replace('./', ''))) ||
           url.pathname === '/' ||
           url.pathname === '/index.html';
}

/**
 * ตรวจสอบว่าเป็น request สำหรับวิดีโอหรือไม่
 * @param {Request} request 
 * @returns {boolean}
 */
function isVideoRequest(request) {
    return request.destination === 'video' || 
           /\.(mp4|webm|ogg|avi|mov|wmv|flv)(\?.*)?$/i.test(request.url);
}

/**
 * จัดการ request สำหรับรูปภาพ (Cache First Strategy)
 * @param {Request} request 
 * @returns {Promise<Response>}
 */
async function handleImageRequest(request) {
    try {
        // ลองหาใน Cache ก่อน
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log(`📷 ใช้รูปภาพจาก Cache: ${request.url}`);
            return cachedResponse;
        }
        
        // ถ้าไม่มีใน Cache ให้ดาวน์โหลดจาก Network
        console.log(`🌐 ดาวน์โหลดรูปภาพใหม่: ${request.url}`);
        const networkResponse = await fetch(request);
        
        // แคชรูปภาพใหม่ (ถ้าสำเร็จ)
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
            console.log(`💾 แคชรูปภาพใหม่: ${request.url}`);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error(`❌ ไม่สามารถโหลดรูปภาพได้: ${request.url}`, error);
        
        // ส่งคืนรูปภาพ placeholder หรือ error response
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#333"/><text x="200" y="150" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16">ไม่สามารถโหลดรูปภาพได้</text></svg>',
            {
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

/**
 * จัดการ request สำหรับไฟล์หลัก (Cache First Strategy)
 * @param {Request} request 
 * @returns {Promise<Response>}
 */
async function handleCoreFileRequest(request) {
    try {
        // ลองหาใน Cache ก่อน
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log(`📁 ใช้ไฟล์จาก Cache: ${request.url}`);
            return cachedResponse;
        }
        
        // ถ้าไม่มีใน Cache ให้ดาวน์โหลดจาก Network
        console.log(`🌐 ดาวน์โหลดไฟล์ใหม่: ${request.url}`);
        const networkResponse = await fetch(request);
        
        // แคชไฟล์ใหม่ (ถ้าสำเร็จ)
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error(`❌ ไม่สามารถโหลดไฟล์ได้: ${request.url}`, error);
        
        // ถ้าเป็น HTML ให้ส่งคืน offline page
        if (request.destination === 'document') {
            return new Response(
                `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>The Loop - Offline</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            background: #000; 
                            color: #fff; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            height: 100vh; 
                            margin: 0; 
                            text-align: center;
                        }
                        .offline-message {
                            max-width: 400px;
                            padding: 20px;
                        }
                        h1 { color: #fff; margin-bottom: 20px; }
                        p { margin-bottom: 15px; line-height: 1.5; }
                        button {
                            background: #fff;
                            color: #000;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        }
                        button:hover { background: #f0f0f0; }
                    </style>
                </head>
                <body>
                    <div class="offline-message">
                        <h1>🔌 ออฟไลน์</h1>
                        <p>คุณกำลังออฟไลน์อยู่ในขณะนี้</p>
                        <p>กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
                        <button onclick="window.location.reload()">ลองใหม่</button>
                    </div>
                </body>
                </html>`,
                {
                    headers: {
                        'Content-Type': 'text/html',
                        'Cache-Control': 'no-cache'
                    }
                }
            );
        }
        
        throw error;
    }
}

/**
 * จัดการ request สำหรับวิดีโอ (Network Only Strategy)
 * @param {Request} request 
 * @returns {Promise<Response>}
 */
async function handleVideoRequest(request) {
    try {
        console.log(`🎬 สตรีมวิดีโอ: ${request.url}`);
        return await fetch(request);
    } catch (error) {
        console.error(`❌ ไม่สามารถโหลดวิดีโอได้: ${request.url}`, error);
        throw error;
    }
}

/**
 * จัดการ request อื่นๆ (Network First Strategy)
 * @param {Request} request 
 * @returns {Promise<Response>}
 */
async function handleNetworkFirstRequest(request) {
    try {
        // ลอง Network ก่อน
        const networkResponse = await fetch(request);
        
        // แคชถ้าสำเร็จ
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        // ถ้า Network ล้มเหลว ลองหาใน Cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log(`📦 ใช้จาก Cache (Network ล้มเหลว): ${request.url}`);
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Event: Message
 * รับข้อความจาก Main Thread
 */
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            // บังคับให้ Service Worker ใหม่เข้าควบคุมทันที
            self.skipWaiting();
            break;
            
        case 'CACHE_IMAGES':
            // แคชรูปภาพล่วงหน้า
            if (data && data.imageUrls) {
                cacheImages(data.imageUrls);
            }
            break;
            
        case 'CLEAR_CACHE':
            // ล้าง Cache
            clearAllCaches();
            break;
            
        default:
            console.log('📨 ได้รับข้อความที่ไม่รู้จัก:', type);
    }
});

/**
 * แคชรูปภาพล่วงหน้า
 * @param {Array<string>} imageUrls 
 */
async function cacheImages(imageUrls) {
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        console.log(`🖼️ กำลังแคชรูปภาพล่วงหน้า ${imageUrls.length} รูป...`);
        
        const cachePromises = imageUrls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                    console.log(`✅ แคชรูปภาพสำเร็จ: ${url}`);
                }
            } catch (error) {
                console.warn(`⚠️ ไม่สามารถแคชรูปภาพได้: ${url}`, error);
            }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('🎉 แคชรูปภาพล่วงหน้าเสร็จสิ้น');
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการแคชรูปภาพ:', error);
    }
}

/**
 * ล้าง Cache ทั้งหมด
 */
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('🗑️ ล้าง Cache ทั้งหมดเสร็จสิ้น');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการล้าง Cache:', error);
    }
}

/**
 * Event: Error
 * จัดการข้อผิดพลาดทั่วไป
 */
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker Error:', event.error);
    event.preventDefault();
});

/**
 * Event: Unhandled Promise Rejection
 * จัดการ Promise ที่ reject แล้วไม่มีการจัดการ
 */
self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
    event.preventDefault();
});

