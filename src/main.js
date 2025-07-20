// Global state management
let currentUser = null;
let currentPage = 'home';
let currentDashboardSection = 'overview';

// Mock database
const mockDatabase = {
    users: [
        {
            id: 1,
            email: 'admin@bloodbank.com',
            password: 'admin123',
            role: 'admin',
            name: 'System Administrator',
            phone: '+1234567890',
            address: 'Blood Bank HQ',
            createdAt: new Date('2024-01-01')
        },
        {
            id: 2,
            email: 'john.doe@email.com',
            password: 'donor123',
            role: 'donor',
            name: 'John Doe',
            phone: '+1234567891',
            address: '123 Main St, City',
            age: 28,
            gender: 'male',
            bloodType: 'O+',
            weight: 75,
            emergencyContact: '+1234567892',
            medicalHistory: 'No significant medical history',
            lastDonation: new Date('2024-01-15'),
            donationCount: 5,
            isEligible: true,
            createdAt: new Date('2024-01-01')
        },
        {
            id: 3,
            email: 'contact@cityhospital.com',
            password: 'hospital123',
            role: 'hospital',
            name: 'City General Hospital',
            phone: '+1234567893',
            address: '456 Hospital Ave, City',
            license: 'HOS-2024-001',
            hospitalType: 'government',
            specializations: 'Emergency, Cardiology, Surgery',
            createdAt: new Date('2024-01-01')
        }
    ],
    donations: [
        {
            id: 1,
            donorId: 2,
            date: new Date('2024-01-15'),
            location: 'City General Hospital',
            bloodType: 'O+',
            volume: 450,
            status: 'completed'
        },
        {
            id: 2,
            donorId: 2,
            date: new Date('2023-10-10'),
            location: 'Blood Drive Center',
            bloodType: 'O+',
            volume: 450,
            status: 'completed'
        }
    ],
    bloodRequests: [
        {
            id: 1,
            hospitalId: 3,
            bloodType: 'O+',
            quantity: 2,
            priority: 'urgent',
            reason: 'Emergency surgery',
            status: 'pending',
            requestDate: new Date('2024-01-20'),
            requiredBy: new Date('2024-01-22')
        }
    ]
};

// Blood type compatibility matrix
const bloodCompatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
};

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast.querySelector('.toast-header i');
    
    toastMessage.textContent = message;
    
    // Update icon based on type
    toastHeader.className = `fas me-2 ${
        type === 'success' ? 'fa-check-circle text-success' :
        type === 'error' ? 'fa-exclamation-circle text-danger' :
        type === 'warning' ? 'fa-exclamation-triangle text-warning' :
        'fa-info-circle text-primary'
    }`;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateDaysSinceLastDonation(lastDonation) {
    if (!lastDonation) return null;
    const today = new Date();
    const lastDonationDate = new Date(lastDonation);
    const diffTime = Math.abs(today - lastDonationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isDonorEligible(lastDonation) {
    const daysSince = calculateDaysSinceLastDonation(lastDonation);
    return daysSince === null || daysSince >= 90;
}

// Page navigation functions
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');
    currentPage = pageName;
    
    // Update navigation
    updateNavigation();
}

function showHome() {
    showPage('home');
    updateStats();
}

function showLogin() {
    showPage('login');
}

function showRegister() {
    showPage('register');
}

function showDashboard() {
    if (!currentUser) {
        showLogin();
        return;
    }
    showPage('dashboard');
    initializeDashboard();
}

function updateNavigation() {
    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const dashboardNav = document.getElementById('dashboardNav');
    const logoutNav = document.getElementById('logoutNav');
    
    if (currentUser) {
        loginNav.classList.add('d-none');
        registerNav.classList.add('d-none');
        dashboardNav.classList.remove('d-none');
        logoutNav.classList.remove('d-none');
    } else {
        loginNav.classList.remove('d-none');
        registerNav.classList.remove('d-none');
        dashboardNav.classList.add('d-none');
        logoutNav.classList.add('d-none');
    }
}

function updateStats() {
    const donors = mockDatabase.users.filter(u => u.role === 'donor');
    const hospitals = mockDatabase.users.filter(u => u.role === 'hospital');
    const donations = mockDatabase.donations.length;
    
    document.getElementById('totalDonors').textContent = donors.length.toLocaleString();
    document.getElementById('totalHospitals').textContent = hospitals.length;
    document.getElementById('totalDonations').textContent = donations.toLocaleString();
}

// Authentication functions
function login(email, password) {
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        const user = mockDatabase.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = { ...user };
            delete currentUser.password; // Remove password from memory
            
            showToast(`Welcome back, ${user.name}!`, 'success');
            showDashboard();
        } else {
            showToast('Invalid email or password', 'error');
        }
        
        hideLoading();
    }, 1000);
}

function register(userData) {
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        // Check if email already exists
        const existingUser = mockDatabase.users.find(u => u.email === userData.email);
        
        if (existingUser) {
            showToast('Email already registered', 'error');
            hideLoading();
            return;
        }
        
        // Create new user
        const newUser = {
            id: mockDatabase.users.length + 1,
            ...userData,
            createdAt: new Date(),
            donationCount: 0,
            isEligible: true
        };
        
        mockDatabase.users.push(newUser);
        
        showToast('Registration successful! Please login.', 'success');
        showLogin();
        hideLoading();
    }, 1500);
}

function logout() {
    currentUser = null;
    showToast('Logged out successfully', 'success');
    showHome();
}

// Dashboard functions
function initializeDashboard() {
    // Update user info in sidebar
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Show appropriate menu based on role
    document.getElementById('donorMenu').classList.toggle('d-none', currentUser.role !== 'donor');
    document.getElementById('hospitalMenu').classList.toggle('d-none', currentUser.role !== 'hospital');
    document.getElementById('adminMenu').classList.toggle('d-none', currentUser.role !== 'admin');
    
    // Show overview by default
    showDashboardSection('overview');
}

function showDashboardSection(section) {
    currentDashboardSection = section;
    
    // Update active nav link
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // Load section content
    const content = document.getElementById('dashboardContent');
    
    switch (section) {
        case 'overview':
            content.innerHTML = generateOverviewContent();
            break;
        case 'profile':
            content.innerHTML = generateProfileContent();
            break;
        case 'donations':
            content.innerHTML = generateDonationsContent();
            break;
        case 'eligibility':
            content.innerHTML = generateEligibilityContent();
            break;
        case 'search':
            content.innerHTML = generateSearchContent();
            break;
        case 'requests':
            content.innerHTML = generateRequestsContent();
            break;
        case 'hospital-profile':
            content.innerHTML = generateHospitalProfileContent();
            break;
        case 'users':
            content.innerHTML = generateUsersContent();
            break;
        case 'admin-requests':
            content.innerHTML = generateAdminRequestsContent();
            break;
        case 'reports':
            content.innerHTML = generateReportsContent();
            break;
        default:
            content.innerHTML = '<div class="alert alert-warning">Section not found</div>';
    }
}

// Content generation functions
function generateOverviewContent() {
    const stats = getOverviewStats();
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-tachometer-alt me-2"></i>Dashboard Overview</h5>
            <div class="row g-4">
                ${stats.map(stat => `
                    <div class="col-md-3">
                        <div class="text-center p-3 bg-light rounded">
                            <i class="${stat.icon} text-danger mb-2" style="font-size: 2rem;"></i>
                            <h4 class="mb-1">${stat.value}</h4>
                            <p class="text-muted mb-0">${stat.label}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${currentUser.role === 'donor' ? generateDonorOverview() : ''}
        ${currentUser.role === 'hospital' ? generateHospitalOverview() : ''}
        ${currentUser.role === 'admin' ? generateAdminOverview() : ''}
    `;
}

function getOverviewStats() {
    const donors = mockDatabase.users.filter(u => u.role === 'donor');
    const hospitals = mockDatabase.users.filter(u => u.role === 'hospital');
    const donations = mockDatabase.donations;
    const requests = mockDatabase.bloodRequests;
    
    if (currentUser.role === 'donor') {
        const userDonations = donations.filter(d => d.donorId === currentUser.id);
        return [
            { icon: 'fas fa-tint', value: userDonations.length, label: 'Total Donations' },
            { icon: 'fas fa-calendar', value: calculateDaysSinceLastDonation(currentUser.lastDonation) || 'Never', label: 'Days Since Last' },
            { icon: 'fas fa-check-circle', value: isDonorEligible(currentUser.lastDonation) ? 'Yes' : 'No', label: 'Eligible to Donate' },
            { icon: 'fas fa-award', value: currentUser.bloodType, label: 'Blood Type' }
        ];
    } else if (currentUser.role === 'hospital') {
        const hospitalRequests = requests.filter(r => r.hospitalId === currentUser.id);
        return [
            { icon: 'fas fa-clipboard-list', value: hospitalRequests.length, label: 'Total Requests' },
            { icon: 'fas fa-clock', value: hospitalRequests.filter(r => r.status === 'pending').length, label: 'Pending Requests' },
            { icon: 'fas fa-check', value: hospitalRequests.filter(r => r.status === 'approved').length, label: 'Approved Requests' },
            { icon: 'fas fa-users', value: donors.length, label: 'Available Donors' }
        ];
    } else {
        return [
            { icon: 'fas fa-users', value: donors.length, label: 'Total Donors' },
            { icon: 'fas fa-hospital', value: hospitals.length, label: 'Total Hospitals' },
            { icon: 'fas fa-tint', value: donations.length, label: 'Total Donations' },
            { icon: 'fas fa-clipboard-list', value: requests.length, label: 'Blood Requests' }
        ];
    }
}

function generateDonorOverview() {
    const userDonations = mockDatabase.donations.filter(d => d.donorId === currentUser.id);
    const isEligible = isDonorEligible(currentUser.lastDonation);
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-user me-2"></i>Donor Status</h5>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <strong>Eligibility Status:</strong>
                        <span class="status-badge ms-2 ${isEligible ? 'status-eligible' : 'status-not-eligible'}">
                            ${isEligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                    </div>
                    <div class="mb-3">
                        <strong>Blood Type:</strong>
                        <span class="blood-type ms-2">${currentUser.bloodType}</span>
                    </div>
                    <div class="mb-3">
                        <strong>Last Donation:</strong>
                        <span class="ms-2">${currentUser.lastDonation ? formatDate(currentUser.lastDonation) : 'Never'}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <strong>Total Donations:</strong>
                        <span class="ms-2">${userDonations.length}</span>
                    </div>
                    <div class="mb-3">
                        <strong>Next Eligible Date:</strong>
                        <span class="ms-2">${getNextEligibleDate()}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateHospitalOverview() {
    const hospitalRequests = mockDatabase.bloodRequests.filter(r => r.hospitalId === currentUser.id);
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-hospital me-2"></i>Recent Blood Requests</h5>
            ${hospitalRequests.length > 0 ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Blood Type</th>
                                <th>Quantity</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Request Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${hospitalRequests.slice(0, 5).map(request => `
                                <tr>
                                    <td><span class="blood-type">${request.bloodType}</span></td>
                                    <td>${request.quantity} units</td>
                                    <td><span class="status-badge priority-${request.priority}">${request.priority}</span></td>
                                    <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                    <td>${formatDate(request.requestDate)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">No blood requests yet.</p>'}
        </div>
    `;
}

function generateAdminOverview() {
    const pendingRequests = mockDatabase.bloodRequests.filter(r => r.status === 'pending');
    const recentDonors = mockDatabase.users.filter(u => u.role === 'donor').slice(0, 5);
    
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="dashboard-card">
                    <h5><i class="fas fa-clipboard-check me-2"></i>Pending Requests</h5>
                    ${pendingRequests.length > 0 ? `
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Hospital</th>
                                        <th>Blood Type</th>
                                        <th>Priority</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendingRequests.map(request => {
                                        const hospital = mockDatabase.users.find(u => u.id === request.hospitalId);
                                        return `
                                            <tr>
                                                <td>${hospital?.name || 'Unknown'}</td>
                                                <td><span class="blood-type">${request.bloodType}</span></td>
                                                <td><span class="status-badge priority-${request.priority}">${request.priority}</span></td>
                                                <td>
                                                    <button class="btn btn-sm btn-success me-1" onclick="approveRequest(${request.id})">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-danger" onclick="rejectRequest(${request.id})">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="text-muted">No pending requests.</p>'}
                </div>
            </div>
            <div class="col-md-6">
                <div class="dashboard-card">
                    <h5><i class="fas fa-users me-2"></i>Recent Donors</h5>
                    ${recentDonors.length > 0 ? `
                        <div class="list-group list-group-flush">
                            ${recentDonors.map(donor => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${donor.name}</strong>
                                        <br>
                                        <small class="text-muted">${donor.email}</small>
                                    </div>
                                    <span class="blood-type">${donor.bloodType}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted">No donors registered yet.</p>'}
                </div>
            </div>
        </div>
    `;
}

function generateProfileContent() {
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-user me-2"></i>My Profile</h5>
            <form id="profileForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" value="${currentUser.name}" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" value="${currentUser.email}" readonly>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-control" value="${currentUser.phone}" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Blood Type</label>
                        <input type="text" class="form-control" value="${currentUser.bloodType}" readonly>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Age</label>
                        <input type="number" class="form-control" value="${currentUser.age}" readonly>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Gender</label>
                        <input type="text" class="form-control" value="${currentUser.gender}" readonly>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Weight (kg)</label>
                        <input type="number" class="form-control" value="${currentUser.weight}" readonly>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" rows="2" readonly>${currentUser.address}</textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Emergency Contact</label>
                    <input type="tel" class="form-control" value="${currentUser.emergencyContact}" readonly>
                </div>
                <div class="mb-3">
                    <label class="form-label">Medical History</label>
                    <textarea class="form-control" rows="3" readonly>${currentUser.medicalHistory}</textarea>
                </div>
            </form>
        </div>
    `;
}

function generateDonationsContent() {
    const userDonations = mockDatabase.donations.filter(d => d.donorId === currentUser.id);
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-tint me-2"></i>Donation History</h5>
            ${userDonations.length > 0 ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Blood Type</th>
                                <th>Volume (ml)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userDonations.map(donation => `
                                <tr>
                                    <td>${formatDate(donation.date)}</td>
                                    <td>${donation.location}</td>
                                    <td><span class="blood-type">${donation.bloodType}</span></td>
                                    <td>${donation.volume}</td>
                                    <td><span class="status-badge status-${donation.status}">${donation.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">No donations recorded yet.</p>'}
        </div>
    `;
}

function generateEligibilityContent() {
    const isEligible = isDonorEligible(currentUser.lastDonation);
    const daysSince = calculateDaysSinceLastDonation(currentUser.lastDonation);
    const daysUntilEligible = daysSince ? Math.max(0, 90 - daysSince) : 0;
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-check-circle me-2"></i>Donation Eligibility</h5>
            <div class="row">
                <div class="col-md-8">
                    <div class="alert ${isEligible ? 'alert-success' : 'alert-warning'}" role="alert">
                        <h6 class="alert-heading">
                            <i class="fas ${isEligible ? 'fa-check-circle' : 'fa-clock'} me-2"></i>
                            ${isEligible ? 'You are eligible to donate!' : 'You are not currently eligible to donate'}
                        </h6>
                        <p class="mb-0">
                            ${isEligible 
                                ? 'You can schedule your next donation appointment.' 
                                : `You need to wait ${daysUntilEligible} more days before your next donation.`
                            }
                        </p>
                    </div>
                    
                    <div class="mb-4">
                        <h6>Eligibility Criteria:</h6>
                        <ul class="list-unstyled">
                            <li><i class="fas fa-check text-success me-2"></i>Age between 18-65 years</li>
                            <li><i class="fas fa-check text-success me-2"></i>Weight at least 50kg</li>
                            <li><i class="fas ${daysSince >= 90 || !daysSince ? 'fa-check text-success' : 'fa-times text-danger'} me-2"></i>At least 90 days since last donation</li>
                            <li><i class="fas fa-check text-success me-2"></i>Good general health</li>
                        </ul>
                    </div>
                    
                    ${isEligible ? `
                        <button class="btn btn-danger" onclick="scheduleDonation()">
                            <i class="fas fa-calendar-plus me-2"></i>Schedule Donation
                        </button>
                    ` : ''}
                </div>
                <div class="col-md-4">
                    <div class="text-center p-4 bg-light rounded">
                        <i class="fas fa-calendar-alt text-danger mb-3" style="font-size: 3rem;"></i>
                        <h6>Next Eligible Date</h6>
                        <p class="mb-0 fw-bold">${getNextEligibleDate()}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateSearchContent() {
    const donors = mockDatabase.users.filter(u => u.role === 'donor');
    
    return `
        <div class="search-filters">
            <h5><i class="fas fa-search me-2"></i>Search Donors</h5>
            <form id="searchForm">
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <label class="form-label">Blood Type</label>
                        <select class="form-select" id="searchBloodType">
                            <option value="">All Blood Types</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div class="col-md-3 mb-3">
                        <label class="form-label">Eligibility</label>
                        <select class="form-select" id="searchEligibility">
                            <option value="">All Donors</option>
                            <option value="eligible">Eligible Only</option>
                            <option value="not-eligible">Not Eligible</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" id="searchLocation" placeholder="Enter city or area">
                    </div>
                    <div class="col-md-2 mb-3">
                        <label class="form-label">&nbsp;</label>
                        <button type="submit" class="btn btn-danger w-100">
                            <i class="fas fa-search me-2"></i>Search
                        </button>
                    </div>
                </div>
            </form>
        </div>
        
        <div class="dashboard-card">
            <h5><i class="fas fa-users me-2"></i>Available Donors</h5>
            <div id="searchResults">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Blood Type</th>
                                <th>Age</th>
                                <th>Location</th>
                                <th>Eligibility</th>
                                <th>Last Donation</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${donors.map(donor => {
                                const isEligible = isDonorEligible(donor.lastDonation);
                                return `
                                    <tr>
                                        <td>${donor.name}</td>
                                        <td><span class="blood-type">${donor.bloodType}</span></td>
                                        <td>${donor.age}</td>
                                        <td>${donor.address.split(',')[1] || donor.address}</td>
                                        <td><span class="status-badge ${isEligible ? 'status-eligible' : 'status-not-eligible'}">${isEligible ? 'Eligible' : 'Not Eligible'}</span></td>
                                        <td>${donor.lastDonation ? formatDate(donor.lastDonation) : 'Never'}</td>
                                        <td>
                                            ${isEligible ? `
                                                <button class="btn btn-sm btn-danger" onclick="requestBloodFromDonor(${donor.id})">
                                                    <i class="fas fa-plus me-1"></i>Request
                                                </button>
                                            ` : `
                                                <button class="btn btn-sm btn-secondary" disabled>
                                                    Not Available
                                                </button>
                                            `}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function generateRequestsContent() {
    const hospitalRequests = mockDatabase.bloodRequests.filter(r => r.hospitalId === currentUser.id);
    
    return `
        <div class="dashboard-card">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5><i class="fas fa-clipboard-list me-2"></i>Blood Requests</h5>
                <button class="btn btn-danger" onclick="showNewRequestModal()">
                    <i class="fas fa-plus me-2"></i>New Request
                </button>
            </div>
            
            ${hospitalRequests.length > 0 ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Blood Type</th>
                                <th>Quantity</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Request Date</th>
                                <th>Required By</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${hospitalRequests.map(request => `
                                <tr>
                                    <td>#${request.id.toString().padStart(4, '0')}</td>
                                    <td><span class="blood-type">${request.bloodType}</span></td>
                                    <td>${request.quantity} units</td>
                                    <td><span class="status-badge priority-${request.priority}">${request.priority}</span></td>
                                    <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                    <td>${formatDate(request.requestDate)}</td>
                                    <td>${formatDate(request.requiredBy)}</td>
                                    <td>
                                        ${request.status === 'pending' ? `
                                            <button class="btn btn-sm btn-outline-danger" onclick="cancelRequest(${request.id})">
                                                <i class="fas fa-times me-1"></i>Cancel
                                            </button>
                                        ` : `
                                            <button class="btn btn-sm btn-outline-secondary" onclick="viewRequestDetails(${request.id})">
                                                <i class="fas fa-eye me-1"></i>View
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="text-muted">No blood requests yet. Click "New Request" to create your first request.</p>'}
        </div>
        
        <!-- New Request Modal -->
        <div class="modal fade" id="newRequestModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">New Blood Request</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="newRequestForm">
                            <div class="mb-3">
                                <label class="form-label">Blood Type</label>
                                <select class="form-select" id="requestBloodType" required>
                                    <option value="">Select Blood Type</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Quantity (units)</label>
                                <input type="number" class="form-control" id="requestQuantity" min="1" max="10" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Priority</label>
                                <select class="form-select" id="requestPriority" required>
                                    <option value="">Select Priority</option>
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Required By</label>
                                <input type="date" class="form-control" id="requestRequiredBy" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Reason</label>
                                <textarea class="form-control" id="requestReason" rows="3" placeholder="Brief description of the medical need" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="submitBloodRequest()">Submit Request</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateHospitalProfileContent() {
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-hospital me-2"></i>Hospital Profile</h5>
            <form id="hospitalProfileForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Hospital Name</label>
                        <input type="text" class="form-control" value="${currentUser.name}" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" value="${currentUser.email}" readonly>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-control" value="${currentUser.phone}" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">License Number</label>
                        <input type="text" class="form-control" value="${currentUser.license}" readonly>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Hospital Type</label>
                        <input type="text" class="form-control" value="${currentUser.hospitalType}" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Registration Date</label>
                        <input type="text" class="form-control" value="${formatDate(currentUser.createdAt)}" readonly>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <textarea class="form-control" rows="2" readonly>${currentUser.address}</textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Specializations</label>
                    <textarea class="form-control" rows="2" readonly>${currentUser.specializations}</textarea>
                </div>
            </form>
        </div>
    `;
}

function generateUsersContent() {
    const users = mockDatabase.users.filter(u => u.role !== 'admin');
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-users me-2"></i>Manage Users</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Registration Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>
                                    <span class="badge bg-${user.role === 'donor' ? 'primary' : 'success'}">
                                        ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </td>
                                <td>${formatDate(user.createdAt)}</td>
                                <td>
                                    <span class="status-badge status-approved">Active</span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewUserDetails(${user.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="suspendUser(${user.id})">
                                        <i class="fas fa-ban"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateAdminRequestsContent() {
    const requests = mockDatabase.bloodRequests;
    
    return `
        <div class="dashboard-card">
            <h5><i class="fas fa-clipboard-check me-2"></i>Blood Request Management</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Hospital</th>
                            <th>Blood Type</th>
                            <th>Quantity</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Request Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(request => {
                            const hospital = mockDatabase.users.find(u => u.id === request.hospitalId);
                            return `
                                <tr>
                                    <td>#${request.id.toString().padStart(4, '0')}</td>
                                    <td>${hospital?.name || 'Unknown Hospital'}</td>
                                    <td><span class="blood-type">${request.bloodType}</span></td>
                                    <td>${request.quantity} units</td>
                                    <td><span class="status-badge priority-${request.priority}">${request.priority}</span></td>
                                    <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                    <td>${formatDate(request.requestDate)}</td>
                                    <td>
                                        ${request.status === 'pending' ? `
                                            <button class="btn btn-sm btn-success me-1" onclick="approveRequest(${request.id})">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="rejectRequest(${request.id})">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        ` : `
                                            <button class="btn btn-sm btn-outline-secondary" onclick="viewRequestDetails(${request.id})">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateReportsContent() {
    const donors = mockDatabase.users.filter(u => u.role === 'donor');
    const hospitals = mockDatabase.users.filter(u => u.role === 'hospital');
    const donations = mockDatabase.donations;
    const requests = mockDatabase.bloodRequests;
    
    // Blood type distribution
    const bloodTypeStats = {};
    donors.forEach(donor => {
        bloodTypeStats[donor.bloodType] = (bloodTypeStats[donor.bloodType] || 0) + 1;
    });
    
    return `
        <div class="row">
            <div class="col-md-6">
                <div class="dashboard-card">
                    <h5><i class="fas fa-chart-pie me-2"></i>Blood Type Distribution</h5>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Blood Type</th>
                                    <th>Donors</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(bloodTypeStats).map(([type, count]) => `
                                    <tr>
                                        <td><span class="blood-type">${type}</span></td>
                                        <td>${count}</td>
                                        <td>${((count / donors.length) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="dashboard-card">
                    <h5><i class="fas fa-chart-bar me-2"></i>System Statistics</h5>
                    <div class="row g-3">
                        <div class="col-6">
                            <div class="text-center p-3 bg-light rounded">
                                <h4 class="text-danger">${donors.length}</h4>
                                <small>Total Donors</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-3 bg-light rounded">
                                <h4 class="text-danger">${hospitals.length}</h4>
                                <small>Total Hospitals</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-3 bg-light rounded">
                                <h4 class="text-danger">${donations.length}</h4>
                                <small>Total Donations</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-3 bg-light rounded">
                                <h4 class="text-danger">${requests.length}</h4>
                                <small>Blood Requests</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card">
            <h5><i class="fas fa-download me-2"></i>Export Reports</h5>
            <div class="row">
                <div class="col-md-4 mb-3">
                    <button class="btn btn-outline-danger w-100" onclick="exportDonorReport()">
                        <i class="fas fa-users me-2"></i>Export Donor List
                    </button>
                </div>
                <div class="col-md-4 mb-3">
                    <button class="btn btn-outline-danger w-100" onclick="exportDonationReport()">
                        <i class="fas fa-tint me-2"></i>Export Donation History
                    </button>
                </div>
                <div class="col-md-4 mb-3">
                    <button class="btn btn-outline-danger w-100" onclick="exportRequestReport()">
                        <i class="fas fa-clipboard-list me-2"></i>Export Request Report
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function getNextEligibleDate() {
    if (!currentUser.lastDonation) return 'Now';
    
    const lastDonation = new Date(currentUser.lastDonation);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 90);
    
    const today = new Date();
    if (nextEligible <= today) return 'Now';
    
    return formatDate(nextEligible);
}

// Action functions
function scheduleDonation() {
    showToast('Donation scheduling feature coming soon!', 'info');
}

function showNewRequestModal() {
    const modal = new bootstrap.Modal(document.getElementById('newRequestModal'));
    modal.show();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('requestRequiredBy').min = today;
}

function submitBloodRequest() {
    const bloodType = document.getElementById('requestBloodType').value;
    const quantity = document.getElementById('requestQuantity').value;
    const priority = document.getElementById('requestPriority').value;
    const requiredBy = document.getElementById('requestRequiredBy').value;
    const reason = document.getElementById('requestReason').value;
    
    if (!bloodType || !quantity || !priority || !requiredBy || !reason) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const newRequest = {
        id: mockDatabase.bloodRequests.length + 1,
        hospitalId: currentUser.id,
        bloodType,
        quantity: parseInt(quantity),
        priority,
        reason,
        status: 'pending',
        requestDate: new Date(),
        requiredBy: new Date(requiredBy)
    };
    
    mockDatabase.bloodRequests.push(newRequest);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newRequestModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('newRequestForm').reset();
    
    showToast('Blood request submitted successfully!', 'success');
    showDashboardSection('requests');
}

function requestBloodFromDonor(donorId) {
    showToast('Blood request sent to donor!', 'success');
}

function approveRequest(requestId) {
    const request = mockDatabase.bloodRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'approved';
        showToast('Request approved successfully!', 'success');
        showDashboardSection('admin-requests');
    }
}

function rejectRequest(requestId) {
    const request = mockDatabase.bloodRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'rejected';
        showToast('Request rejected', 'warning');
        showDashboardSection('admin-requests');
    }
}

function cancelRequest(requestId) {
    const request = mockDatabase.bloodRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'cancelled';
        showToast('Request cancelled', 'warning');
        showDashboardSection('requests');
    }
}

function viewRequestDetails(requestId) {
    showToast('Request details feature coming soon!', 'info');
}

function viewUserDetails(userId) {
    showToast('User details feature coming soon!', 'info');
}

function suspendUser(userId) {
    showToast('User suspended', 'warning');
}

function exportDonorReport() {
    showToast('Donor report exported!', 'success');
}

function exportDonationReport() {
    showToast('Donation report exported!', 'success');
}

function exportRequestReport() {
    showToast('Request report exported!', 'success');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    updateNavigation();
    updateStats();
    
    // Role selection for registration
    document.querySelectorAll('input[name="userRole"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const donorFields = document.getElementById('donorFields');
            const hospitalFields = document.getElementById('hospitalFields');
            
            if (this.value === 'donor') {
                donorFields.classList.remove('d-none');
                hospitalFields.classList.add('d-none');
            } else {
                donorFields.classList.add('d-none');
                hospitalFields.classList.remove('d-none');
            }
        });
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        login(email, password);
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const role = document.querySelector('input[name="userRole"]:checked').value;
        const userData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            password: document.getElementById('registerPassword').value,
            address: document.getElementById('registerAddress').value,
            role: role
        };
        
        if (role === 'donor') {
            userData.age = parseInt(document.getElementById('donorAge').value);
            userData.gender = document.getElementById('donorGender').value;
            userData.bloodType = document.getElementById('donorBloodType').value;
            userData.weight = parseInt(document.getElementById('donorWeight').value);
            userData.emergencyContact = document.getElementById('donorEmergencyContact').value;
            userData.medicalHistory = document.getElementById('donorMedicalHistory').value;
        } else {
            userData.license = document.getElementById('hospitalLicense').value;
            userData.hospitalType = document.getElementById('hospitalType').value;
            userData.specializations = document.getElementById('hospitalSpecializations').value;
        }
        
        register(userData);
    });
    
    // Search form
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'searchForm') {
            e.preventDefault();
            // Implement search functionality
            showToast('Search functionality coming soon!', 'info');
        }
    });
});

// Make functions globally available
window.showHome = showHome;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showDashboard = showDashboard;
window.logout = logout;
window.showDashboardSection = showDashboardSection;
window.scheduleDonation = scheduleDonation;
window.showNewRequestModal = showNewRequestModal;
window.submitBloodRequest = submitBloodRequest;
window.requestBloodFromDonor = requestBloodFromDonor;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.cancelRequest = cancelRequest;
window.viewRequestDetails = viewRequestDetails;
window.viewUserDetails = viewUserDetails;
window.suspendUser = suspendUser;
window.exportDonorReport = exportDonorReport;
window.exportDonationReport = exportDonationReport;
window.exportRequestReport = exportRequestReport;