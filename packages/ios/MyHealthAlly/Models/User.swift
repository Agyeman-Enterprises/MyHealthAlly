import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let role: String
    let clinicId: String?
    let patientId: String?
    let providerId: String?
}

struct AuthResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let user: User
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let role: String
    let clinicId: String?
    let firstName: String?
    let lastName: String?
}

