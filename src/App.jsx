import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import UpcomingAnime from "./components/UpcomingAnime";
import Topanime from "./components/TopAnimeList";
import Footer from "./components/Footer";
function App() {
  const [topAnime, setTopAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const jikanURLtop = "https://api.jikan.moe/v4/top/anime";
  const jikanURLupcoming = "https://api.jikan.moe/v4/seasons/now";

  useEffect(() => {

    fetch(`${jikanURLtop}?limit=6`)
      .then((response) => response.json())
      .then(({ data: topAnime }) => {
        setTopAnime(topAnime.slice(0, 6));
      })
      .catch((error) => console.error("Error fetching top anime:", error));
    fetch(`${jikanURLupcoming}?limit=6`)
      .then((response) => response.json())
      .then(({ data: upcomingAnime }) => {
        setUpcomingAnime(upcomingAnime?.slice(0,6));
      });
  }, []);

  return (
    <div class="container">
      <div className="slide back1">
        <Header />
      </div>
      <div className="slide back2">
        <div className="card-scroll">
          <UpcomingAnime upcomingAnime={upcomingAnime} />
        </div>
      </div>
      <div className="slide back3">
        <div className="card-scroll">
          <Topanime topAnime={topAnime} />
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
