import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const AdminAuth = () => {
  const { backendUrl } = useContext(AppContext);
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(() => {
    const cached = localStorage.getItem("adminAuth");
    return cached ? JSON.parse(cached) : null;
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "login" : "register";
      const payload = mode === "login" ? { email: formData.email, password: formData.password } : formData;
      const { data } = await axios.post(`${backendUrl}/api/auth/admin/${endpoint}`, payload);
      if (data.success) {
        toast.success(data.message);
        localStorage.setItem("adminAuth", JSON.stringify(data.admin));
        setAdminInfo(data.admin);
        setFormData({ name: "", email: "", password: "" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminAuth");
    setAdminInfo(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-10 text-center">
          <h2 className="text-3xl font-semibold text-gray-800">Our Services</h2>
          <p className="text-gray-500 mt-2">Welcomes You</p>
          <p className="text-sm text-gray-500 mt-6">Enter your login credentials</p>

          {adminInfo ? (
            <div className="mt-8 space-y-4">
              <p className="text-gray-700">Logged in as {adminInfo.name}</p>
              <button
                onClick={logout}
                className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-200 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setMode("login")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    mode === "login" ? "bg-blue-100 text-blue-600" : "text-gray-500"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    mode === "register" ? "bg-blue-100 text-blue-600" : "text-gray-500"
                  }`}
                >
                  Register
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
                {mode === "register" && (
                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Name"
                      className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                    className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Password</label>
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
                  className="w-full bg-blue-300 text-white py-3 rounded-lg font-semibold hover:bg-blue-400 transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>
              <button className="mt-4 text-sm text-gray-500">Forgot Password</button>
              <p className="text-xs text-gray-400 mt-2">
                Not registered? Write us at <span className="underline">dhruvjain527@gmail.com</span>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminAuth;

