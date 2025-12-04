import React, { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations } from "../assets/assets";
import JobCard from "./JobCard";

const JobListing = () => {
  const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- Filter States ---
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState("All"); // New State

  const [filteredJobs, setFilteredJobs] = useState(jobs);

  const jobListRef = useRef(null);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleLocationChange = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location) ? prev.filter((c) => c !== location) : [...prev, location]
    );
  };

  // New: Handle Date Change
  const handleDateChange = (range) => {
    setSelectedDateRange(range);
  };

  useEffect(() => {
    let filtered = jobs.slice().reverse();

    // 1. Filter by Category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((job) => selectedCategories.includes(job.category));
    }

    // 2. Filter by Location
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((job) => selectedLocations.includes(job.location));
    }

    // 3. Filter by Date (New Logic)
    if (selectedDateRange !== "All") {
      const now = new Date();
      filtered = filtered.filter((job) => {
        // Convert job.date to a Date object. 
        // NOTE: Ensure your job data has a 'date' property (timestamp or date string).
        const jobDate = new Date(Number(job.date)); 
        
        const diffInMs = now - jobDate;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInHours / 24;

        switch (selectedDateRange) {
          case "24h":
            return diffInHours <= 24; // Last 24 hours
          case "7d":
            return diffInDays <= 7;   // Last 7 days
          case "30d":
            return diffInDays <= 30;  // Last 30 days
          default:
            return true;
        }
      });
    }

    // 4. Filter by Search Bar (Title/Location)
    const titleSearch = searchFilter.title ? searchFilter.title.trim().toLowerCase() : "";
    const locationSearch = searchFilter.location ? searchFilter.location.trim().toLowerCase() : "";
    
    if (isSearched && (titleSearch || locationSearch)) {
      filtered = filtered.filter((job) => {
        const titleMatch = titleSearch ? job.title.toLowerCase().includes(titleSearch) : true;
        const locationMatch = locationSearch ? job.location.toLowerCase().includes(locationSearch) : true;
        
        // Optional: Check company name if 'title' search is meant to cover that too
        // const companyMatch = job.companyId?.name.toLowerCase().includes(titleSearch);

        return titleMatch && locationMatch;
      });
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, selectedCategories, selectedLocations, selectedDateRange, searchFilter, isSearched]);

  // Reset filters when search is cleared
  useEffect(() => {
    if (!isSearched && selectedCategories.length === 0 && selectedLocations.length === 0 && selectedDateRange === 'All') {
      setFilteredJobs(jobs.slice().reverse());
    }
  }, [isSearched, jobs]);

  // Pagination Logic
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (jobListRef.current) {
      jobListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const jobsPerPage = 12;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-4 sm:py-8">
      
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 p-2 sm:p-4 bg-white">
        
        {/* Current Search Filters (Tags) */}
        {isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
          <>
            <h3 className="font-medium text-base sm:text-lg mb-4">Current Search</h3>
            <div className="mb-4 text-gray-600 text-xs sm:text-base">
              {searchFilter.title && (
                <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-2 sm:px-4 py-1.5 rounded">
                  {searchFilter.title}
                  <img onClick={() => setSearchFilter((prev) => ({ ...prev, title: "" }))} className="cursor-pointer" src={assets.cross_icon} alt="" />
                </span>
              )}
              {searchFilter.location && (
                <span className="ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-2 sm:px-4 py-1.5 rounded">
                  {searchFilter.location}
                  <img onClick={() => setSearchFilter((prev) => ({ ...prev, location: "" }))} className="cursor-pointer" src={assets.cross_icon} alt="" />
                </span>
              )}
            </div>
          </>
        )}

        {/* Mobile Filter Toggle Button */}
        <button onClick={() => setShowFilter((prev) => !prev)} className="px-6 py-1.5 rounded border border-gray-400 lg:hidden mb-2 text-xs">
          {showFilter ? "Close" : "Filters"}
        </button>

        {/* 1. Category Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-medium text-base sm:text-lg py-4">Search by Categories</h4>
          <ul className="space-y-2 sm:space-y-4 text-gray-600 text-xs sm:text-base">
            {JobCategories.map((category, index) => (
              <li className="flex gap-3 items-center" key={index}>
                <input 
                  onChange={() => handleCategoryChange(category)} 
                  checked={selectedCategories.includes(category)}
                  className="scale-110 sm:scale-125 accent-blue-500" 
                  type="checkbox" 
                />
                {category}
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Location Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-medium text-base sm:text-lg py-4 pt-8 sm:pt-14">Search by Location</h4>
          <ul className="space-y-2 sm:space-y-4 text-gray-600 text-xs sm:text-base">
            {JobLocations.map((location, index) => (
              <li className="flex gap-3 items-center" key={index}>
                <input 
                  onChange={() => handleLocationChange(location)} 
                  checked={selectedLocations.includes(location)}
                  className="scale-110 sm:scale-125 accent-blue-500" 
                  type="checkbox" 
                />
                {location}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. NEW: Search by Date Filter */}
        <div className={showFilter ? "" : "max-lg:hidden"}>
          <h4 className="font-medium text-base sm:text-lg py-4 pt-8 sm:pt-14">Search by Job Date</h4>
          <ul className="space-y-2 sm:space-y-4 text-gray-600 text-xs sm:text-base">
             {/* All Time */}
             <li className="flex gap-3 items-center">
                <input 
                  className="scale-110 sm:scale-125 accent-blue-500" 
                  type="radio" 
                  name="dateFilter"
                  value="All"
                  onChange={() => handleDateChange("All")}
                  checked={selectedDateRange === "All"}
                />
                All Time
              </li>

              {/* Last 24 Hours */}
              <li className="flex gap-3 items-center">
                <input 
                  className="scale-110 sm:scale-125 accent-blue-500" 
                  type="radio" 
                  name="dateFilter"
                  value="24h"
                  onChange={() => handleDateChange("24h")}
                  checked={selectedDateRange === "24h"}
                />
                Last 24 Hours
              </li>

              {/* Last 7 Days */}
              <li className="flex gap-3 items-center">
                <input 
                  className="scale-110 sm:scale-125 accent-blue-500" 
                  type="radio" 
                  name="dateFilter"
                  value="7d"
                  onChange={() => handleDateChange("7d")}
                  checked={selectedDateRange === "7d"}
                />
                Last 7 Days
              </li>

              {/* Last Month */}
              <li className="flex gap-3 items-center">
                <input 
                  className="scale-110 sm:scale-125 accent-blue-500" 
                  type="radio" 
                  name="dateFilter"
                  value="30d"
                  onChange={() => handleDateChange("30d")}
                  checked={selectedDateRange === "30d"}
                />
                Last Month
              </li>
          </ul>
        </div>
      </div>

      {/* Main Content: Job List */}
      <section ref={jobListRef} className="w-full lg:w-3/4 text-gray-800 max-lg:px-2 sm:max-lg:px-4">
        <h3 className="font-medium text-2xl sm:text-3xl py-2">Latest Jobs</h3>
        <p className="mb-4 sm:mb-8 text-xs sm:text-base">Get your desired job from top companies</p>
        
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {paginatedJobs.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-10">No jobs found.</div>
          ) : (
            paginatedJobs.map((job, index) => (
              <JobCard key={index} job={job} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button 
              className="px-3 py-1 border rounded disabled:opacity-50" 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i + 1} 
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`} 
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="px-3 py-1 border rounded disabled:opacity-50" 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobListing;