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

// --- Dummy data for dashboard statistics ---
const stats = {
  totalBooks: { value: 1247, trend: { value: 12, isPositive: true } },
  totalMembers: { value: 342, trend: { value: 8, isPositive: true } },
  borrowedToday: { value: 23, trend: { value: 5, isPositive: false } },
  overdueBooks: { value: 18, trend: { value: 3, isPositive: false } },
  pendingReservations: { value: 12, trend: { value: 15, isPositive: true } },
  
};

// --- Dummy data for most borrowed books ---
const mostBorrowedBooks = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", borrowCount: 45 },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", borrowCount: 42 },
  { id: "3", title: "1984", author: "George Orwell", borrowCount: 38 },
  { id: "4", title: "Pride and Prejudice", author: "Jane Austen", borrowCount: 35 },
  { id: "5", title: "The Catcher in the Rye", author: "J.D. Salinger", borrowCount: 31 },
];

// --- Dummy data for recent activities timeline ---
const recentActivities = [
  {
    icon: BookCheck,
    type: "borrow" as const,
    title: "Book Borrowed",
    description: "John Doe borrowed 'The Great Gatsby'",
    timestamp: "5 minutes ago",
  },
  {
    icon: BookCheck,
    type: "return" as const,
    title: "Book Returned",
    description: "Jane Smith returned 'To Kill a Mockingbird'",
    timestamp: "15 minutes ago",
  },
  {
    icon: Clock,
    type: "reservation" as const,
    title: "New Reservation",
    description: "Mike Johnson reserved '1984'",
    timestamp: "1 hour ago",
  },
  {
    icon: Users,
    type: "member" as const,
    title: "New Member",
    description: "Sarah Williams joined the library",
    timestamp: "2 hours ago",
  },
  {
    icon: BookCheck,
    type: "borrow" as const,
    title: "Book Borrowed",
    description: "Emma Davis borrowed 'Pride and Prejudice'",
    timestamp: "3 hours ago",
  },
];

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the library management system
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
          <Card>
            <CardHeader>
              <CardTitle>Most Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostBorrowedBooks.map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4">
                    {/* Ranking circle */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    {/* Book title and author */}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    {/* Borrow count */}
                    <Badge variant="secondary">{book.borrowCount}</Badge>
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Map each activity to ActivityItem */}
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    icon={activity.icon}
                    type={activity.type}
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
