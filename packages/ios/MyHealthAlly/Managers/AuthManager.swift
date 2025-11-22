import Foundation
import Combine

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let tokenKey = "auth_token"
    private let userKey = "current_user"
    
    private init() {
        loadAuthState()
    }
    
    func login(email: String, password: String) async throws {
        let request = LoginRequest(email: email, password: password)
        let response: AuthResponse = try await APIClient.shared.post("/auth/login", body: request)
        
        saveAuth(response)
        await MainActor.run {
            self.isAuthenticated = true
            self.currentUser = response.user
        }
    }
    
    func register(_ request: RegisterRequest) async throws {
        let response: AuthResponse = try await APIClient.shared.post("/auth/register", body: request)
        
        saveAuth(response)
        await MainActor.run {
            self.isAuthenticated = true
            self.currentUser = response.user
        }
    }
    
    func logout() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: userKey)
        isAuthenticated = false
        currentUser = nil
        APIClient.shared.clearToken()
    }
    
    private func saveAuth(_ response: AuthResponse) {
        UserDefaults.standard.set(response.accessToken, forKey: tokenKey)
        if let userData = try? JSONEncoder().encode(response.user) {
            UserDefaults.standard.set(userData, forKey: userKey)
        }
        APIClient.shared.setToken(response.accessToken)
    }
    
    private func loadAuthState() {
        if let token = UserDefaults.standard.string(forKey: tokenKey),
           let userData = UserDefaults.standard.data(forKey: userKey),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            APIClient.shared.setToken(token)
            isAuthenticated = true
            currentUser = user
        }
    }
}

