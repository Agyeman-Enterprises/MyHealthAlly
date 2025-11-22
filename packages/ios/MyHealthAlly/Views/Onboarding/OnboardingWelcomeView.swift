import SwiftUI

struct OnboardingWelcomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showSignIn = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "2A7F79"), Color(hex: "1B5854")],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                VStack(spacing: 32) {
                    Spacer()
                    
                    VStack(spacing: 16) {
                        Text("MyHealthAlly")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Your continuous-care companion.")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                        
                        Text("Track your health. Stay guided. Stay supported. Every day.")
                            .font(.system(size: 17))
                            .foregroundColor(.white.opacity(0.9))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    
                    Spacer()
                    
                    VStack(spacing: 16) {
                        Button(action: {
                            showSignIn = true
                        }) {
                            Text("Get Started")
                                .font(.system(size: 17, weight: .medium))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color(hex: "2A7F79"))
                                .cornerRadius(16)
                        }
                        
                        Button(action: {
                            showSignIn = true
                        }) {
                            Text("Sign In")
                                .font(.system(size: 17, weight: .medium))
                                .foregroundColor(Color(hex: "2A7F79"))
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(16)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.bottom, 40)
                }
            }
            .navigationDestination(isPresented: $showSignIn) {
                SignInView()
            }
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

