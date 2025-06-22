import { Card, CardContent } from "@/components/ui/card";
import { tools, categories } from "@/data/tools";
import { getToolVersionInfo } from "@/lib/tool-utils";

export function DashboardCharts() {
  // Note: Calendar-related functions are preserved for future use but commented out
  /*
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);

    const releaseMap = new Map();
    tools.forEach((tool) => {
      const releaseDate = new Date(tool.releaseDate);
      const dateKey = releaseDate.toISOString().split("T")[0];
      releaseMap.set(dateKey, (releaseMap.get(dateKey) || 0) + 1);
    });

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0];
      const count = releaseMap.get(dateKey) || 0;
      data.push({
        date: dateKey,
        count,
        level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
      });
    }

    return data;
  };

  const getWeeksData = () => {
    const weeks = [];
    let currentWeek = [];
    calendarData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
      if (index === calendarData.length - 1) {
        weeks.push(currentWeek);
      }
    });
    return weeks;
  };

  const getIntensityColor = (level) => {
    switch (level) {
      case 0: return "bg-muted";
      case 1: return "bg-secondary/50";
      case 2: return "bg-secondary";
      case 3: return "bg-primary";
      default: return "bg-muted";
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  */

  return (
    <div className="space-y-6">
      {/* Minimal Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {tools.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Tools
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {tools.filter((t) => t.pricing === "free").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Free Tools</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary-foreground">
              {tools.filter((t) => getToolVersionInfo(t).isNew).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">New Tools</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent-foreground">
              {categories.filter((c) => c.id !== "all" && c.count > 0).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* 
      GitHub-style Release Calendar - Hidden for now
      The calendar component code is preserved here for future use:
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tool Release Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            {calendarData.filter((d) => d.count > 0).length} releases in the past year
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {weeksData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(day.level)} cursor-pointer transition-all hover:ring-2 hover:ring-primary/50`}
                      title={`${formatDate(day.date)}: ${day.count} release${day.count !== 1 ? "s" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted"></div>
                            <div className="w-3 h-3 rounded-sm bg-secondary/50"></div>
            <div className="w-3 h-3 rounded-sm bg-secondary"></div>
            <div className="w-3 h-3 rounded-sm bg-primary"></div>
              </div>
              <span>More</span>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Recent Releases</h4>
              <div className="space-y-2">
                {tools
                  .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
                  .slice(0, 5)
                  .map((tool) => {
                    const versionInfo = getToolVersionInfo(tool);
                    return (
                      <div key={tool.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">{tool.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {versionInfo.version} • {versionInfo.releaseDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {versionInfo.isNew && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">NEW</Badge>
                          )}
                          <Badge variant={versionInfo.isPaid ? "outline" : "secondary"} className="text-[10px] px-1 py-0 h-4">
                            {versionInfo.pricing}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
