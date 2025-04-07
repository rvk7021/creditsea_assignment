import React, { useState } from 'react';
const LoanApplication = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        loanAmount: '',
        loanTenure: '',
        employmentStatus: '',
        reason: '',
        employmentAddress1: '',
        employmentAddress2: '',
        agreeToTerms: false
    });
    const token = localStorage.getItem('token');
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            fullName,
            loanAmount,
            loanTenure,
            employmentStatus,
            reason,
            employmentAddress1,
            employmentAddress2,
            agreeToTerms
        } = formData;

        if (
            !fullName || !loanAmount || !loanTenure || !employmentStatus ||
            !reason || !employmentAddress1 || !employmentAddress2 || !agreeToTerms
        ) {
            alert('Please fill in all fields and agree to the terms.');
            return;
        }

        const combinedEmploymentAddress = `${employmentAddress1}, ${employmentAddress2}`;

        try {
            const response = await fetch(`http://localhost:4000/api/loan/apply`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName,
                    amount: parseFloat(loanAmount),
                    tenureInMonths: parseInt(loanTenure),
                    employmentStatus,
                    reason,
                    employmentAddress: combinedEmploymentAddress,
                    agree: agreeToTerms
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit loan application');
            }

            const data = await response.json();
            console.log('Loan application submitted:', data);
            alert('Loan application submitted successfully!');
            setFormData({
                fullName: '',
                loanAmount: '',
                loanTenure: '',
                employmentStatus: '',
                reason: '',
                employmentAddress1: '',
                employmentAddress2: '',
                agreeToTerms: false
            });
        } catch (error) {
            console.error('Error submitting loan application:', error);
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">
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
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto mt-32 mb-16 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-700 to-purple-600 py-8 px-6">
                    <h1 className="text-3xl font-bold text-center text-white mb-2">APPLY FOR A LOAN</h1>
                    <p className="text-center text-indigo-100 text-sm">Fill out the form below to start your application</p>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Full Name */}
                            <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Full name as it appears on bank account
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full name as it appears on bank account"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Loan Amount */}
                            <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    How much do you need?
                                </label>
                                <input
                                    type="text"
                                    name="loanAmount"
                                    placeholder="How much do you need?"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
                                    value={formData.loanAmount}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Loan Tenure */}
                            <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Loan tenure (in months)
                                </label>
                                <input
                                    type="text"
                                    name="loanTenure"
                                    placeholder="Loan tenure in months"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
                                    value={formData.loanTenure}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Employment Status */}
                            <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Employment status
                                </label>
                                <input
                                    type="text"
                                    name="employmentStatus"
                                    placeholder="Employment status"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Reason for Loan */}
                        <div className="mb-8 transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Reason for loan
                            </label>
                            <textarea
                                name="reason"
                                placeholder="Please explain why you need this loan..."
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 h-32"
                                value={formData.reason}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Employment Address */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Employment address (line 1)
                                </label>
                                <input
                                    type="text"
                                    name="employmentAddress1"
                                    placeholder="Street address"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
                                    value={formData.employmentAddress1}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="transition-all duration-300 hover:shadow-md p-4 rounded-lg">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Employment address (line 2)
                                </label>
                                <input
                                    type="text"
                                    name="employmentAddress2"
                                    placeholder="City, State, ZIP"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
                                    value={formData.employmentAddress2}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    className="mt-1 mr-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                />
                                <span className="text-sm text-gray-700">
                                    I have read the important information and accept that by completing the application I will be bound by the terms. Any personal and credit information obtained may be disclosed from time to time to other lenders, credit bureaus or other credit reporting agencies.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                            >
                                Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoanApplication;