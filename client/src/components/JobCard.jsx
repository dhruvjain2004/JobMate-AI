import React from 'react'

import { useNavigate } from 'react-router-dom'

const JobCard = ({job}) => {

    const navigate = useNavigate();

  return (
    <div className='border p-3 sm:p-6 shadow rounded'>
        <div className='flex justify-between items-center'>
            <img
              className='h-8 w-8 sm:h-10 sm:w-10 object-contain bg-gray-100 rounded'
              src={job.companyId?.image || '/default-company.png'}
              alt={job.companyId?.name || 'Company'}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-company.png'; }}
            />
        </div>
        <h4 className='font-medium text-base sm:text-xl mt-2'>{job.title}</h4>
        <div className='flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs'>
            <span className='bg-blue-50 border border-blue-200 px-2 sm:px-4 py-1.5 rounded'>{job.location}</span>
            <span className='bg-red-50 border border-red-200 px-2 sm:px-4 py-1.5 rounded'>{job.level}</span>
        </div>
        
        {/* Job Description */}
        <p className='text-gray-500 text-xs sm:text-sm mt-4' dangerouslySetInnerHTML={{__html:job.description.slice(0,150)}}></p>
        
        {/* Key Responsibilities */}
        {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
          <div className='mt-3'>
            <h5 className='font-medium text-sm text-gray-700 mb-1'>Key Responsibilities:</h5>
            <ul className='text-xs text-gray-600 space-y-1'>
              {job.keyResponsibilities.slice(0, 3).map((resp, index) => (
                <li key={index} className='flex items-start'>
                  <span className='text-blue-500 mr-1'>•</span>
                  <span>{resp}</span>
                </li>
              ))}
              {job.keyResponsibilities.length > 3 && (
                <li className='text-blue-500 text-xs'>+{job.keyResponsibilities.length - 3} more responsibilities</li>
              )}
            </ul>
          </div>
        )}

        {/* Skills Required */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className='mt-3'>
            <h5 className='font-medium text-sm text-gray-700 mb-1'>Skills Required:</h5>
            <div className='flex flex-wrap gap-1'>
              {job.skillsRequired.slice(0, 4).map((skill, index) => (
                <span key={index} className='bg-green-50 border border-green-200 px-2 py-1 rounded text-xs text-green-700'>
                  {skill}
                </span>
              ))}
              {job.skillsRequired.length > 4 && (
                <span className='text-blue-500 text-xs px-2 py-1'>+{job.skillsRequired.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        <div className='mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm'>
            <button onClick={()=>{navigate(`/apply-job/${job._id}`); scrollTo(0,0)}} className='bg-blue-600 text-white px-4 py-2 rounded'>
                Apply now
            </button>
            <button onClick={()=>{navigate(`/apply-job/${job._id}`); scrollTo(0,0)}} className='text-gray-500 border border-gray-500 px-4 py-2 rounded shadow'>
                Learn more
            </button>
            </div>
    </div>
  )
}

export default JobCard