import React, { useState } from "react";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is JobMate AI?",
      answer:
        "JobMate AI is an intelligent job portal that connects job seekers with top companies. It features AI-powered job matching, career path prediction, and resume analysis to help you find the perfect job.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Click on the 'Register' button on the homepage, fill in your details (name, email, password, and mobile number), and verify your email. You can also use Google OAuth for quick registration.",
    },
    {
      question: "How do I search for jobs?",
      answer:
        "Use the job search bar on the homepage to search by job title, location, or category. You can also use advanced filters to narrow down your options based on job type, salary, and experience level.",
    },
    {
      question: "What is AI Job Matching?",
      answer:
        "Our AI Job Matching feature analyzes your profile, skills, and experience to recommend the most suitable jobs for you. It shows a match percentage and explains why each job is recommended.",
    },
    {
      question: "Can I apply to multiple jobs?",
      answer:
        "Yes! You can apply to as many jobs as you want. Use the 'Apply' button on any job listing. Track all your applications in the 'Applications' section of your profile.",
    },
    {
      question: "What is the ATS Score?",
      answer:
        "ATS (Applicant Tracking System) Score analyzes how well your resume matches job requirements. Our AI provides detailed feedback on formatting, keywords, and completeness to improve your chances.",
    },
    {
      question: "How does Career Path Prediction work?",
      answer:
        "Our AI analyzes your skills and experience to predict your potential career progression. It suggests the top 5 roles you could transition into, required skills, and learning paths.",
    },
    {
      question: "Can I use Email OTP to login?",
      answer:
        "Yes! You can log in with Email OTP (One-Time Password) for passwordless authentication. We'll send a 6-digit code to your registered email for secure login.",
    },
    {
      question: "How do I post a job as a recruiter?",
      answer:
        "Log in with your company account, go to the 'Dashboard', click 'Add Job', fill in job details with rich text editor, and publish. Your job will appear in search results immediately.",
    },
    {
      question: "What information should I include in my profile?",
      answer:
        "Include your name, contact details, education, skills, experience, and a professional photo. Complete your profile for better job matching. Your profile completion percentage is shown at the top.",
    },
    {
      question: "How do I upload my resume?",
      answer:
        "Go to your Profile page and click on 'Upload Resume'. You can upload PDF or DOC files. Your resume will be used for ATS analysis and job matching.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use JWT-based authentication and secure encryption for all user data. Passwords are hashed and never stored in plain text. We comply with data protection standards.",
    },
    {
      question: "Can I edit or delete my job applications?",
      answer:
        "You can track your applications in the 'Applications' section. To modify details, please contact the recruiter directly through the application notification.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach us through the 'Contact Us' page, email support, or use our in-app chat widget for immediate assistance. Our team responds within 24 hours.",
    },
    {
      question: "What are the system requirements?",
      answer:
        "JobMate AI works on all modern browsers (Chrome, Firefox, Safari, Edge). For best experience, use the latest browser version on desktop or mobile.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Currently, our web app is fully responsive and works great on all devices. A dedicated mobile app is coming soon!",
    },
    {
      question: "Can I save jobs for later?",
      answer:
        "Yes! Click the heart icon on any job listing to save it. Access your saved jobs anytime from your profile dashboard.",
    },
    {
      question: "Do you charge any fees?",
      answer:
        "Job seeking is completely free! Recruiters may have premium plans for advanced features like bulk uploads and analytics.",
    },
    {
      question: "How do I change my password?",
      answer:
        "Go to your Profile settings, find the 'Security' section, and click 'Change Password'. Enter your current password and new password, then save.",
    },
    {
      question: "What should I do if I forget my password?",
      answer:
        "Click 'Forgot Password' on the login page, enter your email, and we'll send you a password reset link. Click the link and set a new password.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl opacity-90">
            Find answers to common questions about JobMate AI
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Search or Category Tabs could go here */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                  aria-expanded={openIndex === index}
                >
                  <h3 className="text-lg font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Need Help Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is
              always happy to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@jobmateai.com"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
              >
                Email Support
              </a>
              <a
                href="#"
                className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 transition duration-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
