"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fee } from "@/models/Fee";

export default function StudentFeePage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await fetch("/api/student/fee");
        const data = await response.json();

        if (data.success && data.data) {
          // Transform API data to Fee model format
          const feeRecords = data.data.map((fee) => {
            // Extract semester and year from due_date or use defaults
            const dueDate = new Date(fee.due_date);
            const semester = dueDate.getMonth() < 6 ? 1 : 2; // Rough estimate
            const year = dueDate.getFullYear();
            const status = fee.paid ? "paid" : "pending";
            
            return new Fee(
              semester,
              year,
              fee.amount.toString(),
              fee.due_date,
              status
            );
          });
          setFees(feeRecords);
        } else {
          console.error("Error fetching fees:", data.error);
          setFees([]);
        }
      } catch (error) {
        console.error("Error fetching fees:", error);
        setFees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fee Information</h1>

      <div className="grid grid-cols-1 gap-4">
        {fees.map((fee, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                Semester {fee.getSemester()} - {fee.getYear()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">{fee.getAmount()} VND</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold">{fee.getDate()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      fee.getStatus() === "paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {fee.getStatus()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

