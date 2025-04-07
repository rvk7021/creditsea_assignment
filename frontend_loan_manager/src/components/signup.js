import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked", formData);
    console.log("Form data:", formData);
    
    setIsLoading(true);
    setStatus(null);
    
    try {
      const response = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      console.log("Server response:", data);
      
      if (response.ok) {
        setStatus('success');
        
        // Show success animation for 1.5 seconds before navigating
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setStatus('error');
        setTimeout(() => {
          setStatus(null);
          alert(data.message || "Something went wrong!");
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus('error');
      setTimeout(() => {
        setStatus(null);
        alert("Failed to submit. Please try again later.");
      }, 1500);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative">
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white/70 group-hover:text-white transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>

        {/* CreditSea Logo and Title */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-blue-400 mr-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              CreditSea
            </h1>
          </div>
          <p className="text-white/70 text-sm">Create your CreditSea account</p>
        </div>

        {/* Sign Up Form */}
        <form
          onSubmit={handleSubmit}
          className="px-8 pb-8 space-y-4"
        >
          <div className="relative group">
            <input
              required
              type="text"
              id="name"
              name="name"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-white/50"
              disabled={isLoading}
            />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative group">
            <input
              required
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder="E-mail"
              onChange={handleChange}
              className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-white/50"
              disabled={isLoading}
            />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative group">
            <input
              required
              type="password"
              id="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
              className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-white/50"
              disabled={isLoading}
            />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative group">
            <input
              required
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              placeholder="Contact Number"
              onChange={handleChange}
              className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-white/50"
              disabled={isLoading}
            />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="relative group">
            <textarea
              required
              id="address"
              name="address"
              value={formData.address}
              placeholder="Address"
              onChange={handleChange}
              rows="3"
              className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl border border-white/20
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-white/50 resize-none"
              disabled={isLoading}
            ></textarea>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3.5 rounded-xl shadow-xl transition-all duration-300 
            relative overflow-hidden ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : status === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-2xl'
            }`}
          >
            <span className="relative z-10 flex justify-center items-center">
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : status === 'success' ? (
                <svg className="w-5 h-5 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : status === 'error' ? (
                <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : null}
              {isLoading ? 'Processing...' : 
               status === 'success' ? 'Success!' : 
               status === 'error' ? 'Failed!' : 'Sign Up'}
            </span>
            {!isLoading && status === null && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="px-8 pb-8 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link
              to="/sign-in"
              className="text-blue-400 font-semibold hover:text-purple-400 transition-colors duration-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}