import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const inputClasses =
  "w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("Login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData, setUserToken, logoutUser } =
    useContext(AppContext);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    setLogo(file || null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (mode === "Login") {
        const { data } = await axios.post(backendUrl + "/api/company/login", {
          email,
          password,
        });
        if (data.success) {
          // Clear user login state
          logoutUser();
          setUserToken(null);
          localStorage.removeItem('userToken');
          // Set recruiter state
          setCompanyData(data.company);
          setCompanyToken(data.token);
          localStorage.setItem("companyToken", data.token);
          setShowRecruiterLogin(false);
          navigate("/dashboard");
        } else {
          toast.error(data.message);
        }
      } else {
        if (!logo) {
          toast.error("Please upload a company logo.");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("name", name);
        formData.append("password", password);
        formData.append("email", email);
        formData.append("image", logo);

        const { data } = await axios.post(backendUrl + "/api/company/register", formData);
        if (data.success) {
          // Clear user login state
          logoutUser();
          setUserToken(null);
          localStorage.removeItem('userToken');
          // Set recruiter state
          setCompanyData(data.company);
          setCompanyToken(data.token);
          localStorage.setItem("companyToken", data.token);
          setShowRecruiterLogin(false);
          navigate("/dashboard");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          onClick={() => setShowRecruiterLogin(false)}
        >
          ×
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Recruiter {mode}</h2>
          <p className="mt-2 text-sm text-gray-500">Welcome back! Please sign in to continue</p>
        </div>

        <form onSubmit={onSubmitHandler} className="mt-6 space-y-4">
          {mode === "Sign Up" && (
            <>
              <div>
                <label className="text-sm text-gray-600">Company Name</label>
                <input
                  className={`${inputClasses} mt-2`}
                  type="text"
                  placeholder="Enter company name"
                  required={mode === "Sign Up"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Company Logo</label>
                <label className="mt-2 flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                  {logo ? logo.name : "Upload logo"}
                  <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                </label>
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-gray-600">Email ID</label>
            <input
              className={`${inputClasses} mt-2`}
              type="email"
              placeholder="Enter email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              className={`${inputClasses} mt-2`}
              type="password"
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "Login" && (
            <button type="button" className="w-full text-left text-sm text-blue-500">
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-blue-600 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (mode === "Login" ? "Logging in..." : "Creating account...") : mode === "Login" ? "login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          {mode === "Login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className="font-semibold text-blue-500"
            onClick={() => setMode(mode === "Login" ? "Sign Up" : "Login")}
          >
            {mode === "Login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RecruiterLogin;