import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-gray-100 mt-20 pt-12 pb-6'>
      <div className='container px-4 2xl:p-20 mx-auto'>
        
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10'>
          
          {/* Brand Section */}
          <div className='lg:col-span-1'>
            <div className="flex items-center gap-2 mb-4">
              <img src={assets.vite_logo} alt="JobMate AI Logo" height={40} width={40} />
              <span className="font-bold text-2xl">JobMate AI</span>
            </div>
            <p className='text-gray-400 text-sm mb-4'>
              Empowering job seekers with AI-driven career guidance and intelligent job matching.
            </p>
            <div className='flex gap-3'>
              <img width={32} src={assets.facebook_icon} alt="Facebook" className='hover:opacity-80 cursor-pointer transition' />
              <img width={32} src={assets.twitter_icon} alt="Twitter" className='hover:opacity-80 cursor-pointer transition' />
              <img width={32} src={assets.instagram_icon} alt="Instagram" className='hover:opacity-80 cursor-pointer transition' />
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className='font-bold text-lg mb-4 text-white'>For Job Seekers</h3>
            <ul className='space-y-2 text-sm'>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Browse Jobs</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Smart Job Matching</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>AI Career Guide</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Profile Builder</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Resume Analyzer</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Track Applications</a></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h3 className='font-bold text-lg mb-4 text-white'>For Recruiters</h3>
            <ul className='space-y-2 text-sm'>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Post Jobs</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Manage Listings</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>View Applications</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Recruiter Dashboard</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Pricing Plans</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Hiring Solutions</a></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className='font-bold text-lg mb-4 text-white'>Key Features</h3>
            <ul className='space-y-2 text-sm'>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>AI Job Matching</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Career Path Prediction</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>ATS Score Analysis</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Skill Gap Analysis</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Learning Paths</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Email OTP Login</a></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className='font-bold text-lg mb-4 text-white'>Company</h3>
            <ul className='space-y-2 text-sm'>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>About Us</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Contact Us</a></li>
              <li><a href='/faq' className='text-gray-400 hover:text-white transition'>FAQ</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Privacy Policy</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Terms & Conditions</a></li>
              <li><a href='#' className='text-gray-400 hover:text-white transition'>Help & Support</a></li>
            </ul>
          </div>

        </div>

        {/* Tech Stack Section */}
        <div className='border-t border-gray-700 py-8 mb-8'>
          <h3 className='font-bold text-lg mb-4 text-white'>Powered By</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'JWT Auth', 'Google OAuth', 'Cloudinary', 'AI/ML Models', 'FastAPI'].map((tech, idx) => (
              <div key={idx} className='text-center p-2 bg-gray-800 rounded text-xs text-gray-300'>
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='text-xs text-gray-400 text-center sm:text-left'>
            <p>© 2026 JobMate AI. All rights reserved.</p>
            <p>Developed by <span className='text-white font-semibold'>Dhruv Jain</span> | Email: dhruvjain527@gmail.com</p>
          </div>
          <div className='text-xs text-gray-500 text-center'>
            <p>Making job search intelligent, simple & successful</p>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer