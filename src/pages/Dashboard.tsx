import { BookOpen, Users, BookCheck, AlertTriangle, Clock ,Loader2 } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { BorrowingTrendsChart } from "@/components/dashboard/BorrowingTrendsChart";
import { TopCategoriesChart } from "@/components/dashboard/TopCategoriesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useEffect } from "react";

import dashboardData from "@/data/dashboard.json";

// Map activity types to icons
const activityIcons = {
  borrow: BookCheck,
  return: BookCheck,
  reservation: Clock,
  member: Users,
};

const { stats, mostBorrowedBooks, recentActivities } = dashboardData;

const Dashboard = () => {
    
  
    const [loading, setLoading] = useState(true);

  // Simulate loading (replace with real API request later)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Loading UI ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }
  return (
    
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold text-foreground tracking-tighter mb-2">System <span className="text-primary italic">Overview</span></h1>
        <p className="text-lg text-muted-foreground/60">
          Management insights and library performance at a glance.
        </p>
      </div> 
      

    
      {/* --- Stats Grid --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Each DashboardCard displays a key statistic with trend indicator */}
        <DashboardCard
          title="Total Books"
          value={stats.totalBooks.value}
          description="Books in collection"
          icon={BookOpen}
          trend={stats.totalBooks.trend}
        />
        <DashboardCard
          title="Total Members"
          value={stats.totalMembers.value}
          description="Active members"
          icon={Users}
          trend={stats.totalMembers.trend}
        />
        <DashboardCard
          title="Borrowed Today"
          value={stats.borrowedToday.value}
          description="Books borrowed today"
          icon={BookCheck}
          trend={stats.borrowedToday.trend}
        />
        <DashboardCard
          title="Overdue Books"
          value={stats.overdueBooks.value}
          description="Books past due date"
          icon={AlertTriangle}
          trend={stats.overdueBooks.trend}
        />
        <DashboardCard
          title="Reservations"
          value={stats.pendingReservations.value}
          description="Pending reservations"
          icon={Clock}
          trend={stats.pendingReservations.trend}
        />
      </div>

      {/* --- Charts & Most Borrowed Books Section --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Borrowing Trends Chart (spans 4 columns) */}
        <div className="lg:col-span-4">
          <ChartContainer
            title="Borrowing Trends"
            description="Monthly borrowing activity over the past 6 months"
          >
            <BorrowingTrendsChart />
          </ChartContainer>
        </div>

        {/* Most Borrowed Books Card (spans 3 columns) */}
        <div className="lg:col-span-3">
          <Card className="border border-border/50 shadow-xl bg-card/40 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground/80">Most Borrowed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostBorrowedBooks.map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4">
                    {/* Ranking circle */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-sm shadow-sm ring-1 ring-primary/20">
                      #{index + 1}
                    </div>
                    {/* Book title and author */}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    {/* Borrow count */}
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold rounded-lg px-2.5 py-0.5">{book.borrowCount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Top Categories Chart & Recent Activity Section --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Categories Chart (spans 4 columns) */}
        <div className="lg:col-span-4">
          <ChartContainer
            title="Top Categories"
            description="Most popular book categories"
          >
            <TopCategoriesChart />
          </ChartContainer>
        </div>

        {/* Recent Activity Timeline (spans 3 columns) */}
        <div className="lg:col-span-3">
          <Card className="border border-border/50 shadow-xl bg-card/40 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground/80">Pulse Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Map each activity to ActivityItem */}
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    icon={activityIcons[activity.type as keyof typeof activityIcons]}
                    type={activity.type as "borrow" | "return" | "reservation" | "member"}
                    title={activity.title}
                    description={activity.description}
                    timestamp={activity.timestamp}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
