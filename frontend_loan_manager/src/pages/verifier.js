import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Cookies from 'universal-cookie';
export const OfficerDashboard = () => {
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalBorrowers, setTotalBorrowers] = useState(0);
  const [totalDisbursedAmount, setTotalDisbursedAmount] = useState(0);
  const [totalRepaidAmount, setTotalRepaidAmount] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [completedApplications, setCompletedApplications] = useState(0);
  const [repaidApplications, setRepaidApplications] = useState(0);
  const [loanApplications, setLoanApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 5;
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const officerId = "67f2863e93414f5c29fbd6d4";
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch metrics
        const metricsRes = await fetch('http://localhost:4000/api/officer/update-metrics',{
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!metricsRes.ok) throw new Error('Failed to fetch metrics');
        const metricsData = await metricsRes.json();
        const metrics = metricsData.metrics;

        // Update state with metrics
        setTotalApplications(metrics.totalApplications);
        setTotalBorrowers(metrics.totalBorrowers);
        setTotalDisbursedAmount(metrics.totalDisbursedAmount);
        setTotalRepaidAmount(metrics.totalRepaidAmount);
        setPendingApplications(metrics.pendingApplications);
        setCompletedApplications(metrics.completedApplications);
        setRepaidApplications(metrics.repaidApplications);

        // Fetch loan applications
        const appsRes = await fetch('http://localhost:4000/api/officer/loan-applications',
          {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!appsRes.ok) throw new Error('Failed to fetch loan applications');
        const applicationsData = await appsRes.json();
        setLoanApplications(applicationsData.applications || []);
        setFilteredApplications(applicationsData.applications || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let result = [...loanApplications];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      result = result.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, loanApplications]);

  // Pagination logic
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-indigo-100 text-indigo-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'repaid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Function to handle loan application approval or rejection
  const handleApplicationAction = async (applicationId, action) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const payload = {
        applicationId: applicationId,
        action: action, // "approved" or "rejected"
        officerId: officerId,
        note: action === "approved" 
          ? "The loan has been approved based on the conditions." 
          : "The loan has been rejected due to not meeting requirements."
      };
      console.log("Payload for action:", payload);
      const response = await fetch('http://localhost:4000/api/officer/action', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} application`);
      }
      
      const result = await response.json();
      
      // Update the application status in local state
      const updatedApplications = loanApplications.map(app => 
        app._id === applicationId ? { ...app, status: action } : app
      );
      
      setLoanApplications(updatedApplications);
      
      // Update metrics
      if (action === "approved") {
        setCompletedApplications(prev => prev + 1);
        setPendingApplications(prev => prev - 1);
      } else if (action === "rejected") {
        setPendingApplications(prev => prev - 1);
      }
      
      setSuccessMessage(`Application successfully ${action}`);
      
      // Refetch metrics to ensure everything is up to date
      const metricsRes = await fetch('http://localhost:4000/api/officer/update-metrics',
        {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        const metrics = metricsData.metrics;
        
        setTotalApplications(metrics.totalApplications);
        setTotalBorrowers(metrics.totalBorrowers);
        setTotalDisbursedAmount(metrics.totalDisbursedAmount);
        setTotalRepaidAmount(metrics.totalRepaidAmount);
        setPendingApplications(metrics.pendingApplications);
        setCompletedApplications(metrics.completedApplications);
        setRepaidApplications(metrics.repaidApplications);
      }
      
    } catch (error) {
      console.error('Error updating application status:', error);
      setError(`Failed to ${action} application. Please try again.`);
    } finally {
      setLoading(false);
      
      // Clear success/error messages after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 pt-24">
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
            className="text-white text-sm font-medium hover:text-indigo-200 transition duration-300 border-b-2 border-indigo-200 pb-1"
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
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">Officer Dashboard</h1>
        
        {/* Status Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard title="Total Applications" value={totalApplications} bgColor="bg-indigo-600" textColor="text-white" />
          <MetricCard title="Pending" value={pendingApplications} bgColor="bg-blue-600" textColor="text-white" />
          <MetricCard title="Completed" value={completedApplications} bgColor="bg-indigo-500" textColor="text-white" />
          <MetricCard title="Repaid" value={repaidApplications} bgColor="bg-blue-500" textColor="text-white" />
          <MetricCard title="Total Borrowers" value={totalBorrowers} bgColor="bg-indigo-400" textColor="text-white" />
          <MetricCard title="Total Disbursed" value={formatCurrency(totalDisbursedAmount)} bgColor="bg-blue-400" textColor="text-white" />
          <MetricCard title="Total Repaid" value={formatCurrency(totalRepaidAmount)} bgColor="bg-indigo-300" textColor="text-indigo-900" />
          <MetricCard 
            title="Repayment Rate" 
            value={totalDisbursedAmount > 0 ? `${Math.round((totalRepaidAmount / totalDisbursedAmount) * 100)}%` : "0%"} 
            bgColor="bg-blue-300" 
            textColor="text-blue-900" 
          />
        </div>
        
        {/* Filter and Search */}
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-md ${statusFilter === 'pending' ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-md ${statusFilter === 'approved' ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-md ${statusFilter === 'rejected' ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
            >
              Rejected
            </button>
            <button 
              onClick={() => setStatusFilter('repaid')}
              className={`px-4 py-2 rounded-md ${statusFilter === 'repaid' ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 border border-indigo-300'}`}
            >
              Repaid
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-indigo-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="pl-10 pr-4 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Applications Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-indigo-100">
          <table className="min-w-full divide-y divide-indigo-200">
            <thead className="bg-indigo-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Loan Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-indigo-100">
              {currentApplications.map((application) => (
                <tr key={application._id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                        <span className="font-medium">{application.fullName.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-900">{application.fullName}</div>
                        <div className="text-sm text-indigo-500">{application._id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-indigo-900">{formatCurrency(application.loanAmount)}</div>
                    <div className="text-sm text-indigo-600">{application.loanTenureMonths} months · {application.reason}</div>
                    <div className="text-xs text-indigo-400">{application.employmentStatus}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500">
                    {formatDate(application.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button 
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition duration-150"
                          onClick={() => handleApplicationAction(application._id, "approved")}
                          disabled={loading}
                        >
                          {loading && application._id === "67f273080a2779aa46e8eb3f" ? "Processing..." : "Approve"}
                        </button>
                        <button 
                          className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition duration-150"
                          onClick={() => handleApplicationAction(application._id, "rejected")}
                          disabled={loading}
                        >
                          {loading && application._id === "67f273080a2779aa46e8eb3f" ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    )}
                    {application.status !== 'pending' && (
                      <span className="text-indigo-300">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
              {currentApplications.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-indigo-500">
                    No applications found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filteredApplications.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-indigo-100 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-indigo-700">
                    Showing <span className="font-medium">{indexOfFirstApp + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastApp, filteredApplications.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredApplications.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          page === currentPage
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-indigo-300 bg-white text-indigo-600 hover:bg-indigo-50"
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-indigo-300 bg-white text-sm font-medium text-indigo-500 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-lg shadow-md p-6`}>
    <p className="text-sm font-medium text-white opacity-80 mb-1">{title}</p>
    <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
  </div>
);

export default OfficerDashboard;