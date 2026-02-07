import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { backendUrl, setUserToken, setCompanyToken, setCompanyData, setShowRecruiterLogin } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, formData);
      if (data.success) {
        toast.success(data.message);
        // Clear recruiter login state
        setCompanyToken(null);
        setCompanyData(null);
        setShowRecruiterLogin(false);
        localStorage.removeItem('companyToken');
        // Set user token
        setUserToken(data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/google`, {
        credential: credentialResponse.credential,
      });
      if (data.success) {
        toast.success("Signed in with Google");
        // Clear recruiter login state
        setCompanyToken(null);
        setCompanyData(null);
        setShowRecruiterLogin(false);
        localStorage.removeItem('companyToken');
        // Set user token
        setUserToken(data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleGoogleError = () => toast.error("Google sign-in failed. Try again.");

  const resetOtpState = () => {
    setOtpEmail("");
    setOtp("");
    setOtpSent(false);
    setOtpLoading(false);
  };

  const toggleOtpMode = () => {
    setOtpMode((prev) => !prev);
    resetOtpState();
  };

  const requestOtp = async () => {
    if (!otpEmail) {
      toast.error("Enter your registered email.");
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/request-otp`, { email: otpEmail });
      if (data.success) {
        toast.success(data.message);
        if (data.otp) {
          toast.info(`Dev OTP: ${data.otp}`);
        }
        setOtpSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      toast.error("Please request an OTP first.");
      return;
    }
    if (!otp) {
      toast.error("Enter the OTP sent to your email.");
      return;
    }
    setOtpLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email: otpEmail,
        otp,
      });
      if (data.success) {
        toast.success(data.message);
        // Clear recruiter login state
        setCompanyToken(null);
        setCompanyData(null);
        setShowRecruiterLogin(false);
        localStorage.removeItem('companyToken');
        // Set user token
        setUserToken(data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-white via-blue-50 to-white py-10">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
          <section className="bg-white shadow-lg rounded-2xl p-8 lg:w-1/2 border border-blue-50">
            <h2 className="text-2xl font-semibold text-gray-900">New to NaukriVerse</h2>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li>• One click apply using your profile.</li>
              <li>• Get relevant job recommendations.</li>
              <li>• Showcase your profile to top companies.</li>
              <li>• Track application status in one place.</li>
            </ul>
            <Link
              to="/register"
              className="inline-block mt-8 border border-blue-500 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Register Now
            </Link>
          </section>

          <section className="bg-white shadow-lg rounded-2xl p-8 lg:w-1/2 border border-blue-50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login</h2>
            {otpMode ? (
              <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">Registered Email*</label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={otpSent}
                    required
                  />
                </div>
                {otpSent && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">OTP*</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em] text-center"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">OTP is valid for 5 minutes.</p>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  disabled={otpLoading}
                >
                  {otpLoading ? (otpSent ? "Verifying..." : "Sending...") : otpSent ? "Verify OTP" : "Send OTP"}
                </button>
                {otpSent && (
                  <button
                    type="button"
                    onClick={requestOtp}
                    className="w-full border border-blue-300 text-blue-600 py-3 rounded-lg"
                    disabled={otpLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email ID*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email ID"
                    className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                    className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}
            <button
              className="w-full mt-4 border border-blue-300 text-blue-600 py-3 rounded-lg"
              onClick={toggleOtpMode}
            >
              {otpMode ? "Use Password to Login" : "Use OTP to Login"}
            </button>
            <div className="mt-6 flex flex-col items-center gap-3">
              <span className="text-gray-500 text-sm">Continue with</span>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold">
                Register
              </Link>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;

