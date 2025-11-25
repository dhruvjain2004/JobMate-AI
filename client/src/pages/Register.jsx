import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const { backendUrl, setUserToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
    workStatus: "experienced",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateWorkStatus = (status) =>
    setFormData((prev) => ({
      ...prev,
      workStatus: status,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, formData);
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
        toast.success("Registered with Google");
        setUserToken(data.token);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleGoogleError = () => toast.error("Google sign-up failed. Try again.");

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-10">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
          <section className="bg-white shadow-lg rounded-2xl p-8 lg:w-1/3 border border-blue-50">
            <h2 className="text-2xl font-semibold text-gray-900">On registering, you can</h2>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li>• Build your profile and let recruiters reach out.</li>
              <li>• Receive job postings directly in your inbox.</li>
              <li>• Track your job search progress.</li>
            </ul>
            <p className="mt-6 text-sm text-gray-500">
              Already registered?{" "}
              <Link to="/login" className="text-blue-600 font-semibold">
                Login here
              </Link>
            </p>
          </section>

          <section className="bg-white shadow-lg rounded-2xl p-8 lg:flex-1 border border-blue-50">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Find a job & grow your career</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name*</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="What is your name?"
                  className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email ID*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Tell us your Email ID"
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
                  placeholder="Create a password for your account"
                  className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mobile Number*</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Mobile Number"
                  className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Work Status*</label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateWorkStatus("experienced")}
                    className={`border rounded-xl p-4 text-left ${
                      formData.workStatus === "experienced"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-semibold">I&apos;m Experienced</p>
                    <span className="text-sm text-gray-500">I have work experience (incl. internships)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateWorkStatus("fresher")}
                    className={`border rounded-xl p-4 text-left ${
                      formData.workStatus === "fresher"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-semibold">I&apos;m Fresher</p>
                    <span className="text-sm text-gray-500">I am a student / haven&apos;t worked after graduation</span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
            <div className="mt-6 flex flex-col items-center gap-3">
              <span className="text-gray-500 text-sm">Or continue with</span>
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;

