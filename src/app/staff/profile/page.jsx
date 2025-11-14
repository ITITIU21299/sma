"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export default function StaffProfilePage() {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/staff/profile");
        // const data = await response.json();
        
        // Placeholder data
        setStaff({
          staffId: "ST001",
          name: "Staff Name",
          email: "staff@example.com",
          phone: "0123456789",
          address: "123 Main St",
          qualification: "Master's Degree",
          joiningDate: "2020-01-01",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Staff Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Staff ID</Label>
              <Input value={staff?.staffId || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={staff?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={staff?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={staff?.phone || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={staff?.address || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input value={staff?.qualification || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input value={staff?.joiningDate || ""} disabled />
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <a href="/staff/change-password">Change Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

