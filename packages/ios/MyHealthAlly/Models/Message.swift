import Foundation

struct MessageThread: Codable, Identifiable {
    let id: String
    let patientId: String
    let clinicId: String?
    let subject: String?
    let lastMessageAt: Date?
    let createdAt: Date
    let updatedAt: Date
    let patient: PatientInfo?
    let messages: [Message]?
}

struct PatientInfo: Codable {
    let firstName: String?
    let lastName: String?
    let user: UserInfo?
}

struct UserInfo: Codable {
    let email: String
}

struct Message: Codable, Identifiable {
    let id: String
    let threadId: String
    let senderId: String
    let content: String
    let attachments: [MessageAttachment]?
    let read: Bool
    let readAt: Date?
    let createdAt: Date
}

struct MessageAttachment: Codable {
    let type: String
    let url: String
    let filename: String
    let size: Int
}

