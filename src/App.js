import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from "firebase/app";
// Using signInWithPopup again
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot, collection, query, writeBatch, addDoc, deleteDoc, updateDoc, setLogLevel } from "firebase/firestore";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import './App.css'; // Import the new CSS file

// --- Icon Components ---
const CalendarIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const TargetIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const PlusIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);
const TrashIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const DownloadIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
);

// --- New Google Sign-In Button Component ---
const GoogleSignInButton = ({ onClick }) => (
    <button onClick={onClick} className="gsi-material-button">
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{display: 'block'}}>
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


// --- Default Data for New Users ---
const defaultOnboardingTemplate = {
    firstDay: [ { id: 'default-1', title: 'Welcome orientation and team introductions', completed: false, priority: 'high' } ],
    firstWeek: [ { id: 'default-2', title: 'Complete design tool training modules', completed: false, priority: 'high' } ],
    secondWeek: [{ id: 'default-3', title: 'Begin first small design task', completed: false, priority: 'high' }],
    thirdWeek: [{ id: 'default-4', title: 'Present first design work for feedback', completed: false, priority: 'high' }],
    firstMonth: [{ id: 'default-5', title: 'Complete first major design deliverable', completed: false, priority: 'high' }],
};
const defaultJtbdResources = [
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


function App() {
    // Firebase and Auth State
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);

    // App UI State
    const [activeTab, setActiveTab] = useState('templates');
    const [selectedPeriod, setSelectedPeriod] = useState('firstDay');
    
    // Data State
    const [onboardingTemplate, setOnboardingTemplate] = useState({});
    const [jtbdResources, setJtbdResources] = useState([]);

    // Input State
    const [newTask, setNewTask] = useState('');
    const [newJTBD, setNewJTBD] = useState({ category: '', job: '', situation: '', outcome: '' });
    const [newResource, setNewResource] = useState({ name: '', type: 'guide', url: '' });
    
    const profileMenuRef = useRef(null);

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyB0kfRE2z_aV1E-FU5-XhaqKM0OhWlrBl8",
            authDomain: "onboarding-f1588.firebaseapp.com",
            projectId: "onboarding-f1588",
            storageBucket: "onboarding-f1588.appspot.com",
            messagingSenderId: "624572514846",
            appId: "1:624572514846:web:3ed98bdf1671aabdf7e40f",
            measurementId: "G-V56MBZZHGK"
        };
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const authInstance = getAuth(app);
        
        setDb(firestoreDb);
        setAuth(authInstance);
        setLogLevel('debug');

        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setCurrentUser(user);
            setUserId(user ? user.uid : null);
            setProfileImageError(false);
            setIsAuthLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    // --- Effect to handle clicks outside the profile menu ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- Data Loading and Initialization ---
    const initializeUserData = useCallback(async (appId, currentUserId) => {
        if (!db) return;
        const batch = writeBatch(db);
        const onboardingCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'onboardingTemplate');
        Object.entries(defaultOnboardingTemplate).forEach(([period, tasks]) => {
            tasks.forEach(task => {
                const { id, ...taskData } = task;
                const taskDocRef = doc(onboardingCollectionRef);
                batch.set(taskDocRef, { ...taskData, period });
            });
        });
        const jtbdCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'jtbdResources');
        defaultJtbdResources.forEach(jtbd => {
            const { id, ...jtbdData } = jtbd;
            const jtbdDocRef = doc(jtbdCollectionRef);
            batch.set(jtbdDocRef, jtbdData);
        });
        await batch.commit();
    }, [db]);

    // --- Real-time Data Listeners ---
    useEffect(() => {
        if (isAuthLoading || !db) return;

        if (!userId) {
            setOnboardingTemplate(defaultOnboardingTemplate);
            setJtbdResources(defaultJtbdResources);
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        const appId = 'onboarding-f1588';
        const onboardingQuery = query(collection(db, 'artifacts', appId, 'users', userId, 'onboardingTemplate'));
        const unsubscribeOnboarding = onSnapshot(onboardingQuery, async (snapshot) => {
            if (snapshot.empty && !snapshot.metadata.hasPendingWrites) {
                await initializeUserData(appId, userId);
            } else {
                const templateData = {};
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    if (!templateData[data.period]) templateData[data.period] = [];
                    templateData[data.period].push({ id: docSnap.id, ...data });
                });
                setOnboardingTemplate(templateData);
            }
            if(activeTab === 'templates') setIsDataLoading(false);
        }, (error) => {
            console.error("Onboarding listener error:", error);
            setIsDataLoading(false);
        });

        const jtbdQuery = query(collection(db, 'artifacts', appId, 'users', userId, 'jtbdResources'));
        const unsubscribeJtbd = onSnapshot(jtbdQuery, (snapshot) => {
            const resourcesData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setJtbdResources(resourcesData);
            if(activeTab === 'jtbd') setIsDataLoading(false);
        }, (error) => console.error("JTBD listener error:", error));
        
        return () => {
            unsubscribeOnboarding();
            unsubscribeJtbd();
        };
    }, [isAuthLoading, db, userId, initializeUserData, activeTab]);
    
    // --- Login/Logout Handlers ---
    const handleGoogleLogin = () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Login successful:", result.user);
            })
            .catch(error => {
                console.error("Popup Login Error:", error);
            });
    };

    const handleLogout = () => {
        if (!auth) return;
        signOut(auth).catch(error => console.error("Logout Error:", error));
    };

    // --- Helper function to get a larger profile picture ---
    const getSizedProfilePic = (url) => {
        if (url) {
            return url.replace(/=s\d+-c$/, '=s256-c');
        }
        return null;
    };

    // --- Data Manipulation Functions ---
    const handleAddTask = async () => {
        if (!newTask.trim()) return;
        if (!currentUser) {
            const newTaskObject = {
                id: `local-${Date.now()}`,
                title: newTask,
                completed: false,
                priority: 'medium',
                period: selectedPeriod
            };
            setOnboardingTemplate(prev => ({
                ...prev,
                [selectedPeriod]: [...(prev[selectedPeriod] || []), newTaskObject]
            }));
            setNewTask('');
            return;
        }
        if (!db || !userId) return;
        await addDoc(getCollectionRef('onboardingTemplate'), { title: newTask, completed: false, priority: 'medium', period: selectedPeriod });
        setNewTask('');
    };
    
    const handleDeleteTask = async (taskId) => {
        if (!currentUser) {
             setOnboardingTemplate(prev => ({
                ...prev,
                [selectedPeriod]: prev[selectedPeriod].filter(task => task.id !== taskId)
            }));
            return;
        }
        if (!db || !userId) return;
        await deleteDoc(getDocRef('onboardingTemplate', taskId));
    };

    const handleUpdateTaskPriority = async (taskId, priority) => {
        if (!currentUser) {
            setOnboardingTemplate(prev => ({
                ...prev,
                [selectedPeriod]: prev[selectedPeriod].map(task => 
                    task.id === taskId ? { ...task, priority } : task
                )
            }));
            return;
        }
        if (!db || !userId) return;
        await updateDoc(getDocRef('onboardingTemplate', taskId), { priority });
    };

    const handleAddJTBDResource = async () => {
        if (!newJTBD.category.trim() || !newJTBD.job.trim()) return;
        const newCategory = { ...newJTBD, id: `local-${Date.now()}`, resources: [] };
        if (!currentUser) {
            setJtbdResources(prev => [...prev, newCategory]);
            setNewJTBD({ category: '', job: '', situation: '', outcome: '' });
            return;
        }
        if (!db || !userId) return;
        await addDoc(getCollectionRef('jtbdResources'), newCategory);
        setNewJTBD({ category: '', job: '', situation: '', outcome: '' });
    };

    const handleDeleteJTBDCategory = async (categoryId) => {
        if (!currentUser) {
            setJtbdResources(prev => prev.filter(cat => cat.id !== categoryId));
            return;
        }
        if (!db || !userId) return;
        await deleteDoc(getDocRef('jtbdResources', categoryId));
    };
    
    const handleAddResourceToCategory = async (categoryId) => {
         if (!newResource.name.trim() || !newResource.url.trim()) return;
         const newRes = { ...newResource, id: `local-res-${Date.now()}` };
         if (!currentUser) {
            setJtbdResources(prev => prev.map(cat => 
                cat.id === categoryId ? { ...cat, resources: [...cat.resources, newRes] } : cat
            ));
            setNewResource({ name: '', type: 'guide', url: '' });
            return;
         }
         if (!db || !userId) return;
         const categoryToUpdate = jtbdResources.find(cat => cat.id === categoryId);
         if (categoryToUpdate) {
            const updatedResources = [...categoryToUpdate.resources, newRes];
            await updateDoc(getDocRef('jtbdResources', categoryId), { resources: updatedResources });
            setNewResource({ name: '', type: 'guide', url: '' });
         }
    };

    const handleRemoveResourceFromCategory = async (categoryId, resourceId) => {
        if (!currentUser) {
            setJtbdResources(prev => prev.map(cat => 
                cat.id === categoryId ? { ...cat, resources: cat.resources.filter(res => res.id !== resourceId) } : cat
            ));
            return;
        }
        if (!db || !userId) return;
        const categoryToUpdate = jtbdResources.find(cat => cat.id === categoryId);
        if (categoryToUpdate) {
            const updatedResources = categoryToUpdate.resources.filter(res => res.id !== resourceId);
            await updateDoc(getDocRef('jtbdResources', categoryId), { resources: updatedResources });
        }
    };

    const handleDownloadPdf = () => { /* ... implementation ... */ };
    const getCollectionRef = (name) => collection(db, 'artifacts', 'onboarding-f1588', 'users', userId, name);
    const getDocRef = (collectionName, docId) => doc(db, 'artifacts', 'onboarding-f1588', 'users', userId, collectionName, docId);
    const periods = { firstDay: 'First Day', firstWeek: 'First Week', secondWeek: '2nd Week', thirdWeek: '3rd Week', firstMonth: 'First Month' };
    const getPriorityClass = (priority) => { /* ... implementation ... */ };
    const getResourceTypeIcon = (type) => ({
        tool: '🛠️', guide: '📖', reference: '📋',
        template: '📝', database: '🗄️'
    }[type] || '📄');

    if (isAuthLoading) {
        return <div className="loading-container"><div><h2>Authenticating...</h2></div></div>;
    }
    
    return (
        <div className="app">
            {/* Add styles for the Google button. It's best to move these to your App.css file. */}
            <style>{`
                .gsi-material-button { -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none; -webkit-appearance: none; background-color: white; background-image: none; border: 1px solid #747775; -webkit-border-radius: 4px; border-radius: 4px; -webkit-box-sizing: border-box; box-sizing: border-box; color: #1f1f1f; cursor: pointer; font-family: 'Roboto', arial, sans-serif; font-size: 13px; height: 36px; letter-spacing: 0.25px; outline: none; overflow: hidden; padding: 0 10px; position: relative; text-align: center; -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s; transition: background-color .218s, border-color .218s, box-shadow .218s; vertical-align: middle; white-space: nowrap; width: auto; max-width: 400px; min-width: min-content; }
                .gsi-material-button .gsi-material-button-icon { height: 18px; margin-right: 8px; min-width: 18px; width: 18px; }
                .gsi-material-button .gsi-material-button-content-wrapper { -webkit-align-items: center; align-items: center; display: flex; -webkit-flex-direction: row; flex-direction: row; -webkit-flex-wrap: nowrap; flex-wrap: nowrap; height: 100%; justify-content: space-between; position: relative; width: 100%; }
                .user-profile-container { position: relative; }
                .profile-picture { width: 36px; height: 36px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
                .profile-picture:hover { border-color: #ddd; }
                .profile-initials { width: 36px; height: 36px; border-radius: 50%; background-color: #e0e0e0; color: #555; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
                .profile-initials:hover { border-color: #ddd; }
                .profile-dropdown { position: absolute; top: 45px; right: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 8px; width: 220px; z-index: 100; border: 1px solid #eee; }
                .profile-dropdown-header { padding: 8px 12px; border-bottom: 1px solid #eee; }
                .profile-dropdown-header p { margin: 0; font-weight: 500; font-size: 14px; }
                .profile-dropdown-header span { font-size: 12px; color: #555; }
                .profile-dropdown .logout-btn { background: none; border: none; color: #d93025; padding: 10px 12px; width: 100%; text-align: right; cursor: pointer; font-size: 14px; border-radius: 4px; }
                .profile-dropdown .logout-btn:hover { background-color: #f5f5f5; }
                .login-container { display: flex; align-items: center; gap: 1rem; }
                .header-login-prompt { font-size: 12px; color: #5f6368; margin: 0; line-height: 1.5; }
            `}</style>
            <header className="header no-print">
                <div className="header-content">
                    <div className="header-title">
                        <div className="header-icon-container">
                            <img src="https://www.changyingart.com/Customized_Tools/Onboarding/AddMemberIcon.svg" alt="Onboarding Icon" className="header-icon" />
                        </div>
                        <h1>DesignOps Onboarding</h1>
                    </div>
                    <div className="header-actions">
                         <button onClick={handleDownloadPdf} disabled={isDownloading} className="download-btn">
                            {isDownloading ? 'Downloading...' : <><DownloadIcon /> <span>PDF</span></>}
                        </button>
                        <div className="user-id">
                            {currentUser ? (
                                <div className="user-profile-container" ref={profileMenuRef}>
                                    {currentUser.photoURL && !profileImageError ? (
                                        <img 
                                            src={getSizedProfilePic(currentUser.photoURL)} 
                                            alt="Profile" 
                                            className="profile-picture" 
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            onError={() => setProfileImageError(true)}
                                            crossOrigin="anonymous" 
                                        />
                                    ) : (
                                        <div className="profile-initials" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                                            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    {isProfileMenuOpen && (
                                        <div className="profile-dropdown">
                                            <div className="profile-dropdown-header">
                                                <p>{currentUser.displayName}</p>
                                                <span>{currentUser.email}</span>
                                            </div>
                                            <button onClick={handleLogout} className="logout-btn">Log Out</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="login-container">
                                    <GoogleSignInButton onClick={handleGoogleLogin} />
                                    <p className="header-login-prompt">
                                        Your current work will not be saved.<br/>
                                        Log in to save your progress.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div id="capture">
                <div className="tabs-container">
                    <nav className="tabs-nav">
                        <button onClick={() => setActiveTab('templates')} className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}>
                            <CalendarIcon /> Onboarding Templates
                        </button>
                        <button onClick={() => setActiveTab('jtbd')} className={`tab-btn ${activeTab === 'jtbd' ? 'active' : ''}`}>
                            <TargetIcon /> Resources
                        </button>
                    </nav>
                </div>
                {isDataLoading && currentUser ? (
                     <div className="loading-container"><div><h2>Loading Workspace...</h2></div></div>
                ) : (
                    <main className="container">
                        {activeTab === 'templates' && (
                            <div className="main-grid">
                                <div className="main-grid-sidebar no-print">
                                    <h3>Onboarding Periods</h3>
                                    <div className="period-buttons">
                                        {Object.entries(periods).map(([key, label]) => (
                                            <button key={key} onClick={() => setSelectedPeriod(key)} className={`period-btn ${selectedPeriod === key ? 'active' : ''}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="main-grid-content">
                                    <div className="tasks-header">
                                        <h3>{periods[selectedPeriod]} Tasks</h3>
                                        <span className="task-count">{onboardingTemplate[selectedPeriod]?.length || 0} tasks</span>
                                    </div>
                                    <div className="add-task-form no-print">
                                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." className="add-task-input" onKeyPress={(e) => e.key === 'Enter' && handleAddTask()} />
                                        <button onClick={handleAddTask} className="add-btn"><PlusIcon /><span>Add</span></button>
                                    </div>
                                    <div className="task-list">
                                        {(onboardingTemplate[selectedPeriod] || []).map((task) => (
                                            <div key={task.id} className="task-item">
                                                <p>{task.title}</p>
                                                <div className="task-actions no-print">
                                                    <select value={task.priority} onChange={(e) => handleUpdateTaskPriority(task.id, e.target.value)} className={`priority-select ${getPriorityClass(task.priority)}`}>
                                                        <option value="high">High</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="low">Low</option>
                                                    </select>
                                                    <button onClick={() => handleDeleteTask(task.id)} className="delete-btn"><TrashIcon /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'jtbd' && (
                            <div>
                                <div className="jtbd-header">
                                    <div>
                                        <h3>Resources Creator</h3>
                                        <p className="jtbd-subtitle">Create resource libraries organized by user needs and outcomes</p>
                                    </div>
                                    <span className="category-count">{jtbdResources.length} resource categories</span>
                                </div>
                                
                                <div className="add-jtbd-card top-form no-print">
                                    <h4>Add New Resource Category</h4>
                                    <div className="add-jtbd-form-grid">
                                        <div>
                                            <label>Category</label>
                                            <input type="text" value={newJTBD.category} onChange={(e) => setNewJTBD(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g., Design Tools & Systems" />
                                        </div>
                                        <div>
                                            <label>When I need to...</label>
                                            <input type="text" value={newJTBD.job} onChange={(e) => setNewJTBD(prev => ({ ...prev, job: e.target.value }))} placeholder="e.g., create consistent designs" />
                                        </div>
                                        <div>
                                            <label>I want...</label>
                                            <input type="text" value={newJTBD.situation} onChange={(e) => setNewJTBD(prev => ({ ...prev, situation: e.target.value }))} placeholder="e.g., access to design systems and tools" />
                                        </div>
                                        <div>
                                            <label>So I can...</label>
                                            <input type="text" value={newJTBD.outcome} onChange={(e) => setNewJTBD(prev => ({ ...prev, outcome: e.target.value }))} placeholder="e.g., work efficiently and maintain consistency" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddJTBDResource} className="add-btn">
                                        <PlusIcon /><span>Add Resource Category</span>
                                    </button>
                                </div>

                                <div className="jtbd-grid">
                                    {jtbdResources.map((resource) => (
                                        <div key={resource.id} className="jtbd-card">
                                            <div className="jtbd-card-header">
                                                <h4>{resource.category}</h4>
                                                <button onClick={() => handleDeleteJTBDCategory(resource.id)} className="delete-btn category-delete-btn no-print"><TrashIcon /></button>
                                            </div>
                                            <div className="jtbd-job-statement">
                                                <p>
                                                    <strong>When I need to</strong> {resource.job},
                                                    <strong> I want</strong> {resource.situation},
                                                    <strong> so I can</strong> {resource.outcome}.
                                                </p>
                                            </div>

                                            <div className="add-resource-form no-print">
                                                <h6 className="add-resource-title">Add Resource</h6>
                                                <div className="add-resource-inputs">
                                                    <input type="text" value={newResource.name} onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))} placeholder="Resource name" />
                                                    <select value={newResource.type} onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}>
                                                        <option value="guide">📖 Guide</option>
                                                        <option value="tool">🛠️ Tool</option>
                                                        <option value="reference">📋 Reference</option>
                                                        <option value="template">📝 Template</option>
                                                        <option value="database">🗄️ Database</option>
                                                    </select>
                                                </div>
                                                <div className="add-resource-inputs">
                                                    <input type="url" value={newResource.url} onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))} placeholder="https://example.com" />
                                                    <button onClick={() => handleAddResourceToCategory(resource.id)} className="add-btn-small">Add</button>
                                                </div>
                                            </div>

                                            <div className="resource-list-container">
                                                <h5>Resources:</h5>
                                                {resource.resources.length === 0 ? (
                                                    <p className="no-resources">No resources added yet</p>
                                                ) : (
                                                    <div className="resource-list">
                                                        {resource.resources.map((res) => (
                                                            <div key={res.id} className="resource-item">
                                                                <a href={res.url} target="_blank" rel="noopener noreferrer">
                                                                    <span>{getResourceTypeIcon(res.type)}</span>
                                                                    <span>{res.name}</span>
                                                                </a>
                                                                <button onClick={() => handleRemoveResourceFromCategory(resource.id, res.id)} className="delete-btn no-print"><TrashIcon /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                )}
            </div>
        </div>
    );
}

export default App;
