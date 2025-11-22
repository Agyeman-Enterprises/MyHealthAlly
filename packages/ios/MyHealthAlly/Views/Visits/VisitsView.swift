import SwiftUI

struct VisitsView: View {
    @StateObject private var viewModel = VisitsViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    Button(action: {
                        viewModel.requestVisit()
                    }) {
                        Text("Request Check-in")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color(hex: "2A7F79"))
                            .cornerRadius(12)
                    }
                    .padding()
                    
                    if viewModel.visitRequests.isEmpty {
                        Text("No visit requests")
                            .font(.system(size: 17))
                            .foregroundColor(.secondary)
                            .padding()
                    } else {
                        ForEach(viewModel.visitRequests) { request in
                            VisitRequestCard(request: request)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Visits")
            .task {
                await viewModel.loadData()
            }
        }
    }
}

struct VisitRequestCard: View {
    let request: VisitRequest
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(request.type == .maCheck ? "MA Check" : "Provider Visit")
                    .font(.system(size: 17, weight: .medium))
                Spacer()
                Badge(text: request.status.rawValue, color: statusColor)
            }
            
            Text("Requested: \(request.requestedAt.formatted(date: .abbreviated, time: .shortened))")
                .font(.system(size: 15))
                .foregroundColor(.secondary)
            
            if let scheduledAt = request.scheduledAt {
                Text("Scheduled: \(scheduledAt.formatted(date: .abbreviated, time: .shortened))")
                    .font(.system(size: 15))
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
    
    private var statusColor: Color {
        switch request.status {
        case .pending:
            return .orange
        case .scheduled:
            return Color(hex: "2A7F79")
        case .completed:
            return .green
        case .cancelled:
            return .red
        }
    }
}

@MainActor
class VisitsViewModel: ObservableObject {
    @Published var visitRequests: [VisitRequest] = []
    
    func loadData() async {
        // Load visit requests from API
    }
    
    func requestVisit() {
        Task {
            do {
                let request: VisitRequest = try await APIClient.shared.post(
                    "/patients/\(AuthManager.shared.currentUser?.patientId ?? "")/visit-requests",
                    body: ["type": "PROVIDER"]
                )
                await MainActor.run {
                    visitRequests.append(request)
                }
            } catch {
                print("Failed to request visit: \(error)")
            }
        }
    }
}

