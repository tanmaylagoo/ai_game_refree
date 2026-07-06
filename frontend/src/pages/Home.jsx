import React from "react";
import Hero from "../components/Hero/Hero";
import SearchBar from "../components/SearchBar/SearchBar";
import BackgroundSpheres from "../components/Common/BackgroundSpheres";
import "./Home.css";

const Home = () => {
  return (
    <main className="home-page-container">
      {/* Visual background spheres, crescents, and glints matching reference */}
      <BackgroundSpheres />

      <div className="home-page-inner">
        {/* Banner with floating AI mascot */}
        <Hero />

        {/* Centerpiece search bar brought directly underneath Hero to eliminate scrolling */}
        <section className="search-section">
          <SearchBar />
        </section>
      </div>
    </main>
  );
};

export default Home;
