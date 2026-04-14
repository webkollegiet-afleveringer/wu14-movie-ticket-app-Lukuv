import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Link } from "react-router";

function getLockedSeats() {
  try {
    return JSON.parse(localStorage.getItem("lockedSeats") || "{}");
  } catch {
    return {};
  }
}
function getETickets() {
  try {
    return JSON.parse(localStorage.getItem("etickets") || "[]");
  } catch {
    return [];
  }
}

function saveETickets(data) {
  localStorage.setItem("etickets", JSON.stringify(data));
}

function setLockedSeats(data) {
  localStorage.setItem("lockedSeats", JSON.stringify(data));
}

function getBookingKey(booking) {
  const { movieId, cinema, date, time } = booking;
  if (!movieId || !cinema || !date || !time) return null;
  return `${movieId}__${cinema}__${date}__${time}`;
}

function luhnCheck(value) {
  const onlyDigits = value.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;

  for (let i = onlyDigits.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(onlyDigits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function validExpiry(expiry) {
  const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);
  if (year < 100) {
    year += 2000;
  }

  const now = new Date();
  const expDate = new Date(year, month - 1, 1);
  expDate.setMonth(expDate.getMonth() + 1);

  return expDate > now;
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};
  const { movieId, movieTitle, cinema, date, time, seats } = booking;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasBooking = movieId && cinema && date && time && seats && seats.length > 0;
  const bookingKey = getBookingKey(booking);
  const amount = hasBooking ? seats.length * 49.9 : 0;
  const handlePayNow = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Indtast en gyldig email.";
    }
    if (!name || name.length < 2) {
      nextErrors.name = "Indtast kortholderns navn.";
    }

    const cardDigits = cardNumber.replace(/\D/g, "");
    if (cardDigits.length < 12 || cardDigits.length > 19 || !luhnCheck(cardDigits)) {
      nextErrors.cardNumber = "Ugyldigt kortnummer.";
    }
    if (!validExpiry(expiry)) {
      nextErrors.expiry = "Ugyldig udløbsdato (MM/YY).";
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      nextErrors.cvv = "CVV skal være 3 eller 4 cifre.";
    }

    if (!hasBooking || !bookingKey) {
      nextErrors.booking = "Ingen bookingdata. Gå tilbage til sædevalg.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const current = getLockedSeats();
    const existing = current[bookingKey] || [];
    const merged = Array.from(new Set([...existing, ...seats]));
    current[bookingKey] = merged;
    setLockedSeats(current);
    setDialogOpen(true);
    const tickets = getETickets();

    const newTicket = {
      id: Date.now(),
      movieId,
      movieTitle,
      cinema,
      date,
      time,
      seats,
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    tickets.push(newTicket);
    saveETickets(tickets);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="paymentPage">
      <div className="paymentHeader">
        <button className="paymentBack" onClick={() => navigate(-1)}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 14L1 7.5L7.5 0.999999" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="paymentH1">Checkout</h1>
        </div>
        <span></span>
      </div>

      {/* <div className="bookingSummary">
        {hasBooking ? (
          <>
            <p className="small">Booking</p>
            <p>{movieTitle}</p>
            <p>{cinema}</p>
            <p>{date}</p>
            <p>{time}</p>
            <p>Seats: {seats.join(", ")}</p>
          </>
        ) : (
          <p className="small">Ingen booking data. Gå tilbage til Seat Select.</p>
        )}
      </div> */}

      <div className="paymentCard"></div>

      <div className="paymentForm">
        <form onSubmit={handlePayNow}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="milesmorales@gmail.com" />
            {errors.email && <p className="error">{errors.email}</p>}
          </label>
          <label>
            Cardholder Name
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Miles Morales" />
            {errors.name && <p className="error">{errors.name}</p>}
          </label>
          <label>
            Card Number
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              type="text"
              placeholder="**** **** **** 5146"
              maxLength={19}
            />
            {errors.cardNumber && <p className="error">{errors.cardNumber}</p>}
          </label>
          <div className="rowTwo">
            <label>
              Date
              <input value={expiry} onChange={(e) => setExpiry(e.target.value)} type="text" placeholder="MM/YY" maxLength={5} />
              {errors.expiry && <p className="error">{errors.expiry}</p>}
            </label>
            <label>
              CVV
              <input value={cvv} onChange={(e) => setCvv(e.target.value)} type="text" placeholder="123" maxLength={4} />
              {errors.cvv && <p className="error">{errors.cvv}</p>}
            </label>
          </div>
          {errors.booking && <p className="error">{errors.booking}</p>}

          <button className="payNow" type="submit" disabled={!hasBooking}>
            Pay Now <hr /> ${amount.toFixed(2)}
          </button>
        </form>
      </div>

      {dialogOpen && (
        <div className="paymentDialogWrapper">
          <div className="dialogOverlay" />
          <dialog open className="paymentDialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialogContent">
              <svg className="dialogSvg" width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="56" cy="56" r="54.5" fill="#54A8E5" stroke="white" strokeWidth="3" />
                <path d="M57.3317 32.899L72.8191 38.0952C74.5527 38.6741 75.7248 40.2666 75.7342 42.0513L75.8329 57.5461C75.8634 62.2436 74.151 66.7991 71.015 70.3685C69.5727 72.0068 67.724 73.414 65.3632 74.6724L57.0381 79.1227C56.7774 79.26 56.4908 79.3309 56.2018 79.3333C55.9129 79.3355 55.624 79.2669 55.3656 79.1319L46.963 74.7845C44.5764 73.5467 42.7112 72.1601 41.2548 70.5447C38.0671 67.0119 36.2959 62.477 36.2654 57.7727L36.1667 42.2892C36.1573 40.5023 37.3084 38.8983 39.0326 38.2965L54.4612 32.915C55.3773 32.5901 56.3992 32.5832 57.3317 32.899ZM64.7378 49.5102C64.0449 48.8444 62.9291 48.8489 62.2455 49.5239L54.3855 57.2713L51.1673 54.1779C50.4744 53.512 49.3609 53.5189 48.675 54.1939C47.9914 54.8689 47.9985 55.9534 48.6914 56.6192L53.1617 60.9208C53.5093 61.2549 53.9604 61.4196 54.4114 61.4151C54.8624 61.4128 55.3111 61.2434 55.654 60.9048L64.7519 51.9356C65.4355 51.2606 65.4285 50.176 64.7378 49.5102Z" fill="white" />
              </svg>
              <h2>Your payment was successful</h2>
              <p>Adele is a Scottish heiress whose extremely
                wealthy family owns estates and grounds.
                When she was a teenager. Read More</p>
              <div className="dialogActions">
                <button
                  className="dialogClose"
                  onClick={() => navigate("/eticket")} >
                  See E-ticket
                </button>
              </div>
            </div>
          </dialog>
        </div >
      )
      }
    </div >
  );
}
