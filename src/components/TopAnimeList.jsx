import React from "react";
import Card from "./Card";

function Topanime({ topAnime, initialLoading, error }) {
  console.log("TopAnime component props:", { topAnime, initialLoading, error });

  if (error) {
    return (
      <div>
        <h2 className="top-anime">Top Anime</h2>
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="top-anime">Top Anime</h2>
      <div className="card-container">
        {initialLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : topAnime && Array.isArray(topAnime) && topAnime.length > 0 ? (
          topAnime.map((anime) => {
            console.log("Rendering anime:", anime);
            return (
              <Card
                key={anime.mal_id}
                title={anime.title}
                image_url={anime.images?.jpg?.image_url}
                score={anime.score}
              />
            );
          })
        ) : (
          <div className="no-results">
            {!topAnime ? "Loading..." : "No anime found"}
          </div>
        )}
      </div>
    </div>
  );
}

export default Topanime;