export async function GET() {
    return Response.json({
        topics: [
            { date: "02", dateUnit: "HR", title: "Anyone have the footprint for DRV8833?", tags: ['QUESTION', 'PCB'] },
            { date: "14", dateUnit: "HR", title: "Meeting moved to Room 402", tags: ['ANNOUNCEMENT', 'HEAD'] },
            { date: "1", dateUnit: "DAY", title: "Recommend batteries for the drone build?", tags: ['SOLVED', 'POWER'] },
        ]
    })
}
