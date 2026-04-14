import Nav from "./navigation";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getCachedData, setCachedData } from "../utils/cache";

function Bookmark() {
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const getBookmarks = () => {
    const bookmarks = localStorage.getItem("bookmarks");
    return bookmarks ? JSON.parse(bookmarks) : [];
  };

  useEffect(() => {
    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) {
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      const movies = [];
      for (const id of bookmarks) {
        const cacheKey = `tmdb_movie_${id}`;
        const cachedMovie = getCachedData(cacheKey);

        if (cachedMovie) {
          movies.push(cachedMovie);
        } else {
          try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
              },
            });
            const data = await response.json();
            movies.push(data);
            setCachedData(cacheKey, data);
          } catch (error) {
            console.error(`Error fetching movie ${id}:`, error);
          }
        }
      }
      setBookmarkedMovies(movies);
      setLoading(false);
    };

    fetchMovies();
  }, []);

  return (
    <div>
      <div className="movieDetailHeader">
        <h1>Bookmarks</h1>
      </div>
      <Nav />
      {loading ? (
        <p>Loading...</p>
      ) : bookmarkedMovies.length === 0 ? (
        <p>No bookmarked movies yet.</p>
      ) : (
        <div className="movieList movieListTop">
          {bookmarkedMovies.map((movie) => (
            <Link
              to={`/movie/${movie.id}`}
              className="movieItem"
              key={movie.id}
            >
              <img
                src={
                  movie.poster_path
                    ? `${IMAGE_BASE_URL}${movie.poster_path}`
                    : `https://placehold.co/190x250?text=${movie.title}`
                }
                alt={movie.title}
              />
              <h3>{movie.title}</h3>
              <h4>{movie.release_date}</h4>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookmark;
