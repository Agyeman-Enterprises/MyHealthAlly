import Foundation

struct Patient: Codable, Identifiable {
    let id: String
    let userId: String
    let clinicId: String
    let firstName: String?
    let lastName: String?
    let dateOfBirth: Date?
    let demographics: [String: AnyCodable]?
    let flags: [String]
}

struct Measurement: Codable, Identifiable {
    let id: String
    let patientId: String
    let type: MeasurementType
    let value: MeasurementValue
    let timestamp: Date
    let source: String
    let metadata: [String: AnyCodable]?
}

enum MeasurementType: String, Codable {
    case bloodPressure = "BLOOD_PRESSURE"
    case glucose = "GLUCOSE"
    case weight = "WEIGHT"
    case heartRate = "HEART_RATE"
    case steps = "STEPS"
    case sleep = "SLEEP"
    case hrv = "HRV"
}

enum MeasurementValue: Codable {
    case number(Double)
    case object([String: Double])
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let number = try? container.decode(Double.self) {
            self = .number(number)
        } else if let object = try? container.decode([String: Double].self) {
            self = .object(object)
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid measurement value")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .number(let value):
            try container.encode(value)
        case .object(let value):
            try container.encode(value)
        }
    }
}

struct BloodPressureValue {
    let systolic: Double
    let diastolic: Double
}

struct Alert: Codable, Identifiable {
    let id: String
    let patientId: String
    let severity: AlertSeverity
    let type: AlertType
    let title: String
    let body: String
    let payload: [String: AnyCodable]?
    let status: AlertStatus
    let createdAt: Date
    let resolvedAt: Date?
}

enum AlertSeverity: String, Codable {
    case info = "INFO"
    case warning = "WARNING"
    case critical = "CRITICAL"
}

enum AlertType: String, Codable {
    case bpHighTrend = "BP_HIGH_TREND"
    case glucoseHigh = "GLUCOSE_HIGH"
    case noData = "NO_DATA"
    case visitRequested = "VISIT_REQUESTED"
    case medicationAdherence = "MEDICATION_ADHERENCE"
}

enum AlertStatus: String, Codable {
    case active = "ACTIVE"
    case resolved = "RESOLVED"
    case dismissed = "DISMISSED"
}

struct CarePlan: Codable, Identifiable {
    let id: String
    let patientId: String
    let phases: [CarePlanPhase]
    let createdAt: Date
    let updatedAt: Date
}

struct CarePlanPhase: Codable {
    let phase: Int
    let name: String
    let progress: Double
    let startDate: Date?
    let endDate: Date?
    let tasks: [CarePlanTask]?
}

struct CarePlanTask: Codable, Identifiable {
    let id: String
    let type: TaskType
    let title: String
    let subtitle: String?
    let status: TaskStatus
    let dueDate: Date?
    let completedAt: Date?
}

enum TaskType: String, Codable {
    case medication = "MEDICATION"
    case habit = "HABIT"
    case tracking = "TRACKING"
    case education = "EDUCATION"
    case visit = "VISIT"
}

enum TaskStatus: String, Codable {
    case due = "DUE"
    case overdue = "OVERDUE"
    case completed = "COMPLETED"
}

struct VisitRequest: Codable, Identifiable {
    let id: String
    let patientId: String
    let type: VisitRequestType
    let status: VisitRequestStatus
    let requestedAt: Date
    let scheduledAt: Date?
    let notes: String?
}

enum VisitRequestType: String, Codable {
    case maCheck = "MA_CHECK"
    case provider = "PROVIDER"
}

enum VisitRequestStatus: String, Codable {
    case pending = "PENDING"
    case scheduled = "SCHEDULED"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
}

// Helper for AnyCodable
struct AnyCodable: Codable {
    let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "AnyCodable value cannot be decoded")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: container.codingPath, debugDescription: "AnyCodable value cannot be encoded"))
        }
    }
}

