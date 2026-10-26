import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Header from "./components/Header";
import UpcomingAnime from "./components/UpcomingAnime";
import Topanime from "./components/TopAnimeList";
import Footer from "./components/Footer";

function App() {
  const [topAnime, setTopAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [topError, setTopError] = useState(null);
  const [upcomingError, setUpcomingError] = useState(null);
  const observer = useRef();
  const lastAnimeElementRef = useRef(null);
  const initialFetchStartedRef = useRef(false);
  const topRequestInFlightRef = useRef(false);
  const upcomingRequestInFlightRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const upcomingAnimeRef = useRef([]);

  // API endpoints
  const jikanURLtop = "https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=20";
  const jikanURLupcoming = "https://api.jikan.moe/v4/seasons/now";

  const fetchJsonWithRetry = useCallback(async (url, options = {}) => {
    const { maxRetries = 3, initialDelayMs = 500 } = options;
    let retryDelay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const response = await fetch(url);

        if (response.ok) {
          return response.json();
        }

        const isRetriable = response.status === 429 || response.status >= 500;
        if (isRetriable && attempt < maxRetries) {
          const waitMs = retryDelay;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          retryDelay *= 2;
          continue;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        if (attempt < maxRetries) {
          const waitMs = retryDelay;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          retryDelay *= 2;
          continue;
        }

        throw error;
      }
    }

    throw new Error("Failed to fetch data");
  }, []);

  // Memoize the fetch functions
  const fetchTopAnime = useCallback(async () => {
    if (topRequestInFlightRef.current) return;

    topRequestInFlightRef.current = true;
    setTopError(null);
    try {
      const result = await fetchJsonWithRetry(jikanURLtop);

      if (!result || !Array.isArray(result.data)) {
        throw new Error("Invalid data format received from API");
      }

      setTopAnime(result.data);
    } catch (error) {
      setTopError(`Error fetching top anime: ${error.message}`);
    } finally {
      topRequestInFlightRef.current = false;
      setInitialLoading(false);
    }
  }, [fetchJsonWithRetry]);

  const fetchUpcomingAnime = useCallback(async () => {
    if (upcomingRequestInFlightRef.current || !hasMoreRef.current || upcomingAnimeRef.current.length >= 20) return;

    upcomingRequestInFlightRef.current = true;
    setLoading(true);
    setUpcomingError(null);
    try {
      const result = await fetchJsonWithRetry(`${jikanURLupcoming}?page=${pageRef.current}&limit=20`);

      if (!result || !Array.isArray(result.data)) {
        throw new Error("Invalid data format received from API");
      }

      const currentItems = upcomingAnimeRef.current;
      const newItems = result.data.filter(
        (newItem) => !currentItems.some((existingItem) => existingItem.mal_id === newItem.mal_id)
      );
      const combined = [...currentItems, ...newItems].slice(0, 20);
      const paginationHasNext = result.pagination?.has_next_page === true;
      const hasNextPage = paginationHasNext && combined.length < 20;

      upcomingAnimeRef.current = combined;
      hasMoreRef.current = hasNextPage;

      setUpcomingAnime(combined);
      setHasMore(hasNextPage);

      pageRef.current += 1;
    } catch (error) {
      setUpcomingError(`Error fetching upcoming anime: ${error.message}`);
    } finally {
      upcomingRequestInFlightRef.current = false;
      setLoading(false);
    }
  }, [fetchJsonWithRetry]);

  // Initial data fetching
  useEffect(() => {
    if (initialFetchStartedRef.current) return;

    initialFetchStartedRef.current = true;
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
            error={upcomingError}
          />
        </div>
      </div>
      <div className="slide back3">
        <div className="card-scroll">
          <Topanime 
            topAnime={topAnime} 
            initialLoading={initialLoading}
            error={topError}
          />
        </div>
      </div>
      {footerComponent}
    </div>
  );
}

export default App;
