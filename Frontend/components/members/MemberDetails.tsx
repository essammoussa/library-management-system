import { Member } from "@/data/members";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, MapPin, BookOpen, CreditCard } from "lucide-react";

interface MemberDetailsProps {
  member: Member; // The member object containing all details
}

export function MemberDetails({ member }: MemberDetailsProps) {
  // Function to determine badge color based on member status
  const getStatusVariant = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "default";      // Green or normal
      case "inactive":
        return "secondary";    // Gray
      case "suspended":
        return "destructive";  // Red
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section: Name + Membership ID + Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{member.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <CreditCard className="h-4 w-4" />
            {member.membershipId} {/* Shows the membership ID */}
          </p>
        </div>
        {/* Status Badge */}
        <Badge variant={getStatusVariant(member.status)} className="capitalize">
          {member.status}
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Phone</p>
                <p className="text-sm text-muted-foreground">{member.phone}</p>
              </div>
            </div>
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Address</p>
                <p className="text-sm text-muted-foreground">{member.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Membership Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Join Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Join Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(member.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* Borrowed Books */}
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Borrowed Books</p>
                <p className="text-sm text-muted-foreground">
                  {member.borrowedBooks} {member.borrowedBooks === 1 ? "book" : "books"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
