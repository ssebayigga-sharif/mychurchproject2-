import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DashboardStats, Member, Program, MemberProfile, PrayerRequest } from "../../types/church.types";
import { getMembers } from "../../services/memberServices";
import { getPrograms } from "../../services/programServices";
import { getAllProfiles } from "../../services/profileServices";
import { getPrayerRequest } from "../../services/prayerServices";
import styles from "./Dashboard.module.scss";

const buildStats = (
  members: Member[],
  programs: Program[],
  profiles: MemberProfile[],
  prayers: PrayerRequest[]
): DashboardStats => {
  const officialMembers = members.filter(m => m.memberType !== "Visitor");
  const visitorsCount = members.filter(m => m.memberType === "Visitor").length;

  const baptizedCount = officialMembers.filter((m) => m.baptismStatus === "Baptized").length;
  const nonBaptizedCount = officialMembers.filter((m) => m.baptismStatus !== "Baptized").length;

  const upcomingPrograms = programs.filter((p) => p.status === "Upcoming").length;

  const recentPrograms = [...programs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const deptMap = officialMembers.reduce<Record<string, number>>((acc, m) => {
    acc[m.department] = (acc[m.department] ?? 0) + 1;
    return acc;
  }, {});

  const departmentBreakdown = Object.entries(deptMap)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentPrayers = prayers
    .filter((p) => p.status === "Pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const currentMonth = new Date().getMonth();
  const upcomingBirthdays = profiles
    .filter((p) => {
      if (!p.dateOfBirth) return false;
      const dob = new Date(p.dateOfBirth);
      return dob.getMonth() === currentMonth;
    })
    .map((p) => {
      const member = members.find((m) => m.id === p.memberId);
      return {
        profile: p,
        memberName: member ? `${member.firstName} ${member.lastName}` : "Unknown",
      };
    })
    .sort((a, b) => {
      const dayA = new Date(a.profile.dateOfBirth!).getDate();
      const dayB = new Date(b.profile.dateOfBirth!).getDate();
      return dayA - dayB;
    })
    .slice(0, 4);

  return {
    totalMembers: officialMembers.length,
    baptizedCount,
    nonBaptizedCount,
    visitorsCount,
    totalPrograms: programs.length,
    upcomingPrograms,
    recentPrograms,
    departmentBreakdown,
    recentPrayers,
    upcomingBirthdays,
  };
};

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(null);
      const [members, programs, profiles, prayers] = await Promise.all([
        getMembers(),
        getPrograms(),
        getAllProfiles(),
        getPrayerRequest(),
      ]);
      setStats(buildStats(members, programs, profiles, prayers));
    } catch {
      setIsError("Failed To Load Dashboard Data. Please Try Again");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 18) return "Good Afternoon!";
    return "Good Evening!";
  };

  const baptizedPct = stats ? Math.round((stats.baptizedCount / Math.max(stats.totalMembers, 1)) * 100) : 0;
  const maxDeptCount = stats?.departmentBreakdown[0]?.count ?? 1;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Loading Dashboard...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{isError}</p>
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className={styles.page}>
      {/* ── Hero Banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroGreeting}>{getGreeting()}</h1>
          <p className={styles.heroSub}> This week at Kabulengwa English SDA Church</p>
        </div>
        <div className={styles.heroDeco}></div>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.accent}`}>
          <span className={styles.statLabel}>Total members</span>
          <span className={styles.statValue}>{stats.totalMembers}</span>
          <span className={styles.statSub}>Active in registry</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recent Visitors</span>
          <span className={styles.statValue}>{stats.visitorsCount}</span>
          <span className={styles.statSub}>Logged in directory</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Baptized</span>
          <span className={styles.statValue}>{stats.baptizedCount}</span>
          <span className={styles.statSub}>{baptizedPct}% of members</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Upcoming Programs</span>
          <span className={styles.statValue}>{stats.upcomingPrograms}</span>
          <span className={styles.statSub}>Programs scheduled</span>
        </div>
      </div>

      {/* ── Grid Row 1: Programs & Departments ── */}
      <div className={styles.twoCol}>
        {/* Recent Programs */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3>Recent programs</h3>
            <span>Last {stats.recentPrograms.length}</span>
          </div>
          <div className={styles.cardBody}>
            {stats.recentPrograms.map((p) => (
              <div key={p.id} className={styles.programItem}>
                <span className={`${styles.dot} ${p.status === "Upcoming" ? styles.dotBlue : styles.dotGreen}`} />
                <div className={styles.programInfo}>
                  <span className={styles.programTitle}>{p.title}</span>
                  <span className={styles.programMeta}>{p.speaker} · {p.date}</span>
                </div>
                <span className={`${styles.badge} ${p.status === "Upcoming" ? styles.upcoming : styles.completed}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3>Members by department</h3>
            <span>{stats.totalMembers} total</span>
          </div>
          <div className={styles.cardBody}>
            {stats.departmentBreakdown.map(({ department, count }) => (
              <div key={department} className={styles.deptItem}>
                <span className={styles.deptName}>{department}</span>
                <div className={styles.deptBarWrap}>
                  <div className={styles.deptBar} style={{ width: `${(count / maxDeptCount) * 100}%` }} />
                </div>
                <span className={styles.deptCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid Row 2: Celebrations & Prayers ── */}
      <div className={styles.twoCol}>
        {/* Celebrations Widget */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3>This Month's Birthdays</h3>
            <span>{stats.upcomingBirthdays.length} found</span>
          </div>
          <div className={styles.cardBody}>
            {stats.upcomingBirthdays.length === 0 ? (
              <p className={styles.emptyText}>No birthdays this month.</p>
            ) : (
              stats.upcomingBirthdays.map(({ profile, memberName }) => (
                <div key={profile.id} className={styles.birthdayItem}>
                  <div className={styles.birthdayIcon}>🎉</div>
                  <div className={styles.birthdayInfo}>
                    <span className={styles.birthdayName}>{memberName}</span>
                    <span className={styles.birthdayDate}>
                      {new Date(profile.dateOfBirth!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Prayers Widget */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h3>Recent Prayer Requests</h3>
            <Link to="/prayer" className={styles.viewAllBtn}>View all</Link>
          </div>
          <div className={styles.cardBody}>
            {stats.recentPrayers.length === 0 ? (
              <p className={styles.emptyText}>No pending prayer requests.</p>
            ) : (
              stats.recentPrayers.map((p) => (
                <div key={p.id} className={styles.prayerItem}>
                  <div className={styles.prayerHeader}>
                    <span className={styles.prayerName}>{p.name}</span>
                    <span className={styles.prayerDate}>
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className={styles.prayerText}>{p.request.substring(0, 60)}{p.request.length > 60 ? "..." : ""}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Action Links ── */}
      <div className={styles.actionCards}>
        {[
          { label: "Manage Members", to: "/members", color: "#d8f3dc", stroke: "#2d6a4f" },
          { label: "Schedule Program", to: "/programs", color: "#dbeafe", stroke: "#1e40af" },
          { label: "Track Attendance", to: "/attendance", color: "#fef9ee", stroke: "#b5883a" },
          { label: "View Prayers", to: "/prayer", color: "#fdf0ef", stroke: "#c0392b" },
        ].map(({ label, to, color, stroke }) => (
          <Link key={label} to={to} className={styles.actionCard}>
            <div className={styles.quickIcon} style={{ background: color }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.quickLabel}>{label}</span>
            </div>
            <span className={styles.actionArrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
