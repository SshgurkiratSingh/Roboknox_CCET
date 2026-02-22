export async function GET() {
  return Response.json({
    metrics: [
      {
        title: "Active Members",
        value: "108",
        trend: "12 new this month",
        colorClass: "border-neon text-neon"
      },
      {
        title: "Ongoing Projects",
        value: "04",
        trend: "2 nearing completion",
        colorClass: "border-[#3A8BFF] text-[#3A8BFF]"
      },
      {
        title: "Forum Topics",
        value: "42",
        trend: "5 active discussions today",
        colorClass: "border-[#FFC83A] text-[#FFC83A]"
      },
      {
        title: "Recent Commits",
        value: "26",
        trend: "Across 3 repositories",
        colorClass: "border-[#FF3A5C] text-[#FF3A5C]"
      }
    ]
  })
}
