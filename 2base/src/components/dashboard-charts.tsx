import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { tools, categories } from "@/data/tools";
import { getToolVersionInfo } from "@/lib/tool-utils";

export function DashboardCharts() {
  // Prepare data for category distribution chart
  const categoryData = categories
    .filter((cat) => cat.id !== "all" && cat.count > 0)
    .map((cat) => ({
      name: cat.name,
      count: cat.count,
      percentage: Math.round((cat.count / tools.length) * 100),
    }));

  // Prepare data for pricing distribution
  const pricingData = [
    {
      name: "Free Tools",
      count: tools.filter((t) => t.pricing === "free").length,
      color: "#10b981",
    },
    {
      name: "Paid Tools",
      count: tools.filter((t) => t.pricing === "paid").length,
      color: "#f59e0b",
    },
  ];

  // Prepare data for tool release timeline (simulated monthly data)
  const timelineData = [
    { month: "Jun 2024", tools: 1, newTools: 1 },
    { month: "Jul 2024", tools: 2, newTools: 1 },
    { month: "Aug 2024", tools: 3, newTools: 1 },
    { month: "Sep 2024", tools: 3, newTools: 0 },
    { month: "Oct 2024", tools: 3, newTools: 0 },
    { month: "Nov 2024", tools: 4, newTools: 1 },
    { month: "Dec 2024", tools: 5, newTools: 1 },
    { month: "Jan 2025", tools: 6, newTools: 1 },
  ];

  // Prepare data for tool features comparison
  const featureData = tools.map((tool) => {
    const versionInfo = getToolVersionInfo(tool);
    return {
      name:
        tool.name.length > 15 ? tool.name.substring(0, 15) + "..." : tool.name,
      fullName: tool.name,
      tags: tool.tags.length,
      version: parseFloat(tool.version.replace("v", "")),
      isNew: versionInfo.isNew ? 1 : 0,
      category: tool.category,
    };
  });

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      color: string;
      dataKey: string;
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Tool Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tools
                </p>
                <p className="text-2xl font-bold">{tools.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">T</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Free Tools
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {tools.filter((t) => t.pricing === "free").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">F</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  New Tools
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {tools.filter((t) => getToolVersionInfo(t).isNew).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">N</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Categories
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    categories.filter((c) => c.id !== "all" && c.count > 0)
                      .length
                  }
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">C</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tools by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pricing Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pricingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) =>
                    `${name}: ${count} (${Math.round(
                      (count / tools.length) * 100
                    )}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {pricingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Release Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Release Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tools"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="newTools"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Features Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.fullName}</p>
                          <p>Tags: {data.tags}</p>
                          <p>Version: v{data.version}</p>
                          <p>Category: {data.category}</p>
                          {data.isNew === 1 && (
                            <Badge variant="secondary" className="mt-1">
                              NEW
                            </Badge>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="tags" fill="#00C49F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tool Version Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Version Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={featureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.fullName}</p>
                        <p>Version: v{data.version}</p>
                        <p>Category: {data.category}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="version"
                stroke="#FF8042"
                strokeWidth={2}
                dot={{ fill: "#FF8042", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
