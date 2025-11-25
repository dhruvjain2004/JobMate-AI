import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { backendUrl, setUserToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
            <button className="w-full mt-4 border border-blue-300 text-blue-600 py-3 rounded-lg">
              Use OTP to Login
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

