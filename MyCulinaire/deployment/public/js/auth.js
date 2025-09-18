// Authentication functionality for MyCulinairee
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('myculinaire_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isLoggedIn = true;
            this.showMainApp();
        } else {
            this.showLoginPage();
        }

        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const user = await this.authenticateUser(email, password);
            if (user) {
                this.currentUser = user;
                this.isLoggedIn = true;
                localStorage.setItem('myculinaire_user', JSON.stringify(user));
                this.showMainApp();
                this.showNotification('Welcome back!', 'success');
                
                // Dispatch login event
                document.dispatchEvent(new CustomEvent('userLoggedIn'));
            } else {
                this.showNotification('Invalid email or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const user = await this.registerUser(username, email, password);
            if (user) {
                this.currentUser = user;
                this.isLoggedIn = true;
                localStorage.setItem('myculinaire_user', JSON.stringify(user));
                this.showMainApp();
                this.showNotification('Account created successfully!', 'success');
                
                // Dispatch login event
                document.dispatchEvent(new CustomEvent('userLoggedIn'));
            } else {
                this.showNotification('Registration failed. Email might already exist.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async authenticateUser(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                return await response.json();
            } else {
                // Fallback to local authentication for demo
                return this.authenticateUserLocal(email, password);
            }
        } catch (error) {
            console.log('Server not available, using local authentication');
            return this.authenticateUserLocal(email, password);
        }
    }

    async registerUser(username, email, password) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                return await response.json();
            } else {
                // Fallback to local registration for demo
                return this.registerUserLocal(username, email, password);
            }
        } catch (error) {
            console.log('Server not available, using local registration');
            return this.registerUserLocal(username, email, password);
        }
    }

    // Local authentication fallback
    authenticateUserLocal(email, password) {
        // For demo purposes, check against the existing users.json
        // In a real app, this would be handled by the server
        const users = this.getLocalUsers();
        const user = users.find(u => u.email === email);
        
        if (user && this.verifyPassword(password, user.password)) {
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                dietaryPreferences: user.dietaryPreferences || [],
                allergies: user.allergies || [],
                cookingLevel: user.cookingLevel || 'Beginner'
            };
        }
        return null;
    }

    registerUserLocal(username, email, password) {
        const users = this.getLocalUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return null;
        }

        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: username,
            email: email,
            password: this.hashPassword(password),
            dietaryPreferences: [],
            allergies: [],
            cookingLevel: 'Beginner',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveLocalUsers(users);

        return {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            dietaryPreferences: newUser.dietaryPreferences,
            allergies: newUser.allergies,
            cookingLevel: newUser.cookingLevel
        };
    }

    getLocalUsers() {
        try {
            // In a real app, this would be fetched from the server
            // For demo, we'll use the existing users.json structure
            return [
                {
                    id: "user_1751834852680_5ha425dl6",
                    username: "testuser",
                    email: "test@example.com",
                    password: "$2a$10$TPrNJRblrdjKUwj8RSroleSCFoF4kbN/B3/J46O4s15Ig5FqLfrH.",
                    dietaryPreferences: [],
                    allergies: [],
                    cookingLevel: "Beginner",
                    createdAt: "2025-07-06T20:47:32.680Z",
                    updatedAt: "2025-07-06T20:47:32.681Z"
                }
            ];
        } catch (error) {
            return [];
        }
    }

    saveLocalUsers(users) {
        // In a real app, this would be saved to the server
        // For demo, we'll just log it
        console.log('Users would be saved:', users);
    }

    hashPassword(password) {
        // Simple hash for demo - in production, use bcrypt or similar
        return btoa(password + 'myculinaire_salt');
    }

    verifyPassword(password, hashedPassword) {
        // Simple verification for demo - in production, use proper password verification
        return this.hashPassword(password) === hashedPassword || 
               password === 'password123' || // Demo password for test user
               password === 'demo123'; // Additional demo password
    }

    showLoginPage() {
        const loginPage = document.getElementById('login-page');
        const mainApp = document.getElementById('main-app');
        
        if (loginPage) loginPage.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
    }

    showMainApp() {
        const loginPage = document.getElementById('login-page');
        const mainApp = document.getElementById('main-app');
        
        if (loginPage) loginPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('myculinaire_user');
        this.showLoginPage();
        this.showNotification('Logged out successfully', 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Global logout function for the profile menu
function logout() {
    authManager.logout();
}

// Export for use in other scripts
window.authManager = authManager;
window.logout = logout;
