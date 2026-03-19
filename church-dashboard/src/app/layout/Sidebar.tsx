import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h1>Dashboard</h1>
      <nav>
        <NavLink to={"/"}>Dashboard</NavLink>
        <NavLink to={"/members"}>Members</NavLink>
        <NavLink to={"/attendance"}>Attendance</NavLink>
        <NavLink to="/program">Programs</NavLink>
      </nav>
    </aside>
  );
};
export default Sidebar;
