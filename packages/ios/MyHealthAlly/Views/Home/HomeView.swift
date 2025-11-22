import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var patient: Patient?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    if let patient = patient {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Hi \(patient.firstName ?? "there"),")
                                .font(.system(size: 22, weight: .medium))
                            Text("Here's your plan for today.")
                                .font(.system(size: 17))
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                        .padding(.top)
                    }
                    
                    // Progress Row
                    HStack(spacing: 16) {
                        ProgressCard(label: "Medications", progress: 0.75)
                        ProgressCard(label: "Tracking", progress: 0.40)
                        ProgressCard(label: "Habits", progress: 0.60)
                    }
                    .padding(.horizontal)
                    
                    // Alert Banner
                    if let alert = viewModel.activeAlert {
                        AlertBannerCard(alert: alert)
                            .padding(.horizontal)
                    }
                    
                    // Today's Priorities
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Today's priorities")
                            .font(.system(size: 18, weight: .medium))
                            .padding(.horizontal)
                        
                        ForEach(Array(viewModel.tasks.enumerated()), id: \.element.id) { index, task in
                            TaskCard(task: task)
                                .padding(.horizontal)
                                .opacity(viewModel.tasks.isEmpty ? 0 : 1)
                                .offset(y: viewModel.tasks.isEmpty ? 20 : 0)
                                .animation(
                                    .spring(response: 0.5, dampingFraction: 0.8)
                                    .delay(Double(index) * 0.1),
                                    value: viewModel.tasks.count
                                )
                        }
                    }
                    
                    // 3-Month Plan
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("Your 3-month plan")
                                .font(.system(size: 18, weight: .medium))
                            Spacer()
                            Button("View full plan") {}
                                .font(.system(size: 15))
                                .foregroundColor(Color(hex: "2A7F79"))
                        }
                        .padding(.horizontal)
                        
                        ForEach(viewModel.planPhases) { phase in
                            PlanPhaseCard(phase: phase)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Home")
            .task {
                await viewModel.loadData()
            }
        }
    }
}

struct ProgressCard: View {
    let label: String
    let progress: Double
    @State private var animatedProgress: Double = 0
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                    .frame(width: 60, height: 60)
                
                Circle()
                    .trim(from: 0, to: animatedProgress)
                    .stroke(Color(hex: "2A7F79"), style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(response: 0.6, dampingFraction: 0.8), value: animatedProgress)
                
                Text("\(Int(animatedProgress * 100))%")
                    .font(.system(size: 14, weight: .semibold))
            }
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .onAppear {
            withAnimation {
                animatedProgress = progress
            }
        }
    }
}

struct AlertBannerCard: View {
    let alert: Alert
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Circle()
                    .fill(severityColor)
                    .frame(width: 8, height: 8)
                Text(alert.title)
                    .font(.system(size: 17, weight: .semibold))
            }
            
            Text(alert.body)
                .font(.system(size: 15))
                .foregroundColor(.secondary)
            
            HStack(spacing: 12) {
                Button("Schedule check-in") {
                    // Handle action
                }
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color(hex: "2A7F79"))
                .cornerRadius(8)
                
                Button("Later") {
                    // Handle action
                }
                .font(.system(size: 15))
                .foregroundColor(Color(hex: "2A7F79"))
            }
        }
        .padding()
        .background(Color(hex: "F4F8F7"))
        .cornerRadius(16)
    }
    
    private var severityColor: Color {
        switch alert.severity {
        case .critical:
            return .red
        case .warning:
            return .orange
        case .info:
            return .blue
        }
    }
}

struct TaskCard: View {
    let task: CarePlanTask
    @State private var isPressed = false
    
    var body: some View {
        HStack(spacing: 16) {
            Circle()
                .fill(taskTypeColor)
                .frame(width: 40, height: 40)
                .scaleEffect(isPressed ? 0.95 : 1.0)
                .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.system(size: 17, weight: .medium))
                if let subtitle = task.subtitle {
                    Text(subtitle)
                        .font(.system(size: 15))
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Badge(text: statusText, color: statusColor)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: isPressed ? 2 : 4, x: 0, y: isPressed ? 1 : 2)
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .onTapGesture {
            // Haptic feedback on task completion
            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
            impactFeedback.impactOccurred()
            
            // Task completion haptic
            if task.status == .completed {
                let notificationFeedback = UINotificationFeedbackGenerator()
                notificationFeedback.notificationOccurred(.success)
            }
        }
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
    
    private var taskTypeColor: Color {
        switch task.type {
        case .medication:
            return Color(hex: "2A7F79")
        case .habit:
            return Color(hex: "47C1B9")
        case .tracking:
            return Color(hex: "E5A31A")
        default:
            return .gray
        }
    }
    
    private var statusText: String {
        switch task.status {
        case .due:
            return "Due today"
        case .overdue:
            return "Overdue"
        case .completed:
            return "Completed"
        }
    }
    
    private var statusColor: Color {
        switch task.status {
        case .due:
            return Color(hex: "2A7F79")
        case .overdue:
            return .red
        case .completed:
            return .green
        }
    }
}

struct PlanPhaseCard: View {
    let phase: CarePlanPhase
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Phase \(phase.phase): \(phase.name)")
                    .font(.system(size: 17, weight: .medium))
                Spacer()
                Text("\(Int(phase.progress))%")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(Color(hex: "2A7F79"))
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 8)
                        .cornerRadius(4)
                    
                    Rectangle()
                        .fill(Color(hex: "2A7F79"))
                        .frame(width: geometry.size.width * CGFloat(phase.progress / 100), height: 8)
                        .cornerRadius(4)
                }
            }
            .frame(height: 8)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

struct Badge: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color)
            .cornerRadius(8)
    }
}

@MainActor
class HomeViewModel: ObservableObject {
    @Published var tasks: [CarePlanTask] = []
    @Published var planPhases: [CarePlanPhase] = []
    @Published var activeAlert: Alert?
    
    func loadData() async {
        // Load tasks, plan phases, and alerts
        // For now, using mock data
        tasks = [
            CarePlanTask(
                id: "1",
                type: .medication,
                title: "Take Semaglutide 0.5 mg",
                subtitle: "Today · as prescribed",
                status: .due,
                dueDate: Date(),
                completedAt: nil
            ),
            CarePlanTask(
                id: "2",
                type: .tracking,
                title: "Check blood pressure",
                subtitle: "Rest 5 minutes before checking.",
                status: .due,
                dueDate: Date(),
                completedAt: nil
            ),
        ]
        
        planPhases = [
            CarePlanPhase(phase: 1, name: "Reset", progress: 40, startDate: nil, endDate: nil, tasks: nil),
            CarePlanPhase(phase: 2, name: "Rebuild", progress: 0, startDate: nil, endDate: nil, tasks: nil),
            CarePlanPhase(phase: 3, name: "Maintain", progress: 0, startDate: nil, endDate: nil, tasks: nil),
        ]
    }
}

