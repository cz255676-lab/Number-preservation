export const DOMAIN_HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="个人域名到期、续费与 Telegram 提醒看板">
    <title>域名资产看板</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root { color-scheme: light; }
        body {
            background: linear-gradient(-45deg, #0f766e, #0284c7, #4f46e5, #0891b2);
            background-size: 400% 400%;
            animation: domainGradient 18s ease infinite;
            min-height: 100vh;
        }
        @keyframes domainGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.26);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(255, 255, 255, 0.45);
            box-shadow: 0 18px 50px rgba(15, 23, 42, 0.16);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.84);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.58);
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.09);
        }
        .domain-card { transition: transform .2s ease, box-shadow .2s ease; }
        .domain-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14); }
        .toast {
            background: rgba(255, 255, 255, .95);
            border-left: 4px solid #0ea5e9;
            box-shadow: 0 8px 24px rgba(15, 23, 42, .16);
            opacity: 0;
            transform: translateX(110%);
            transition: all .25s ease;
        }
        .toast.show { opacity: 1; transform: translateX(0); }
        .modal-panel { transition: all .25s ease; }
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
    </style>
</head>
<body class="text-slate-800 font-sans p-4 md:p-8">
    <div id="toast-container" class="fixed top-5 right-5 z-[70] flex flex-col gap-3 max-w-[calc(100vw-2.5rem)]"></div>

    <main>
        <section id="login-container" class="max-w-md mx-auto glass-panel rounded-3xl p-8 md:p-10 mt-16 md:mt-28 text-center">
            <div class="w-20 h-20 bg-white/55 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <i class="fa-solid fa-globe text-4xl text-cyan-700" aria-hidden="true"></i>
            </div>
            <h1 class="text-3xl font-black text-slate-950 mb-2">域名看板</h1>
            <p class="text-slate-700 mb-8 text-base font-medium">通过 Telegram 验证后管理域名到期与续费提醒。</p>
            <label for="authCode" class="sr-only">6 位登录验证码</label>
            <input type="text" inputmode="numeric" autocomplete="one-time-code" id="authCode" placeholder="输入 6 位验证码" maxlength="6" class="w-full px-4 py-4 rounded-xl border border-white/60 text-center text-2xl tracking-[.4em] font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white/80 shadow-inner placeholder-slate-400 placeholder:tracking-normal placeholder:text-base">
            <div class="flex flex-col gap-4 mt-7">
                <button id="loginBtn" type="button" class="min-h-11 w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                    <i class="fa-solid fa-arrow-right-to-bracket" aria-hidden="true"></i> 登录看板
                </button>
                <button id="sendCodeBtn" type="button" class="min-h-11 w-full bg-white/70 hover:bg-white/90 text-cyan-800 font-bold py-3.5 px-4 rounded-xl border border-cyan-100 transition-colors flex items-center justify-center gap-2">
                    <i class="fa-brands fa-telegram text-xl" aria-hidden="true"></i> 获取验证码
                </button>
            </div>
            <a href="/" class="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-slate-700 hover:text-cyan-900">
                <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> 返回 eSIM 看板
            </a>
        </section>

        <section id="main-container" class="max-w-7xl mx-auto glass-panel rounded-3xl p-5 md:p-9 hidden">
            <header class="flex flex-col xl:flex-row justify-between gap-5 border-b border-white/55 pb-5 mb-6">
                <div class="flex items-center gap-3 md:gap-6 overflow-x-auto pb-1">
                    <a href="/" class="min-h-11 flex items-center gap-2 px-1 text-lg md:text-xl font-extrabold text-white/75 border-b-4 border-transparent hover:text-white whitespace-nowrap">
                        <i class="fa-solid fa-sim-card" aria-hidden="true"></i> eSIM 资产
                    </a>
                    <span class="min-h-11 flex items-center gap-2 px-1 text-lg md:text-xl font-extrabold text-white border-b-4 border-amber-300 whitespace-nowrap">
                        <i class="fa-solid fa-globe" aria-hidden="true"></i> 域名资产
                    </span>
                    <a href="/vpns" class="min-h-11 flex items-center gap-2 px-1 text-lg md:text-xl font-extrabold text-white/75 border-b-4 border-transparent hover:text-white whitespace-nowrap">
                        <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> VPN 资产
                    </a>
                </div>
                <div class="flex flex-wrap items-center gap-2.5">
                    <span class="text-sm bg-white/55 px-4 py-2.5 rounded-full font-semibold shadow-sm">今日：<span id="current-date" class="text-cyan-900"></span></span>
                    <button id="addDomainBtn" type="button" class="min-h-11 bg-cyan-700 hover:bg-cyan-800 text-white px-5 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2">
                        <i class="fa-solid fa-plus" aria-hidden="true"></i> 添加域名
                    </button>
                    <button id="testReminderBtn" type="button" class="min-h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-full font-bold shadow-lg transition-colors flex items-center gap-2" title="向 Telegram 发送一次域名测试提醒">
                        <i class="fa-brands fa-telegram" aria-hidden="true"></i> 测试提醒
                    </button>
                    <button id="logoutBtn" type="button" class="min-h-11 bg-white/80 hover:bg-white text-red-600 px-4 py-2.5 rounded-full font-bold shadow-sm border border-red-100" title="退出登录">
                        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span class="sr-only">退出登录</span>
                    </button>
                </div>
            </header>

            <section id="stats-container" class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6" aria-label="域名统计"></section>

            <section class="glass-card rounded-2xl p-3 md:p-4 mb-6 flex flex-col md:flex-row gap-3" aria-label="搜索与筛选">
                <div class="relative flex-1">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400" aria-hidden="true"></i>
                    <label for="domainSearch" class="sr-only">搜索域名</label>
                    <input id="domainSearch" type="search" placeholder="搜索域名、名称或注册商" class="min-h-11 w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base">
                </div>
                <label for="statusFilter" class="sr-only">按状态筛选</label>
                <select id="statusFilter" class="min-h-11 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base font-semibold">
                    <option value="all">全部状态</option>
                    <option value="urgent">即将到期 / 已过期</option>
                    <option value="attention">建议关注</option>
                    <option value="safe">状态安全</option>
                </select>
            </section>

            <section id="domain-container" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" aria-live="polite">
                <div class="col-span-full text-center py-14 text-slate-700 text-lg font-medium"><i class="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true"></i>正在读取域名数据...</div>
            </section>
        </section>
    </main>

    <div id="domainModal" class="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 hidden items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="domainModalTitle">
        <div id="domainModalPanel" class="modal-panel glass-card w-full max-w-xl rounded-3xl p-6 md:p-7 shadow-2xl relative scale-95 opacity-0 max-h-[94vh] overflow-y-auto">
            <button id="closeDomainModalBtn" type="button" class="absolute top-4 right-4 min-w-11 min-h-11 text-slate-500 hover:text-red-600 rounded-full" aria-label="关闭">
                <i class="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
            </button>
            <h2 id="domainModalTitle" class="text-2xl font-black text-slate-950 mb-6 flex items-center gap-2"><i class="fa-solid fa-globe text-cyan-700" aria-hidden="true"></i>新增域名</h2>
            <form id="domainForm">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label for="domainName" class="block text-slate-700 text-sm font-bold mb-2">域名（必填）</label>
                        <input id="domainName" type="text" required maxlength="253" autocomplete="off" placeholder="例如：example.com" class="min-h-11 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                    </div>
                    <div>
                        <label for="domainLabel" class="block text-slate-700 text-sm font-bold mb-2">名称（选填）</label>
                        <input id="domainLabel" type="text" maxlength="80" placeholder="例如：个人博客" class="min-h-11 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                    </div>
                    <div>
                        <label for="domainRegistrar" class="block text-slate-700 text-sm font-bold mb-2">注册商（选填）</label>
                        <input id="domainRegistrar" type="text" maxlength="80" placeholder="例如：Cloudflare" class="min-h-11 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                    </div>
                    <div>
                        <label for="domainExpire" class="block text-slate-700 text-sm font-bold mb-2">到期日（必填）</label>
                        <input id="domainExpire" type="date" required class="min-h-11 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                    </div>
                    <div>
                        <label for="domainAnnualCost" class="block text-slate-700 text-sm font-bold mb-2">续费费用（选填）</label>
                        <input id="domainAnnualCost" type="text" maxlength="40" placeholder="例如：68 元/年" class="min-h-11 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                    </div>
                </div>

                <label class="mt-4 flex items-center gap-3 min-h-11 rounded-xl bg-cyan-50 border border-cyan-100 px-4 cursor-pointer">
                    <input id="domainAutoRenew" type="checkbox" class="w-5 h-5 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500">
                    <span class="text-sm font-bold text-slate-700">注册商已开启自动续费</span>
                </label>

                <div class="mt-4 p-4 rounded-2xl bg-amber-50/85 border border-amber-200">
                    <h3 class="text-sm font-black text-slate-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-bell text-amber-600" aria-hidden="true"></i>Telegram 提醒规则</h3>
                    <div class="grid grid-cols-3 gap-2.5">
                        <div><label for="domainNotifyAdvance" class="block text-slate-600 text-xs font-bold mb-1">提前（天）</label><input id="domainNotifyAdvance" type="number" min="0" max="3650" value="30" class="min-h-11 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"></div>
                        <div><label for="domainNotifyInterval" class="block text-slate-600 text-xs font-bold mb-1">到期前间隔</label><input id="domainNotifyInterval" type="number" min="1" max="3650" value="7" class="min-h-11 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"></div>
                        <div><label for="domainNotifyCount" class="block text-slate-600 text-xs font-bold mb-1">到期前最多</label><input id="domainNotifyCount" type="number" min="0" max="999" value="5" class="min-h-11 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"></div>
                    </div>
                    <p class="text-xs text-slate-500 mt-2">“最多”仅限制到期前提醒；到期当天和过期第 7 天会各额外提醒一次。</p>
                </div>

                <div class="mt-4">
                    <label for="domainRenewalUrl" class="block text-slate-700 text-sm font-bold mb-2">续费/管理链接（选填）</label>
                    <input id="domainRenewalUrl" type="url" maxlength="512" autocomplete="off" placeholder="https://注册商管理页面" class="min-h-11 w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                    <p class="text-xs text-slate-500 mt-1.5">填写后，看板和 Telegram 提醒中会显示“续费”按钮。</p>
                </div>
                <div class="mt-4 mb-6">
                    <label for="domainRemark" class="block text-slate-700 text-sm font-bold mb-2">备注（选填）</label>
                    <textarea id="domainRemark" maxlength="300" rows="3" placeholder="例如：用于个人博客，续费前检查银行卡" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"></textarea>
                </div>
                <button id="saveDomainBtn" type="submit" class="min-h-12 w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors">保存并监控</button>
            </form>
        </div>
    </div>

    <div id="confirmModal" class="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-[60] hidden items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
        <div id="confirmPanel" class="modal-panel glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center scale-95 opacity-0">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fa-solid fa-triangle-exclamation text-3xl text-amber-600" aria-hidden="true"></i></div>
            <h2 id="confirmTitle" class="text-xl font-black text-slate-950 mb-2">确认操作</h2>
            <p id="confirmMessage" class="text-slate-600 mb-6 text-sm whitespace-pre-line"></p>
            <div class="flex gap-3">
                <button id="cancelConfirmBtn" type="button" class="min-h-11 flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200">取消</button>
                <button id="confirmActionBtn" type="button" class="min-h-11 flex-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl">确定</button>
            </div>
        </div>
    </div>

    <script>
        const DOMAIN_API_URL = '/api/domains';
        const DOMAIN_TEST_URL = '/api/domain-reminders/test';
        let domains = [];
        let editingDomainId = null;
        let pendingConfirmAction = null;

        function escapeHtml(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        }

        function getToken() { return localStorage.getItem('esim_auth_token') || ''; }
        function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': getToken() }; }

        function showToast(message, isError) {
            const toast = document.createElement('div');
            toast.className = 'toast rounded-xl px-5 py-3.5 font-semibold text-sm text-slate-800';
            toast.style.borderLeftColor = isError ? '#ef4444' : '#0ea5e9';
            toast.textContent = message;
            document.getElementById('toast-container').appendChild(toast);
            requestAnimationFrame(function () { toast.classList.add('show'); });
            setTimeout(function () { toast.classList.remove('show'); setTimeout(function () { toast.remove(); }, 300); }, 3200);
        }

        function formatToday() {
            return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric' }).format(new Date());
        }

        function shanghaiDateKey() {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
            }).formatToParts(new Date());
            const values = {};
            parts.forEach(function (part) { if (part.type !== 'literal') values[part.type] = part.value; });
            return values.year + '-' + values.month + '-' + values.day;
        }

        function daysUntil(dateText) {
            const parts = String(dateText || '').split('-').map(Number);
            if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return null;
            const target = Date.UTC(parts[0], parts[1] - 1, parts[2]);
            const todayParts = shanghaiDateKey().split('-').map(Number);
            const today = Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]);
            return Math.round((target - today) / 86400000);
        }

        function statusFor(item) {
            const days = daysUntil(item.expireDate);
            const advance = Number.isInteger(parseInt(item.notifyAdvance, 10)) ? parseInt(item.notifyAdvance, 10) : 30;
            const attentionLimit = Math.max(90, advance + 30);
            if (days == null) return { key: 'urgent', text: '日期异常', badge: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400', days: null };
            if (days < 0) return { key: 'urgent', text: '已过期 ' + Math.abs(days) + ' 天', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500', days: days };
            if (days === 0) return { key: 'urgent', text: '今天到期', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500', days: days };
            if (days <= advance) return { key: 'urgent', text: '剩余 ' + days + ' 天', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500', days: days };
            if (days <= attentionLimit) return { key: 'attention', text: '剩余 ' + days + ' 天', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-400', days: days };
            return { key: 'safe', text: '剩余 ' + days + ' 天', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500', days: days };
        }

        function showLogin() {
            document.getElementById('login-container').classList.remove('hidden');
            document.getElementById('main-container').classList.add('hidden');
        }

        function showMain() {
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('main-container').classList.remove('hidden');
        }

        async function sendCode() {
            const btn = document.getElementById('sendCodeBtn');
            const original = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 发送中...';
            try {
                const response = await fetch('/api/auth/send', { method: 'POST' });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || '发送失败');
                showToast('验证码已发送到 Telegram');
                let seconds = 60;
                const timer = setInterval(function () {
                    seconds -= 1;
                    btn.textContent = seconds + ' 秒后可重发';
                    if (seconds <= 0) { clearInterval(timer); btn.disabled = false; btn.innerHTML = original; }
                }, 1000);
            } catch (error) {
                btn.disabled = false;
                btn.innerHTML = original;
                showToast(error.message || '验证码发送失败', true);
            }
        }

        async function verifyCode() {
            const code = document.getElementById('authCode').value.trim();
            if (!/^\\d{6}$/.test(code)) return showToast('请输入 6 位验证码', true);
            const btn = document.getElementById('loginBtn');
            const original = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 验证中...';
            try {
                const response = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code }) });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || '验证失败');
                localStorage.setItem('esim_auth_token', result.token);
                document.getElementById('authCode').value = '';
                showMain();
                await fetchDomains();
            } catch (error) {
                showToast(error.message || '验证失败', true);
            } finally {
                btn.disabled = false;
                btn.innerHTML = original;
            }
        }

        function logout() {
            localStorage.removeItem('esim_auth_token');
            domains = [];
            showLogin();
        }

        async function fetchDomains() {
            const container = document.getElementById('domain-container');
            container.innerHTML = '<div class="col-span-full text-center py-14 text-slate-700 text-lg font-medium"><i class="fa-solid fa-spinner fa-spin mr-2"></i>正在读取域名数据...</div>';
            try {
                const response = await fetch(DOMAIN_API_URL, { headers: authHeaders() });
                if (response.status === 401) { logout(); return; }
                if (!response.ok) throw new Error('读取失败');
                domains = await response.json();
                renderDomains();
            } catch (error) {
                container.innerHTML = '<div class="col-span-full glass-card rounded-2xl text-center py-14"><i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-3"></i><h2 class="text-xl font-black">加载失败</h2><button type="button" onclick="fetchDomains()" class="min-h-11 mt-4 px-5 rounded-xl bg-cyan-700 text-white font-bold">重新加载</button></div>';
            }
        }

        function renderStats(filteredCount) {
            let safe = 0, attention = 0, urgent = 0, autoRenew = 0;
            domains.forEach(function (item) {
                const status = statusFor(item);
                if (status.key === 'safe') safe += 1;
                else if (status.key === 'attention') attention += 1;
                else urgent += 1;
                if (item.autoRenew) autoRenew += 1;
            });
            document.getElementById('stats-container').innerHTML =
                '<div class="glass-card rounded-2xl p-4 md:p-5 border-l-4 border-cyan-600"><p class="text-slate-500 text-sm font-bold">域名总数</p><p class="text-3xl font-black mt-1">' + domains.length + '</p></div>' +
                '<div class="glass-card rounded-2xl p-4 md:p-5 border-l-4 border-emerald-500"><p class="text-slate-500 text-sm font-bold">状态安全</p><p class="text-3xl font-black mt-1">' + safe + '</p></div>' +
                '<div class="glass-card rounded-2xl p-4 md:p-5 border-l-4 border-red-500"><p class="text-slate-500 text-sm font-bold">即将/已经到期</p><p class="text-3xl font-black mt-1">' + urgent + '</p></div>' +
                '<div class="glass-card rounded-2xl p-4 md:p-5 border-l-4 border-amber-400"><p class="text-slate-500 text-sm font-bold">自动续费</p><p class="text-3xl font-black mt-1">' + autoRenew + '</p></div>';
        }

        function renderDomains() {
            const container = document.getElementById('domain-container');
            const query = document.getElementById('domainSearch').value.trim().toLowerCase();
            const filter = document.getElementById('statusFilter').value;
            const list = domains.slice().sort(function (a, b) {
                const ad = daysUntil(a.expireDate), bd = daysUntil(b.expireDate);
                return (ad == null ? Number.MAX_SAFE_INTEGER : ad) - (bd == null ? Number.MAX_SAFE_INTEGER : bd);
            }).filter(function (item) {
                const haystack = [item.domain, item.label, item.registrar].join(' ').toLowerCase();
                const status = statusFor(item);
                return (!query || haystack.includes(query)) && (filter === 'all' || status.key === filter);
            });
            renderStats(list.length);
            if (domains.length === 0) {
                container.innerHTML = '<div class="col-span-full glass-card rounded-3xl text-center py-16 px-6"><div class="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4"><i class="fa-solid fa-globe text-3xl text-cyan-700"></i></div><h2 class="text-2xl font-black">还没有域名</h2><p class="text-slate-600 mt-2 mb-5">添加第一个域名，系统会计算剩余天数并按规则提醒。</p><button type="button" onclick="openDomainModal()" class="min-h-11 px-5 rounded-xl bg-cyan-700 text-white font-bold"><i class="fa-solid fa-plus mr-2"></i>添加域名</button></div>';
                return;
            }
            if (list.length === 0) {
                container.innerHTML = '<div class="col-span-full glass-card rounded-2xl text-center py-14 px-6"><i class="fa-solid fa-magnifying-glass text-4xl text-slate-300 mb-3"></i><h2 class="text-xl font-black">没有找到匹配的域名</h2><button type="button" onclick="clearFilters()" class="min-h-11 mt-4 px-5 rounded-xl bg-white border border-slate-200 font-bold">清除筛选</button></div>';
                return;
            }
            container.innerHTML = '';
            list.forEach(function (item) {
                const status = statusFor(item);
                const progress = status.days == null ? 0 : Math.max(0, Math.min(100, status.days / 365 * 100));
                const title = item.label ? escapeHtml(item.label) : escapeHtml(item.domain);
                const domainLine = item.label ? '<p class="font-mono text-cyan-800 break-all mt-1">' + escapeHtml(item.domain) + '</p>' : '';
                const registrar = item.registrar ? escapeHtml(item.registrar) : '未填写';
                const cost = item.annualCost ? '<span><i class="fa-solid fa-receipt mr-1"></i>' + escapeHtml(item.annualCost) + '</span>' : '';
                const remark = item.remark ? '<div class="mt-3 rounded-xl bg-cyan-50 border border-cyan-100 px-3 py-2.5 text-sm text-slate-700 break-words"><i class="fa-regular fa-comment-dots text-cyan-600 mr-2"></i>' + escapeHtml(item.remark) + '</div>' : '';
                const renewLink = item.renewalUrl ? '<a href="' + escapeHtml(item.renewalUrl) + '" target="_blank" rel="noopener noreferrer" class="min-h-11 mt-4 flex items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold"><i class="fa-solid fa-arrow-up-right-from-square"></i>续费 / 管理</a>' : '';
                container.insertAdjacentHTML('beforeend',
                    '<article class="domain-card glass-card rounded-2xl p-5 relative flex flex-col">' +
                    '<div class="absolute top-4 right-4 flex gap-1 bg-white/85 rounded-full p-1 shadow-sm">' +
                    '<button type="button" data-domain-action="edit" data-domain-id="' + escapeHtml(item.id) + '" class="min-w-10 min-h-10 rounded-full text-emerald-600 hover:bg-emerald-500 hover:text-white" title="编辑"><i class="fa-solid fa-pen"></i></button>' +
                    '<button type="button" data-domain-action="renew" data-domain-id="' + escapeHtml(item.id) + '" class="min-w-10 min-h-10 rounded-full text-cyan-700 hover:bg-cyan-600 hover:text-white" title="到期日顺延一年"><i class="fa-solid fa-rotate-right"></i></button>' +
                    '<button type="button" data-domain-action="delete" data-domain-id="' + escapeHtml(item.id) + '" class="min-w-10 min-h-10 rounded-full text-red-500 hover:bg-red-500 hover:text-white" title="删除"><i class="fa-solid fa-trash-can"></i></button></div>' +
                    '<div class="pr-32"><h2 class="text-xl font-black text-slate-950 break-words">' + title + '</h2>' + domainLine + '</div>' +
                    '<div class="flex items-center justify-between gap-2 mt-5"><span class="text-sm text-slate-600"><i class="fa-solid fa-building mr-2 text-slate-400"></i>' + registrar + '</span><span class="px-2.5 py-1 rounded-full text-xs font-black whitespace-nowrap ' + status.badge + '">' + escapeHtml(status.text) + '</span></div>' +
                    '<div class="grid grid-cols-2 gap-3 mt-4 text-sm"><div class="rounded-xl bg-white/70 px-3 py-2.5"><p class="text-xs text-slate-500 font-bold">到期日</p><p class="font-black mt-1">' + escapeHtml(item.expireDate) + '</p></div><div class="rounded-xl bg-white/70 px-3 py-2.5"><p class="text-xs text-slate-500 font-bold">自动续费</p><p class="font-black mt-1 ' + (item.autoRenew ? 'text-emerald-700' : 'text-slate-600') + '">' + (item.autoRenew ? '已开启' : '未开启') + '</p></div></div>' +
                    remark + '<div class="mt-auto pt-4"><div class="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden"><div class="h-full rounded-full ' + status.bar + '" style="width:' + progress + '%"></div></div><div class="flex justify-between gap-3 text-xs text-slate-500 font-semibold mt-2"><span>提前 ' + escapeHtml(item.notifyAdvance == null || item.notifyAdvance === '' ? 30 : item.notifyAdvance) + ' 天提醒</span>' + cost + '</div>' + renewLink + '</div></article>');
            });
        }

        function clearFilters() {
            document.getElementById('domainSearch').value = '';
            document.getElementById('statusFilter').value = 'all';
            renderDomains();
        }

        function openDomainModal() {
            editingDomainId = null;
            document.getElementById('domainModalTitle').innerHTML = '<i class="fa-solid fa-globe text-cyan-700"></i>新增域名';
            document.getElementById('domainForm').reset();
            document.getElementById('domainNotifyAdvance').value = '30';
            document.getElementById('domainNotifyInterval').value = '7';
            document.getElementById('domainNotifyCount').value = '5';
            showModal('domainModal', 'domainModalPanel');
            setTimeout(function () { document.getElementById('domainName').focus(); }, 280);
        }

        function openEditDomain(id) {
            const item = domains.find(function (entry) { return entry.id === id; });
            if (!item) return;
            editingDomainId = id;
            document.getElementById('domainModalTitle').innerHTML = '<i class="fa-solid fa-pen text-emerald-600"></i>编辑域名';
            document.getElementById('domainName').value = item.domain || '';
            document.getElementById('domainLabel').value = item.label || '';
            document.getElementById('domainRegistrar').value = item.registrar || '';
            document.getElementById('domainExpire').value = item.expireDate || '';
            document.getElementById('domainAnnualCost').value = item.annualCost || '';
            document.getElementById('domainAutoRenew').checked = Boolean(item.autoRenew);
            document.getElementById('domainNotifyAdvance').value = item.notifyAdvance === undefined || item.notifyAdvance === '' ? '30' : item.notifyAdvance;
            document.getElementById('domainNotifyInterval').value = item.notifyInterval === undefined || item.notifyInterval === '' ? '7' : item.notifyInterval;
            document.getElementById('domainNotifyCount').value = item.notifyCount === undefined || item.notifyCount === '' ? '5' : item.notifyCount;
            document.getElementById('domainRenewalUrl').value = item.renewalUrl || '';
            document.getElementById('domainRemark').value = item.remark || '';
            showModal('domainModal', 'domainModalPanel');
        }

        function showModal(modalId, panelId) {
            const modal = document.getElementById(modalId), panel = document.getElementById(panelId);
            modal.classList.remove('hidden'); modal.classList.add('flex');
            requestAnimationFrame(function () { panel.classList.remove('scale-95', 'opacity-0'); panel.classList.add('scale-100', 'opacity-100'); });
        }

        function hideModal(modalId, panelId) {
            const modal = document.getElementById(modalId), panel = document.getElementById(panelId);
            panel.classList.remove('scale-100', 'opacity-100'); panel.classList.add('scale-95', 'opacity-0');
            setTimeout(function () { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 250);
        }

        function closeDomainModal() { hideModal('domainModal', 'domainModalPanel'); editingDomainId = null; }

        async function submitDomain(event) {
            event.preventDefault();
            const btn = document.getElementById('saveDomainBtn');
            const original = btn.textContent;
            const wasEditing = Boolean(editingDomainId);
            btn.disabled = true; btn.textContent = '保存中...';
            const payload = {
                domain: document.getElementById('domainName').value.trim(),
                label: document.getElementById('domainLabel').value.trim(),
                registrar: document.getElementById('domainRegistrar').value.trim(),
                expireDate: document.getElementById('domainExpire').value,
                annualCost: document.getElementById('domainAnnualCost').value.trim(),
                autoRenew: document.getElementById('domainAutoRenew').checked,
                notifyAdvance: document.getElementById('domainNotifyAdvance').value,
                notifyInterval: document.getElementById('domainNotifyInterval').value,
                notifyCount: document.getElementById('domainNotifyCount').value,
                renewalUrl: document.getElementById('domainRenewalUrl').value.trim(),
                remark: document.getElementById('domainRemark').value.trim()
            };
            if (editingDomainId) payload.id = editingDomainId;
            try {
                const response = await fetch(DOMAIN_API_URL, { method: editingDomainId ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
                if (response.status === 401) { logout(); return; }
                const result = await response.json().catch(function () { return {}; });
                if (!response.ok || !result.success) throw new Error(result.message || '保存失败');
                closeDomainModal(); showToast(wasEditing ? '域名已更新' : '域名已添加'); await fetchDomains();
            } catch (error) { showToast(error.message || '保存失败', true); }
            finally { btn.disabled = false; btn.textContent = original; }
        }

        function confirmAction(title, message, action, destructive) {
            pendingConfirmAction = action;
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            const btn = document.getElementById('confirmActionBtn');
            btn.className = 'min-h-11 flex-1 text-white font-bold rounded-xl ' + (destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-700 hover:bg-cyan-800');
            showModal('confirmModal', 'confirmPanel');
        }

        function closeConfirm() { pendingConfirmAction = null; hideModal('confirmModal', 'confirmPanel'); }

        function renewDomain(id) {
            const item = domains.find(function (entry) { return entry.id === id; });
            if (!item) return;
            confirmAction('到期日顺延一年', '确认该域名已经续费吗？\\n系统会从当前到期日顺延一年；若已经过期，则从今天计算。', async function () {
                const todayText = shanghaiDateKey();
                const baseText = item.expireDate > todayText ? item.expireDate : todayText;
                const base = new Date(baseText + 'T00:00:00Z');
                const month = base.getUTCMonth(), targetYear = base.getUTCFullYear() + 1;
                base.setUTCFullYear(targetYear);
                if (base.getUTCMonth() !== month) base.setUTCDate(0);
                const nextDate = base.getUTCFullYear() + '-' + String(base.getUTCMonth() + 1).padStart(2, '0') + '-' + String(base.getUTCDate()).padStart(2, '0');
                await updateDomain(id, { expireDate: nextDate }, '到期日已顺延一年');
            }, false);
        }

        function deleteDomain(id) {
            const item = domains.find(function (entry) { return entry.id === id; });
            if (!item) return;
            confirmAction('删除域名', '确定删除 “' + item.domain + '” 吗？此操作无法恢复。', async function () {
                try {
                    const response = await fetch(DOMAIN_API_URL, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id: id }) });
                    if (response.status === 401) { logout(); return; }
                    if (!response.ok) throw new Error('删除失败');
                    hideModal('confirmModal', 'confirmPanel'); showToast('域名已删除'); await fetchDomains();
                } catch (error) { showToast(error.message || '删除失败', true); }
            }, true);
        }

        async function updateDomain(id, fields, successMessage) {
            try {
                const response = await fetch(DOMAIN_API_URL, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(Object.assign({ id: id }, fields)) });
                if (response.status === 401) { logout(); return; }
                const result = await response.json().catch(function () { return {}; });
                if (!response.ok || !result.success) throw new Error(result.message || '更新失败');
                hideModal('confirmModal', 'confirmPanel'); showToast(successMessage); await fetchDomains();
            } catch (error) { showToast(error.message || '更新失败', true); }
        }

        async function sendTestReminder() {
            const btn = document.getElementById('testReminderBtn'), original = btn.innerHTML;
            btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>发送中...';
            try {
                const response = await fetch(DOMAIN_TEST_URL, { method: 'POST', headers: authHeaders() });
                if (response.status === 401) { logout(); return; }
                const result = await response.json().catch(function () { return {}; });
                if (!response.ok || !result.success) throw new Error(result.message || '发送失败');
                showToast('域名测试提醒已发送，共 ' + (result.sent || 0) + ' 条');
            } catch (error) { showToast(error.message || '发送失败', true); }
            finally { btn.disabled = false; btn.innerHTML = original; }
        }

        document.getElementById('current-date').textContent = formatToday();
        document.getElementById('sendCodeBtn').addEventListener('click', sendCode);
        document.getElementById('loginBtn').addEventListener('click', verifyCode);
        document.getElementById('authCode').addEventListener('keydown', function (event) { if (event.key === 'Enter') verifyCode(); });
        document.getElementById('addDomainBtn').addEventListener('click', openDomainModal);
        document.getElementById('testReminderBtn').addEventListener('click', sendTestReminder);
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('closeDomainModalBtn').addEventListener('click', closeDomainModal);
        document.getElementById('domainForm').addEventListener('submit', submitDomain);
        document.getElementById('domainSearch').addEventListener('input', renderDomains);
        document.getElementById('statusFilter').addEventListener('change', renderDomains);
        document.getElementById('domain-container').addEventListener('click', function (event) {
            const button = event.target.closest('[data-domain-action]');
            if (!button) return;
            const id = button.getAttribute('data-domain-id');
            const action = button.getAttribute('data-domain-action');
            if (action === 'edit') openEditDomain(id);
            else if (action === 'renew') renewDomain(id);
            else if (action === 'delete') deleteDomain(id);
        });
        document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirm);
        document.getElementById('confirmActionBtn').addEventListener('click', async function () { if (pendingConfirmAction) { const action = pendingConfirmAction; pendingConfirmAction = null; await action(); } });
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { closeDomainModal(); closeConfirm(); } });

        if (getToken()) { showMain(); fetchDomains(); } else { showLogin(); }
    </script>
</body>
</html>`;
