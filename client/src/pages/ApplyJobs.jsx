import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import { assets } from "../assets/assets";
import kconvert from "k-convert";
import moment from "moment";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const ApplyJobs = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const { jobs, backendUrl, userData, userApplications, fetchUserApplications, userToken } =
    useContext(AppContext);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`);
      if (data.success) {
        setJobData(data.job);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const applyHandler = async () => {
    try {
      if (!userToken) {
        return toast.error("Please log in to apply for jobs.");
      }
      if (!userData) {
        return toast.error("Loading your profile details. Please try again shortly.");
      }
      if (!userData.resume) {
        navigate("/applications");
        return toast.error("Please upload your resume to apply for jobs.");
      }
      if (isApplied) {
        return toast.warn("You have already applied for this job.");
      }
      const { data } = await axios.post(
        backendUrl + "/api/users/apply",
        { jobId: jobData._id },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchUserApplications();
        setIsApplied(true);
      } else {
        toast.warn(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (jobData && userApplications && userApplications.length > 0) {
      const hasApplied = userApplications.some(
        (item) => item.jobId && item.jobId._id === jobData._id
      );
      setIsApplied(hasApplied);
    }
  }, [jobData, userApplications]);

  return jobData ? (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-4 sm:py-10 container px-2 sm:px-4 2xl:px-20 mx-auto">
        <div className="bg-white text-black rounded-lg w-full">
          <div className="flex flex-col md:flex-row justify-center md:justify-between flex-wrap gap-4 md:gap-8 px-2 sm:px-6 md:px-14 py-6 sm:py-10 md:py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center w-full md:w-auto">
              <img
                className="h-20 sm:h-24 bg-white rounded-lg p-2 sm:p-4 mr-0 md:mr-4 mb-4 md:mb-0 border "
                src={jobData.companyId.image}
                alt=""
              />
              <div className="text-center md:text-left text-neutral-700 ">
                <h1 className="text-lg sm:text-2xl md:text-4xl font-medium">
                  {jobData.title}
                </h1>
                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2 items-center text-gray-600 mt-3 gap-4 sm:gap-6 text-xs sm:text-base">
                  <span className="flex items-center gap-2">
                    <img src={assets.suitcase_icon} alt="" />
                    {jobData.companyId.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <img src={assets.person_icon} alt="" />
                    {jobData.level}
                  </span>
                  <span className="flex items-center gap-2">
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-end text-xs sm:text-sm w-full md:w-auto max-md:mx-auto max-md:text-center">
              <button
                onClick={applyHandler}
                className="bg-blue-600 p-2.5 px-8 sm:px-10 text-white rounded w-full sm:w-auto"
                disabled={isApplied}
              >
                {isApplied ? "Already Applied" : "Apply Now"}
              </button>
              <p className="mt-1 text-gray-600">
                Posted {moment(jobData.date).fromNow()}
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            {/* Left Section */}
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold text-lg sm:text-2xl mb-4">Job description</h2>
              <div
                className="rich-text text-xs sm:text-base"
                dangerouslySetInnerHTML={{ __html: jobData.description }}
              ></div>

              {/* Key Responsibilities */}
              {jobData.keyResponsibilities && jobData.keyResponsibilities.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-800">Key Responsibilities</h3>
                  <ul className="space-y-2 text-sm sm:text-base">
                    {jobData.keyResponsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Required */}
              {jobData.skillsRequired && jobData.skillsRequired.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-800">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobData.skillsRequired.map((skill, index) => (
                      <span key={index} className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-sm text-green-700 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={applyHandler}
                className="bg-blue-600 p-2.5 px-8 sm:px-10 text-white rounded mt-6 sm:mt-10 w-full sm:w-auto"
                disabled={isApplied}
              >
                {isApplied ? "Already Applied" : "Apply Now"}
              </button>
            </div>
            {/* Right Section */}
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5">
              <h2 className="text-base sm:text-lg">More jobs from {jobData.companyId.name}</h2>
              {jobs
                .filter(
                  (job) =>
                    job._id !== jobData._id &&
                    job.companyId._id === jobData.companyId._id
                )
                .filter((job) => {
                  const appliedJobsId = new Set(
                    userApplications.map((app) => app.jobId && app.jobId._id)
                  );
                  return !appliedJobsId.has(job._id);
                })
                .slice(0, 4)
                .map((job, index) => (
                  <JobCard key={index} job={job} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default ApplyJobs;