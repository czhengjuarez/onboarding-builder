import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, query, writeBatch } from 'firebase/firestore';
import './index.css'; // Import the stylesheet

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBRQWdE55HMYzJ0RDsA-jl7nbesYPdhAL8",
  authDomain: "quality-floor-checklist.firebaseapp.com",
  projectId: "quality-floor-checklist",
  storageBucket: "quality-floor-checklist.appspot.com",
  messagingSenderId: "1027144107541",
  appId: "1:1027144107541:web:7498803d7861c3b783701c",
  measurementId: "G-C5ECWEVGW1"
};

const appId = 'quality-floor-checklist';


export default function App() {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [userId, setUserId] = useState(null);
    const [db, setDb] = useState(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            setDb(getFirestore(app));

            const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setIsAuthReady(true);
                } else {
                    try {
                        await signInAnonymously(auth);
                    } catch (authError) {
                        console.error("Error signing in anonymously:", authError);
                    }
                }
            });
            return () => unsubscribeAuth();
        } catch (error) {
            console.error("Firebase initialization error:", error);
        }
    }, []);

    const addStarterItems = useCallback(async (firestoreDb, path) => {
      const starterItems = [
          "Code is reviewed by at least one other team member.",
          "All new features have corresponding unit tests.",
          "Accessibility (WCAG 2.1 AA) standards are met.",
          "Performance metrics (e.g., LCP) are within budget."
      ];
      const batch = writeBatch(firestoreDb);
      const collectionRef = collection(firestoreDb, path);
      starterItems.forEach(itemText => {
          const newDocRef = doc(collectionRef);
          batch.set(newDocRef, { text: itemText, createdAt: new Date(), creatorId: 'system' });
      });
      try {
          await batch.commit();
      } catch (error) {
          console.error("Error adding starter items: ", error);
      }
    }, []);

    useEffect(() => {
        if (!isAuthReady || !db) return;

        const collectionPath = `artifacts/${appId}/public/data/todos`;
        const todosCollection = collection(db, collectionPath);
        const q = query(todosCollection);
        let startersAdded = false;

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            if (snapshot.empty && !startersAdded) {
                startersAdded = true;
                addStarterItems(db, collectionPath);
                return;
            }
            const todosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTodos(todosData);
        }, (error) => {
            console.error("Error listening to Firestore: ", error);
        });

        return () => unsubscribeFirestore();
    }, [isAuthReady, db, addStarterItems]);

    const addTodoItem = useCallback(async () => {
        if (inputValue.trim() === '' || !userId || !db) return;
        const collectionPath = `artifacts/${appId}/public/data/todos`;
        try {
            await addDoc(collection(db, collectionPath), {
                text: inputValue.trim(),
                createdAt: new Date(),
                creatorId: userId
            });
            setInputValue('');
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }, [inputValue, userId, db]);

    const deleteTodoItem = useCallback(async (id) => {
        if (!db) return;
        const docPath = `artifacts/${appId}/public/data/todos/${id}`;
        try {
            await deleteDoc(doc(db, docPath));
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    }, [db]);

    const exportToPDF = () => {
        if (!window.jspdf) {
            console.error("jsPDF library not found.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Quality Floor Checklist", 14, 22);
        doc.setFontSize(11);
        todos.forEach((todo, index) => {
            doc.text(`- ${todo.text}`, 14, 30 + (index * 10));
        });
        doc.save("quality-checklist.pdf");
    };

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Quality Standard\r\n";
        todos.forEach(todo => {
            const row = `"${todo.text.replace(/"/g, '""')}"`;
            csvContent += row + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "quality-checklist.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ===== UPDATED FUNCTION =====
    const downloadAsZip = () => {
      // This function now opens the specified Google Drive link in a new tab.
      window.open('https://drive.google.com/file/d/1Ptui3LF_KZ7NzV5Knem9o_vkZYXphZ8o/view?usp=drive_link', '_blank', 'noopener,noreferrer');
    };

    if (showDisclaimer) {
        return (
            <div className="modal-backdrop">
                <div className="modal-content">
                    <h2 className="text-2xl font-bold mb-4 text-primary-dark">Terms of Use & Disclaimer</h2>
                    <div className="space-y-3 text-sm text-gray-700 mb-6">
                      <p>Welcome to the Quality Floor Checklist Builder. Before you begin, please read the following terms carefully:</p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Public and Collaborative:</strong> All content, including any checklist items you add or delete, is public and will be visible to anyone who visits this page. Do not enter any private, sensitive, or confidential information.</li>
                        <li><strong>No Guarantee of Privacy:</strong> There is no expectation of privacy for any data entered into this application. All data is stored in a shared database.</li>
                        <li><strong>"As-Is" Service:</strong> This tool is provided "as-is" without any warranties. We are not responsible for the availability of the service or the loss of any data you enter.</li>
                        <li><strong>User Responsibility:</strong> You are solely responsible for the content you contribute. Do not post anything that is unlawful, harmful, or infringes on the rights of others.</li>
                      </ol>
                      <p className="font-semibold text-gray-800">By clicking "Acknowledge & Continue," you confirm that you have read, understood, and agree to be bound by these terms.</p>
                    </div>
                    <button onClick={() => setShowDisclaimer(false)} className="w-full btn bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Acknowledge & Continue</button>
                </div>
            </div>
        );
    }

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-primary-dark">Quality Floor Checklist</h1>
              <p className="text-lg text-gray-600 mt-2">A collaborative list of non-negotiable minimums for our projects.</p>
          </header>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                  <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTodoItem()}
                      className="flex-grow p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      placeholder="Add a new quality standard..."
                  />
                  <button onClick={addTodoItem} className="btn bg-primary-dark text-white font-bold py-3 px-6 rounded-lg">
                      Add Item
                  </button>
              </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button onClick={exportToPDF} className="btn bg-white text-primary-dark font-semibold py-2 px-4 border border-primary-dark rounded-lg shadow">Export to PDF</button>
              <button onClick={exportToCSV} className="btn bg-white text-primary-dark font-semibold py-2 px-4 border border-primary-dark rounded-lg shadow">Export to CSV</button>
              <button onClick={downloadAsZip} className="btn bg-primary-dark text-white font-semibold py-2 px-4 border border-primary-dark rounded-lg shadow">App Deploy file as ZIP</button>
          </div>
          <div className="bg-white/70 border-2 border-dashed border-primary-main rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg text-primary-dark mb-3">How to Use This Checklist</h3>
              <div className="space-y-4">
                  <div>
                      <h4 className="font-semibold text-gray-800">Option 1: Collaborate on This Live Version</h4>
                      <p className="text-gray-700 text-sm mt-1">
                          Feel free to use this live, shared version. Simply copy the public URL of this page and send it to your teammates. Everyone with the link can edit this list in real-time.
                      </p>
                  </div>
                  <div>
                      <h4 className="font-semibold text-gray-800">Option 2: Deploy Your Own Private Version</h4>
                      <p className="text-gray-700 text-sm mt-1">
                          For a completely private checklist for your team, you can deploy your own copy of this application. This requires some technical setup (creating a free Firebase project and deploying the code to a service like Cloudflare Pages or Netlify).
                      </p>
                  </div>
              </div>
          </div>
          
          {userId && (
              <div className="text-center my-4 p-2 bg-white/50 rounded-lg">
                  <p className="text-sm text-gray-700">Your User ID (for reference): <strong className="text-primary-dark font-mono">{userId}</strong></p>
              </div>
          )}
          <div className="space-y-4">
              {todos.length > 0 ? todos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow transition-transform transform hover:scale-105">
                      <span className="flex-grow mr-4">{todo.text}</span>
                      <button onClick={() => deleteTodoItem(todo.id)} className="ml-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                      </button>
                  </div>
              )) : (
                  <p className="text-center text-gray-500">
                      {isAuthReady ? "No quality standards added yet. Be the first!" : "Loading checklist..."}
                  </p>
              )}
          </div>
      </div>
    );
}