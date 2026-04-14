import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import "../movieStyle.sass";
import { getCachedData, setCachedData } from "../utils/cache";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [director, setDirector] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

  const getBookmarks = () => {
    const bookmarks = localStorage.getItem("bookmarks");
    return bookmarks ? JSON.parse(bookmarks) : [];
  };

  const saveBookmarks = (bookmarks) => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  };

  const toggleBookmark = () => {
    const bookmarks = getBookmarks();
    const movieId = parseInt(id);
    if (bookmarks.includes(movieId)) {
      const updatedBookmarks = bookmarks.filter((b) => b !== movieId);
      saveBookmarks(updatedBookmarks);
      setIsBookmarked(false);
    } else {
      bookmarks.push(movieId);
      saveBookmarks(bookmarks);
      setIsBookmarked(true);
    }
  };

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
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.includes(parseInt(id)));
  }, [id]);

  useEffect(() => {
    const cacheKey = `tmdb_movie_${id}`;
    const imageCacheKey = `tmdb_movie_${id}_images`;

    const cachedMovie = getCachedData(cacheKey);
    const cachedImages = getCachedData(imageCacheKey);

    if (cachedMovie) {
      setMovie(cachedMovie);
      const directorData = cachedMovie?.credits?.crew?.find(
        (c) => c.job === "Director",
      );
      setDirector(directorData?.name || "Unknown");
      setLoading(false);
    } else {
      fetch(
        `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
          },
        },
      )
        .then((res) => res.json())
        .then((data) => {
          setMovie(data);
          const directorData = data?.credits?.crew?.find(
            (c) => c.job === "Director",
          );
          setDirector(directorData?.name || "Unknown");
          setCachedData(cacheKey, data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }

    if (cachedImages) {
      setImages(cachedImages);
    } else {
      fetch(`https://api.themoviedb.org/3/movie/${id}/images`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const imagesList = [
            ...(data.posters || []),
            ...(data.backdrops || []),
          ]
            .filter((image) => image.file_path)
            .slice(0, 12);
          setImages(imagesList);
          setCachedData(imageCacheKey, imagesList);
        })
        .catch(() => {
          setImages([]);
        });
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  return (
    <div className="movieDetailPage">
      <div className="movieDetailTop">
        <button className="movieDetailBackButton" onClick={() => navigate(-1)}>
          <svg
            width="9"
            height="15"
            viewBox="0 0 9 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 14L1 7.5L7.5 0.999999"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="movieDetailTitle">
          <h1>Details Movie</h1>
        </div>
        <button className="movieDetailBookmarkButton" onClick={toggleBookmark}>
          {isBookmarked ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.7008 2C18.0928 2 20.0388 3.679 20.0388 6.604V21.14C20.0388 21.75 19.7248 22.299 19.1968 22.606C18.6708 22.914 18.0368 22.92 17.5048 22.62L11.5448 19.253L5.52982 22.627C5.26982 22.773 4.98482 22.847 4.69882 22.847C4.40382 22.847 4.10882 22.768 3.84082 22.61C3.31382 22.303 2.99982 21.754 2.99982 21.145V6.421C2.99982 3.611 4.94682 2 8.34182 2H14.7008ZM14.7008 3.5H8.34182C5.79282 3.5 4.49982 4.482 4.49982 6.421V21.145C4.49982 21.239 4.55382 21.29 4.59882 21.316C4.64382 21.344 4.71482 21.364 4.79682 21.318L11.1788 17.738C11.4068 17.611 11.6858 17.61 11.9148 17.739L18.2418 21.313C18.3248 21.361 18.3958 21.339 18.4408 21.312C18.4858 21.285 18.5388 21.234 18.5388 21.14L18.5385 6.49004C18.5309 5.62937 18.3644 3.5 14.7008 3.5ZM15.1396 8.7285C15.5536 8.7285 15.8896 9.0645 15.8896 9.4785C15.8896 9.8925 15.5536 10.2285 15.1396 10.2285H7.82162C7.40762 10.2285 7.07162 9.8925 7.07162 9.4785C7.07162 9.0645 7.40762 8.7285 7.82162 8.7285H15.1396Z"
                stroke="Yellow"
                fill="Yellow"
                strokeWidth="0.5"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.7008 2C18.0928 2 20.0388 3.679 20.0388 6.604V21.14C20.0388 21.75 19.7248 22.299 19.1968 22.606C18.6708 22.914 18.0368 22.92 17.5048 22.62L11.5448 19.253L5.52982 22.627C5.26982 22.773 4.98482 22.847 4.69882 22.847C4.40382 22.847 4.10882 22.768 3.84082 22.61C3.31382 22.303 2.99982 21.754 2.99982 21.145V6.421C2.99982 3.611 4.94682 2 8.34182 2H14.7008ZM14.7008 3.5H8.34182C5.79282 3.5 4.49982 4.482 4.49982 6.421V21.145C4.49982 21.239 4.55382 21.29 4.59882 21.316C4.64382 21.344 4.71482 21.364 4.79682 21.318L11.1788 17.738C11.4068 17.611 11.6858 17.61 11.9148 17.739L18.2418 21.313C18.3248 21.361 18.3958 21.339 18.4408 21.312C18.4858 21.285 18.5388 21.234 18.5388 21.14L18.5385 6.49004C18.5309 5.62937 18.3644 3.5 14.7008 3.5ZM15.1396 8.7285C15.5536 8.7285 15.8896 9.0645 15.8896 9.4785C15.8896 9.8925 15.5536 10.2285 15.1396 10.2285H7.82162C7.40762 10.2285 7.07162 9.8925 7.07162 9.4785C7.07162 9.0645 7.40762 8.7285 7.82162 8.7285H15.1396Z"
                fill="white"
                stroke="white"
                strokeWidth="0.5"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="movieDetailCard">
        <div className="movieImageGallery">
        {images.length > 0 && (
            <div className="galleryScroll">
              {images.map((img, idx) => (
                <img
                  key={`${img.file_path}-${idx}`}
                  src={`${IMAGE_BASE_URL}${img.file_path}`}
                  alt={`${movie.title} extra ${idx + 1}`}
                  className="galleryImage"
                />
              ))}
          </div>
        )}
        </div>
        <div className="movieDetailInfo">
          <div className="movieTitleRow">
            <h2>{movie.title}</h2>
          </div>
          <div className="MovieUnderTitle">
            <span className="MovieDirector">
              <p>Director:</p>
              <p>{director || "Kunne ikke finde Director"}</p>
            </span>
            <hr />
            <span className="movieRatingBadge">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.53271 0.690968C5.83206 -0.230342 7.13547 -0.230343 7.43482 0.690967L8.27988 3.29178C8.41375 3.7038 8.79771 3.98276 9.23093 3.98276H11.9656C12.9343 3.98276 13.3371 5.22238 12.5534 5.79178L10.341 7.39917C9.9905 7.65381 9.84385 8.10518 9.97772 8.5172L10.8228 11.118C11.1221 12.0393 10.0676 12.8055 9.28393 12.2361L7.07155 10.6287C6.72106 10.374 6.24647 10.374 5.89598 10.6287L3.6836 12.2361C2.89988 12.8055 1.8454 12.0393 2.14475 11.118L2.98981 8.5172C3.12368 8.10518 2.97703 7.65381 2.62654 7.39917L0.414156 5.79178C-0.369558 5.22238 0.033217 3.98276 1.00194 3.98276H3.7366C4.16982 3.98276 4.55378 3.7038 4.68765 3.29178L5.53271 0.690968Z"
                  fill="#FFA235"
                />
              </svg>

              <p>
                {movie.vote_average.toFixed(1)}
              </p>
            </span>
          </div>
          <div className="movieTags">
            {movie.genres && movie.genres.length > 0
              ? movie.genres.map((genre) => (
                <span key={genre.id}>{genre.name}</span>
              ))
              : movie.genre_ids
                ? movie.genre_ids.map((id) => <span key={id}>Genre {id}</span>)
                : "Unknown genre"}
          </div>
          <p className="movieOverview">{movie.overview} <span style={{ color: "#54A8E5" }}>Read More</span>
          </p>
          <button
            className="bookingBtn"
            onClick={() => navigate("/seat-select", { state: { movieId: movie.id, movieTitle: movie.title } })}
          >
            Book Ticket
          </button>
        </div>
      </div>

    </div>
  );
}

export default MovieDetail;
