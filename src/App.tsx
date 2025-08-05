import React, { useState, useEffect, useCallback } from 'react';
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

const PencilIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
    </svg>
);

const SaveIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

const XMarkIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
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

const ShareIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
    </svg>
);

const CopyIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
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
                        className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

    // Template sharing state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareFormData, setShareFormData] = useState({ title: '', description: '', expiresIn: '', maxClones: '' });
    const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
    const [myShares, setMyShares] = useState<any[]>([]);
    const [showMySharesModal, setShowMySharesModal] = useState(false);
    const [isCreatingShare, setIsCreatingShare] = useState(false);
    
    // Invite link processing state
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [sharedTemplateData, setSharedTemplateData] = useState<any>(null);
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [isLoadingSharedTemplate, setIsLoadingSharedTemplate] = useState(false);
    const [shouldAutoCloneAfterAuth, setShouldAutoCloneAfterAuth] = useState(false);
    const [isCloningTemplate, setIsCloningTemplate] = useState(false);
    const [showCloneConfirmation, setShowCloneConfirmation] = useState(false);
    const [cloneConfirmationData, setCloneConfirmationData] = useState<any>(null);

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
        
        const checkInviteLink = async () => {
            // Check if URL contains invite token
            const path = window.location.pathname;
            const inviteMatch = path.match(/^\/invite\/([a-f0-9-]+)$/);
            
            if (inviteMatch) {
                const token = inviteMatch[1];
                setInviteToken(token);
                await loadSharedTemplate(token);
            }
        };
        
        checkAuthToken();
        checkInviteLink();
    }, []);

    // Auto-clone after authentication if flag is set
    useEffect(() => {
        console.log('Auto-clone useEffect triggered:', {
            isAuthenticated,
            shouldAutoCloneAfterAuth,
            inviteToken: !!inviteToken,
            user: !!user,
            token: !!token
        });
        
        if (isAuthenticated && shouldAutoCloneAfterAuth && inviteToken && user && token) {
            console.log('All conditions met, starting auto-clone process...');
            setShouldAutoCloneAfterAuth(false);
            setShowAuthModal(false);
            setShowCloneModal(false); // Close the clone modal
            
            // Small delay to ensure state updates are processed
            setTimeout(() => {
                handleCloneTemplate();
            }, 100);
        }
    }, [isAuthenticated, shouldAutoCloneAfterAuth, inviteToken, user, token]);
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
        if (!title) return;

        if (user) {
            // Authenticated user - save to database
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
        } else {
            // Guest user - work with local state only
            const newTask = {
                id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title,
                priority: 'medium' as const,
                completed: false
            };
            
            setOnboardingTemplate(prev => ({
                ...prev,
                [period]: [...(prev[period] || []), newTask]
            }));
            setNewTaskInputs(prev => ({ ...prev, [period]: '' }));
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
        if (!newJTBD.category.trim() || !newJTBD.job.trim() || !newJTBD.situation.trim() || !newJTBD.outcome.trim()) return;
        
        if (user) {
            // Authenticated user - save to database
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
        } else {
            // Guest user - work with local state only
            const newResource = {
                id: `guest-jtbd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                category: newJTBD.category,
                job: newJTBD.job,
                situation: newJTBD.situation,
                outcome: newJTBD.outcome,
                resources: []
            };
            
            setJtbdResources(prev => [...prev, newResource]);
            setNewJTBD({ category: '', job: '', situation: '', outcome: '' });
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
        if (!input.name.trim() || !input.url.trim()) return;
        
        if (user) {
            // Authenticated user - save to database
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
        } else {
            // Guest user - work with local state only
            const newResource = {
                id: `guest-resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: input.name,
                type: input.type,
                url: input.url
            };
            
            // Update local state with the new resource
            setJtbdResources(prev => prev.map(cat => 
                cat.id === categoryId ? { ...cat, resources: [...cat.resources, newResource] } : cat
            ));
            
            // Clear the input for this category
            setResourceInputs(prev => ({
                ...prev,
                [categoryId]: { name: '', type: 'guide', url: '' }
            }));
        }
    };

    const handleRemoveResourceFromCategory = async (categoryId: string, resourceId: string) => {
        if (user) {
            // Authenticated user - delete from database
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
        } else {
            // Guest user - work with local state only
            setJtbdResources(prev => prev.map(cat => 
                cat.id === categoryId ? { ...cat, resources: cat.resources.filter(res => res.id !== resourceId) } : cat
            ));
        }
    };

    // --- Resource and Category Editing Functions ---
    const startEditingResource = (resourceId: string, resource: Resource) => {
        setEditingResource(resourceId)
        setEditingResourceData({
            name: resource.name,
            type: resource.type,
            url: resource.url
        })
    }

    const startEditingCategory = (categoryId: string, category: JTBDResource) => {
        setEditingCategory(categoryId)
        setEditingCategoryData({
            category: category.category,
            job: category.job,
            situation: category.situation,
            outcome: category.outcome
        })
    }

    const saveResourceEdit = async (categoryId: string, resourceId: string) => {
        if (!editingResourceData) return

        if (user && token) {
            // Authenticated user - update via API
            try {
                const response = await fetch('/api/jtbd/resources', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        categoryId,
                        resourceId,
                        ...editingResourceData
                    })
                })

                if (response.ok) {
                    // Update local state
                    setJtbdResources(prev => prev.map(cat => 
                        cat.id === categoryId ? {
                            ...cat,
                            resources: cat.resources.map(res => 
                                res.id === resourceId ? { ...res, ...editingResourceData } : res
                            )
                        } : cat
                    ))
                }
            } catch (error) {
                console.error('Error updating resource:', error)
            }
        } else {
            // Guest user - update local state only
            setJtbdResources(prev => prev.map(cat => 
                cat.id === categoryId ? {
                    ...cat,
                    resources: cat.resources.map(res => 
                        res.id === resourceId ? { ...res, ...editingResourceData } : res
                    )
                } : cat
            ))
        }

        setEditingResource(null)
        setEditingResourceData(null)
    }

    const saveCategoryEdit = async (categoryId: string) => {
        if (!editingCategoryData) return

        if (user && token) {
            // Authenticated user - update via API
            try {
                const response = await fetch('/api/jtbd/categories', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        categoryId,
                        ...editingCategoryData
                    })
                })

                if (response.ok) {
                    // Update local state
                    setJtbdResources(prev => prev.map(cat => 
                        cat.id === categoryId ? { ...cat, ...editingCategoryData } : cat
                    ))
                }
            } catch (error) {
                console.error('Error updating category:', error)
            }
        } else {
            // Guest user - update local state only
            setJtbdResources(prev => prev.map(cat => 
                cat.id === categoryId ? { ...cat, ...editingCategoryData } : cat
            ))
        }

        setEditingCategory(null)
        setEditingCategoryData(null)
    }

    const cancelEdit = () => {
        setEditingResource(null)
        setEditingResourceData(null)
        setEditingCategory(null)
        setEditingCategoryData(null)
    }

    // --- PDF Generation ---
    const generatePDF = async () => {
        try {
            const pdf = new jsPDF();
            
            if (activeTab === 'templates') {
                // For Templates tab, use image-based PDF generation
                const element = document.getElementById('onboarding-template');
                if (!element) {
                    alert('No template content found to export');
                    return;
                }

                const canvas = await html2canvas(element);
                const imgData = canvas.toDataURL('image/png');
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
            } else if (activeTab === 'jtbd') {
                // For Resources tab, generate text-based PDF with preserved hyperlinks
                generateResourcesPDF(pdf);
            } else {
                alert('Please select Templates or Resources tab to export PDF');
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const generateResourcesPDF = (pdf: any) => {
        // Set up PDF styling
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let yPosition = margin;
        
        // Title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Resource Library', margin, yPosition);
        yPosition += 15;
        
        // Subtitle
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += 20;
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
        
        // Process each resource category
        jtbdResources.forEach((resource, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = margin;
            }
            
            // Category header
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(resource.category, margin, yPosition);
            yPosition += 10;
            
            // JTBD description
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(80, 80, 80);
            
            const jtbdText = `When I need to ${resource.job}, I want ${resource.situation}, so I can ${resource.outcome}.`;
            const wrappedText = pdf.splitTextToSize(jtbdText, contentWidth);
            pdf.text(wrappedText, margin, yPosition);
            yPosition += (wrappedText.length * 4) + 8;
            
            // Resources list
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Resources:', margin, yPosition);
            yPosition += 8;
            
            if (resource.resources.length === 0) {
                pdf.setFont('helvetica', 'italic');
                pdf.setFontSize(10);
                pdf.setTextColor(120, 120, 120);
                pdf.text('No resources added yet', margin + 10, yPosition);
                yPosition += 8;
            } else {
                resource.resources.forEach((res) => {
                    // Check if we need a new page for this resource
                    if (yPosition > pageHeight - 30) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(10);
                    pdf.setTextColor(0, 0, 0);
                    
                    // Resource name without emoji icons (for better PDF compatibility)
                    const resourceTypeText = res.type.charAt(0).toUpperCase() + res.type.slice(1);
                    const resourceText = `[${resourceTypeText}] ${res.name}`;
                    
                    // Add clickable hyperlink
                    if (res.url) {
                        pdf.setTextColor(0, 0, 255); // Blue color for links
                        pdf.textWithLink(resourceText, margin + 10, yPosition, { url: res.url });
                        
                        // Add URL in smaller text below
                        pdf.setFontSize(8);
                        pdf.setTextColor(100, 100, 100);
                        const urlText = res.url.length > 60 ? res.url.substring(0, 60) + '...' : res.url;
                        pdf.text(urlText, margin + 15, yPosition + 4);
                        yPosition += 8;
                    } else {
                        // If no URL, just display as regular text
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(resourceText, margin + 10, yPosition);
                    }
                    
                    yPosition += 6;
                });
            }
            
            yPosition += 10; // Space between categories
        });
        
        // Save the PDF
        pdf.save('resources.pdf');
    };

    // --- Template Sharing Functions ---

    const handleCreateShare = async () => {
        if (!user || !shareFormData.title.trim()) return;
        
        setIsCreatingShare(true);
        try {
            const response = await fetch('/api/templates/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    templateId: 'all', // Share entire template set
                    userId: user.id,
                    title: shareFormData.title,
                    description: shareFormData.description,
                    expiresIn: shareFormData.expiresIn ? parseInt(shareFormData.expiresIn) : null,
                    maxClones: shareFormData.maxClones ? parseInt(shareFormData.maxClones) : null
                })
            });
            
            const result = await response.json();
            if (result.success) {
                setGeneratedInviteLink(result.data.inviteUrl);
                // Reset form
                setShareFormData({ title: '', description: '', expiresIn: '', maxClones: '' });
            } else {
                alert('Failed to create share link: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating share:', error);
            alert('Failed to create share link');
        } finally {
            setIsCreatingShare(false);
        }
    };

    const handleCopyInviteLink = async (urlToCopy?: string) => {
        const linkToCopy = urlToCopy || generatedInviteLink;
        if (linkToCopy) {
            try {
                await navigator.clipboard.writeText(linkToCopy);
                alert('Invite link copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy link:', error);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = linkToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Invite link copied to clipboard!');
            }
        } else {
            alert('No link available to copy');
        }
    };

    const loadMyShares = async () => {
        if (!user) return;
        
        try {
            const response = await fetch(`/api/templates/my-shares/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            if (result.success) {
                setMyShares(result.data);
            }
        } catch (error) {
            console.error('Error loading shares:', error);
        }
    };

    const handleRevokeShare = async (shareId: string) => {
        if (!user) return;
        
        if (confirm('Are you sure you want to revoke this shared template? The invite link will no longer work.')) {
            try {
                const response = await fetch(`/api/templates/share/${shareId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userId: user.id })
                });
                
                const result = await response.json();
                if (result.success) {
                    loadMyShares(); // Refresh the list
                } else {
                    alert('Failed to revoke share: ' + result.error);
                }
            } catch (error) {
                console.error('Error revoking share:', error);
                alert('Failed to revoke share');
            }
        }
    };

    const handleOpenShareModal = () => {
        setShowShareModal(true);
        setGeneratedInviteLink(null);
    };

    const handleOpenMySharesModal = () => {
        setShowMySharesModal(true);
        loadMyShares();
    };

    // --- Invite Link Processing Functions ---

    const loadSharedTemplate = async (token: string) => {
        setIsLoadingSharedTemplate(true);
        try {
            const response = await fetch(`/api/templates/shared/${token}`);
            const result = await response.json();
            
            if (result.success) {
                setSharedTemplateData(result.data);
                setShowCloneModal(true);
            } else {
                alert('Failed to load shared template: ' + result.error);
                // Redirect to home page if template not found or expired
                window.history.replaceState({}, document.title, '/');
                setInviteToken(null);
            }
        } catch (error) {
            console.error('Error loading shared template:', error);
            alert('Failed to load shared template');
            window.history.replaceState({}, document.title, '/');
            setInviteToken(null);
        } finally {
            setIsLoadingSharedTemplate(false);
        }
    };

    const handleCloneTemplate = async () => {
        console.log('handleCloneTemplate called - checking required data:', {
            inviteToken: inviteToken,
            inviteTokenExists: !!inviteToken,
            user: user,
            userExists: !!user,
            token: token ? '[REDACTED]' : null,
            tokenExists: !!token
        });
        
        if (!inviteToken || !user || !token) {
            console.error('Missing required data for cloning:', { 
                inviteToken: !!inviteToken, 
                user: !!user, 
                token: !!token,
                actualInviteToken: inviteToken
            });
            return;
        }

        try {
            console.log('Proceeding with clone request:', {
                inviteToken,
                userId: user.id,
                userEmail: user.email,
                apiEndpoint: `/api/templates/clone/${inviteToken}`
            });
            
            setIsCloningTemplate(true);
            const response = await fetch(`/api/templates/clone/${inviteToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id
                })
            });
            
            console.log('Clone API response status:', response.status);
            const result = await response.json();
            console.log('Clone API result:', result);
            
            if (result.success) {
                console.log('Template cloned successfully, reloading data...');
                
                // Show success message with better UX
                alert(`Template cloned successfully! ${result.message || 'You now have access to the shared templates and resources.'}`);
                
                setShowCloneModal(false);
                setInviteToken(null);
                setSharedTemplateData(null);
                
                // Redirect to home page and reload data
                window.history.replaceState({}, document.title, '/');
                
                console.log('Reloading templates and resources...');
                // Reload both templates and resources to show all cloned content
                await Promise.all([
                    loadOnboardingTemplates(),
                    loadJTBDResources()
                ]);
                
                console.log('Data reloaded, switching to templates tab');
                // Switch to templates tab to show cloned templates
                setActiveTab('templates');
            } else if (result.requiresConfirmation) {
                console.log('Clone requires confirmation for existing user');
                setCloneConfirmationData(result);
                setShowCloneConfirmation(true);
                setShowCloneModal(false);
            } else {
                console.error('Clone failed:', result.error);
                alert('Failed to clone template: ' + result.error);
            }
        } catch (error) {
            console.error('Error cloning template:', error);
            alert('Failed to clone template');
        } finally {
            setIsCloningTemplate(false);
        }
    };

    const handleCloseCloneModal = () => {
        setShowCloneModal(false);
        setInviteToken(null);
        setSharedTemplateData(null);
        // Redirect to home page
        window.history.replaceState({}, document.title, '/');
    };

    const handleConfirmedClone = async () => {
        if (!inviteToken || !user || !token) {
            console.error('Missing required data for confirmed cloning');
            return;
        }

        try {
            setIsCloningTemplate(true);
            const response = await fetch(`/api/templates/clone/${inviteToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    confirmed: true // This tells the backend to proceed with the clone
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Template cloned successfully! ${result.message || 'The shared content has been added to your existing templates and resources.'}`);
                
                setShowCloneConfirmation(false);
                setCloneConfirmationData(null);
                setInviteToken(null);
                setSharedTemplateData(null);
                
                // Redirect to home page and reload data
                window.history.replaceState({}, document.title, '/');
                
                // Reload both templates and resources to show all content
                await Promise.all([
                    loadOnboardingTemplates(),
                    loadJTBDResources()
                ]);
                
                setActiveTab('templates');
            } else {
                console.error('Confirmed clone failed:', result.error);
                alert('Failed to clone template: ' + result.error);
            }
        } catch (error) {
            console.error('Error in confirmed clone:', error);
            alert('Failed to clone template');
        } finally {
            setIsCloningTemplate(false);
        }
    };

    const handleCancelClone = () => {
        setShowCloneConfirmation(false);
        setCloneConfirmationData(null);
        setInviteToken(null);
        setSharedTemplateData(null);
        // Redirect to home page
        window.history.replaceState({}, document.title, '/');
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
                                updateTask(task.id, { title: editingTaskText })
                                setEditingTask(null)
                                setEditingTaskText('')
                            }, 'add')
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
                                setEditingTask(task.id)
                                setEditingTaskText(task.title)
                            }, 'add');
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
                                                    updateTask(task.id, { priority: priority as 'high' | 'medium' | 'low' })
                                                    setShowDropdown(null)
                                                }, 'add');
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
                            onClick={() => handleGuestAction(() => deleteTask(task.id), 'delete')}
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
    const [pendingGuestAction, setPendingGuestAction] = useState<{action: () => void, type: 'add' | 'delete' | 'edit'} | null>(null)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showAccountMenu, setShowAccountMenu] = useState(false)
    const [showAccountDeletedModal, setShowAccountDeletedModal] = useState(false)
    const [deletedAccountEmail, setDeletedAccountEmail] = useState('')
    
    // Track which guest warnings have been dismissed
    // Format: 'templates-add', 'templates-delete', 'jtbd-add', 'jtbd-delete'
    const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set())

    // Editing state for resources and categories
    const [editingResource, setEditingResource] = useState<string | null>(null)
    const [editingCategory, setEditingCategory] = useState<string | null>(null)
    const [editingResourceData, setEditingResourceData] = useState<{ name: string; type: Resource['type']; url: string } | null>(null)
    const [editingCategoryData, setEditingCategoryData] = useState<{ category: string; job: string; situation: string; outcome: string } | null>(null)

    // Function to handle actions that require authentication in guest mode
    const handleGuestAction = (action: () => void, actionType: 'add' | 'delete' | 'edit' = 'add') => {
        if (!user) {
            const warningKey = `${activeTab}-${actionType}`
            
            // If this warning has already been dismissed, just execute the action
            if (dismissedWarnings.has(warningKey)) {
                action()
                return
            }
            
            // Otherwise, show the warning
            setPendingGuestAction({action, type: actionType})
            setShowGuestWarning(true)
            return
        }
        action()
    }

    const proceedWithGuestAction = () => {
        if (pendingGuestAction) {
            // Mark this warning as dismissed
            const warningKey = `${activeTab}-${pendingGuestAction.type}`
            setDismissedWarnings(prev => new Set([...prev, warningKey]))
            
            // Execute the action
            pendingGuestAction.action()
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
                // Store token and user data with correct keys
                localStorage.setItem('auth_token', data.token)  // Fixed key to match authentication check
                localStorage.setItem('auth_user', JSON.stringify(data.user))  // Store user data
                
                // Set authentication state
                setToken(data.token)
                setUser(data.user)
                setIsAuthenticated(true)  // This was missing!
                setShowAuthModal(false)
                
                console.log('Email authentication successful, state updated:', {
                    token: !!data.token,
                    user: !!data.user,
                    isAuthenticated: true
                });
                
                // Execute pending guest action if any
                if (pendingGuestAction) {
                    pendingGuestAction.action()
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
        // Redirect to backend Google OAuth endpoint which handles the full flow
        window.location.href = '/api/auth/google';
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your data.')) {
            return
        }
        
        try {
            // Get token from either Google OAuth or email/password storage
            const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
        
            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (response.ok) {
                // Store the user's email for the success message
                const userEmail = user?.email || 'Your account'
                setDeletedAccountEmail(userEmail)
                
                // Clear local storage and reset state
                localStorage.removeItem('authToken')
                localStorage.removeItem('auth_token')
                setUser(null)
                setShowAccountMenu(false)
                
                // Show success modal instead of immediately reloading
                setShowAccountDeletedModal(true)
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
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowGuestWarning(false)
                                    setShowAuthModal(true)
                                }}
                                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
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
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3 min-w-0">
                    <DesignOpsIcon />
                    <span className="hidden sm:inline">DesignOps Onboarding Template Builder</span>
                    <span className="sm:hidden truncate">Onboarding Builder</span>
                    {!user && <span className="text-xs sm:text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-1 sm:ml-2 flex-shrink-0">Guest</span>}
                </h1>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={() => handleGuestAction(generatePDF, 'add')} className="flex items-center gap-1 sm:gap-2 bg-white text-gray-700 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-300 transition-colors text-sm font-medium">
                        <DownloadIcon />
                        <span className="hidden sm:inline">Download PDF</span>
                    </button>
                    {user && (
                        <>
                            <button onClick={handleOpenShareModal} className="flex items-center gap-1 sm:gap-2 bg-primary-500 text-white px-2 sm:px-3 py-2 rounded-md hover:bg-primary-600 transition-colors text-sm font-medium">
                                <ShareIcon />
                                <span className="hidden sm:inline">Share Template</span>
                            </button>
                            <button onClick={handleOpenMySharesModal} className="flex items-center gap-1 sm:gap-2 bg-white text-gray-700 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-300 transition-colors text-sm font-medium">
                                <span className="hidden sm:inline">My Shares</span>
                                <span className="sm:hidden">Shares</span>
                            </button>
                        </>
                    )}
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
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 flex gap-4 sm:gap-8">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`py-3 sm:py-2 pr-2 font-medium border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                        activeTab === 'templates' 
                            ? 'text-gray-800 border-primary-600' 
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                >
                    <CalendarIcon />
                    Templates
                </button>
                <button
                    onClick={() => setActiveTab('jtbd')}
                    className={`py-3 sm:py-2 pr-2 font-medium border-b-2 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                        activeTab === 'jtbd' 
                            ? 'text-gray-800 border-primary-600' 
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                >
                    <CheckIcon />
                    Resources
                </button>
            </nav>

            {/* Main Content */}
            <main className="p-4 sm:p-6 max-w-7xl mx-auto">
                {activeTab === 'templates' && (
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        {/* Left Sidebar - Period Navigation */}
                        <div className="w-full lg:w-64 lg:flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                            <div className="card-enhanced">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
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
                                    <div id="onboarding-template" className="p-4 sm:p-6 pb-16 sm:pb-20">
                                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <input
                                                type="text"
                                                placeholder="Add a new task..."
                                                value={newTaskInputs[selectedPeriod] || ''}
                                                onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [selectedPeriod]: e.target.value }))}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleGuestAction(() => addTask(selectedPeriod), 'add');
                                                    }
                                                }}
                                                className="form-input-enhanced flex-1"
                                            />
                                            <button
                                                onClick={() => handleGuestAction(() => addTask(selectedPeriod), 'add')}
                                                className="btn-primary-enhanced w-full sm:w-auto sm:flex-shrink-0"
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
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Resources Creator</h2>
                                    <p className="text-gray-600 text-sm mt-1">Create resource libraries organized by user needs and outcomes</p>
                                </div>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex-shrink-0 self-start sm:self-auto">
                                    {jtbdResources.length} resource categories
                                </span>
                            </div>
                            
                            <div className="p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Add New Resource Category</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                                    onClick={() => handleGuestAction(handleAddJTBDResource, 'add')} 
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors font-medium"
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
                                        {editingCategory === resource.id ? (
                                            // Editing form for category
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    value={editingCategoryData?.category || ''}
                                                    onChange={(e) => setEditingCategoryData(prev => prev ? {...prev, category: e.target.value} : null)}
                                                    className="flex-1 px-2 py-1 text-sm font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="Category name"
                                                />
                                                <button
                                                    onClick={() => handleGuestAction(() => saveCategoryEdit(resource.id), 'edit')}
                                                    className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                                                    title="Save changes"
                                                >
                                                    <SaveIcon />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors"
                                                    title="Cancel editing"
                                                >
                                                    <XMarkIcon />
                                                </button>
                                            </div>
                                        ) : (
                                            // Display mode for category
                                            <>
                                                <h3 className="font-semibold text-gray-800">{resource.category}</h3>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleGuestAction(() => startEditingCategory(resource.id, resource), 'edit')}
                                                        className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors"
                                                        title="Edit category"
                                                    >
                                                        <PencilIcon />
                                                    </button>
                                                    <button
                                                        onClick={() => handleGuestAction(() => handleDeleteJTBDCategory(resource.id), 'delete')}
                                                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                        title="Delete category"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                            {editingCategory === resource.id ? (
                                                // Editing form for JTBD description
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">When I need to</label>
                                                        <input
                                                            type="text"
                                                            value={editingCategoryData?.job || ''}
                                                            onChange={(e) => setEditingCategoryData(prev => prev ? {...prev, job: e.target.value} : null)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                            placeholder="Job to be done"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">I want</label>
                                                        <input
                                                            type="text"
                                                            value={editingCategoryData?.situation || ''}
                                                            onChange={(e) => setEditingCategoryData(prev => prev ? {...prev, situation: e.target.value} : null)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                            placeholder="Situation or context"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">so I can</label>
                                                        <input
                                                            type="text"
                                                            value={editingCategoryData?.outcome || ''}
                                                            onChange={(e) => setEditingCategoryData(prev => prev ? {...prev, outcome: e.target.value} : null)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                            placeholder="Desired outcome"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                // Display mode for JTBD description
                                                <p className="text-sm text-gray-700">
                                                    <strong>When I need to</strong> {resource.job}, 
                                                    <strong> I want</strong> {resource.situation}, 
                                                    <strong> so I can</strong> {resource.outcome}.
                                                </p>
                                            )}
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
                                                        onClick={() => handleGuestAction(() => handleAddResourceToCategory(resource.id), 'add')}
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
                                                            {editingResource === res.id ? (
                                                                // Editing form for resource
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editingResourceData?.name || ''}
                                                                                onChange={(e) => setEditingResourceData(prev => prev ? {...prev, name: e.target.value} : null)}
                                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                                placeholder="Resource name"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                                            <select
                                                                                value={editingResourceData?.type || 'article'}
                                                                                onChange={(e) => setEditingResourceData(prev => prev ? {...prev, type: e.target.value as Resource['type']} : null)}
                                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                            >
                                                                                <option value="article">Article</option>
                                                                                <option value="video">Video</option>
                                                                                <option value="tool">Tool</option>
                                                                                <option value="course">Course</option>
                                                                                <option value="book">Book</option>
                                                                                <option value="podcast">Podcast</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                                                        <input
                                                                            type="url"
                                                                            value={editingResourceData?.url || ''}
                                                                            onChange={(e) => setEditingResourceData(prev => prev ? {...prev, url: e.target.value} : null)}
                                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                                                            placeholder="Resource URL"
                                                                        />
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 pt-2">
                                                                        <button
                                                                            onClick={() => handleGuestAction(() => saveResourceEdit(resource.id, res.id), 'edit')}
                                                                            className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                                                                            title="Save changes"
                                                                        >
                                                                            <SaveIcon />
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelEdit}
                                                                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors"
                                                                            title="Cancel editing"
                                                                        >
                                                                            <XMarkIcon />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Display mode for resource
                                                                <>
                                                                    <a
                                                                        href={res.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors flex-1"
                                                                    >
                                                                        <span>{getResourceTypeIcon(res.type)}</span>
                                                                        <span>{res.name}</span>
                                                                    </a>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => handleGuestAction(() => startEditingResource(res.id, res), 'edit')}
                                                                            className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-colors"
                                                                            title="Edit resource"
                                                                        >
                                                                            <PencilIcon />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleGuestAction(() => handleRemoveResourceFromCategory(resource.id, res.id), 'delete')}
                                                                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                                            title="Delete resource"
                                                                        >
                                                                            <TrashIcon />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
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

            {/* Account Deleted Success Modal */}
            {showAccountDeletedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Deleted Successfully</h3>
                            <p className="text-gray-600 mb-6">
                                {deletedAccountEmail} has been permanently deleted along with all associated data.
                            </p>
                            <button
                                onClick={() => {
                                    setShowAccountDeletedModal(false)
                                    setDeletedAccountEmail('')
                                    // Optionally reload the page to reset the app state
                                    window.location.reload()
                                }}
                                className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Template Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Share Your Template</h3>
                            <button
                                onClick={() => {
                                    setShowShareModal(false)
                                    setGeneratedInviteLink(null)
                                    setShareFormData({ title: '', description: '', expiresIn: '', maxClones: '' })
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon />
                            </button>
                        </div>
                        
                        {!generatedInviteLink ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Title *</label>
                                    <input
                                        type="text"
                                        value={shareFormData.title}
                                        onChange={(e) => setShareFormData({ ...shareFormData, title: e.target.value })}
                                        placeholder="e.g., Complete Onboarding Template"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={shareFormData.description}
                                        onChange={(e) => setShareFormData({ ...shareFormData, description: e.target.value })}
                                        placeholder="Describe what's included in this template..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expires in (days)</label>
                                        <input
                                            type="number"
                                            value={shareFormData.expiresIn}
                                            onChange={(e) => setShareFormData({ ...shareFormData, expiresIn: e.target.value })}
                                            placeholder="30"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max clones</label>
                                        <input
                                            type="number"
                                            value={shareFormData.maxClones}
                                            onChange={(e) => setShareFormData({ ...shareFormData, maxClones: e.target.value })}
                                            placeholder="10"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowShareModal(false)
                                            setShareFormData({ title: '', description: '', expiresIn: '', maxClones: '' })
                                        }}
                                        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateShare}
                                        disabled={!shareFormData.title.trim() || isCreatingShare}
                                        className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isCreatingShare ? 'Creating...' : 'Create Share Link'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                        <ShareIcon />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Share Link Created!</h4>
                                    <p className="text-gray-600 mb-4">Anyone with this link can clone your template to their account.</p>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={generatedInviteLink}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                                        />
                                        <button
                                            onClick={() => handleCopyInviteLink()}
                                            className="px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                                        >
                                            <CopyIcon />
                                        </button>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setShowShareModal(false)
                                        setGeneratedInviteLink(null)
                                    }}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* My Shares Modal */}
            {showMySharesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">My Shared Templates</h3>
                            <button
                                onClick={() => setShowMySharesModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon />
                            </button>
                        </div>
                        
                        {myShares.length === 0 ? (
                            <div className="text-center py-8">
                                <ShareIcon />
                                <p className="text-gray-500 mt-2">You haven't shared any templates yet.</p>
                                <button
                                    onClick={() => {
                                        setShowMySharesModal(false)
                                        setShowShareModal(true)
                                    }}
                                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                                >
                                    Share Your First Template
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myShares.map((share) => (
                                    <div key={share.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{share.title}</h4>
                                                {share.description && (
                                                    <p className="text-gray-600 text-sm mt-1">{share.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>Cloned {share.clone_count} times</span>
                                                    {share.max_clones && <span>Max: {share.max_clones}</span>}
                                                    {share.expires_at && (
                                                        <span>Expires: {new Date(share.expires_at).toLocaleDateString()}</span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        share.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {share.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleCopyInviteLink(share.inviteUrl)}
                                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    Copy Link
                                                </button>
                                                {share.is_active && (
                                                    <button
                                                        onClick={() => handleRevokeShare(share.id)}
                                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                            <button
                                onClick={() => setShowMySharesModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clone Template Modal */}
            {showCloneModal && sharedTemplateData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleCloseCloneModal();
                    }
                }}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Clone Template</h3>
                            <button
                                onClick={handleCloseCloneModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon />
                            </button>
                        </div>
                        
                        {isLoadingSharedTemplate ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading shared template...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                        <ShareIcon />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{sharedTemplateData.title}</h4>
                                    {sharedTemplateData.description && (
                                        <p className="text-gray-600 mb-4">{sharedTemplateData.description}</p>
                                    )}
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h5 className="font-medium text-gray-900 mb-2">What's included:</h5>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• {sharedTemplateData.templates?.length || 0} onboarding templates</li>
                                        <li>• {sharedTemplateData.jtbdResources?.length || 0} resource categories</li>
                                        <li>• {sharedTemplateData.jtbdResources?.reduce((total: number, category: any) => total + (category.resources?.length || 0), 0) || 0} resources</li>
                                    </ul>
                                </div>
                                
                                {!isAuthenticated ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                        <p className="text-yellow-800 text-sm mb-3">
                                            You need to sign in to clone this template to your account.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('Sign In button clicked');
                                                    console.log('Setting shouldAutoCloneAfterAuth to true');
                                                    console.log('Closing clone modal and opening auth modal');
                                                    setShouldAutoCloneAfterAuth(true);
                                                    setShowCloneModal(false); // Close clone modal first
                                                    setShowAuthModal(true);
                                                    console.log('Auth modal state should be true now');
                                                }}
                                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors cursor-pointer"
                                                style={{ pointerEvents: 'auto' }}
                                            >
                                                Sign In
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('Cancel button clicked');
                                                    handleCloseCloneModal();
                                                }}
                                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                                                style={{ pointerEvents: 'auto' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleCloseCloneModal}
                                            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCloneTemplate}
                                            disabled={isCloningTemplate}
                                            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isCloningTemplate ? 'Cloning...' : 'Clone Template'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Clone Confirmation Modal for Existing Users */}
            {showCloneConfirmation && cloneConfirmationData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleCancelClone();
                    }
                }}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Clone Operation</h3>
                            <button
                                onClick={handleCancelClone}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">You Already Have Data</h4>
                                <p className="text-gray-600 mb-4">{cloneConfirmationData.message}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h5 className="font-medium text-gray-900 mb-2">Your existing data:</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {cloneConfirmationData.existingData?.templates && (
                                        <li>• You have existing onboarding templates</li>
                                    )}
                                    {cloneConfirmationData.existingData?.jtbd && (
                                        <li>• You have existing resource categories and resources</li>
                                    )}
                                </ul>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <p className="text-blue-800 text-sm mb-3">
                                    <strong>Smart merging will occur:</strong>
                                </p>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>• <strong>Duplicate templates</strong> will be automatically skipped</li>
                                    <li>• <strong>Matching categories</strong> will be merged - new resources added to your existing categories</li>
                                    <li>• <strong>New categories</strong> will be created only when no match exists</li>
                                    <li>• Your existing data will <strong>never</strong> be replaced or deleted</li>
                                </ul>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCancelClone}
                                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmedClone}
                                    disabled={isCloningTemplate}
                                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isCloningTemplate ? 'Adding...' : 'Add to My Data'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
