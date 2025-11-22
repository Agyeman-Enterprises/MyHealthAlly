import SwiftUI

struct MessagingView: View {
    @StateObject private var viewModel = MessagingViewModel()
    @State private var selectedThread: MessageThread?
    
    var body: some View {
        NavigationView {
            if let thread = selectedThread {
                MessageThreadView(thread: thread, viewModel: viewModel)
            } else {
                ThreadListView(viewModel: viewModel, selectedThread: $selectedThread)
            }
        }
    }
}

struct ThreadListView: View {
    @ObservedObject var viewModel: MessagingViewModel
    @Binding var selectedThread: MessageThread?
    
    var body: some View {
        List {
            ForEach(viewModel.threads) { thread in
                Button(action: {
                    selectedThread = thread
                }) {
                    ThreadRow(thread: thread)
                }
            }
        }
        .navigationTitle("Messages")
        .task {
            await viewModel.loadThreads()
        }
    }
}

struct ThreadRow: View {
    let thread: MessageThread
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(thread.patient?.firstName ?? thread.subject ?? "Conversation")
                    .font(.headline)
                if let lastMessage = thread.messages?.first {
                    Text(lastMessage.content)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }
            Spacer()
            if let lastMessageAt = thread.lastMessageAt {
                Text(lastMessageAt.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct MessageThreadView: View {
    let thread: MessageThread
    @ObservedObject var viewModel: MessagingViewModel
    @State private var messageText = ""
    @State private var messages: [Message] = []
    
    var body: some View {
        VStack(spacing: 0) {
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(messages) { message in
                            MessageBubble(message: message, isOwn: message.senderId == AuthManager.shared.currentUser?.id)
                                .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: messages.count) { _ in
                    if let lastMessage = messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMessage.id, anchor: .bottom)
                        }
                    }
                }
            }
            
            // Input
            HStack(spacing: 12) {
                Button(action: {
                    // TODO: Image picker
                }) {
                    Image(systemName: "photo")
                        .foregroundColor(Color(hex: "2A7F79"))
                }
                
                TextField("Type a message...", text: $messageText, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(1...4)
                
                Button(action: sendMessage) {
                    Image(systemName: "paperplane.fill")
                        .foregroundColor(.white)
                        .padding(8)
                        .background(messageText.isEmpty ? Color.gray : Color(hex: "2A7F79"))
                        .clipShape(Circle())
                }
                .disabled(messageText.isEmpty)
            }
            .padding()
            .background(Color(.systemBackground))
        }
        .navigationTitle(thread.patient?.firstName ?? "Messages")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadMessages()
        }
    }
    
    private func loadMessages() async {
        do {
            let threadData: MessageThread = try await APIClient.shared.get("/messaging/threads/\(thread.id)")
            await MainActor.run {
                messages = threadData.messages ?? []
            }
            
            // Mark as read
            try await APIClient.shared.post("/messaging/threads/\(thread.id)/read", body: [:] as [String: String])
        } catch {
            print("Failed to load messages: \(error)")
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        
        Task {
            do {
                let formData: [String: Any] = ["content": messageText]
                let message: Message = try await APIClient.shared.post(
                    "/messaging/threads/\(thread.id)/messages",
                    body: formData
                )
                
                await MainActor.run {
                    messages.append(message)
                    messageText = ""
                }
            } catch {
                print("Failed to send message: \(error)")
            }
        }
    }
}

struct MessageBubble: View {
    let message: Message
    let isOwn: Bool
    
    var body: some View {
        HStack {
            if isOwn {
                Spacer()
            }
            
            VStack(alignment: isOwn ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(isOwn ? Color(hex: "2A7F79") : Color(.systemGray5))
                    .foregroundColor(isOwn ? .white : .primary)
                    .cornerRadius(16)
                
                HStack(spacing: 4) {
                    Text(message.createdAt.formatted(date: .omitted, time: .shortened))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    if message.read && isOwn {
                        Image(systemName: "checkmark")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            if !isOwn {
                Spacer()
            }
        }
    }
}

@MainActor
class MessagingViewModel: ObservableObject {
    @Published var threads: [MessageThread] = []
    
    func loadThreads() async {
        do {
            let data: [MessageThread] = try await APIClient.shared.get("/messaging/threads")
            threads = data
        } catch {
            print("Failed to load threads: \(error)")
        }
    }
}

