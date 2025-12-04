import React from 'react'
import { Users, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

interface TeamTaskAssignment {
  taskId: number
  tieuDe: string
  noiDung: string
  nguoiYeuCau: string
  phongBan: string
  ngayYeuCau: string
  confidence: number
  reasoning: string
}

interface MemberOverview {
  userId: number
  tenNhanVien: string
  chuyenMon: string
  suggestedAssignments: TeamTaskAssignment[]
  currentWorkload: number
  totalSuggestions: number
}

interface TeamAssignmentsData {
  summary: string
  period: string
  totalNewTasks: number
  totalSuggestions: number
  totalInProgress: number
  totalOverdue: number
  memberOverviews: MemberOverview[]
}

interface TeamAssignmentsViewProps {
  data: TeamAssignmentsData | null
  isLoading: boolean
}

export const TeamAssignmentsView: React.FC<TeamAssignmentsViewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-600">Đang tải dữ liệu team...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500">
          <AlertCircle className="w-5 h-5" />
          <span>Không có dữ liệu để hiển thị</span>
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

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700'
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Cao'
    if (confidence >= 0.6) return 'Trung bình'
    return 'Thấp'
  }

  return (
    <div className="space-y-6">
      {/* Team Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Tổng quan Team</h3>
            <div className="grid grid-cols-4 gap-4">
              <div key="new-tasks" className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Phiếu mới</div>
                <div className="text-2xl font-bold text-blue-600">{data.totalNewTasks}</div>
              </div>
              <div key="suggestions" className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Gợi ý phân công</div>
                <div className="text-2xl font-bold text-green-600">{data.totalSuggestions}</div>
              </div>
              <div key="in-progress" className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Đang xử lý</div>
                <div className="text-2xl font-bold text-orange-600">{data.totalInProgress}</div>
              </div>
              <div key="overdue" className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-slate-500 mb-1">Quá hạn</div>
                <div className="text-2xl font-bold text-red-600">{data.totalOverdue}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member Assignments */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Tổng quan phân công Team
        </h3>

        {data.memberOverviews && data.memberOverviews.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-4">
            {data.memberOverviews.map((member) => (
              <div key={member.userId} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                {/* Member Header */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {getInitials(member.tenNhanVien)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{member.tenNhanVien}</div>
                    <div className="text-xs text-slate-500">{member.chuyenMon}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Workload</div>
                    <div className="text-lg font-semibold text-blue-600">{member.currentWorkload}</div>
                  </div>
                </div>

                {/* Suggestions */}
                {member.suggestedAssignments && member.suggestedAssignments.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Gợi ý phân công ({member.totalSuggestions})
                    </div>
                    {member.suggestedAssignments.map((task) => (
                      <div key={task.taskId} className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-800 line-clamp-1">{task.tieuDe}</div>
                            <div className="text-xs text-slate-600 mt-1 line-clamp-2">{task.noiDung}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getConfidenceColor(task.confidence)}`}>
                            {getConfidenceLabel(task.confidence)} ({Math.round(task.confidence * 100)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.nguoiYeuCau}
                          </span>
                          <span>{task.phongBan}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.ngayYeuCau).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {task.reasoning && (
                          <div className="text-xs text-slate-600 bg-white rounded p-2 border border-green-100">
                            <span className="font-medium">Lý do:</span> {task.reasoning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 text-center py-3 bg-gray-50 rounded">
                    Không có gợi ý phân công mới
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không có dữ liệu thành viên</p>
          </div>
        )}
      </div>
    </div>
  )
}
