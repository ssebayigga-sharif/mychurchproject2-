import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClickableTile,
  Column,
  Grid,
  Loading,
  Tile,
  Button,
  InlineNotification,
} from "@carbon/react";
import {
  ArrowRight,
  UserMultiple,
  Events,
  Calendar,
  Chat,
  Trophy,
  Renew,
} from "@carbon/icons-react";
import "@carbon/charts/styles.css";
import type {
  DashboardStats,
  Member,
  Program,
  MemberProfile,
  PrayerRequest,
} from "../../types/church.types";

import { getMembers } from "../../services/memberServices";
import { getPrograms } from "../../services/programServices";
import { getAllProfiles } from "../../services/profileServices";
import { getPrayerRequest } from "../../services/prayerServices";
import styles from "./Dashboard.module.scss";

const buildStats = (
  members: Member[],
  programs: Program[],
  profiles: MemberProfile[],
  prayers: PrayerRequest[],
): DashboardStats => {
  const officialMembers = members.filter((m) => m.memberType !== "Visitor");
  const visitorsCount = members.filter(
    (m) => m.memberType === "Visitor",
  ).length;

  const baptizedCount = officialMembers.filter(
    (m) => m.baptismStatus === "Baptized",
  ).length;
  const nonBaptizedCount = officialMembers.filter(
    (m) => m.baptismStatus !== "Baptized",
  ).length;

  const upcomingPrograms = programs.filter(
    (p) => p.status === "Upcoming",
  ).length;

  const completedPrograms = programs.filter(
    (p) => p.status === "Completed",
  ).length;

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

  const totalPrayers = prayers.length;
  const answeredPrayers = prayers.filter(
    (p) => p.status === "Completed",
  ).length;
  const pendingPrayers = prayers.filter((p) => p.status === "Pending").length;

  // Calculate attendance stats (placeholder - would need actual attendance data)
  const totalAttendance = Math.floor(officialMembers.length * 0.75); // Placeholder
  const averageAttendance =
    Math.round((totalAttendance / Math.max(completedPrograms, 1)) * 100) / 100;

  const recentPrayers = prayers
    .filter((p) => p.status === "Pending")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
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
        memberName: member
          ? `${member.firstName} ${member.lastName}`
          : "Unknown",
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
    completedPrograms,
    recentPrograms,
    departmentBreakdown,
    recentPrayers,
    upcomingBirthdays,
    totalPrayers,
    answeredPrayers,
    pendingPrayers,
    totalAttendance,
    averageAttendance,
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

  // const chartData = stats
  //   ? stats.departmentBreakdown.map(({ department, count }) => ({
  //       group: department,
  //       value: count,
  //     }))
  //   : [];

  // const chartOptions = {
  //   title: "Members by Department",
  //   resizable: true,
  //   height: "300px",
  //   pie: {
  //     alignment: "center",
  //   },
  //   legend: {
  //     alignment: "center",
  //   },
  // };

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loading withOverlay title="Loading Dashboard..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            <Tile className={styles.errorTile}>
              <p className={styles.errorText}>{isError}</p>
            </Tile>
          </Column>
        </Grid>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={styles.page}>
      <Grid fullWidth>
        {/* Top Banner */}
        <Column lg={16} md={8} sm={4} className={styles.heroColumn}>
          <Tile className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <div>
                <h1 className={styles.heroGreeting}>{getGreeting()}</h1>
                <p className={styles.heroSub}>
                  Kabulengwa English SDA Church Kampala — your leadership
                  dashboard for every service and celebration.
                </p>
                <div className={styles.heroStatRow}>
                  <div className={styles.heroStatPill}>
                    <span className={styles.heroStatValue}>
                      {stats.totalMembers}
                    </span>
                    <span>Total Members</span>
                  </div>
                  <div className={styles.heroStatPill}>
                    <span className={styles.heroStatValue}>
                      {stats.upcomingPrograms}
                    </span>
                    <span>Upcoming Events</span>
                  </div>
                  <div className={styles.heroStatPill}>
                    <span className={styles.heroStatValue}>
                      {stats.upcomingBirthdays.length}
                    </span>
                    <span>Birthdays This Month</span>
                  </div>
                </div>
                <p className={styles.heroDate}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className={styles.heroActions}>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Renew}
                onClick={loadStats}
                disabled={isLoading}
              >
                Refresh Data
              </Button>
            </div>
          </Tile>
        </Column>

        {/* Combined Statistic Cards - 4 cards showing multiple metrics each */}
        <Column lg={16} md={8} sm={4}>
          <div className={styles.statCardsGrid}>
            <div className={styles.statCardItem}>
              <Tile className={`${styles.statTile} ${styles.accentTile}`}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Programs Overview</span>
                  <Calendar className={styles.statIcon} />
                </div>
                <div className={styles.statMetrics}>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.upcomingPrograms}
                    </span>
                    <span className={styles.statSubLabel}>Upcoming</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.completedPrograms}
                    </span>
                    <span className={styles.statSubLabel}>Completed</span>
                  </div>
                </div>
                <Link to="/programs" className={styles.cardLink}>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={ArrowRight}
                    className={styles.cardButton}
                  >
                    View Programs
                  </Button>
                </Link>
              </Tile>
            </div>
            <div className={styles.statCardItem}>
              <Tile className={styles.statTile}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Members Overview</span>
                  <UserMultiple className={styles.statIcon} />
                </div>
                <div className={styles.statMetrics}>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.totalMembers}
                    </span>
                    <span className={styles.statSubLabel}>Official</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.visitorsCount}
                    </span>
                    <span className={styles.statSubLabel}>Visitors</span>
                  </div>
                </div>
                <Link to="/members" className={styles.cardLink}>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={ArrowRight}
                    className={styles.cardButton}
                  >
                    View Members
                  </Button>
                </Link>
              </Tile>
            </div>
            <div className={styles.statCardItem}>
              <Tile className={styles.statTile}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Prayer Requests</span>
                  <Chat className={styles.statIcon} />
                </div>
                <div className={styles.statMetrics}>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.answeredPrayers}
                    </span>
                    <span className={styles.statSubLabel}>Answered</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.totalPrayers}
                    </span>
                    <span className={styles.statSubLabel}>Total</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.pendingPrayers}
                    </span>
                    <span className={styles.statSubLabel}>Pending</span>
                  </div>
                </div>
                <Link to="/prayer" className={styles.cardLink}>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={ArrowRight}
                    className={styles.cardButton}
                  >
                    View Prayers
                  </Button>
                </Link>
              </Tile>
            </div>
            <div className={styles.statCardItem}>
              <Tile className={styles.statTile}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Attendance Overview</span>
                  <Trophy className={styles.statIcon} />
                </div>
                <div className={styles.statMetrics}>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.totalAttendance}
                    </span>
                    <span className={styles.statSubLabel}>Total Marked</span>
                  </div>
                  <div className={styles.statMetric}>
                    <span className={styles.statValue}>
                      {stats.averageAttendance}
                    </span>
                    <span className={styles.statSubLabel}>Avg per Program</span>
                  </div>
                </div>
                <Link to="/attendance" className={styles.cardLink}>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={ArrowRight}
                    className={styles.cardButton}
                  >
                    View Attendance
                  </Button>
                </Link>
              </Tile>
            </div>
          </div>
        </Column>
        {/* Birthdays & Prayer Requests */}
        <Column lg={8} md={8} sm={4}>
          <Tile className={styles.listCard}>
            <div className={styles.cardHead}>
              <h3>
                <Events className={styles.headIcon} />
                This Month's Birthdays
              </h3>
              <span>{stats.upcomingBirthdays.length} found</span>
            </div>
            <div className={styles.cardBody}>
              {stats.upcomingBirthdays.length === 0 ? (
                <InlineNotification
                  kind="info"
                  title="No Birthdays"
                  subtitle="No birthdays this month."
                  lowContrast
                />
              ) : (
                <div className={styles.birthdayList}>
                  {stats.upcomingBirthdays.map(({ profile, memberName }) => {
                    const initials = memberName
                      .split(" ")
                      .map((part) => part.charAt(0))
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div key={profile.id} className={styles.birthdayRow}>
                        <div className={styles.birthdayAvatar}>{initials}</div>
                        <div className={styles.birthdayText}>
                          <span className={styles.birthdayName}>
                            {memberName}
                          </span>
                          <span className={styles.birthdayDate}>
                            {new Date(profile.dateOfBirth!).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                        <span className={styles.birthdayTag}>Celebrate</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Tile>
        </Column>
        {/* 
        
   

        {/* Action Links */}
        <Column lg={16} md={8} sm={4}>
          <div className={styles.actionGrid}>
            {[
              {
                label: "Manage Members",
                to: "/members",
                desc: "View and edit member details",
                icon: <UserMultiple />,
              },
              {
                label: "Schedule Program",
                to: "/programs",
                desc: "Plan church events",
                icon: <Calendar />,
              },
              {
                label: "Track Attendance",
                to: "/attendance",
                desc: "Mark member presence",
                icon: <Trophy />,
              },
              {
                label: "View Prayers",
                to: "/prayer",
                desc: "Review prayer requests",
                icon: <Chat />,
              },
            ].map(({ label, to, desc, icon }) => (
              <ClickableTile
                key={label}
                href={to}
                className={styles.actionTile}
                renderIcon={ArrowRight}
              >
                <div className={styles.actionContent}>
                  <div className={styles.actionIcon}>{icon}</div>
                  <div className={styles.actionText}>
                    <span className={styles.actionLabel}>{label}</span>
                    <p className={styles.actionDesc}>{desc}</p>
                  </div>
                </div>
              </ClickableTile>
            ))}
          </div>
        </Column>
      </Grid>
    </div>
  );
};
