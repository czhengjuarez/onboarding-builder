import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
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

// --- Default Data for New Users ---
const defaultOnboardingTemplate = {
    firstDay: [
        { title: 'Welcome orientation and team introductions', completed: false, priority: 'high' },
        { title: 'Set up design tools and accounts', completed: false, priority: 'high' },
    ],
    firstWeek: [
        { title: 'Complete design tool training modules', completed: false, priority: 'high' },
        { title: 'Shadow senior designer on current project', completed: false, priority: 'medium' },
    ],
    secondWeek: [{ title: 'Begin first small design task', completed: false, priority: 'high' }],
    thirdWeek: [{ title: 'Present first design work for feedback', completed: false, priority: 'high' }],
    firstMonth: [{ title: 'Complete first major design deliverable', completed: false, priority: 'high' }],
};

const defaultJtbdResources = [
    {
        category: 'Design Tools & Systems',
        job: 'create consistent designs',
        situation: 'access to design systems and tools',
        outcome: 'work efficiently and maintain brand consistency',
        resources: [
            { name: 'Figma Component Library', type: 'tool', url: '#' },
            { name: 'Design System Documentation', type: 'guide', url: '#' },
            { name: 'Brand Guidelines', type: 'reference', url: '#' }
        ]
    },
    {
        category: 'Process & Workflow',
        job: 'understand our design process',
        situation: 'clear workflow documentation',
        outcome: 'collaborate effectively with my team',
        resources: [
            { name: 'Design Process Playbook', type: 'guide', url: '#' },
            { name: 'Critique Guidelines', type: 'reference', url: '#' },
            { name: 'Handoff Checklist', type: 'template', url: '#' }
        ]
    },
    {
        category: 'Research & Strategy',
        job: 'make informed design decisions',
        situation: 'access to user research and strategy docs',
        outcome: 'design with user needs in mind',
        resources: [
            { name: 'User Research Repository', type: 'database', url: '#' },
            { name: 'Design Strategy Framework', type: 'guide', url: '#' },
            { name: 'Usability Testing Templates', type: 'template', url: '#' }
        ]
    }
];

function App() {
    // Firebase and Auth State
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

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

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        try {
            const firebaseConfig = {
                apiKey: "AIzaSyB0kfRE2z_aV1E-FU5-XhaqKM0OhWlrBl8",
                authDomain: "onboarding-f1588.firebaseapp.com",
                projectId: "onboarding-f1588",
                storageBucket: "onboarding-f1588.firebasestorage.app",
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

            onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    await signInAnonymously(authInstance);
                }
                setIsAuthReady(true);
            });
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsLoading(false);
        }
    }, []);

    // --- Data Loading and Initialization ---
    const initializeUserData = useCallback(async (appId, currentUserId) => {
        if (!db) return;
        console.log("Initializing user data for", currentUserId);
        const batch = writeBatch(db);

        const onboardingCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'onboardingTemplate');
        Object.entries(defaultOnboardingTemplate).forEach(([period, tasks]) => {
            tasks.forEach(task => {
                const taskDocRef = doc(onboardingCollectionRef);
                batch.set(taskDocRef, { ...task, period });
            });
        });

        const jtbdCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'jtbdResources');
        defaultJtbdResources.forEach(jtbd => {
            const jtbdDocRef = doc(jtbdCollectionRef);
            batch.set(jtbdDocRef, jtbd);
        });

        await batch.commit();
        console.log("Default data initialized for new user.");
    }, [db]);


    // --- Real-time Data Listeners ---
    useEffect(() => {
        if (!isAuthReady || !db || !userId) {
            if(isAuthReady) setIsLoading(false);
            return;
        }
        
        const appId = 'onboarding-f1588';

        const onboardingQuery = query(collection(db, 'artifacts', appId, 'users', userId, 'onboardingTemplate'));
        const unsubscribeOnboarding = onSnapshot(onboardingQuery, async (snapshot) => {
            if (snapshot.empty && !snapshot.metadata.hasPendingWrites) {
                await initializeUserData(appId, userId);
            } else {
                const templateData = {};
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    if (!templateData[data.period]) {
                        templateData[data.period] = [];
                    }
                    templateData[data.period].push({ id: docSnap.id, ...data });
                });
                setOnboardingTemplate(templateData);
            }
            if(activeTab === 'templates') setIsLoading(false);
        }, (error) => {
            console.error("Onboarding listener error:", error);
            setIsLoading(false);
        });

        const jtbdQuery = query(collection(db, 'artifacts', appId, 'users', userId, 'jtbdResources'));
        const unsubscribeJtbd = onSnapshot(jtbdQuery, (snapshot) => {
            const resourcesData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            setJtbdResources(resourcesData);
            if(activeTab === 'jtbd') setIsLoading(false);
        }, (error) => console.error("JTBD listener error:", error));

        return () => {
            unsubscribeOnboarding();
            unsubscribeJtbd();
        };
    }, [isAuthReady, db, userId, initializeUserData, activeTab]);
    
    // --- PDF Download Function ---
    const handleDownloadPdf = () => {
        setIsDownloading(true);
        const input = document.getElementById('capture');
        const elementsToHide = input.querySelectorAll('.no-print');
        elementsToHide.forEach(el => el.style.visibility = 'hidden');

        html2canvas(input, { useCORS: true, scale: 2, logging: false })
            .then(canvas => {
                elementsToHide.forEach(el => el.style.visibility = 'visible');
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasAspectRatio = canvas.width / canvas.height;
                const imgHeight = pdfWidth / canvasAspectRatio;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                pdf.save('designops-onboarding-plan.pdf');
                setIsDownloading(false);
            }).catch(err => {
                console.error("Error generating PDF:", err);
                elementsToHide.forEach(el => el.style.visibility = 'visible');
                setIsDownloading(false);
            });
    };


    // --- Firestore Data Manipulation Functions ---
    const getCollectionRef = (name) => {
        const appId = 'onboarding-f1588';
        return collection(db, 'artifacts', appId, 'users', userId, name);
    };

    const getDocRef = (collectionName, docId) => {
        const appId = 'onboarding-f1588';
        return doc(db, 'artifacts', appId, 'users', userId, collectionName, docId);
    }

    const handleAddTask = async () => {
        if (!newTask.trim() || !db) return;
        await addDoc(getCollectionRef('onboardingTemplate'), {
            title: newTask,
            completed: false,
            priority: 'medium',
            period: selectedPeriod
        });
        setNewTask('');
    };

    const handleDeleteTask = async (taskId) => {
        if (!db) return;
        await deleteDoc(getDocRef('onboardingTemplate', taskId));
    };

    const handleUpdateTaskPriority = async (taskId, priority) => {
        if (!db) return;
        await updateDoc(getDocRef('onboardingTemplate', taskId), { priority });
    };

    const handleAddJTBDResource = async () => {
        if (!newJTBD.category.trim() || !newJTBD.job.trim() || !db) return;
        await addDoc(getCollectionRef('jtbdResources'), { ...newJTBD, resources: [] });
        setNewJTBD({ category: '', job: '', situation: '', outcome: '' });
    };

    const handleDeleteJTBDCategory = async (categoryId) => {
        if (!db) return;
        await deleteDoc(getDocRef('jtbdResources', categoryId));
    };
    
    const handleAddResourceToCategory = async (categoryId) => {
         if (!newResource.name.trim() || !newResource.url.trim() || !db) return;
         const categoryToUpdate = jtbdResources.find(cat => cat.id === categoryId);
         if (categoryToUpdate) {
            const updatedResources = [...categoryToUpdate.resources, { ...newResource, id: Date.now().toString() }];
            await updateDoc(getDocRef('jtbdResources', categoryId), { resources: updatedResources });
            setNewResource({ name: '', type: 'guide', url: '' });
         }
    };

    const handleRemoveResourceFromCategory = async (categoryId, resourceId) => {
        if (!db) return;
        const categoryToUpdate = jtbdResources.find(cat => cat.id === categoryId);
        if (categoryToUpdate) {
            const updatedResources = categoryToUpdate.resources.filter(res => res.id !== resourceId);
            await updateDoc(getDocRef('jtbdResources', categoryId), { resources: updatedResources });
        }
    };

    // --- UI Helper Functions ---
    const periods = {
        firstDay: 'First Day', firstWeek: 'First Week', secondWeek: '2nd Week',
        thirdWeek: '3rd Week', firstMonth: 'First Month'
    };
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'high': return 'priority-high';
            case 'medium': return 'priority-medium';
            case 'low': return 'priority-low';
            default: return '';
        }
    };
    const getResourceTypeIcon = (type) => ({
        tool: '🛠️', guide: '📖', reference: '📋',
        template: '📝', database: '🗄️'
    }[type] || '📄');


    if (isLoading) {
        return (
            <div className="loading-container">
                <div>
                    <h2>Loading Your Workspace...</h2>
                    <p>Please wait a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
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
                            <p>User ID</p>
                            <code>{userId}</code>
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
                            <TargetIcon /> JTBD Resources
                        </button>
                    </nav>
                </div>

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
                                    <button onClick={handleAddTask} className="add-btn">
                                        <PlusIcon /><span>Add</span>
                                    </button>
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
            </div>
        </div>
    );
}

export default App;
