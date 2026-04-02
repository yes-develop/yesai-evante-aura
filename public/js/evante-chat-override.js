/**
 * EVANTE CHAT OVERRIDE
 * ======================
 * โหลดหลัง app.js — ปิด Firebase ทั้งหมดแล้วแทนด้วย Evante API + Laravel Reverb
 *
 * สิ่งที่ไฟล์นี้ทำ:
 *  1. Mock window.firebase (SDK) → ป้องกัน error จาก storage.ref() / database()
 *  2. Fetch interceptor → บล็อก HTTP call ไป firebaseio.com / firebasedatabase.app
 *  3. ล้าง AppConfig.FIREBASE_REALTIME_URL → Firebase REST calls ล้มเหลวแบบ silent
 *  4. Override sendToFirebase() → noop (returns success, ข้อความถูก save ผ่าน Laravel อยู่แล้ว)
 *  5. Override checkFirebaseForNewMessages() → ใช้ /api/line-conversations แทน
 *  6. Polling Evante API ทุก 5 วิ สำหรับ conversation list (ถ้ายังไม่มี interval จาก app.js)
 *  7. Reverb/Echo ถูก setup ใน chat.js อยู่แล้ว — ไม่ต้อง setup ซ้ำ
 */
(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────
    // 1. MOCK window.firebase SDK
    //    ครอบ storage, database, app ทั้งหมดด้วย noop เพื่อไม่ให้ app.js crash
    // ─────────────────────────────────────────────────────────────────────────
    (function mockFirebaseSDK() {
        var noopRef = {
            on: function () { return noopRef; },
            off: function () {},
            once: function () {
                return Promise.resolve({
                    val: function () { return null; },
                    forEach: function () {}
                });
            },
            set: function () { return Promise.resolve(); },
            push: function () { return { key: 'noop-' + Date.now() }; },
            orderByChild: function () { return noopRef; },
            limitToLast: function () { return noopRef; },
            equalTo: function () { return noopRef; },
            child: function () { return noopRef; }
        };

        var noopUploadTask = {
            on: function (event, progress, error, complete) {
                if (typeof complete === 'function') {
                    setTimeout(complete, 0);
                }
            },
            snapshot: {
                ref: {
                    getDownloadURL: function () { return Promise.resolve(''); }
                },
                metadata: { generation: 'noop' }
            }
        };

        var noopStorageRef = {
            child: function () { return noopStorageRef; },
            put: function () { return noopUploadTask; },
            getDownloadURL: function () { return Promise.resolve(''); }
        };

        var noopStorage = {
            ref: function () { return noopStorageRef; }
        };

        var noopDatabase = {
            ref: function () { return noopRef; }
        };

        if (!window.firebase) {
            window.firebase = {
                database: function () { return noopDatabase; },
                storage: function () { return noopStorage; },
                app: function () { return {}; }
            };
            console.log('[EvanteOverride] window.firebase mocked (SDK was not loaded)');
        } else {
            // SDK อยู่แล้ว — override methods แต่ละตัว
            window.firebase.database = function () { return noopDatabase; };
            window.firebase.storage = function () { return noopStorage; };
            console.log('[EvanteOverride] window.firebase SDK methods overridden');
        }
    })();


    // ─────────────────────────────────────────────────────────────────────────
    // 2. FETCH INTERCEPTOR — บล็อก HTTP call ที่วิ่งไป Firebase REST API
    //    คืน response ว่างๆ แทนเพื่อไม่ให้ Promise reject และไม่ให้ข้อมูลออกนอก
    // ─────────────────────────────────────────────────────────────────────────
    (function interceptFirebaseFetch() {
        var _originalFetch = window.fetch;
        window.fetch = function (url, options) {
            var urlStr = String(url || '');
            if (
                urlStr.indexOf('firebaseio.com') !== -1 ||
                urlStr.indexOf('firebasedatabase.app') !== -1 ||
                urlStr.indexOf('firebasestorage.googleapis.com') !== -1
            ) {
                console.log('[EvanteOverride] Blocked Firebase fetch → ' + urlStr.substring(0, 100));
                return Promise.resolve(
                    new Response('null', {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                );
            }
            return _originalFetch.apply(this, arguments);
        };
        console.log('[EvanteOverride] Fetch interceptor active');
    })();


    // ─────────────────────────────────────────────────────────────────────────
    // 3. ล้าง FIREBASE_REALTIME_URL ใน AppConfig
    //    ทำให้ fetch(firebaseUrl + '/chats.json') กลายเป็น fetch('/chats.json')
    //    ซึ่งจะ 404 และถูก catch ใน try-catch ของ app.js อยู่แล้ว
    //    (ป้องกัน fetch interceptor ไม่เพียงพอในกรณีที่ URL ไม่ตรง pattern)
    // ─────────────────────────────────────────────────────────────────────────
    function clearFirebaseConfig() {
        if (window.AppConfig) {
            window.AppConfig.FIREBASE_REALTIME_URL = '';
        }
    }
    clearFirebaseConfig();
    // รัน อีกครั้งหลัง DOMContentLoaded เพื่อ override กรณีที่ AppConfig ถูก set ทีหลัง
    document.addEventListener('DOMContentLoaded', clearFirebaseConfig);


    // ─────────────────────────────────────────────────────────────────────────
    // 4. OVERRIDE app.js FUNCTIONS ที่ยังเรียก Firebase
    //    ต้องรอให้ app.js โหลดก่อน — ใช้ setTimeout ขนาดเล็กน้อย
    // ─────────────────────────────────────────────────────────────────────────
    function overrideAppJsFunctions() {

        // 4a. sendToFirebase → noop (ส่งข้อความผ่าน Laravel + LINE API อยู่แล้ว)
        if (typeof sendToFirebase === 'function') {
            window.sendToFirebase = async function (messageData) {
                console.log('[EvanteOverride] sendToFirebase blocked — message saved via Laravel');
                return { success: true, message: 'Firebase write blocked; using Evante API' };
            };
        }

        // 4b. checkFirebaseForNewMessages → ดึงจาก /api/line-conversations แทน
        window.checkFirebaseForNewMessages = async function () {
            try {
                var res = await window._originalFetch
                    ? window._originalFetch('/api/line-conversations', { headers: { 'Accept': 'application/json' } })
                    : fetch('/api/line-conversations', { headers: { 'Accept': 'application/json' } });
                if (!res.ok) return false;
                var payload = await res.json();
                var messages = Array.isArray(payload) ? payload
                    : (Array.isArray(payload && payload.data) ? payload.data : []);
                if (messages.length > 0 && typeof upsertConversationListItem === 'function') {
                    // dedupe — upsert ทุก conversation ที่ได้มา
                    messages.forEach(function (msg) {
                        var lineUuid = msg.lineUuid || msg.line_uuid || '';
                        var text = msg.aiResponse || msg.userInput || msg.message || '';
                        var time = msg.time || msg.date || '';
                        if (lineUuid) {
                            upsertConversationListItem(lineUuid, text, time);
                        }
                    });
                }
                return false; // ไม่ได้ใช้ return value นี้จริงๆ
            } catch (e) {
                return false;
            }
        };

        // 4c. testFirebasePolling → noop debug stub
        window.testFirebasePolling = async function () {
            console.log('[EvanteOverride] Firebase polling disabled — using /api/line-conversations');
            return false;
        };

        // 4d. setupRealTimeListeners / setupFirebaseRealTimeListener / setupIntelligentPolling
        //     ทั้งหมดมี early return ใน app.js อยู่แล้ว แต่ override ซ้ำเพื่อความปลอดภัย
        if (typeof setupRealTimeListeners === 'function') {
            window.setupRealTimeListeners = function () {
                console.log('[EvanteOverride] setupRealTimeListeners blocked');
            };
        }
        if (typeof setupFirebaseRealTimeListener === 'function') {
            window.setupFirebaseRealTimeListener = function () {
                console.log('[EvanteOverride] setupFirebaseRealTimeListener blocked');
            };
        }

        console.log('[EvanteOverride] app.js Firebase functions overridden');
    }

    // รัน override ทันทีถ้า document โหลดแล้ว หรือรอ DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(overrideAppJsFunctions, 50);
        });
    } else {
        setTimeout(overrideAppJsFunctions, 50);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // 5. EVANTE API POLLING — ตั้ง interval poll /api/line-conversations
    //    app.js มี setInterval(checkForNewConversations, 5000) อยู่แล้ว
    //    ไฟล์นี้ไม่ตั้ง interval ซ้ำ — แต่เพิ่ม polling สำหรับ open chat
    //    (app.js ก็มี auto-refresh open chat ทุก 5 วิอยู่แล้ว เช่นกัน)
    //    → ใช้ window flag เพื่อไม่ให้ตั้งซ้ำ
    // ─────────────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        if (window._evanteOverridePollingStarted) return;
        window._evanteOverridePollingStarted = true;

        // Poll conversations เพิ่มเติมอีก 1 รอบหลังโหลดครั้งแรก (warm-up)
        setTimeout(function () {
            if (typeof renderConversationsList === 'function' && !document.querySelector('.conversation-item')) {
                console.log('[EvanteOverride] Warm-up: calling renderConversationsList()');
                renderConversationsList();
            }
        }, 1500);

        console.log('[EvanteOverride] Evante API polling active (app.js intervals reused)');
    });


    // ─────────────────────────────────────────────────────────────────────────
    // 6. อ่าน config จาก meta tags (สำหรับ Reverb — chat.js ใช้อยู่แล้ว)
    //    แค่ log เพื่อยืนยันว่า meta tags ครบ
    // ─────────────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        var evanteUrl = document.querySelector('meta[name="evante-api-url"]')?.content || '';
        var reverbKey = document.querySelector('meta[name="reverb-key"]')?.content || '';
        var reverbHost = document.querySelector('meta[name="reverb-host"]')?.content || '';
        var reverbPort = document.querySelector('meta[name="reverb-port"]')?.content || '';

        console.log('[EvanteOverride] Config loaded:', {
            evanteUrl: evanteUrl || '(not set)',
            reverbKey: reverbKey ? reverbKey.substring(0, 8) + '...' : '(not set)',
            reverbHost: reverbHost || '(not set)',
            reverbPort: reverbPort || '(not set)'
        });

        if (!reverbKey) {
            console.warn('[EvanteOverride] reverb-key meta tag missing — real-time via Reverb will not work');
        }
        if (!evanteUrl) {
            console.warn('[EvanteOverride] evante-api-url meta tag missing');
        }
    });


    console.log('[EvanteOverride] Loaded — Firebase blocked, Evante API active');

})();
