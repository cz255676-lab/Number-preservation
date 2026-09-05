import { DOMAIN_HTML_CONTENT } from "./domain-page.js";
import { VPN_HTML_CONTENT } from "./vpn-page.js";
import { SERVER_HTML_CONTENT } from "./server-page.js";

// 包含完整前端页面的 HTML 模板字符串
// 注意：前端代码中的 `${}` 和反引号已被安全转义，以确保 Worker 能正确解析
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>资产到期与加密账号看板</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: gradient 15s ease infinite;
            min-height: 100vh;
        }
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        .modal-enter { opacity: 0; transform: scale(0.9); }
        .modal-enter-active { opacity: 1; transform: scale(1); transition: all 0.3s ease; }
        
        /* 自定义 Toast 提示样式 */
        #toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .toast {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            color: #333;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-left: 4px solid #3b82f6;
            font-weight: 600;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }
    </style>
</head>
<body class="text-gray-800 font-sans p-4 md:p-8 relative">

    <div id="toast-container"></div>

    <div id="login-container" class="max-w-md mx-auto glass-panel rounded-3xl p-8 md:p-10 mt-16 md:mt-32 text-center transition-all">
        <div class="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i class="fa-solid fa-shield-halved text-4xl text-blue-600"></i>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-2">安全验证</h2>
        <p class="text-gray-600 mb-8 text-sm font-medium">为保护您的卡片、域名、VPN、云服务器与加密账号资产，请获取验证码登录。</p>
        
        <div class="mb-6 relative">
            <input type="text" id="authCode" placeholder="输入 6 位数验证码" maxlength="6" class="w-full px-4 py-4 rounded-xl border border-gray-300/50 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 shadow-inner placeholder-gray-400 placeholder:tracking-normal placeholder:text-base">
        </div>
        
        <div class="flex flex-col gap-4 mt-8">
            <button id="loginBtn" onclick="verifyCode()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> 登录面板
            </button>
            <button id="sendCodeBtn" onclick="sendAuthCode()" class="w-full bg-white/60 hover:bg-white/80 text-blue-700 font-bold py-3.5 px-4 rounded-xl border border-blue-200/50 transition-colors flex items-center justify-center gap-2">
                <i class="fa-brands fa-telegram text-xl"></i> 向 TG 机器人获取验证码
            </button>
        </div>
    </div>

    <div id="main-container" class="max-w-6xl mx-auto glass-panel rounded-3xl p-6 md:p-10 mt-4 md:mt-8 hidden">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-white/50 pb-4 gap-4">
            <div class="flex gap-4 md:gap-8 items-center justify-start md:justify-center w-full md:w-auto overflow-x-auto">
                <button onclick="switchTab('esim')" id="tab-esim" class="text-xl md:text-2xl font-extrabold text-blue-700 border-b-4 border-blue-600 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap">
                    <i class="fa-solid fa-sim-card"></i> eSIM 资产
                </button>
                <a href="/domains" class="text-xl md:text-2xl font-extrabold text-gray-500 border-b-4 border-transparent hover:text-cyan-600 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap opacity-70">
                    <i class="fa-solid fa-globe"></i> 域名资产
                </a>
                <a href="/vpns" class="text-xl md:text-2xl font-extrabold text-gray-500 border-b-4 border-transparent hover:text-indigo-600 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap opacity-70">
                    <i class="fa-solid fa-shield-halved"></i> VPN 资产
                </a>
                <a href="/servers" class="text-xl md:text-2xl font-extrabold text-gray-500 border-b-4 border-transparent hover:text-sky-600 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap opacity-70">
                    <i class="fa-solid fa-server"></i> 云服务器
                </a>
                <button onclick="switchTab('account')" id="tab-account" class="text-xl md:text-2xl font-extrabold text-gray-500 border-b-4 border-transparent hover:text-blue-500 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap opacity-70">
                    <i class="fa-solid fa-vault"></i> 账号库 <i class="fa-solid fa-lock text-sm opacity-50" id="tab-lock-icon"></i>
                </button>
            </div>
            
            <div class="flex gap-3 items-center flex-wrap justify-center">
                <span class="text-sm bg-white/50 px-4 py-2 rounded-full font-semibold shadow-sm hidden md:inline-block">
                    今日：<span id="current-date" class="text-blue-700">...</span>
                </span>
                
                <!-- eSIM 面板按钮 -->
                <button id="btn-add-esim" onclick="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> 添加号码
                </button>

                <button id="btn-test-reminder" onclick="sendTestReminder()" class="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2" title="向 Telegram 发送一次测试提醒">
                    <i class="fa-brands fa-telegram"></i> 测试提醒
                </button>
                
                <!-- 账号库 面板按钮 (默认隐藏) -->
                <button id="btn-add-account" onclick="openAccountModal()" class="hidden bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> 添加账号
                </button>
                <button id="btn-lock-vault" onclick="lockVault()" class="hidden bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2" title="立即锁定保险库">
                    <i class="fa-solid fa-lock"></i>
                </button>

                <button onclick="logout()" class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-full font-bold shadow-sm transition-colors flex items-center gap-2 border border-red-200" title="退出登录">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </div>

        <!-- ================= eSIM 视图 ================= -->
        <div id="view-esim" class="block">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" id="stats-container">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="esim-container">
                <div class="col-span-full text-center py-10 text-gray-700 font-medium text-lg" id="loading-text">
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i> 正在读取数据...
                </div>
            </div>
        </div>

        <!-- ================= 账号库 视图 ================= -->
        <div id="view-account" class="hidden">
            <!-- 锁定界面 -->
            <div id="vault-locked" class="max-w-md mx-auto glass-card rounded-3xl p-8 text-center mt-10 shadow-xl border-t-4 border-t-indigo-500">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <i class="fa-solid fa-shield-halved text-3xl text-indigo-600"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">端到端加密保险库</h3>
                <p class="text-gray-600 text-sm mb-6 leading-relaxed">您的密码将被 <strong>AES-GCM 算法</strong> 在本地高强度加密。云端仅存储不可读的密文，实现零知识安全。</p>
                <div class="mb-4 relative">
                    <input type="password" id="vaultPassword" placeholder="输入或设置保险库主密码" class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 shadow-inner text-center tracking-widest font-mono placeholder:tracking-normal placeholder:font-sans">
                </div>
                <button id="unlockVaultBtn" onclick="unlockVault()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                    <i class="fa-solid fa-key"></i> 本地派生密钥并解锁
                </button>
                <div class="mt-6 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p class="text-xs text-red-600 font-medium"><i class="fa-solid fa-triangle-exclamation mr-1"></i> <strong>极度重要：</strong>若遗忘此主密码，所有记录的账号密码将永久无法解密（不可逆）！</p>
                </div>
            </div>

            <!-- 解锁后的界面 -->
            <div id="vault-unlocked" class="hidden">
                <div class="mb-6 text-sm text-green-700 flex items-center justify-between bg-green-50/80 p-3 rounded-xl border border-green-200 shadow-sm backdrop-blur-sm">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-lock-open text-green-600 text-lg"></i>
                        <span>保险库已成功解密。<span class="hidden md:inline">密码在您的设备本地解密，传输与存储均为极高安全的 AES 密文。</span></span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="account-container">
                    <div class="col-span-full text-center py-10 text-gray-700 font-medium text-lg">
                        <i class="fa-solid fa-spinner fa-spin mr-2"></i> 正在读取并解密账号数据...
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- eSIM 添加/编辑弹窗 -->
    <div id="addModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl relative transition-all duration-300 transform scale-95 opacity-0 max-h-[95vh] overflow-y-auto" id="modalContent">
            <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl z-10">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2" id="modalTitle">
                <i class="fa-solid fa-file-circle-plus text-blue-600"></i> 新增 eSIM
            </h3>
            
            <form id="addForm" onsubmit="submitForm(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">卡片名称 (必填)</label>
                    <input type="text" id="simName" required placeholder="例如：KnowRoaming" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">手机号码带区号 (选填)</label>
                    <input type="text" id="simNumber" placeholder="例如：+1 234 567 8900" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">保号周期 (单位：天，必填)</label>
                    <input type="number" id="simCycle" required placeholder="例如：180" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">本次到期日 (必填)</label>
                    <input type="date" id="simExpire" required class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                </div>
                
                <div class="mb-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                    <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><i class="fa-solid fa-bell text-blue-500"></i> 定制 Telegram 提醒规则</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-gray-600 text-xs font-bold mb-1" title="距离到期还有多少天时开始发送电报提醒">提前提醒(天)</label>
                            <input type="number" id="simNotifyAdvance" placeholder="默认: 15" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 text-sm">
                        </div>
                        <div>
                            <label class="block text-gray-600 text-xs font-bold mb-1" title="每隔几天发送一次提醒">提醒间隔(天)</label>
                            <input type="number" id="simNotifyInterval" placeholder="默认: 1" min="1" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 text-sm">
                        </div>
                        <div>
                            <label class="block text-gray-600 text-xs font-bold mb-1" title="总共提醒的次数上限，0或留空表示不限制">最高次数限制</label>
                            <input type="number" id="simNotifyCount" placeholder="默认: 不限" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 text-sm">
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">已注册平台 (选填，用逗号或空格分隔)</label>
                    <input type="text" id="simPlatforms" placeholder="例如：Telegram, Google, ChatGPT" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">备注 / 保号要求 (选填)</label>
                    <input type="text" id="simRemark" placeholder="例如：发送短信到某号码 或 充值5元" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">充值链接 (选填)</label>
                    <input type="url" id="simRechargeUrl" maxlength="512" placeholder="https://运营商充值页面" autocomplete="off" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80">
                    <p class="text-xs text-gray-500 mt-1.5">填写后，Telegram 提醒消息下方会显示“充值”按钮。</p>
                </div>
                
                <button type="submit" id="submitBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors">
                    保存并监控
                </button>
            </form>
        </div>
    </div>

    <!-- 账号 添加/编辑弹窗 -->
    <div id="accountModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl relative transition-all duration-300 transform scale-95 opacity-0 max-h-[95vh] overflow-y-auto" id="accountModalContent">
            <button onclick="closeAccountModal()" class="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl z-10">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2" id="accountModalTitle">
                <i class="fa-solid fa-vault text-indigo-600"></i> 新增加密账号
            </h3>
            
            <form id="accountForm" onsubmit="submitAccountForm(event)">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">所属地区/平台 (必填)</label>
                    <input type="text" id="accRegion" required placeholder="例如：英国 / Google" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">账号/用户名 (必填)</label>
                    <input type="text" id="accAccount" required placeholder="例如：user@example.com" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-1">密码 (选填) <i class="fa-solid fa-shield-halved text-green-500 text-xs" title="此字段将端到端加密"></i></label>
                    <div class="relative">
                        <input type="password" id="accPassword" placeholder="将被 AES-GCM 加密保护" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 font-mono">
                        <button type="button" onclick="togglePasswordVisibility('accPassword', 'accPwdIcon')" class="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600">
                            <i id="accPwdIcon" class="fa-solid fa-eye-slash"></i>
                        </button>
                    </div>
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">备注选项 (明文，选填)</label>
                    <textarea id="accRemark" placeholder="例如：使用某个手机号注册，辅助邮箱等..." rows="3" class="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80"></textarea>
                </div>
                
                <button type="submit" id="submitAccountBtn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
                    <i class="fa-solid fa-lock"></i> 加密并保存
                </button>
            </form>
        </div>
    </div>

    <!-- 通用确认弹窗 -->
    <div id="confirmModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="glass-card w-full max-w-sm rounded-2xl p-6 shadow-2xl relative transition-all duration-300 transform scale-95 opacity-0 text-center" id="confirmModalContent">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm" id="confirmIconBg">
                <i class="fa-solid fa-triangle-exclamation text-3xl" id="confirmIcon"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2" id="confirmTitle">确认操作</h3>
            <p class="text-gray-600 mb-6 text-sm whitespace-pre-line" id="confirmMessage">确定要执行此操作吗？</p>
            
            <div class="flex gap-4 w-full">
                <button onclick="closeConfirmModal()" class="flex-1 bg-white/60 hover:bg-white/80 text-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-200/50 shadow-sm transition-colors">
                    取消
                </button>
                <button id="confirmActionBtn" class="flex-1 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                    确定
                </button>
            </div>
        </div>
    </div>

    <script>
        // API 路由前缀
        const WORKER_API_URL = "/api/esims";
        const WORKER_API_ACCOUNT_URL = "/api/accounts";
        const TEST_REMINDER_API_URL = "/api/reminders/test";
        
        let esimData = []; 
        let accountData = [];
        let countdownInterval;
        let editingId = null; 
        let editingAccountId = null;
        let currentTab = 'esim';

        // ================= 端到端加密 (E2EE) 核心逻辑 =================
        let vaultMasterKey = null; // 内存中保存的 AES-GCM 密钥，刷新即焚
        const VAULT_SALT = new TextEncoder().encode("ESIM_VAULT_SECURE_SALT"); // 固定 Salt

        // ArrayBuffer 转 Base64
        function bufferToBase64(buf) {
            let binary = '';
            let bytes = new Uint8Array(buf);
            let len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }

        // Base64 转 ArrayBuffer
        function base64ToBuffer(base64) {
            let binary_string = window.atob(base64);
            let len = binary_string.length;
            let bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes.buffer;
        }

        // 派生加密密钥
        async function deriveCryptoKey(password) {
            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
            );
            return window.crypto.subtle.deriveKey(
                { name: "PBKDF2", salt: VAULT_SALT, iterations: 100000, hash: "SHA-256" },
                keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
            );
        }

        // 加密字符串
        async function encryptString(plainText, key) {
            if (!plainText) return "";
            try {
                const enc = new TextEncoder();
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const cipherBuffer = await window.crypto.subtle.encrypt(
                    { name: "AES-GCM", iv: iv }, key, enc.encode(plainText)
                );
                const ivBase64 = bufferToBase64(iv);
                const cipherBase64 = bufferToBase64(cipherBuffer);
                return \`AES-GCM:\${ivBase64}:\${cipherBase64}\`;
            } catch (e) {
                console.error("加密失败", e);
                throw new Error("加密失败");
            }
        }

        // 解密字符串
        async function decryptString(encryptedText, key) {
            if (!encryptedText) return "";
            if (!encryptedText.startsWith("AES-GCM:")) return encryptedText; // 兼容未加密的旧数据
            try {
                const parts = encryptedText.split(":");
                const iv = new Uint8Array(base64ToBuffer(parts[1]));
                const cipher = base64ToBuffer(parts[2]);
                const plainBuffer = await window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv }, key, cipher
                );
                return new TextDecoder().decode(plainBuffer);
            } catch (e) {
                console.error("解密失败", e);
                return "🔒解密失败(主密码错误)";
            }
        }

        // ================= 工具函数 =================
        function escapeHtml(unsafe) {
            return (unsafe || "").toString()
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        }

        function showToast(message) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = \`<i class="fa-solid fa-circle-check text-blue-500 mr-2"></i>\${message}\`;
            container.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // 标签页切换逻辑
        function switchTab(tab) {
            currentTab = tab;
            const tabEsim = document.getElementById('tab-esim');
            const tabAccount = document.getElementById('tab-account');
            const viewEsim = document.getElementById('view-esim');
            const viewAccount = document.getElementById('view-account');
            const btnAddEsim = document.getElementById('btn-add-esim');
            const btnTestReminder = document.getElementById('btn-test-reminder');
            const btnAddAccount = document.getElementById('btn-add-account');
            const btnLockVault = document.getElementById('btn-lock-vault');

            if(tab === 'esim') {
                tabEsim.className = "text-xl md:text-2xl font-extrabold text-blue-700 border-b-4 border-blue-600 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap";
                tabAccount.className = "text-xl md:text-2xl font-extrabold text-gray-500 border-b-4 border-transparent hover:text-blue-500 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap opacity-70";
                viewEsim.classList.remove('hidden');
                viewEsim.classList.add('block');
                viewAccount.classList.remove('block');
                viewAccount.classList.add('hidden');
                
                btnAddEsim.classList.remove('hidden');
                btnTestReminder.classList.remove('hidden');
                btnAddAccount.classList.add('hidden');
                btnLockVault.classList.add('hidden');
            } else {
                tabAccount.className = "text-xl md:text-2xl font-extrabold text-indigo-700 border-b-4 border-indigo-600 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap";
                tabEsim.className = "text-xl md:text-2xl font-extrabold text-gray-500 border-b-4 border-transparent hover:text-indigo-500 pb-2 transition-colors flex items-center gap-2 whitespace-nowrap opacity-70";
                viewAccount.classList.remove('hidden');
                viewAccount.classList.add('block');
                viewEsim.classList.remove('block');
                viewEsim.classList.add('hidden');
                
                btnAddEsim.classList.add('hidden');
                btnTestReminder.classList.add('hidden');
                
                // 判断保险库是否已解锁
                if (vaultMasterKey) {
                    btnAddAccount.classList.remove('hidden');
                    btnLockVault.classList.remove('hidden');
                } else {
                    btnAddAccount.classList.add('hidden');
                    btnLockVault.classList.add('hidden');
                }
            }
        }

        // ================= 全球极其全面的 SVG 国旗字典配置 =================
        const countryFlags = [
            // 北美及加勒比海 (NANP +1) - 长区号优先匹配
            { prefix: "+1242", iso: ["bs"] }, { prefix: "+1246", iso: ["bb"] }, { prefix: "+1264", iso: ["ai"] }, { prefix: "+1268", iso: ["ag"] },
            { prefix: "+1284", iso: ["vg"] }, { prefix: "+1340", iso: ["vi"] }, { prefix: "+1345", iso: ["ky"] }, { prefix: "+1441", iso: ["bm"] },
            { prefix: "+1473", iso: ["gd"] }, { prefix: "+1649", iso: ["tc"] }, { prefix: "+1664", iso: ["ms"] }, { prefix: "+1670", iso: ["mp"] },
            { prefix: "+1671", iso: ["gu"] }, { prefix: "+1684", iso: ["as"] }, { prefix: "+1721", iso: ["sx"] }, { prefix: "+1758", iso: ["lc"] },
            { prefix: "+1767", iso: ["dm"] }, { prefix: "+1784", iso: ["vc"] }, { prefix: "+1787", iso: ["pr"] }, { prefix: "+1939", iso: ["pr"] },
            { prefix: "+1809", iso: ["do"] }, { prefix: "+1829", iso: ["do"] }, { prefix: "+1849", iso: ["do"] }, { prefix: "+1868", iso: ["tt"] },
            { prefix: "+1876", iso: ["jm"] }, { prefix: "+1", iso: ["us", "ca"] }, 
            
            // 亚洲
            { prefix: "+86", iso: ["cn"] }, { prefix: "+852", iso: ["hk"] }, { prefix: "+853", iso: ["mo"] }, { prefix: "+886", iso: ["tw"] },
            { prefix: "+81", iso: ["jp"] }, { prefix: "+82", iso: ["kr"] }, { prefix: "+850", iso: ["kp"] }, { prefix: "+65", iso: ["sg"] },
            { prefix: "+60", iso: ["my"] }, { prefix: "+62", iso: ["id"] }, { prefix: "+63", iso: ["ph"] }, { prefix: "+66", iso: ["th"] },
            { prefix: "+84", iso: ["vn"] }, { prefix: "+91", iso: ["in"] }, { prefix: "+92", iso: ["pk"] }, { prefix: "+93", iso: ["af"] },
            { prefix: "+94", iso: ["lk"] }, { prefix: "+95", iso: ["mm"] }, { prefix: "+98", iso: ["ir"] }, { prefix: "+971", iso: ["ae"] },
            { prefix: "+972", iso: ["il"] }, { prefix: "+973", iso: ["bh"] }, { prefix: "+974", iso: ["qa"] }, { prefix: "+975", iso: ["bt"] },
            { prefix: "+976", iso: ["mn"] }, { prefix: "+977", iso: ["np"] }, { prefix: "+960", iso: ["mv"] }, { prefix: "+961", iso: ["lb"] },
            { prefix: "+962", iso: ["jo"] }, { prefix: "+963", iso: ["sy"] }, { prefix: "+964", iso: ["iq"] }, { prefix: "+965", iso: ["kw"] },
            { prefix: "+966", iso: ["sa"] }, { prefix: "+968", iso: ["om"] }, { prefix: "+992", iso: ["tj"] }, { prefix: "+993", iso: ["tm"] },
            { prefix: "+994", iso: ["az"] }, { prefix: "+995", iso: ["ge"] }, { prefix: "+996", iso: ["kg"] }, { prefix: "+998", iso: ["uz"] },
            { prefix: "+855", iso: ["kh"] }, { prefix: "+856", iso: ["la"] }, { prefix: "+880", iso: ["bd"] }, { prefix: "+90", iso: ["tr"] },

            // 欧洲
            { prefix: "+44", iso: ["gb"] }, { prefix: "+33", iso: ["fr"] }, { prefix: "+49", iso: ["de"] }, { prefix: "+39", iso: ["it"] },
            { prefix: "+34", iso: ["es"] }, { prefix: "+7", iso: ["ru", "kz"] }, { prefix: "+380", iso: ["ua"] }, { prefix: "+31", iso: ["nl"] },
            { prefix: "+32", iso: ["be"] }, { prefix: "+41", iso: ["ch"] }, { prefix: "+43", iso: ["at"] }, { prefix: "+46", iso: ["se"] },
            { prefix: "+47", iso: ["no"] }, { prefix: "+48", iso: ["pl"] }, { prefix: "+45", iso: ["dk"] }, { prefix: "+358", iso: ["fi"] },
            { prefix: "+351", iso: ["pt"] }, { prefix: "+30", iso: ["gr"] }, { prefix: "+353", iso: ["ie"] }, { prefix: "+370", iso: ["lt"] },
            { prefix: "+371", iso: ["lv"] }, { prefix: "+372", iso: ["ee"] }, { prefix: "+374", iso: ["am"] }, { prefix: "+381", iso: ["rs"] },
            { prefix: "+359", iso: ["bg"] }, { prefix: "+357", iso: ["cy"] }, { prefix: "+420", iso: ["cz"] }, { prefix: "+421", iso: ["sk"] },
            { prefix: "+36", iso: ["hu"] }, { prefix: "+40", iso: ["ro"] }, { prefix: "+385", iso: ["hr"] }, { prefix: "+386", iso: ["si"] },
            { prefix: "+387", iso: ["ba"] }, { prefix: "+389", iso: ["mk"] }, { prefix: "+355", iso: ["al"] }, { prefix: "+352", iso: ["lu"] },
            { prefix: "+356", iso: ["mt"] }, { prefix: "+354", iso: ["is"] }, { prefix: "+376", iso: ["ad"] }, { prefix: "+373", iso: ["md"] },
            { prefix: "+377", iso: ["mc"] }, { prefix: "+378", iso: ["sm"] }, { prefix: "+382", iso: ["me"] }, { prefix: "+423", iso: ["li"] },
            { prefix: "+350", iso: ["gi"] }, { prefix: "+298", iso: ["fo"] },

            // 中美洲及南美洲
            { prefix: "+55", iso: ["br"] }, { prefix: "+54", iso: ["ar"] }, { prefix: "+56", iso: ["cl"] }, { prefix: "+57", iso: ["co"] },
            { prefix: "+51", iso: ["pe"] }, { prefix: "+58", iso: ["ve"] }, { prefix: "+591", iso: ["bo"] }, { prefix: "+593", iso: ["ec"] },
            { prefix: "+595", iso: ["py"] }, { prefix: "+598", iso: ["uy"] }, { prefix: "+592", iso: ["gy"] }, { prefix: "+597", iso: ["sr"] },
            { prefix: "+52", iso: ["mx"] }, { prefix: "+501", iso: ["bz"] }, { prefix: "+502", iso: ["gt"] }, { prefix: "+503", iso: ["sv"] },
            { prefix: "+504", iso: ["hn"] }, { prefix: "+505", iso: ["ni"] }, { prefix: "+506", iso: ["cr"] }, { prefix: "+507", iso: ["pa"] },

            // 大洋洲
            { prefix: "+61", iso: ["au"] }, { prefix: "+64", iso: ["nz"] }, { prefix: "+679", iso: ["fj"] }, { prefix: "+675", iso: ["pg"] },
            { prefix: "+678", iso: ["vu"] }, { prefix: "+677", iso: ["sb"] }, { prefix: "+676", iso: ["to"] }, { prefix: "+685", iso: ["ws"] },
            { prefix: "+686", iso: ["ki"] }, { prefix: "+688", iso: ["tv"] }, { prefix: "+674", iso: ["nr"] }, { prefix: "+680", iso: ["pw"] },
            { prefix: "+692", iso: ["mh"] }, { prefix: "+691", iso: ["fm"] }, { prefix: "+687", iso: ["nc"] }, { prefix: "+689", iso: ["pf"] },

            // 非洲
            { prefix: "+27", iso: ["za"] }, { prefix: "+234", iso: ["ng"] }, { prefix: "+20", iso: ["eg"] }, { prefix: "+254", iso: ["ke"] },
            { prefix: "+212", iso: ["ma"] }, { prefix: "+213", iso: ["dz"] }, { prefix: "+216", iso: ["tn"] }, { prefix: "+218", iso: ["ly"] },
            { prefix: "+249", iso: ["sd"] }, { prefix: "+251", iso: ["et"] }, { prefix: "+255", iso: ["tz"] }, { prefix: "+256", iso: ["ug"] },
            { prefix: "+233", iso: ["gh"] }, { prefix: "+225", iso: ["ci"] }, { prefix: "+237", iso: ["cm"] }, { prefix: "+221", iso: ["sn"] },
            { prefix: "+223", iso: ["ml"] }, { prefix: "+224", iso: ["gn"] }, { prefix: "+228", iso: ["tg"] }, { prefix: "+229", iso: ["bj"] },
            { prefix: "+227", iso: ["ne"] }, { prefix: "+226", iso: ["bf"] }, { prefix: "+231", iso: ["lr"] }, { prefix: "+232", iso: ["sl"] },
            { prefix: "+220", iso: ["gm"] }, { prefix: "+245", iso: ["gw"] }, { prefix: "+238", iso: ["cv"] }, { prefix: "+239", iso: ["st"] },
            { prefix: "+240", iso: ["gq"] }, { prefix: "+241", iso: ["ga"] }, { prefix: "+242", iso: ["cg"] }, { prefix: "+243", iso: ["cd"] },
            { prefix: "+244", iso: ["ao"] }, { prefix: "+260", iso: ["zm"] }, { prefix: "+263", iso: ["zw"] }, { prefix: "+264", iso: ["na"] },
            { prefix: "+267", iso: ["bw"] }, { prefix: "+268", iso: ["sz"] }, { prefix: "+266", iso: ["ls"] }, { prefix: "+261", iso: ["mg"] },
            { prefix: "+230", iso: ["mu"] }, { prefix: "+248", iso: ["sc"] }, { prefix: "+262", iso: ["re"] }, { prefix: "+253", iso: ["dj"] },
            { prefix: "+252", iso: ["so"] }, { prefix: "+250", iso: ["rw"] }, { prefix: "+257", iso: ["bi"] }, { prefix: "+258", iso: ["mz"] },
            { prefix: "+265", iso: ["mw"] }
        ];

        function getCountryFlag(numberStr) {
            const defaultIcon = '<i class="fa-solid fa-globe text-blue-400 text-lg"></i>';
            if (!numberStr) return defaultIcon; 
            const cleanNumber = numberStr.replace(/[\\s\\-\\(\\)\\.]/g, '');
            if (!cleanNumber.startsWith("+")) return defaultIcon; 
            
            const sortedFlags = countryFlags.sort((a, b) => b.prefix.length - a.prefix.length);
            for (let item of sortedFlags) {
                if (cleanNumber.startsWith(item.prefix)) {
                    return item.iso.map(code => 
                        \`<img src="https://flagcdn.com/\${code}.svg" class="inline-block w-[22px] h-auto rounded-[2px] shadow-[0_0_2px_rgba(0,0,0,0.2)]" alt="\${code}" title="国家/地区代码：\${item.prefix}">\`
                    ).join('<span class="mx-0.5 text-gray-300 text-xs">/</span>');
                }
            }
            return defaultIcon; 
        }

        document.getElementById('current-date').innerText = new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        
        window.onload = () => {
            if (localStorage.getItem('esim_auth_token')) {
                fetchAllData();
            }
        };

        function getAuthHeaders() {
            return {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('esim_auth_token') || ''
            };
        }

        // ================= 安全验证相关功能 =================
        async function sendAuthCode() {
            const btn = document.getElementById('sendCodeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> 发送中...';
            
            try {
                const response = await fetch('/api/auth/send', { method: 'POST' });
                const data = await response.json();
                
                if (response.ok && data.success) {
                    let timeLeft = 60;
                    btn.innerHTML = \`<i class="fa-solid fa-clock mr-2"></i> \${timeLeft} 秒后可重发\`;
                    countdownInterval = setInterval(() => {
                        timeLeft--;
                        if (timeLeft <= 0) {
                            clearInterval(countdownInterval);
                            btn.disabled = false;
                            btn.innerHTML = '<i class="fa-brands fa-telegram text-xl mr-2"></i> 向 TG 机器人获取验证码';
                        } else {
                            btn.innerHTML = \`<i class="fa-solid fa-clock mr-2"></i> \${timeLeft} 秒后可重发\`;
                        }
                    }, 1000);
                } else {
                    alert("发送失败: " + (data.message || "后端未配置机器人信息"));
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-brands fa-telegram text-xl mr-2"></i> 向 TG 机器人获取验证码';
                }
            } catch (e) {
                alert("网络错误，发送失败");
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-brands fa-telegram text-xl mr-2"></i> 向 TG 机器人获取验证码';
            }
        }

        async function verifyCode() {
            const codeInput = document.getElementById('authCode').value.trim();
            if (!codeInput || codeInput.length !== 6) return alert("请输入完整的 6 位数字验证码");
            
            const btn = document.getElementById('loginBtn');
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> 验证中...';
            
            try {
                const response = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: codeInput })
                });
                const data = await response.json();
                
                if (response.ok && data.success) {
                    localStorage.setItem('esim_auth_token', data.token);
                    document.getElementById('authCode').value = '';
                    fetchAllData();
                } else {
                    alert("登录失败: " + (data.message || "验证码错误或已过期"));
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                }
            } catch (e) {
                alert("网络错误，验证失败");
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        }

        function logout() {
            localStorage.removeItem('esim_auth_token');
            document.getElementById('login-container').classList.remove('hidden');
            document.getElementById('main-container').classList.add('hidden');
            lockVault(); // 退出时顺便锁定
        }

        async function sendTestReminder() {
            const btn = document.getElementById('btn-test-reminder');
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 发送中...';

            try {
                const response = await fetch(TEST_REMINDER_API_URL, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });
                if (response.status === 401) { logout(); return; }

                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || '发送失败');
                }

                showToast('测试提醒已发送（每张卡一条，共 ' + (data.sent || 0) + ' 条）');
            } catch (error) {
                alert('发送失败：' + (error.message || '请稍后重试'));
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        }

        // ================= 数据加载总控 =================
        async function fetchAllData() {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-container').classList.remove('hidden');
            
            await fetchEsimData();
            // 注意：账号库数据只有在输入主密码解锁后才会获取，避免在后台驻留加密字符串
        }

        // ================= eSIM 核心业务功能 =================
        async function fetchEsimData() {
            const container = document.getElementById('esim-container');
            container.innerHTML = \`<div class="col-span-full text-center py-10 text-gray-700 font-medium text-lg"><i class="fa-solid fa-spinner fa-spin mr-2"></i> 正在加载数据...</div>\`;
            
            try {
                const response = await fetch(WORKER_API_URL, { headers: getAuthHeaders() });
                if (response.status === 401) { logout(); return; }
                if (!response.ok) throw new Error("网络请求失败");
                
                esimData = await response.json();
                renderCards(esimData);
            } catch (error) {
                console.error("加载失败:", error);
                container.innerHTML = \`
                    <div class="col-span-full text-center py-10">
                        <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-3"></i>
                        <h3 class="text-xl font-bold text-gray-800">获取数据失败</h3>
                        <p class="text-gray-600 mt-2">网络异常，请重试。</p>
                    </div>\`;
            }
        }

        function renderCards(esims) {
            const container = document.getElementById('esim-container');
            const statsContainer = document.getElementById('stats-container');
            container.innerHTML = ''; 

            let safeCount = 0;
            let warningCount = 0;
            let dangerCount = 0;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if(esims.length === 0) {
                container.innerHTML = \`<div class="col-span-full text-center py-16 text-gray-500"><i class="fa-solid fa-box-open text-4xl mb-3"></i><p>还没有添加任何号码，点击右上角添加吧！</p></div>\`;
            }

            esims.sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate));

            esims.forEach(sim => {
                const expDate = new Date(sim.expireDate);
                expDate.setHours(0, 0, 0, 0);
                const diffTime = expDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // 解析动态提醒规则：对“0”进行安全保留校验，空值回退默认
                const advance = sim.notifyAdvance !== undefined && sim.notifyAdvance !== "" ? parseInt(sim.notifyAdvance) : 15;
                const interval = sim.notifyInterval !== undefined && sim.notifyInterval !== "" ? parseInt(sim.notifyInterval) : 1;
                const maxCount = sim.notifyCount !== undefined && sim.notifyCount !== "" ? parseInt(sim.notifyCount) : 0;
                
                const warningLimit = Math.max(45, advance + 15);

                let statusColor = "bg-green-500";
                let statusText = "状态安全";
                let badgeClass = "bg-green-100 text-green-800";
                let icon = "fa-check-circle text-green-500";

                if (diffDays <= 0) {
                    statusColor = "bg-gray-500";
                    statusText = diffDays === 0 ? "今日到期" : "已过期";
                    badgeClass = "bg-gray-100 text-gray-800";
                    icon = "fa-times-circle text-gray-500";
                    dangerCount++;
                } else if (diffDays <= advance) {
                    statusColor = "bg-red-500";
                    statusText = "即将过期";
                    badgeClass = "bg-red-100 text-red-800";
                    icon = "fa-triangle-exclamation text-red-500";
                    dangerCount++;
                } else if (diffDays <= warningLimit) {
                    statusColor = "bg-yellow-400";
                    statusText = "建议关注";
                    badgeClass = "bg-yellow-100 text-yellow-800";
                    icon = "fa-bell text-yellow-500";
                    warningCount++;
                } else {
                    safeCount++;
                }

                let percent = Math.min(Math.max((diffDays / 365) * 100, 0), 100);
                const flagHTML = getCountryFlag(sim.number);
                
                let customNotifyIcon = '';
                if (advance !== 15 || interval !== 1 || maxCount !== 0) {
                    const countText = maxCount > 0 ? "共" + maxCount + "次" : "次数不限";
                    const titleText = "自定义提醒: 提前" + advance + "天开始, 每" + interval + "天提醒, " + countText;
                    customNotifyIcon = '<i class="fa-solid fa-bell-sliders text-xs text-blue-400 ml-2 cursor-help" title="' + titleText + '"></i>';
                }

                const remarkHTML = sim.remark ? \`<div class="bg-blue-50/60 rounded-lg p-2.5 mb-3 text-xs text-gray-700 border border-blue-100/60 break-words leading-relaxed"><i class="fa-regular fa-comment-dots mr-1.5 text-blue-400"></i>\${escapeHtml(sim.remark)}</div>\` : '';

                let platformsHTML = '';
                if (sim.platforms && sim.platforms.trim() !== '') {
                    const pList = sim.platforms.split(/[,，\\s]+/).filter(p => p.trim() !== '');
                    if (pList.length > 0) {
                        const badges = pList.map(p => \`<span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm whitespace-nowrap mb-1.5 mr-1.5"><i class="fa-solid fa-hashtag mr-1 opacity-60"></i>\${escapeHtml(p)}</span>\`).join('');
                        platformsHTML = \`<div class="mb-3">
                            <div class="flex flex-wrap">\${badges}</div>
                        </div>\`;
                    }
                }

                const cardHTML = \`
                    <div class="glass-card rounded-2xl p-6 relative overflow-hidden group flex flex-col h-full">
                        
                        <div class="absolute top-4 right-4 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-20 bg-white/80 p-1.5 rounded-full backdrop-blur-md border border-white/60 shadow-sm">
                            <button onclick="openEditModal('\${sim.id}')" class="text-green-600 hover:text-white hover:bg-green-500 bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm" title="编辑卡片资料">
                                <i class="fa-solid fa-pen text-sm"></i>
                            </button>
                            <button onclick="renewEsim('\${sim.id}', \${sim.cycle || 0})" class="text-blue-600 hover:text-white hover:bg-blue-500 bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm" title="一键续期（按周期顺延）">
                                <i class="fa-solid fa-rotate-right text-sm"></i>
                            </button>
                            <button onclick="deleteEsim('\${sim.id}')" class="text-red-500 hover:text-white hover:bg-red-500 bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm" title="删除号码">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>

                        <div class="pr-28 mb-3 flex items-center">
                            <h2 class="text-xl font-bold text-gray-900 truncate" title="\${escapeHtml(sim.name)}">\${escapeHtml(sim.name)}</h2>
                            \${customNotifyIcon}
                        </div>
                        
                        <div class="flex justify-between items-center mb-4 gap-2">
                            <p class="text-gray-600 font-mono text-sm flex items-center gap-2 truncate">
                                <span class="flex items-center shrink-0">\${flagHTML}</span>
                                <span class="truncate">\${escapeHtml(sim.number) || '未登记号码'}</span>
                            </p>
                            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap flex-shrink-0 \${badgeClass}">
                                <i class="fa-solid \${icon} mr-1"></i>\${statusText}
                            </span>
                        </div>
                        
                        \${remarkHTML}

                        \${platformsHTML}
                        
                        <div class="mt-auto">
                            <div class="flex justify-between text-sm font-semibold mb-2">
                                <span class="text-gray-700">剩余时间</span>
                                <span class="text-gray-900 font-bold \${diffDays <= advance && diffDays > 0 ? 'text-red-600 animate-pulse' : ''}">\${diffDays < 0 ? '0' : diffDays} 天</span>
                            </div>
                            <div class="w-full bg-gray-200/60 rounded-full h-3 mb-2 shadow-inner">
                                <div class="\${statusColor} h-3 rounded-full shadow-sm transition-all duration-1000" style="width: \${percent}%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                                <span><i class="fa-solid fa-arrows-rotate mr-1"></i>周期: \${sim.cycle || '-'} 天</span>
                                <span>到期日: \${sim.expireDate}</span>
                            </div>
                        </div>
                    </div>
                \`;
                container.innerHTML += cardHTML;
            });

            statsContainer.innerHTML = \`
                <div class="glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 border-l-green-500">
                    <div>
                        <p class="text-gray-500 text-sm font-bold uppercase">安全卡片</p>
                        <p class="text-3xl font-black text-gray-800 mt-1">\${safeCount}</p>
                    </div>
                    <i class="fa-solid fa-shield-check text-4xl text-green-200"></i>
                </div>
                <div class="glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 border-l-yellow-400">
                    <div>
                        <p class="text-gray-500 text-sm font-bold uppercase">建议关注</p>
                        <p class="text-3xl font-black text-gray-800 mt-1">\${warningCount}</p>
                    </div>
                    <i class="fa-solid fa-clock text-4xl text-yellow-200"></i>
                </div>
                <div class="glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 border-l-red-500">
                    <div>
                        <p class="text-gray-500 text-sm font-bold uppercase">告警/过期</p>
                        <p class="text-3xl font-black text-gray-800 mt-1">\${dangerCount}</p>
                    </div>
                    <i class="fa-solid fa-siren-on text-4xl text-red-200"></i>
                </div>
            \`;
        }

        async function submitForm(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>保存中...';
            btn.disabled = true;

            const payload = {
                name: document.getElementById('simName').value,
                number: document.getElementById('simNumber').value,
                cycle: parseInt(document.getElementById('simCycle').value) || 0,
                platforms: document.getElementById('simPlatforms').value, 
                remark: document.getElementById('simRemark').value,
                rechargeUrl: document.getElementById('simRechargeUrl').value.trim(),
                expireDate: document.getElementById('simExpire').value,
                notifyAdvance: document.getElementById('simNotifyAdvance').value,
                notifyInterval: document.getElementById('simNotifyInterval').value,
                notifyCount: document.getElementById('simNotifyCount').value
            };

            if (editingId) {
                payload.id = editingId;
            }

            try {
                const response = await fetch(WORKER_API_URL, {
                    method: editingId ? 'PUT' : 'POST', 
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 401) { logout(); return; }
                const data = await response.json().catch(() => ({}));
                if (response.ok) {
                    closeModal();
                    showToast(editingId ? "修改卡片成功" : "添加卡片成功");
                    await fetchEsimData(); 
                } else {
                    alert(data.message || "保存失败，请检查数据。");
                }
            } catch (error) {
                alert("网络错误，保存失败。");
            } finally {
                btn.innerHTML = '保存并监控';
                btn.disabled = false;
            }
        }

        // ================= 加密保险库控制逻辑 =================
        async function unlockVault() {
            const pwdInput = document.getElementById('vaultPassword').value;
            if (!pwdInput) return alert("保险库密码不能为空！");
            
            const btn = document.getElementById('unlockVaultBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 派生密钥中...';
            btn.disabled = true;

            try {
                // 派生主密钥保存在内存中
                vaultMasterKey = await deriveCryptoKey(pwdInput);
                document.getElementById('vaultPassword').value = '';
                
                // 切换UI状态
                document.getElementById('vault-locked').classList.add('hidden');
                document.getElementById('vault-unlocked').classList.remove('hidden');
                document.getElementById('btn-lock-vault').classList.remove('hidden');
                document.getElementById('btn-add-account').classList.remove('hidden');
                document.getElementById('tab-lock-icon').className = "fa-solid fa-lock-open text-sm text-green-500 opacity-80";
                
                showToast("密钥派生成功，正在解密...");
                await fetchAccountData();
            } catch (e) {
                console.error(e);
                alert("解锁发生错误");
            } finally {
                btn.innerHTML = '<i class="fa-solid fa-key"></i> 本地派生密钥并解锁';
                btn.disabled = false;
            }
        }

        function lockVault() {
            vaultMasterKey = null; // 销毁内存中的密钥
            document.getElementById('vault-locked').classList.remove('hidden');
            document.getElementById('vault-unlocked').classList.add('hidden');
            document.getElementById('btn-lock-vault').classList.add('hidden');
            document.getElementById('btn-add-account').classList.add('hidden');
            document.getElementById('account-container').innerHTML = ''; // 清除 DOM 中的加密数据
            document.getElementById('tab-lock-icon').className = "fa-solid fa-lock text-sm opacity-50";
            
            showToast("保险库已锁定，密钥已从内存销毁");
        }

        // 密码相关操作
        function togglePasswordVisibility(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (input.type === "password") {
                input.type = "text";
                icon.className = "fa-solid fa-eye text-indigo-600";
            } else {
                input.type = "password";
                icon.className = "fa-solid fa-eye-slash";
            }
        }

        async function toggleDisplayPassword(id) {
            const span = document.getElementById('pwd-val-' + id);
            const icon = document.getElementById('pwd-icon-' + id);
            const encPwd = span.getAttribute('data-enc-pwd');
            
            if (span.innerText === '••••••••') {
                const realPwd = await decryptString(encPwd, vaultMasterKey);
                span.innerText = realPwd || '无密码';
                icon.className = "fa-solid fa-eye text-indigo-600";
                if(realPwd.includes('解密失败')) span.classList.add('text-red-500');
            } else {
                span.innerText = '••••••••';
                icon.className = "fa-solid fa-eye-slash";
                span.classList.remove('text-red-500');
            }
        }

        function copyToClipboard(text, typeName) {
            if (!text) return showToast("内容为空，无法复制");
            // 使用新版 API，如果不支持回退到临时 textarea (针对iframe环境优化)
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => showToast(typeName + "已复制到剪贴板"));
            } else {
                let textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showToast(typeName + "已复制到剪贴板");
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                document.body.removeChild(textArea);
            }
        }

        async function copyEncryptedPassword(id) {
            const span = document.getElementById('pwd-val-' + id);
            const encPwd = span.getAttribute('data-enc-pwd');
            const realPwd = await decryptString(encPwd, vaultMasterKey);
            if (realPwd.includes('解密失败')) {
                return showToast("解密失败，无法复制密码！");
            }
            copyToClipboard(realPwd, '密码');
        }

        async function fetchAccountData() {
            if (!vaultMasterKey) return; // 未解锁禁止获取
            const container = document.getElementById('account-container');
            
            try {
                const response = await fetch(WORKER_API_ACCOUNT_URL, { headers: getAuthHeaders() });
                if (response.status === 401) return;
                if (!response.ok) throw new Error("网络请求失败");
                
                accountData = await response.json();
                renderAccountCards(accountData);
            } catch (error) {
                console.error("加载账号数据失败:", error);
                container.innerHTML = \`
                    <div class="col-span-full text-center py-10">
                        <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-3"></i>
                        <p class="text-gray-600">获取或解密账号数据失败，请重试。</p>
                    </div>\`;
            }
        }

        function renderAccountCards(accounts) {
            const container = document.getElementById('account-container');
            container.innerHTML = ''; 

            if(accounts.length === 0) {
                container.innerHTML = \`<div class="col-span-full text-center py-16 text-gray-500"><i class="fa-solid fa-box-archive text-4xl mb-3 text-indigo-200"></i><p>账号库为空，点击右上角“添加账号”记录您的数字资产！</p></div>\`;
                return;
            }

            // 按地区字母排序
            accounts.sort((a, b) => (a.region || '').localeCompare(b.region || ''));

            accounts.forEach(acc => {
                const remarkHTML = acc.remark ? \`<div class="bg-indigo-50/60 rounded-lg p-2.5 mt-4 text-xs text-gray-700 border border-indigo-100/60 break-words leading-relaxed whitespace-pre-wrap"><i class="fa-regular fa-comment-dots mr-1.5 text-indigo-400"></i>\${escapeHtml(acc.remark)}</div>\` : '';
                
                const cardHTML = \`
                    <div class="glass-card rounded-2xl p-6 relative overflow-hidden group flex flex-col h-full border-t-4 border-t-indigo-400">
                        
                        <div class="absolute top-4 right-4 flex gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-20 bg-white/80 p-1.5 rounded-full backdrop-blur-md border border-white/60 shadow-sm">
                            <button onclick="openEditAccountModal('\${acc.id}')" class="text-indigo-600 hover:text-white hover:bg-indigo-500 bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm" title="编辑账号">
                                <i class="fa-solid fa-pen text-sm"></i>
                            </button>
                            <button onclick="deleteAccount('\${acc.id}')" class="text-red-500 hover:text-white hover:bg-red-500 bg-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm" title="删除账号">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>

                        <div class="pr-20 mb-4 flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <h2 class="text-lg font-bold text-gray-900 truncate" title="\${escapeHtml(acc.region)}">\${escapeHtml(acc.region)}</h2>
                        </div>
                        
                        <div class="flex flex-col gap-3">
                            <!-- 账号显示区 -->
                            <div>
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">账户/用户名</label>
                                <div class="font-mono text-sm bg-white/60 px-3 py-2.5 rounded-lg flex justify-between items-center border border-gray-100 shadow-sm">
                                    <span class="truncate pr-2 text-gray-800">\${escapeHtml(acc.account)}</span>
                                    <button onclick="copyToClipboard('\${escapeHtml(acc.account)}', '账户')" class="text-gray-400 hover:text-indigo-600 transition-colors shrink-0" title="复制账号">
                                        <i class="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 密码显示区 -->
                            <div>
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">加密密码 <i class="fa-solid fa-lock text-[10px] text-green-500"></i></label>
                                <div class="font-mono text-sm bg-white/60 px-3 py-2.5 rounded-lg flex justify-between items-center border border-gray-100 shadow-sm">
                                    <span id="pwd-val-\${acc.id}" data-enc-pwd="\${escapeHtml(acc.password)}" class="truncate pr-2 text-gray-800 \${acc.password ? '' : 'text-gray-400 italic'}">\${acc.password ? '••••••••' : '未设置'}</span>
                                    <div class="flex gap-3 shrink-0 \${!acc.password ? 'hidden' : ''}">
                                        <button onclick="toggleDisplayPassword('\${acc.id}')" class="text-gray-400 hover:text-indigo-600 transition-colors" title="即时解密/隐藏">
                                            <i id="pwd-icon-\${acc.id}" class="fa-solid fa-eye-slash"></i>
                                        </button>
                                        <button onclick="copyEncryptedPassword('\${acc.id}')" class="text-gray-400 hover:text-indigo-600 transition-colors" title="解密并复制">
                                            <i class="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        \${remarkHTML}
                    </div>
                \`;
                container.innerHTML += cardHTML;
            });
        }

        function openAccountModal() {
            editingAccountId = null;
            document.getElementById('accountModalTitle').innerHTML = '<i class="fa-solid fa-vault text-indigo-600"></i> 新增加密账号';
            const modal = document.getElementById('accountModal');
            const content = document.getElementById('accountModalContent');
            document.getElementById('accountForm').reset();
            
            // 确保密码框处于隐藏状态
            document.getElementById('accPassword').type = "password";
            document.getElementById('accPwdIcon').className = "fa-solid fa-eye-slash";
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        async function openEditAccountModal(id) {
            const acc = accountData.find(a => a.id === id);
            if (!acc) return;
            
            editingAccountId = id;
            document.getElementById('accountModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square text-indigo-600"></i> 编辑加密账号';
            
            document.getElementById('accRegion').value = acc.region || '';
            document.getElementById('accAccount').value = acc.account || '';
            document.getElementById('accRemark').value = acc.remark || '';
            
            // 填充前解密密码
            let plainPwd = '';
            if (acc.password) {
                plainPwd = await decryptString(acc.password, vaultMasterKey);
                if (plainPwd.includes('解密失败')) plainPwd = ''; // 防错
            }
            document.getElementById('accPassword').value = plainPwd;
            
            document.getElementById('accPassword').type = "password";
            document.getElementById('accPwdIcon').className = "fa-solid fa-eye-slash";

            const modal = document.getElementById('accountModal');
            const content = document.getElementById('accountModalContent');
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeAccountModal() {
            const modal = document.getElementById('accountModal');
            const content = document.getElementById('accountModalContent');
            
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                editingAccountId = null;
            }, 300); 
        }

        async function submitAccountForm(e) {
            e.preventDefault();
            const btn = document.getElementById('submitAccountBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>加密中...';
            btn.disabled = true;

            try {
                // 拦截表单，对密码进行强加密
                const plainPwd = document.getElementById('accPassword').value;
                const encryptedPwd = await encryptString(plainPwd, vaultMasterKey);

                const payload = {
                    region: document.getElementById('accRegion').value,
                    account: document.getElementById('accAccount').value,
                    password: encryptedPwd, // 传输密文
                    remark: document.getElementById('accRemark').value
                };

                if (editingAccountId) {
                    payload.id = editingAccountId;
                }

                const response = await fetch(WORKER_API_ACCOUNT_URL, {
                    method: editingAccountId ? 'PUT' : 'POST', 
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                
                if (response.status === 401) { logout(); return; }
                if (response.ok) {
                    closeAccountModal();
                    showToast(editingAccountId ? "账号修改成功 (已加密存储)" : "账号添加成功 (已加密存储)");
                    await fetchAccountData(); 
                } else {
                    alert("保存失败，请检查数据。");
                }
            } catch (error) {
                alert("网络错误或加密失败。");
                console.error(error);
            } finally {
                btn.innerHTML = '<i class="fa-solid fa-lock"></i> 加密并保存';
                btn.disabled = false;
            }
        }

        function deleteAccount(id) {
            openConfirmModal({
                title: '确认删除账号',
                message: '确定要删除这个账号记录吗？此操作无法恢复。',
                btnText: '<i class="fa-solid fa-trash-can"></i> 确定删除',
                btnClass: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30',
                iconBgClass: 'bg-red-50/80 border border-red-100',
                iconClass: 'fa-trash-can text-3xl text-red-500',
                onConfirm: async () => {
                    const btn = document.getElementById('confirmActionBtn');
                    const origText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 删除中...';
                    btn.disabled = true;
                    
                    try {
                        const response = await fetch(WORKER_API_ACCOUNT_URL, {
                            method: 'DELETE',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ id: id })
                        });
                        
                        if (response.status === 401) { logout(); return; }
                        if (response.ok) {
                            closeConfirmModal();
                            showToast("账号已删除");
                            await fetchAccountData(); 
                        } else {
                            alert("删除失败。");
                            btn.innerHTML = origText;
                            btn.disabled = false;
                        }
                    } catch (error) {
                        alert("网络错误，删除失败。");
                        btn.innerHTML = origText;
                        btn.disabled = false;
                    }
                }
            });
        }


        // ================= 统一确认弹窗功能 =================
        function openConfirmModal(options) {
            document.getElementById('confirmTitle').innerText = options.title || '确认操作';
            document.getElementById('confirmMessage').innerText = options.message || '确定要执行此操作吗？';
            
            const btn = document.getElementById('confirmActionBtn');
            btn.innerHTML = options.btnText || '确定';
            btn.className = "flex-1 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 " + (options.btnClass || "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30");
            
            const iconBg = document.getElementById('confirmIconBg');
            iconBg.className = "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm " + (options.iconBgClass || "bg-red-50/80 border border-red-100");
            
            const icon = document.getElementById('confirmIcon');
            icon.className = "fa-solid " + (options.iconClass || "fa-triangle-exclamation text-3xl text-red-500");

            btn.onclick = async () => {
                if (options.onConfirm) {
                    await options.onConfirm();
                }
            };

            const modal = document.getElementById('confirmModal');
            const content = document.getElementById('confirmModalContent');
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeConfirmModal() {
            const modal = document.getElementById('confirmModal');
            const content = document.getElementById('confirmModalContent');
            
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300); 
        }

        function renewEsim(id, cycle) {
            if (!cycle || cycle === 0) {
                alert("该卡片未设置保号周期，无法自动计算日期。请直接点击编辑修改。");
                return;
            }
            
            openConfirmModal({
                title: '一键续期',
                message: '确定已保号并一键续期吗？\\n\\n系统将以【今天】为基准，往后顺延 ' + cycle + ' 天作为新的到期日。',
                btnText: '<i class="fa-solid fa-rotate-right"></i> 确定续期',
                btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30',
                iconBgClass: 'bg-blue-50/80 border border-blue-100',
                iconClass: 'fa-rotate-right text-3xl text-blue-500',
                onConfirm: async () => {
                    const btn = document.getElementById('confirmActionBtn');
                    const origText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 处理中...';
                    btn.disabled = true;

                    const newDate = new Date();
                    newDate.setDate(newDate.getDate() + parseInt(cycle));
                    const year = newDate.getFullYear();
                    const month = String(newDate.getMonth() + 1).padStart(2, '0');
                    const day = String(newDate.getDate()).padStart(2, '0');
                    const newExpireStr = year + '-' + month + '-' + day;

                    try {
                        const response = await fetch(WORKER_API_URL, {
                            method: 'PUT',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ id: id, expireDate: newExpireStr })
                        });
                        
                        if (response.status === 401) { logout(); return; }
                        if (response.ok) {
                            closeConfirmModal();
                            showToast("卡片已顺延续期");
                            await fetchEsimData(); 
                        } else {
                            alert("续期失败。");
                            btn.innerHTML = origText;
                            btn.disabled = false;
                        }
                    } catch (error) {
                        alert("网络错误，续期失败。");
                        btn.innerHTML = origText;
                        btn.disabled = false;
                    }
                }
            });
        }

        function deleteEsim(id) {
            openConfirmModal({
                title: '确认删除',
                message: '确定要删除这个号码记录吗？此操作无法恢复。',
                btnText: '<i class="fa-solid fa-trash-can"></i> 确定删除',
                btnClass: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30',
                iconBgClass: 'bg-red-50/80 border border-red-100',
                iconClass: 'fa-trash-can text-3xl text-red-500',
                onConfirm: async () => {
                    const btn = document.getElementById('confirmActionBtn');
                    const origText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 删除中...';
                    btn.disabled = true;
                    
                    try {
                        const response = await fetch(WORKER_API_URL, {
                            method: 'DELETE',
                            headers: getAuthHeaders(),
                            body: JSON.stringify({ id: id })
                        });
                        
                        if (response.status === 401) { logout(); return; }
                        if (response.ok) {
                            closeConfirmModal();
                            showToast("卡片已删除");
                            await fetchEsimData(); 
                        } else {
                            alert("删除失败。");
                            btn.innerHTML = origText;
                            btn.disabled = false;
                        }
                    } catch (error) {
                        alert("网络错误，删除失败。");
                        btn.innerHTML = origText;
                        btn.disabled = false;
                    }
                }
            });
        }

        function openModal() {
            editingId = null;
            document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-file-circle-plus text-blue-600"></i> 新增 eSIM';
            const modal = document.getElementById('addModal');
            const content = document.getElementById('modalContent');
            document.getElementById('addForm').reset(); 
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function openEditModal(id) {
            const sim = esimData.find(s => s.id === id);
            if (!sim) return;
            
            editingId = id;
            document.getElementById('modalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square text-green-600"></i> 编辑 eSIM';
            
            document.getElementById('simName').value = sim.name || '';
            document.getElementById('simNumber').value = sim.number || '';
            document.getElementById('simCycle').value = sim.cycle || '';
            document.getElementById('simPlatforms').value = sim.platforms || ''; 
            document.getElementById('simRemark').value = sim.remark || '';
            document.getElementById('simRechargeUrl').value = sim.rechargeUrl || '';
            document.getElementById('simExpire').value = sim.expireDate || '';
            
            document.getElementById('simNotifyAdvance').value = sim.notifyAdvance !== undefined ? sim.notifyAdvance : '';
            document.getElementById('simNotifyInterval').value = sim.notifyInterval !== undefined ? sim.notifyInterval : '';
            document.getElementById('simNotifyCount').value = sim.notifyCount !== undefined ? sim.notifyCount : '';

            const modal = document.getElementById('addModal');
            const content = document.getElementById('modalContent');
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeModal() {
            const modal = document.getElementById('addModal');
            const content = document.getElementById('modalContent');
            
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                editingId = null;
            }, 300); 
        }
    </script>
</body>
</html>`;

function normalizeRechargeUrl(value, strict = true) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const fail = () => {
    if (strict) throw new Error("充值链接必须是公开的 HTTPS 地址");
    return "";
  };

  if (
    raw.length > 512 ||
    /[\u0000-\u001F\u007F\s\\]/.test(raw)
  ) {
    return fail();
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (error) {
    return fail();
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    (parsed.port && parsed.port !== "443") ||
    parsed.search
  ) {
    return fail();
  }

  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  const blockedShorteners = new Set([
    "bit.ly", "cutt.ly", "is.gd", "rebrand.ly", "shorturl.at",
    "t.co", "tiny.cc", "tinyurl.com"
  ]);
  const privateHost =
    !host ||
    !domainPattern.test(host) ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) ||
    host.includes(":") ||
    blockedShorteners.has(host) ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local");
  if (privateHost) return fail();

  parsed.hash = "";
  return parsed.href;
}

function normalizeDomainName(value) {
  const raw = String(value ?? "").trim().normalize("NFC").replace(/\.$/, "");
  if (
    !raw ||
    raw.length > 253 ||
    /[\u0000-\u0020\u007F\\/:?#@]/.test(raw)
  ) {
    throw new Error("请输入正确的域名，例如 example.com");
  }

  let parsed;
  try {
    parsed = new URL(`https://${raw}`);
  } catch (error) {
    throw new Error("请输入正确的域名，例如 example.com");
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  if (
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    parsed.port ||
    !domainPattern.test(host) ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    throw new Error("请输入正确的域名，例如 example.com");
  }
  return host;
}

function normalizeDateText(value) {
  const text = String(value ?? "").trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) throw new Error("请选择正确的到期日");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 2000 ||
    year > 2200 ||
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error("请选择正确的到期日");
  }
  return text;
}

function normalizeTextField(value, maxLength) {
  const text = String(value ?? "").trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function normalizeRequiredTextField(value, maxLength, fieldName) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${fieldName}不能为空`);
  if (text.length > maxLength) throw new Error(`${fieldName}不能超过 ${maxLength} 个字符`);
  return text;
}

function normalizeIntegerField(value, fallback, minimum, maximum) {
  if (value === undefined || value === null || value === "") return fallback;
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) throw new Error("提醒规则必须填写整数");
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error("提醒规则数值不正确");
  }
  return parsed;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    const pageHeaders = {
      "Content-Type": "text/html;charset=UTF-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (path === "/" || path === "/index.html") {
      return new Response(HTML_CONTENT, {
        headers: pageHeaders
      });
    }

    if (path === "/domains" || path === "/domains/") {
      return new Response(DOMAIN_HTML_CONTENT, { headers: pageHeaders });
    }

    if (path === "/vpns" || path === "/vpns/") {
      return new Response(VPN_HTML_CONTENT, { headers: pageHeaders });
    }

    if (path === "/servers" || path === "/servers/") {
      return new Response(SERVER_HTML_CONTENT, { headers: pageHeaders });
    }

    let tgToken = env.TG_BOT_TOKEN;
    let tgChat = env.TG_CHAT_ID;
    
    try {
      if (!tgToken) tgToken = await env.ESIM_DB.get("TG_BOT_TOKEN");
      if (!tgChat) tgChat = await env.ESIM_DB.get("TG_CHAT_ID");
    } catch (e) {}

    if (path === "/api/auth/send" && request.method === "POST") {
      try {
        if (!tgToken || !tgChat) {
          let missingVars = [];
          if (!tgToken) missingVars.push("TG_BOT_TOKEN");
          if (!tgChat) missingVars.push("TG_CHAT_ID");
          return new Response(JSON.stringify({ 
              success: false, 
              message: `环境缺失：缺少 ${missingVars.join(' 和 ')}。请前往 Cloudflare 的 KV 数据库中手动添加这两个键值对即可彻底解决！` 
          }), { status: 500, headers: corsHeaders });
        }
        
        const sendCooldown = await env.ESIM_DB.get("admin_auth_send_cooldown");
        if (sendCooldown) {
          return new Response(JSON.stringify({ success: false, message: "请求过于频繁，请 60 秒后再试" }), {
            status: 429,
            headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders }
          });
        }

        const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
        const code = (100000 + (randomValue % 900000)).toString();
        
        await env.ESIM_DB.put("admin_auth_code", code, { expirationTtl: 300 });
        await env.ESIM_DB.put("admin_auth_attempts", "0", { expirationTtl: 300 }); 
        await env.ESIM_DB.put("admin_auth_send_cooldown", "1", { expirationTtl: 60 });

        const text = `🔐 <b>【资产看板安全验证】</b>\n\n有人正在尝试登录您的网页版数据面板。\n\n您的动态登录验证码是：<code>${code}</code>\n\n<i>(该验证码 5 分钟内有效。如非本人操作，请忽略，系统已开启防爆破保护)</i>`;
        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        const tgRes = await fetch(tgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChat, text: text, parse_mode: "HTML" })
        });

        if (tgRes.ok) {
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } else {
          return new Response(JSON.stringify({ success: false, message: "TG 消息发送失败，可能 Bot 被拉黑或未激活" }), { status: 500, headers: corsHeaders });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (path === "/api/auth/verify" && request.method === "POST") {
      try {
        const { code } = await request.json();
        const storedCode = await env.ESIM_DB.get("admin_auth_code");
        
        let attempts = parseInt(await env.ESIM_DB.get("admin_auth_attempts")) || 0;
        if (attempts >= 5) {
            await env.ESIM_DB.delete("admin_auth_code"); 
            return new Response(JSON.stringify({ success: false, message: "错误次数过多，为保障安全，验证码已强制作废。请重新获取！" }), { status: 403, headers: corsHeaders });
        }

        if (!storedCode) {
            return new Response(JSON.stringify({ success: false, message: "请先获取验证码或验证码已过期" }), { status: 400, headers: corsHeaders });
        }
        
        if (code && storedCode === code.toString()) {
          const token = crypto.randomUUID();
          await env.ESIM_DB.put("session_token_" + token, "valid", { expirationTtl: 2592000 });
          await env.ESIM_DB.delete("admin_auth_code");
          await env.ESIM_DB.delete("admin_auth_attempts"); 
          
          return new Response(JSON.stringify({ success: true, token: token }), { headers: corsHeaders });
        } else {
          attempts++;
          await env.ESIM_DB.put("admin_auth_attempts", attempts.toString(), { expirationTtl: 300 });
          await new Promise(resolve => setTimeout(resolve, 1000)); 
          
          return new Response(JSON.stringify({ success: false, message: `验证码错误！剩余尝试次数: ${5 - attempts} 次` }), { status: 401, headers: corsHeaders });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "校验失败" }), { status: 500, headers: corsHeaders });
      }
    }

    // ================= 登录后手动测试提醒 =================
    if (path === "/api/reminders/test" && request.method === "POST") {
      const reqToken = request.headers.get("Authorization");
      if (!reqToken) {
        return new Response(JSON.stringify({ success: false, message: "请先登录" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      const isValidSession = await env.ESIM_DB.get("session_token_" + reqToken);
      if (!isValidSession) {
        return new Response(JSON.stringify({ success: false, message: "登录已过期" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (!tgToken || !tgChat) {
        return new Response(JSON.stringify({ success: false, message: "机器人配置不完整" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      try {
        const storedEsims = await env.ESIM_DB.get("esim_list", { type: "json" });
        const esims = Array.isArray(storedEsims) ? storedEsims : [];
        if (esims.length === 0) {
          return new Response(JSON.stringify({ success: false, message: "当前没有 eSIM 记录" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const DAY_MS = 24 * 60 * 60 * 1000;
        const UTC8_MS = 8 * 60 * 60 * 1000;
        const escapeTelegramHtml = (value) => String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const clip = (value, maxLength) => {
          const text = String(value ?? "").trim();
          return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
        };
        const displayPhone = (value) => clip(value, 40) || "未填写";

        const localNow = new Date(Date.now() + UTC8_MS);
        const localIso = localNow.toISOString();
        const dateTimeLabel = `${localIso.slice(0, 10)} ${localIso.slice(11, 16)}`;
        const todayDay = Math.floor(Date.UTC(
          localNow.getUTCFullYear(),
          localNow.getUTCMonth(),
          localNow.getUTCDate()
        ) / DAY_MS);

        const cardItems = esims.map((raw, index) => {
          const sim = raw && typeof raw === "object" ? raw : {};
          const name = clip(sim.name, 80) || `未命名卡 ${index + 1}`;
          const expireDate = clip(sim.expireDate, 20) || "未设置";
          const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(expireDate);
          let expiryDay = null;
          if (match) {
            const year = Number(match[1]);
            const month = Number(match[2]);
            const day = Number(match[3]);
            const timestamp = Date.UTC(year, month - 1, day);
            const check = new Date(timestamp);
            if (
              check.getUTCFullYear() === year &&
              check.getUTCMonth() === month - 1 &&
              check.getUTCDate() === day
            ) {
              expiryDay = Math.floor(timestamp / DAY_MS);
            }
          }
          const diffDays = expiryDay === null ? null : expiryDay - todayDay;
          const advanceParsed = Number.parseInt(sim.notifyAdvance, 10);
          const advance = Number.isInteger(advanceParsed) && advanceParsed >= 0 ? advanceParsed : 15;

          let statusLine = "到期日期格式无效";
          if (diffDays !== null) {
            if (diffDays < 0) statusLine = `已过期 ${Math.abs(diffDays)} 天`;
            else if (diffDays === 0) statusLine = "今天到期";
            else if (diffDays <= advance) statusLine = `剩余 ${diffDays} 天，已进入提前 ${advance} 天提醒期`;
            else statusLine = `剩余 ${diffDays} 天，尚未进入提前 ${advance} 天提醒期`;
          }

          const lines = [
            `<b>${index + 1}. ${escapeTelegramHtml(name)}</b>`,
            `📞 号码：<code>${escapeTelegramHtml(displayPhone(sim.number))}</code>`,
            `📅 到期：${escapeTelegramHtml(expireDate)}`,
            `⏳ ${escapeTelegramHtml(statusLine)}`
          ];

          const remark = clip(sim.remark, 240);
          const platforms = clip(sim.platforms, 160);
          if (remark) lines.push(`📝 备注：${escapeTelegramHtml(remark)}`);
          if (platforms) lines.push(`🌐 平台：${escapeTelegramHtml(platforms)}`);
          return {
            text: lines.join("\n"),
            rechargeUrl: normalizeRechargeUrl(sim.rechargeUrl, false)
          };
        });

        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        for (let index = 0; index < cardItems.length; index++) {
          const item = cardItems[index];
          const text = [
            "🔔 <b>eSIM 到期提醒（手动测试）</b>",
            `🗓 发送时间：${dateTimeLabel}（北京时间）`,
            `📋 卡片：${index + 1}/${cardItems.length}`,
            "✅ 本消息只发送一次，不会改变定时提醒设置。",
            "",
            item.text
          ].join("\n");

          const payload = { chat_id: tgChat, text, parse_mode: "HTML" };
          if (item.rechargeUrl) {
            payload.reply_markup = {
              inline_keyboard: [[{ text: "充值", url: item.rechargeUrl }]]
            };
          }

          const tgRes = await fetch(tgUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const tgResult = await tgRes.json().catch(() => null);
          if (!tgRes.ok || !tgResult || !tgResult.ok) {
            throw new Error("Telegram 拒绝了消息");
          }

          if (index < cardItems.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1100));
          }
        }

        return new Response(JSON.stringify({ success: true, sent: cardItems.length }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          message: "测试提醒发送失败，请稍后重试"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // ================= 登录后手动测试域名提醒 =================
    if (path === "/api/domain-reminders/test" && request.method === "POST") {
      const reqToken = request.headers.get("Authorization");
      const isValidSession = reqToken
        ? await env.ESIM_DB.get("session_token_" + reqToken)
        : null;
      if (!isValidSession) {
        return new Response(JSON.stringify({ success: false, message: "请先登录" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      if (!tgToken || !tgChat) {
        return new Response(JSON.stringify({ success: false, message: "机器人配置不完整" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      try {
        const storedDomains = await env.ESIM_DB.get("domain_list", { type: "json" });
        const domains = Array.isArray(storedDomains) ? storedDomains : [];
        if (domains.length === 0) {
          return new Response(JSON.stringify({ success: false, message: "当前没有域名记录" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const escapeTelegramHtml = (value) => String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const localNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
        const localIso = localNow.toISOString();
        const dateTimeLabel = `${localIso.slice(0, 10)} ${localIso.slice(11, 16)}`;
        const todayDay = Math.floor(Date.UTC(
          localNow.getUTCFullYear(),
          localNow.getUTCMonth(),
          localNow.getUTCDate()
        ) / 86400000);

        const items = domains.map((raw, index) => {
          const domain = raw && typeof raw === "object" ? raw : {};
          const expiryDay = Math.floor(Date.parse(`${domain.expireDate}T00:00:00Z`) / 86400000);
          const diffDays = Number.isFinite(expiryDay) ? expiryDay - todayDay : null;
          let statusLine = "到期日期格式无效";
          if (diffDays !== null) {
            if (diffDays < 0) statusLine = `已过期 ${Math.abs(diffDays)} 天`;
            else if (diffDays === 0) statusLine = "今天到期";
            else statusLine = `剩余 ${diffDays} 天`;
          }
          const lines = [
            `<b>${index + 1}. ${escapeTelegramHtml(domain.label || domain.domain || "未命名域名")}</b>`,
            `🌐 域名：<code>${escapeTelegramHtml(domain.domain || "未填写")}</code>`,
            `📅 到期：${escapeTelegramHtml(domain.expireDate || "未设置")}`,
            `⏳ ${escapeTelegramHtml(statusLine)}`,
            `🔁 自动续费：${domain.autoRenew ? "已开启" : "未开启"}`
          ];
          if (domain.registrar) lines.push(`🏢 注册商：${escapeTelegramHtml(normalizeTextField(domain.registrar, 80))}`);
          if (domain.annualCost) lines.push(`💳 费用：${escapeTelegramHtml(normalizeTextField(domain.annualCost, 40))}`);
          if (domain.remark) lines.push(`📝 备注：${escapeTelegramHtml(normalizeTextField(domain.remark, 300))}`);
          return {
            text: lines.join("\n"),
            renewalUrl: normalizeRechargeUrl(domain.renewalUrl, false)
          };
        });

        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const text = [
            "🔔 <b>域名到期提醒（手动测试）</b>",
            `🗓 发送时间：${dateTimeLabel}（北京时间）`,
            `📋 域名：${index + 1}/${items.length}`,
            "✅ 本消息只发送一次，不会改变定时提醒设置。",
            "",
            item.text
          ].join("\n");
          const payload = { chat_id: tgChat, text, parse_mode: "HTML" };
          if (item.renewalUrl) {
            payload.reply_markup = {
              inline_keyboard: [[{ text: "续费", url: item.renewalUrl }]]
            };
          }
          const response = await fetch(tgUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result || !result.ok) throw new Error("Telegram 拒绝了消息");
          if (index < items.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1100));
          }
        }

        return new Response(JSON.stringify({ success: true, sent: items.length }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "域名测试提醒发送失败，请稍后重试" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // ================= 登录后手动测试 VPN 提醒 =================
    if (path === "/api/vpn-reminders/test" && request.method === "POST") {
      const reqToken = request.headers.get("Authorization");
      const isValidSession = reqToken
        ? await env.ESIM_DB.get("session_token_" + reqToken)
        : null;
      if (!isValidSession) {
        return new Response(JSON.stringify({ success: false, message: "请先登录" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      if (!tgToken || !tgChat) {
        return new Response(JSON.stringify({ success: false, message: "机器人配置不完整" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      try {
        const storedVpns = await env.ESIM_DB.get("vpn_list", { type: "json" });
        const vpns = Array.isArray(storedVpns) ? storedVpns : [];
        if (vpns.length === 0) {
          return new Response(JSON.stringify({ success: false, message: "当前没有 VPN 记录" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const escapeTelegramHtml = (value) => String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const localNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
        const localIso = localNow.toISOString();
        const dateTimeLabel = `${localIso.slice(0, 10)} ${localIso.slice(11, 16)}`;
        const todayDay = Math.floor(Date.UTC(
          localNow.getUTCFullYear(),
          localNow.getUTCMonth(),
          localNow.getUTCDate()
        ) / 86400000);

        const items = vpns.map((raw, index) => {
          const vpn = raw && typeof raw === "object" ? raw : {};
          const expiryDay = Math.floor(Date.parse(`${vpn.expireDate}T00:00:00Z`) / 86400000);
          const diffDays = Number.isFinite(expiryDay) ? expiryDay - todayDay : null;
          let statusLine = "到期日期格式无效";
          if (diffDays !== null) {
            if (diffDays < 0) statusLine = `已过期 ${Math.abs(diffDays)} 天`;
            else if (diffDays === 0) statusLine = "今天到期";
            else statusLine = `剩余 ${diffDays} 天`;
          }
          const lines = [
            `<b>${index + 1}. ${escapeTelegramHtml(vpn.name || "未命名 VPN")}</b>`,
            `🛡 VPN：${escapeTelegramHtml(vpn.name || "未填写")}`,
            `📅 到期：${escapeTelegramHtml(vpn.expireDate || "未设置")}`,
            `⏳ ${escapeTelegramHtml(statusLine)}`,
            `🔁 自动续费：${vpn.autoRenew ? "已开启" : "未开启"}`
          ];
          if (vpn.provider) lines.push(`🏢 服务商：${escapeTelegramHtml(normalizeTextField(vpn.provider, 80))}`);
          if (vpn.accountLabel) lines.push(`👤 账号标识：${escapeTelegramHtml(normalizeTextField(vpn.accountLabel, 80))}`);
          if (vpn.plan) lines.push(`📦 套餐：${escapeTelegramHtml(normalizeTextField(vpn.plan, 80))}`);
          if (vpn.cost) lines.push(`💳 费用：${escapeTelegramHtml(normalizeTextField(vpn.cost, 40))}`);
          if (vpn.remark) lines.push(`📝 备注：${escapeTelegramHtml(normalizeTextField(vpn.remark, 300))}`);
          return {
            text: lines.join("\n"),
            manageUrl: normalizeRechargeUrl(vpn.manageUrl, false)
          };
        });

        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const text = [
            "🔔 <b>VPN 到期提醒（手动测试）</b>",
            `🗓 发送时间：${dateTimeLabel}（北京时间）`,
            `📋 VPN：${index + 1}/${items.length}`,
            "✅ 本消息只发送一次，不会改变定时提醒设置。",
            "",
            item.text
          ].join("\n");
          const payload = { chat_id: tgChat, text, parse_mode: "HTML" };
          if (item.manageUrl) {
            payload.reply_markup = {
              inline_keyboard: [[{ text: "续费 / 管理", url: item.manageUrl }]]
            };
          }
          const response = await fetch(tgUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result || !result.ok) throw new Error("Telegram 拒绝了消息");
          if (index < items.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1100));
          }
        }

        return new Response(JSON.stringify({ success: true, sent: items.length }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "VPN 测试提醒发送失败，请稍后重试" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // ================= 登录后手动测试云服务器提醒 =================
    if (path === "/api/server-reminders/test" && request.method === "POST") {
      const reqToken = request.headers.get("Authorization");
      const isValidSession = reqToken
        ? await env.ESIM_DB.get("session_token_" + reqToken)
        : null;
      if (!isValidSession) {
        return new Response(JSON.stringify({ success: false, message: "请先登录" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      if (!tgToken || !tgChat) {
        return new Response(JSON.stringify({ success: false, message: "机器人配置不完整" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      try {
        const storedServers = await env.ESIM_DB.get("server_list", { type: "json" });
        const servers = Array.isArray(storedServers) ? storedServers : [];
        if (servers.length === 0) {
          return new Response(JSON.stringify({ success: false, message: "当前没有云服务器记录" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const escapeTelegramHtml = (value) => String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        const localNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
        const localIso = localNow.toISOString();
        const dateTimeLabel = `${localIso.slice(0, 10)} ${localIso.slice(11, 16)}`;
        const todayDay = Math.floor(Date.UTC(
          localNow.getUTCFullYear(),
          localNow.getUTCMonth(),
          localNow.getUTCDate()
        ) / 86400000);

        const items = servers.map((raw, index) => {
          const server = raw && typeof raw === "object" ? raw : {};
          const expiryDay = Math.floor(Date.parse(`${server.expireDate}T00:00:00Z`) / 86400000);
          const diffDays = Number.isFinite(expiryDay) ? expiryDay - todayDay : null;
          let statusLine = "到期日期格式无效";
          if (diffDays !== null) {
            if (diffDays < 0) statusLine = `已过期 ${Math.abs(diffDays)} 天`;
            else if (diffDays === 0) statusLine = "今天到期";
            else statusLine = `剩余 ${diffDays} 天`;
          }
          const lines = [
            `<b>${index + 1}. ${escapeTelegramHtml(server.name || "未命名服务器")}</b>`,
            `🖥 云服务器：${escapeTelegramHtml(server.name || "未填写")}`,
            `📅 到期：${escapeTelegramHtml(server.expireDate || "未设置")}`,
            `⏳ ${escapeTelegramHtml(statusLine)}`,
            `🔁 自动续费：${server.autoRenew ? "已开启" : "未开启"}`
          ];
          if (server.provider) lines.push(`🏢 服务商：${escapeTelegramHtml(normalizeTextField(server.provider, 80))}`);
          if (server.host) lines.push(`🌐 IP / 主机名：${escapeTelegramHtml(normalizeTextField(server.host, 120))}`);
          if (server.plan) lines.push(`📦 地区 / 配置：${escapeTelegramHtml(normalizeTextField(server.plan, 120))}`);
          if (server.cost) lines.push(`💳 费用：${escapeTelegramHtml(normalizeTextField(server.cost, 40))}`);
          if (server.remark) lines.push(`📝 备注：${escapeTelegramHtml(normalizeTextField(server.remark, 300))}`);
          return {
            text: lines.join("\n"),
            manageUrl: normalizeRechargeUrl(server.manageUrl, false)
          };
        });

        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        for (let index = 0; index < items.length; index++) {
          const item = items[index];
          const text = [
            "🔔 <b>云服务器到期提醒（手动测试）</b>",
            `🗓 发送时间：${dateTimeLabel}（北京时间）`,
            `📋 服务器：${index + 1}/${items.length}`,
            "✅ 本消息只发送一次，不会改变定时提醒设置。",
            "",
            item.text
          ].join("\n");
          const payload = { chat_id: tgChat, text, parse_mode: "HTML" };
          if (item.manageUrl) {
            payload.reply_markup = {
              inline_keyboard: [[{ text: "续费 / 管理", url: item.manageUrl }]]
            };
          }
          const response = await fetch(tgUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result || !result.ok) throw new Error("Telegram 拒绝了消息");
          if (index < items.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1100));
          }
        }

        return new Response(JSON.stringify({ success: true, sent: items.length }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "云服务器测试提醒发送失败，请稍后重试" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // ================= eSIM 路由 =================
    if (path === "/api/esims") {
      const reqToken = request.headers.get("Authorization");
      if (!reqToken) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      
      const isValidSession = await env.ESIM_DB.get("session_token_" + reqToken);
      if (!isValidSession) return new Response(JSON.stringify({ error: "Invalid Token" }), { status: 401, headers: corsHeaders });

      let esims;
      try {
        esims = await env.ESIM_DB.get("esim_list", { type: "json" });
        if (!esims) esims = []; 
      } catch (err) {
        return new Response(JSON.stringify({ error: "KV 未绑定" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (request.method === "GET") {
        return new Response(JSON.stringify(esims), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (request.method === "POST") {
        try {
          const newSim = await request.json();
          if (!newSim.name || !newSim.expireDate) return new Response(JSON.stringify({ success: false, message: "参数错误" }), { status: 400, headers: corsHeaders });
          try {
            newSim.rechargeUrl = normalizeRechargeUrl(newSim.rechargeUrl);
          } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "充值链接必须是公开的 https:// 地址" }), { status: 400, headers: corsHeaders });
          }
          newSim.id = Date.now().toString(); 
          esims.push(newSim);
          await env.ESIM_DB.put("esim_list", JSON.stringify(esims)); 
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch (err) { return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); }
      }

      if (request.method === "PUT") {
        try {
          const { id, expireDate, name, number, cycle, remark, platforms, rechargeUrl, notifyAdvance, notifyInterval, notifyCount } = await request.json();
          let normalizedRechargeUrl;
          try {
            normalizedRechargeUrl = rechargeUrl === undefined
              ? undefined
              : normalizeRechargeUrl(rechargeUrl);
          } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "充值链接必须是公开的 https:// 地址" }), { status: 400, headers: corsHeaders });
          }
          let found = false;
          esims = esims.map(sim => {
            if (sim.id === id) { 
                found = true; 
                if (expireDate !== undefined) sim.expireDate = expireDate;
                if (name !== undefined) sim.name = name;
                if (number !== undefined) sim.number = number;
                if (cycle !== undefined) sim.cycle = cycle;
                if (remark !== undefined) sim.remark = remark;
                if (platforms !== undefined) sim.platforms = platforms; 
                if (normalizedRechargeUrl !== undefined) sim.rechargeUrl = normalizedRechargeUrl;
                if (notifyAdvance !== undefined) sim.notifyAdvance = notifyAdvance;
                if (notifyInterval !== undefined) sim.notifyInterval = notifyInterval;
                if (notifyCount !== undefined) sim.notifyCount = notifyCount;
                return sim; 
            }
            return sim;
          });
          if (!found) return new Response(JSON.stringify({ success: false, message: "未找到记录" }), { status: 404, headers: corsHeaders });
          await env.ESIM_DB.put("esim_list", JSON.stringify(esims)); 
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch (err) { return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); }
      }

      if (request.method === "DELETE") {
        try {
          const { id } = await request.json();
          esims = esims.filter(sim => sim.id !== id);
          await env.ESIM_DB.put("esim_list", JSON.stringify(esims)); 
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch (err) { return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); }
      }
    }

    // ================= 域名路由 =================
    if (path === "/api/domains") {
      const reqToken = request.headers.get("Authorization");
      if (!reqToken) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const isValidSession = await env.ESIM_DB.get("session_token_" + reqToken);
      if (!isValidSession) {
        return new Response(JSON.stringify({ error: "Invalid Token" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      let domains;
      try {
        const storedDomains = await env.ESIM_DB.get("domain_list", { type: "json" });
        domains = Array.isArray(storedDomains) ? storedDomains : [];
      } catch (error) {
        return new Response(JSON.stringify({ error: "KV 未绑定" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method === "GET") {
        return new Response(JSON.stringify(domains), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method === "POST") {
        try {
          const input = await request.json();
          const domainName = normalizeDomainName(input.domain);
          const expireDate = normalizeDateText(input.expireDate);
          if (domains.some((item) => String(item.domain || "").toLowerCase() === domainName)) {
            return new Response(JSON.stringify({ success: false, message: "这个域名已经存在" }), {
              status: 409,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
          if (input.autoRenew !== undefined && typeof input.autoRenew !== "boolean") {
            throw new Error("自动续费状态不正确");
          }

          let renewalUrl = "";
          try {
            renewalUrl = normalizeRechargeUrl(input.renewalUrl);
          } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "续费链接必须是公开的 https:// 地址" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }

          const now = new Date().toISOString();
          const newDomain = {
            id: "dom_" + crypto.randomUUID(),
            domain: domainName,
            label: normalizeTextField(input.label, 80),
            registrar: normalizeTextField(input.registrar, 80),
            expireDate,
            annualCost: normalizeTextField(input.annualCost, 40),
            autoRenew: Boolean(input.autoRenew),
            notifyAdvance: normalizeIntegerField(input.notifyAdvance, 30, 0, 3650),
            notifyInterval: normalizeIntegerField(input.notifyInterval, 7, 1, 3650),
            notifyCount: normalizeIntegerField(input.notifyCount, 5, 0, 999),
            renewalUrl,
            remark: normalizeTextField(input.remark, 300),
            createdAt: now,
            updatedAt: now
          };
          domains.push(newDomain);
          await env.ESIM_DB.put("domain_list", JSON.stringify(domains));
          return new Response(JSON.stringify({ success: true, domain: newDomain }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: error.message || "参数错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      if (request.method === "PUT") {
        try {
          const input = await request.json();
          const index = domains.findIndex((item) => item.id === input.id);
          if (index === -1) {
            return new Response(JSON.stringify({ success: false, message: "未找到域名" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }

          const next = { ...domains[index] };
          if (input.domain !== undefined) {
            const domainName = normalizeDomainName(input.domain);
            if (domains.some((item, itemIndex) => itemIndex !== index && String(item.domain || "").toLowerCase() === domainName)) {
              return new Response(JSON.stringify({ success: false, message: "这个域名已经存在" }), {
                status: 409,
                headers: { "Content-Type": "application/json", ...corsHeaders }
              });
            }
            next.domain = domainName;
          }
          if (input.expireDate !== undefined) next.expireDate = normalizeDateText(input.expireDate);
          if (input.label !== undefined) next.label = normalizeTextField(input.label, 80);
          if (input.registrar !== undefined) next.registrar = normalizeTextField(input.registrar, 80);
          if (input.annualCost !== undefined) next.annualCost = normalizeTextField(input.annualCost, 40);
          if (input.remark !== undefined) next.remark = normalizeTextField(input.remark, 300);
          if (input.autoRenew !== undefined) {
            if (typeof input.autoRenew !== "boolean") throw new Error("自动续费状态不正确");
            next.autoRenew = input.autoRenew;
          }
          if (input.notifyAdvance !== undefined) next.notifyAdvance = normalizeIntegerField(input.notifyAdvance, 30, 0, 3650);
          if (input.notifyInterval !== undefined) next.notifyInterval = normalizeIntegerField(input.notifyInterval, 7, 1, 3650);
          if (input.notifyCount !== undefined) next.notifyCount = normalizeIntegerField(input.notifyCount, 5, 0, 999);
          if (input.renewalUrl !== undefined) {
            try {
              next.renewalUrl = normalizeRechargeUrl(input.renewalUrl);
            } catch (error) {
              return new Response(JSON.stringify({ success: false, message: "续费链接必须是公开的 https:// 地址" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders }
              });
            }
          }
          next.updatedAt = new Date().toISOString();
          domains[index] = next;
          await env.ESIM_DB.put("domain_list", JSON.stringify(domains));
          return new Response(JSON.stringify({ success: true, domain: next }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: error.message || "参数错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      if (request.method === "DELETE") {
        try {
          const input = await request.json();
          const beforeLength = domains.length;
          domains = domains.filter((item) => item.id !== input.id);
          if (domains.length === beforeLength) {
            return new Response(JSON.stringify({ success: false, message: "未找到域名" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
          await env.ESIM_DB.put("domain_list", JSON.stringify(domains));
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: "删除失败" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }
    }

    // ================= VPN 路由 =================
    if (path === "/api/vpns") {
      const reqToken = request.headers.get("Authorization");
      if (!reqToken) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const isValidSession = await env.ESIM_DB.get("session_token_" + reqToken);
      if (!isValidSession) {
        return new Response(JSON.stringify({ error: "Invalid Token" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      let vpns;
      try {
        const storedVpns = await env.ESIM_DB.get("vpn_list", { type: "json" });
        vpns = Array.isArray(storedVpns) ? storedVpns : [];
      } catch (error) {
        return new Response(JSON.stringify({ error: "KV 未绑定" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method === "GET") {
        return new Response(JSON.stringify(vpns), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method === "POST") {
        try {
          const input = await request.json();
          const name = normalizeRequiredTextField(input.name, 80, "VPN 名称");
          const expireDate = normalizeDateText(input.expireDate);
          if (input.autoRenew !== undefined && typeof input.autoRenew !== "boolean") {
            throw new Error("自动续费状态不正确");
          }

          let manageUrl = "";
          try {
            manageUrl = normalizeRechargeUrl(input.manageUrl);
          } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "管理链接必须是公开的 https:// 地址，且不能包含查询参数或访问密钥" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }

          const now = new Date().toISOString();
          const newVpn = {
            id: "vpn_" + crypto.randomUUID(),
            name,
            provider: normalizeTextField(input.provider, 80),
            accountLabel: normalizeTextField(input.accountLabel, 80),
            plan: normalizeTextField(input.plan, 80),
            expireDate,
            renewalDays: normalizeIntegerField(input.renewalDays, 365, 1, 3650),
            cost: normalizeTextField(input.cost, 40),
            autoRenew: Boolean(input.autoRenew),
            notifyAdvance: normalizeIntegerField(input.notifyAdvance, 7, 0, 3650),
            notifyInterval: normalizeIntegerField(input.notifyInterval, 1, 1, 3650),
            notifyCount: normalizeIntegerField(input.notifyCount, 7, 0, 999),
            manageUrl,
            remark: normalizeTextField(input.remark, 300),
            createdAt: now,
            updatedAt: now
          };
          vpns.push(newVpn);
          await env.ESIM_DB.put("vpn_list", JSON.stringify(vpns));
          return new Response(JSON.stringify({ success: true, vpn: newVpn }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: error.message || "参数错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      if (request.method === "PUT") {
        try {
          const input = await request.json();
          const index = vpns.findIndex((item) => item.id === input.id);
          if (index === -1) {
            return new Response(JSON.stringify({ success: false, message: "未找到 VPN" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }

          const next = { ...vpns[index] };
          if (input.name !== undefined) next.name = normalizeRequiredTextField(input.name, 80, "VPN 名称");
          if (input.provider !== undefined) next.provider = normalizeTextField(input.provider, 80);
          if (input.accountLabel !== undefined) next.accountLabel = normalizeTextField(input.accountLabel, 80);
          if (input.plan !== undefined) next.plan = normalizeTextField(input.plan, 80);
          if (input.expireDate !== undefined) next.expireDate = normalizeDateText(input.expireDate);
          if (input.renewalDays !== undefined) next.renewalDays = normalizeIntegerField(input.renewalDays, 365, 1, 3650);
          if (input.cost !== undefined) next.cost = normalizeTextField(input.cost, 40);
          if (input.remark !== undefined) next.remark = normalizeTextField(input.remark, 300);
          if (input.autoRenew !== undefined) {
            if (typeof input.autoRenew !== "boolean") throw new Error("自动续费状态不正确");
            next.autoRenew = input.autoRenew;
          }
          if (input.notifyAdvance !== undefined) next.notifyAdvance = normalizeIntegerField(input.notifyAdvance, 7, 0, 3650);
          if (input.notifyInterval !== undefined) next.notifyInterval = normalizeIntegerField(input.notifyInterval, 1, 1, 3650);
          if (input.notifyCount !== undefined) next.notifyCount = normalizeIntegerField(input.notifyCount, 7, 0, 999);
          if (input.manageUrl !== undefined) {
            try {
              next.manageUrl = normalizeRechargeUrl(input.manageUrl);
            } catch (error) {
              return new Response(JSON.stringify({ success: false, message: "管理链接必须是公开的 https:// 地址，且不能包含查询参数或访问密钥" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders }
              });
            }
          }
          next.updatedAt = new Date().toISOString();
          vpns[index] = next;
          await env.ESIM_DB.put("vpn_list", JSON.stringify(vpns));
          return new Response(JSON.stringify({ success: true, vpn: next }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: error.message || "参数错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      if (request.method === "DELETE") {
        try {
          const input = await request.json();
          const beforeLength = vpns.length;
          vpns = vpns.filter((item) => item.id !== input.id);
          if (vpns.length === beforeLength) {
            return new Response(JSON.stringify({ success: false, message: "未找到 VPN" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
          await env.ESIM_DB.put("vpn_list", JSON.stringify(vpns));
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: "删除失败" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }
    }

    // ================= 云服务器路由 =================
    if (path === "/api/servers") {
      const reqToken = request.headers.get("Authorization");
      if (!reqToken) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const isValidSession = await env.ESIM_DB.get("session_token_" + reqToken);
      if (!isValidSession) {
        return new Response(JSON.stringify({ error: "Invalid Token" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      let servers;
      try {
        const storedServers = await env.ESIM_DB.get("server_list", { type: "json" });
        servers = Array.isArray(storedServers) ? storedServers : [];
      } catch (error) {
        return new Response(JSON.stringify({ error: "KV 未绑定" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method === "GET") {
        return new Response(JSON.stringify(servers), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      if (request.method === "POST") {
        try {
          const input = await request.json();
          const name = normalizeRequiredTextField(input.name, 80, "服务器名称");
          const expireDate = normalizeDateText(input.expireDate);
          if (input.autoRenew !== undefined && typeof input.autoRenew !== "boolean") {
            throw new Error("自动续费状态不正确");
          }

          let manageUrl = "";
          try {
            manageUrl = normalizeRechargeUrl(input.manageUrl);
          } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "管理链接必须是公开的 https:// 地址，且不能包含查询参数或访问密钥" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }

          const now = new Date().toISOString();
          const newServer = {
            id: "server_" + crypto.randomUUID(),
            name,
            provider: normalizeTextField(input.provider, 80),
            host: normalizeTextField(input.host, 120),
            plan: normalizeTextField(input.plan, 120),
            expireDate,
            renewalDays: normalizeIntegerField(input.renewalDays, 365, 1, 3650),
            cost: normalizeTextField(input.cost, 40),
            autoRenew: Boolean(input.autoRenew),
            notifyAdvance: normalizeIntegerField(input.notifyAdvance, 7, 0, 3650),
            notifyInterval: normalizeIntegerField(input.notifyInterval, 1, 1, 3650),
            notifyCount: normalizeIntegerField(input.notifyCount, 7, 0, 999),
            manageUrl,
            remark: normalizeTextField(input.remark, 300),
            createdAt: now,
            updatedAt: now
          };
          servers.push(newServer);
          await env.ESIM_DB.put("server_list", JSON.stringify(servers));
          return new Response(JSON.stringify({ success: true, server: newServer }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: error.message || "参数错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      if (request.method === "PUT") {
        try {
          const input = await request.json();
          const index = servers.findIndex((item) => item.id === input.id);
          if (index === -1) {
            return new Response(JSON.stringify({ success: false, message: "未找到服务器" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }

          const next = { ...servers[index] };
          if (input.name !== undefined) next.name = normalizeRequiredTextField(input.name, 80, "服务器名称");
          if (input.provider !== undefined) next.provider = normalizeTextField(input.provider, 80);
          if (input.host !== undefined) next.host = normalizeTextField(input.host, 120);
          if (input.plan !== undefined) next.plan = normalizeTextField(input.plan, 120);
          if (input.expireDate !== undefined) next.expireDate = normalizeDateText(input.expireDate);
          if (input.renewalDays !== undefined) next.renewalDays = normalizeIntegerField(input.renewalDays, 365, 1, 3650);
          if (input.cost !== undefined) next.cost = normalizeTextField(input.cost, 40);
          if (input.remark !== undefined) next.remark = normalizeTextField(input.remark, 300);
          if (input.autoRenew !== undefined) {
            if (typeof input.autoRenew !== "boolean") throw new Error("自动续费状态不正确");
            next.autoRenew = input.autoRenew;
          }
          if (input.notifyAdvance !== undefined) next.notifyAdvance = normalizeIntegerField(input.notifyAdvance, 7, 0, 3650);
          if (input.notifyInterval !== undefined) next.notifyInterval = normalizeIntegerField(input.notifyInterval, 1, 1, 3650);
          if (input.notifyCount !== undefined) next.notifyCount = normalizeIntegerField(input.notifyCount, 7, 0, 999);
          if (input.manageUrl !== undefined) {
            try {
              next.manageUrl = normalizeRechargeUrl(input.manageUrl);
            } catch (error) {
              return new Response(JSON.stringify({ success: false, message: "管理链接必须是公开的 https:// 地址，且不能包含查询参数或访问密钥" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders }
              });
            }
          }
          next.updatedAt = new Date().toISOString();
          servers[index] = next;
          await env.ESIM_DB.put("server_list", JSON.stringify(servers));
          return new Response(JSON.stringify({ success: true, server: next }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: error.message || "参数错误" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }

      if (request.method === "DELETE") {
        try {
          const input = await request.json();
          const beforeLength = servers.length;
          servers = servers.filter((item) => item.id !== input.id);
          if (servers.length === beforeLength) {
            return new Response(JSON.stringify({ success: false, message: "未找到服务器" }), {
              status: 404,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
          await env.ESIM_DB.put("server_list", JSON.stringify(servers));
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, message: "删除失败" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }
    }

    // ================= 账号库 路由 =================
    if (path === "/api/accounts") {
      const reqToken = request.headers.get("Authorization");
      if (!reqToken) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      
      const isValidSession = await env.ESIM_DB.get("session_token_" + reqToken);
      if (!isValidSession) return new Response(JSON.stringify({ error: "Invalid Token" }), { status: 401, headers: corsHeaders });

      let accounts;
      try {
        accounts = await env.ESIM_DB.get("account_list", { type: "json" });
        if (!accounts) accounts = []; 
      } catch (err) {
        return new Response(JSON.stringify({ error: "KV 未绑定" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (request.method === "GET") {
        return new Response(JSON.stringify(accounts), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      if (request.method === "POST") {
        try {
          const newAcc = await request.json();
          if (!newAcc.region || !newAcc.account) return new Response(JSON.stringify({ success: false, message: "参数错误" }), { status: 400, headers: corsHeaders });
          newAcc.id = 'acc_' + Date.now().toString(); 
          accounts.push(newAcc);
          await env.ESIM_DB.put("account_list", JSON.stringify(accounts)); 
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch (err) { return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); }
      }

      if (request.method === "PUT") {
        try {
          const { id, region, account, password, remark } = await request.json();
          let found = false;
          accounts = accounts.map(acc => {
            if (acc.id === id) { 
                found = true; 
                if (region !== undefined) acc.region = region;
                if (account !== undefined) acc.account = account;
                if (password !== undefined) acc.password = password;
                if (remark !== undefined) acc.remark = remark;
                return acc; 
            }
            return acc;
          });
          if (!found) return new Response(JSON.stringify({ success: false, message: "未找到记录" }), { status: 404, headers: corsHeaders });
          await env.ESIM_DB.put("account_list", JSON.stringify(accounts)); 
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch (err) { return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); }
      }

      if (request.method === "DELETE") {
        try {
          const { id } = await request.json();
          accounts = accounts.filter(acc => acc.id !== id);
          await env.ESIM_DB.put("account_list", JSON.stringify(accounts)); 
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch (err) { return new Response(JSON.stringify({ success: false }), { status: 400, headers: corsHeaders }); }
      }
    }

    return new Response("404 Not Found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const UTC8_MS = 8 * 60 * 60 * 1000;

    const escapeTelegramHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const clip = (value, maxLength = 120) => {
      const text = String(value ?? "").trim();
      return text.length > maxLength
        ? `${text.slice(0, maxLength - 1)}…`
        : text;
    };

    const readSecret = async (binding) => {
      if (typeof binding === "string") return binding.trim();
      if (binding && typeof binding.get === "function") {
        const value = await binding.get();
        return String(value ?? "").trim();
      }
      return "";
    };

    // 用户明确选择在 Telegram 提醒中显示完整号码。
    const displayPhone = (value) => clip(value, 40) || "未填写";

    const parseInteger = (value, fallback, minimum) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isInteger(parsed) && parsed >= minimum
        ? parsed
        : fallback;
    };

    const parseExpiryDay = (value) => {
      const text = String(value ?? "").trim();
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
      if (!match) return null;

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const timestamp = Date.UTC(year, month - 1, day);
      const check = new Date(timestamp);

      if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
      ) {
        return null;
      }

      return Math.floor(timestamp / DAY_MS);
    };

    if (!env.ESIM_DB) {
      throw new Error("Missing ESIM_DB binding");
    }

    let tgToken = await readSecret(env.TG_BOT_TOKEN);
    let tgChat = await readSecret(env.TG_CHAT_ID);

    if (!tgToken) {
      tgToken = String((await env.ESIM_DB.get("TG_BOT_TOKEN")) ?? "").trim();
    }
    if (!tgChat) {
      tgChat = String((await env.ESIM_DB.get("TG_CHAT_ID")) ?? "").trim();
    }

    if (!tgToken || !tgChat) {
      const missing = [];
      if (!tgToken) missing.push("TG_BOT_TOKEN");
      if (!tgChat) missing.push("TG_CHAT_ID");
      throw new Error(`Missing Telegram configuration: ${missing.join(", ")}`);
    }

    const storedEsims = await env.ESIM_DB.get("esim_list", { type: "json" });
    const esims = Array.isArray(storedEsims) ? storedEsims : [];

    const localToday = new Date(Date.now() + UTC8_MS);
    localToday.setUTCHours(0, 0, 0, 0);
    const todayDay = Math.floor(localToday.getTime() / DAY_MS);
    const dateLabel = localToday.toISOString().slice(0, 10);

    const entries = esims
      .map((raw, index) => {
        const sim = raw && typeof raw === "object" ? raw : {};
        const expireDate = clip(sim.expireDate, 20) || "未设置";
        const expiryDay = parseExpiryDay(expireDate);
        const diffDays = expiryDay === null ? null : expiryDay - todayDay;

        return {
          sim,
          originalIndex: index,
          name: clip(sim.name, 80) || `未命名卡 ${index + 1}`,
          displayNumber: displayPhone(sim.number),
          expireDate,
          diffDays,
          advance: parseInteger(sim.notifyAdvance, 15, 0),
          interval: parseInteger(sim.notifyInterval, 1, 1),
          maxCount: parseInteger(sim.notifyCount, 0, 0)
        };
      })
      .sort((a, b) => {
        const aDays = a.diffDays === null
          ? Number.POSITIVE_INFINITY
          : a.diffDays;
        const bDays = b.diffDays === null
          ? Number.POSITIVE_INFINITY
          : b.diffDays;
        return aDays - bDays;
      });

    const alertItems = [];
    for (const entry of entries) {
      if (entry.diffDays === null) continue;

      const cycleValue = clip(entry.sim.cycle, 16);
      const cycleText = cycleValue ? `${cycleValue}天` : "未设置";
      const remark = clip(entry.sim.remark, 300);
      const platforms = clip(entry.sim.platforms, 200);
      const details = [
        `📱 卡名：${escapeTelegramHtml(entry.name)}`,
        `📞 号码：<code>${escapeTelegramHtml(entry.displayNumber)}</code>`,
        `🔄 周期：${escapeTelegramHtml(cycleText)}`,
        `📅 到期：${escapeTelegramHtml(entry.expireDate)}`
      ];

      if (remark) {
        details.push(`📝 备注：${escapeTelegramHtml(remark)}`);
      }
      if (platforms) {
        details.push(`🌐 平台：${escapeTelegramHtml(platforms)}`);
      }

      if (entry.diffDays > 0 && entry.diffDays <= entry.advance) {
        const passedDays = entry.advance - entry.diffDays;
        if (passedDays % entry.interval === 0) {
          const currentCount =
            Math.floor(passedDays / entry.interval) + 1;

          if (entry.maxCount === 0 || currentCount <= entry.maxCount) {
            const progress = entry.maxCount > 0
              ? `（第 ${currentCount}/${entry.maxCount} 次）`
              : "";

            alertItems.push({
              text: [
                `⚠️ <b>eSIM 保号提醒${progress}</b>`,
                ...details,
                `⏳ 剩余 ${entry.diffDays} 天，请尽快处理续期。`
              ].join("\n"),
              rechargeUrl: normalizeRechargeUrl(entry.sim.rechargeUrl, false)
            });
          }
        }
      } else if (entry.diffDays === 0) {
        alertItems.push({
          text: [
            "🚨 <b>eSIM 紧急提醒</b>",
            ...details,
            "⏳ 今天到期，请立即处理。"
          ].join("\n"),
          rechargeUrl: normalizeRechargeUrl(entry.sim.rechargeUrl, false)
        });
      } else if (
        entry.diffDays < 0 &&
        Math.abs(entry.diffDays) % 7 === 0
      ) {
        alertItems.push({
          text: [
            "❌ <b>eSIM 停机警告</b>",
            ...details,
            `⏳ 已过期 ${Math.abs(entry.diffDays)} 天。`
          ].join("\n"),
          rechargeUrl: normalizeRechargeUrl(entry.sim.rechargeUrl, false)
        });
      }
    }

    let domains = [];
    try {
      const storedDomains = await env.ESIM_DB.get("domain_list", { type: "json" });
      domains = Array.isArray(storedDomains) ? storedDomains : [];
    } catch (error) {
      // 域名数据异常时隔离故障，确保原有 eSIM 提醒仍可发送。
      domains = [];
    }
    const domainAlertItems = [];

    const domainEntries = domains
      .map((raw, index) => {
        const domain = raw && typeof raw === "object" ? raw : {};
        const expireDate = clip(domain.expireDate, 20) || "未设置";
        const expiryDay = parseExpiryDay(expireDate);
        return {
          domain,
          name: clip(domain.domain, 253) || `未命名域名 ${index + 1}`,
          label: clip(domain.label, 80),
          expireDate,
          diffDays: expiryDay === null ? null : expiryDay - todayDay,
          advance: parseInteger(domain.notifyAdvance, 30, 0),
          interval: parseInteger(domain.notifyInterval, 7, 1),
          maxCount: parseInteger(domain.notifyCount, 5, 0)
        };
      })
      .sort((a, b) => {
        const aDays = a.diffDays === null ? Number.POSITIVE_INFINITY : a.diffDays;
        const bDays = b.diffDays === null ? Number.POSITIVE_INFINITY : b.diffDays;
        return aDays - bDays;
      });

    for (const entry of domainEntries) {
      if (entry.diffDays === null) continue;
      const registrar = clip(entry.domain.registrar, 80);
      const annualCost = clip(entry.domain.annualCost, 40);
      const remark = clip(entry.domain.remark, 300);
      const details = [
        `🌐 域名：<code>${escapeTelegramHtml(entry.name)}</code>`,
        `📅 到期：${escapeTelegramHtml(entry.expireDate)}`,
        `🔁 自动续费：${entry.domain.autoRenew ? "已开启" : "未开启"}`
      ];
      if (entry.label) details.splice(1, 0, `🏷 名称：${escapeTelegramHtml(entry.label)}`);
      if (registrar) details.push(`🏢 注册商：${escapeTelegramHtml(registrar)}`);
      if (annualCost) details.push(`💳 费用：${escapeTelegramHtml(annualCost)}`);
      if (remark) details.push(`📝 备注：${escapeTelegramHtml(remark)}`);

      if (entry.diffDays > 0 && entry.diffDays <= entry.advance) {
        const passedDays = entry.advance - entry.diffDays;
        if (passedDays % entry.interval === 0) {
          const currentCount = Math.floor(passedDays / entry.interval) + 1;
          if (entry.maxCount === 0 || currentCount <= entry.maxCount) {
            const progress = entry.maxCount > 0
              ? `（第 ${currentCount}/${entry.maxCount} 次）`
              : "";
            domainAlertItems.push({
              text: [
                `⚠️ <b>域名续费提醒${progress}</b>`,
                ...details,
                `⏳ 剩余 ${entry.diffDays} 天，请确认续费安排。`
              ].join("\n"),
              renewalUrl: normalizeRechargeUrl(entry.domain.renewalUrl, false)
            });
          }
        }
      } else if (entry.diffDays === 0) {
        domainAlertItems.push({
          text: [
            "🚨 <b>域名今天到期</b>",
            ...details,
            "⏳ 请立即续费，避免解析或网站中断。"
          ].join("\n"),
          renewalUrl: normalizeRechargeUrl(entry.domain.renewalUrl, false)
        });
      } else if (entry.diffDays === -7) {
        domainAlertItems.push({
          text: [
            "❌ <b>域名过期警告</b>",
            ...details,
            `⏳ 已过期 ${Math.abs(entry.diffDays)} 天。`
          ].join("\n"),
          renewalUrl: normalizeRechargeUrl(entry.domain.renewalUrl, false)
        });
      }
    }

    let vpns = [];
    try {
      const storedVpns = await env.ESIM_DB.get("vpn_list", { type: "json" });
      vpns = Array.isArray(storedVpns) ? storedVpns : [];
    } catch (error) {
      // VPN 数据异常时隔离故障，确保原有 eSIM 与域名提醒仍可发送。
      vpns = [];
    }
    const vpnAlertItems = [];

    const vpnEntries = vpns
      .map((raw, index) => {
        const vpn = raw && typeof raw === "object" ? raw : {};
        const expireDate = clip(vpn.expireDate, 20) || "未设置";
        const expiryDay = parseExpiryDay(expireDate);
        return {
          vpn,
          name: clip(vpn.name, 80) || `未命名 VPN ${index + 1}`,
          expireDate,
          diffDays: expiryDay === null ? null : expiryDay - todayDay,
          advance: parseInteger(vpn.notifyAdvance, 7, 0),
          interval: parseInteger(vpn.notifyInterval, 1, 1),
          maxCount: parseInteger(vpn.notifyCount, 7, 0)
        };
      })
      .sort((a, b) => {
        const aDays = a.diffDays === null ? Number.POSITIVE_INFINITY : a.diffDays;
        const bDays = b.diffDays === null ? Number.POSITIVE_INFINITY : b.diffDays;
        return aDays - bDays;
      });

    for (const entry of vpnEntries) {
      if (entry.diffDays === null) continue;
      const provider = clip(entry.vpn.provider, 80);
      const accountLabel = clip(entry.vpn.accountLabel, 80);
      const plan = clip(entry.vpn.plan, 80);
      const cost = clip(entry.vpn.cost, 40);
      const remark = clip(entry.vpn.remark, 300);
      const details = [
        `🛡 VPN：${escapeTelegramHtml(entry.name)}`,
        `📅 到期：${escapeTelegramHtml(entry.expireDate)}`,
        `🔁 自动续费：${entry.vpn.autoRenew ? "已开启" : "未开启"}`
      ];
      if (provider) details.splice(1, 0, `🏢 服务商：${escapeTelegramHtml(provider)}`);
      if (accountLabel) details.push(`👤 账号标识：${escapeTelegramHtml(accountLabel)}`);
      if (plan) details.push(`📦 套餐：${escapeTelegramHtml(plan)}`);
      if (cost) details.push(`💳 费用：${escapeTelegramHtml(cost)}`);
      if (remark) details.push(`📝 备注：${escapeTelegramHtml(remark)}`);
      const actionHint = entry.vpn.autoRenew
        ? "请确认自动扣款是否成功。"
        : "请确认续费安排。";

      if (entry.diffDays > 0 && entry.diffDays <= entry.advance) {
        const passedDays = entry.advance - entry.diffDays;
        if (passedDays % entry.interval === 0) {
          const currentCount = Math.floor(passedDays / entry.interval) + 1;
          if (entry.maxCount === 0 || currentCount <= entry.maxCount) {
            const progress = entry.maxCount > 0
              ? `（第 ${currentCount}/${entry.maxCount} 次）`
              : "";
            vpnAlertItems.push({
              text: [
                `⚠️ <b>VPN 续费提醒${progress}</b>`,
                ...details,
                `⏳ 剩余 ${entry.diffDays} 天，${actionHint}`
              ].join("\n"),
              manageUrl: normalizeRechargeUrl(entry.vpn.manageUrl, false)
            });
          }
        }
      } else if (entry.diffDays === 0) {
        vpnAlertItems.push({
          text: [
            "🚨 <b>VPN 今天到期</b>",
            ...details,
            `⏳ 请立即处理，${actionHint}`
          ].join("\n"),
          manageUrl: normalizeRechargeUrl(entry.vpn.manageUrl, false)
        });
      } else if (entry.diffDays === -7) {
        vpnAlertItems.push({
          text: [
            "❌ <b>VPN 过期警告</b>",
            ...details,
            `⏳ 已过期 ${Math.abs(entry.diffDays)} 天。`
          ].join("\n"),
          manageUrl: normalizeRechargeUrl(entry.vpn.manageUrl, false)
        });
      }
    }

    let servers = [];
    try {
      const storedServers = await env.ESIM_DB.get("server_list", { type: "json" });
      servers = Array.isArray(storedServers) ? storedServers : [];
    } catch (error) {
      // 云服务器数据异常时隔离故障，确保其他资产提醒仍可发送。
      servers = [];
    }
    const serverAlertItems = [];

    const serverEntries = servers
      .map((raw, index) => {
        const server = raw && typeof raw === "object" ? raw : {};
        const expireDate = clip(server.expireDate, 20) || "未设置";
        const expiryDay = parseExpiryDay(expireDate);
        return {
          server,
          name: clip(server.name, 80) || `未命名服务器 ${index + 1}`,
          expireDate,
          diffDays: expiryDay === null ? null : expiryDay - todayDay,
          advance: parseInteger(server.notifyAdvance, 7, 0),
          interval: parseInteger(server.notifyInterval, 1, 1),
          maxCount: parseInteger(server.notifyCount, 7, 0)
        };
      })
      .sort((a, b) => {
        const aDays = a.diffDays === null ? Number.POSITIVE_INFINITY : a.diffDays;
        const bDays = b.diffDays === null ? Number.POSITIVE_INFINITY : b.diffDays;
        return aDays - bDays;
      });

    for (const entry of serverEntries) {
      if (entry.diffDays === null) continue;
      const provider = clip(entry.server.provider, 80);
      const host = clip(entry.server.host, 120);
      const plan = clip(entry.server.plan, 120);
      const cost = clip(entry.server.cost, 40);
      const remark = clip(entry.server.remark, 300);
      const details = [
        `🖥 云服务器：${escapeTelegramHtml(entry.name)}`,
        `📅 到期：${escapeTelegramHtml(entry.expireDate)}`,
        `🔁 自动续费：${entry.server.autoRenew ? "已开启" : "未开启"}`
      ];
      if (provider) details.splice(1, 0, `🏢 服务商：${escapeTelegramHtml(provider)}`);
      if (host) details.push(`🌐 IP / 主机名：${escapeTelegramHtml(host)}`);
      if (plan) details.push(`📦 地区 / 配置：${escapeTelegramHtml(plan)}`);
      if (cost) details.push(`💳 费用：${escapeTelegramHtml(cost)}`);
      if (remark) details.push(`📝 备注：${escapeTelegramHtml(remark)}`);
      const actionHint = entry.server.autoRenew
        ? "请确认自动扣款是否成功。"
        : "请确认续费安排。";

      if (entry.diffDays > 0 && entry.diffDays <= entry.advance) {
        const passedDays = entry.advance - entry.diffDays;
        if (passedDays % entry.interval === 0) {
          const currentCount = Math.floor(passedDays / entry.interval) + 1;
          if (entry.maxCount === 0 || currentCount <= entry.maxCount) {
            const progress = entry.maxCount > 0
              ? `（第 ${currentCount}/${entry.maxCount} 次）`
              : "";
            serverAlertItems.push({
              text: [
                `⚠️ <b>云服务器续费提醒${progress}</b>`,
                ...details,
                `⏳ 剩余 ${entry.diffDays} 天，${actionHint}`
              ].join("\n"),
              manageUrl: normalizeRechargeUrl(entry.server.manageUrl, false)
            });
          }
        }
      } else if (entry.diffDays === 0) {
        serverAlertItems.push({
          text: [
            "🚨 <b>云服务器今天到期</b>",
            ...details,
            `⏳ 请立即处理，${actionHint}`
          ].join("\n"),
          manageUrl: normalizeRechargeUrl(entry.server.manageUrl, false)
        });
      } else if (entry.diffDays === -7) {
        serverAlertItems.push({
          text: [
            "❌ <b>云服务器过期警告</b>",
            ...details,
            `⏳ 已过期 ${Math.abs(entry.diffDays)} 天。`
          ].join("\n"),
          manageUrl: normalizeRechargeUrl(entry.server.manageUrl, false)
        });
      }
    }

    // 所有资产都只在命中各自规则时发送，不发送每日汇总。
    const outboundItems = [
      ...alertItems.map((item, index) => ({
        text: [
          "🔔 <b>eSIM 到期提醒</b>",
          `🗓 日期：${dateLabel}`,
          `⚠️ 本次提醒：${index + 1}/${alertItems.length}`,
          "",
          item.text
        ].join("\n"),
        buttonUrl: item.rechargeUrl,
        buttonText: "充值"
      })),
      ...domainAlertItems.map((item, index) => ({
        text: [
          "🔔 <b>域名到期提醒</b>",
          `🗓 日期：${dateLabel}`,
          `⚠️ 本次提醒：${index + 1}/${domainAlertItems.length}`,
          "",
          item.text
        ].join("\n"),
        buttonUrl: item.renewalUrl,
        buttonText: "续费"
      })),
      ...vpnAlertItems.map((item, index) => ({
        text: [
          "🔔 <b>VPN 到期提醒</b>",
          `🗓 日期：${dateLabel}`,
          `⚠️ 本次提醒：${index + 1}/${vpnAlertItems.length}`,
          "",
          item.text
        ].join("\n"),
        buttonUrl: item.manageUrl,
        buttonText: "续费 / 管理"
      })),
      ...serverAlertItems.map((item, index) => ({
        text: [
          "🔔 <b>云服务器到期提醒</b>",
          `🗓 日期：${dateLabel}`,
          `⚠️ 本次提醒：${index + 1}/${serverAlertItems.length}`,
          "",
          item.text
        ].join("\n"),
        buttonUrl: item.manageUrl,
        buttonText: "续费 / 管理"
      }))
    ];
    if (outboundItems.length === 0) return;

    const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
    for (let index = 0; index < outboundItems.length; index++) {
      const item = outboundItems[index];
      const payload = { chat_id: tgChat, text: item.text, parse_mode: "HTML" };
      if (item.buttonUrl) {
        payload.reply_markup = {
          inline_keyboard: [[{ text: item.buttonText, url: item.buttonUrl }]]
        };
      }

      const response = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || !result.ok) {
        const description = result && result.description
          ? result.description
          : `HTTP ${response.status}`;
        throw new Error(`Telegram sendMessage failed: ${description}`);
      }
      if (index < outboundItems.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }
  }
};
