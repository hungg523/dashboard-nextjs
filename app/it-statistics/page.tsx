"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, FileText, Clock, CheckCircle, TrendingUp, Search, RefreshCw } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface StatisticsData {
  tongSoPhieu: number
  soPhieuMoi: number
  soPhieuDangXuLy: number
  soPhieuHoanThanh: number
  phanTramHoanThanh: number
  thongKeTheoLoai: Record<string, number>
  thongKeTheoBoPhan: Record<string, number>
}

interface ApiResponse {
  success: boolean
  message: string | null
  data: StatisticsData
  errors: string | null
  statusCode: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function ITStatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tuNgay, setTuNgay] = useState("2025-01-01")
  const [denNgay, setDenNgay] = useState("2025-08-25")
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      const startDate = fromDate || tuNgay
      const endDate = toDate || denNgay
      const response = await fetch(`/api/statistics?tuNgay=${startDate}&denNgay=${endDate}`)
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu thống kê')
      }

      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setData(result.data)
        // Check if using mock data
        const usingMock = result.message && result.message.includes('dữ liệu mẫu')
        setIsUsingMockData(!!usingMock)
        if (usingMock) {
          console.warn('Using mock data:', result.message)
        }
      } else {
        setError(result.message || 'Có lỗi xảy ra khi tải dữ liệu')
        setIsUsingMockData(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchStatistics(tuNgay, denNgay)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={handleSearch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-gray-600">Không có dữ liệu</p>
      </div>
    )
  }

  // Prepare chart data
  const categoryData = Object.entries(data.thongKeTheoLoai).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / data.tongSoPhieu) * 100).toFixed(1)
  }))

  const departmentData = Object.entries(data.thongKeTheoBoPhan).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / data.tongSoPhieu) * 100).toFixed(1)
  }))

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Date Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê Phiếu yêu cầu IT</h1>
            <p className="text-gray-600 mt-2">Từ ngày {tuNgay} đến {denNgay}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Cập nhật lúc: {new Date().toLocaleString('vi-VN')}
          </Badge>
        </div>
        
        {/* Date Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="tuNgay">Từ ngày</Label>
                <Input
                  id="tuNgay"
                  type="date"
                  value={tuNgay}
                  onChange={(e) => setTuNgay(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="denNgay">Đến ngày</Label>
                <Input
                  id="denNgay"
                  type="date"
                  value={denNgay}
                  onChange={(e) => setDenNgay(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Tìm kiếm
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fetchStatistics()} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mock Data Warning */}
      {isUsingMockData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <p className="text-yellow-800 text-sm">
              <strong>Thông báo:</strong> Hiện đang sử dụng dữ liệu mẫu do không thể kết nối với API backend. 
              Vui lòng kiểm tra kết nối mạng và cấu hình CORS trên server.
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng số phiếu</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.tongSoPhieu}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Phiếu mới</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.soPhieuMoi}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.soPhieuDangXuLy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{data.soPhieuHoanThanh}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Tỉ lệ hoàn thành
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiến độ hoàn thành</span>
              <span className="text-2xl font-bold text-emerald-600">{data.phanTramHoanThanh}%</span>
            </div>
            <Progress value={data.phanTramHoanThanh} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{data.soPhieuHoanThanh} hoàn thành</span>
              <span>{data.tongSoPhieu - data.soPhieuHoanThanh} còn lại</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo loại yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo bộ phận</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Table */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết theo loại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.value} phiếu</Badge>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Table */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết theo bộ phận</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departmentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.value} phiếu</Badge>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
