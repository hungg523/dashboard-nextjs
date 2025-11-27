// Interface cho thống kê theo loại
export interface ThongKeTheoLoai {
  [key: string]: number;
}

// Interface cho thống kê theo bộ phận
export interface ThongKeTheoBoPhan {
  [key: string]: number;
}

// Interface cho dữ liệu thống kê chính
export interface StatisticsData {
  tongSoPhieu: number;
  soPhieuMoi: number;
  soPhieuDangXuLy: number;
  soPhieuHoanThanh: number;
  phanTramHoanThanh: number;
  thongKeTheoLoai: ThongKeTheoLoai;
  thongKeTheoBoPhan: ThongKeTheoBoPhan;
}

// Interface cho response API thống kê
export interface StatisticsResponse {
  success: boolean;
  message: string | null;
  data: StatisticsData;
  errors: string | null;
  statusCode: number;
}

// Interface cho tham số lọc thống kê
export interface StatisticsFilter {
  tuNgay?: string;
  denNgay?: string;
  boPhan?: string;
  loaiPhieu?: string;
}

// Interface cho thống kê chi tiết theo ngày
export interface DailyStatistics {
  ngay: string;
  soPhieu: number;
  soPhieuHoanThanh: number;
  phanTramHoanThanh: number;
}

// Interface cho thống kê xu hướng
export interface TrendStatistics {
  period: string;
  data: DailyStatistics[];
}
