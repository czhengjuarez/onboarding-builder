import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import './App.css';

// --- Icon Components ---
const CalendarIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
);

const DesignOpsIcon = () => (
    <img src="https://www.changyingart.com/Customized_Tools/Onboarding/AddMemberIcon.svg" alt="Onboarding Icon" width="24" height="24" />
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
);

// --- Simple Google Sign-In Button Component ---
const GoogleSignInButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="gsi-material-button">
        <div className="gsi-material-button-state"></div>
        <div className="gsi-material-button-content-wrapper">
            <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
            </div>
            <span className="gsi-material-button-contents">Sign in</span>
        </div>
    </button>
);

// --- Types ---
interface OnboardingItem {
    id: string;
    title: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
}

interface Resource {
    id: string;
    name: string;
    type: 'guide' | 'tool' | 'reference' | 'template' | 'database';
    url: string;
}

interface JTBDResource {
    id: string;
    category: string;
    job: string;
    situation: string;
    outcome: string;
    resources: Resource[];
}

interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// --- Default Data ---
const defaultOnboardingTemplate: Record<string, OnboardingItem[]> = {
    firstDay: [
        { id: '1', title: 'Welcome orientation and team introductions', completed: false, priority: 'high' },
        { id: '2', title: 'Set up workspace and equipment', completed: false, priority: 'high' },
        { id: '3', title: 'Review company handbook and policies', completed: false, priority: 'medium' },
        { id: '4', title: 'Meet with direct manager', completed: false, priority: 'high' }
    ],
    firstWeek: [
        { id: '5', title: 'Complete design tool training modules', completed: false, priority: 'high' },
        { id: '6', title: 'Shadow team members on current projects', completed: false, priority: 'medium' },
        { id: '7', title: 'Set up development environment', completed: false, priority: 'high' }
    ],
    secondWeek: [
        { id: '8', title: 'Participate in weekly design critiques', completed: false, priority: 'medium' },
        { id: '9', title: 'Begin first independent task assignment', completed: false, priority: 'high' },
        { id: '10', title: 'Meet with cross-functional team members', completed: false, priority: 'medium' }
    ],
    thirdWeek: [
        { id: '11', title: 'Present first project deliverable to team', completed: false, priority: 'high' },
        { id: '12', title: 'Participate in client feedback session', completed: false, priority: 'medium' },
        { id: '13', title: 'Begin contributing to team documentation', completed: false, priority: 'medium' }
    ],
    firstMonth: [
        { id: '14', title: 'Shadow senior team members on client projects', completed: false, priority: 'medium' },
        { id: '15', title: 'Complete first independent task assignment', completed: false, priority: 'high' },
        { id: '16', title: 'Attend team retrospective meeting', completed: false, priority: 'low' }
    ]
};

const defaultJtbdResources: JTBDResource[] = [
    {
        id: 'default-jtbd-1',
        category: 'Design Tools & Systems',
        job: 'create consistent designs',
        situation: 'access to design systems and tools',
        outcome: 'work efficiently and maintain brand consistency',
        resources: [
            { id: 'default-res-1', name: 'Figma Component Library', type: 'tool', url: '#' },
            { id: 'default-res-2', name: 'Design System Documentation', type: 'guide', url: '#' },
            { id: 'default-res-3', name: 'Brand Guidelines', type: 'reference', url: '#' }
        ]
    },
    {
        id: 'default-jtbd-2',
        category: 'Process & Workflow',
        job: 'understand our design process',
        situation: 'clear workflow documentation',
        outcome: 'collaborate effectively with my team',
        resources: [
            { id: 'default-res-4', name: 'Design Process Playbook', type: 'guide', url: '#' },
            { id: 'default-res-5', name: 'Critique Guidelines', type: 'reference', url: '#' },
            { id: 'default-res-6', name: 'Handoff Checklist', type: 'template', url: '#' }
        ]
    },
    {
        id: 'default-jtbd-3',
        category: 'Research & Strategy',
        job: 'make informed design decisions',
        situation: 'access to user research and strategy docs',
        outcome: 'design with user needs in mind',
        resources: [
            { id: 'default-res-7', name: 'User Research Repository', type: 'database', url: '#' },
            { id: 'default-res-8', name: 'Question Bank', type: 'guide', url: '#' },
            { id: 'default-res-9', name: 'Usability Testing Templates', type: 'template', url: '#' }
        ]
    }
];

// Authentication Modal Component
interface AuthModalProps {
    onClose: () => void
    onEmailAuth: (email: string, password: string, name?: string, isLogin?: boolean) => Promise<{ success: boolean; error?: string }>
    onGoogleAuth: () => void
}

function AuthModal({ onClose, onEmailAuth, onGoogleAuth }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const result = await onEmailAuth(email, password, name, isLogin)
        
        if (result.success) {
            // Reset form
            setEmail('')
            setPassword('')
            setName('')
            onClose()
        } else {
            setError(result.error || 'Authentication failed')
        }
        
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    <button
                        onClick={onGoogleAuth}
                        className="w-full mt-4 flex items-center justify-center space-x-2 border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Account Management Modal Component
interface AccountModalProps {
    user: any
    onClose: () => void
    onDeleteAccount: () => void
}

function AccountModal({ user, onClose, onDeleteAccount }: AccountModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Account Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Profile Information</h3>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-500">Name:</span>
                                <span className="ml-2 text-sm text-gray-900">{user?.name}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Email:</span>
                                <span className="ml-2 text-sm text-gray-900">{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Account Actions</h3>
                        <div className="space-y-2">
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete Account
                                </button>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-sm text-red-800 mb-3">
                                        Are you sure you want to delete your account? This action cannot be undone and will delete all your data.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                onDeleteAccount()
                                                onClose()
                                            }}
                                            className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition-colors"
                                        >
                                            Yes, Delete
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="bg-gray-200 text-gray-800 px-3 py-1 text-sm rounded hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

function App() {
    // --- State Management ---
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'templates' | 'jtbd'>('templates');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('firstDay');
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Onboarding template state
    const [onboardingTemplate, setOnboardingTemplate] = useState<Record<string, OnboardingItem[]>>(defaultOnboardingTemplate);
    const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editingTaskText, setEditingTaskText] = useState('');
    const [showDropdown, setShowDropdown] = useState<string | null>(null);

    // JTBD resources state
    const [jtbdResources, setJtbdResources] = useState<JTBDResource[]>(defaultJtbdResources);
    const [newJTBD, setNewJTBD] = useState({ category: '', job: '', situation: '', outcome: '' });
    const [resourceInputs, setResourceInputs] = useState<Record<string, { name: string; type: Resource['type']; url: string }>>({});

    // --- Helper Functions ---
    const getResourceTypeIcon = (type: Resource['type']) => ({
        tool: '🛠️', 
        guide: '📖', 
        reference: '📋',
        template: '📝', 
        database: '🗄️'
    }[type] || '📄');

    // --- API Helper Functions ---
    const apiCall = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        
        return response.json() as Promise<ApiResponse<T>>;
    };

    // --- Authentication Functions ---
    const handleGoogleLogin = () => {
        // Redirect to Google OAuth
        window.location.href = '/api/auth/google';
    };
    
    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setOnboardingTemplate(defaultOnboardingTemplate);
        setJtbdResources([]);
    };
    
    // Authentication check on app load
    useEffect(() => {
        const checkAuthToken = async () => {
            // Check for token and user data in URL parameters (from OAuth callback)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            const urlUser = urlParams.get('user');
            
            if (urlToken && urlUser) {
                try {
                    const userData = JSON.parse(decodeURIComponent(urlUser));
                    setToken(urlToken);
                    setUser(userData);
                    setIsAuthenticated(true);
                    localStorage.setItem('auth_token', urlToken);
                    localStorage.setItem('auth_user', JSON.stringify(userData));
                    
                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (error) {
                    console.error('Error parsing URL auth data:', error);
                }
            } else {
                // Check for stored authentication
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');
                
                if (storedToken && storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        setToken(storedToken);
                        setUser(userData);
                        setIsAuthenticated(true);
                        
                        // Verify token is still valid
                        const response = await fetch('/api/auth/verify', {
                            headers: {
                                'Authorization': `Bearer ${storedToken}`
                            }
                        });
                        
                        if (!response.ok) {
                            // Token is invalid, clear auth
                            handleLogout();
                        }
                    } catch (error) {
                        console.error('Auth verification failed:', error);
                        handleLogout();
                    }
                }
            }
            setIsLoading(false);
        };
        
        checkAuthToken();
    }, []);
    // --- Data Loading Functions ---
    const loadOnboardingTemplates = useCallback(async () => {
        if (!user) return;
        
        try {
            setIsDataLoading(true);
            const response = await apiCall(`/templates/${user.id}`);
            
            if (response.success) {
                const templateData: Record<string, OnboardingItem[]> = {};
                response.data.forEach((item: any) => {
                    if (!templateData[item.period]) templateData[item.period] = [];
                    templateData[item.period].push({
                        id: item.id,
                        title: item.title,
                        completed: Boolean(item.completed),
                        priority: item.priority || 'medium'
                    });
                });
                
                // Merge with default data for empty periods
                const mergedTemplate = { ...defaultOnboardingTemplate };
                Object.keys(templateData).forEach(period => {
                    mergedTemplate[period] = templateData[period];
                });
                
                setOnboardingTemplate(mergedTemplate);
            } else {
                // If database fails, use default template
                console.warn('Database not available, using default template');
                setOnboardingTemplate(defaultOnboardingTemplate);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            // Fallback to default template if database is not available
            setOnboardingTemplate(defaultOnboardingTemplate);
        } finally {
            setIsDataLoading(false);
        }
    }, [user]);

    const loadJTBDResources = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await apiCall(`/jtbd/${user.id}`);
            
            if (response.success) {
                setJtbdResources(response.data);
            } else {
                // If database fails, use default JTBD resources
                console.warn('Database not available, using default JTBD resources');
                setJtbdResources(defaultJtbdResources);
            }
        } catch (error) {
            console.error('Failed to load JTBD resources:', error);
            // Fallback to default JTBD resources if database is not available
            setJtbdResources(defaultJtbdResources);
        }
    }, [user]);

    // --- Template Management Functions ---
    const addTask = async (period: string) => {
        const title = newTaskInputs[period]?.trim();
        if (!title || !user) return;

        try {
            const response = await apiCall('/templates', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.id,
                    period,
                    title,
                    priority: 'medium'
                })
            });

            if (response.success) {
                const newTask = response.data;
                setOnboardingTemplate(prev => ({
                    ...prev,
                    [period]: [...(prev[period] || []), newTask]
                }));
                setNewTaskInputs(prev => ({ ...prev, [period]: '' }));
            }
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const updateTask = async (taskId: string, updates: Partial<OnboardingItem>) => {
        // For demo purposes, work with local state first
        setOnboardingTemplate(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(period => {
                updated[period] = updated[period].map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                );
            });
            return updated;
        });
        
        // If we have a real user and API, also try to update backend
        if (user) {
            try {
                await apiCall(`/templates/${taskId}`, {
                    method: 'PUT',
                    body: JSON.stringify(updates)
                });
            } catch (error) {
                console.error('Failed to update task in backend:', error);
                // Don't revert local state - keep the update for better UX
            }
        }
    };

    const deleteTask = async (taskId: string) => {
        // For demo purposes, work with local state
        setOnboardingTemplate(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(period => {
                updated[period] = updated[period].filter(task => task.id !== taskId);
            });
            return updated;
        });
        
        // If we have a real user and API, also try to delete from backend
        if (user) {
            try {
                await apiCall(`/templates/${taskId}`, { method: 'DELETE' });
            } catch (error) {
                console.error('Failed to delete task from backend:', error);
                // Don't revert local state - keep the deletion for better UX
            }
        }
    };

    // --- JTBD Resource Management ---
    const handleAddJTBDResource = async () => {
        if (!newJTBD.category.trim() || !newJTBD.job.trim() || !newJTBD.situation.trim() || !newJTBD.outcome.trim() || !user) return;
        
        try {
            const response = await apiCall('/jtbd', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.id,
                    category: newJTBD.category,
                    job: newJTBD.job,
                    situation: newJTBD.situation,
                    outcome: newJTBD.outcome
                })
            });
            
            if (response.success) {
                setJtbdResources(prev => [...prev, response.data]);
                setNewJTBD({ category: '', job: '', situation: '', outcome: '' });
            }
        } catch (error) {
            console.error('Failed to add JTBD category:', error);
        }
    };

    const handleDeleteJTBDCategory = async (categoryId: string) => {
        // Update local state first
        setJtbdResources(prev => prev.filter(cat => cat.id !== categoryId));
        
        // If we have a real user and API, also try to sync with backend
        if (user) {
            try {
                await apiCall(`/jtbd/${categoryId}`, { method: 'DELETE' });
            } catch (error) {
                console.error('Failed to delete JTBD category from backend:', error);
            }
        }
    };
    
    // Helper function to get input state for a category
    const getResourceInput = (categoryId: string) => {
        return resourceInputs[categoryId] || { name: '', type: 'guide' as Resource['type'], url: '' };
    };

    // Helper function to update input state for a category
    const updateResourceInput = (categoryId: string, field: keyof Resource, value: string) => {
        setResourceInputs(prev => ({
            ...prev,
            [categoryId]: {
                ...getResourceInput(categoryId),
                [field]: value
            }
        }));
    };

    const handleAddResourceToCategory = async (categoryId: string) => {
        const input = getResourceInput(categoryId);
        if (!input.name.trim() || !input.url.trim() || !user) return;
        
        try {
            const response = await apiCall(`/jtbd/${categoryId}/resources`, {
                method: 'POST',
                body: JSON.stringify({
                    name: input.name,
                    type: input.type,
                    url: input.url
                })
            });
            
            if (response.success) {
                // Update local state with the new resource
                setJtbdResources(prev => prev.map(cat => 
                    cat.id === categoryId ? { ...cat, resources: [...cat.resources, response.data] } : cat
                ));
                
                // Clear the input for this category
                setResourceInputs(prev => ({
                    ...prev,
                    [categoryId]: { name: '', type: 'guide', url: '' }
                }));
            }
        } catch (error) {
            console.error('Failed to add resource:', error);
        }
    };

    const handleRemoveResourceFromCategory = async (categoryId: string, resourceId: string) => {
        if (!user) return;
        
        try {
            const response = await apiCall(`/jtbd/resources/${resourceId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                // Update local state after successful deletion
                setJtbdResources(prev => prev.map(cat => 
                    cat.id === categoryId ? { ...cat, resources: cat.resources.filter(res => res.id !== resourceId) } : cat
                ));
            }
        } catch (error) {
            console.error('Failed to remove resource:', error);
        }
    };

    // --- PDF Generation ---
    const generatePDF = async () => {
        const element = document.getElementById('onboarding-template');
        if (!element) return;

        try {
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('onboarding-template.pdf');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        }
    };

    // --- Effects ---

    useEffect(() => {
        if (user && activeTab === 'templates') {
            loadOnboardingTemplates();
        } else if (user && activeTab === 'jtbd') {
            loadJTBDResources();
        }
    }, [user, activeTab, loadOnboardingTemplates, loadJTBDResources]);

    // --- Render Functions ---
    const renderTaskItem = (task: OnboardingItem) => (
        <div key={task.id} className="task-item-enhanced group">
            <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => updateTask(task.id, { ...task, completed: e.target.checked })}
                className="task-checkbox-enhanced"
            />
            {editingTask === task.id ? (
                <div className="flex items-center gap-2 flex-1">
                    <input
                        type="text"
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                updateTask(task.id, { ...task, title: editingTaskText });
                                setEditingTask(null);
                            }
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        autoFocus
                    />
                    <button
                        onClick={() => {
                            handleGuestAction(() => {
                                updateTask(task.id, { ...task, title: editingTaskText });
                                setEditingTask(null);
                            });
                        }}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                    >
                        ✓
                    </button>
                    <button
                        onClick={() => setEditingTask(null)}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                        ✗
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between flex-1">
                    <span
                        className={`flex-1 cursor-pointer transition-colors ${
                            task.completed 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-800 hover:text-primary-600'
                        } ${
                            task.priority === 'high' ? 'font-semibold' : 
                            task.priority === 'medium' ? 'font-medium' : 'font-normal'
                        }`}
                        onClick={() => {
                            handleGuestAction(() => {
                                setEditingTask(task.id);
                                setEditingTaskText(task.title);
                            });
                        }}
                    >
                        {task.title}
                    </span>
                    <div className="flex items-center gap-2">
                        {/* Priority Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(showDropdown === task.id ? null : task.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                } hover:opacity-80`}
                            >
                                {task.priority}
                                <ChevronDownIcon />
                            </button>
                            {showDropdown === task.id && (
                                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                                    {['high', 'medium', 'low'].map(priority => (
                                        <button
                                            key={priority}
                                            onClick={() => {
                                                handleGuestAction(() => {
                                                    updateTask(task.id, { ...task, priority: priority as 'high' | 'medium' | 'low' });
                                                    setShowDropdown(null);
                                                });
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                                                priority === 'high' ? 'text-red-700' :
                                                priority === 'medium' ? 'text-yellow-700' :
                                                'text-green-700'
                                            } ${priority === task.priority ? 'bg-gray-50' : ''}`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Delete Button */}
                        <button
                            onClick={() => handleGuestAction(() => deleteTask(task.id))}
                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // Guest mode warning state
    const [showGuestWarning, setShowGuestWarning] = useState(false)
    const [pendingGuestAction, setPendingGuestAction] = useState<(() => void) | null>(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showAccountMenu, setShowAccountMenu] = useState(false)

    // Function to handle actions that require authentication in guest mode
    const handleGuestAction = (action: () => void) => {
        if (!user) {
            setPendingGuestAction(() => action)
            setShowAuthModal(true)
            setShowGuestWarning(true)
            return
        }
        action()
    }

    const proceedWithGuestAction = () => {
        if (pendingGuestAction) {
            pendingGuestAction()
        }
        setShowGuestWarning(false)
        setPendingGuestAction(null)
    }

    const cancelGuestAction = () => {
        setShowGuestWarning(false)
        setPendingGuestAction(null)
    }

    // Authentication functions
    const handleEmailAuth = async (email: string, password: string, name?: string, isLogin: boolean = true) => {
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
            const body = isLogin 
                ? { email, password }
                : { email, password, name }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            const data = await response.json() as any

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('authToken', data.token)
                setUser(data.user)
                setShowAuthModal(false)
                
                // Execute pending guest action if any
                if (pendingGuestAction) {
                    pendingGuestAction()
                    setPendingGuestAction(null)
                }
                setShowGuestWarning(false)
                
                return { success: true }
            } else {
                return { success: false, error: data.error || 'Authentication failed' }
            }
        } catch (err) {
            return { success: false, error: 'Network error. Please try again.' }
        }
    }

    const handleGoogleAuth = async () => {
        try {
            // Get Google Client ID from backend
            const configResponse = await fetch('/api/auth/config')
            const config = await configResponse.json() as any
            
            if (!config.googleClientId) {
                console.error('Google OAuth is not configured')
                return
            }
            
            // Redirect to Google OAuth
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${config.googleClientId}&` +
                `redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&` +
                `response_type=code&` +
                `scope=email profile`
            
            window.location.href = googleAuthUrl
        } catch (error) {
            console.error('Failed to initialize Google OAuth:', error)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data.')) {
            return
        }
        
        try {
            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            
            if (response.ok) {
                // Clear local storage and reset state
                localStorage.removeItem('authToken')
                setUser(null)
                setShowAccountMenu(false)
                
                // Reload to reset all data
                window.location.reload()
            } else {
                const data = await response.json() as any
                alert('Failed to delete account: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            alert('Network error. Please try again.')
        }
    }

    // Main Render ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="loading-spinner"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Guest Warning Modal */}
            {showGuestWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in to save changes</h3>
                        <p className="text-gray-600 mb-4">
                            Items created without signing in will be lost when you leave the page. 
                            Sign in with Google to save your progress.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowGuestWarning(false)
                                    setShowAuthModal(true)
                                }}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={proceedWithGuestAction}
                                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Continue anyway
                            </button>
                            <button
                                onClick={cancelGuestAction}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                    <DesignOpsIcon />
                    DesignOps Onboarding Template Builder
                    {!user && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">Guest Mode</span>}
                </h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => handleGuestAction(generatePDF)} className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-300 transition-colors text-sm font-medium">
                        <DownloadIcon />
                        Download PDF
                    </button>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {user.picture ? (
                                    <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">{user.name.charAt(0)}</div>
                                )}
                                <span className="text-gray-700 font-medium">{user.name}</span>
                            </button>
                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48 z-100">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setShowAccountMenu(true)
                                            setShowProfileMenu(false)
                                        }}
                                        className="w-full p-2 text-left hover:bg-gray-100 rounded transition-colors text-sm"
                                    >
                                        Account Settings
                                    </button>
                                    <button onClick={handleLogout} className="w-full p-2 text-left hover:bg-gray-100 rounded transition-colors text-sm">
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 px-6 flex gap-8">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`py-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'templates' 
                            ? 'text-primary-600 border-primary-600' 
                            : 'text-gray-500 border-transparent hover:text-primary-600'
                    }`}
                >
                    <CalendarIcon />
                    Templates
                </button>
                <button
                    onClick={() => setActiveTab('jtbd')}
                    className={`py-4 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                        activeTab === 'jtbd' 
                            ? 'text-primary-600 border-primary-600' 
                            : 'text-gray-500 border-transparent hover:text-primary-600'
                    }`}
                >
                    <CheckIcon />
                    Resources
                </button>
            </nav>

            {/* Main Content */}
            <main className="p-6 max-w-6xl mx-auto">
                {activeTab === 'templates' && (
                    <div className="flex gap-6">
                        {/* Left Sidebar - Period Navigation */}
                        <div className="w-64 flex-shrink-0">
                            <div className="card-enhanced">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-800">Onboarding Periods</h3>
                                </div>
                                <div className="p-2">
                                    {[
                                        { key: 'firstDay', label: 'First Day' },
                                        { key: 'firstWeek', label: 'First Week' },
                                        { key: 'secondWeek', label: 'Second Week' },
                                        { key: 'thirdWeek', label: 'Third Week' },
                                        { key: 'firstMonth', label: 'First Month' }
                                    ].map(period => (
                                        <button
                                            key={period.key}
                                            onClick={() => setSelectedPeriod(period.key)}
                                            className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                                                selectedPeriod === period.key
                                                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {period.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Selected Period Tasks */}
                        <div className="flex-1">
                            <div className="card-enhanced">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {selectedPeriod === 'firstDay' && 'First Day Tasks'}
                                        {selectedPeriod === 'firstWeek' && 'First Week Tasks'}
                                        {selectedPeriod === 'secondWeek' && 'Second Week Tasks'}
                                        {selectedPeriod === 'thirdWeek' && 'Third Week Tasks'}
                                        {selectedPeriod === 'firstMonth' && 'First Month Tasks'}
                                    </h2>
                                </div>
                                
                                {isDataLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="loading-spinner"></div>
                                    </div>
                                ) : (
                                    <div id="onboarding-template" className="p-6">
                                        <div className="flex gap-3 mb-6">
                                            <input
                                                type="text"
                                                placeholder="Add a new task..."
                                                value={newTaskInputs[selectedPeriod] || ''}
                                                onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [selectedPeriod]: e.target.value }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleGuestAction(() => addTask(selectedPeriod));
                                                    }
                                                }}
                                                className="form-input-enhanced flex-1"
                                            />
                                            <button
                                                onClick={() => handleGuestAction(() => addTask(selectedPeriod))}
                                                className="btn-primary-enhanced flex-shrink-0"
                                            >
                                                <PlusIcon />
                                                Add
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {onboardingTemplate[selectedPeriod]?.map(task => renderTaskItem(task))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'jtbd' && (
                    <div>
                        <div className="card-enhanced mb-6">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Resources Creator</h2>
                                    <p className="text-gray-600 text-sm mt-1">Create resource libraries organized by user needs and outcomes</p>
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {jtbdResources.length} resource categories
                                </span>
                            </div>
                            
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Resource Category</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Design Tools & Systems"
                                            value={newJTBD.category}
                                            onChange={(e) => setNewJTBD(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">When I need to...</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., create consistent designs"
                                            value={newJTBD.job}
                                            onChange={(e) => setNewJTBD(prev => ({ ...prev, job: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">I want...</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., access to design systems and tools"
                                            value={newJTBD.situation}
                                            onChange={(e) => setNewJTBD(prev => ({ ...prev, situation: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">So I can...</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., work efficiently and maintain consistency"
                                            value={newJTBD.outcome}
                                            onChange={(e) => setNewJTBD(prev => ({ ...prev, outcome: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleGuestAction(handleAddJTBDResource)} 
                                    className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors font-medium"
                                >
                                    <PlusIcon />
                                    Add Resource Category
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {jtbdResources.map(resource => (
                                <div key={resource.id} className="card-enhanced">
                                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">{resource.category}</h3>
                                        <button
                                            onClick={() => handleGuestAction(() => handleDeleteJTBDCategory(resource.id))}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm text-gray-700">
                                                <strong>When I need to</strong> {resource.job}, 
                                                <strong> I want</strong> {resource.situation}, 
                                                <strong> so I can</strong> {resource.outcome}.
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Add Resource</h4>
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Resource name"
                                                        value={getResourceInput(resource.id).name}
                                                        onChange={(e) => updateResourceInput(resource.id, 'name', e.target.value)}
                                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                    />
                                                    <select
                                                        value={getResourceInput(resource.id).type}
                                                        onChange={(e) => updateResourceInput(resource.id, 'type', e.target.value)}
                                                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="guide">📖 Guide</option>
                                                        <option value="tool">🛠️ Tool</option>
                                                        <option value="reference">📋 Reference</option>
                                                        <option value="template">📝 Template</option>
                                                        <option value="database">🗄️ Database</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        placeholder="https://example.com"
                                                        value={getResourceInput(resource.id).url}
                                                        onChange={(e) => updateResourceInput(resource.id, 'url', e.target.value)}
                                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                    />
                                                    <button
                                                        onClick={() => handleGuestAction(() => handleAddResourceToCategory(resource.id))}
                                                        className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Resources:</h4>
                                            {resource.resources.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No resources added yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {resource.resources.map((res) => (
                                                        <div key={res.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded group hover:bg-gray-50">
                                                            <a
                                                                href={res.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors flex-1"
                                                            >
                                                                <span>{getResourceTypeIcon(res.type)}</span>
                                                                <span>{res.name}</span>
                                                            </a>
                                                            <button
                                                                onClick={() => handleGuestAction(() => handleRemoveResourceFromCategory(resource.id, res.id))}
                                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Authentication Modal */}
            {showAuthModal && (
                <AuthModal 
                    onClose={() => setShowAuthModal(false)}
                    onEmailAuth={handleEmailAuth}
                    onGoogleAuth={handleGoogleAuth}
                />
            )}

            {/* Account Management Modal */}
            {showAccountMenu && (
                <AccountModal 
                    user={user}
                    onClose={() => setShowAccountMenu(false)}
                    onDeleteAccount={handleDeleteAccount}
                />
            )}
        </div>
    );
}

export default App;
