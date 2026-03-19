import { useEffect, useState } from "react";
import { getMembers } from "../../services/memberServices";
import { getPrograms } from "../../services/programServices";
import "./Dashboard.scss";

export const Dashboard = () => {
  const [membersCount, setMembersCount] = useState(0);
  const [programsCount, setProgramsCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const members = await getMembers();
    const programs = await getPrograms();

    setMembersCount(members.length);
    setProgramsCount(programs.length);
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard</h2>
      <div className="dashboard__stats">
        <div className="stats-cards">
          <h2>Totals Members</h2>
          <p>{membersCount}</p>
        </div>
        <div className="stats-cards">
          <h2>Totals Programs</h2>
          <p>{programsCount}</p>
        </div>
      </div>
    </div>
  );
};
