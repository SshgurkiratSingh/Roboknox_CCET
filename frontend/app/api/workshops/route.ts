export async function GET() {
    return Response.json({
        workshops: [
            { date: "15", dateUnit: "FEB", title: "LED Multiplexing: 3x3x3 Cube", tags: ['BEGINNER', 'ARDUINO'] },
            { date: "22", dateUnit: "MAR", title: "Servo Kinematics", tags: ['INTERMEDIATE', 'MATH'] },
            { date: "10", dateUnit: "APR", title: "PID Line Follower Calibration", tags: ['ADVANCED', 'CONTROL'] },
        ]
    })
}
