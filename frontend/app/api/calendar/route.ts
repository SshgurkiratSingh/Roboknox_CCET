export async function GET() {
    return Response.json({
        months: [
            {
                month: "MARCH",
                year: "2026",
                short: "MAR",
                color: "text-neon",
                bgLine: "bg-neon",
                events: [
                    {
                        date: "10",
                        badgeText: "HOLIDAY",
                        badgeVariant: "error",
                        title: "Mid-Semester Break begins",
                        time: "00:00 - 23:59",
                        location: "CAMPUS WIDE"
                    },
                    {
                        date: "14",
                        badgeText: "ACADEMIC",
                        badgeVariant: "warn",
                        title: "Last day to drop courses without W grade",
                        time: "17:00 DEADLINE",
                        location: "REGISTRAR PORTAL"
                    },
                    {
                        date: "22",
                        badgeText: "ASSESSMENT",
                        badgeVariant: "outline",
                        title: "Midterm Exams Week",
                        time: "09:00 - 18:00",
                        location: "MULTIPLE VENUES"
                    }
                ]
            },
            {
                month: "APRIL",
                year: "2026",
                short: "APR",
                color: "text-[#3A8BFF]",
                bgLine: "bg-[#3A8BFF]",
                events: [
                    {
                        date: "05",
                        badgeText: "EVENT",
                        badgeVariant: "filled",
                        title: "Annual Tech Symposium (RoboKnox)",
                        time: "10:00 - 20:00",
                        location: "MAIN AUDITORIUM"
                    },
                    {
                        date: "18",
                        badgeText: "ACADEMIC",
                        badgeVariant: "warn",
                        title: "Registration for Summer Semester opens",
                        time: "08:00 START",
                        location: "STUDENT PORTAL"
                    }
                ]
            }
        ]
    })
}
