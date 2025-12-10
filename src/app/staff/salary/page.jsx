'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Salary } from '@/models/Salary'
import { Calendar, DollarSign } from 'lucide-react'
import { ThreeDots } from 'react-loader-spinner'

export default function StaffSalaryPage() {
  const [salaries, setSalaries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSalaries = async () => {
    try {
      const response = await fetch('/api/staff/salary')
      const data = await response.json()

      if (data.success && data.salaries) {
        const salaryObjects = data.salaries.map(
          (sal) =>
            new Salary(
              sal.amount.toString(),
              sal.month,
              sal.year,
              sal.date,
              sal.status
            )
        )
        setSalaries(salaryObjects)
      } else {
        console.error('Error fetching salaries:', data.error)
        setSalaries([])
      }
    } catch (error) {
      console.error('Error fetching salaries:', error)
      setSalaries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalaries()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <ThreeDots
          visible={true}
          height="100"
          width="100"
          color="#4fa94d"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 font-roboto">
      <h1 className="text-2xl font-bold">Salary Information</h1>

      <div className="grid grid-cols-1 gap-4">
        {salaries.map((salary, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex flex-row items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {salary.getMonth()} {salary.getYear()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-semibold">
                      {Number(salary.getAmount())} VND
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="text-lg font-semibold">{salary.getDate()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      salary.getStatus() === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {salary.getStatus()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
