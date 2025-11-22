import SwiftUI

struct SignInView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSignUp = false
    
    var body: some View {
        VStack(spacing: 24) {
            Text("Sign In")
                .font(.system(size: 34, weight: .semibold))
                .padding(.top, 40)
            
            VStack(spacing: 16) {
                TextField("Email", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                
                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)
                
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
                
                Button(action: signIn) {
                    if isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Sign In")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color(hex: "2A7F79"))
                .cornerRadius(12)
                .disabled(isLoading)
                
                Button(action: { showSignUp = true }) {
                    Text("Don't have an account? Sign Up")
                        .font(.system(size: 15))
                        .foregroundColor(Color(hex: "2A7F79"))
                }
            }
            .padding(.horizontal, 24)
            
            Spacer()
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showSignUp) {
            SignUpView()
        }
    }
    
    private func signIn() {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await authManager.login(email: email, password: password)
            } catch {
                await MainActor.run {
                    errorMessage = "Sign in failed. Please try again."
                    isLoading = false
                }
            }
        }
    }
}

struct SignUpView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Create Account")
                    .font(.system(size: 34, weight: .semibold))
                    .padding(.top, 40)
                
                VStack(spacing: 16) {
                    TextField("First Name", text: $firstName)
                        .textFieldStyle(.roundedBorder)
                    
                    TextField("Last Name", text: $lastName)
                        .textFieldStyle(.roundedBorder)
                    
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(.roundedBorder)
                    
                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                    
                    Button(action: signUp) {
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        } else {
                            Text("Sign Up")
                                .font(.system(size: 17, weight: .medium))
                                .foregroundColor(.white)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color(hex: "2A7F79"))
                    .cornerRadius(12)
                    .disabled(isLoading)
                }
                .padding(.horizontal, 24)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func signUp() {
        isLoading = true
        errorMessage = nil
        
        let request = RegisterRequest(
            email: email,
            password: password,
            role: "PATIENT",
            clinicId: nil,
            firstName: firstName,
            lastName: lastName
        )
        
        Task {
            do {
                try await authManager.register(request)
            } catch {
                await MainActor.run {
                    errorMessage = "Sign up failed. Please try again."
                    isLoading = false
                }
            }
        }
    }
}

