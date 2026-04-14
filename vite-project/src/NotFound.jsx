import { Link } from "react-router";
function NotFound() {
  return (
    <div>
      {" "}
      <h2>Page not found</h2>
      <Link to="/">Gå tilbage</Link>
    </div>
  );
}

export default NotFound;
