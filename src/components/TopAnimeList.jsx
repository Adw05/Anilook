import React from "react";
import Card from "./Card";

function Topanime({ topAnime }) {
  return (
    <div>
      <h2 className="top-anime ">Top Anime</h2>
      <div className="card-container">
        { topAnime&&topAnime.slice(0,6).map((anime) => {
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

export default Topanime;