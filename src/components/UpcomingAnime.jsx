import React from "react";
import Card from "./Card";

function UpcomingAnime({ upcomingAnime, lastAnimeElementRef, loading, initialLoading }) {
  return (
    <div>
      <h2 className="upcoming-anime">Top Airing</h2>
      <div className="card-container">
        {initialLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : upcomingAnime.length > 0 ? (
          upcomingAnime.map((anime, index) => {
            if (index === upcomingAnime.length - 1) {
              return (
                <div ref={lastAnimeElementRef} key={anime.mal_id}>
                  <Card
                    title={anime.title}
                    image_url={anime.images.jpg.image_url}
                    score={anime.score}
                  />
                </div>
              );
            }
            return (
              <Card
                key={anime.mal_id}
                title={anime.title}
                image_url={anime.images.jpg.image_url}
                score={anime.score}
              />
            );
          })
        ) : (
          <div className="no-results">No upcoming anime found</div>
        )}
      </div>
      {loading && !initialLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default UpcomingAnime;
