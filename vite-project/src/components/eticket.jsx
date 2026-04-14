import { useState, useEffect } from "react";
import Barcode from 'react-barcode';
import { useNavigate } from "react-router";



export default function ETicket() {
    const [dialogOpen2, setDialogOpen2] = useState(false);
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("etickets") || "[]");
        setTickets(data);
    }, []);

    function downloadTicket() {
        console.log("Det viker");
        setDialogOpen2(true);
    }
    const closeDialog = () => {
        setDialogOpen2(false);
    };

    return (
        <div className="ticketPage">
            <div className="topHeaderContainer">
                <button onClick={() => navigate(-1)}>
                    <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 14L1 7.5L7.5 0.999999" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h2>E-ticket</h2>
            </div>
            <span></span>
            <div style={{ maxWidth: "80vw" }}>

                <h3>Instruction</h3>
                <p style={{ color: "#B2B5BB", textAlign: "justify" }}>Come to the cinema, show and scan the barcode to the space provided. Continue to comply with health protocols.</p>
            </div>

            {tickets.slice(-1).map((ticket) => (
                <div key={ticket.id} className="ticketContainer">
                    <div className="ticketGrid">
                        <h2>Film: {ticket.movieTitle}</h2>
                        <h2 style={{ color: "#F14763" }}>e-ticket</h2>
                        <p><span>Date</span> {ticket.date}</p>
                        <p><span>Seats</span> {ticket.seats.join(", ")}</p>
                        <p><span>Location</span> {ticket.cinema}</p>
                        <p><span>Time</span> {ticket.time}</p>
                        <p><span>Payment </span> Successful</p>
                        <p><span>Order</span>{ticket.id}</p>
                    </div>
                    <div className="barcodeDiv">

                        <Barcode
                            value={ticket.id}
                            width={2}
                            height={50}
                            format="CODE128"
                            displayValue={true}
                            fontOptions="bold"
                            font="monospace"
                            textAlign="center"
                            fontSize={15}
                        />
                    </div>
                </div>
            ))}
            <button className="bookingBtn" onClick={downloadTicket}><a>Download E-ticket</a></button>
            {dialogOpen2 && (
                <div className="paymentDialogWrapper">
                    <div className="dialogOverlay" />
                    <dialog open className="paymentDialog" onClick={(e) => e.stopPropagation()}>
                        <div className="dialogContent">
                            <svg className="dialogSvg" width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="56" cy="56" r="54.5" fill="#54A8E5" stroke="white" strokeWidth="3" />
                                <path d="M57.3317 32.899L72.8191 38.0952C74.5527 38.6741 75.7248 40.2666 75.7342 42.0513L75.8329 57.5461C75.8634 62.2436 74.151 66.7991 71.015 70.3685C69.5727 72.0068 67.724 73.414 65.3632 74.6724L57.0381 79.1227C56.7774 79.26 56.4908 79.3309 56.2018 79.3333C55.9129 79.3355 55.624 79.2669 55.3656 79.1319L46.963 74.7845C44.5764 73.5467 42.7112 72.1601 41.2548 70.5447C38.0671 67.0119 36.2959 62.477 36.2654 57.7727L36.1667 42.2892C36.1573 40.5023 37.3084 38.8983 39.0326 38.2965L54.4612 32.915C55.3773 32.5901 56.3992 32.5832 57.3317 32.899ZM64.7378 49.5102C64.0449 48.8444 62.9291 48.8489 62.2455 49.5239L54.3855 57.2713L51.1673 54.1779C50.4744 53.512 49.3609 53.5189 48.675 54.1939C47.9914 54.8689 47.9985 55.9534 48.6914 56.6192L53.1617 60.9208C53.5093 61.2549 53.9604 61.4196 54.4114 61.4151C54.8624 61.4128 55.3111 61.2434 55.654 60.9048L64.7519 51.9356C65.4355 51.2606 65.4285 50.176 64.7378 49.5102Z" fill="white" />
                            </svg>
                            <h2>Your ticket has been downloaded</h2>
                            <p>Adele is a Scottish heiress whose extremely
                                wealthy family owns estates and grounds.
                                When she was a teenager. Read More</p>
                            <div className="dialogActions">
                                <button
                                    className="dialogClose"
                                    onClick={() => navigate("/")} >
                                    Back To Home
                                </button>
                            </div>
                        </div>
                    </dialog>
                </div >
            )
            }
        </div>
    )
}