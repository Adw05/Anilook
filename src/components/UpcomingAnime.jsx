// Create a new file UpcomingAnime.jsx in your components directory
import React from "react";
import Card from "./Card";

function UpcomingAnime({ upcomingAnime }) {
  return (
    <div>
      <h2 className="upcoming-anime">Upcoming Anime</h2>
      <div className="card-container">
        {upcomingAnime?.slice(0,6).map((anime) => {
          return (
            <Card
              key={anime.mal_id}
              title={anime.title}
              image_url={anime.images.jpg.image_url}
              score={anime.score}
            />
          );
        })}
      </div>
    </div>
  );
}

export default UpcomingAnime;
