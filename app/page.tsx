"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Settings,
  Home,
  FileText,
  ChevronRight,
  Monitor,
  MessageCircle,
} from "lucide-react"

// Sample data for charts
const salesData = [
  { month: "Jan", sales: 4000, revenue: 2400 },
  { month: "Feb", sales: 3000, revenue: 1398 },
  { month: "Mar", sales: 2000, revenue: 9800 },
  { month: "Apr", sales: 2780, revenue: 3908 },
  { month: "May", sales: 1890, revenue: 4800 },
  { month: "Jun", sales: 2390, revenue: 3800 },
]

const userGrowthData = [
  { month: "Jan", users: 1000 },
  { month: "Feb", users: 1200 },
  { month: "Mar", users: 1400 },
  { month: "Apr", users: 1800 },
  { month: "May", users: 2200 },
  { month: "Jun", users: 2800 },
]

const categoryData = [
  { name: "Electronics", value: 400, color: "hsl(var(--chart-1))" },
  { name: "Clothing", value: 300, color: "hsl(var(--chart-2))" },
  { name: "Books", value: 200, color: "hsl(var(--chart-3))" },
  { name: "Home", value: 100, color: "hsl(var(--chart-4))" },
]

const trafficData = [
  { time: "00:00", visitors: 20 },
  { time: "04:00", visitors: 15 },
  { time: "08:00", visitors: 80 },
  { time: "12:00", visitors: 120 },
  { time: "16:00", visitors: 100 },
  { time: "20:00", visitors: 60 },
]

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    sections: [
      { name: "Overview", key: "overview" },
      { name: "Analytics", key: "analytics" },
    ],
  },
  {
    title: "IT Requests",
    icon: Monitor,
    sections: [
      { name: "Statistics", key: "it-statistics", isExternal: true, href: "/it-statistics" },
    ],
  },
  {
    title: "Chat Support",
    icon: MessageCircle,
    sections: [
      { name: "IT Chatbot", key: "chat", isExternal: true, href: "/chat" },
    ],
  },
  {
    title: "Sales",
    icon: DollarSign,
    sections: [
      { name: "Revenue", key: "revenue" },
      { name: "Orders", key: "orders" },
      { name: "Products", key: "products" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    sections: [
      { name: "User Growth", key: "user-growth" },
      { name: "Demographics", key: "demographics" },
      { name: "Activity", key: "user-activity" },
    ],
  },
  {
    title: "Reports",
    icon: FileText,
    sections: [
      { name: "Traffic", key: "traffic" },
      { name: "Performance", key: "performance" },
      { name: "Categories", key: "categories" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    sections: [
      { name: "General", key: "general" },
      { name: "Security", key: "security" },
    ],
  },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [expandedModule, setExpandedModule] = useState("Dashboard")
  const router = useRouter()

  const handleSectionClick = (section: any) => {
    if (section.isExternal && section.href) {
      router.push(section.href)
    } else {
      setActiveSection(section.key)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Total Revenue
                  </CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">$45,231.89</div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Active Users
                  </CardTitle>
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">2,350</div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Orders</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">12,234</div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    Growth Rate
                  </CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">+12.5%</div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">Sales Overview</CardTitle>
                  <CardDescription className="text-base">Monthly sales and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">User Growth</CardTitle>
                  <CardDescription className="text-base">Monthly active user acquisition</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      case "revenue":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      case "user-growth":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Analysis</CardTitle>
                <CardDescription>Track user acquisition and retention</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      case "categories":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Sales breakdown by product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      case "traffic":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
                <CardDescription>Daily visitor patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto mb-6">
                <BarChart3 className="h-12 w-12 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a section</h3>
              <p className="text-muted-foreground text-base">
                Choose a section from the sidebar to view detailed analytics
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="p-8 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Analytics & Insights</p>
        </div>
        <nav className="p-6 space-y-3">
          {menuItems.map((module) => {
            const Icon = module.icon
            const isExpanded = expandedModule === module.title

            return (
              <div key={module.title}>
                <Button
                  variant="ghost"
                  className={`w-full justify-between text-left font-medium h-12 px-4 ${
                    isExpanded
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => setExpandedModule(isExpanded ? "" : module.title)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {module.title}
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </Button>
                {isExpanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {module.sections.map((section) => (
                      <Button
                        key={section.key}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-sm h-10 px-3 ${
                          activeSection === section.key
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => handleSectionClick(section)}
                      >
                        {section.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {menuItems.find((m) => m.sections.some((s) => s.key === activeSection))?.title || "Dashboard"}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                {menuItems
                  .find((m) => m.sections.some((s) => s.key === activeSection))
                  ?.sections.find((s) => s.key === activeSection)?.name || "Overview"}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 text-sm font-medium"
            >
              ● Live Data
            </Badge>
          </div>
        </header>

        <main className="p-8">{renderContent()}</main>
      </div>
    </div>
  )
}
