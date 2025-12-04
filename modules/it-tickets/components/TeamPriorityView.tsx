import React from 'react'
import { TrendingUp, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'

interface PriorityTask {
  taskId: number
  tieuDe: string
  noiDung: string
  nguoiYeuCau: string
  phongBan: string
  ngayYeuCau: string
  ngayHetHan?: string
  mucDoUuTien: string
  daysOverdue: number
  reasoning: string
}

interface MemberPriorityAnalysis {
  userId: number
  tenNhanVien: string
  chuyenMon: string
  highPriorityCount: number
  mediumPriorityCount: number
  lowPriorityCount: number
  overdueCount: number
  priorityTasks: PriorityTask[]
}

interface TeamPriorityData {
  summary: string
  period: string
  totalHighPriority: number
  totalMediumPriority: number
  totalLowPriority: number
  totalOverdue: number
  memberAnalyses: MemberPriorityAnalysis[]
}

interface TeamPriorityViewProps {
  data: TeamPriorityData | null
  isLoading: boolean
}

export const TeamPriorityView: React.FC<TeamPriorityViewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-600">Đang tải phân tích độ ưu tiên...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500">
          <AlertTriangle className="w-5 h-5" />
          <span>Không có dữ liệu phân tích</span>
        </div>
      </div>
    )
  }

  const getInitials = (name: string | undefined): string => {
    if (!name) return '??'
    const words = name.trim().split(' ')
    if (words.length >= 2) {
      return words[words.length - 2][0] + words[words.length - 1][0]
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'cao':
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'trung bình':
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'thấp':
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'cao':
      case 'high':
        return <AlertTriangle className="w-3 h-3" />
      case 'trung bình':
      case 'medium':
        return <TrendingUp className="w-3 h-3" />
      default:
        return <CheckCircle2 className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Priority Summary Stats */}
      <div className="bg-gradient-to-r from-orange-50 via-red-50 to-white border border-orange-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Phân tích độ ưu tiên Team</h3>
            <div className="grid grid-cols-4 gap-4">
              <div key="high-priority" className="bg-white rounded-lg p-3 shadow-sm border border-red-100">
                <div className="text-xs text-slate-500 mb-1">Ưu tiên cao</div>
                <div className="text-2xl font-bold text-red-600">{data.totalHighPriority}</div>
              </div>
              <div key="medium-priority" className="bg-white rounded-lg p-3 shadow-sm border border-orange-100">
                <div className="text-xs text-slate-500 mb-1">Ưu tiên trung bình</div>
                <div className="text-2xl font-bold text-orange-600">{data.totalMediumPriority}</div>
              </div>
              <div key="low-priority" className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                <div className="text-xs text-slate-500 mb-1">Ưu tiên thấp</div>
                <div className="text-2xl font-bold text-blue-600">{data.totalLowPriority}</div>
              </div>
              <div key="overdue" className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="text-xs text-slate-500 mb-1">Quá hạn</div>
                <div className="text-2xl font-bold text-gray-600">{data.totalOverdue}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Priority Analyses */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Phân tích chi tiết theo thành viên
        </h3>

        {data.memberAnalyses && data.memberAnalyses.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-4">
            {data.memberAnalyses.map((member) => (
              <div key={member.userId} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all">
                {/* Member Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {getInitials(member.tenNhanVien)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{member.tenNhanVien}</div>
                    <div className="text-xs text-slate-500">{member.chuyenMon}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Quá hạn</div>
                    <div className="text-lg font-semibold text-red-600">{member.overdueCount}</div>
                  </div>
                </div>

                {/* Priority Breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div key="high" className="bg-red-50 border border-red-100 rounded p-2 text-center">
                    <div className="text-xs text-red-600 mb-1">Cao</div>
                    <div className="text-lg font-bold text-red-700">{member.highPriorityCount}</div>
                  </div>
                  <div key="medium" className="bg-orange-50 border border-orange-100 rounded p-2 text-center">
                    <div className="text-xs text-orange-600 mb-1">TB</div>
                    <div className="text-lg font-bold text-orange-700">{member.mediumPriorityCount}</div>
                  </div>
                  <div key="low" className="bg-blue-50 border border-blue-100 rounded p-2 text-center">
                    <div className="text-xs text-blue-600 mb-1">Thấp</div>
                    <div className="text-lg font-bold text-blue-700">{member.lowPriorityCount}</div>
                  </div>
                </div>

                {/* Priority Tasks */}
                {member.priorityTasks && member.priorityTasks.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">
                      Các phiếu cần ưu tiên ({member.priorityTasks.length})
                    </div>
                    {member.priorityTasks.map((task) => (
                      <div key={task.taskId} className={`border rounded-lg p-3 space-y-2 ${
                        task.daysOverdue > 0 ? 'bg-red-50 border-red-200' : 
                        task.mucDoUuTien.toLowerCase() === 'cao' ? 'bg-orange-50 border-orange-200' : 
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-800 line-clamp-1">{task.tieuDe}</div>
                            <div className="text-xs text-slate-600 mt-1 line-clamp-2">{task.noiDung}</div>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap border flex items-center gap-1 ${getPriorityColor(task.mucDoUuTien)}`}>
                              {getPriorityIcon(task.mucDoUuTien)}
                              {task.mucDoUuTien}
                            </span>
                            {task.daysOverdue > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-600 text-white whitespace-nowrap">
                                Quá {task.daysOverdue} ngày
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.ngayYeuCau).toLocaleDateString('vi-VN')}
                          </span>
                          {task.ngayHetHan && (
                            <span className="text-red-600 font-medium">
                              Hạn: {new Date(task.ngayHetHan).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                          <span>{task.phongBan}</span>
                        </div>
                        {task.reasoning && (
                          <div className="text-xs text-slate-600 bg-white rounded p-2 border border-gray-200">
                            <span className="font-medium">Phân tích:</span> {task.reasoning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 text-center py-3 bg-gray-50 rounded">
                    Không có phiếu cần ưu tiên đặc biệt
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không có dữ liệu phân tích</p>
          </div>
        )}
      </div>
    </div>
  )
}
