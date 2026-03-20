import Nav from "./navigation";
import "../movieStyle.sass";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { getCachedData, setCachedData } from "../utils/cache";
import '@fontsource/poppins';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
      },
    };

    fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
      options,
    )
      .then((res) => res.json())
      .then((data) => setSearchResults(data.results || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const cacheKey = 'tmdb_upcoming';
    const cachedMovies = getCachedData(cacheKey);

    if (cachedMovies) {
      setMovies(cachedMovies);
      setLoading(false);
      return;
    }

    fetch("https://api.themoviedb.org/3/movie/upcoming", {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results);
        setCachedData(cacheKey, data.results);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <Nav />
      <div className="movieInputDiv">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="7" stroke="#6F7277" strokeWidth="2" />
          <path
            d="M21 21L15 15"
            stroke="#6F7277"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          type="text"
          className="movieInputSearch"
          placeholder="Search your favourite movie"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {searchQuery ? (
        <>
          <h2 className="standardH2">Search Results</h2>
          {searchResults.length > 0 ? (
            <div className="movieList movieListSoon">
              {searchResults.map((movie) => (
                <Link
                  to={`/movie/${movie.id}`}
                  className="movieItem"
                  key={movie.id}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="movieImg"
                    src={
                      movie.backdrop_path
                        ? `${IMAGE_BASE_URL}${movie.backdrop_path}`
                        : `https://placehold.co/315x180?text=${movie.title}`
                    }
                    alt={movie.title}
                  />{" "}
                  <h3 className="font-size20">{movie.title}</h3>
                  <h4>{movie.release_date}</h4>
                </Link>
              ))}
            </div>
          ) : (
            <p>No movies found</p>
          )}
        </>
      ) : (
        <>
          <h2 className="standardH2">Coming Soon</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="movieList movieListSoon">
              {movies.map((movie) => (
                <Link
                  to={`/movie/${movie.id}`}
                  className="movieItem"
                  key={movie.id}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="movieImg"
                    src={
                      movie.backdrop_path
                        ? `${IMAGE_BASE_URL}${movie.backdrop_path}`
                        : `https://placehold.co/315x180?text=${movie.title}`
                    }
                    alt={movie.title}
                  />{" "}
                  <h3 className="font-size20">{movie.title}</h3>
                  <h4>{movie.release_date}</h4>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
