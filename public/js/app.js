// Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    login: `${API_BASE_URL}/api/chat/login`,
    message: `${API_BASE_URL}/api/chat/message`,
    createSession: `${API_BASE_URL}/api/chat/session/get-or-create`,
    endSession: (sessionId) => `${API_BASE_URL}/api/chat/session/${sessionId}/end`,
    getMessages: (sessionId) => `${API_BASE_URL}/api/chat/session/${sessionId}/messages/latest`,
    getMessagesBefore: (sessionId, beforeMessageId) => `${API_BASE_URL}/api/chat/session/${sessionId}/messages/before/${beforeMessageId}`,
    feedback: (messageId) => `${API_BASE_URL}/api/chat/message/${messageId}/feedback`,
    dashboardKPI: `${API_BASE_URL}/api/dashboard/kpi-summary`,
    dashboardAISummary: `${API_BASE_URL}/api/dashboard/ai-summary`,
    dashboardBase: `${API_BASE_URL}/api/dashboard`,
    taskReminderSuggestions: (userId, period) => `${API_BASE_URL}/api/taskreminder/suggestions?userId=${userId}&period=${period}`,
    taskReminderRefresh: (userId, period) => `${API_BASE_URL}/api/taskreminder/refresh?userId=${userId}&period=${period}`,
    taskReminderAssignments: (userId, period) => `${API_BASE_URL}/api/taskreminder/assignments?userId=${userId}&period=${period}`
};

// Period Selection Function - Must be defined early for HTML onclick handlers
function selectPeriod(period) {
    window.currentPeriod = period;
    const now = new Date();

    // Update filter button text and period label
    const filterText = document.getElementById('period-filter-text');
    const periodLabel = document.getElementById('current-period-label');

    // Hide all checkmarks first
    document.querySelectorAll('.period-check').forEach(el => {
        el.classList.add('text-transparent');
        el.classList.remove('text-blue-600');
    });

    // Show checkmark for selected period
    const selectedCheck = document.querySelector(`.period-check.${period}`);
    if (selectedCheck) {
        selectedCheck.classList.remove('text-transparent');
        selectedCheck.classList.add('text-blue-600');
    }

    switch (period) {
        case 'today':
            filterText.textContent = 'Hôm nay';
            periodLabel.textContent = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
            break;
        case 'this_week':
            filterText.textContent = 'Tuần này';
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            periodLabel.textContent = `Tuần ${Math.ceil((now.getDate()) / 7)}/${now.getFullYear()}`;
            break;
        case 'this_month':
            filterText.textContent = 'Tháng này';
            periodLabel.textContent = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
            break;
        case 'all':
            filterText.textContent = 'Tất cả';
            periodLabel.textContent = 'Tất cả thời gian';
            break;
    }

    window.currentYear = now.getFullYear();
    window.currentMonth = now.getMonth() + 1;

    // Hide dropdown
    const periodFilterDropdown = document.getElementById('period-filter-dropdown');
    if (periodFilterDropdown) {
        periodFilterDropdown.classList.add('hidden');
    }

    console.log('[Period Filter] Changed to:', period);
    
    // Reload dashboard data and reminders
    if (window.loadDashboardData) {
        console.log('[Period Filter] Calling loadDashboardData...');
        window.loadDashboardData();
    }
    
    if (window.loadTaskReminders) {
        console.log('[Period Filter] Calling loadTaskReminders...');
        window.loadTaskReminders();
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Expose to window immediately
window.selectPeriod = selectPeriod;

// State
let currentSession = null;
let currentUser = null;
let isLoadingMessages = false;
let hasMoreMessages = false;
let oldestMessageId = null;
let isSendingMessage = false; // Prevent double submission

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginForm = document.getElementById('login-form');
const employeeCodeInput = document.getElementById('employee-code');
const btnLogin = document.getElementById('btn-login');
const loginError = document.getElementById('login-error');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const btnLogout = document.getElementById('btn-logout');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const sessionInfo = document.getElementById('session-info');
const newSessionBtn = document.getElementById('new-session-btn');
const scrollToBottomBtn = null; // Remove scroll button in new UI

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    checkLoginStatus();
    setupEventListeners();
    setupPeriodSelector();
});

// Setup Event Listeners
function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', handleLogin);
    btnLogout.addEventListener('click', handleLogout);

    // Chat
    sendBtn.addEventListener('click', handleSendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    userInput.addEventListener('input', () => {
        autoResizeTextarea();
    });

    newSessionBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn bắt đầu phiên chat mới?')) {
            startNewSession();
        }
    });
    
    // Scroll to bottom button
    if (scrollToBottomBtn) {
        scrollToBottomBtn.addEventListener('click', () => {
            scrollToBottom();
        });
    }
    
    // Infinite scroll and show/hide scroll button
    chatMessages.addEventListener('scroll', handleScroll);
    chatMessages.addEventListener('scroll', handleScrollToBottomButton);

    // Note: Dashboard and chatbot event listeners are registered in setupDashboardListeners()
    // after login when elements are visible
}

// Auto-resize textarea
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
}

// Check Login Status
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showChatScreen();
    } else {
        showLoginScreen();
    }
}

// Show Login Screen
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
}

// Show Chat Screen
function showChatScreen() {
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    chatScreen.classList.add('flex');
    userName.textContent = currentUser.employeeName;
    if (userAvatar) {
        userAvatar.textContent = currentUser.employeeName.substring(0, 2).toUpperCase();
    }
    // Reinitialize icons after DOM update
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    // Load dashboard data
    loadDashboardData();
    // Load task reminders
    loadTaskReminders();
    // Initialize chat
    initializeChat();
    
    // Setup dashboard event listeners (after DOM is ready)
    setTimeout(() => {
        setupDashboardListeners();
    }, 100);
}

// Setup Dashboard Event Listeners
function setupDashboardListeners() {
    // Button Phân tích chi tiết - Open sidebar with detailed analysis
    const btnDetailedAnalysis = document.getElementById('btn-detailed-analysis');
    
    if (btnDetailedAnalysis) {
        btnDetailedAnalysis.addEventListener('click', (e) => {
            e.preventDefault();
            openChatbotWithDetailedAnalysis();
        });
    }

    // Chatbot sidebar
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotSidebar = document.getElementById('chatbot-sidebar');
    const closeChatbotSidebar = document.getElementById('close-chatbot-sidebar');
    
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            chatbotSidebar.classList.remove('translate-x-full');
            lucide.createIcons();
        });
    }
    
    if (closeChatbotSidebar) {
        closeChatbotSidebar.addEventListener('click', () => {
            chatbotSidebar.classList.add('translate-x-full');
        });
    }

    // Chatbot tabs
    const chatbotTabs = document.querySelectorAll('.chatbot-tab');
    chatbotTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update tab styles
            chatbotTabs.forEach(t => {
                t.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-white');
                t.classList.add('text-slate-600');
            });
            tab.classList.remove('text-slate-600');
            tab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-white');
            
            // Show/hide content
            document.querySelectorAll('.chatbot-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
            
            // Reinitialize icons
            lucide.createIcons();
        });
    });
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Get current period filter
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || (new Date().getMonth() + 1);
        const period = window.currentPeriod || 'this_month';
        
        console.log('[Dashboard] Loading with period:', period, 'year:', year, 'month:', month);
        
        // Map period to periodType for backward compatibility with existing dashboard API
        let periodType = 'current_month';
        switch(period) {
            case 'today':
            case 'this_week':
            case 'this_month':
                periodType = 'current_month';
                break;
            case 'all':
                periodType = 'last_6_months';
                break;
        }
        
        console.log('[Dashboard] Mapped periodType:', periodType);
        
        // Load KPI summary with period filter and periodType
        const kpiUrl = `${API_ENDPOINTS.dashboardKPI}?year=${year}&month=${month}&periodType=${periodType}`;
        console.log('[Dashboard] Fetching KPI:', kpiUrl);
        const kpiResponse = await fetch(kpiUrl);
        if (kpiResponse.ok) {
            const kpiData = await kpiResponse.json();
            updateKPICards(kpiData);
        }

        // Load AI summary với parameters
        const aiSummaryUrl = `${API_ENDPOINTS.dashboardAISummary}?year=${year}&month=${month}&periodType=${periodType}`;
        const aiResponse = await fetch(aiSummaryUrl);
        if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            if (aiData.summary) {
                updateAISummary(aiData.summary);
            }
        } else {
            updateAISummary('Đang phân tích dữ liệu...');
        }
        
        // Load top departments and requesters
        await refreshTopDepartments(null, year, month);
        await refreshTopRequesters(null, year, month);
        
        // Update last update time
        if (typeof updateLastUpdateTime === 'function') {
            updateLastUpdateTime();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Make loadDashboardData globally accessible for period filter
window.loadDashboardData = loadDashboardData;

// Refresh Top Departments
async function refreshTopDepartments(event, year = null, month = null) {
    if (event) event.preventDefault();
    
    try {
        const container = document.getElementById('top-departments-container');
        if (!container) return;
        
        // Show loading
        container.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;
        
        // Get current filter if not provided
        const queryYear = year || window.currentYear || new Date().getFullYear();
        const queryMonth = month || window.currentMonth || (new Date().getMonth() + 1);
        
        const response = await fetch(`/api/dashboard/top-departments?year=${queryYear}&month=${queryMonth}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch top departments');
        }
        
        const result = await response.json();
        
        if (result.success && result.data.departments && result.data.departments.length > 0) {
            let html = '<ul class="space-y-3">';
            result.data.departments.forEach((dept, index) => {
                const rankClass = index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                index === 1 ? 'bg-slate-100 text-slate-800' : 
                                'bg-orange-100 text-orange-800';
                html += `
                    <li class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="flex items-center justify-center w-6 h-6 rounded-full ${rankClass} text-xs font-bold">
                                ${index + 1}
                            </span>
                            <span class="font-medium text-slate-700">${dept.name}</span>
                        </div>
                        <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                            ${dept.count} phieu
                        </span>
                    </li>
                `;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-slate-500 text-center py-8">Chua co du lieu</p>';
        }
    } catch (error) {
        console.error('Error refreshing top departments:', error);
        const container = document.getElementById('top-departments-container');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center py-8">Loi tai du lieu</p>';
        }
    }
}

// Refresh Top Requesters
async function refreshTopRequesters(event, year = null, month = null) {
    if (event) event.preventDefault();
    
    try {
        const container = document.getElementById('top-requesters-container');
        if (!container) return;
        
        // Show loading
        container.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        `;
        
        // Get current filter if not provided
        const queryYear = year || window.currentYear || new Date().getFullYear();
        const queryMonth = month || window.currentMonth || (new Date().getMonth() + 1);
        
        const response = await fetch(`/api/dashboard/top-requesters?year=${queryYear}&month=${queryMonth}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch top requesters');
        }
        
        const result = await response.json();
        
        if (result.success && result.data.requesters && result.data.requesters.length > 0) {
            let html = '<ul class="space-y-3">';
            result.data.requesters.forEach((requester, index) => {
                const rankClass = index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                index === 1 ? 'bg-slate-100 text-slate-800' : 
                                'bg-orange-100 text-orange-800';
                html += `
                    <li class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="flex items-center justify-center w-6 h-6 rounded-full ${rankClass} text-xs font-bold">
                                ${index + 1}
                            </span>
                            <span class="font-medium text-slate-700">${requester.name}</span>
                        </div>
                        <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                            ${requester.count} phieu
                        </span>
                    </li>
                `;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-slate-500 text-center py-8">Chua co du lieu</p>';
        }
    } catch (error) {
        console.error('Error refreshing top requesters:', error);
        const container = document.getElementById('top-requesters-container');
        if (container) {
            container.innerHTML = '<p class="text-red-500 text-center py-8">Loi tai du lieu</p>';
        }
    }
}

// Make functions globally accessible
window.refreshTopDepartments = refreshTopDepartments;
window.refreshTopRequesters = refreshTopRequesters;

// Update KPI Cards
function updateKPICards(data) {
    const totalEl = document.getElementById('kpi-total');
    const completedEl = document.getElementById('kpi-completed');
    const inProgressEl = document.getElementById('kpi-in-progress');
    const pendingEl = document.getElementById('kpi-pending');
    const reminderPending = document.getElementById('reminder-pending');
    const reminderProgress = document.getElementById('reminder-progress');

    if (totalEl) {
        totalEl.textContent = data.totalTickets;
        totalEl.classList.remove('text-slate-400');
        totalEl.classList.add('text-slate-800');
    }
    if (completedEl) {
        completedEl.textContent = data.completedTickets;
        completedEl.classList.remove('text-slate-400');
        completedEl.classList.add('text-emerald-600');
    }
    if (inProgressEl) {
        inProgressEl.textContent = data.inProgressTickets;
        inProgressEl.classList.remove('text-slate-400');
        inProgressEl.classList.add('text-blue-600');
    }
    if (pendingEl) {
        pendingEl.textContent = data.pendingTickets;
        pendingEl.classList.remove('text-slate-400');
        pendingEl.classList.add('text-orange-600');
    }
    
    // Update labels with delta indicators
    const totalLabel = document.getElementById('kpi-total-label');
    const completedLabel = document.getElementById('kpi-completed-label');
    const inProgressLabel = document.getElementById('kpi-in-progress-label');
    const pendingLabel = document.getElementById('kpi-pending-label');
    
    const completionRate = data.completionRate ? data.completionRate.toFixed(1) + '%' : '0%';
    const inProgressRate = data.totalTickets > 0 ? ((data.inProgressTickets / data.totalTickets) * 100).toFixed(1) + '%' : '0%';
    const pendingRate = data.totalTickets > 0 ? ((data.pendingTickets / data.totalTickets) * 100).toFixed(1) + '%' : '0%';
    
    // Get period info from data if available
    const periodInfo = data.period || '';
    const displayPeriod = periodInfo.replace('Thang', 'Tháng');
    
    // Helper function to format delta with icon and color
    function formatDelta(pctChange, value) {
        if (!pctChange || pctChange === 0) return '';
        const isPositive = pctChange > 0;
        const icon = isPositive ? '↑' : '↓';
        const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600';
        return `<span class="${colorClass} font-medium ml-1">${icon} ${Math.abs(pctChange)}%</span>`;
    }
    
    // Update labels with deltas if available
    if (data.deltas && data.previous_month) {
        const prevPeriod = data.previous_month.period.replace('Thang', 'T');
        
        // Total card: show "Tháng trước: 55 ↓ 25.5%"
        if (totalLabel) {
            const deltaHtml = formatDelta(data.deltas.pct_change_total);
            totalLabel.innerHTML = `${prevPeriod}: ${data.previous_month.total_tickets}${deltaHtml}`;
        }
        
        // Completed card: show "Tỷ lệ 60.98% ↓ 52.8%"
        if (completedLabel) {
            const deltaHtml = formatDelta(data.deltas.pct_change_completed);
            completedLabel.innerHTML = `Tỷ lệ ${completionRate}${deltaHtml}`;
        }
        
        // In Progress card: show "Chiếm 19.5% ↑ 700%"
        if (inProgressLabel) {
            const deltaHtml = formatDelta(data.deltas.pct_change_in_progress);
            inProgressLabel.innerHTML = `Chiếm ${inProgressRate}${deltaHtml}`;
        }
        
        // Pending card: show "Chiếm 19.5% ↑ 700%"
        if (pendingLabel) {
            const deltaHtml = formatDelta(data.deltas.pct_change_pending);
            pendingLabel.innerHTML = `Chiếm ${pendingRate}${deltaHtml}`;
        }
    } else {
        if (totalLabel) totalLabel.textContent = displayPeriod || 'Tổng số phiếu IT';
        if (completedLabel) completedLabel.textContent = `Tỷ lệ ${completionRate}`;
        if (inProgressLabel) inProgressLabel.textContent = `Chiếm ${inProgressRate}`;
        if (pendingLabel) pendingLabel.textContent = `Chiếm ${pendingRate}`;
    }
    
    // Update reminder section
    if (reminderPending) reminderPending.textContent = data.pendingTickets || 0;
    if (reminderProgress) reminderProgress.textContent = data.inProgressTickets || 0;
    
    console.log('[Dashboard] Initializing charts with KPI data:', {
        total: data.totalTickets,
        completed: data.completedTickets,
        inProgress: data.inProgressTickets,
        pending: data.pendingTickets
    });
    
    // Initialize charts with KPI data
    if (typeof initializeCharts === 'function') {
        initializeCharts(data);
    }
}

// Update AI Summary
function updateAISummary(summaryText) {
    const summaryEl = document.getElementById('ai-summary');
    if (summaryEl) {
        summaryEl.textContent = summaryText;
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const employeeCode = employeeCodeInput.value.trim();
    
    if (!employeeCode) {
        showLoginError('Vui lòng nhập mã nhân viên');
        return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Đang đăng nhập...';
    hideLoginError();

    try {
        const response = await fetch(API_ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeCode: employeeCode
            })
        });

        const result = await response.json();

        if (result.success && result.data) {
            currentUser = {
                employeeId: result.data.employeeId,
                employeeCode: result.data.employeeCode,
                employeeName: result.data.employeeName
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showChatScreen();
        } else {
            showLoginError(result.errors?.[0] || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Đăng nhập';
    }
}

// Handle Logout
// Handle Logout
function handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        // Clear user data
        currentUser = null;
        currentSession = null;
        localStorage.removeItem('currentUser');
        
        // Clear chat
        chatMessages.innerHTML = '';
        employeeCodeInput.value = '';
        
        showLoginScreen();
    }
}

// Show Login Error
function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

// Hide Login Error
function hideLoginError() {
    loginError.classList.add('hidden');
}

// Initialize Chat
async function initializeChat() {
    try {
        await createSession();
        await loadMessages();
    } catch (error) {
        console.error('Failed to initialize chat:', error);
        addErrorMessage('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
}

// Create Session
async function createSession() {
    try {
        const response = await fetch(API_ENDPOINTS.createSession, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.employeeId
            })
        });

        const result = await response.json();
        
        if (result.success && result.data) {
            currentSession = result.data;
            updateSessionInfo();
            return currentSession;
        } else {
            throw new Error(result.errors?.[0] || 'Failed to create session');
        }
    } catch (error) {
        console.error('Create session error:', error);
        throw error;
    }
}

// Load Messages
// Clean progress status text from old messages
function cleanProgressText(text) {
    if (!text || typeof text !== 'string') return text;
    
    // Remove all progress markers and their following newlines
    let cleaned = text
        .replace(/Đang phân tích câu hỏi\.\.\.\s*/g, '')
        .replace(/Đang tạo truy vấn\.\.\.\s*/g, '')
        .replace(/Đang thực thi\.\.\.\s*/g, '')
        .replace(/Đang tạo phản hồi\.\.\.\s*/g, '');
    
    return cleaned.trim();
}

async function loadMessages() {
    if (!currentSession) return;

    try {
        const response = await fetch(API_ENDPOINTS.getMessages(currentSession.id) + '?limit=10');
        const result = await response.json();

        if (result.success && result.data && result.data.messages) {
            const messages = result.data.messages;
            hasMoreMessages = result.data.hasMore || false;
            
            if (messages.length > 0) {
                // Remove welcome message
                const welcomeMsg = chatMessages.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.remove();
                }

                // Lưu oldestMessageId để load thêm
                oldestMessageId = messages[0].id;

                // Display messages (backend đã trả về thứ tự từ cũ đến mới)
                messages.forEach(msg => {
                    if (msg.senderRole === 'user') {
                        addUserMessage(msg.messageText, false);
                    } else if (msg.senderRole === 'bot') {
                        // Clean progress text from old messages
                        let messageText = cleanProgressText(msg.messageText);
                        
                        // Try to parse response if it's JSON
                        let response = messageText;
                        try {
                            response = JSON.parse(messageText);
                        } catch (e) {
                            // Keep as string
                        }
                        addBotMessage(response, { SqlQuery: msg.script }, msg.id, false);
                    }
                });

                // Scroll to bottom after loading messages
                scrollToBottom();
            } else {
                // Không có tin nhắn cũ
            }
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
        addSystemMessage('Đã kết nối thành công. Bạn có thể bắt đầu chat!');
    }
}

// Handle Scroll for Infinite Loading
let scrollTimeout = null;
function handleScroll() {
    // Debounce để tránh gọi liên tục
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
        // Kiểm tra nếu scroll gần đến top (khoảng 100px)
        if (chatMessages.scrollTop <= 100 && hasMoreMessages && !isLoadingMessages) {
            console.log('Loading more messages... scrollTop:', chatMessages.scrollTop);
            loadMoreMessages();
        }
    }, 200); // Debounce 200ms
}

// Load More Messages
async function loadMoreMessages() {
    if (!currentSession || !oldestMessageId || !hasMoreMessages || isLoadingMessages) return;
    
    isLoadingMessages = true;
    const previousScrollHeight = chatMessages.scrollHeight;
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-more';
    loadingDiv.className = 'message message-bot';
    loadingDiv.innerHTML = `
        <div class="message-content" style="background: #e3f2fd; color: #1976d2;">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
            Đang tải thêm tin nhắn...
        </div>
    `;
    chatMessages.insertBefore(loadingDiv, chatMessages.firstChild);
    
    try {
        const url = API_ENDPOINTS.getMessagesBefore(currentSession.id, oldestMessageId) + '?limit=10';
        console.log('Fetching more messages from:', url);
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('Load more response:', result);
        
        if (result.success && result.data && result.data.messages) {
            const messages = result.data.messages;
            hasMoreMessages = result.data.hasMore || false;
            
            if (messages.length > 0) {
                // Update oldestMessageId
                oldestMessageId = messages[0].id;
                
                // Insert messages at the beginning (remove loading indicator first)
                const loadingDiv = document.getElementById('loading-more');
                if (loadingDiv) {
                    loadingDiv.remove();
                }
                
                const tempDiv = document.createElement('div');
                messages.forEach(msg => {
                    const messageDiv = createMessageElement(msg);
                    if (messageDiv) {
                        tempDiv.appendChild(messageDiv);
                    }
                });
                
                // Insert before first message (or first non-loading element)
                const firstMessage = chatMessages.firstChild;
                if (firstMessage) {
                    chatMessages.insertBefore(tempDiv, firstMessage);
                    // Move children out of tempDiv
                    while (tempDiv.firstChild) {
                        chatMessages.insertBefore(tempDiv.firstChild, firstMessage);
                    }
                    tempDiv.remove();
                }
                
                // Maintain scroll position
                const newScrollHeight = chatMessages.scrollHeight;
                chatMessages.scrollTop = newScrollHeight - previousScrollHeight;
                
                console.log(`Loaded ${messages.length} more messages. HasMore: ${hasMoreMessages}`);
            } else {
                console.log('No more messages to load');
                hasMoreMessages = false;
            }
        } else {
            console.error('Load more failed:', result);
            hasMoreMessages = false;
        }
    } catch (error) {
        console.error('Failed to load more messages:', error);
    } finally {
        // Remove loading indicator
        const loadingDiv = document.getElementById('loading-more');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        isLoadingMessages = false;
    }
}

// Create Message Element (helper for loadMoreMessages)
function createMessageElement(msg) {
    if (msg.senderRole === 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-user';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${escapeHtml(msg.messageText)}
            </div>
        `;
        return messageDiv;
    } else if (msg.senderRole === 'bot') {
        // Clean progress text from old messages
        let messageText = cleanProgressText(msg.messageText);
        
        // Parse response
        let response = messageText;
        try {
            response = JSON.parse(messageText);
        } catch (e) {
            // Keep as string
        }
        
        // Create bot message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-bot';
        
        let content = `<div class="message-content">`;
        let responseText = '';
        let tableData = null;
        
        if (typeof response === 'object' && response !== null) {
            if (response.answer) {
                responseText = response.answer;
                if (response.sub_results) {
                    const subResults = Object.values(response.sub_results);
                    if (subResults.length > 0 && subResults[0].data && subResults[0].data.items) {
                        tableData = subResults[0].data.items;
                    }
                }
            } else if (response.text) {
                responseText = response.text;
            } else if (response.data && Array.isArray(response.data)) {
                tableData = response.data;
                responseText = response.message || 'Kết quả truy vấn:';
            } else if (response.message) {
                responseText = response.message;
            } else {
                responseText = JSON.stringify(response, null, 2);
            }
        } else {
            responseText = response || '';
        }
        
        content += escapeHtml(responseText).replace(/\n/g, '<br>');
        
        // Add chart preview button if chart_config exists and msg.id available
        if (typeof response === 'object' && response !== null && response.chart_config && msg.id) {
            content += `
                <div class="message-chart">
                    <button class="chart-btn" onclick="viewChart(${msg.id})">
                         Xem biểu đồ
                    </button>
                </div>
            `;
        }
        
        // Add table if exists
        if (tableData && tableData.length > 0) {
            content += '<div class="message-table"><table>';
            const headers = Object.keys(tableData[0]);
            content += '<thead><tr>';
            headers.forEach(header => {
                content += `<th>${escapeHtml(header)}</th>`;
            });
            content += '</tr></thead><tbody>';
            tableData.forEach(row => {
                content += '<tr>';
                headers.forEach(header => {
                    const value = row[header];
                    content += `<td>${escapeHtml(value !== null && value !== undefined ? value.toString() : '')}</td>`;
                });
                content += '</tr>';
            });
            content += '</tbody></table></div>';
        }
        
        // SQL Query không cần hiển thị
        
        content += '</div>';
        
        // Add actions menu button OUTSIDE message-content
        if (msg.id) {
            content += `
                <div class="message-feedback message-actions-menu">
                    <button class="feedback-menu-btn" onclick="toggleActionsMenu(event, ${msg.id})" title="Tùy chọn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                        </svg>
                    </button>
                    <div class="actions-menu-content" id="menu-${msg.id}">
                        <button class="menu-item" onclick="handleDrawChart(${msg.id}, event)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3v18h18M7 16l4-4 4 4 6-6"/>
                            </svg>
                            Vẽ biểu đồ
                        </button>
                        <div class="menu-divider"></div>
                        <button class="menu-item" onclick="openFeedbackModal(${msg.id}, event)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Đánh giá phản hồi
                        </button>
                    </div>
                </div>
            `;
        }
        
        messageDiv.innerHTML = content;
        return messageDiv;
    }
    return null;
}

// Update Session Info
function updateSessionInfo() {
    if (currentSession) {
        const sessionDate = new Date(currentSession.createdAt).toLocaleString('vi-VN');
        sessionInfo.textContent = `Phiên: ${currentSession.id} - ${sessionDate}`;
    } else {
        sessionInfo.textContent = 'Chưa có phiên làm việc';
    }
}

// Start New Session
async function startNewSession() {
    // Clear messages and show welcome
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>Xin chào!</h2>
            <p>Tôi là trợ lý AI của MLG. Tôi có thể giúp bạn:</p>
            <ul>
                <li>Truy vấn thông tin nhân viên</li>
                <li>Thống kê phân tích dữ liệu</li>
                <li>Trả lời các câu hỏi về hệ thống</li>
            </ul>
            <p>Hãy đặt câu hỏi của bạn!</p>
        </div>
    `;

    // Create new session
    await initializeChat();
}

// Handle Send Message
async function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Prevent double submission
    if (isSendingMessage) {
        console.log('Already sending a message, ignoring duplicate request');
        return;
    }
    
    if (!currentSession) {
        addErrorMessage('Chưa có phiên làm việc. Đang tạo phiên mới...');
        await createSession();
    }

    // Set sending flag
    isSendingMessage = true;

    // Disable input
    sendBtn.disabled = true;
    userInput.disabled = true;

    // Add user message to UI
    addUserMessage(message);
    
    // Clear input
    userInput.value = '';
    autoResizeTextarea();

    // Check if streaming is available
    const useStreaming = true; // Enable streaming
    
    if (useStreaming) {
        // Use streaming for real-time response
        await handleStreamingMessage(message);
    } else {
        // Fallback to regular fetch
        await handleRegularMessage(message);
    }
}

// Handle streaming message (progressive response) - Now using /api/Chat/message with simulated streaming
async function handleStreamingMessage(message) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message message-bot';
    botMessageDiv.innerHTML = `
        <div class="message-content">
            <div class="streaming-status">
                <span class="status-text">Đang xử lý</span>
                <span class="typing-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                </span>
            </div>
            <div class="streaming-text"></div>
        </div>
    `;
    chatMessages.appendChild(botMessageDiv);
    scrollToBottom();

    const statusDiv = botMessageDiv.querySelector('.streaming-status');
    const textDiv = botMessageDiv.querySelector('.streaming-text');
    let displayedText = '';
    let pendingChars = [];
    let isTyping = false;
    let finalResponse = null;

    // Typing effect simulator
    const typeNextChar = async () => {
        if (isTyping || pendingChars.length === 0) return;
        
        isTyping = true;
        while (pendingChars.length > 0) {
            const char = pendingChars.shift();
            displayedText += char;
            textDiv.innerHTML = escapeHtml(displayedText).replace(/\n/g, '<br>');
            scrollToBottom();
            
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        isTyping = false;
    };

    // Simulate phase progression
    const simulatePhases = async () => {
        const phases = [
            { message: 'Đang phân tích câu hỏi', delay: 800 },
            { message: 'Đang tạo truy vấn SQL', delay: 1200 },
            { message: 'Đang thực thi truy vấn', delay: 1000 },
            { message: 'Đang tạo phản hồi', delay: 800 }
        ];

        const friendlyMessages = [
            'Đợi tôi một chút nhé',
            'Sắp xong rồi',
            'Hệ thống đang xử lý',
            'Chờ tí nữa nhé'
        ];

        let messageIndex = 0;
        for (const phase of phases) {
            const statusText = statusDiv.querySelector('.status-text');
            if (statusText) {
                statusText.innerHTML = escapeHtml(phase.message);
            }
            
            await new Promise(resolve => setTimeout(resolve, phase.delay));
            
            // Show friendly message
            if (messageIndex < friendlyMessages.length && statusText) {
                statusText.innerHTML = escapeHtml(friendlyMessages[messageIndex]);
                messageIndex++;
                await new Promise(resolve => setTimeout(resolve, 600));
            }
        }
    };

    try {
        // Start phase simulation
        const phasePromise = simulatePhases();
        
        // Call the proper API endpoint
        const response = await fetch(API_ENDPOINTS.message, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                idNhanVien: currentUser.employeeId,
                module: "it"
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API Response:', result); // DEBUG
        
        // Wait for phases to complete
        await phasePromise;

        if (result.success && result.data && result.data.response) {
            finalResponse = result.data.response;
            const answerText = result.data.response.answer || result.data.response.text || 'Không có phản hồi';
            
            // Get messageId from various possible locations in response
            let messageId = null;
            
            // Check metadata
            if (result.data.metadata) {
                console.log('Metadata:', result.data.metadata); // DEBUG
                messageId = result.data.metadata.message_id || result.data.metadata.MessageId || result.data.metadata.messageId;
            }
            
            // Check data level
            if (!messageId && result.data.message_id) {
                messageId = result.data.message_id;
            }
            
            // Check if there's a separate messages array with the bot response
            if (!messageId && result.data.messages) {
                const botMessage = result.data.messages.find(m => m.senderRole === 'bot');
                if (botMessage) messageId = botMessage.id;
            }
            
            console.log('Extracted messageId:', messageId); // DEBUG
            
            // If no messageId found, try to get the latest message from session
            if (!messageId && currentSession && currentSession.id) {
                try {
                    const messagesResponse = await fetch(API_ENDPOINTS.getMessages(currentSession.id) + '?limit=1');
                    const messagesResult = await messagesResponse.json();
                    if (messagesResult.success && messagesResult.data && messagesResult.data.messages && messagesResult.data.messages.length > 0) {
                        const latestMessage = messagesResult.data.messages[messagesResult.data.messages.length - 1];
                        if (latestMessage.senderRole === 'bot') {
                            messageId = latestMessage.id;
                            console.log('Got messageId from latest messages:', messageId); // DEBUG
                        }
                    }
                } catch (error) {
                    console.warn('Failed to fetch latest message:', error);
                }
            }
            
            // Remove status and start typing effect
            statusDiv.remove();
            
            // Add characters to queue for typing effect
            for (let i = 0; i < answerText.length; i++) {
                pendingChars.push(answerText[i]);
            }
            
            // Start typing
            await typeNextChar();
            
            // Wait for typing to complete
            while (pendingChars.length > 0 || isTyping) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Store messageId and response data in the message div for later use
            botMessageDiv.dataset.messageId = messageId;
            botMessageDiv.dataset.hasChart = result.data.response.chart_config ? 'true' : 'false';
            
            // DEBUG: Kiem tra metadata
            console.log('=== DEBUG RESPONSE TIME ===');
            console.log('result.data:', result.data);
            console.log('result.data.metadata:', result.data.metadata);
            console.log('ProcessingTimeMs:', result.data.metadata?.ProcessingTimeMs);
            console.log('ProcessingTimeSec:', result.data.metadata?.ProcessingTimeSec);
            
            // Build final message content with actions button
            let content = `<div class="message-content">`;
            content += escapeHtml(displayedText).replace(/\n/g, '<br>');
            
            // Hien thi thoi gian phan hoi neu co trong metadata
            if (result.data.metadata && result.data.metadata.ProcessingTimeMs) {
                console.log('✅ Hien thi thoi gian phan hoi');
                const processingTimeMs = result.data.metadata.ProcessingTimeMs;
                const processingTimeSec = result.data.metadata.ProcessingTimeSec || (processingTimeMs / 1000).toFixed(2);
                content += `<div class="message-response-time">
                    <span class="message-response-time-icon">⏱️</span>
                    Thời gian phản hồi: ${processingTimeSec}s
                </div>`;
            } else {
                console.log('❌ Khong co metadata hoac ProcessingTimeMs');
            }
            
            content += '</div>';
            
            // Add 3-dot menu button with messageId
            content += `
                <div class="message-feedback">
                    <button class="feedback-menu-btn" onclick="toggleActionsMenu(event, this)">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                        </svg>
                    </button>
                    <div class="actions-menu-content">
                        <button class="menu-item menu-chart-toggle" onclick="handleDrawChart(this)" data-message-id="${messageId || ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3v18h18M7 16l4-4 4 4 6-6"/>
                            </svg>
                            <span class="menu-item-text">Vẽ biểu đồ</span>
                        </button>
                        <button class="menu-item" onclick="showCustomChartInput('${messageId || ''}', this)" data-message-id="${messageId || ''}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 8v8M8 12h8"/>
                            </svg>
                            <span class="menu-item-text">Tạo biểu đồ tùy chỉnh</span>
                        </button>
                        <button class="menu-item" onclick="handleRateResponse(this, 'good')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                            Đánh giá phản hồi
                        </button>
                    </div>
                </div>
            `;
            
            botMessageDiv.innerHTML = content;
            scrollToBottom();
        } else {
            throw new Error(result.errors?.[0] || 'Không nhận được phản hồi từ server');
        }
    } catch (error) {
        console.error('Message error:', error);
        statusDiv.remove();
        textDiv.innerHTML = `<span style="color: red;">Lỗi: ${escapeHtml(error.message)}</span>`;
    } finally {
        isSendingMessage = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Handle regular message (fallback - no streaming)
async function handleRegularMessage(message) {
    const typingId = addTypingIndicator();

    try {
        const response = await fetch(API_ENDPOINTS.message, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                idNhanVien: currentUser.employeeId,
                module: "it"
            })
        });

        const result = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);

        if (result.success && result.data) {
            const botResponse = result.data.response;
            const metadata = result.data.metadata;
            const messageId = result.data.messageId;
            
            addBotMessage(botResponse, metadata, messageId);
        } else {
            addErrorMessage(result.errors?.[0] || 'Có lỗi xảy ra khi xử lý tin nhắn');
        }
    } catch (error) {
        removeTypingIndicator(typingId);
        console.error('Send message error:', error);
        addErrorMessage('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
        // Reset sending flag
        isSendingMessage = false;
        
        // Re-enable input
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Add User Message
function addUserMessage(message, scroll = true) {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto mb-4';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-user max-w-[85%] rounded-xl p-4 text-sm shadow-md';
    messageDiv.innerHTML = `
        <div class="message-content">
            ${escapeHtml(message)}
        </div>
    `;
    
    // Remove welcome message if exists
    const welcomeMsg = chatMessages.querySelector('.bg-white.rounded-xl');
    if (welcomeMsg && welcomeMsg.textContent.includes('Xin chào!')) {
        welcomeMsg.remove();
    }
    
    container.appendChild(messageDiv);
    chatMessages.appendChild(container);
    if (scroll) scrollToBottom();
}

// Add Bot Message
function addBotMessage(response, metadata, messageId, scroll = true) {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto mb-4';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-ai max-w-[85%] rounded-xl p-4 text-sm shadow-sm';
    
    // Set message ID as data attribute for later reference
    if (messageId) {
        messageDiv.setAttribute('data-message-id', messageId);
    }
    
    let content = `<div class="message-content">`;
    
    // Parse response
    let responseText = '';
    let tableData = null;
    
    if (typeof response === 'object' && response !== null) {
        // Xử lý format response phức tạp từ RAG system
        if (response.answer) {
            // Response từ RAG: { answer, sources, chart_config, highlighted_findings, ... }
            responseText = response.answer;
            
            // Extract table data nếu có
            if (response.sub_results) {
                // Parse sub_results để lấy table data
                const subResults = Object.values(response.sub_results);
                if (subResults.length > 0 && subResults[0].data && subResults[0].data.items) {
                    tableData = subResults[0].data.items;
                }
            }
        } else if (response.text) {
            // Response có text field
            responseText = response.text;
        } else if (response.data && Array.isArray(response.data)) {
            // Response có data array (table data)
            tableData = response.data;
            responseText = response.message || 'Kết quả truy vấn:';
        } else if (response.message) {
            // Response có message field
            responseText = response.message;
        } else {
            // Fallback: stringify object
            responseText = JSON.stringify(response, null, 2);
        }
    } else {
        // Response là string
        responseText = response || '';
    }
    
    content += escapeHtml(responseText).replace(/\n/g, '<br>');
    
    // Add chart preview button if chart_config exists and messageId available
    if (typeof response === 'object' && response !== null && response.chart_config && messageId) {
        content += `
            <div class="message-chart">
                <button class="chart-btn" onclick="viewChart(${messageId})">
                     Xem biểu đồ
                </button>
            </div>
        `;
    }
    
    // Add table if exists
    if (tableData && tableData.length > 0) {
        content += '<div class="message-table">';
        content += '<table>';
        
        // Headers
        const headers = Object.keys(tableData[0]);
        content += '<thead><tr>';
        headers.forEach(header => {
            content += `<th>${escapeHtml(header)}</th>`;
        });
        content += '</tr></thead>';
        
        // Rows
        content += '<tbody>';
        tableData.forEach(row => {
            content += '<tr>';
            headers.forEach(header => {
                const value = row[header];
                content += `<td>${escapeHtml(value !== null && value !== undefined ? value.toString() : '')}</td>`;
            });
            content += '</tr>';
        });
        content += '</tbody>';
        
        content += '</table>';
        content += '</div>';
    }
    
    // SQL Query không cần hiển thị
    
    content += '</div>';
    
    // Add actions menu button OUTSIDE message-content (always show, even without messageId)
    const menuId = messageId || `temp-${Date.now()}`;
    content += `
        <div class="message-feedback message-actions-menu">
            <button class="feedback-menu-btn" onclick="toggleActionsMenu(event, this)" title="Tùy chọn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                </svg>
            </button>
            <div class="actions-menu-content">
                <button class="menu-item menu-chart-toggle" onclick="handleDrawChart(this)" data-message-id="${messageId || ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3v18h18M7 16l4-4 4 4 6-6"/>
                    </svg>
                    <span class="menu-item-text">Vẽ biểu đồ</span>
                </button>
                <button class="menu-item" onclick="showCustomChartInput('${messageId || ''}', this)" data-message-id="${messageId || ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v8M8 12h8"/>
                    </svg>
                    <span class="menu-item-text">Tạo biểu đồ tùy chỉnh</span>
                </button>
                <button class="menu-item" onclick="handleRateResponse(this, 'good')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    Đánh giá phản hồi
                </button>
            </div>
        </div>
    `;
    
    messageDiv.innerHTML = content;
    container.appendChild(messageDiv);
    chatMessages.appendChild(container);
    if (scroll) scrollToBottom();
    
    // Reinitialize icons for new message
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// View Chart
function viewChart(messageId) {
    try {
        // Open chart preview in new window
        const previewUrl = `${API_BASE_URL}/api/AnalysisPreview/message/${messageId}`;
        window.open(previewUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    } catch (error) {
        console.error('View chart error:', error);
        alert('Không thể xem biểu đồ. Vui lòng thử lại.');
    }
}

// Open Feedback Modal
function openFeedbackModal(messageId, event) {
    if (event) {
        event.stopPropagation();
        // Close menu
        const menu = document.getElementById(`menu-${messageId}`);
        if (menu) menu.classList.remove('show');
    }
    
    const modal = document.getElementById('feedback-modal');
    if (!modal) {
        createFeedbackModal();
    }
    
    // Store current feedback data
    window.currentFeedback = {
        messageId: messageId,
        rating: 0
    };
    
    // Reset stars
    const stars = document.querySelectorAll('#feedback-modal .star');
    stars.forEach(s => s.classList.remove('active'));
    
    // Reset comment
    const commentField = document.getElementById('feedback-comment');
    if (commentField) {
        commentField.value = '';
    }
    
    // Show modal
    document.getElementById('feedback-modal').style.display = 'flex';
}

// Create Feedback Modal
function createFeedbackModal() {
    const modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Đánh giá phản hồi</h3>
                <button class="modal-close" onclick="closeFeedbackModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="feedback-intro">
                    <p>Đánh giá của bạn sẽ giúp cải thiện chất lượng phản hồi của AI</p>
                </div>
                <div class="form-group">
                    <label class="rating-label">
                        Chất lượng phản hồi
                        <span class="rating-required">*</span>
                    </label>
                    <div class="rating-stars">
                        <span class="star" data-rating="1" title="Rất tệ">★</span>
                        <span class="star" data-rating="2" title="Tệ">★</span>
                        <span class="star" data-rating="3" title="Trung bình">★</span>
                        <span class="star" data-rating="4" title="Tốt">★</span>
                        <span class="star" data-rating="5" title="Xuất sắc">★</span>
                    </div>
                    <div class="rating-text" id="rating-text"></div>
                </div>
                <div class="form-group">
                    <label>
                        Nhận xét chi tiết
                        <span class="optional-text">(Không bắt buộc)</span>
                    </label>
                    <textarea 
                        id="feedback-comment" 
                        rows="4" 
                        placeholder="Ví dụ: Câu trả lời chính xác, SQL query tối ưu, format đẹp..."
                    ></textarea>
                    <div class="char-count">
                        <span id="char-count">0</span>/500 ký tự
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeFeedbackModal()">Đóng</button>
                <button class="btn-primary" onclick="submitFeedback()" id="submit-feedback-btn" disabled>
                    Gửi đánh giá
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add star click handlers
    const stars = modal.querySelectorAll('.star');
    const ratingText = modal.querySelector('#rating-text');
    const submitBtn = modal.querySelector('#submit-feedback-btn');
    const ratingLabels = ['Rất tệ', 'Tệ', 'Trung bình', 'Tốt', 'Xuất sắc'];
    
    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        // Click effect
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                s.classList.remove('hover');
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            window.currentFeedback.rating = rating;
            ratingText.textContent = ratingLabels[rating - 1];
            ratingText.className = 'rating-text rating-' + rating;
            submitBtn.disabled = false;
        });
    });
    
    // Remove hover on mouse leave
    modal.querySelector('.rating-stars').addEventListener('mouseleave', function() {
        stars.forEach(s => s.classList.remove('hover'));
    });
    
    // Character counter
    const commentField = modal.querySelector('#feedback-comment');
    const charCount = modal.querySelector('#char-count');
    commentField.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = Math.min(length, 500);
        if (length > 500) {
            this.value = this.value.substring(0, 500);
        }
    });
}

// Close Feedback Modal
function closeFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('feedback-comment').value = '';
        const stars = modal.querySelectorAll('.star');
        stars.forEach(s => s.classList.remove('active'));
        window.currentFeedback = null;
    }
}

// Submit Feedback
async function submitFeedback() {
    if (!window.currentFeedback || !window.currentFeedback.rating) {
        alert('Vui lòng chọn đánh giá trước khi gửi');
        return;
    }
    
    const comment = document.getElementById('feedback-comment').value.trim();
    const rating = window.currentFeedback.rating;
    const messageId = window.currentFeedback.messageId;
    const isHelpful = rating >= 3; // 3-5 sao = helpful, 1-2 sao = not helpful
    
    // Disable submit button
    const submitBtn = document.getElementById('submit-feedback-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
    
    try {
        const response = await fetch(API_ENDPOINTS.feedback(messageId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isHelpful: isHelpful,
                rating: rating,
                comment: comment || null
            })
        });

        const result = await response.json();
        
        if (result.success) {
            closeFeedbackModal();
            showSuccessToast('Cảm ơn đánh giá của bạn! ');
        } else {
            alert('Gửi đánh giá thất bại: ' + (result.message || 'Lỗi không xác định'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi đánh giá';
        }
    } catch (error) {
        console.error('Feedback error:', error);
        alert('Gửi đánh giá thất bại. Vui lòng thử lại.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi đánh giá';
    }
}

// Show Success Toast
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Send Feedback (deprecated - keep for backward compatibility)
async function sendFeedback(messageId, isHelpful) {
    try {
        const response = await fetch(API_ENDPOINTS.feedback(messageId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isHelpful: isHelpful
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Update button state
            const feedbackDiv = event.target.closest('.message-feedback');
            if (feedbackDiv) {
                const buttons = feedbackDiv.querySelectorAll('.feedback-btn');
                buttons.forEach(btn => {
                    btn.classList.remove('active-helpful', 'active-not-helpful');
                });
                
                event.target.classList.add(isHelpful ? 'active-helpful' : 'active-not-helpful');
            }
        }
    } catch (error) {
        console.error('Feedback error:', error);
    }
}

// Add System Message
function addSystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-bot';
    messageDiv.innerHTML = `
        <div class="message-content" style="background: #e3f2fd; color: #1976d2; border-color: #1976d2;">
            ${escapeHtml(message)}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add Error Message
function addErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
        <div class="error-message">
            ${escapeHtml(message)}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add Typing Indicator
function addTypingIndicator() {
    const typingId = 'typing-' + Date.now();
    const container = document.createElement('div');
    container.id = typingId;
    container.className = 'max-w-4xl mx-auto mb-4';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-ai max-w-[85%] rounded-xl p-4';
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator flex gap-1">
                <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
                <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
                <span class="w-2 h-2 bg-slate-400 rounded-full"></span>
            </div>
        </div>
    `;
    container.appendChild(messageDiv);
    chatMessages.appendChild(container);
    scrollToBottom();
    return typingId;
}

// Remove Typing Indicator
function removeTypingIndicator(typingId) {
    const typingElement = document.getElementById(typingId);
    if (typingElement) {
        typingElement.remove();
    }
}

// Scroll to Bottom
function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make sendFeedback available globally
window.sendFeedback = sendFeedback;

// Toggle Actions Menu
function toggleActionsMenu(event, buttonElement) {
    event.stopPropagation();
    
    // buttonElement might be event target if called incorrectly
    const button = buttonElement instanceof HTMLElement ? buttonElement : event.target.closest('.feedback-menu-btn');
    
    if (!button) {
        console.error('Button not found');
        return;
    }
    
    // Find menu - it's next to the button within .message-feedback
    const feedbackContainer = button.closest('.message-feedback');
    if (!feedbackContainer) {
        console.error('Feedback container not found');
        return;
    }
    
    const menu = feedbackContainer.querySelector('.actions-menu-content');
    if (!menu) {
        console.error('Menu not found');
        return;
    }
    
    // Close all other menus
    document.querySelectorAll('.actions-menu-content.show').forEach(m => {
        if (m !== menu) {
            m.classList.remove('show');
        }
    });
    
    // Toggle current menu
    menu.classList.toggle('show');
}

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.message-actions-menu')) {
        document.querySelectorAll('.actions-menu-content.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Handle Draw Chart
async function handleDrawChart(param1, param2) {
    // Handle different call signatures:
    // 1. handleDrawChart(this) - from streaming messages
    // 2. handleDrawChart(messageId, event) - from regular messages
    // 3. handleDrawChart(event) - from new onclick pattern
    
    let buttonElement = null;
    
    if (param2 && param2.target) {
        // Case 2: (messageId, event)
        buttonElement = param2.target;
    } else if (param1 && param1.target) {
        // Case 3: (event)
        buttonElement = param1.target;
    } else if (param1 && param1.closest) {
        // Case 1: (this) - DOM element
        buttonElement = param1;
    }
    
    if (!buttonElement) {
        console.error('Button element not found');
        return;
    }
    
    // Find the message element (parent of button)
    const targetMessage = buttonElement.closest('.message-bot');
    if (!targetMessage) {
        console.error('Message not found');
        return;
    }
    
    // Close menu
    const menu = targetMessage.querySelector('.actions-menu-content');
    if (menu) menu.classList.remove('show');
    
    // Check if chart already exists - toggle visibility
    const existingChart = targetMessage.querySelector('.message-chart-container');
    if (existingChart) {
        const isExpanded = existingChart.style.display !== 'none';
        existingChart.style.display = isExpanded ? 'none' : 'block';
        
        // Update button text - find the menu item in all menus for this message
        const allChartButtons = targetMessage.querySelectorAll('.menu-chart-toggle');
        allChartButtons.forEach(btn => {
            const textSpan = btn.querySelector('.menu-item-text');
            if (textSpan) {
                textSpan.textContent = isExpanded ? 'Vẽ biểu đồ' : 'Thu gọn biểu đồ';
            }
        });
        
        console.log(`Chart ${isExpanded ? 'collapsed' : 'expanded'}`);
        return;
    }
    
    // Get messageId from button or message div
    let messageId = null;
    if (buttonElement.dataset && buttonElement.dataset.messageId) {
        messageId = buttonElement.dataset.messageId;
    } else if (targetMessage.dataset && targetMessage.dataset.messageId) {
        messageId = targetMessage.dataset.messageId;
    }
    
    if (!messageId) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'message-chart-container';
        chartContainer.innerHTML = `
            <div style="padding: 16px; background: #fff3cd; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 14px;">Không tìm thấy ID tin nhắn để vẽ biểu đồ</p>
            </div>
        `;
        const contentDiv = targetMessage.querySelector('.message-content');
        contentDiv.appendChild(chartContainer);
        return;
    }
    
    // Add loading indicator
    const chartContainer = document.createElement('div');
    chartContainer.className = 'message-chart-container';
    chartContainer.innerHTML = `
        <div class="chart-loading">
            <div class="chart-loading-spinner"></div>
            <p style="margin-top: 12px; font-size: 14px;">Đang vẽ biểu đồ...</p>
        </div>
    `;
    
    const contentDiv = targetMessage.querySelector('.message-content');
    contentDiv.appendChild(chartContainer);
    
    // Fetch chart data - try multiple endpoints
    try {
        // Try the chart endpoint first
        let response = await fetch(`${API_BASE_URL}/api/Chart/message/${messageId}`);
        
        // If that fails, try the preview endpoint
        if (!response.ok) {
            response = await fetch(`${API_BASE_URL}/api/AnalysisPreview/message/${messageId}`);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Chart API error:', response.status, errorText);
            throw new Error(`API returned ${response.status}: ${errorText || 'Failed to fetch chart'}`);
        }
        
        const html = await response.text();
        
        // Replace loading with actual chart
        chartContainer.innerHTML = `
            <div style="padding: 12px; background: white; border-radius: 8px;">
                <h4 style="margin: 0 0 16px 0; color: #2a5298; font-size: 16px;">Biểu đồ phân tích</h4>
                <iframe 
                    srcdoc="${html.replace(/"/g, '&quot;')}" 
                    style="width: 100%; height: 500px; border: none; border-radius: 8px;"
                    sandbox="allow-scripts allow-same-origin"
                ></iframe>
            </div>
        `;
        
        // Update button text to "Thu gọn biểu đồ" after chart is loaded
        const allChartButtons = targetMessage.querySelectorAll('.menu-chart-toggle');
        allChartButtons.forEach(btn => {
            const textSpan = btn.querySelector('.menu-item-text');
            if (textSpan) {
                textSpan.textContent = 'Thu gọn biểu đồ';
            }
        });
        
    } catch (error) {
        console.error('Chart error:', error);
        chartContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #fff3cd; border-radius: 8px;">
                <p style="color: #856404; margin: 0;"> Tin nhắn này không có biểu đồ hoặc chức năng vẽ biểu đồ chưa sẵn sàng.</p>
                <p style="color: #856404; margin: 8px 0 0 0; font-size: 14px;">Message ID: ${messageId}</p>
            </div>
        `;
    }
}

// Show custom chart input
function showCustomChartInput(messageId, buttonElement) {
    // Find the message element from button or by messageId
    let targetMessage = null;
    
    if (buttonElement && typeof buttonElement === 'object' && buttonElement.closest) {
        targetMessage = buttonElement.closest('.message-bot');
    } else if (messageId) {
        targetMessage = document.querySelector(`.message-bot[data-message-id="${messageId}"]`);
    }
    
    if (!targetMessage) {
        console.error('Message not found');
        alert('Không tìm thấy tin nhắn');
        return;
    }
    
    // Get messageId from element if not provided
    if (!messageId) {
        messageId = targetMessage.getAttribute('data-message-id');
    }
    
    if (!messageId) {
        console.error('Message ID not found');
        alert('Không tìm thấy ID tin nhắn');
        return;
    }
    
    // Close menu
    const menu = targetMessage.querySelector('.actions-menu-content');
    if (menu) menu.classList.remove('show');
    
    // Check if input already exists
    let inputContainer = targetMessage.querySelector('.custom-chart-input-container');
    if (inputContainer) {
        inputContainer.style.display = 'block';
        const input = inputContainer.querySelector('.custom-chart-input');
        if (input) input.focus();
        return;
    }
    
    // Create input container
    inputContainer = document.createElement('div');
    inputContainer.className = 'custom-chart-input-container';
    inputContainer.style.cssText = 'margin-top: 12px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;';
    inputContainer.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #dee2e6;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2a5298" stroke-width="2" style="width: 20px; height: 20px; margin-right: 8px;">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <h4 style="margin: 0; font-size: 15px; color: #2a5298; font-weight: 600;">Tạo biểu đồ tùy chỉnh</h4>
        </div>
        
        <div style="margin-bottom: 14px;">
            <label style="display: flex; align-items: center; font-weight: 500; color: #495057; margin-bottom: 6px; font-size: 13px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 6px;">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                Loại biểu đồ <span style="color: #dc3545; margin-left: 4px;">*</span>
            </label>
            <select 
                class="custom-chart-type-select"
                style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; background: white; cursor: pointer;"
            >
                <option value="">-- Chọn loại biểu đồ --</option>
                <optgroup label="Phân bố và Tỷ lệ">
                    <option value="pie">Biểu đồ tròn (Pie Chart)</option>
                    <option value="doughnut">Biểu đồ vòng (Doughnut Chart)</option>
                </optgroup>
                <optgroup label="So sánh và Đối chiếu">
                    <option value="bar">Biểu đồ cột dọc (Bar Chart)</option>
                    <option value="horizontal_bar">Biểu đồ cột ngang (Horizontal Bar)</option>
                    <option value="grouped_bar">Biểu đồ cột nhóm (Grouped Bar)</option>
                    <option value="stacked_bar">Biểu đồ cột chồng (Stacked Bar)</option>
                </optgroup>
                <optgroup label="Xu hướng Thời gian">
                    <option value="line">Biểu đồ đường (Line Chart)</option>
                    <option value="area">Biểu đồ vùng (Area Chart)</option>
                </optgroup>
                <optgroup label="Phân tích Đặc biệt">
                    <option value="scatter">Biểu đồ phân tán (Scatter Plot)</option>
                    <option value="mixed">Biểu đồ kết hợp (Mixed Chart)</option>
                </optgroup>
            </select>
        </div>
        
        <div style="margin-bottom: 14px;">
            <label style="display: flex; align-items: center; font-weight: 500; color: #495057; margin-bottom: 6px; font-size: 13px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 6px;">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Nhóm dữ liệu theo
            </label>
            <select 
                class="custom-chart-grouping-select"
                style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; background: white; cursor: pointer;"
            >
                <option value="">Tự động phát hiện</option>
                <optgroup label="Theo Thời gian">
                    <option value="ngay">Theo ngày</option>
                    <option value="tuan">Theo tuần</option>
                    <option value="thang">Theo tháng</option>
                    <option value="quy">Theo quý</option>
                    <option value="nam">Theo năm</option>
                </optgroup>
                <optgroup label="Theo Phân loại">
                    <option value="trang_thai">Theo trạng thái</option>
                    <option value="bo_phan">Theo bộ phận</option>
                    <option value="loai">Theo loại/danh mục</option>
                </optgroup>
            </select>
        </div>
        
        <div style="margin-bottom: 16px;">
            <label style="display: flex; align-items: center; font-weight: 500; color: #495057; margin-bottom: 6px; font-size: 13px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 6px;">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                Phép tính toán
            </label>
            <select 
                class="custom-chart-aggregate-select"
                style="width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px; background: white; cursor: pointer;"
            >
                <option value="">Tự động phát hiện</option>
                <option value="count">Đếm số lượng (COUNT)</option>
                <option value="sum">Tính tổng (SUM)</option>
                <option value="avg">Tính trung bình (AVG)</option>
                <option value="max">Giá trị cao nhất (MAX)</option>
                <option value="min">Giá trị thấp nhất (MIN)</option>
            </select>
        </div>
        
        <div style="display: flex; gap: 8px; justify-content: flex-end; padding-top: 14px; border-top: 1px solid #dee2e6;">
            <button 
                class="custom-chart-cancel-btn"
                onclick="hideCustomChartInput('${messageId}')"
                style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;"
                onmouseover="this.style.background='#5a6268'"
                onmouseout="this.style.background='#6c757d'"
            >
                Hủy
            </button>
            <button 
                class="custom-chart-submit-btn"
                onclick="handleCustomChartSubmit('${messageId}')"
                style="padding: 8px 24px; background: #2a5298; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;"
                onmouseover="this.style.background='#1e3c72'"
                onmouseout="this.style.background='#2a5298'"
            >
                Tạo biểu đồ
            </button>
        </div>
    `;
    
    const contentDiv = targetMessage.querySelector('.message-content');
    contentDiv.appendChild(inputContainer);
    
    // Focus on chart type select
    const chartTypeSelect = inputContainer.querySelector('.custom-chart-type-select');
    if (chartTypeSelect) {
        chartTypeSelect.focus();
    }
}

// Hide custom chart input
function hideCustomChartInput(messageId) {
    const targetMessage = document.querySelector(`.message-bot[data-message-id="${messageId}"]`);
    if (!targetMessage) return;
    
    const inputContainer = targetMessage.querySelector('.custom-chart-input-container');
    if (inputContainer) {
        inputContainer.style.display = 'none';
    }
}

// Handle custom chart submit
async function handleCustomChartSubmit(messageId) {
    if (!messageId) {
        alert('Không tìm thấy ID tin nhắn');
        return;
    }
    
    const targetMessage = document.querySelector(`.message-bot[data-message-id="${messageId}"]`);
    if (!targetMessage) {
        console.error('Message not found');
        return;
    }
    
    const inputContainer = targetMessage.querySelector('.custom-chart-input-container');
    const chartTypeSelect = inputContainer?.querySelector('.custom-chart-type-select');
    const groupingSelect = inputContainer?.querySelector('.custom-chart-grouping-select');
    const aggregateSelect = inputContainer?.querySelector('.custom-chart-aggregate-select');
    
    const chartType = chartTypeSelect?.value.trim();
    const grouping = groupingSelect?.value.trim();
    const aggregate = aggregateSelect?.value.trim();
    
    if (!chartType) {
        alert('Vui lòng chọn loại biểu đồ');
        chartTypeSelect?.focus();
        return;
    }
    
    // Build user request from selections
    let userRequest = '';
    
    // Chart type mapping for Vietnamese
    const chartTypeNames = {
        'pie': 'biểu đồ tròn',
        'doughnut': 'biểu đồ vòng',
        'bar': 'biểu đồ cột',
        'grouped_bar': 'biểu đồ cột nhóm',
        'line': 'biểu đồ đường',
        'area': 'biểu đồ diện tích',
        'horizontal_bar': 'biểu đồ cột ngang',
        'stacked_bar': 'biểu đồ cột chồng',
        'scatter': 'biểu đồ phân tán',
        'mixed': 'biểu đồ kết hợp'
    };
    
    userRequest = `Vẽ ${chartTypeNames[chartType] || chartType}`;
    
    if (grouping) {
        const groupingNames = {
            'thang': 'theo tháng',
            'quy': 'theo quý',
            'nam': 'theo năm',
            'ngay': 'theo ngày',
            'tuan': 'theo tuần',
            'trang_thai': 'theo trạng thái',
            'bo_phan': 'theo bộ phận',
            'loai': 'theo loại'
        };
        userRequest += ` ${groupingNames[grouping] || grouping}`;
    }
    
    if (aggregate) {
        const aggregateNames = {
            'count': 'đếm số lượng',
            'sum': 'tính tổng',
            'avg': 'tính trung bình',
            'max': 'lấy giá trị cao nhất',
            'min': 'lấy giá trị thấp nhất'
        };
        userRequest += ` (${aggregateNames[aggregate] || aggregate})`;
    }
    
    // Hide input container
    if (inputContainer) {
        inputContainer.style.display = 'none';
    }
    
    // Remove existing chart if any
    const existingChart = targetMessage.querySelector('.message-chart-container');
    if (existingChart) {
        existingChart.remove();
    }
    
    // Add loading indicator
    const chartContainer = document.createElement('div');
    chartContainer.className = 'message-chart-container';
    chartContainer.innerHTML = `
        <div class="chart-loading">
            <div class="chart-loading-spinner"></div>
            <p style="margin-top: 12px; font-size: 14px;">Đang tạo biểu đồ theo yêu cầu: "${userRequest}"...</p>
        </div>
    `;
    
    const contentDiv = targetMessage.querySelector('.message-content');
    contentDiv.appendChild(chartContainer);
    
    try {
        // Call generate chart API - send chartType directly instead of relying on text parsing
        const response = await fetch(`${API_BASE_URL}/api/Chart/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageId: messageId,
                question: userRequest,
                chartType: chartType  // Send the selected chart type directly
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Generate chart error:', response.status, errorText);
            throw new Error(`API returned ${response.status}: ${errorText || 'Failed to generate chart'}`);
        }
        
        const html = await response.text();
        
        // Replace loading with actual chart
        chartContainer.innerHTML = `
            <div style="padding: 12px; background: white; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: #2a5298; font-size: 16px;">Biểu đồ tùy chỉnh</h4>
                    <button 
                        onclick="this.closest('.message-chart-container').remove()"
                        style="background: none; border: none; color: #6c757d; cursor: pointer; font-size: 20px; padding: 0; width: 24px; height: 24px;"
                        title="Đóng biểu đồ"
                    >×</button>
                </div>
                <p style="margin: 0 0 12px 0; color: #6c757d; font-size: 13px; font-style: italic;">Yêu cầu: ${escapeHtml(userRequest)}</p>
                <iframe 
                    srcdoc="${html.replace(/"/g, '&quot;')}" 
                    style="width: 100%; height: 500px; border: none; border-radius: 8px;"
                    sandbox="allow-scripts allow-same-origin"
                ></iframe>
            </div>
        `;
        
        // Reset selections for next use
        if (chartTypeSelect) chartTypeSelect.selectedIndex = 0;
        if (groupingSelect) groupingSelect.selectedIndex = 0;
        if (aggregateSelect) aggregateSelect.selectedIndex = 0;
        
    } catch (error) {
        console.error('Custom chart error:', error);
        chartContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #f8d7da; border-radius: 8px; border: 1px solid #f5c2c7;">
                <p style="color: #842029; margin: 0; font-weight: 500;">Lỗi tạo biểu đồ</p>
                <p style="color: #842029; margin: 8px 0 0 0; font-size: 14px;">${escapeHtml(error.message)}</p>
                <button 
                    onclick="this.closest('.message-chart-container').remove()"
                    style="margin-top: 12px; padding: 6px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;"
                >
                    Đóng
                </button>
            </div>
        `;
    }
}

// Handle rate response
function handleRateResponse(param1, param2) {
    // Handle different call signatures:
    // 1. handleRateResponse(this, rating) - from streaming messages
    // 2. handleRateResponse(event, rating) - from new onclick pattern
    
    let buttonElement = null;
    let rating = null;
    
    if (param1 && param1.target) {
        // Case 2: (event, rating)
        buttonElement = param1.target;
        rating = param2;
    } else if (param1 && param1.closest) {
        // Case 1: (this, rating)
        buttonElement = param1;
        rating = param2;
    }
    
    if (!buttonElement) {
        console.error('Button element not found');
        return;
    }
    
    // Close menu
    const targetMessage = buttonElement.closest('.message-bot');
    if (targetMessage) {
        const menu = targetMessage.querySelector('.actions-menu-content');
        if (menu) menu.classList.remove('show');
    }
    
    // Show feedback message
    alert(`Cảm ơn bạn đã đánh giá: ${rating === 'good' ? 'Tốt' : 'Không tốt'}`);
    // TODO: Implement actual rating API call
}

// Handle Scroll to Bottom Button Visibility
function handleScrollToBottomButton() {
    if (!scrollToBottomBtn) return;
    
    const scrollTop = chatMessages.scrollTop;
    const scrollHeight = chatMessages.scrollHeight;
    const clientHeight = chatMessages.clientHeight;
    
    // Show button if scrolled up more than 200px from bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom > 200) {
        scrollToBottomBtn.classList.add('show');
    } else {
        scrollToBottomBtn.classList.remove('show');
    }
}

// Streaming Handler Class
class StreamingHandler {
    constructor() {
        this.controller = null;
        this.friendlyMessages = [
            'Đợi tôi một chút nhé',
            'Sắp xong rồi',
            'Hệ thống đang xử lý',
            'Tôi đang làm việc này',
            'Chờ tí nữa nhé',
            'Đang kiểm tra dữ liệu',
            'Gần xong rồi'
        ];
        this.messageRotationTimer = null;
        this.currentMessageIndex = 0;
    }

    startFriendlyMessageRotation(onMessage, phaseMessage) {
        // Clear any existing timer
        this.stopFriendlyMessageRotation();
        
        // Xoay vòng liên tục các message thân thiện
        this.messageRotationTimer = setInterval(() => {
            const friendlyMsg = this.friendlyMessages[this.currentMessageIndex];
            onMessage('PHASE', { message: friendlyMsg });
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.friendlyMessages.length;
        }, 3000); // Thay đổi mỗi 3 giây
    }

    stopFriendlyMessageRotation() {
        if (this.messageRotationTimer) {
            clearInterval(this.messageRotationTimer);
            this.messageRotationTimer = null;
        }
    }

    async startStream(message, employeeId, sessionId, onMessage, onComplete, onError) {
        this.controller = new AbortController();
        this.detectedPhases = []; // Reset detected phases for new stream
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/Chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    message: message,
                    idNhanVien: employeeId,
                    sessionId: sessionId
                }),
                signal: this.controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullText = '';
            let isInProgressPhase = true;
            let finalResponseText = '';
            let lastPhaseDetected = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                console.log('Chunk received:', chunk); // DEBUG
                console.log('Full text so far:', fullText.substring(0, 200)); // DEBUG

                // Detect progress phases
                if (isInProgressPhase) {
                    // Check if we reached the final response phase
                    if (fullText.includes('Đang tạo phản hồi...\n\n')) {
                        this.stopFriendlyMessageRotation();
                        isInProgressPhase = false;
                        // Send final phase update
                        if (lastPhaseDetected !== 'response') {
                            onMessage('PHASE', { message: 'Đang tạo phản hồi' });
                            lastPhaseDetected = 'response';
                        }
                        // Extract text after "Đang tạo phản hồi...\n\n"
                        const parts = fullText.split('Đang tạo phản hồi...\n\n');
                        if (parts.length > 1) {
                            finalResponseText = parts[1];
                            // Send any existing final text
                            if (finalResponseText) {
                                onMessage('STREAM', { text: finalResponseText });
                            }
                        }
                        continue;
                    }

                    // Handle all phases sequentially even when received in one chunk
                    const phases = [
                        { marker: 'Đang phân tích', name: 'analyze', message: 'Đang phân tích câu hỏi' },
                        { marker: 'Đang tạo truy vấn', name: 'query', message: 'Đang tạo truy vấn SQL' },
                        { marker: 'Đang thực thi', name: 'execute', message: 'Đang thực thi truy vấn' }
                    ];
                    
                    for (const phase of phases) {
                        if (fullText.includes(phase.marker) && !this.detectedPhases?.includes(phase.name)) {
                            console.log('Phase detected:', phase.name); // DEBUG
                            if (!this.detectedPhases) this.detectedPhases = [];
                            this.detectedPhases.push(phase.name);
                            
                            this.stopFriendlyMessageRotation();
                            onMessage('PHASE', { message: phase.message });
                            lastPhaseDetected = phase.name;
                            
                            // Add artificial delay before starting rotation
                            await new Promise(resolve => setTimeout(resolve, 500));
                            this.startFriendlyMessageRotation(onMessage, phase.name);
                            
                            // Wait a bit before checking next phase
                            await new Promise(resolve => setTimeout(resolve, 1500));
                        }
                    }
                } else {
                    // In final response phase - stream character by character
                    finalResponseText += chunk;
                    onMessage('STREAM', { text: chunk });
                }
            }

            // Stop rotation when stream completes
            this.stopFriendlyMessageRotation();
            
            // Stream completed
            onComplete({ answer: finalResponseText.trim() });

        } catch (error) {
            this.stopFriendlyMessageRotation();
            if (error.name !== 'AbortError') {
                console.error('Stream error:', error);
                onError(error.message);
            }
        }
    }

    cancel() {
        this.stopFriendlyMessageRotation();
        if (this.controller) {
            this.controller.abort();
        }
    }
}

// Open chatbot sidebar with detailed analysis
async function openChatbotWithDetailedAnalysis() {
    const chatbotSidebar = document.getElementById('chatbot-sidebar');
    const contentEl = document.getElementById('chatbot-analysis-content');
    
    // Open sidebar
    chatbotSidebar.classList.remove('translate-x-full');
    
    // Switch to analysis tab
    const chatbotTabs = document.querySelectorAll('.chatbot-tab');
    chatbotTabs.forEach(t => {
        t.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-white');
        t.classList.add('text-slate-600');
    });
    const analysisTabBtn = document.querySelector('[data-tab="analysis"]');
    if (analysisTabBtn) {
        analysisTabBtn.classList.remove('text-slate-600');
        analysisTabBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-white');
    }
    
    document.querySelectorAll('.chatbot-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById('tab-analysis').classList.remove('hidden');
    
    // Show loading state
    contentEl.innerHTML = `
        <div class="flex items-center gap-2 text-blue-600">
            <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm font-medium">Đang phân tích dữ liệu...</span>
        </div>
    `;
    
    lucide.createIcons();
    
    try {
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || (new Date().getMonth() + 1);
        const periodType = window.currentPeriod || 'current_month';
        
        const response = await fetch(`${API_ENDPOINTS.dashboardBase}/ai-detailed-analysis?year=${year}&month=${month}&periodType=${periodType}`);
        
        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            
            // Xử lý streaming response
            if (contentType && contentType.includes('text/event-stream')) {
                contentEl.innerHTML = '<div class="streaming-content text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"></div>';
                const streamingDiv = contentEl.querySelector('.streaming-content');
                let accumulatedText = '';
                
                try {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const jsonData = JSON.parse(line.slice(6));
                                    if (jsonData.text) {
                                        accumulatedText += jsonData.text;
                                        streamingDiv.innerHTML = formatAnalysisContent(accumulatedText);
                                        lucide.createIcons();
                                    } else if (jsonData.error) {
                                        console.error('Streaming error:', jsonData.error);
                                    }
                                } catch (e) {
                                    // Ignore JSON parse errors for incomplete chunks
                                }
                            }
                        }
                    }
                    
                    // Đảm bảo format cuối cùng và thêm AI disclaimer
                    if (accumulatedText) {
                        const formattedContent = formatAnalysisContent(accumulatedText);
                        const disclaimer = '<p class="text-xs text-slate-400 italic mt-4 pt-3 border-t border-slate-200">Nội dung này được sinh bởi AI</p>';
                        contentEl.innerHTML = formattedContent + disclaimer;
                        lucide.createIcons();
                    }
                } catch (streamError) {
                    console.error('Streaming error:', streamError);
                    contentEl.innerHTML = `
                        <div class="text-center py-8">
                            <i data-lucide="alert-circle" class="w-10 h-10 text-red-500 mx-auto mb-2"></i>
                            <p class="text-slate-600 text-sm">Lỗi khi nhận dữ liệu streaming</p>
                        </div>
                    `;
                    lucide.createIcons();
                }
            } else {
                // Fallback: non-streaming response (JSON)
                const data = await response.json();
                const analysis = data.analysis || 'Không thể tải phân tích. Vui lòng thử lại sau.';
                const formattedAnalysis = formatAnalysisContent(analysis);
                const disclaimer = '<p class="text-xs text-slate-400 italic mt-4 pt-3 border-t border-slate-200">Nội dung này được sinh bởi AI</p>';
                contentEl.innerHTML = formattedAnalysis + disclaimer;
                lucide.createIcons();
            }
        } else {
            contentEl.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="alert-circle" class="w-10 h-10 text-red-500 mx-auto mb-2"></i>
                    <p class="text-slate-600 text-sm">Không thể tải phân tích</p>
                </div>
            `;
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading detailed analysis:', error);
        contentEl.innerHTML = `
            <div class="text-center py-8">
                <i data-lucide="alert-circle" class="w-10 h-10 text-red-500 mx-auto mb-2"></i>
                <p class="text-slate-600 text-sm">Đã xảy ra lỗi: ${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// Format analysis content with proper structure
function formatAnalysisContent(text) {
    const lines = text.split('\n');
    let html = '';
    let inSection = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        // Section headers (###, ####, or numbered like 1., 2., 3.)
        if (line.match(/^(#{2,4}\s+|\d+\.\s+|[A-ZĐÂĂÊÔƠƯ]{3,})/)) {
            if (inSection) html += '</div>'; // Close previous section
            const title = line.replace(/^#{2,4}\s+|\d+\.\s+/, '');
            html += `<div class="mb-4"><h3 class="text-sm font-bold text-slate-800 mb-2 pb-2 border-b border-gray-200">${title}</h3>`;
            inSection = true;
        }
        // Bold text (**text**)
        else if (line.includes('**')) {
            const formatted = line.replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>');
            html += `<p class="text-sm text-slate-700 mb-2 leading-relaxed">${formatted}</p>`;
        }
        // Bullet points
        else if (line.match(/^[-•\*]\s+/)) {
            const content = line.replace(/^[-•\*]\s+/, '');
            html += `
                <div class="flex gap-2 mb-2 ml-2">
                    <span class="text-blue-500 text-xs mt-1">●</span>
                    <span class="text-sm text-slate-700 flex-1 leading-relaxed">${content}</span>
                </div>
            `;
        }
        // Regular paragraph
        else {
            html += `<p class="text-sm text-slate-700 mb-2 leading-relaxed">${line}</p>`;
        }
    }
    
    if (inSection) html += '</div>'; // Close last section
    return html || '<p class="text-sm text-slate-500 italic">Không có dữ liệu phân tích</p>';
}

function closeDetailedAnalysis() {
    const modal = document.getElementById('analysis-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Chatbot Analysis Functions
async function openChatbotAnalysis(type) {
    const contentEl = document.getElementById('chatbot-analysis-content');
    if (!contentEl) return;
    
    // Show loading
    contentEl.innerHTML = `
        <div class="flex items-center gap-2 text-blue-600">
            <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm font-medium">Đang phân tích...</span>
        </div>
    `;
    
    try {
        const year = window.currentYear || new Date().getFullYear();
        const month = window.currentMonth || (new Date().getMonth() + 1);
        const periodType = window.currentPeriod || 'current_month';
        
        if (type === 'overview') {
            // Gọi AI summary endpoint (prompt 1)
            const response = await fetch(`${API_ENDPOINTS.dashboardAISummary}?year=${year}&month=${month}&periodType=${periodType}`);
            if (response.ok) {
                const data = await response.json();
                const formatted = formatAnalysisContent(data.summary);
                contentEl.innerHTML = formatted;
                lucide.createIcons();
            } else {
                contentEl.innerHTML = `<p class="text-sm text-red-600">Không thể tải phân tích.</p>`;
            }
        } else if (type === 'detailed') {
            // Gọi detailed analysis endpoint với streaming support
            const response = await fetch(`${API_ENDPOINTS.dashboardBase}/ai-detailed-analysis?year=${year}&month=${month}&periodType=${periodType}`);
            if (response.ok) {
                const contentType = response.headers.get('Content-Type');
                
                // Xử lý streaming response
                if (contentType && contentType.includes('text/event-stream')) {
                    contentEl.innerHTML = '<div class="streaming-content text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"></div>';
                    const streamingDiv = contentEl.querySelector('.streaming-content');
                    let accumulatedText = '';
                    
                    try {
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            
                            const chunk = decoder.decode(value, { stream: true });
                            const lines = chunk.split('\n');
                            
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const jsonData = JSON.parse(line.slice(6));
                                        if (jsonData.text) {
                                            accumulatedText += jsonData.text;
                                            streamingDiv.innerHTML = formatAnalysisContent(accumulatedText);
                                            lucide.createIcons();
                                        } else if (jsonData.error) {
                                            console.error('Streaming error:', jsonData.error);
                                        }
                                    } catch (e) {
                                        // Ignore JSON parse errors for incomplete chunks
                                    }
                                }
                            }
                        }
                        
                        // Đảm bảo format cuối cùng
                        if (accumulatedText) {
                            contentEl.innerHTML = formatAnalysisContent(accumulatedText);
                            lucide.createIcons();
                        }
                    } catch (streamError) {
                        console.error('Streaming error:', streamError);
                        contentEl.innerHTML = `<p class="text-sm text-red-600">Lỗi khi nhận dữ liệu streaming.</p>`;
                    }
                } else {
                    // Fallback: non-streaming response
                    const data = await response.json();
                    const formatted = formatAnalysisContent(data.analysis || 'Không thể tải phân tích.');
                    contentEl.innerHTML = formatted;
                    lucide.createIcons();
                }
            } else {
                contentEl.innerHTML = `<p class="text-sm text-red-600">Không thể tải phân tích.</p>`;
            }
        } else {
            // Các phân tích khác chưa có data
            contentEl.innerHTML = `
                <div class="text-center py-6">
                    <i data-lucide="info" class="w-10 h-10 text-slate-300 mx-auto mb-2"></i>
                    <p class="text-sm text-slate-600 font-medium mb-1">Phân tích này đang được phát triển</p>
                    <p class="text-xs text-slate-500">Dữ liệu cần được bổ sung để có thể phân tích</p>
                </div>
            `;
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading chatbot analysis:', error);
        contentEl.innerHTML = `<p class="text-sm text-red-600">Đã xảy ra lỗi khi tải phân tích.</p>`;
    }
}

// Dashboard Charts
let completionChart = null;
let handlersChart = null;
let trendChart = null;

async function initializeCharts(kpiData) {
    // Load status distribution chart
    loadStatusChart(kpiData);
    // Load completion history chart
    await loadCompletionChart();
    // Load top handlers chart  
    await loadHandlersChart();
    // Load trend history chart
    await loadTrendChart();
}

function loadStatusChart(kpiData) {
    const ctx = document.getElementById('chart-status');
    if (!ctx) return;
    
    if (window.chartInstances && window.chartInstances.status) {
        window.chartInstances.status.destroy();
    }
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Đã hoàn thành', 'Đang xử lý', 'Chờ xử lý'],
            datasets: [{
                data: [
                    kpiData.completedTickets || 0,
                    kpiData.inProgressTickets || 0,
                    kpiData.pendingTickets || 0
                ],
                backgroundColor: ['rgb(16, 185, 129)', 'rgb(59, 130, 246)', 'rgb(245, 158, 11)'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: '500' },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                                    return {
                                        text: `${label}: ${value} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} phiếu (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances.status = chart;
}

async function loadCompletionChart() {
    try {
        const period = getPeriodFromDropdown();
        const response = await fetch(`${API_ENDPOINTS.dashboardBase}/completion-history?year=${period.year}&month=${period.month}&periodType=${period.type}&months=6`);
        
        if (!response.ok) {
            console.error('Failed to load completion chart');
            return;
        }
        
        const result = await response.json();
        if (!result.success || !result.data) {
            console.error('Invalid completion chart data');
            return;
        }
        
        const data = result.data;
        const ctx = document.getElementById('chart-completion');
        if (!ctx) {
            console.error('chart-completion canvas not found');
            return;
        }
        
        console.log('[Chart] Completion data:', { months: data.months?.length, rates: data.completionRates?.length });
        
        if (completionChart) {
            completionChart.destroy();
        }
        
        completionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.months || [],
                datasets: [{
                    label: 'Tỷ lệ hoàn thành (%)',
                    data: data.completionRates || [],
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Tỷ lệ: ${context.parsed.y.toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading completion chart:', error);
    }
}

async function loadHandlersChart() {
    try {
        const period = getPeriodFromDropdown();
        const response = await fetch(`${API_ENDPOINTS.dashboardBase}/top-handlers?year=${period.year}&month=${period.month}&limit=5`);
        
        if (!response.ok) {
            console.error('Failed to load handlers chart');
            return;
        }
        
        const result = await response.json();
        if (!result.success || !result.data) {
            console.error('Invalid handlers chart data');
            return;
        }
        
        const data = result.data;
        const ctx = document.getElementById('chart-handlers');
        if (!ctx) return;
        
        if (handlersChart) {
            handlersChart.destroy();
        }
        
        handlersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.handlers || [],
                datasets: [
                    {
                        label: 'Đã hoàn thành',
                        data: data.completedCounts || [],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                    },
                    {
                        label: 'Tổng số',
                        data: data.totalCounts || [],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.x} phiếu`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading handlers chart:', error);
    }
}

function getPeriodFromDropdown() {
    const selector = document.getElementById('period-selector');
    if (!selector) return { year: new Date().getFullYear(), month: new Date().getMonth() + 1, type: 'current_month' };
    
    const value = selector.value;
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let type = value;
    
    if (value === 'last_month') {
        month = month === 1 ? 12 : month - 1;
        year = month === 12 ? year - 1 : year;
    }
    
    return { year, month, type };
}

// Setup period selector change listener
function setupPeriodSelector() {
    const selector = document.getElementById('period-selector');
    if (selector) {
        selector.addEventListener('change', async () => {
            console.log('[Dashboard] Period changed, reloading all data...');
            await reloadAllDashboardData();
        });
    }

    // Setup period filter buttons using event delegation
    const periodDropdown = document.getElementById('period-filter-dropdown');
    if (periodDropdown) {
        periodDropdown.addEventListener('click', (e) => {
            const button = e.target.closest('.period-option');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const period = button.getAttribute('data-period');
                console.log('[Period Filter] Button clicked, period:', period);
                if (period && typeof selectPeriod === 'function') {
                    selectPeriod(period);
                } else {
                    console.error('[Period Filter] selectPeriod function not found or no period attribute');
                }
            }
        });
        console.log('[Period Filter] Event delegation setup complete');
    } else {
        console.error('[Period Filter] Dropdown element not found');
    }
}

// Reload all dashboard data (KPI, charts, AI summary)
async function reloadAllDashboardData() {
    const period = getPeriodFromDropdown();
    
    let kpiData = null;
    
    // Reload KPI
    try {
        const response = await fetch(`${API_ENDPOINTS.dashboardKPI}?year=${period.year}&month=${period.month}&periodType=${period.type}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                updateKPIDisplay(data.data);
                kpiData = data.data;
            }
        }
    } catch (error) {
        console.error('[Dashboard] Error reloading KPI:', error);
    }
    
    // Reload AI Summary
    try {
        const aiSummaryUrl = `${API_ENDPOINTS.dashboardAISummary}?year=${period.year}&month=${period.month}&periodType=${period.type}`;
        const aiResponse = await fetch(aiSummaryUrl);
        if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            if (aiData.summary) {
                updateAISummary(aiData.summary);
            }
        }
    } catch (error) {
        console.error('[Dashboard] Error reloading AI summary:', error);
    }
    
    // Reload status chart with new KPI data
    if (kpiData) {
        loadStatusChart(kpiData);
    }
    
    // Reload all charts
    await loadCompletionChart();
    await loadHandlersChart();
    await loadTrendChart();
    
    // Update last update time
    const timeEl = document.getElementById('last-update-time');
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
}

async function loadTrendChart() {
    try {
        const period = getPeriodFromDropdown();
        const response = await fetch(`${API_ENDPOINTS.dashboardBase}/trend-history?months=6&year=${period.year}&month=${period.month}`);
        
        if (!response.ok) {
            console.error('Failed to load trend chart');
            return;
        }
        
        const result = await response.json();
        if (!result.success || !result.data) {
            console.error('Invalid trend chart data');
            return;
        }
        
        const data = result.data;
        const ctx = document.getElementById('chart-trend');
        if (!ctx) return;
        
        if (trendChart) {
            trendChart.destroy();
        }
        
        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.months || [],
                datasets: [
                    {
                        label: 'Tổng phiếu',
                        data: data.total || [],
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4
                    },
                    {
                        label: 'Đã hoàn thành',
                        data: data.completed || [],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y} phiếu`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading trend chart:', error);
    }
}

async function refreshChart(chartType, event) {
    if (event) event.preventDefault();
    
    if (chartType === 'completion') {
        await loadCompletionChart();
    } else if (chartType === 'handlers') {
        await loadHandlersChart();
    } else if (chartType === 'trend') {
        await loadTrendChart();
    }
}

// Load Task Reminders
async function loadTaskReminders() {
    if (!currentUser || !currentUser.id) {
        console.log('[Task Reminders] No user logged in');
        return;
    }
    
    try {
        const period = window.currentPeriod || 'this_month';
        const url = API_ENDPOINTS.taskReminderSuggestions(currentUser.id, period);
        console.log('[Task Reminders] Fetching:', url);
        console.log('[Task Reminders] Period:', period, 'UserId:', currentUser.id);
        
        const response = await fetch(url);
        console.log('[Task Reminders] Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('[Task Reminders] Data received:', result);
            if (result.success && result.data) {
                updateReminderUI(result.data);
            } else {
                console.log('[Task Reminders] No data or unsuccessful:', result);
            }
        } else {
            console.error('[Task Reminders] HTTP error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('[Task Reminders] Error:', error);
    }
}

// Update Reminder UI
function updateReminderUI(data) {
    const reminderPending = document.getElementById('reminder-pending');
    const reminderProgress = document.getElementById('reminder-progress');
    
    if (reminderPending && data.statistics) {
        reminderPending.textContent = data.statistics.overdue || 0;
    }
    if (reminderProgress && data.statistics) {
        reminderProgress.textContent = data.statistics.inProgress || 0;
    }
}

// Open Detailed Analysis
function openDetailedAnalysis() {
    const modal = document.getElementById('analysis-modal');
    const content = document.getElementById('analysis-content');
    
    if (!modal || !content) return;
    
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="text-center">
                <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-slate-600">Đang phân tích dữ liệu...</p>
            </div>
        </div>
    `;
    
    // Load detailed analysis from AI
    loadDetailedAnalysis();
    
    lucide.createIcons();
}

// Load Detailed Analysis
async function loadDetailedAnalysis() {
    if (!currentUser || !currentUser.id) return;
    
    try {
        const period = window.currentPeriod || 'this_month';
        const response = await fetch(API_ENDPOINTS.taskReminderAssignments(currentUser.id, period));
        
        const content = document.getElementById('analysis-content');
        if (!content) return;
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                displayDetailedAnalysis(result.data);
            } else {
                content.innerHTML = `
                    <div class="text-center py-12">
                        <i data-lucide="alert-circle" class="w-12 h-12 text-orange-500 mx-auto mb-3"></i>
                        <p class="text-slate-600">${result.message || 'Không có dữ liệu phân tích'}</p>
                    </div>
                `;
            }
        } else {
            content.innerHTML = `
                <div class="text-center py-12">
                    <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-3"></i>
                    <p class="text-slate-600">Không thể tải phân tích. Vui lòng thử lại.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading detailed analysis:', error);
        const content = document.getElementById('analysis-content');
        if (content) {
            content.innerHTML = `
                <div class="text-center py-12">
                    <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-3"></i>
                    <p class="text-slate-600">Lỗi kết nối. Vui lòng thử lại.</p>
                </div>
            `;
        }
    }
    
    lucide.createIcons();
}

// Display Detailed Analysis
function displayDetailedAnalysis(data) {
    const content = document.getElementById('analysis-content');
    if (!content) return;
    
    let html = `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div class="flex items-start gap-3">
                    <i data-lucide="sparkles" class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"></i>
                    <div>
                        <h4 class="font-semibold text-slate-800 mb-2">Tóm tắt AI</h4>
                        <p class="text-sm text-slate-700">${data.summary || 'Không có dữ liệu'}</p>
                    </div>
                </div>
            </div>
    `;
    
    // Assignment suggestions (for IT members)
    if (data.assignmentSuggestions && data.assignmentSuggestions.length > 0) {
        html += `
            <div>
                <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i data-lucide="users" class="w-5 h-5 text-blue-600"></i>
                    Gợi ý phân công (${data.assignmentSuggestions.length})
                </h4>
                <div class="space-y-3">
        `;
        
        data.assignmentSuggestions.forEach(suggestion => {
            html += `
                <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-sm font-medium text-slate-700">${suggestion.noiDung || 'N/A'}</span>
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            ${Math.round(suggestion.confidence * 100)}% phù hợp
                        </span>
                    </div>
                    <div class="text-xs text-slate-500 mb-2">
                        <span class="font-medium">Loại:</span> ${suggestion.loaiYeuCau || 'N/A'}
                    </div>
                    <div class="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg">
                        <i data-lucide="user-check" class="w-4 h-4"></i>
                        <span class="font-medium">${suggestion.suggestedUserName}</span>
                    </div>
                    ${suggestion.reasoning ? `
                        <div class="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                            <span class="font-medium">Lý do:</span> ${suggestion.reasoning}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // New tasks (for department heads)
    if (data.newTasks && data.newTasks.length > 0) {
        html += `
            <div>
                <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <i data-lucide="clipboard-list" class="w-5 h-5 text-orange-600"></i>
                    Phiếu chờ duyệt (${data.newTasks.length})
                </h4>
                <div class="space-y-2">
        `;
        
        data.newTasks.forEach(task => {
            html += `
                <div class="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="text-sm font-medium text-slate-700 mb-1">${task.noiDung}</div>
                            <div class="text-xs text-slate-500">
                                ${task.nguoiYeuCau} - ${new Date(task.ngayYeuCau).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <span class="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            ${task.trangThai}
                        </span>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // Statistics
    if (data.statistics) {
        html += `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div class="text-2xl font-bold text-blue-600">${data.statistics.totalPending || 0}</div>
                    <div class="text-xs text-slate-600">Tổng chờ xử lý</div>
                </div>
                <div class="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <div class="text-2xl font-bold text-orange-600">${data.statistics.overdue || 0}</div>
                    <div class="text-xs text-slate-600">Quá hạn</div>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    content.innerHTML = html;
    lucide.createIcons();
}

// Close analysis modal
const closeAnalysisModalBtn = document.getElementById('close-analysis-modal');
if (closeAnalysisModalBtn) {
    closeAnalysisModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('analysis-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    });
}

// Make functions available globally
window.toggleActionsMenu = toggleActionsMenu;
window.handleDrawChart = handleDrawChart;
window.handleRateResponse = handleRateResponse;
window.openChatbotAnalysis = openChatbotAnalysis;
window.refreshChart = refreshChart;
window.initializeCharts = initializeCharts;
window.loadTaskReminders = loadTaskReminders;
window.openDetailedAnalysis = openDetailedAnalysis;
