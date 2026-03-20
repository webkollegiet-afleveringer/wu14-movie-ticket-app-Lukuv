import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

function getShowKey(cinema, date, time, movieId) {
  if (!cinema || !date || !time || !movieId) return null;
  return `${movieId}__${cinema}__${date}__${time}`;
}

function getLockedSeatsForShow(cinema, date, time, movieId) {
  const key = getShowKey(cinema, date, time, movieId);
  if (!key) return [];
  try {
    const data = JSON.parse(localStorage.getItem("lockedSeats") || "{}");
    return data[key] || [];
  } catch {
    return [];
  }
}


function SeatSelect() {
  const rowLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const navigate = useNavigate();
  const location = useLocation();
  const movieState = location.state || {};
  const [movieId] = useState(movieState.movieId || "unknown-movie");
  const [movieTitle] = useState(movieState.movieTitle || "Selected Film");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("Roskilde Biograf");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState("13:00");

  const today = new Date();
  const dateOptions = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    setReservedSeats(getLockedSeatsForShow(selectedCinema, selectedDate, selectedTime, movieId));
    setSelectedSeats([]);
  }, [selectedCinema, selectedDate, selectedTime, movieId]);

  const seatRows = [
    { groups: [3, 3] },
    { groups: [4, 4] },
    { groups: [4, 4] },
    { groups: [4, 4] },
    { groups: [4, 4] },
    { groups: [3, 3] },
  ];

  const handleSeatToggle = (row, col) => {
    const seatId = `${rowLetters[row]}${col + 1}`;
    if (reservedSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleCheckout = (event) => {
    event.preventDefault();
    if (selectedSeats.length === 0) return;
    navigate("/checkout", {
      state: {
        movieId,
        movieTitle,
        cinema: selectedCinema,
        date: selectedDate,
        time: selectedTime,
        seats: selectedSeats,
      },
    });
  };

  return (
    <div className="seatSelectPage">
      <div className="seatTopBar">
        <button className="backButton" onClick={() => navigate(-1)}>
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
        <h2>Select Seats</h2>
      </div>

      <form className="selectors" onSubmit={handleCheckout}>
        <label className="selectRow">
          <span>Biograf</span>
          <select value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)}>
            <option>Roskilde Biograf</option>
            <option>Holbæk Biograf</option>
            <option>KirkeHyllinge Biograf</option>
          </select>
        </label>
        <div className="selectRowUnderPass2">
          <label className="selectRow">
            <span>Dato</span>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              {dateOptions.map((date) => {
                const isoDate = date.toISOString().slice(0, 10);
                return (
                  <option key={isoDate} value={isoDate}>
                    {formatDate(date)}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="selectRow">
            <span>Tid</span>
            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
              <option value="13:00">01.00 PM</option>
              <option value="16:30">04.30 PM</option>
              <option value="20:00">08.00 PM</option>
            </select>
          </label>
        </div>
      </form>
      <div className="SeatSelectorContainer">
        {seatRows.map((row, rowIndex) => {
          let globalCol = 0;
          return (
            <div className="seatsRow" key={`row-${rowIndex}`}>
              {row.groups.map((groupCount, groupIndex) => (
                <span className="seatGroup" key={`group-${groupIndex}`}>
                  {Array.from({ length: groupCount }, (_, colInGroup) => {
                    const seatId = `${rowLetters[rowIndex]}${globalCol + 1}`;
                    const isSelected = selectedSeats.includes(seatId);
                    const isReserved = reservedSeats.includes(seatId);
                    const colIndex = globalCol;
                    globalCol += 1;
                    return (
                      <button
                        key={seatId}
                        className={`seatBtn ${isReserved ? "reserved" : isSelected ? "selected" : ""}`}
                        onClick={() => handleSeatToggle(rowIndex, colIndex)}
                        disabled={isReserved}
                      >
                      </button>
                    );
                  })}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <div className="legend">
        <div className="legendItem">
          <span className="dot selected" /> Selected
        </div>
        <div className="legendItem">
          <span className="dot reserved" /> Reserved
        </div>
        <div className="legendItem">
          <span className="dot available" /> Available
        </div>
      </div>

      <div className="checkoutBottom">
        <button className="checkoutButton" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
      <div>
        <div className="smallLabel">Film</div>
        <div>{movieTitle}</div>
        <div className="smallLabel">Selected Seats</div>
        <div>{selectedSeats.length === 0 ? "Ingen" : selectedSeats.join(", ")}</div>
        <div className="smallLabel">Valgt Biograf</div>
        <div>{selectedCinema}</div>
        <div className="smallLabel">Dato</div>
        <div>{selectedDate}</div>
        <div className="smallLabel">Tid</div>
        <div>{selectedTime}</div>
      </div>
    </div>
  );
}

export default SeatSelect;
