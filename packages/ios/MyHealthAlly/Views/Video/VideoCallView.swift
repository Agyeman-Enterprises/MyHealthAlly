import SwiftUI
import AVKit

struct VideoCallView: View {
    let roomName: String
    let token: String
    let onEndCall: () -> Void
    
    @State private var isMuted = false
    @State private var isVideoOff = false
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack {
                // Remote video (placeholder - would use Daily.co SDK)
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(
                        Text("Remote Video")
                            .foregroundColor(.white)
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                
                // Local video (picture-in-picture)
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Rectangle()
                            .fill(Color.gray.opacity(0.5))
                            .frame(width: 120, height: 90)
                            .overlay(
                                Text("You")
                                    .foregroundColor(.white)
                                    .font(.caption)
                            )
                            .cornerRadius(8)
                            .padding()
                    }
                }
                
                // Controls
                HStack(spacing: 24) {
                    Button(action: {
                        isMuted.toggle()
                        // TODO: Toggle microphone
                    }) {
                        Image(systemName: isMuted ? "mic.slash.fill" : "mic.fill")
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(isMuted ? Color.red : Color.gray.opacity(0.5))
                            .clipShape(Circle())
                    }
                    
                    Button(action: {
                        isVideoOff.toggle()
                        // TODO: Toggle camera
                    }) {
                        Image(systemName: isVideoOff ? "video.slash.fill" : "video.fill")
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(isVideoOff ? Color.red : Color.gray.opacity(0.5))
                            .clipShape(Circle())
                    }
                    
                    Button(action: onEndCall) {
                        Image(systemName: "phone.down.fill")
                            .foregroundColor(.white)
                            .frame(width: 56, height: 56)
                            .background(Color.red)
                            .clipShape(Circle())
                    }
                }
                .padding(.bottom, 40)
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            // TODO: Initialize Daily.co WebRTC
            print("Video call started: \(roomName)")
        }
    }
}

