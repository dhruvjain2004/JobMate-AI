import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import moment from "moment";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";

const Applications = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const { backendUrl, userData, userApplications, fetchUserData, fetchUserApplications, userToken } =
    useContext(AppContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      setResume(null);
    } else {
      setResume(file);
    }
  };

  const updateResume = async () => {
    if (!userToken) {
      return toast.error("Please login to update your resume.");
    }
    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const { data } = await axios.post(`${backendUrl}/api/users/update-resume`, formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        await fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || error.toString());
    }

    setIsEdit(false);
    setResume(null);
  };

  useEffect(() => {
    if (userToken) {
      fetchUserApplications().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userToken]);

  if (loading) {
    return <Loading />;
  }

  if (!userToken) {
    return (
      <>
        <Navbar />
        <div className="container px-4 min-h-[50vh] mx-auto flex items-center justify-center text-center">
          <p className="text-gray-600 text-lg">
            Please{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              login
            </Link>{" "}
            to view your applications.
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
        <h2 className="text-xl font-semibold">Your Resume</h2>
        <div className="flex gap-2 mb-6 mt-3">
          {isEdit || (userData && userData.resume === "") ? (
            <>
              <label className="flex items-center" htmlFor="resumeUpload">
                <p className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2">
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  type="file"
                  hidden
                  id="resumeUpload"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                <img src={assets.profile_upload_icon} alt="Upload icon" />
              </label>
              <button
                onClick={updateResume}
                className="bg-green-100 border border-green-400 rounded-lg px-4 py-2"
                disabled={!resume}
              >
                Save
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg"
                href={userData && userData.resume ? userData.resume : "#"}
              >
                Resume
              </a>
              <button
                onClick={() => setIsEdit(true)}
                className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2"
              >
                Edit
              </button>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold mb-4">Jobs Applied</h2>
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-left">Company</th>
              <th className="py-3 px-4 border-b text-left">Job Title</th>
              <th className="py-3 px-4 border-b text-left max-sm:hidden">
                Location
              </th>
              <th className="py-3 px-4 border-b text-left max-sm:hidden">
                Date
              </th>
              <th className="py-3 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {userApplications.length === 0 ? (
              <tr>
                <td colSpan="5">No jobs applied</td>
              </tr>
            ) : (
              userApplications.map((job, index) => (
                <tr key={job._id || index}>
                  <td className="py-3 px-4 flex items-center gap-2 border-b">
                    {job.companyId && job.companyId.image ? (
                      <img
                        className="w-8 h-8"
                        src={job.companyId.image}
                        alt=""
                      />
                    ) : (
                      <div>No Image</div>
                    )}
                    {job.companyId && job.companyId.name
                      ? job.companyId.name
                      : "Unknown Company"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {job.jobId && job.jobId.title
                      ? job.jobId.title
                      : "Unknown Title"}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {job.jobId && job.jobId.location
                      ? job.jobId.location
                      : "Unknown Location"}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {job.date ? moment(job.date).format("ll") : "No Date"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`${
                        job.status === "Accepted"
                          ? "bg-green-200"
                          : job.status === "Rejected"
                          ? "bg-red-200"
                          : "bg-blue-200"
                      } px-4 py-1.5 rounded`}
                    >
                      {job.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Footer />
      </div>
    </>
  );
};

export default Applications;