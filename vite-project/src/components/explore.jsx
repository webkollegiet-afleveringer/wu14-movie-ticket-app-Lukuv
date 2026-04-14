import Nav from "./navigation";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { getCachedData, setCachedData } from "../utils/cache";

function Explore() {
  const [movies, setMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const navigate = useNavigate();
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating / 2 - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];
    for (let i = 0; i < fullStars; i += 1) {
      stars.push(
        <img
          key={`full-${i}`}
          src="/starFull.svg"
          alt="Full star"
          title="Full Star"
          className="ratingStar"
        />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <img
          key="half"
          src="/starHalf.svg"
          alt="Half star"
          title="Half Star"
          className="ratingStar"
        />,
      );
    }
    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(
        <img
          key={`empty-${i}`}
          src="/starEmpty.svg"
          alt="Empty star"
          title="Empty Star"
          className="ratingStar"
        />,
      );
    }

    return <span className="ratingStars">{stars}</span>;
  };

  useEffect(() => {
    const cacheKey = 'tmdb_top_rated';
    const cachedMovies = getCachedData(cacheKey);

    if (cachedMovies) {
      setMovies(cachedMovies);
      setLoading(false);
      return;
    }

    fetch("https://api.themoviedb.org/3/movie/top_rated", {
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

  useEffect(() => {
    const cacheKey = 'tmdb_popular';
    const cachedMovies = getCachedData(cacheKey);

    if (cachedMovies) {
      setRecommendedMovies(cachedMovies);
      setRecommendedLoading(false);
      return;
    }

    fetch("https://api.themoviedb.org/3/movie/popular", {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendedMovies(data.results);
        setCachedData(cacheKey, data.results);
        setRecommendedLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="topHeaderContainer">
        <button onClick={() => navigate(-1)}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 14L1 7.5L7.5 0.999999" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2>Explore Movie</h2>
        <button>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2" />
            <path
              d="M21 21L15 15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <Nav />
      <h2 className="standardH2">Top Movies</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="movieList movieListTop">
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
                    ? `${IMAGE_BASE_URL}${movie.poster_path}`
                    : `https://placehold.co/190x250?text=${movie.title}`
                }
                alt={movie.title}
              />{" "}
              <h3 className="font-size16">{movie.title}</h3>
              <h4>{getRatingStars(movie.vote_average)}</h4>
            </Link>
          ))}
        </div>
      )}

      <h2 className="standardH2">Recommended</h2>
      {recommendedLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="movieList movieListRecommended">
          {recommendedMovies.map((movie) => (
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
                    ? `${IMAGE_BASE_URL}${movie.poster_path}`
                    : `https://placehold.co/190x250?text=${movie.title}`
                }
                alt={movie.title}
              />{" "}
              <h3 className="font-size12">{movie.title}</h3>
              <h4>{getRatingStars(movie.vote_average)}</h4>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;
