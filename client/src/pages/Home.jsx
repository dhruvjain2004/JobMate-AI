import React from "react";
import Navbar from "../components/Navbar.jsx"; // Adjust the path as necessary
import Hero from "../components/Hero.jsx"; // Adjust the path as necessary
import JobListing from "../components/JobListing.jsx"; // Adjust the path as necessary
import AppDownload from "../components/AppDownload.jsx"; // Adjust the path as necessary
import Footer from "../components/Footer.jsx";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <JobListing/>
      <AppDownload/>
      <Footer/>
    </div>
  );
};

export default Home;
