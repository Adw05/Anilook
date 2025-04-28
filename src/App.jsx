import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Header from "./components/Header";
import UpcomingAnime from "./components/UpcomingAnime";
import Topanime from "./components/TopAnimeList";
import Footer from "./components/Footer";

function App() {
  const [topAnime, setTopAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();
  const lastAnimeElementRef = useRef(null);

  // API endpoints
  const jikanURLtop = "https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=20";
  const jikanURLupcoming = "https://api.jikan.moe/v4/seasons/now";

  // Memoize the fetch functions
  const fetchTopAnime = useCallback(async () => {
    try {
      const response = await fetch(jikanURLtop);
      
      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchTopAnime();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && result.data) {
        setTopAnime(result.data);
      } else {
        setError("Invalid data format received from API");
      }
    } catch (error) {
      setError(`Error fetching top anime: ${error.message}`);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const fetchUpcomingAnime = useCallback(async () => {
    if (loading || !hasMore || upcomingAnime.length >= 20) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${jikanURLupcoming}?page=${page}&limit=20`);
      
      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUpcomingAnime();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && result.data) {
        setUpcomingAnime(prev => {
          const newItems = result.data.filter(newItem => 
            !prev.some(existingItem => existingItem.mal_id === newItem.mal_id)
          );
          const combined = [...prev, ...newItems];
          // Limit to 20 items
          return combined.slice(0, 20);
        });
        setPage(prev => prev + 1);
        setHasMore(upcomingAnime.length < 20);
      } else {
        setError("Invalid data format received from API");
      }
    } catch (error) {
      setError(`Error fetching upcoming anime: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, upcomingAnime.length]);

  // Initial data fetching
  useEffect(() => {
    fetchTopAnime();
    fetchUpcomingAnime();
  }, [fetchTopAnime, fetchUpcomingAnime]);

  // Intersection Observer setup
  useEffect(() => {
    if (loading) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchUpcomingAnime();
      }
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });

    if (lastAnimeElementRef.current) {
      observer.current.observe(lastAnimeElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, fetchUpcomingAnime]);

  // Memoize components to prevent unnecessary re-renders
  const headerComponent = useMemo(() => <Header />, []);
  const footerComponent = useMemo(() => <Footer />, []);

  return (
    <div className="container">
      <div className="slide back1">
        {headerComponent}
      </div>
      <div className="slide back2">
        <div className="card-scroll">
          <UpcomingAnime 
            upcomingAnime={upcomingAnime} 
            lastAnimeElementRef={lastAnimeElementRef}
            loading={loading}
            initialLoading={initialLoading}
            error={error}
          />
        </div>
      </div>
      <div className="slide back3">
        <div className="card-scroll">
          <Topanime 
            topAnime={topAnime} 
            initialLoading={initialLoading}
            error={error}
          />
        </div>
      </div>
      {footerComponent}
    </div>
  );
}

export default App;
