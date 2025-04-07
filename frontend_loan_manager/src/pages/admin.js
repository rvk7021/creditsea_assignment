import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    // State for active tab and pagination
    const [activeTab, setActiveTab] = useState('applications');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // State for storing backend data
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({});

    // State for admin form
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        username: '',
        password: '',
        name: '',
        email: ''
    });

    const token = localStorage.getItem('token');

    // Fetch data from backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch metrics
                const metricsRes = await fetch('http://localhost:4000/api/admin/metrics', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const metricsData = await metricsRes.json();
                // Set metrics with the correct property names from the API response
                setMetrics(metricsData.metrics || {});

                // Fetch applications
                const appRes = await fetch('http://localhost:4000/api/admin/loan-applications', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const appData = await appRes.json();
                // Make sure we're setting an array
                setApplications(Array.isArray(appData) ? appData : (appData.applications || []));

                // Fetch users
                const userRes = await fetch('http://localhost:4000/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const userData = await userRes.json();
                setUsers(Array.isArray(userData) ? userData : (userData.users || []));

                // Fetch officers
                const officerRes = await fetch('http://localhost:4000/api/admin/officers', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                const officerData = await officerRes.json();
                setOfficers(Array.isArray(officerData) ? officerData : (officerData.officers || []));

                // Fetch admins
                const adminRes = await fetch('http://localhost:4000/api/admin/admin', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const adminData = await adminRes.json();
                console.log('Admin Data:', adminData); // Debugging line
                if (!adminData) {
                    console.error('No admin data found');
                }
                setAdmins(adminData.Newadmins || []);

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApplications = Array.isArray(applications) ? applications.slice(indexOfFirstItem, indexOfLastItem) : [];
    const totalPages = Math.ceil((Array.isArray(applications) ? applications.length : 0) / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle loan approval/rejection
    const handleLoanAction = async (loanId, action) => {
        action = action.toLowerCase();
        if(action==='approve'){
            action = 'approved';
        }else if(action ==='reject'){
            action = 'rejected';
        }
        const response = await fetch(`http://localhost:4000/api/admin/approve-reject`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                applicationId: loanId,
                action
            })

        }
        )
        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Failed to update loan status');
            throw new Error(data.message || 'Failed to update loan status');
        }
        alert(`Loan ${action}ed successfully!`);
        console.log(`Loan ${action}ed successfully:`, data);
        // Refetch applications to update the list

    };

    // Handle admin deletion
    const handleDeleteAdmin = async (adminId) => {
        console.log(`Delete admin ${adminId} clicked`);
        try {
            const response = await fetch(`http://localhost:4000/api/admin/${adminId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE',
            })
            const data = await response.json();
            if (!response.ok) {
                alert(data.message || 'Failed to delete admin');
                throw new Error(data.message || 'Failed to delete admin');
            }
            alert('Admin deleted successfully!');
            console.log('Admin deleted successfully:', data);

        } catch (error) {
            alert('Failed to delete admin');
            console.error('Error deleting admin:', error);

        }
        // You will implement the actual API call here
    };

    // Handle admin form submission
    const handleAdminFormSubmit = async (e) => {
        e.preventDefault();
        console.log('Admin form submitted:', newAdmin);
        try {
            const response = await fetch('http://localhost:4000/api/admin/signup', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(newAdmin),
            })
            const data = await response.json();
            if (!response.ok) {
                alert(data.message || 'Failed to create admin');
                throw new Error(data.message || 'Failed to create admin');
            }
            alert('Admin created successfully!');
            console.log('Admin created successfully:', data);
        }
        catch (err) {
            console.error('Error creating admin:', err);
        }
        setShowAdminForm(false);
        setNewAdmin({
            username: '',
            password: '',
            name: '',
            email: ''
        });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 shadow-lg px-8 py-5 flex items-center justify-between backdrop-blur-sm bg-opacity-90">
                {/* Brand Logo - Left */}
                <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 10h11M9 21V3M21 14H10m6-11v18" />
                    </svg>
                    <a href="/" className="text-white text-2xl font-extrabold tracking-wide">CreditSea</a>
                </div>

                {/* Centered Navigation Links */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-10">
                    <a
                        href="/"
                        className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300 border-b-2 border-transparent hover:border-indigo-200 pb-1"
                    >
                        Home
                    </a>
                    <a
                        href="/loans"
                        className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300 border-b-2 border-transparent hover:border-indigo-200 pb-1"
                    >
                        Loans
                    </a>
                    <a
                        href="/contact"
                        className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300 border-b-2 border-transparent hover:border-indigo-200 pb-1"
                    >
                        Contact
                    </a>
                </div>

                {/* Admin User - Right */}
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center">
                        <span className="text-indigo-800 font-bold">A</span>
                    </div>
                    <span className="text-white font-medium">Admin</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-24 px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-indigo-900 mb-8">Admin Dashboard</h1>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Total Applications</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalLoanApplications || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Total Users</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalUsers || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Total Officers</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalOfficers || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Cash Disbursed</h3>
                            <p className="text-2xl font-bold text-indigo-700">₹ {metrics.totalCashdisbursements || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Cash Received</h3>
                            <p className="text-2xl font-bold text-indigo-700">₹ {metrics.totalCashRecieved || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Approved Loans</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalApprovedLoans || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Rejected Loans</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalRejectedLoans || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Pending Loans</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalPendingLoans || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Repaid Loans</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalRepaidLoans || 0}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-medium text-gray-500">Total Borrowers</h3>
                            <p className="text-2xl font-bold text-indigo-700">{metrics.totalBorrowers || 0}</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            className={`px-6 py-3 font-medium ${activeTab === 'applications' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            Loan Applications
                        </button>
                        <button
                            className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`px-6 py-3 font-medium ${activeTab === 'officers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                            onClick={() => setActiveTab('officers')}
                        >
                            Officers
                        </button>
                        <button
                            className={`px-6 py-3 font-medium ${activeTab === 'admins' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                            onClick={() => setActiveTab('admins')}
                        >
                            Admins
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading data...</p>
                            </div>
                        ) : (
                            <>
                                {/* Applications Tab */}
                                {activeTab === 'applications' && (
                                    <div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenure</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {currentApplications.length > 0 ? (
                                                        currentApplications.map((app) => (
                                                            <tr key={app._id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.fullName}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                    ₹{typeof app.loanAmount === 'number' ? app.loanAmount.toLocaleString() : app.loanAmount}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.loanTenureMonths} months</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.reason}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                            'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(app.createdAt)}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    {app.status === 'pending' && (
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                onClick={() => handleLoanAction(app._id, 'approve')}
                                                                                className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition"
                                                                            >
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleLoanAction(app._id, 'reject')}
                                                                                className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                                No applications found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {Array.isArray(applications) && applications.length > 0 && (
                                            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                                <div>
                                                    <p className="text-sm text-gray-700">
                                                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">
                                                            {indexOfLastItem > applications.length ? applications.length : indexOfLastItem}
                                                        </span> of <span className="font-medium">{applications.length}</span> applications
                                                    </p>
                                                </div>
                                                <div>
                                                    <nav className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1}
                                                            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        >
                                                            Previous
                                                        </button>
                                                        {[...Array(totalPages).keys()].map(number => (
                                                            <button
                                                                key={number + 1}
                                                                onClick={() => paginate(number + 1)}
                                                                className={`px-3 py-1 rounded-md ${currentPage === number + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                {number + 1}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                                            disabled={currentPage === totalPages || totalPages === 0}
                                                            className={`px-3 py-1 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        >
                                                            Next
                                                        </button>
                                                    </nav>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Users Tab */}
                                {activeTab === 'users' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Loans</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {users.length > 0 ? (
                                                    users.map((user) => (
                                                        <tr key={user._id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || user.user}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.contactNumber}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.address}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {user.assignedOfficer ? user.assignedOfficer : 'Not Assigned'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {user.loans ? user.loans.length : 0}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {formatDate(user.createdAt)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                            No users found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Officers Tab */}
                                {activeTab === 'officers' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disbursed</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {officers.length > 0 ? (
                                                    officers.map((officer) => (
                                                        <tr key={officer._id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{officer.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{officer.employeeId}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{officer.contactNumber}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{officer.designation}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {officer.metrics?.totalApplications || 0}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                ₹{officer.metrics?.totalDisbursedAmount ? officer.metrics.totalDisbursedAmount.toLocaleString() : 0}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                            No officers found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Admins Tab */}
                                {activeTab === 'admins' && (
                                    <div>
                                        <div className="p-6 flex justify-end">
                                            <button
                                                onClick={() => setShowAdminForm(true)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                            >
                                                Add Admin
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {admins.length > 0 ? (
                                                        admins.map((admin) => (
                                                            <tr key={admin._id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.username}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.email}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(admin.createdAt)}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    <button
                                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                                No admins found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Form Modal */}
            {showAdminForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Add New Admin</h3>
                            <button
                                onClick={() => setShowAdminForm(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAdminFormSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newAdmin.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newAdmin.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newAdmin.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newAdmin.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminForm(false)}
                                    className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                    onSubmit={handleAdminFormSubmit}
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;