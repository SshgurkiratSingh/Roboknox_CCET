export async function GET() {
    return Response.json({
        activity: [
            { user: "@admin", action: "posted a new guide on PID tuning", time: "2 hours ago" },
            { user: "@hardware_lead", action: "updated the Rover project repository", time: "5 hours ago" },
            { user: "@member_jane", action: "asked a question in the Electronics forum", time: "Yesterday" },
            { user: "@admin", action: "scheduled the next weekend workshop", time: "2 days ago" },
        ]
    })
}
