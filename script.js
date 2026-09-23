// TRẠNG THÁI ỨNG DỤNG
let currentUser = null;
let userBalance = 1000000; // Tiền ảo khởi điểm 1,000,000 VNDT
let currentSession = 88231;
let timeLeft = 45;
let isBettingOpen = true;
let myBetTai = 0;
let myBetXiu = 0;
let totalTaiMoney = 18910000;
let totalXiuMoney = 15420000;
let taiPlayersCount = 168;
let xiuPlayersCount = 142;
let gameHistory = ['tai', 'xiu', 'tai', 'tai', 'xiu', 'xiu', 'tai', 'xiu'];

let selectedChip = 1000; // Mặc định 1k
let selectedTargetType = null; // 'tai' hoặc 'xiu'

// KHI TẢI TRANG
window.onload = function() {
    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loading-screen').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-screen').classList.add('hidden');
                    document.getElementById('main-app').classList.remove('hidden');
                    checkSavedLogin();
                    initGameLoop();
                    renderRoadMap();
                }, 500);
            }, 300);
        }
        progressBar.style.width = progress + '%';
        loadingText.innerText = `Đang tải tài nguyên... ${progress}%`;
    }, 120);
};

// ĐĂNG NHẬP / ĐĂNG KÝ
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-user').value;
    const display = document.getElementById('reg-display').value;
    const pass = document.getElementById('reg-pass').value;
    const repass = document.getElementById('reg-repass').value;

    if (pass !== repass) {
        showToast("Mật khẩu nhập lại không khớp!");
        return;
    }

    localStorage.setItem('winvip_user', JSON.stringify({ user, display, pass, balance: 2000000 }));
    showToast("Đăng ký thành công! Hãy đăng nhập.");
    closeModal('register-modal');
    openModal('login-modal');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const remember = document.getElementById('remember-me').checked;

    let saved = JSON.parse(localStorage.getItem('winvip_user'));
    if (saved && saved.user === user && saved.pass === pass) {
        currentUser = saved.display;
        userBalance = saved.balance;
        if (remember) {
            localStorage.setItem('winvip_remember', user);
        }
        loginSuccessActions();
        closeModal('login-modal');
        showToast("Đăng nhập thành công!");
    } else {
        currentUser = user;
        loginSuccessActions();
        closeModal('login-modal');
        showToast("Đăng nhập phiên nhanh thành công!");
    }
}

function checkSavedLogin() {
    let remembered = localStorage.getItem('winvip_remember');
    let saved = JSON.parse(localStorage.getItem('winvip_user'));
    if (remembered && saved && saved.user === remembered) {
        currentUser = saved.display;
        userBalance = saved.balance;
        loginSuccessActions();
    }
}

function loginSuccessActions() {
    document.getElementById('auth-buttons').classList.add('hidden');
    document.getElementById('user-controls').classList.remove('hidden');
    const displayEl = document.getElementById('user-display-name');
    const balanceEl = document.getElementById('account-balance');
    displayEl.innerText = currentUser;
    displayEl.classList.remove('hidden');
    balanceEl.classList.remove('hidden');
    updateBalanceUI();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('winvip_remember');
    document.getElementById('auth-buttons').classList.remove('hidden');
    document.getElementById('user-controls').classList.add('hidden');
    document.getElementById('user-display-name').classList.add('hidden');
    document.getElementById('account-balance').classList.add('hidden');
    closeModal('setting-modal');
    showToast("Đã đăng xuất tài khoản.");
}

function updateBalanceUI() {
    document.getElementById('balance-num').innerText = userBalance.toLocaleString();
}

// XỬ LÝ CHỌN CHIP & CỬA CƯỢC
function setChip(amount) {
    selectedChip = amount;
    document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let text = amount >= 1000000 ? (amount / 1000000) + 'M' : (amount / 1000) + 'k';
    document.getElementById('current-chip').innerText = text;
}

function selectTarget(type) {
    selectedTargetType = type;
    let name = type === 'tai' ? 'TÀI' : 'XỈU';
    document.getElementById('selected-target').innerText = name;
    showToast(`Đã chọn cửa: ${name}`);
}

function confirmBet() {
    if (!currentUser) {
        showToast("Vui lòng đăng nhập để cược!");
        openModal('login-modal');
        return;
    }
    if (!isBettingOpen) {
        showToast("Đã hết thời gian cược phiên này!");
        return;
    }
    if (!selectedTargetType) {
        showToast("Vui lòng bấm chọn cửa TÀI hoặc XỈU trước!");
        return;
    }
    if (userBalance < selectedChip) {
        showToast("Số dư tiền ảo không đủ để cược mức này!");
        return;
    }

    userBalance -= selectedChip;
    updateBalanceUI();

    if (selectedTargetType === 'tai') {
        myBetTai += selectedChip;
        totalTaiMoney += selectedChip;
        document.getElementById('tai-my').innerText = myBetTai.toLocaleString();
        document.getElementById('tai-total').innerText = totalTaiMoney.toLocaleString();
    } else {
        myBetXiu += selectedChip;
        totalXiuMoney += selectedChip;
        document.getElementById('xiu-my').innerText = myBetXiu.toLocaleString();
        document.getElementById('xiu-total').innerText = totalXiuMoney.toLocaleString();
    }

    showToast(`Đã cược thành công ${selectedChip.toLocaleString()} vào ${selectedTargetType.toUpperCase()}`);
}

function handleAllIn() {
    if (!currentUser) {
        showToast("Vui lòng đăng nhập!");
        openModal('login-modal');
        return;
    }
    if (!isBettingOpen) {
        showToast("Đã hết thời gian cược!");
        return;
    }
    if (!selectedTargetType) {
        showToast("Vui lòng chọn cửa TÀI hoặc XỈU để ALL-IN!");
        return;
    }
    if (userBalance <= 0) {
        showToast("Bạn đã hết sạch tiền ảo để All-In!");
        return;
    }

    let allInAmount = userBalance;
    userBalance = 0;
    updateBalanceUI();

    if (selectedTargetType === 'tai') {
        myBetTai += allInAmount;
        totalTaiMoney += allInAmount;
        document.getElementById('tai-my').innerText = myBetTai.toLocaleString();
        document.getElementById('tai-total').innerText = totalTaiMoney.toLocaleString();
    } else {
        myBetXiu += allInAmount;
        totalXiuMoney += allInAmount;
        document.getElementById('xiu-my').innerText = myBetXiu.toLocaleString();
        document.getElementById('xiu-total').innerText = totalXiuMoney.toLocaleString();
    }

    showToast(`🔥 ALL-IN THÀNH CÔNG ${allInAmount.toLocaleString()} vào ${selectedTargetType.toUpperCase()}!`);
}

function handleCancelBet() {
    if (myBetTai === 0 && myBetXiu === 0) {
        showToast("Bạn chưa đặt cược khoản nào trong phiên này để huỷ!");
        return;
    }

    let refunded = myBetTai + myBetXiu;
    userBalance += refunded;
    
    totalTaiMoney -= myBetTai;
    totalXiuMoney -= myBetXiu;

    myBetTai = 0;
    myBetXiu = 0;

    document.getElementById('tai-my').innerText = '0';
    document.getElementById('xiu-my').innerText = '0';
    document.getElementById('tai-total').innerText = totalTaiMoney.toLocaleString();
    document.getElementById('xiu-total').innerText = totalXiuMoney.toLocaleString();

    updateBalanceUI();
    showToast(`Đã huỷ cược và hoàn lại ${refunded.toLocaleString()} VNDT!`);
}

// GAME LOOP TÀI XỈU
function initGameLoop() {
    setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            document.getElementById('timer-text').innerText = timeLeft;

            if (timeLeft > 5 && Math.random() > 0.4) {
                totalTaiMoney += Math.floor(Math.random() * 50000) + 10000;
                totalXiuMoney += Math.floor(Math.random() * 50000) + 10000;
                document.getElementById('tai-total').innerText = totalTaiMoney.toLocaleString();
                document.getElementById('xiu-total').innerText = totalXiuMoney.toLocaleString();
            }
        } else {
            isBettingOpen = false;
            document.getElementById('timer-text').innerText = "Đang mở...";
            
            setTimeout(() => {
                resolveGame();
            }, 2000);
        }
    }, 1000);
}

function resolveGame() {
    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    let d3 = Math.floor(Math.random() * 6) + 1;
    let sum = d1 + d2 + d3;
    let result = (sum >= 11) ? 'tai' : 'xiu';

    document.getElementById('dice-1').innerText = d1;
    document.getElementById('dice-2').innerText = d2;
    document.getElementById('dice-3').innerText = d3;

    let winMsg = `Kết quả: ${d1}-${d2}-${d3} (${sum} điểm - ${result.toUpperCase()}). `;
    if (result === 'tai' && myBetTai > 0) {
        let won = myBetTai * 2;
        userBalance += won;
        winMsg += `Bạn THẮNG +${won.toLocaleString()} VNDT!`;
    } else if (result === 'xiu' && myBetXiu > 0) {
        let won = myBetXiu * 2;
        userBalance += won;
        winMsg += `Bạn THẮNG +${won.toLocaleString()} VNDT!`;
    } else {
        winMsg += `Rất tiếc, chúc bạn may mắn phiên sau!`;
    }

    showToast(winMsg);
    updateBalanceUI();

    gameHistory.push(result);
    if (gameHistory.length > 20) gameHistory.shift();
    renderRoadMap();

    setTimeout(() => {
        resetNewSession();
    }, 5000);
}

function resetNewSession() {
    currentSession++;
    timeLeft = 45;
    isBettingOpen = true;
    myBetTai = 0;
    myBetXiu = 0;
    document.getElementById('session-id').innerText = currentSession;
    document.getElementById('timer-text').innerText = timeLeft;
    document.getElementById('dice-1').innerText = '?';
    document.getElementById('dice-2').innerText = '?';
    document.getElementById('dice-3').innerText = '?';
    document.getElementById('tai-my').innerText = '0';
    document.getElementById('xiu-my').innerText = '0';
}

function renderRoadMap() {
    const roadMapEl = document.getElementById('road-map');
    roadMapEl.innerHTML = '';
    gameHistory.forEach(item => {
        let dot = document.createElement('div');
        dot.className = `road-dot ${item}`;
        dot.innerText = item === 'tai' ? 'T' : 'X';
        roadMapEl.appendChild(dot);
    });
}

// CÀI ĐẶT NHẠC NỀN
function toggleMusic() {
    const audio = document.getElementById('bg-audio');
    const isChecked = document.getElementById('bg-music-toggle').checked;
    if (isChecked) {
        audio.play().catch(e => console.log("Audio restricted"));
        showToast("Đã bật nhạc nền sòng bạc");
    } else {
        audio.pause();
        showToast("Đã tắt nhạc nền");
    }
}

// RÚT TIỀN TABS
function switchWithdrawTab(type) {
    document.querySelectorAll('.w-tab').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    const bodyEl = document.getElementById('withdraw-body');
    if (type === 'bank') {
        bodyEl.innerHTML = `
            <select style="width:100%; padding:10px; margin-bottom:10px; background:#111; color:#fff; border:1px solid #444; border-radius:5px;">
                <option>Vietcombank</option>
                <option>Techcombank</option>
                <option>MB Bank</option>
                <option>ZaloPay Wallet</option>
                <option>Momo</option>
            </select>
            <input type="text" placeholder="Số tài khoản / Số điện thoại" required>
            <input type="text" placeholder="Tên chủ tài khoản" required>
            <input type="number" placeholder="Số tiền ảo muốn rút (VNDT)" required>
            <button class="btn-submit" onclick="processWithdraw()">Xác Nhận Rút Ngân Hàng</button>
        `;
    } else if (type === 'card') {
        bodyEl.innerHTML = `
            <select style="width:100%; padding:10px; margin-bottom:10px; background:#111; color:#fff; border:1px solid #444; border-radius:5px;">
                <option>Viettel</option>
                <option>Vinaphone</option>
                <option>Mobifone</option>
            </select>
            <select style="width:100%; padding:10px; margin-bottom:10px; background:#111; color:#fff; border:1px solid #444; border-radius:5px;">
                <option>50,000 VND</option>
                <option>100,000 VND</option>
                <option>500,000 VND</option>
            </select>
            <button class="btn-submit" onclick="processWithdraw()">Đổi Thẻ Cào</button>
        `;
    } else if (type === 'usdt') {
        bodyEl.innerHTML = `
            <input type="text" placeholder="Địa chỉ ví USDT (TRC20 / ERC20)" required>
            <input type="number" placeholder="Số lượng USDT muốn rút" required>
            <button class="btn-submit" onclick="processWithdraw()">Rút Về Ví USDT</button>
        `;
    }
}

function processWithdraw() {
    showToast("Yêu cầu rút tiền ảo đã được gửi lên hệ thống kiểm duyệt!");
    closeModal('withdraw-modal');
}

// TOAST NOTIFICATION
function showToast(msg) {
    const toast = document.getElementById('toast-notify');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3500);
}
