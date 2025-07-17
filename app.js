/**
 * The Loop PWA - Main Application JavaScript
 * Progressive Web App สำหรับแสดงผลสื่อแบบต่อเนื่อง (รูปภาพและวิดีโอ)
 * 
 * Features:
 * - เล่นสื่อแบบ slideshow อัตโนมัติ
 * - รองรับทั้งรูปภาพและวิดีโอ
 * - สามารถอัปโหลดไฟล์ใหม่ได้
 * - ควบคุมการเล่นด้วย UI และ keyboard
 * - Progressive Web App (PWA) ใช้งานได้แบบ offline
 */

class TheLoopApp {
    constructor() {
        // ตัวแปรสำหรับจัดเก็บข้อมูลสื่อและสถานะการเล่น
        this.mediaList = [];           // รายการสื่อทั้งหมดที่จะเล่น
        this.currentIndex = 0;         // index ของสื่อที่กำลังเล่นอยู่
        this.isPlaying = false;        // สถานะว่ากำลังเล่นหรือไม่
        this.isPaused = false;         // สถานะว่าหยุดชั่วคราวหรือไม่
        
        // ตัวแปรสำหรับจัดการเวลาและ timers
        this.currentTimer = null;      // timer สำหรับนับเวลาสื่อปัจจุบัน
        this.progressTimer = null;     // timer สำหรับอัปเดต progress bar
        this.controlsTimer = null;     // timer สำหรับซ่อน controls อัตโนมัติ
        this.startTime = 0;            // เวลาเริ่มต้นเล่นสื่อปัจจุบัน
        this.duration = 0;             // ความยาวของสื่อปัจจุบัน (milliseconds)
        
        // ตัวแปรสำหรับการจัดการไฟล์อัปโหลด
        this.uploadedFiles = [];       // รายการไฟล์ที่ผู้ใช้อัปโหลดแล้ว
        this.selectedFiles = [];       // รายการไฟล์ที่เลือกแต่ยังไม่ได้เพิ่มในเพลย์ลิสต์
        
        // DOM Elements - เก็บ reference ของ HTML elements ที่ใช้งานบ่อย
        this.elements = {
            // Elements สำหรับแสดงผลสื่อ
            app: document.getElementById('app'),
            mediaContainer: document.getElementById('media-container'),
            mediaImage: document.getElementById('media-image'),           // img element สำหรับแสดงรูปภาพ
            mediaVideo: document.getElementById('media-video'),           // video element สำหรับเล่นวิดีโอ
            mediaYoutube: null,                                           // iframe element สำหรับ YouTube (จะสร้างแบบ dynamic)
            loadingIndicator: document.getElementById('loading-indicator'),
            
            // Elements สำหรับควบคุมการเล่น
            controlOverlay: document.getElementById('control-overlay'),
            controlLeft: document.getElementById('control-left'),         // ปุ่มไปสื่อก่อนหน้า
            controlCenter: document.getElementById('control-center'),     // ปุ่ม play/pause
            controlRight: document.getElementById('control-right'),       // ปุ่มไปสื่อถัดไป
            playPauseBtn: document.getElementById('play-pause-btn'),
            playIcon: document.getElementById('play-icon'),
            pauseIcon: document.getElementById('pause-icon'),
            
            // Elements สำหรับแสดงความคืบหน้า
            progressContainer: document.getElementById('progress-container'),
            progressFill: document.getElementById('progress-fill'),
            
            // Elements สำหรับแสดงข้อมูลสื่อ
            mediaInfo: document.getElementById('media-info'),
            currentIndexSpan: document.getElementById('current-index'),   // หมายเลขสื่อปัจจุบัน
            totalCountSpan: document.getElementById('total-count'),       // จำนวนสื่อทั้งหมด
            
            // Elements สำหรับการอัปโหลดไฟล์
            uploadButton: document.getElementById('upload-button'),
            fileInput: document.getElementById('file-input'),             // input type="file" ที่ซ่อนไว้
            uploadModal: document.getElementById('upload-modal'),         // modal popup สำหรับอัปโหลด
            closeModal: document.getElementById('close-modal'),
            uploadFromDevice: document.getElementById('upload-from-device'),
            takePhoto: document.getElementById('take-photo'),             // เปิดกล้องถ่ายรูป
            loadLocalVideo: document.getElementById('load-local-video'),  // โหลดวิดีโอในเครื่อง
            addYoutubeUrl: document.getElementById('add-youtube-url'),    // เพิ่ม YouTube URL
            uploadPreview: document.getElementById('upload-preview'),     // แสดงตัวอย่างไฟล์ที่เลือก
            previewList: document.getElementById('preview-list'),
            clearSelection: document.getElementById('clear-selection'),
            addToPlaylist: document.getElementById('add-to-playlist'),
            clearCacheBtn: document.getElementById('clear-cache-btn')     // ปุ่มล้าง cache (จะสร้างแบบ dynamic)
        };
        
        // เริ่มต้นแอป
        this.init();
        
        // เซ็ตอัพ Auto Cache Clear
        this.setupAutoCacheClear();
    }
    
    /**
     * เริ่มต้นแอปพลิเคชัน
     * - ลงทะเบียน Service Worker สำหรับ PWA
     * - ตั้งค่า event listeners ทั้งหมด
     * - โหลดสื่อตัวอย่าง
     * - เริ่มเล่น slideshow
     */
    init() {
        console.log('🚀 The Loop PWA กำลังเริ่มต้น...');
        
        // ลงทะเบียน Service Worker เพื่อให้แอปทำงานแบบ offline ได้
        this.registerServiceWorker();
        
        // ตั้งค่า Event Listeners สำหรับการควบคุมทั้งหมด
        this.setupEventListeners();
        
        // สร้างปุ่มล้าง Cache
        this.createClearCacheButton();
        
        // โหลดข้อมูลสื่อตัวอย่าง (สำหรับการทดสอบ - ในการใช้งานจริงจะใช้ไฟล์ที่อัปโหลด)
        this.loadSampleMedia();
        
        // ลองโหลดไฟล์วิดีโอในเครื่อง (ถ้ามี)
        this.loadLocalVideoFile();
        
        // เริ่มเล่นสื่อทันที
        this.startSlideshow();
    }
    
    /**
     * ลงทะเบียน Service Worker สำหรับ PWA
     * Service Worker จะทำให้แอปทำงานได้แม้ไม่มีอินเทอร์เน็ต
     * และสามารถติดตั้งเป็น app บนอุปกรณ์ได้
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('✅ Service Worker ลงทะเบียนสำเร็จ:', registration.scope);
            } catch (error) {
                console.error('❌ การลงทะเบียน Service Worker ล้มเหลว:', error);
            }
        }
    }
    
    /**
     * ตั้งค่า Event Listeners ทั้งหมด
     * รับ input จาก mouse, touch, keyboard และ video events
     */
    setupEventListeners() {
        // Mouse และ Touch Events สำหรับแสดง/ซ่อน Controls
        // เมื่อผู้ใช้เลื่อนเมาส์หรือแตะหน้าจอ จะแสดง controls ขึ้นมา
        this.elements.app.addEventListener('mousemove', () => this.showControls());
        this.elements.app.addEventListener('touchstart', () => this.showControls());
        this.elements.app.addEventListener('click', () => this.showControls());
        
        // Control Button Events - ปุ่มควบคุมการเล่น
        this.elements.controlLeft.addEventListener('click', (e) => {
            e.stopPropagation(); // ป้องกันไม่ให้ trigger click event ของ parent
            this.previousMedia(); // ไปสื่อก่อนหน้า
        });
        
        this.elements.controlRight.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextMedia(); // ไปสื่อถัดไป
        });
        
        this.elements.controlCenter.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause(); // เล่น/หยุดชั่วคราว
        });
        
        // Upload Events - การอัปโหลดไฟล์ใหม่
        this.elements.uploadButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showUploadModal(); // เปิด modal สำหรับอัปโหลดไฟล์
        });
        
        this.elements.closeModal.addEventListener('click', () => {
            this.hideUploadModal(); // ปิด modal
        });
        
        // ปิด modal เมื่อคลิกพื้นที่ว่าง
        this.elements.uploadModal.addEventListener('click', (e) => {
            if (e.target === this.elements.uploadModal) {
                this.hideUploadModal();
            }
        });
        
        // เลือกไฟล์จากอุปกรณ์
        this.elements.uploadFromDevice.addEventListener('click', () => {
            this.selectFilesFromDevice();
        });
        
        // เปิดกล้องสำหรับถ่ายรูป
        this.elements.takePhoto.addEventListener('click', () => {
            this.captureFromCamera();
        });
        
        // โหลดวิดีโอจากเครื่อง
        this.elements.loadLocalVideo.addEventListener('click', async () => {
            const success = await this.loadLocalVideoFile();
            if (success) {
                this.showSuccessMessage('โหลดวิดีโอในเครื่องสำเร็จ!');
                this.hideUploadModal();
            } else {
                this.showErrorMessage('ไม่พบไฟล์วิดีโอในเครื่อง');
            }
        });
        
        // เพิ่ม YouTube URL
        this.elements.addYoutubeUrl.addEventListener('click', () => {
            this.promptYouTubeUrl();
        });
        
        // จัดการเมื่อผู้ใช้เลือกไฟล์
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });
        
        // ล้างไฟล์ที่เลือก
        this.elements.clearSelection.addEventListener('click', () => {
            this.clearSelectedFiles();
        });
        
        // เพิ่มไฟล์ที่เลือกเข้าในเพลย์ลิสต์
        this.elements.addToPlaylist.addEventListener('click', () => {
            this.addFilesToPlaylist();
        });
        
        // Keyboard Events - ควบคุมด้วยแป้นพิมพ์
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousMedia(); // ลูกศรซ้าย = สื่อก่อนหน้า
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextMedia(); // ลูกศรขวา = สื่อถัดไป
                    break;
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause(); // spacebar = เล่น/หยุดชั่วคราว
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.hideControls(); // esc = ซ่อน controls
                    break;
            }
        });
        
        // Video Events - จัดการเหตุการณ์ของวิดีโอ
        this.elements.mediaVideo.addEventListener('loadedmetadata', () => {
            // เมื่อโหลด metadata ของวิดีโอแล้ว จะได้ความยาวจริงของวิดีโอ
            this.duration = this.elements.mediaVideo.duration * 1000; // แปลงเป็น milliseconds
        });
        
        this.elements.mediaVideo.addEventListener('ended', () => {
            // เมื่อวิดีโอเล่นจบ ให้ไปสื่อถัดไป
            this.nextMedia();
        });
        
        // ป้องกันการคลิกขวาและการลากไฟล์
        document.addEventListener('contextmenu', (e) => e.preventDefault()); // ปิด context menu
        document.addEventListener('dragstart', (e) => e.preventDefault());    // ปิดการลากไฟล์
    }
    
    /**
     * โหลดข้อมูลสื่อตัวอย่างสำหรับการทดสอบ
     * ใช้รูปภาพและวิดีโอจากอินเทอร์เน็ตเป็นตัวอย่าง
     * ในการใช้งานจริง ควรเรียกใช้ setMediaList() แทน
     */
    loadSampleMedia() {
        const sampleMedia = [
            {
                type: 'youtube',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                videoId: 'dQw4w9WgXcQ', // YouTube Video ID - สำหรับ Demo
                duration: 60000 // 1 นาที
            }
        ];
        
        this.setMediaList(sampleMedia);
    }
    
    /**
     * แยก YouTube Video ID จาก URL
     * @param {string} url - YouTube URL
     * @returns {string|null} Video ID หรือ null ถ้าไม่ใช่ YouTube URL
     */
    extractYouTubeVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }
    
    /**
     * ตรวจสอบว่า URL เป็น YouTube หรือไม่
     * @param {string} url - URL ที่ต้องการตรวจสอบ
     * @returns {boolean}
     */
    isYouTubeUrl(url) {
        return this.extractYouTubeVideoId(url) !== null;
    }
    
    /**
     * สร้างหรืออัปเดต YouTube iframe
     * @param {string} videoId - YouTube Video ID
     */
    createYouTubeIframe(videoId) {
        // ลบ iframe เก่าถ้ามี
        if (this.elements.mediaYoutube) {
            this.elements.mediaYoutube.remove();
        }
        
        // สร้าง iframe ใหม่
        this.elements.mediaYoutube = document.createElement('iframe');
        this.elements.mediaYoutube.className = 'media-element youtube-iframe';
        this.elements.mediaYoutube.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}`;
        this.elements.mediaYoutube.allow = 'autoplay; encrypted-media';
        this.elements.mediaYoutube.allowFullscreen = true;
        this.elements.mediaYoutube.frameBorder = '0';
        
        // เพิ่มเข้าไปใน container
        this.elements.mediaContainer.appendChild(this.elements.mediaYoutube);
    }
    
    /**
     * โหลดไฟล์วิดีโอจากเครื่อง
     * เพิ่มไฟล์วิดีโอที่อยู่ในโฟลเดอร์เดียวกับแอป (สำหรับ localhost เท่านั้น)
     */
    async loadLocalVideoFile() {
        try {
            // Skip โหลดไฟล์ local ถ้าอยู่บน production
            if (window.location.protocol === 'https:' && !window.location.hostname.includes('localhost')) {
                console.log('🌐 Production mode: ข้าม local video file');
                return false;
            }
            
            // ลองโหลดไฟล์วิดีโอที่อยู่ในโฟลเดอร์เดียวกับแอป
            const videoFileName = 'Copyright Free Old Film Countdown _ 5 Seconds.mp4';
            const videoUrl = `./${videoFileName}`; // ใช้ relative path
            
            // ทดสอบว่าไฟล์มีอยู่จริงหรือไม่
            const response = await fetch(videoUrl, { method: 'HEAD' });
            
            if (response.ok) {
                // ถ้าไฟล์มีอยู่ ให้เพิ่มเข้าไปในรายการสื่อ
                const localVideo = {
                    type: 'video',
                    url: videoUrl,
                    name: videoFileName,
                    duration: 0, // จะใช้ความยาวจริงของวิดีโอ
                    isLocalFile: true
                };
                
                // เพิ่มเข้าไปในรายการสื่อ
                this.mediaList.push(localVideo);
                this.elements.totalCountSpan.textContent = this.mediaList.length;
                
                console.log(`✅ โหลดไฟล์วิดีโอในเครื่องสำเร็จ: ${videoFileName}`);
                
                return true;
            } else {
                console.warn(`⚠️ ไม่พบไฟล์วิดีโอ: ${videoFileName}`);
                return false;
            }
        } catch (error) {
            console.warn(`⚠️ ไม่สามารถโหลดไฟล์วิดีโอในเครื่องได้:`, error);
            return false;
        }
    }
    
    /**
     * ตั้งค่าลิสต์สื่อใหม่
     * ฟังก์ชันนี้ใช้สำหรับกำหนดรายการสื่อที่จะเล่น
     * @param {Array} mediaList - Array ของ media objects แต่ละ object ต้องมี type, url, duration
     */
    setMediaList(mediaList) {
        this.mediaList = mediaList;
        this.currentIndex = 0; // เริ่มที่สื่อแรก
        this.elements.totalCountSpan.textContent = mediaList.length; // แสดงจำนวนสื่อทั้งหมด
        this.updateMediaInfo(); // อัปเดตข้อมูลที่แสดงบน UI
        
        console.log(`📁 โหลดสื่อทั้งหมด ${mediaList.length} ไฟล์`);
    }
    
    /**
     * เริ่มเล่นสไลด์โชว์
     * เปลี่ยนสถานะเป็นกำลังเล่น และเริ่มเล่นสื่อแรก
     */
    startSlideshow() {
        if (this.mediaList.length === 0) {
            console.warn('⚠️ ไม่มีสื่อให้เล่น');
            return;
        }
        
        this.isPlaying = true;      // เปลี่ยนสถานะเป็นกำลังเล่น
        this.isPaused = false;      // ไม่ได้หยุดชั่วคราว
        this.updatePlayPauseIcon(); // อัปเดตไอคอนปุ่ม play/pause
        this.playCurrentMedia();    // เริ่มเล่นสื่อปัจจุบัน
        
        console.log('▶️ เริ่มเล่นสไลด์โชว์');
    }
    
    /**
     * หยุดสไลด์โชว์
     * หยุดการเล่นทั้งหมดและล้าง timers
     */
    stopSlideshow() {
        this.isPlaying = false;      // เปลี่ยนสถานะเป็นหยุดเล่น
        this.isPaused = false;       // ไม่ใช่การหยุดชั่วคราว แต่หยุดสิ้นเชิง
        this.clearTimers();          // ล้าง timers ทั้งหมด
        this.updatePlayPauseIcon();  // อัปเดตไอคอนปุ่ม
        
        console.log('⏹️ หยุดสไลด์โชว์');
    }
    
    /**
     * เล่น/หยุดชั่วคราว (Toggle function)
     * ถ้ากำลังเล่นอยู่ จะหยุดชั่วคราว ถ้าหยุดอยู่ จะเล่นต่อ
     */
    togglePlayPause() {
        if (this.isPlaying && !this.isPaused) {
            this.pauseSlideshow();  // กำลังเล่นอยู่ -> หยุดชั่วคราว
        } else {
            this.resumeSlideshow(); // หยุดอยู่ -> เล่นต่อ
        }
    }
    
    /**
     * หยุดชั่วคราว
     * หยุดการเล่นชั่วคราว แต่ยังคงสถานะว่ากำลังเล่นอยู่
     */
    pauseSlideshow() {
        this.isPaused = true;    // ตั้งสถานะหยุดชั่วคราว
        this.clearTimers();      // หยุด timers ทั้งหมด
        
        // หยุดวิดีโอถ้ากำลังเล่นอยู่
        if (this.getCurrentMedia().type === 'video') {
            this.elements.mediaVideo.pause();
        }
        // สำหรับ YouTube ไม่สามารถควบคุมการเล่นได้โดยตรง
        
        this.updatePlayPauseIcon();
        console.log('⏸️ หยุดชั่วคราว');
    }
    
    /**
     * เล่นต่อ
     * เล่นต่อจากจุดที่หยุดชั่วคราว
     */
    resumeSlideshow() {
        this.isPaused = false; // ยกเลิกสถานะหยุดชั่วคราว
        
        // เล่นวิดีโอต่อถ้าเป็นวิดีโอ
        if (this.getCurrentMedia().type === 'video') {
            this.elements.mediaVideo.play();
            this.startProgressTracking(); // เริ่ม progress bar อีกครั้ง
        } else if (this.getCurrentMedia().type === 'youtube') {
            // สำหรับ YouTube ให้เล่นต่อจากเวลาที่เหลือ
            const elapsed = Date.now() - this.startTime;
            const remaining = this.duration - elapsed;
            
            if (remaining > 0) {
                this.startMediaTimer(remaining);
                this.startProgressTracking();
            } else {
                this.nextMedia();
            }
        } else {
            // สำหรับรูปภาพ ให้เล่นต่อจากเวลาที่เหลือ
            const elapsed = Date.now() - this.startTime;  // เวลาที่ผ่านไปแล้ว
            const remaining = this.duration - elapsed;    // เวลาที่เหลือ
            
            if (remaining > 0) {
                this.startMediaTimer(remaining);  // ตั้ง timer สำหรับเวลาที่เหลือ
                this.startProgressTracking();     // เริ่ม progress bar
            } else {
                this.nextMedia(); // ถ้าหมดเวลาแล้ว ไปสื่อถัดไป
            }
        }
        
        this.updatePlayPauseIcon();
        console.log('▶️ เล่นต่อ');
    }
    
    /**
     * เล่นสื่อปัจจุบัน
     * ฟังก์ชันหลักสำหรับเล่นสื่อ จัดการทั้งรูปภาพและวิดีโอ
     * รวมถึงการจัดการข้อผิดพลาดต่างๆ
     */
    async playCurrentMedia() {
        const media = this.getCurrentMedia();
        if (!media) {
            console.warn('⚠️ ไม่มีสื่อให้เล่น');
            return;
        }
        
        // แสดงข้อมูลสื่อที่กำลังเล่นใน console
        console.log(`🎬 กำลังเล่น: ${media.type} - ${media.name || media.url}`);
        console.log(`📍 URL: ${media.url}`);
        console.log(`🏷️ User Upload: ${!!media.isUserUpload}`);
        
        // แสดง Loading indicator ขณะโหลดสื่อ
        this.showLoading();
        
        // ซ่อนสื่อทั้งหมดก่อนแสดงสื่อใหม่
        this.hideAllMedia();
        
        try {
            // เรียกฟังก์ชันเล่นตามประเภทของสื่อ
            if (media.type === 'image') {
                await this.playImage(media);
            } else if (media.type === 'video') {
                await this.playVideo(media);
            } else if (media.type === 'youtube') {
                await this.playYouTube(media);
            }
        } catch (error) {
            // จัดการข้อผิดพลาดในการเล่นสื่อ
            console.error('❌ เกิดข้อผิดพลาดในการเล่นสื่อ:', error);
            console.error(`❌ URL ที่เกิดข้อผิดพลาด: ${media.url}`);
            
            // ถ้าเป็นไฟล์ที่ผู้ใช้อัปโหลดและเกิดข้อผิดพลาด ให้ลบออกจากลิสต์
            if (media.isUserUpload && media.url.startsWith('blob:')) {
                console.warn(`🗑️ ลบไฟล์ที่เสียหายออกจากเพลย์ลิสต์: ${media.name}`);
                this.removeFromPlaylist(this.currentIndex);
                
                // ถ้ายังมีสื่ออื่นให้เล่น
                if (this.mediaList.length > 0) {
                    // ปรับ index ถ้าจำเป็น
                    if (this.currentIndex >= this.mediaList.length) {
                        this.currentIndex = 0;
                    }
                    this.updateMediaInfo();
                    this.playCurrentMedia(); // เล่นสื่อใหม่
                } else {
                    console.warn('⚠️ ไม่มีสื่อให้เล่นแล้ว');
                    this.stopSlideshow();
                }
            } else {
                // สำหรับสื่อจากอินเทอร์เน็ต ข้ามไปสื่อถัดไป
                this.nextMedia();
            }
        }
    }
    
    /**
     * เล่นรูปภาพ
     * โหลดและแสดงรูปภาพ พร้อมตั้งค่า timer สำหรับระยะเวลาแสดง
     * @param {Object} media - Media object ที่มี type='image'
     */
    async playImage(media) {
        return new Promise((resolve, reject) => {
            // ตั้งค่า event handler สำหรับเมื่อรูปภาพโหลดสำเร็จ
            this.elements.mediaImage.onload = () => {
                // ซ่อน Loading indicator
                this.hideLoading();
                
                // แสดงรูปภาพ (เพิ่ม class 'active')
                this.elements.mediaImage.classList.add('active');
                
                // ตั้งค่าระยะเวลาแสดงรูปภาพ
                this.duration = media.duration;  // ระยะเวลาที่กำหนดไว้ในข้อมูลสื่อ
                this.startTime = Date.now();     // บันทึกเวลาที่เริ่มแสดง
                
                // เริ่มจับเวลาและแสดง Progress Bar
                this.startMediaTimer(this.duration);
                this.startProgressTracking();
                
                resolve(); // บอกว่าเล่นสำเร็จแล้ว
            };
            
            // ตั้งค่า event handler สำหรับเมื่อเกิดข้อผิดพลาดในการโหลด
            this.elements.mediaImage.onerror = () => {
                reject(new Error('ไม่สามารถโหลดรูปภาพได้'));
            };
            
            // เริ่มโหลดรูปภาพ
            this.elements.mediaImage.src = media.url;
        });
    }
    
    /**
     * เล่นวิดีโอ
     * โหลดและเล่นวิดีโอ วิดีโอจะเล่นจนจบแล้วไปสื่อถัดไปอัตโนมัติ
     * @param {Object} media - Media object ที่มี type='video'
     */
    async playVideo(media) {
        return new Promise((resolve, reject) => {
            // ตั้งค่า event handler สำหรับเมื่อวิดีโอโหลด metadata แล้ว
            this.elements.mediaVideo.onloadeddata = () => {
                // ซ่อน Loading indicator
                this.hideLoading();
                
                // แสดงวิดีโอ (เพิ่ม class 'active')
                this.elements.mediaVideo.classList.add('active');
                
                // เริ่มเล่นวิดีโอ
                this.elements.mediaVideo.play().then(() => {
                    // ตั้งค่าระยะเวลา (ใช้ความยาวจริงของวิดีโอ)
                    this.duration = this.elements.mediaVideo.duration * 1000; // แปลงเป็น milliseconds
                    this.startTime = Date.now(); // บันทึกเวลาที่เริ่มเล่น
                    
                    // เริ่มแสดง Progress Bar (ไม่ต้องใช้ timer เพราะวิดีโอจะจบเอง)
                    this.startProgressTracking();
                    
                    resolve(); // บอกว่าเล่นสำเร็จแล้ว
                }).catch(reject); // ถ้าเล่นไม่ได้ ส่ง error
            };
            
            // ตั้งค่า event handler สำหรับเมื่อเกิดข้อผิดพลาดในการโหลด
            this.elements.mediaVideo.onerror = () => {
                reject(new Error('ไม่สามารถโหลดวิดีโอได้'));
            };
            
            // เริ่มโหลดวิดีโอ
            this.elements.mediaVideo.src = media.url;
        });
    }
    
    /**
     * เล่นวิดีโอ YouTube
     * สร้าง iframe และเล่นวิดีโอจาก YouTube
     * @param {Object} media - Media object ที่มี type='youtube'
     */
    async playYouTube(media) {
        return new Promise((resolve, reject) => {
            try {
                // ซ่อน Loading indicator
                this.hideLoading();
                
                // แยก Video ID จาก URL ถ้ายังไม่มี
                let videoId = media.videoId;
                if (!videoId) {
                    videoId = this.extractYouTubeVideoId(media.url);
                    if (!videoId) {
                        reject(new Error('ไม่สามารถแยก YouTube Video ID ได้'));
                        return;
                    }
                }
                
                // สร้าง YouTube iframe
                this.createYouTubeIframe(videoId);
                
                // แสดง YouTube iframe
                this.elements.mediaYoutube.classList.add('active');
                
                // ตั้งค่าระยะเวลา (YouTube จะเล่นแบบ loop)
                this.duration = media.duration || 30000; // ค่าเริ่มต้น 30 วินาที ถ้าไม่ระบุ
                this.startTime = Date.now();
                
                // เริ่มจับเวลาและแสดง Progress Bar
                this.startMediaTimer(this.duration);
                this.startProgressTracking();
                
                console.log(`▶️ เล่น YouTube: ${videoId}`);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * ไปยังสื่อถัดไป
     * เปลี่ยนไปสื่อถัดไปในลิสต์ ถ้าถึงสื่อสุดท้ายแล้วจะกลับไปที่สื่อแรก (loop)
     */
    nextMedia() {
        this.clearTimers(); // ล้าง timers ของสื่อปัจจุบัน
        
        // คำนวณ index ถัดไป (วนกลับไปที่ 0 ถ้าถึงสื่อสุดท้าย)
        this.currentIndex = (this.currentIndex + 1) % this.mediaList.length;
        this.updateMediaInfo(); // อัปเดตข้อมูลที่แสดงบน UI
        
        // เล่นสื่อถัดไปถ้ายังอยู่ในสถานะเล่น
        if (this.isPlaying && !this.isPaused) {
            this.playCurrentMedia();
        }
        
        console.log(`⏭️ ไปยังสื่อถัดไป: ${this.currentIndex + 1}/${this.mediaList.length}`);
    }
    
    /**
     * ย้อนกลับไปยังสื่อก่อนหน้า
     * เปลี่ยนไปสื่อก่อนหน้าในลิสต์ ถ้าอยู่ที่สื่อแรกจะไปที่สื่อสุดท้าย (loop)
     */
    previousMedia() {
        this.clearTimers(); // ล้าง timers ของสื่อปัจจุบัน
        
        // คำนวณ index ก่อนหน้า (ไปที่สื่อสุดท้ายถ้าอยู่ที่สื่อแรก)
        this.currentIndex = this.currentIndex === 0 ? this.mediaList.length - 1 : this.currentIndex - 1;
        this.updateMediaInfo(); // อัปเดตข้อมูลที่แสดงบน UI
        
        // เล่นสื่อก่อนหน้าถ้ายังอยู่ในสถานะเล่น
        if (this.isPlaying && !this.isPaused) {
            this.playCurrentMedia();
        }
        
        console.log(`⏮️ ย้อนกลับไปยังสื่อก่อนหน้า: ${this.currentIndex + 1}/${this.mediaList.length}`);
    }
    
    /**
     * เริ่มจับเวลาสำหรับสื่อปัจจุบัน
     * ใช้สำหรับรูปภาพเท่านั้น วิดีโอจะใช้ event 'ended' แทน
     * @param {number} duration - ระยะเวลาในหน่วย milliseconds
     */
    startMediaTimer(duration) {
        this.currentTimer = setTimeout(() => {
            // เมื่อครบเวลาแล้ว ถ้ายังเล่นอยู่ และไม่ได้หยุดชั่วคราว ให้ไปสื่อถัดไป
            if (this.isPlaying && !this.isPaused) {
                this.nextMedia();
            }
        }, duration);
    }
    
    /**
     * เริ่มติดตาม Progress Bar
     * อัปเดต progress bar ทุก 100ms เพื่อแสดงความคืบหน้าของสื่อ
     */
    startProgressTracking() {
        // แสดง progress container
        this.elements.progressContainer.classList.add('visible');
        this.elements.progressContainer.classList.remove('hidden');
        
        // ตั้ง interval เพื่ออัปเดต progress bar ทุก 100ms
        this.progressTimer = setInterval(() => {
            if (this.isPaused) return; // ไม่อัปเดตถ้าหยุดชั่วคราว
            
            let progress = 0;
            
            if (this.getCurrentMedia().type === 'video') {
                // สำหรับวิดีโอ ใช้ currentTime เทียบกับ duration ของวิดีโอ
                progress = (this.elements.mediaVideo.currentTime / this.elements.mediaVideo.duration) * 100;
            } else if (this.getCurrentMedia().type === 'youtube') {
                // สำหรับ YouTube คำนวณจากเวลาที่ผ่านไป (เหมือนรูปภาพ)
                const elapsed = Date.now() - this.startTime;
                progress = (elapsed / this.duration) * 100;
            } else {
                // สำหรับรูปภาพ คำนวณจากเวลาที่ผ่านไป
                const elapsed = Date.now() - this.startTime;  // เวลาที่ผ่านไปแล้ว
                progress = (elapsed / this.duration) * 100;   // เปอร์เซ็นต์ความคืบหน้า
            }
            
            // จำกัดไม่ให้เกิน 100%
            progress = Math.min(progress, 100);
            
            // อัปเดตความกว้างของ progress bar
            this.elements.progressFill.style.width = `${progress}%`;
        }, 100);
    }
    
    /**
     * แสดง Controls
     * แสดงปุ่มควบคุมและข้อมูลสื่อ พร้อมตั้งเวลาให้ซ่อนอัตโนมัติ
     */
    showControls() {
        // แสดง control overlay และ media info
        this.elements.controlOverlay.classList.add('visible');
        this.elements.controlOverlay.classList.remove('hidden');
        this.elements.mediaInfo.classList.add('visible');
        this.elements.mediaInfo.classList.remove('hidden');
        
        // ล้าง timer เก่าและตั้งใหม่เพื่อซ่อน Controls อัตโนมัติ
        this.clearControlsTimer();
        this.controlsTimer = setTimeout(() => {
            this.hideControls();
        }, 3000); // ซ่อนหลังจาก 3 วินาที
    }
    
    /**
     * ซ่อน Controls
     * ซ่อนปุ่มควบคุมและข้อมูลสื่อเพื่อให้ดูสื่อได้เต็มจอ
     */
    hideControls() {
        // ซ่อน control overlay และ media info
        this.elements.controlOverlay.classList.add('hidden');
        this.elements.controlOverlay.classList.remove('visible');
        this.elements.mediaInfo.classList.add('hidden');
        this.elements.mediaInfo.classList.remove('visible');
        
        // ล้าง timer
        this.clearControlsTimer();
    }
    
    /**
     * แสดง Loading Indicator
     */
    showLoading() {
        this.elements.loadingIndicator.classList.remove('hidden');
    }
    
    /**
     * ซ่อน Loading Indicator
     */
    hideLoading() {
        this.elements.loadingIndicator.classList.add('hidden');
    }
    
    /**
     * ซ่อนสื่อทั้งหมด
     */
    hideAllMedia() {
        this.elements.mediaImage.classList.remove('active');
        this.elements.mediaVideo.classList.remove('active');
        this.elements.mediaVideo.pause();
        
        // ซ่อน YouTube iframe ถ้ามี
        if (this.elements.mediaYoutube) {
            this.elements.mediaYoutube.classList.remove('active');
        }
        
        this.elements.progressContainer.classList.add('hidden');
        this.elements.progressContainer.classList.remove('visible');
    }
    
    /**
     * อัปเดตไอคอน Play/Pause
     */
    updatePlayPauseIcon() {
        if (this.isPlaying && !this.isPaused) {
            this.elements.playIcon.style.display = 'none';
            this.elements.pauseIcon.style.display = 'block';
        } else {
            this.elements.playIcon.style.display = 'block';
            this.elements.pauseIcon.style.display = 'none';
        }
    }
    
    /**
     * อัปเดตข้อมูลสื่อ
     */
    updateMediaInfo() {
        this.elements.currentIndexSpan.textContent = this.currentIndex + 1;
    }

    /**
     * ดึงข้อมูลสื่อปัจจุบัน
     * @returns {Object|null} สื่อปัจจุบันหรือ null ถ้าไม่มีสื่อ
     */
    getCurrentMedia() {
        if (this.mediaList.length === 0 || this.currentIndex < 0 || this.currentIndex >= this.mediaList.length) {
            return null;
        }
        return this.mediaList[this.currentIndex];
    }

    /**
     * แสดง Upload Modal
     * เปิด modal สำหรับอัปโหลดไฟล์ใหม่
     */
    showUploadModal() {
        this.elements.uploadModal.classList.add('visible');
        this.elements.uploadModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // ป้องกันการ scroll ของ body
    }

    /**
     * ซ่อน Upload Modal
     * ปิด modal การอัปโหลดไฟล์
     */
    hideUploadModal() {
        this.elements.uploadModal.classList.add('hidden');
        this.elements.uploadModal.classList.remove('visible');
        document.body.style.overflow = ''; // คืนค่าการ scroll ของ body
    }

    /**
     * เลือกไฟล์จากอุปกรณ์
     * เปิด file picker สำหรับเลือกไฟล์
     */
    selectFilesFromDevice() {
        this.elements.fileInput.accept = 'image/*,video/*'; // รับทั้งรูปและวิดีโอ
        this.elements.fileInput.multiple = true; // เลือกหลายไฟล์ได้
        this.elements.fileInput.click();
    }

    /**
     * เปิดกล้องสำหรับถ่ายรูป/วิดีโอ
     * ใช้ Camera API ของเบราว์เซอร์
     */
    async captureFromCamera() {
        try {
            // ขอ permission สำหรับใช้กล้อง
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // สร้าง video element สำหรับแสดง camera preview
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            
            // สร้าง canvas สำหรับ capture
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // สร้าง UI สำหรับ camera
            this.showCameraInterface(video, canvas, stream);
            
        } catch (error) {
            console.error('❌ ไม่สามารถเข้าถึงกล้องได้:', error);
            this.showErrorMessage('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
        }
    }

    /**
     * แสดง Camera Interface
     * @param {HTMLVideoElement} video 
     * @param {HTMLCanvasElement} canvas 
     * @param {MediaStream} stream 
     */
    showCameraInterface(video, canvas, stream) {
        // สร้าง camera modal
        const cameraModal = document.createElement('div');
        cameraModal.className = 'camera-modal';
        cameraModal.innerHTML = `
            <div class="camera-container">
                <div class="camera-preview"></div>
                <div class="camera-controls">
                    <button id="capture-photo">📷 ถ่ายรูป</button>
                    <button id="start-record">🎥 บันทึกวิดีโอ</button>
                    <button id="close-camera">❌ ปิด</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(cameraModal);
        cameraModal.querySelector('.camera-preview').appendChild(video);
        
        // Event listeners สำหรับ camera controls
        const captureBtn = cameraModal.querySelector('#capture-photo');
        const recordBtn = cameraModal.querySelector('#start-record');
        const closeBtn = cameraModal.querySelector('#close-camera');
        
        captureBtn.addEventListener('click', () => {
            this.capturePhoto(video, canvas);
        });
        
        recordBtn.addEventListener('click', () => {
            this.startVideoRecording(stream);
        });
        
        closeBtn.addEventListener('click', () => {
            this.closeCameraInterface(cameraModal, stream);
        });
    }

    /**
     * ถ่ายรูป
     * @param {HTMLVideoElement} video 
     * @param {HTMLCanvasElement} canvas 
     */
    capturePhoto(video, canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            this.addFileToSelection(file);
            this.showSuccessMessage('ถ่ายรูปสำเร็จ!');
        }, 'image/jpeg', 0.9);
    }

    /**
     * เริ่มบันทึกวิดีโอ
     * @param {MediaStream} stream 
     */
    startVideoRecording(stream) {
        // Implementation for video recording would go here
        this.showErrorMessage('ฟีเจอร์บันทึกวิดีโอยังไม่พร้อมใช้งาน');
    }

    /**
     * ปิด Camera Interface
     * @param {HTMLElement} cameraModal 
     * @param {MediaStream} stream 
     */
    closeCameraInterface(cameraModal, stream) {
        // หยุด camera stream
        stream.getTracks().forEach(track => track.stop());
        
        // ลบ camera modal
        document.body.removeChild(cameraModal);
    }

    /**
     * เพิ่ม YouTube URL
     * แสดง prompt สำหรับใส่ YouTube URL
     */
    promptYouTubeUrl() {
        const url = prompt('กรุณาใส่ YouTube URL:');
        
        if (url && this.isYouTubeUrl(url)) {
            const videoId = this.extractYouTubeVideoId(url);
            if (videoId) {
                const youtubeMedia = {
                    type: 'youtube',
                    url: url,
                    videoId: videoId,
                    name: `YouTube Video: ${videoId}`,
                    duration: 30000, // ค่าเริ่มต้น 30 วินาที
                    isUserUpload: true
                };
                
                this.addMediaToSelection(youtubeMedia);
                this.showSuccessMessage('เพิ่ม YouTube URL สำเร็จ!');
            } else {
                this.showErrorMessage('ไม่สามารถแยก Video ID ได้');
            }
        } else if (url) {
            this.showErrorMessage('URL ไม่ใช่ YouTube URL ที่ถูกต้อง');
        }
    }

    /**
     * จัดการเมื่อผู้ใช้เลือกไฟล์
     * @param {FileList} files 
     */
    handleFileSelection(files) {
        Array.from(files).forEach(file => {
            this.addFileToSelection(file);
        });
        
        this.showSuccessMessage(`เลือกไฟล์ ${files.length} ไฟล์`);
    }

    /**
     * เพิ่มไฟล์เข้าในรายการที่เลือก
     * @param {File} file 
     */
    addFileToSelection(file) {
        const media = this.createMediaFromFile(file);
        this.addMediaToSelection(media);
    }

    /**
     * เพิ่ม Media เข้าในรายการที่เลือก
     * @param {Object} media 
     */
    addMediaToSelection(media) {
        this.selectedFiles.push(media);
        this.updatePreviewList();
        this.showUploadPreview();
    }

    /**
     * สร้าง Media Object จาก File
     * @param {File} file 
     * @returns {Object}
     */
    createMediaFromFile(file) {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        
        return {
            type: isVideo ? 'video' : 'image',
            url: url,
            name: file.name,
            size: file.size,
            duration: isVideo ? 0 : 5000, // รูปภาพ 5 วินาที, วิดีโอจะใช้ความยาวจริง
            isUserUpload: true,
            file: file
        };
    }

    /**
     * อัปเดตรายการตัวอย่างไฟล์ที่เลือก
     */
    updatePreviewList() {
        const previewList = this.elements.previewList;
        previewList.innerHTML = '';
        
        this.selectedFiles.forEach((media, index) => {
            const previewItem = this.createPreviewItem(media, index);
            previewList.appendChild(previewItem);
        });
        
        // แสดง/ซ่อนปุ่มตามจำนวนไฟล์
        const hasFiles = this.selectedFiles.length > 0;
        this.elements.clearSelection.style.display = hasFiles ? 'block' : 'none';
        this.elements.addToPlaylist.style.display = hasFiles ? 'block' : 'none';
    }

    /**
     * สร้างรายการตัวอย่างไฟล์
     * @param {Object} media 
     * @param {number} index 
     * @returns {HTMLElement}
     */
    createPreviewItem(media, index) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
            <div class="preview-thumbnail">
                ${media.type === 'image' ? 
                    `<img src="${media.url}" alt="${media.name}">` : 
                    media.type === 'video' ?
                    `<video src="${media.url}" muted></video>` :
                    `<div class="youtube-thumb">▶️ YouTube</div>`
                }
            </div>
            <div class="preview-info">
                <div class="preview-name">${media.name}</div>
                <div class="preview-type">${media.type.toUpperCase()}</div>
            </div>
            <button class="remove-preview" data-index="${index}">❌</button>
        `;
        
        // Event listener สำหรับปุ่มลบ
        const removeBtn = item.querySelector('.remove-preview');
        removeBtn.addEventListener('click', () => {
            this.removeFromSelection(index);
        });
        
        return item;
    }

    /**
     * ลบไฟล์จากรายการที่เลือก
     * @param {number} index 
     */
    removeFromSelection(index) {
        const media = this.selectedFiles[index];
        
        // ปล่อย Object URL ถ้าเป็น blob
        if (media.url && media.url.startsWith('blob:')) {
            URL.revokeObjectURL(media.url);
        }
        
        this.selectedFiles.splice(index, 1);
        this.updatePreviewList();
        
        if (this.selectedFiles.length === 0) {
            this.hideUploadPreview();
        }
    }

    /**
     * ล้างไฟล์ที่เลือกทั้งหมด
     */
    clearSelectedFiles() {
        // ปล่อย Object URLs ทั้งหมด
        this.selectedFiles.forEach(media => {
            if (media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        this.selectedFiles = [];
        this.updatePreviewList();
        this.hideUploadPreview();
    }

    /**
     * เพิ่มไฟล์ที่เลือกเข้าในเพลย์ลิสต์
     */
    addFilesToPlaylist() {
        if (this.selectedFiles.length === 0) {
            this.showErrorMessage('ไม่มีไฟล์ที่เลือก');
            return;
        }
        
        // เพิ่มไฟล์เข้าในเพลย์ลิสต์
        this.selectedFiles.forEach(media => {
            this.mediaList.push({ ...media });
            this.uploadedFiles.push({ ...media });
        });
        
        // อัปเดต UI
        this.elements.totalCountSpan.textContent = this.mediaList.length;
        
        // ล้างรายการที่เลือก
        this.selectedFiles = [];
        this.updatePreviewList();
        this.hideUploadPreview();
        this.hideUploadModal();
        
        this.showSuccessMessage(`เพิ่มไฟล์เข้าในเพลย์ลิสต์สำเร็จ!`);
    }

    /**
     * แสดงตัวอย่างการอัปโหลด
     */
    showUploadPreview() {
        this.elements.uploadPreview.classList.add('visible');
        this.elements.uploadPreview.classList.remove('hidden');
    }

    /**
     * ซ่อนตัวอย่างการอัปโหลด
     */
    hideUploadPreview() {
        this.elements.uploadPreview.classList.add('hidden');
        this.elements.uploadPreview.classList.remove('visible');
    }

    /**
     * ลบไฟล์จากเพลย์ลิสต์
     * @param {number} index 
     */
    removeFromPlaylist(index) {
        const media = this.mediaList[index];
        
        // ปล่อย Object URL ถ้าเป็น user upload
        if (media.isUserUpload && media.url && media.url.startsWith('blob:')) {
            URL.revokeObjectURL(media.url);
        }
        
        this.mediaList.splice(index, 1);
        this.elements.totalCountSpan.textContent = this.mediaList.length;
        
        // ลบจาก uploadedFiles ด้วย
        const uploadIndex = this.uploadedFiles.findIndex(file => file.url === media.url);
        if (uploadIndex !== -1) {
            this.uploadedFiles.splice(uploadIndex, 1);
        }
    }

    /**
     * แสดงข้อความสำเร็จ
     * @param {string} message 
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * แสดงข้อความผิดพลาด
     * @param {string} message 
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * แสดงข้อความ
     * @param {string} message 
     * @param {string} type 
     */
    showMessage(message, type = 'info') {
        // สร้าง toast message
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // แสดง toast
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        
        // ซ่อน toast หลัง 3 วินาที
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    /**
     * ล้าง Timers ทั้งหมด
     * หยุดการทำงานของ timers ทั้งหมดเพื่อป้องกัน memory leak
     */
    clearTimers() {
        // ล้าง timer สำหรับสื่อปัจจุบัน
        if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }
        
        // ล้าง timer สำหรับ progress bar
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
    }
    
    /**
     * ล้าง Controls Timer
     * หยุด timer ที่ใช้สำหรับซ่อน controls อัตโนมัติ
     */
    clearControlsTimer() {
        if (this.controlsTimer) {
            clearTimeout(this.controlsTimer);
            this.controlsTimer = null;
        }
    }
    
    /**
     * เซ็ตอัพการล้าง Cache อัตโนมัติ
     * ล้าง cache ทุก 30 นาที และเมื่อแอปเริ่มต้น
     */
    setupAutoCacheClear() {
        // ล้าง cache เมื่อเริ่มต้นแอป
        this.clearBrowserCache();
        
        // ล้าง cache อัตโนมัติทุก 30 นาที
        setInterval(() => {
            this.clearBrowserCache();
            console.log('🧹 Auto cache clear ทำงานแล้ว');
        }, 30 * 60 * 1000); // 30 นาที
        
        console.log('✅ Auto cache clear เปิดใช้งานแล้ว (ทุก 30 นาที)');
    }
    
    /**
     * สร้างปุ่มล้าง Cache
     * เพิ่มปุ่มล้าง cache ในมุมบนซ้าย
     */
    createClearCacheButton() {
        // สร้างปุ่มล้าง cache
        const clearCacheBtn = document.createElement('button');
        clearCacheBtn.id = 'clear-cache-btn';
        clearCacheBtn.innerHTML = '🧹 ล้าง Cache';
        clearCacheBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // เพิ่ม hover effect
        clearCacheBtn.onmouseenter = () => {
            clearCacheBtn.style.background = 'rgba(34, 197, 94, 0.8)';
            clearCacheBtn.style.transform = 'scale(1.05)';
        };
        clearCacheBtn.onmouseleave = () => {
            clearCacheBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            clearCacheBtn.style.transform = 'scale(1)';
        };
        
        // เพิ่ม event listener
        clearCacheBtn.addEventListener('click', () => {
            this.manualCacheClear();
        });
        
        // เพิ่มเข้าไปใน DOM
        document.body.appendChild(clearCacheBtn);
        this.elements.clearCacheBtn = clearCacheBtn;
        
        console.log('✅ สร้างปุ่มล้าง Cache แล้ว');
    }
    
    /**
     * ล้าง Browser Cache
     * ล้าง cache ทั้งหมดของเบราว์เซอร์
     */
    async clearBrowserCache() {
        try {
            // ล้าง Service Worker Cache
            if ('serviceWorker' in navigator && 'caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('🧹 ล้าง Service Worker Cache แล้ว');
            }
            
            // ล้าง localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.clear();
                sessionStorage.clear();
                console.log('🧹 ล้าง Local Storage แล้ว');
            }
            
            // ล้าง IndexedDB (ถ้ามี)
            if ('indexedDB' in window) {
                try {
                    // ลิสต์ databases ที่อาจมี
                    const dbsToDelete = ['theloop-pwa', 'media-cache', 'user-data'];
                    
                    for (const dbName of dbsToDelete) {
                        const deleteRequest = indexedDB.deleteDatabase(dbName);
                        deleteRequest.onsuccess = () => {
                            console.log(`🧹 ล้าง IndexedDB: ${dbName}`);
                        };
                    }
                } catch (error) {
                    console.log('⚠️ ไม่สามารถล้าง IndexedDB ได้:', error);
                }
            }
            
            // ล้าง Blob URLs ที่เก่า
            this.cleanupOldBlobUrls();
            
            console.log('✅ ล้าง Browser Cache สำเร็จ');
            return true;
            
        } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดในการล้าง Cache:', error);
            return false;
        }
    }
    
    /**
     * ล้าง Cache แบบ Manual
     * เรียกใช้เมื่อผู้ใช้กดปุ่มล้าง cache
     */
    async manualCacheClear() {
        // แสดง loading บนปุ่ม
        const originalText = this.elements.clearCacheBtn.innerHTML;
        this.elements.clearCacheBtn.innerHTML = '🔄 กำลังล้าง...';
        this.elements.clearCacheBtn.disabled = true;
        
        const success = await this.clearBrowserCache();
        
        if (success) {
            this.showSuccessMessage('ล้าง Cache สำเร็จ! 🧹');
            
            // แสดงผลสำเร็จบนปุ่ม
            this.elements.clearCacheBtn.innerHTML = '✅ ล้างแล้ว';
            this.elements.clearCacheBtn.style.background = 'rgba(34, 197, 94, 0.8)';
            
            // กลับไปเป็นปกติหลัง 2 วินาที
            setTimeout(() => {
                this.elements.clearCacheBtn.innerHTML = originalText;
                this.elements.clearCacheBtn.style.background = 'rgba(0, 0, 0, 0.7)';
                this.elements.clearCacheBtn.disabled = false;
            }, 2000);
            
        } else {
            this.showErrorMessage('เกิดข้อผิดพลาดในการล้าง Cache');
            
            // กลับไปเป็นปกติ
            this.elements.clearCacheBtn.innerHTML = originalText;
            this.elements.clearCacheBtn.disabled = false;
        }
    }
    
    /**
     * ล้าง Blob URLs เก่า
     * ล้าง blob URLs ที่อาจถูกเก็บไว้ใน memory
     */
    cleanupOldBlobUrls() {
        // ล้าง blob URLs ในสื่อที่อัปโหลด
        this.uploadedFiles.forEach(media => {
            if (media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        // ล้างรายการสื่อที่เป็น user upload
        this.mediaList = this.mediaList.filter(media => !media.isUserUpload);
        this.uploadedFiles = [];
        
        // อัปเดต UI
        this.elements.totalCountSpan.textContent = this.mediaList.length;
        
        // ถ้าไม่มีสื่อเหลือ ให้โหลดสื่อตัวอย่างใหม่
        if (this.mediaList.length === 0) {
            this.loadSampleMedia();
            this.currentIndex = 0;
            this.updateMediaInfo();
            this.startSlideshow();
        } else {
            // ปรับ index ถ้าจำเป็น
            if (this.currentIndex >= this.mediaList.length) {
                this.currentIndex = 0;
            }
            this.updateMediaInfo();
            this.playCurrentMedia();
        }
        
        console.log('🧹 ล้าง Blob URLs เก่าแล้ว');
    }

    /**
     * เซ็ตอัพการล้าง Cache อัตโนมัติ
     * ล้าง cache ทุก 30 นาที และเมื่อแอปเริ่มต้น
     */
    setupAutoCacheClear() {
        // ล้าง cache เมื่อเริ่มต้นแอป
        this.clearBrowserCache();
        
        // ล้าง cache อัตโนมัติทุก 30 นาที
        setInterval(() => {
            this.clearBrowserCache();
            console.log('🧹 Auto cache clear ทำงานแล้ว');
        }, 30 * 60 * 1000); // 30 นาที
        
        console.log('✅ Auto cache clear เปิดใช้งานแล้ว (ทุก 30 นาที)');
    }
    
    /**
     * สร้างปุ่มล้าง Cache
     * เพิ่มปุ่มล้าง cache ในมุมบนซ้าย
     */
    createClearCacheButton() {
        // สร้างปุ่มล้าง cache
        const clearCacheBtn = document.createElement('button');
        clearCacheBtn.id = 'clear-cache-btn';
        clearCacheBtn.innerHTML = '🧹 ล้าง Cache';
        clearCacheBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // เพิ่ม hover effect
        clearCacheBtn.onmouseenter = () => {
            clearCacheBtn.style.background = 'rgba(34, 197, 94, 0.8)';
            clearCacheBtn.style.transform = 'scale(1.05)';
        };
        clearCacheBtn.onmouseleave = () => {
            clearCacheBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            clearCacheBtn.style.transform = 'scale(1)';
        };
        
        // เพิ่ม event listener
        clearCacheBtn.addEventListener('click', () => {
            this.manualCacheClear();
        });
        
        // เพิ่มเข้าไปใน DOM
        document.body.appendChild(clearCacheBtn);
        this.elements.clearCacheBtn = clearCacheBtn;
        
        console.log('✅ สร้างปุ่มล้าง Cache แล้ว');
    }
    
    /**
     * ล้าง Browser Cache
     * ล้าง cache ทั้งหมดของเบราว์เซอร์
     */
    async clearBrowserCache() {
        try {
            // ล้าง Service Worker Cache
            if ('serviceWorker' in navigator && 'caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('🧹 ล้าง Service Worker Cache แล้ว');
            }
            
            // ล้าง localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.clear();
                sessionStorage.clear();
                console.log('🧹 ล้าง Local Storage แล้ว');
            }
            
            // ล้าง IndexedDB (ถ้ามี)
            if ('indexedDB' in window) {
                try {
                    // ลิสต์ databases ที่อาจมี
                    const dbsToDelete = ['theloop-pwa', 'media-cache', 'user-data'];
                    
                    for (const dbName of dbsToDelete) {
                        const deleteRequest = indexedDB.deleteDatabase(dbName);
                        deleteRequest.onsuccess = () => {
                            console.log(`🧹 ล้าง IndexedDB: ${dbName}`);
                        };
                    }
                } catch (error) {
                    console.log('⚠️ ไม่สามารถล้าง IndexedDB ได้:', error);
                }
            }
            
            // ล้าง Blob URLs ที่เก่า
            this.cleanupOldBlobUrls();
            
            console.log('✅ ล้าง Browser Cache สำเร็จ');
            return true;
            
        } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดในการล้าง Cache:', error);
            return false;
        }
    }
    
    /**
     * ล้าง Cache แบบ Manual
     * เรียกใช้เมื่อผู้ใช้กดปุ่มล้าง cache
     */
    async manualCacheClear() {
        // แสดง loading บนปุ่ม
        const originalText = this.elements.clearCacheBtn.innerHTML;
        this.elements.clearCacheBtn.innerHTML = '🔄 กำลังล้าง...';
        this.elements.clearCacheBtn.disabled = true;
        
        const success = await this.clearBrowserCache();
        
        if (success) {
            this.showSuccessMessage('ล้าง Cache สำเร็จ! 🧹');
            
            // แสดงผลสำเร็จบนปุ่ม
            this.elements.clearCacheBtn.innerHTML = '✅ ล้างแล้ว';
            this.elements.clearCacheBtn.style.background = 'rgba(34, 197, 94, 0.8)';
            
            // กลับไปเป็นปกติหลัง 2 วินาที
            setTimeout(() => {
                this.elements.clearCacheBtn.innerHTML = originalText;
                this.elements.clearCacheBtn.style.background = 'rgba(0, 0, 0, 0.7)';
                this.elements.clearCacheBtn.disabled = false;
            }, 2000);
            
        } else {
            this.showErrorMessage('เกิดข้อผิดพลาดในการล้าง Cache');
            
            // กลับไปเป็นปกติ
            this.elements.clearCacheBtn.innerHTML = originalText;
            this.elements.clearCacheBtn.disabled = false;
        }
    }
    
    /**
     * ล้าง Blob URLs เก่า
     * ล้าง blob URLs ที่อาจถูกเก็บไว้ใน memory
     */
    cleanupOldBlobUrls() {
        // ล้าง blob URLs ในสื่อที่อัปโหลด
        this.uploadedFiles.forEach(media => {
            if (media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        // ล้างรายการสื่อที่เป็น user upload
        this.mediaList = this.mediaList.filter(media => !media.isUserUpload);
        this.uploadedFiles = [];
        
        // อัปเดต UI
        this.elements.totalCountSpan.textContent = this.mediaList.length;
        
        // ถ้าไม่มีสื่อเหลือ ให้โหลดสื่อตัวอย่างใหม่
        if (this.mediaList.length === 0) {
            this.loadSampleMedia();
            this.currentIndex = 0;
            this.updateMediaInfo();
            this.startSlideshow();
        } else {
            // ปรับ index ถ้าจำเป็น
            if (this.currentIndex >= this.mediaList.length) {
                this.currentIndex = 0;
            }
            this.updateMediaInfo();
            this.playCurrentMedia();
        }
        
        console.log('🧹 ล้าง Blob URLs เก่าแล้ว');
    }

    /**
     * เซ็ตอัพการล้าง Cache อัตโนมัติ
     * ล้าง cache ทุก 30 นาที และเมื่อแอปเริ่มต้น
     */
    setupAutoCacheClear() {
        // ล้าง cache เมื่อเริ่มต้นแอป
        this.clearBrowserCache();
        
        // ล้าง cache อัตโนมัติทุก 30 นาที
        setInterval(() => {
            this.clearBrowserCache();
            console.log('🧹 Auto cache clear ทำงานแล้ว');
        }, 30 * 60 * 1000); // 30 นาที
        
        console.log('✅ Auto cache clear เปิดใช้งานแล้ว (ทุก 30 นาที)');
    }
    
    /**
     * สร้างปุ่มล้าง Cache
     * เพิ่มปุ่มล้าง cache ในมุมบนซ้าย
     */
    createClearCacheButton() {
        // สร้างปุ่มล้าง cache
        const clearCacheBtn = document.createElement('button');
        clearCacheBtn.id = 'clear-cache-btn';
        clearCacheBtn.innerHTML = '🧹 ล้าง Cache';
        clearCacheBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // เพิ่ม hover effect
        clearCacheBtn.onmouseenter = () => {
            clearCacheBtn.style.background = 'rgba(34, 197, 94, 0.8)';
            clearCacheBtn.style.transform = 'scale(1.05)';
        };
        clearCacheBtn.onmouseleave = () => {
            clearCacheBtn.style.background = 'rgba(0, 0, 0, 0.7)';
            clearCacheBtn.style.transform = 'scale(1)';
        };
        
        // เพิ่ม event listener
        clearCacheBtn.addEventListener('click', () => {
            this.manualCacheClear();
        });
        
        // เพิ่มเข้าไปใน DOM
        document.body.appendChild(clearCacheBtn);
        this.elements.clearCacheBtn = clearCacheBtn;
        
        console.log('✅ สร้างปุ่มล้าง Cache แล้ว');
    }
    
    /**
     * ล้าง Browser Cache
     * ล้าง cache ทั้งหมดของเบราว์เซอร์
     */
    async clearBrowserCache() {
        try {
            // ล้าง Service Worker Cache
            if ('serviceWorker' in navigator && 'caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('🧹 ล้าง Service Worker Cache แล้ว');
            }
            
            // ล้าง localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.clear();
                sessionStorage.clear();
                console.log('🧹 ล้าง Local Storage แล้ว');
            }
            
            // ล้าง IndexedDB (ถ้ามี)
            if ('indexedDB' in window) {
                try {
                    // ลิสต์ databases ที่อาจมี
                    const dbsToDelete = ['theloop-pwa', 'media-cache', 'user-data'];
                    
                    for (const dbName of dbsToDelete) {
                        const deleteRequest = indexedDB.deleteDatabase(dbName);
                        deleteRequest.onsuccess = () => {
                            console.log(`🧹 ล้าง IndexedDB: ${dbName}`);
                        };
                    }
                } catch (error) {
                    console.log('⚠️ ไม่สามารถล้าง IndexedDB ได้:', error);
                }
            }
            
            // ล้าง Blob URLs ที่เก่า
            this.cleanupOldBlobUrls();
            
            console.log('✅ ล้าง Browser Cache สำเร็จ');
            return true;
            
        } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดในการล้าง Cache:', error);
            return false;
        }
    }
    
    /**
     * ล้าง Cache แบบ Manual
     * เรียกใช้เมื่อผู้ใช้กดปุ่มล้าง cache
     */
    async manualCacheClear() {
        // แสดง loading บนปุ่ม
        const originalText = this.elements.clearCacheBtn.innerHTML;
        this.elements.clearCacheBtn.innerHTML = '🔄 กำลังล้าง...';
        this.elements.clearCacheBtn.disabled = true;
        
        const success = await this.clearBrowserCache();
        
        if (success) {
            this.showSuccessMessage('ล้าง Cache สำเร็จ! 🧹');
            
            // แสดงผลสำเร็จบนปุ่ม
            this.elements.clearCacheBtn.innerHTML = '✅ ล้างแล้ว';
            this.elements.clearCacheBtn.style.background = 'rgba(34, 197, 94, 0.8)';
            
            // กลับไปเป็นปกติหลัง 2 วินาที
            setTimeout(() => {
                this.elements.clearCacheBtn.innerHTML = originalText;
                this.elements.clearCacheBtn.style.background = 'rgba(0, 0, 0, 0.7)';
                this.elements.clearCacheBtn.disabled = false;
            }, 2000);
            
        } else {
            this.showErrorMessage('เกิดข้อผิดพลาดในการล้าง Cache');
            
            // กลับไปเป็นปกติ
            this.elements.clearCacheBtn.innerHTML = originalText;
            this.elements.clearCacheBtn.disabled = false;
        }
    }
    
    /**
     * ล้าง Blob URLs เก่า
     * ล้าง blob URLs ที่อาจถูกเก็บไว้ใน memory
     */
    cleanupOldBlobUrls() {
        // ล้าง blob URLs ในสื่อที่อัปโหลด
        this.uploadedFiles.forEach(media => {
            if (media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        // ล้างรายการสื่อที่เป็น user upload
        this.mediaList = this.mediaList.filter(media => !media.isUserUpload);
        this.uploadedFiles = [];
        
        // อัปเดต UI
        this.elements.totalCountSpan.textContent = this.mediaList.length;
        
        // ถ้าไม่มีสื่อเหลือ ให้โหลดสื่อตัวอย่างใหม่
        if (this.mediaList.length === 0) {
            this.loadSampleMedia();
            this.currentIndex = 0;
            this.updateMediaInfo();
            this.startSlideshow();
        } else {
            // ปรับ index ถ้าจำเป็น
            if (this.currentIndex >= this.mediaList.length) {
                this.currentIndex = 0;
            }
            this.updateMediaInfo();
            this.playCurrentMedia();
        }
        
        console.log('🧹 ล้าง Blob URLs เก่าแล้ว');
    }

    /**
     * ทำลาย App (สำหรับการ cleanup)
     * ล้างข้อมูลและปล่อย resources ทั้งหมดเพื่อป้องกัน memory leak
     * ควรเรียกใช้เมื่อปิดแอปหรือ reload หน้า
     */
    destroy() {
        // หยุดการเล่นและล้าง timers ทั้งหมด
        this.stopSlideshow();
        this.clearTimers();
        this.clearControlsTimer();
        
        // ปล่อย Object URLs ทั้งหมดสำหรับไฟล์ที่อัปโหลด
        this.uploadedFiles.forEach(media => {
            if (media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        // ปล่อย URLs ที่ยังเลือกอยู่แต่ยังไม่ได้เพิ่มในเพลย์ลิสต์
        this.selectedFiles.forEach(media => {
            if (media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        // ปล่อย URLs ในเพลย์ลิสต์ที่เป็น user upload
        this.mediaList.forEach(media => {
            if (media.isUserUpload && media.url && media.url.startsWith('blob:')) {
                URL.revokeObjectURL(media.url);
            }
        });
        
        // ล้าง cache ก่อนปิดแอป
        this.clearBrowserCache();
        
        console.log('🗑️ The Loop App ถูกทำลายแล้ว');
    }
}

// เริ่มต้นแอปเมื่อ DOM โหลดเสร็จ
// รอให้ HTML โหลดเสร็จก่อนเริ่มต้น JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // สร้าง instance ของแอปและเก็บไว้ใน global variable
    window.theLoopApp = new TheLoopApp();
});

// Export สำหรับการใช้งานภายนอก (เช่น ในระบบ module หรือ Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TheLoopApp;
}

