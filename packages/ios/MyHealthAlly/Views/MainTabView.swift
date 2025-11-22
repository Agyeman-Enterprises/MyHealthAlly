import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            MetricsView()
                .tabItem {
                    Label("Metrics", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(1)
            
            CoachView()
                .tabItem {
                    Label("Coach", systemImage: "message.fill")
                }
                .tag(2)
            
            VisitsView()
                .tabItem {
                    Label("Visits", systemImage: "calendar")
                }
                .tag(3)
            
            MessagingView()
                .tabItem {
                    Label("Messages", systemImage: "message.fill")
                }
                .tag(4)
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(5)
        }
        .accentColor(Color(hex: "2A7F79"))
        .animation(.easeInOut(duration: 0.3), value: selectedTab)
        .onChange(of: selectedTab) { newValue in
            // Haptic feedback on tab change
            let selectionFeedback = UISelectionFeedbackGenerator()
            selectionFeedback.selectionChanged()
        }
    }
}

