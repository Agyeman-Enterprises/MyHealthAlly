import SwiftUI

struct CoachView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    Text("Coach Feed")
                        .font(.system(size: 22, weight: .medium))
                        .padding()
                    
                    Text("Educational content and guidance will appear here.")
                        .font(.system(size: 17))
                        .foregroundColor(.secondary)
                        .padding()
                }
            }
            .navigationTitle("Coach")
        }
    }
}

