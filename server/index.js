const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'blood-bank-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// In-memory database (replace with real database in production)
let database = {
    users: [
        {
            id: 1,
            email: 'admin@bloodbank.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
            role: 'admin',
            name: 'System Administrator',
            phone: '+1234567890',
            address: 'Blood Bank HQ',
            createdAt: new Date('2024-01-01')
        },
        {
            id: 2,
            email: 'john.doe@email.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // donor123
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
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hospital123
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

// Utility functions
const generateId = (collection) => {
    return Math.max(...collection.map(item => item.id), 0) + 1;
};

const calculateDaysSinceLastDonation = (lastDonation) => {
    if (!lastDonation) return null;
    const today = new Date();
    const lastDonationDate = new Date(lastDonation);
    const diffTime = Math.abs(today - lastDonationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isDonorEligible = (lastDonation) => {
    const daysSince = calculateDaysSinceLastDonation(lastDonation);
    return daysSince === null || daysSince >= 90;
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Blood Bank API is running' });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = database.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userResponse = { ...user };
        delete userResponse.password;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const userData = req.body;

        if (!userData.email || !userData.password || !userData.name || !userData.role) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Check if email already exists
        const existingUser = database.users.find(u => u.email === userData.email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create new user
        const newUser = {
            id: generateId(database.users),
            ...userData,
            password: hashedPassword,
            createdAt: new Date(),
            donationCount: userData.role === 'donor' ? 0 : undefined,
            isEligible: userData.role === 'donor' ? true : undefined
        };

        database.users.push(newUser);

        const userResponse = { ...newUser };
        delete userResponse.password;

        res.status(201).json({
            message: 'Registration successful',
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User routes
app.get('/api/users/profile', authenticateToken, (req, res) => {
    try {
        const user = database.users.find(u => u.id === req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = { ...user };
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/users', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = database.users
            .filter(u => u.role !== 'admin')
            .map(u => {
                const user = { ...u };
                delete user.password;
                return user;
            });

        res.json(users);
    } catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Donor routes
app.get('/api/donors', authenticateToken, (req, res) => {
    try {
        const { bloodType, eligible, location } = req.query;
        
        let donors = database.users.filter(u => u.role === 'donor');

        // Filter by blood type
        if (bloodType) {
            donors = donors.filter(d => d.bloodType === bloodType);
        }

        // Filter by eligibility
        if (eligible === 'true') {
            donors = donors.filter(d => isDonorEligible(d.lastDonation));
        } else if (eligible === 'false') {
            donors = donors.filter(d => !isDonorEligible(d.lastDonation));
        }

        // Filter by location (simple text search)
        if (location) {
            donors = donors.filter(d => 
                d.address.toLowerCase().includes(location.toLowerCase())
            );
        }

        // Remove sensitive information
        const donorsResponse = donors.map(d => {
            const donor = { ...d };
            delete donor.password;
            delete donor.emergencyContact;
            delete donor.medicalHistory;
            donor.isEligible = isDonorEligible(d.lastDonation);
            return donor;
        });

        res.json(donorsResponse);
    } catch (error) {
        console.error('Donors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/donors/:id/donations', authenticateToken, (req, res) => {
    try {
        const donorId = parseInt(req.params.id);
        
        // Check if user can access this data
        if (req.user.role === 'donor' && req.user.id !== donorId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const donations = database.donations.filter(d => d.donorId === donorId);
        res.json(donations);
    } catch (error) {
        console.error('Donations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Blood request routes
app.get('/api/blood-requests', authenticateToken, (req, res) => {
    try {
        let requests = database.bloodRequests;

        // Filter by user role
        if (req.user.role === 'hospital') {
            requests = requests.filter(r => r.hospitalId === req.user.id);
        }

        // Add hospital information for admin view
        const requestsWithHospital = requests.map(request => {
            const hospital = database.users.find(u => u.id === request.hospitalId);
            return {
                ...request,
                hospitalName: hospital ? hospital.name : 'Unknown Hospital'
            };
        });

        res.json(requestsWithHospital);
    } catch (error) {
        console.error('Blood requests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/blood-requests', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'hospital') {
            return res.status(403).json({ error: 'Hospital access required' });
        }

        const { bloodType, quantity, priority, reason, requiredBy } = req.body;

        if (!bloodType || !quantity || !priority || !reason || !requiredBy) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newRequest = {
            id: generateId(database.bloodRequests),
            hospitalId: req.user.id,
            bloodType,
            quantity: parseInt(quantity),
            priority,
            reason,
            status: 'pending',
            requestDate: new Date(),
            requiredBy: new Date(requiredBy)
        };

        database.bloodRequests.push(newRequest);

        res.status(201).json({
            message: 'Blood request submitted successfully',
            request: newRequest
        });
    } catch (error) {
        console.error('Blood request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/api/blood-requests/:id', authenticateToken, (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const { status } = req.body;

        const request = database.bloodRequests.find(r => r.id === requestId);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Check permissions
        if (req.user.role === 'hospital' && request.hospitalId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (req.user.role === 'admin' && ['approved', 'rejected'].includes(status)) {
            request.status = status;
            request.updatedAt = new Date();
        } else if (req.user.role === 'hospital' && status === 'cancelled') {
            request.status = status;
            request.updatedAt = new Date();
        } else {
            return res.status(400).json({ error: 'Invalid status update' });
        }

        res.json({
            message: 'Request updated successfully',
            request
        });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Statistics routes
app.get('/api/statistics', authenticateToken, (req, res) => {
    try {
        const donors = database.users.filter(u => u.role === 'donor');
        const hospitals = database.users.filter(u => u.role === 'hospital');
        const donations = database.donations;
        const requests = database.bloodRequests;

        // Blood type distribution
        const bloodTypeStats = {};
        donors.forEach(donor => {
            bloodTypeStats[donor.bloodType] = (bloodTypeStats[donor.bloodType] || 0) + 1;
        });

        // Eligibility stats
        const eligibleDonors = donors.filter(d => isDonorEligible(d.lastDonation)).length;

        const stats = {
            totalDonors: donors.length,
            totalHospitals: hospitals.length,
            totalDonations: donations.length,
            totalRequests: requests.length,
            eligibleDonors,
            bloodTypeDistribution: bloodTypeStats,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            approvedRequests: requests.filter(r => r.status === 'approved').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🩸 Blood Bank Management System running on port ${PORT}`);
    console.log(`📱 Access the application at: http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api`);
    console.log('\n🔑 Demo Login Credentials:');
    console.log('   Admin: admin@bloodbank.com / admin123');
    console.log('   Donor: john.doe@email.com / donor123');
    console.log('   Hospital: contact@cityhospital.com / hospital123');
});

module.exports = app;