import SwiftUI
import Charts

struct MetricsView: View {
    @StateObject private var viewModel = MetricsViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Tabs
                    Picker("Timeframe", selection: $viewModel.selectedTimeframe) {
                        Text("7 days").tag(0)
                        Text("30 days").tag(1)
                        Text("90 days").tag(2)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    
                    // Blood Pressure Section
                    MetricSection(
                        title: "Blood Pressure",
                        chartData: viewModel.bpData,
                        summary: viewModel.bpSummary,
                        alert: viewModel.bpAlert
                    )
                    
                    // Glucose Section
                    MetricSection(
                        title: "Glucose",
                        chartData: viewModel.glucoseData,
                        summary: viewModel.glucoseSummary,
                        alert: viewModel.glucoseAlert
                    )
                }
                .padding(.vertical)
            }
            .navigationTitle("Your trends")
            .task {
                await viewModel.loadData()
            }
        }
    }
}

struct MetricSection: View {
    let title: String
    let chartData: [ChartDataPoint]
    let summary: String?
    let alert: Alert?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.system(size: 22, weight: .medium))
                .padding(.horizontal)
            
            if !chartData.isEmpty {
                Chart(chartData) { point in
                    LineMark(
                        x: .value("Date", point.date),
                        y: .value("Value", point.value)
                    )
                    .foregroundStyle(Color(hex: "2A7F79"))
                }
                .frame(height: 200)
                .padding(.horizontal)
            }
            
            if let summary = summary {
                Text(summary)
                    .font(.system(size: 17))
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
            }
            
            if let alert = alert {
                AlertBannerCard(alert: alert)
                    .padding(.horizontal)
            }
        }
    }
}

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let value: Double
}

@MainActor
class MetricsViewModel: ObservableObject {
    @Published var selectedTimeframe = 0
    @Published var bpData: [ChartDataPoint] = []
    @Published var glucoseData: [ChartDataPoint] = []
    @Published var bpSummary: String?
    @Published var glucoseSummary: String?
    @Published var bpAlert: Alert?
    @Published var glucoseAlert: Alert?
    
    func loadData() async {
        // Load metrics data from API
        // For now, using mock data
        bpData = generateMockData(days: 7)
        glucoseData = generateMockData(days: 7, baseValue: 120)
    }
    
    private func generateMockData(days: Int, baseValue: Double = 120) -> [ChartDataPoint] {
        var data: [ChartDataPoint] = []
        let calendar = Calendar.current
        for i in 0..<days {
            if let date = calendar.date(byAdding: .day, value: -i, to: Date()) {
                let value = baseValue + Double.random(in: -10...10)
                data.append(ChartDataPoint(date: date, value: value))
            }
        }
        return data.reversed()
    }
}

