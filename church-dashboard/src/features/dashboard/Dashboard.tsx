import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClickableTile,
  Column,
  Grid,
  Loading,
  ProgressBar,
  Stack,
  Tile,
} from "@carbon/react";
import { ArrowRight, UserMultiple, Events, Calendar, Chat, Trophy } from "@carbon/icons-react";
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
          <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroGreeting}>{getGreeting()}</h1>
              <p className={styles.heroSub}>Kabulengwa English SDA Church Kampala !!!</p>
            </div>
          </div>
        </Column>

        {/* Statistic Cards */}
        <Column lg={4} md={4} sm={4}>
          <Tile className={`${styles.statTile} ${styles.accentTile}`}>
            <span className={styles.statLabel}>Total members</span>
            <div className={styles.statLine}>
              <span className={styles.statValue}>{stats.totalMembers}</span>
              <UserMultiple className={styles.statIcon} />
            </div>
            <span className={styles.statSub}>Active in registry</span>
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Tile className={styles.statTile}>
            <span className={styles.statLabel}>Recent Visitors</span>
            <div className={styles.statLine}>
              <span className={styles.statValue}>{stats.visitorsCount}</span>
              <Events className={styles.statIcon} />
            </div>
            <span className={styles.statSub}>Logged in directory</span>
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Tile className={styles.statTile}>
            <span className={styles.statLabel}>Baptized</span>
            <div className={styles.statLine}>
              <span className={styles.statValue}>{stats.baptizedCount}</span>
              <Trophy className={styles.statIcon} />
            </div>
            <span className={styles.statSub}>{baptizedPct}% of members</span>
          </Tile>
        </Column>
        <Column lg={4} md={4} sm={4}>
          <Tile className={styles.statTile}>
            <span className={styles.statLabel}>Upcoming Programs</span>
            <div className={styles.statLine}>
              <span className={styles.statValue}>{stats.upcomingPrograms}</span>
              <Calendar className={styles.statIcon} />
            </div>
            <span className={styles.statSub}>Scheduled this month</span>
          </Tile>
        </Column>

        {/* Recent Programs & Department Breakdown */}
        <Column lg={8} md={8} sm={4}>
          <Tile className={styles.listCard}>
            <div className={styles.cardHead}>
              <h3>Recent Programs</h3>
              <span>Latest Activity</span>
            </div>
            <div className={styles.cardBody}>
              {stats.recentPrograms.map((p) => (
                <div key={p.id} className={styles.listItem}>
                  <div className={`${styles.dot} ${p.status === "Upcoming" ? styles.dotBlue : styles.dotGreen}`} />
                  <div className={styles.listInfo}>
                    <span className={styles.listTitle}>{p.title}</span>
                    <span className={styles.listMeta}>{p.speaker} · {p.date}</span>
                  </div>
                  <span className={`${styles.badge} ${p.status === "Upcoming" ? styles.upcoming : styles.completed}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </Tile>
        </Column>

        <Column lg={8} md={8} sm={4}>
          <Tile className={styles.listCard}>
            <div className={styles.cardHead}>
              <h3>Members by Department</h3>
              <span>{stats.totalMembers} total</span>
            </div>
            <div className={styles.cardBody}>
              <Stack gap={6} className={styles.deptStack}>
                {stats.departmentBreakdown.map(({ department, count }) => (
                  <div key={department} className={styles.deptItem}>
                    <ProgressBar
                      label={department}
                      helperText={`${count} members`}
                      value={(count / maxDeptCount) * 100}
                      status="active"
                      className={styles.deptBar}
                    />
                  </div>
                ))}
              </Stack>
            </div>
          </Tile>
        </Column>

        {/* Birthdays & Prayer Requests */}
        <Column lg={8} md={8} sm={4}>
          <Tile className={styles.listCard}>
            <div className={styles.cardHead}>
              <h3>This Month's Birthdays</h3>
              <span>{stats.upcomingBirthdays.length} found</span>
            </div>
            <div className={styles.cardBody}>
              {stats.upcomingBirthdays.length === 0 ? (
                <p className={styles.emptyText}>No birthdays this month.</p>
              ) : (
                stats.upcomingBirthdays.map(({ profile, memberName }) => (
                  <div key={profile.id} className={styles.listItem}>
                    <div className={styles.avatarMini}>🎉</div>
                    <div className={styles.listInfo}>
                      <span className={styles.listTitle}>{memberName}</span>
                      <span className={styles.listMeta}>
                        {new Date(profile.dateOfBirth!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tile>
        </Column>

        <Column lg={8} md={8} sm={4}>
          <Tile className={styles.listCard}>
            <div className={styles.cardHead}>
              <h3>Recent Prayer Requests</h3>
              <Link to="/prayer" className={styles.viewAllBtn}>View all</Link>
            </div>
            <div className={styles.cardBody}>
              {stats.recentPrayers.length === 0 ? (
                <p className={styles.emptyText}>No pending requests.</p>
              ) : (
                stats.recentPrayers.map((p) => (
                  <div key={p.id} className={styles.prayerListItem}>
                    <div className={styles.prayerHeader}>
                      <span className={styles.listTitle}>{p.name}</span>
                      <span className={styles.listMeta}>
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className={styles.prayerExcerpt}>{p.request.substring(0, 60)}{p.request.length > 60 ? "..." : ""}</p>
                  </div>
                ))
              )}
            </div>
          </Tile>
        </Column>

        {/* Action Links */}
        <Column lg={16} md={8} sm={4}>
          <div className={styles.actionGrid}>
            {[
              { label: "Manage Members", to: "/members", desc: "View and edit member details", icon: <UserMultiple /> },
              { label: "Schedule Program", to: "/programs", desc: "Plan church events", icon: <Calendar /> },
              { label: "Track Attendance", to: "/attendance", desc: "Mark member presence", icon: <Trophy /> },
              { label: "View Prayers", to: "/prayer", desc: "Review prayer requests", icon: <Chat /> },
            ].map(({ label, to, desc, icon }) => (
              <ClickableTile key={label} href={to} className={styles.actionTile} renderIcon={ArrowRight}>
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
