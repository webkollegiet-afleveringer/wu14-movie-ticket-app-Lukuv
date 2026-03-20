import "./App.sass";
import Home from "./components/home";
import Bookmark from "./components/bookmark";
import Profile from "./components/profile";
import Explore from "./components/explore";
import MovieDetail from "./components/movieDetail";
import SeatSelect from "./components/seatSelect";
import Payment from "./components/payment";
import NotFound from "./NotFound";
import Eticket from "./components/Eticket";
import { Routes, Route } from "react-router";

function App() {
  return (
    <div className="wrapper">
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/explore" element={<Explore />}></Route>
        <Route path="/bookmark" element={<Bookmark />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/movie/:id" element={<MovieDetail />}></Route>
        <Route path="/seat-select" element={<SeatSelect />}></Route>
        <Route path="/checkout" element={<Payment />}></Route>
        <Route path="/eticket" element={<Eticket />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </div>
  );
}

export default App;
