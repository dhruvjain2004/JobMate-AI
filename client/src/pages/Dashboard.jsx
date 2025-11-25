import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { companyData, setCompanyData , setCompanyToken } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  //Function to logout for company

  const logout = ()=>{
    setCompanyToken(null);
    localStorage.removeItem('companyToken');
    setCompanyData(null);
    navigate('/');
  }


  
  useEffect(() => {
    // Remove redirect logic so dashboard is always accessible
  }, []);


  return (
    <div className="min-h-screen">
      {/* Navbar for Recruiter Panel */}
      <div className="shadow py-4">
        <div className="px-2 sm:px-5 flex justify-between items-center">
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/') }>
            <img src={assets.vite_logo} alt="NaukriVerse Symbol" height={40} width={40} />
            <span className="font-bold text-xl ml-2">NaukriVerse</span>
          </div>
          {companyData && (
            <div className="flex items-center gap-3">
              <p className="max-sm:hidden">Welcome, {companyData.name}</p>
              <div className="relative group">
                <img
                  className="w-8 border rounded-full"
                  src={companyData.image}
                  alt=""
                />
                <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12">
                  <ul className="list-none m-0 p-2 bg-white rounded-md border text-sm">
                    <li onClick={logout} className="py-1 px-2 cursor-pointer pr-10">Logout</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Sidebar toggle for mobile */}
          <button className="sm:hidden ml-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start">
        {/* Left side bar with option to add job, manage jobs view applications*/}
        <div className={`sm:inline-block min-h-screen border-r-2 bg-white w-full sm:w-auto ${sidebarOpen ? '' : 'hidden'} sm:block absolute sm:static z-40 top-16 left-0`}>
          <ul className="flex flex-col items-start pt-5 text-gray-800 w-full sm:w-auto">
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 w-full gap-2 hover:bg-gray-100 ${
                  isActive && "bg-blue-100 border-r-4 border-blue-400"
                }`
              }
              to={"/dashboard/add-job"}
              onClick={() => setSidebarOpen(false)}
            >
              <img className="min-w-4" src={assets.add_icon} alt="" />
              <p className="max-sm:hidden">Add Job</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 w-full gap-2 hover:bg-gray-100 ${
                  isActive && "bg-blue-100 border-r-4 border-blue-400"
                }`
              }
              to={"/dashboard/manage-jobs"}
              onClick={() => setSidebarOpen(false)}
            >
              <img className="min-w-4" src={assets.home_icon} alt="" />
              <p className="max-sm:hidden">Manage Jobs</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 w-full gap-2 hover:bg-gray-100 ${
                  isActive && "bg-blue-100 border-r-4 border-blue-400"
                }`
              }
              to={"/dashboard/view-applications"}
              onClick={() => setSidebarOpen(false)}
            >
              <img className="min-w-4" src={assets.person_tick_icon} alt="" />
              <p className="max-sm:hidden">View Applications</p>
            </NavLink>
          </ul>
        </div>

        <div className="flex-1 h-full p-2 sm:p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;