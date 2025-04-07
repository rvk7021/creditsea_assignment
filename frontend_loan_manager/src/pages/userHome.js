import React, { useState, useEffect } from 'react';

const CreditAppHome = () => {
    const localhost ='http://localhost:4000/api';
    // State for various data
    const [transactions, setTransactions] = useState([]);
    const [depositTransactions, setDepositTransactions] = useState([]);
    const [depositsAmount, setDepositsAmount] = useState(0);
    const [loanApplications, setLoanApplications] = useState([]);
    const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
    const [currentLoanPage, setCurrentLoanPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loanSearchTerm, setLoanSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const itemsPerPage = 5;
    const token = localStorage.getItem('token');
    
    // Handle logout function
    const handleLogout = () => {
        localStorage.clear(); // Clear all localStorage items
        window.location.href = '/'; // Redirect to home page
    };
    
    // Fetch data from API
    useEffect(() => {
        const fetchAllData = async () => {
          try {
            // Fetch Transactions
            const txRes = await fetch(`http://localhost:4000/api/transactions`, {
              credentials: 'include',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
      
            const txText = await txRes.text();
            if (!txRes.ok) throw new Error(`Transactions error: ${txText}`);
            const txData = JSON.parse(txText);
      
            const allTx = txData.transactions || [];
            setTransactions(allTx);
      
            const deposits = allTx.filter(tx => tx.type === 'deposit');
            setDepositTransactions(deposits);
            setDepositsAmount(deposits.reduce((sum, tx) => sum + tx.amount, 0));
      
            // Fetch Loan Applications
            const loanRes = await fetch(`http://localhost:4000/api/loan/applications`, {
              credentials: 'include',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
      
            const loanText = await loanRes.text();
            if (!loanRes.ok) throw new Error(`Loans error: ${loanText}`);
            const loanData = JSON.parse(loanText);
      
            setLoanApplications(loanData.loans || []);
      
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
      
        fetchAllData();
      }, []);
      

    // Get status color based on status string
    const getStatusBgColor = (status) => {
        status = status.toUpperCase();
        switch (status) {
            case 'PENDING': return 'bg-yellow-400';
            case 'APPROVED': return 'bg-indigo-600';
            case 'VERIFIED': return 'bg-green-400';
            case 'REJECTED': return 'bg-red-500';
            case 'REPAID': return 'bg-purple-500';
            default: return 'bg-gray-400';
        }
    };

    // Search filter for loans
    const filteredLoans = loanApplications.filter(loan => {
        const searchStr = loanSearchTerm.toLowerCase();
        const fullName = loan.loanApplication?.fullName?.toLowerCase() || '';
        const officerName = loan.officerName?.toLowerCase() || '';
        const loanAmount = loan.loanApplication?.loanAmount?.toString() || '';
        const status = loan.status?.toLowerCase() || '';

        return fullName.includes(searchStr) ||
            officerName.includes(searchStr) ||
            loanAmount.includes(searchStr) ||
            status.includes(searchStr);
    });

    // Filtered transactions based on active tab and search term
    const getFilteredTransactions = () => {
        let filtered = transactions;

        // First filter by tab selection
        if (activeTab === 'deposits') {
            filtered = transactions.filter(tx => tx.type === 'deposit');
        } else if (activeTab === 'transactions') {
            filtered = transactions; // All transactions
        }

        // Then apply search filter
        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.amount?.toString().includes(searchTerm) ||
                tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredTransactions = getFilteredTransactions();

    // Pagination logic for transactions
    const indexOfLastTransaction = currentTransactionPage * itemsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalTransactionPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    // Reset pagination when changing tabs
    useEffect(() => {
        setCurrentTransactionPage(1);
    }, [activeTab]);

    // Pagination logic for loan applications
    const indexOfLastLoan = currentLoanPage * itemsPerPage;
    const indexOfFirstLoan = indexOfLastLoan - itemsPerPage;
    const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
    const totalLoanPages = Math.ceil(filteredLoans.length / itemsPerPage);

    // Handle page navigation
    const nextTransactionPage = () => {
        if (currentTransactionPage < totalTransactionPages) {
            setCurrentTransactionPage(currentTransactionPage + 1);
        }
    };

    const prevTransactionPage = () => {
        if (currentTransactionPage > 1) {
            setCurrentTransactionPage(currentTransactionPage - 1);
        }
    };

    const nextLoanPage = () => {
        if (currentLoanPage < totalLoanPages) {
            setCurrentLoanPage(currentLoanPage + 1);
        }
    };

    const prevLoanPage = () => {
        if (currentLoanPage > 1) {
            setCurrentLoanPage(currentLoanPage - 1);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Tab button styling
    const getTabButtonClass = (tabName) => {
        const baseClass = "flex-1 py-4 text-center transition duration-150";
        if (activeTab === tabName) {
            return `${baseClass} bg-indigo-100 text-indigo-800 font-medium`;
        }
        return `${baseClass} hover:bg-indigo-50`;
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Header */}
            <header className="bg-indigo-700 border-b border-indigo-800 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold text-white">CREDIT APP</h1>
                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-150 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto py-8 px-4">
                {/* Balance Section */}
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center">
                        <div className="bg-indigo-600 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M6 10a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v4zm6-5a1 1 0 00-1 1v2a1 1 0 001 1h3a1 1 0 001-1V6a1 1 0 00-1-1h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">DEFECIT</p>
                            <p className="text-3xl font-bold text-indigo-600">₹0.0</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-sm text-gray-500">TOTAL DEPOSITS</p>
                        <p className="text-xl font-bold text-indigo-600">₹{depositsAmount.toLocaleString()}</p>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg mt-2 transition duration-150"
                        onClick={()=> window.location.href = '/loan-application'}
                        >
                            Get A Loan
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex mb-8 bg-white rounded-xl overflow-hidden shadow-sm">
                    <button
                        className="flex-1 py-4 text-center hover:bg-indigo-50 transition duration-150"
                        onClick={() => setActiveTab('all')}
                    >
                        Borrow Cash
                    </button>
                    <button
                        className={getTabButtonClass('transactions')}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transact
                    </button>
                    <button
                        className={getTabButtonClass('deposits')}
                        onClick={() => setActiveTab('deposits')}
                    >
                        Deposit Cash
                    </button>
                </div>

                {/* Loans Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Applied Loans</h2>
                        <div className="flex space-x-2">
                            <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
                                    <path d="M15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                </svg>
                                Sort
                            </button>
                            <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Loan Search Bar */}
                    <div className="px-6 py-3 border-b border-gray-200">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search loans by amount, name, officer or status"
                                value={loanSearchTerm}
                                onChange={(e) => setLoanSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SR No.
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Applicant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tenure
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Officer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Repaid Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Applied
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentLoans.length > 0 ? (
                                currentLoans.map((loan, index) => (
                                    <tr key={loan._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {indexOfFirstLoan + index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {loan.loanApplication?.fullName || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ₹{loan.loanApplication?.loanAmount?.toLocaleString() || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {loan.loanApplication?.loanTenureMonths || 'N/A'} months
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {loan.officerName || 'Not Assigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ₹{loan.loanApplication?.repaidAmount?.toLocaleString() || '0'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {loan.createdAt ? formatDate(loan.createdAt) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusBgColor(loan.status || 'pending')}`}>
                                                {(loan.status || 'pending').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No loan applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex items-center">
                            <p className="text-sm text-gray-700">
                                Rows per page:
                                <select className="ml-1 border-none bg-transparent text-gray-700">
                                    <option>5</option>
                                </select>
                            </p>
                        </div>
                        <div className="flex items-center">
                            <p className="text-sm text-gray-700">
                                {indexOfFirstLoan + 1}-{Math.min(indexOfLastLoan, filteredLoans.length)} of {filteredLoans.length}
                            </p>
                            <nav className="ml-4 flex items-center">
                                <button
                                    onClick={prevLoanPage}
                                    disabled={currentLoanPage === 1}
                                    className={`px-2 py-1 rounded-md border border-gray-300 ${currentLoanPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextLoanPage}
                                    disabled={currentLoanPage === totalLoanPages}
                                    className={`ml-2 px-2 py-1 rounded-md border border-gray-300 ${currentLoanPage === totalLoanPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">
                            {activeTab === 'deposits' ? 'Deposits' :
                                activeTab === 'transactions' ? 'All Transactions' : 'Recent Transactions'}
                        </h2>
                        <div className="flex space-x-2">
                            <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Transaction Search Bar */}
                    <div className="px-6 py-3 border-b border-gray-200">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search transactions by amount or type"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                {activeTab === 'deposits' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan ID
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentTransactions.length > 0 ? (
                                currentTransactions.map((tx, index) => (
                                    <tr key={tx._id || index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{tx._id ? tx._id.substring(0, 8) : `TX-${index + 1}`}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">₹{tx.amount ? tx.amount.toLocaleString() : 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${tx.type === 'deposit' ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                                                {tx.type ? tx.type.toUpperCase() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{tx.date ? formatDate(tx.date) : 'N/A'}</div>
                                        </td>
                                        {activeTab === 'deposits' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {tx.loanId ? tx.loanId.substring(0, 8) : 'N/A'}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={activeTab === 'deposits' ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex items-center">
                            <p className="text-sm text-gray-700">
                                Rows per page:
                                <select className="ml-1 border-none bg-transparent text-gray-700">
                                    <option>5</option>
                                </select>
                            </p>
                        </div>
                        <div className="flex items-center">
                            <p className="text-sm text-gray-700">
                                {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length}
                            </p>
                            <nav className="ml-4 flex items-center">
                                <button
                                    onClick={prevTransactionPage}
                                    disabled={currentTransactionPage === 1}
                                    className={`px-2 py-1 rounded-md border border-gray-300 ${currentTransactionPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextTransactionPage}
                                    disabled={currentTransactionPage === totalTransactionPages}
                                    className={`ml-2 px-2 py-1 rounded-md border border-gray-300 ${currentTransactionPage === totalTransactionPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    };
    
    export default CreditAppHome;