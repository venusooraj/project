
import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, MessageCircle, ShieldAlert, Utensils, 
  Users, Bot, Trophy, Calendar, Play, BarChart, 
  Menu, Bell, LogOut, Settings, ChevronRight, MapPin, 
  CalendarDays, Clock, Ticket, Video, Trash2, PlusCircle,
  X, Check, Loader, PlayCircle, Send, FileText, Search, Download,
  FileBox, Youtube, CheckSquare, Square, Droplets, Moon, Footprints, Flame, User
} from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import SOSOverlay from './components/SOSOverlay';
import AIChatbot from './components/AIChatbot';
import { 
  INITIAL_VIDEOS, INITIAL_MEALS, INITIAL_EVENTS, 
  COMMUNITY_POSTS, INITIAL_RESOURCES 
} from './constants';
import { UserRole, UserData, Event, Video as VideoType, Meal as MealType, CommunityPost, Resource, Registration } from './types';

// Simple Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-[70] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
    <CheckCircleIcon className="text-green-400" size={20} />
    <span className="font-medium">{message}</span>
  </div>
);

// Registration Success Modal
const RegistrationSuccessModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center relative animate-in zoom-in-95">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={32} strokeWidth={3} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
      <p className="text-slate-500 mb-6 text-sm">You have successfully registered for this event. We have added it to your schedule.</p>
      <button 
        onClick={onClose}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all"
      >
        Done
      </button>
    </div>
  </div>
);

const CheckCircleIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null); 
  const [userData, setUserData] = useState<UserData | null>(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSOS, setShowSOS] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  // Dynamic Data State with Persistence
  const [videos, setVideos] = useState<VideoType[]>(() => {
    const saved = localStorage.getItem('wc_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });
  const [meals, setMeals] = useState<MealType[]>(() => {
    const saved = localStorage.getItem('wc_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('wc_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('wc_posts');
    return saved ? JSON.parse(saved) : COMMUNITY_POSTS;
  });
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('wc_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('wc_registrations');
    return saved ? JSON.parse(saved) : [];
  });
  const [userLogs, setUserLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('wc_user_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Interactive State
  const [playingVideo, setPlayingVideo] = useState<VideoType | null>(null);
  
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('wc_registered');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [reminderEvents, setReminderEvents] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('wc_reminders');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Checklist State
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('wc_checklist');
    return saved ? JSON.parse(saved) : { water: false, meditation: false, exercise: false, meal: false };
  });
  
  const [newPostText, setNewPostText] = useState('');
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
  const [dietPreference, setDietPreference] = useState<'Veg' | 'Non-Veg' | 'Mix'>('Mix');
  
  // Wellness Data State
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [mood, setMood] = useState('neutral');
  const [sleepHours, setSleepHours] = useState(6.5);
  const [dailyCalories, setDailyCalories] = useState(() => {
     const saved = localStorage.getItem('wc_calories');
     return saved ? parseInt(saved) : 980;
  });
  
  // Map State
  const [mapSearchQuery, setMapSearchQuery] = useState('hospitals doctors clinics near me');
  const [tempMapQuery, setTempMapQuery] = useState('');

  // Nutrition Manual Add
  const [showManualMeal, setShowManualMeal] = useState(false);
  const [manualMealForm, setManualMealForm] = useState({ title: '', cal: '', type: 'Veg', tags: '' });

  // Admin Forms State
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideoForm, setNewVideoForm] = useState({ title: '', duration: '', videoId: '' });
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealForm, setNewMealForm] = useState({ title: '', type: 'Veg', cal: '' });
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResourceForm, setNewResourceForm] = useState({ title: '', type: 'Guide', content: '' });

  // Add Program Form State
  const [programForm, setProgramForm] = useState({
    title: '',
    category: '',
    startDate: '',
    endDate: '',
    time: '',
    location: '',
    description: ''
  });

  // Derived State
  const wellnessScore = Math.round(((waterGlasses / 8) * 30) + ((sleepHours / 8) * 40) + (mood === 'happy' ? 30 : 15) + (Object.values(checklist).filter(Boolean).length * 5));
  const stressLevel = sleepHours < 6 ? 'High' : sleepHours < 7.5 ? 'Moderate' : 'Low';

  // Persistence Effects
  useEffect(() => { localStorage.setItem('wc_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('wc_meals', JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem('wc_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('wc_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('wc_resources', JSON.stringify(resources)); }, [resources]);
  useEffect(() => { localStorage.setItem('wc_registered', JSON.stringify([...registeredEvents])); }, [registeredEvents]);
  useEffect(() => { localStorage.setItem('wc_reminders', JSON.stringify([...reminderEvents])); }, [reminderEvents]);
  useEffect(() => { localStorage.setItem('wc_checklist', JSON.stringify(checklist)); }, [checklist]);
  useEffect(() => { localStorage.setItem('wc_registrations', JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem('wc_user_logs', JSON.stringify(userLogs)); }, [userLogs]);
  useEffect(() => { localStorage.setItem('wc_calories', dailyCalories.toString()); }, [dailyCalories]);

  // Login Handler
  const handleLogin = (role: UserRole, data: UserData) => {
    setUserRole(role);
    setUserData(data); 
    setIsLoggedIn(true);
    setActiveTab(role === 'admin' ? 'admin_overview' : 'dashboard');

    // Log User Activity
    const now = new Date();
    const newLog = {
      id: Date.now(),
      name: data.name || 'Admin',
      email: data.email,
      role: role,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      day: now.toLocaleDateString('en-US', { weekday: 'long' })
    };
    setUserLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);
    setSidebarOpen(false);
  };

  // --- ACTIONS ---

  const showToastNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegister = (id: number) => {
    setRegisteredEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        
        // Add detailed registration record
        const newReg: Registration = {
          id: Date.now(),
          eventId: id,
          userEmail: userData?.email || 'Unknown',
          userName: userData?.name || 'Member',
          timestamp: new Date().toLocaleString()
        };
        setRegistrations(prevReg => [...prevReg, newReg]);
        
        // Show Modal instead of Toast
        setShowRegModal(true);
      }
      return newSet;
    });
  };

  const handleRemind = (id: number) => {
    setReminderEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        alert("Reminder set! We will notify you 1 hour before the event.");
      }
      return newSet;
    });
  };

  const handlePostSubmit = () => {
    if (!newPostText.trim()) return;
    const newPost: CommunityPost = {
      id: Date.now(),
      tag: "General",
      text: newPostText,
      likes: 0,
      comments: 0
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleGenerateMeals = () => {
    setIsGeneratingMeals(true);
    
    // Simulate API call and generation logic based on preference
    setTimeout(() => {
      let generatedMeals: MealType[] = [];
      
      if (dietPreference === 'Veg') {
        generatedMeals = [
          { id: Date.now() + 1, type: "Veg", title: "Mediterranean Chickpea Salad", cal: 380, tags: ["AI Suggested", "Fiber"] },
          { id: Date.now() + 2, type: "Veg", title: "Spinach & Paneer Wrap", cal: 420, tags: ["AI Suggested", "Protein"] },
        ];
      } else if (dietPreference === 'Non-Veg') {
        generatedMeals = [
          { id: Date.now() + 1, type: "Non-Veg", title: "Lemon Herb Salmon", cal: 550, tags: ["AI Suggested", "Omega-3"] },
          { id: Date.now() + 2, type: "Non-Veg", title: "Grilled Chicken Salad", cal: 400, tags: ["AI Suggested", "Lean"] },
        ];
      } else {
         generatedMeals = [
          { id: Date.now() + 1, type: "Veg", title: "Buddha Bowl with Hummus", cal: 420, tags: ["AI Suggested", "Fiber"] },
          { id: Date.now() + 2, type: "Non-Veg", title: "Teriyaki Chicken Rice", cal: 550, tags: ["AI Suggested", "Balanced"] },
        ];
      }
      
      // Keep manually added meals (tagged "User Log") and append new ones
      const userMeals = meals.filter(m => m.tags.includes("User Log"));
      setMeals([...userMeals, ...generatedMeals]);
      setIsGeneratingMeals(false);
    }, 1500);
  };

  const handleManualMealAdd = () => {
    if(!manualMealForm.title || !manualMealForm.cal) return;
    
    const tagsArray = manualMealForm.tags 
      ? manualMealForm.tags.split(',').map(t => t.trim()).filter(Boolean) 
      : [];
    tagsArray.push("User Log");

    const newMeal: MealType = {
        id: Date.now(),
        title: manualMealForm.title,
        cal: manualMealForm.cal,
        type: manualMealForm.type,
        tags: tagsArray
    };
    
    // Update total calories
    const addedCal = parseInt(manualMealForm.cal) || 0;
    setDailyCalories(prev => prev + addedCal);

    setMeals([newMeal, ...meals]);
    setManualMealForm({ title: '', cal: '', type: 'Veg', tags: '' });
    setShowManualMeal(false);
  };

  const downloadResource = (title: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMapSearch = (overrideQuery?: string) => {
    const queryToUse = overrideQuery || tempMapQuery;
    if (!queryToUse) return;
    
    const lowerQ = queryToUse.toLowerCase();
    const medicalKeywords = ['doctor', 'hospital', 'clinic', 'health', 'physician', 'therapist', 'nutrition', 'dietitian', 'dental', 'dentist', 'optometrist', 'psych', 'counselor', 'wellness', 'pharmacy', 'cardio', 'derma', 'surgery', 'care', 'medical'];
    
    const hasKeyword = medicalKeywords.some(k => lowerQ.includes(k));

    if (!hasKeyword) {
       // Assume it's a location, search for healthcare in that location
       setMapSearchQuery(`${queryToUse} hospitals clinics doctors`);
    } else {
       // It has a medical term, let it fly (Google Maps is smart)
       setMapSearchQuery(queryToUse);
    }
    
    // If called via button (overrideQuery), also update the input box visual
    if (overrideQuery) {
        setTempMapQuery(overrideQuery);
    }
  };

  // --- ADMIN ACTIONS ---
  const deleteVideo = (id: number) => setVideos(videos.filter(v => v.id !== id));
  const deleteMeal = (id: number) => setMeals(meals.filter(m => m.id !== id));
  const deleteResource = (id: number) => setResources(resources.filter(r => r.id !== id));
  const deleteEvent = (id: number) => setEvents(events.filter(e => e.id !== id));
  
  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title || !programForm.startDate) return;

    setEvents([
      {
        id: Date.now(),
        title: programForm.title,
        category: programForm.category || 'General',
        startDate: programForm.startDate,
        endDate: programForm.endDate,
        time: programForm.time,
        location: programForm.location,
        description: programForm.description
      },
      ...events
    ]);
    
    // Clear Form
    setProgramForm({
        title: '',
        category: '',
        startDate: '',
        endDate: '',
        time: '',
        location: '',
        description: ''
    });
    alert('Program Added Successfully!');
  };

  const extractVideoId = (url: string) => {
    // Simple logic to extract ID from youtube link
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const handleAddVideo = () => {
    if (!newVideoForm.title || !newVideoForm.duration) return;
    setVideos([...videos, {
      id: Date.now(),
      title: newVideoForm.title,
      duration: newVideoForm.duration,
      thumb: "bg-blue-100",
      videoId: extractVideoId(newVideoForm.videoId) || "dQw4w9WgXcQ" 
    }]);
    setNewVideoForm({ title: '', duration: '', videoId: '' });
    setShowAddVideo(false);
  };

  const handleAddMeal = () => {
    if (!newMealForm.title || !newMealForm.cal) return;
    setMeals([...meals, {
      id: Date.now(),
      type: newMealForm.type,
      title: newMealForm.title,
      cal: newMealForm.cal,
      tags: ["New"]
    }]);
    setNewMealForm({ title: '', type: 'Veg', cal: '' });
    setShowAddMeal(false);
  };

  const handleAddResource = () => {
    if (!newResourceForm.title || !newResourceForm.content) return;
    setResources([...resources, {
      id: Date.now(),
      title: newResourceForm.title,
      type: newResourceForm.type as 'Guide' | 'Plan',
      content: newResourceForm.content
    }]);
    setNewResourceForm({ title: '', type: 'Guide', content: '' });
    setShowAddResource(false);
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex overflow-hidden">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* REGISTRATION SUCCESS MODAL */}
      {showRegModal && <RegistrationSuccessModal onClose={() => setShowRegModal(false)} />}

      {/* VIDEO PLAYER MODAL */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden relative shadow-2xl">
            <button 
              onClick={() => setPlayingVideo(null)} 
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 p-2 rounded-full z-10"
            >
              <X size={24} />
            </button>
            <div className="aspect-video w-full">
               <iframe 
                 width="100%" 
                 height="100%" 
                 src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1`}
                 title="Video player" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               ></iframe>
            </div>
            <div className="p-6 bg-slate-900 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PlayCircle className="text-indigo-400"/> {playingVideo.title}
              </h3>
              <p className="text-slate-400 mt-1">{playingVideo.duration} • Guided Session</p>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL SOS BUTTON */}
      {userRole === 'student' && (
        <button 
          onClick={() => setShowSOS(true)}
          className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
        >
          <ShieldAlert size={20} />
          <span className="hidden sm:inline">SOS</span>
        </button>
      )}

      {/* SOS OVERLAY */}
      {showSOS && <SOSOverlay onClose={() => setShowSOS(false)} />}

      {/* CHATBOT */}
      {userRole === 'student' && (
        <>
          {showChatbot && <AIChatbot onClose={() => setShowChatbot(false)} />}
          {!showChatbot && (
            <button 
              onClick={() => setShowChatbot(true)}
              className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              <Bot size={28} />
            </button>
          )}
        </>
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl mb-8">
            <Heart className="fill-current" />
            <span>WellCampus</span>
          </div>
          
          <nav className="space-y-2 flex-1">
            {userRole === 'student' ? (
              <>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Member Menu</p>
                <SidebarItem id="dashboard" icon={Activity} label="Dashboard" />
                <SidebarItem id="events" icon={CalendarDays} label="Events" />
                <SidebarItem id="fitness" icon={Trophy} label="Fitness & Activity" />
                <SidebarItem id="nutrition" icon={Utensils} label="Nutrition" />
                <SidebarItem id="community" icon={Users} label="Community" />
                <SidebarItem id="appointments" icon={MapPin} label="Find Doctors" />
              </>
            ) : (
              <>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Admin Menu</p>
                <SidebarItem id="admin_overview" icon={BarChart} label="Overview & Stats" />
                <SidebarItem id="admin_resources" icon={Settings} label="Manage Resources" />
                <SidebarItem id="admin_alerts" icon={Bell} label="Events & Programs" />
              </>
            )}
          </nav>

          <div className="border-t pt-4">
            <div className="mb-4 px-2">
                <p className="text-xs text-gray-400">Logged in as:</p>
                <p className="text-sm font-bold text-gray-800 truncate">{userData?.email}</p>
                {userData?.name && <p className="text-xs text-indigo-600">{userData.name}</p>}
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b shadow-sm z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-indigo-600">WellCampus</span>
          <div className="w-8"></div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
          
          {/* ======================= STUDENT VIEWS ======================= */}
          
          {userRole === 'student' && activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Hello, {userData?.name || 'Member'}! 👋</h1>
                <p className="text-slate-500">Your daily wellness overview.</p>
              </header>

              {/* 1. Wellness Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                 <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg">
                    <p className="text-indigo-200 text-xs uppercase font-bold mb-1">Wellness Score</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{wellnessScore}</span>
                      <span className="text-sm text-indigo-200 mb-1">/ 100</span>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Programs Joined</p>
                    <span className="text-2xl font-bold text-slate-800">{registeredEvents.size}</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Activity</p>
                    <span className="text-xl font-bold text-slate-800">Moderate</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Sleep</p>
                    <span className="text-2xl font-bold text-slate-800">{sleepHours}h</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Water</p>
                    <span className="text-2xl font-bold text-slate-800">{Math.round((waterGlasses * 250) / 1000 * 10) / 10}L</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-xs uppercase font-bold mb-1">Calories</p>
                    <span className="text-2xl font-bold text-slate-800">{dailyCalories}</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 2. Daily Wellness Checklist */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <CheckSquare className="text-green-500" size={20}/> Daily Goals
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { key: 'water', label: 'Drink 8 Glasses Water', icon: Droplets },
                            { key: 'meditation', label: '10 Min Meditation', icon: Moon },
                            { key: 'exercise', label: '30 Min Exercise', icon: Footprints },
                            { key: 'meal', label: 'Eat Healthy Meal', icon: Utensils }
                          ].map((item) => (
                             <div 
                                key={item.key} 
                                onClick={() => toggleChecklist(item.key as keyof typeof checklist)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checklist[item.key as keyof typeof checklist] ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}
                             >
                                <div className={`w-6 h-6 rounded flex items-center justify-center border ${checklist[item.key as keyof typeof checklist] ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300'}`}>
                                   {checklist[item.key as keyof typeof checklist] && <Check size={14} />}
                                </div>
                                <item.icon size={18} className={checklist[item.key as keyof typeof checklist] ? 'text-green-600' : 'text-slate-400'} />
                                <span className={`text-sm font-medium ${checklist[item.key as keyof typeof checklist] ? 'text-green-800 line-through' : 'text-slate-700'}`}>{item.label}</span>
                             </div>
                          ))}
                      </div>
                  </div>

                  {/* 3. Quick Health Stats (Mini) */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-center">
                      <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                         <Activity size={18}/> Quick Stats
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <span className="text-sm text-slate-400">Sleep</span>
                            <span className="font-bold">{sleepHours} hrs</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <span className="text-sm text-slate-400">Water</span>
                            <span className="font-bold">{Math.round((waterGlasses * 250) / 1000 * 10) / 10} L</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <span className="text-sm text-slate-400">Steps</span>
                            <span className="font-bold">3,200</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-400">Calories Intake</span>
                            <span className="font-bold text-orange-400">{dailyCalories} kcal</span>
                         </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* 4. Recent Activity */}
                   <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                         <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                              <tr>
                                 <th className="px-4 py-3 rounded-l-lg">Activity</th>
                                 <th className="px-4 py-3">Category</th>
                                 <th className="px-4 py-3 rounded-r-lg text-right">Time</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              <tr>
                                 <td className="px-4 py-3 font-medium text-slate-700">Morning Meditation</td>
                                 <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Mindfulness</span></td>
                                 <td className="px-4 py-3 text-right text-slate-500">8:00 AM</td>
                              </tr>
                              <tr>
                                 <td className="px-4 py-3 font-medium text-slate-700">Logged Breakfast</td>
                                 <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Nutrition</span></td>
                                 <td className="px-4 py-3 text-right text-slate-500">9:30 AM</td>
                              </tr>
                              <tr>
                                 <td className="px-4 py-3 font-medium text-slate-700">Viewed Fitness Video</td>
                                 <td className="px-4 py-3"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Fitness</span></td>
                                 <td className="px-4 py-3 text-right text-slate-500">Yesterday</td>
                              </tr>
                           </tbody>
                        </table>
                      </div>
                   </div>

                   {/* 5. Upcoming Wellness Program */}
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                       <h3 className="font-bold text-lg text-slate-800 mb-4">Up Next</h3>
                       {events.length > 0 ? (
                          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex-1 flex flex-col justify-center text-center">
                             <div className="w-12 h-12 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarDays size={24}/>
                             </div>
                             <h4 className="font-bold text-indigo-900 text-lg mb-1">{events[0].title}</h4>
                             <p className="text-indigo-600 text-sm mb-4">{events[0].category}</p>
                             <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center justify-center gap-2">
                                   <Calendar size={14}/> {events[0].startDate}
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                   <Clock size={14}/> {events[0].time || 'TBA'}
                                </div>
                             </div>
                             <button onClick={() => setActiveTab('events')} className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">View Details</button>
                          </div>
                       ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                             <Calendar size={32} className="mb-2 opacity-50"/>
                             <p className="text-sm">No upcoming events</p>
                          </div>
                       )}
                   </div>
              </div>
            </div>
          )}

          {userRole === 'student' && activeTab === 'events' && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Events</h1>
                    <p className="text-slate-500">Discover and register for wellness activities.</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {events.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl border text-center text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No events scheduled at the moment.</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                                {event.category}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={16} className="text-indigo-500" />
                                                <span>{event.startDate} {event.endDate && ` - ${event.endDate}`}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-indigo-500" />
                                                <span>{event.time || 'All Day'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-indigo-500" />
                                                <span>{event.location || 'Campus Center'}</span>
                                            </div>
                                        </div>
                                        
                                        {event.description && (
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100 mb-4">
                                                {event.description}
                                            </p>
                                        )}
                                        
                                        {/* Map Integration */}
                                        <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-200 mb-4 bg-slate-100 relative">
                                            <div className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded shadow-sm z-10 font-bold text-slate-700">Event Location</div>
                                           <iframe 
                                             width="100%" 
                                             height="100%" 
                                             frameBorder="0" 
                                             scrolling="no" 
                                             marginHeight={0} 
                                             marginWidth={0} 
                                             src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location || 'University Campus')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                             title="Event Location"
                                           ></iframe>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 w-full md:w-auto min-w-[150px]">
                                        <button 
                                          onClick={() => handleRegister(event.id)}
                                          disabled={registeredEvents.has(event.id)}
                                          className={`flex items-center justify-center gap-2 w-full font-bold py-2 px-4 rounded-lg transition-colors ${
                                            registeredEvents.has(event.id) 
                                              ? 'bg-green-100 text-green-700 cursor-default' 
                                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                          }`}
                                        >
                                            {registeredEvents.has(event.id) ? <><Check size={16} /> Registered</> : <><Ticket size={16} /> Register</>}
                                        </button>
                                        
                                        <button 
                                          onClick={() => handleRemind(event.id)}
                                          className={`flex items-center justify-center gap-2 w-full border font-medium py-2 px-4 rounded-lg transition-colors ${
                                            reminderEvents.has(event.id)
                                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                                              : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                           <Bell size={16} className={reminderEvents.has(event.id) ? "fill-current" : ""} /> 
                                           {reminderEvents.has(event.id) ? 'Reminder Set' : 'Remind Me'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          )}

          {userRole === 'student' && activeTab === 'fitness' && (
             <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Fitness & Activity</h2>
                  <p className="text-slate-500">Access curated workouts to stay active.</p>
                </div>
              </div>

              {/* Programs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-slate-100 rounded-xl text-slate-500">
                        No videos available. Check back later!
                    </div>
                ) : (
                    videos.map(video => (
                    <div 
                      key={video.id} 
                      onClick={() => setPlayingVideo(video)}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
                    >
                        <div className={`h-40 ${video.thumb} flex items-center justify-center relative`}>
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="text-indigo-600 fill-current ml-1" size={24} />
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                            {video.duration}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{video.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Beginner Friendly • No Equipment</p>
                        </div>
                    </div>
                    ))
                )}
              </div>

              {/* Resources Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                   <FileText size={20} className="text-indigo-600"/> Wellness Resources
                </h3>
                {resources.length === 0 ? (
                  <p className="text-slate-500 text-sm">No resources available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resources.map(resource => (
                        <button 
                          key={resource.id}
                          onClick={() => downloadResource(resource.title, resource.content)}
                          className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group w-full text-left"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${resource.type === 'Guide' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {resource.type === 'Guide' ? <Utensils size={20}/> : <Activity size={20}/>}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-700">{resource.title}</h4>
                                <p className="text-xs text-slate-500">Click to Download • Text File</p>
                            </div>
                            <Download size={16} className="text-slate-400 group-hover:text-indigo-600"/>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {userRole === 'student' && activeTab === 'nutrition' && (
             <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Water Tracker</h2>
                  <p className="text-sm text-slate-500">Goal: 8 glasses/day</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200">-</button>
                  <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`w-4 h-10 rounded-full ${i < waterGlasses ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                    ))}
                  </div>
                  <button onClick={() => setWaterGlasses(Math.min(8, waterGlasses + 1))} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">+</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Smart Meal Planner</h3>
                    <p className="text-sm text-slate-500">Get personalized daily meal plans.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setShowManualMeal(!showManualMeal)}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {showManualMeal ? 'Cancel Log' : '+ Log Meal'}
                    </button>
                    
                    {!showManualMeal && (
                      <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                          {(['Veg', 'Non-Veg', 'Mix'] as const).map(pref => (
                              <button 
                                  key={pref}
                                  onClick={() => setDietPreference(pref)}
                                  className={`px-3 py-1.5 rounded-md transition-all ${dietPreference === pref ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                  {pref}
                              </button>
                          ))}
                      </div>
                    )}
                    
                    {!showManualMeal && (
                      <button 
                        onClick={handleGenerateMeals}
                        disabled={isGeneratingMeals}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-70"
                      >
                        {isGeneratingMeals ? <Loader className="animate-spin" size={16} /> : <Bot size={16} />}
                        {isGeneratingMeals ? 'Generating...' : 'Suggest Meals'}
                      </button>
                    )}
                  </div>
                </div>

                {showManualMeal && (
                   <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold text-sm mb-3">Log Your Meal</h4>
                      <div className="flex flex-col md:flex-row gap-3">
                          <div className="flex-1 space-y-2">
                            <input 
                                placeholder="Meal Name (e.g. Oatmeal)" 
                                className="w-full p-2 border rounded-lg text-sm"
                                value={manualMealForm.title}
                                onChange={(e) => setManualMealForm({...manualMealForm, title: e.target.value})}
                            />
                            <input 
                                placeholder="Custom Tags (e.g. Fiber, Spicy) - Comma separated" 
                                className="w-full p-2 border rounded-lg text-sm"
                                value={manualMealForm.tags}
                                onChange={(e) => setManualMealForm({...manualMealForm, tags: e.target.value})}
                            />
                          </div>
                          <div className="flex gap-2">
                            <input 
                                placeholder="Calories" 
                                className="w-24 p-2 border rounded-lg text-sm h-10"
                                type="number"
                                value={manualMealForm.cal}
                                onChange={(e) => setManualMealForm({...manualMealForm, cal: e.target.value})}
                            />
                            <select 
                                className="p-2 border rounded-lg text-sm h-10"
                                value={manualMealForm.type}
                                onChange={(e) => setManualMealForm({...manualMealForm, type: e.target.value})}
                            >
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Boost">Boost</option>
                            </select>
                          </div>
                          <button 
                            onClick={handleManualMealAdd}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 h-10"
                          >
                            Add Log
                          </button>
                      </div>
                   </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {meals.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-slate-500 text-sm">No meal plans currently available.</div>
                  ) : (
                    meals.map((meal) => (
                        <div key={meal.id} className="border rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50/50">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs px-2 py-1 rounded font-bold ${meal.type === 'Veg' ? 'bg-green-100 text-green-700' : meal.type === 'Non-Veg' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {meal.type}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{meal.cal} kcal</span>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-2">{meal.title}</h4>
                        <div className="flex flex-wrap gap-1">
                            {meal.tags.map(tag => (
                            <span key={tag} className={`text-[10px] border px-1.5 py-0.5 rounded shadow-sm ${tag === 'User Log' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>{tag}</span>
                            ))}
                        </div>
                        <button onClick={() => deleteMeal(meal.id)} className="mt-3 text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                           <Trash2 size={12}/> Remove
                        </button>
                        </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {userRole === 'student' && activeTab === 'community' && (
             <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-xl font-bold mb-4">Member Community</h2>
                
                {/* New Post Input */}
                <div className="mb-6">
                  <div className="relative">
                    <textarea 
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Share your thoughts anonymously..."
                      className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none h-24 text-sm"
                    />
                    <button 
                      onClick={handlePostSubmit}
                      disabled={!newPostText.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-center mb-6">
                  {['Mental Health', 'Academics', 'Fitness', 'Diet'].map(topic => (
                    <button key={topic} className="px-3 py-1 rounded-full border text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-slate-600">
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-slate-200 transition-colors text-left">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{post.tag}</span>
                        <span className="text-xs text-slate-400">Just now</span>
                      </div>
                      <p className="text-slate-700 mb-4">{post.text}</p>
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart size={16} /> {post.likes}</button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle size={16} /> {post.comments}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {userRole === 'student' && activeTab === 'appointments' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Healthcare Locator</h2>
              </div>
               
               {/* Nearby Doctors Map */}
               <div className="bg-white rounded-2xl shadow-sm border p-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <MapPin size={20} className="text-red-500"/> Find Nearby Healthcare
                        </h3>
                        <p className="text-slate-500 text-sm">Locate doctors, clinics, and hospitals near you.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input 
                            type="text"
                            placeholder="Search (e.g. Dentist, Location)"
                            className="border p-2 rounded-lg text-sm w-full md:w-64"
                            value={tempMapQuery}
                            onChange={(e) => setTempMapQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleMapSearch()}
                        />
                        <button 
                            onClick={() => handleMapSearch()}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                 </div>

                 {/* Quick Categories */}
                 <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {['General Doctor', 'Dentist', 'Nutritionist', 'Psychologist', 'Eye Specialist', 'Pharmacy', 'Hospitals'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleMapSearch(cat)}
                            className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-full text-xs font-medium border border-slate-200 transition-colors"
                        >
                            {cat}
                        </button>
                    ))}
                 </div>
                 
                 <div className="w-full h-[500px] rounded-xl overflow-hidden bg-slate-100 border relative">
                    <div className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded shadow-sm z-10 font-bold text-slate-700">
                        {mapSearchQuery}
                    </div>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      title="Nearby Healthcare"
                    ></iframe>
                 </div>
               </div>
            </div>
          )}

          {/* ======================= ADMIN VIEWS ======================= */}

          {userRole === 'admin' && activeTab === 'admin_overview' && (
             <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500">System overview and usage metrics.</p>
              </header>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                  <h3 className="font-bold mb-4 text-slate-800">Platform Analytics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">Total Users</p>
                          <p className="text-xl font-bold text-indigo-600">1,245</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">SOS Alerts (Week)</p>
                          <p className="text-xl font-bold text-red-600">3</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">Avg Engagement</p>
                          <p className="text-xl font-bold text-green-600">45 mins</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">Pending Appts</p>
                          <p className="text-xl font-bold text-orange-500">12</p>
                      </div>
                  </div>
              </div>

              {/* Recent Member Activity */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                <h3 className="font-bold mb-4 text-slate-800">Recent Member Logins</h3>
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                    {userLogs.length === 0 ? (
                        <p className="text-slate-400 text-sm">No recent activity logged.</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Day</th>
                                    <th className="px-4 py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {userLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-3 font-medium text-slate-700">{log.name}</td>
                                        <td className="px-4 py-3 text-slate-500">{log.email}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${log.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{log.role}</span></td>
                                        <td className="px-4 py-3 text-slate-500">{log.day}, {log.date}</td>
                                        <td className="px-4 py-3 text-right text-slate-500 font-mono">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
              </div>

              {/* Heatmap Mockup */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-4 text-slate-800">Member Activity Heatmap</h3>
                <div className="h-40 flex items-end justify-between gap-1">
                  {[20, 30, 45, 60, 80, 50, 30, 20, 40, 60, 90, 70, 50, 40, 30, 20, 10, 20, 30, 40, 50, 40, 30, 20].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-100 rounded-t relative group">
                      <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-indigo-500 rounded-t opacity-80 hover:opacity-100 transition-all"></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>12 AM</span>
                  <span>6 AM</span>
                  <span>12 PM</span>
                  <span>6 PM</span>
                  <span>11 PM</span>
                </div>
              </div>
            </div>
          )}

          {userRole === 'admin' && activeTab === 'admin_resources' && (
             <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Resource Management</h1>
                <p className="text-slate-500">Add or remove wellness content for members.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Manage Videos */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Play size={20} className="text-orange-500"/> Fitness Videos
                        </h3>
                        <button 
                            onClick={() => setShowAddVideo(!showAddVideo)}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100"
                        >
                            {showAddVideo ? 'Cancel' : '+ Add New'}
                        </button>
                    </div>

                    {showAddVideo && (
                        <div className="bg-slate-50 p-4 rounded-xl border mb-4 animate-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <input 
                                    className="w-full text-sm p-2 border rounded-lg"
                                    placeholder="Video Title (e.g., 20 Min Core)"
                                    value={newVideoForm.title}
                                    onChange={(e) => setNewVideoForm({...newVideoForm, title: e.target.value})}
                                />
                                <div className="flex gap-2">
                                  <input 
                                      className="flex-1 text-sm p-2 border rounded-lg"
                                      placeholder="Duration (20:00)"
                                      value={newVideoForm.duration}
                                      onChange={(e) => setNewVideoForm({...newVideoForm, duration: e.target.value})}
                                  />
                                </div>
                                <input 
                                    className="w-full text-sm p-2 border rounded-lg"
                                    placeholder="YouTube Link or ID"
                                    value={newVideoForm.videoId}
                                    onChange={(e) => setNewVideoForm({...newVideoForm, videoId: e.target.value})}
                                />
                                <button 
                                    onClick={handleAddVideo}
                                    className="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg font-bold hover:bg-indigo-700"
                                >
                                    Save Video Resource
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {videos.map(v => (
                            <div key={v.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 flex-shrink-0 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                        <Youtube size={14}/>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold text-slate-700 truncate">{v.title}</p>
                                        <p className="text-xs text-slate-500">{v.duration}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteVideo(v.id)} className="text-red-500 hover:bg-red-50 p-2 rounded flex-shrink-0">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Manage Meals */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Utensils size={20} className="text-green-600"/> Meal Plans
                        </h3>
                        <button 
                            onClick={() => setShowAddMeal(!showAddMeal)}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100"
                        >
                            {showAddMeal ? 'Cancel' : '+ Add New'}
                        </button>
                    </div>

                     {showAddMeal && (
                        <div className="bg-slate-50 p-4 rounded-xl border mb-4 animate-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <input 
                                    className="w-full text-sm p-2 border rounded-lg"
                                    placeholder="Meal Name"
                                    value={newMealForm.title}
                                    onChange={(e) => setNewMealForm({...newMealForm, title: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <select 
                                        className="flex-1 text-sm p-2 border rounded-lg"
                                        value={newMealForm.type}
                                        onChange={(e) => setNewMealForm({...newMealForm, type: e.target.value})}
                                    >
                                        <option value="Veg">Veg</option>
                                        <option value="Non-Veg">Non-Veg</option>
                                        <option value="Boost">Boost</option>
                                    </select>
                                    <input 
                                        className="flex-1 text-sm p-2 border rounded-lg"
                                        placeholder="Kcal"
                                        value={newMealForm.cal}
                                        onChange={(e) => setNewMealForm({...newMealForm, cal: e.target.value})}
                                    />
                                </div>
                                <button 
                                    onClick={handleAddMeal}
                                    className="w-full bg-green-600 text-white text-sm py-2 rounded-lg font-bold hover:bg-green-700"
                                >
                                    Save Meal Plan
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {meals.map(m => (
                            <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{m.title}</p>
                                    <p className="text-xs text-slate-500">{m.cal} kcal • {m.type}</p>
                                </div>
                                <button onClick={() => deleteMeal(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Manage Wellness Resources */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileBox size={20} className="text-blue-600"/> Wellness Docs
                        </h3>
                        <button 
                            onClick={() => setShowAddResource(!showAddResource)}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100"
                        >
                            {showAddResource ? 'Cancel' : '+ Add New'}
                        </button>
                    </div>

                     {showAddResource && (
                        <div className="bg-slate-50 p-4 rounded-xl border mb-4 animate-in slide-in-from-top-2">
                            <div className="space-y-3">
                                <input 
                                    className="w-full text-sm p-2 border rounded-lg"
                                    placeholder="Resource Title"
                                    value={newResourceForm.title}
                                    onChange={(e) => setNewResourceForm({...newResourceForm, title: e.target.value})}
                                />
                                <select 
                                    className="w-full text-sm p-2 border rounded-lg"
                                    value={newResourceForm.type}
                                    onChange={(e) => setNewResourceForm({...newResourceForm, type: e.target.value})}
                                >
                                    <option value="Guide">Guide</option>
                                    <option value="Plan">Plan</option>
                                </select>
                                <textarea 
                                    className="w-full text-sm p-2 border rounded-lg h-20 resize-none"
                                    placeholder="Paste content/text here..."
                                    value={newResourceForm.content}
                                    onChange={(e) => setNewResourceForm({...newResourceForm, content: e.target.value})}
                                />
                                <button 
                                    onClick={handleAddResource}
                                    className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Save Resource
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {resources.map(r => (
                            <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <p className="text-sm font-bold text-slate-700">{r.title}</p>
                                    <p className="text-xs text-slate-500">{r.type} • Text File</p>
                                </div>
                                <button onClick={() => deleteResource(r.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>
              </div>
            </div>
          )}

          {userRole === 'admin' && activeTab === 'admin_alerts' && (
             <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Events & Programs</h1>
                <p className="text-slate-500">Manage university-wide wellness events and alerts.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ADD NEW PROGRAM FORM */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-indigo-700 text-lg mb-6 flex items-center gap-2">
                      <PlusCircle size={24}/> Add New Program
                  </h3>
                  
                  <form onSubmit={handleAddProgram} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                          {/* Program Name */}
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Program Name</label>
                              <input 
                                  type="text" 
                                  placeholder="Enter program name" 
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                                  value={programForm.title}
                                  onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                                  required
                              />
                          </div>

                          {/* Category */}
                          <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                              <select 
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-sm"
                                  value={programForm.category}
                                  onChange={(e) => setProgramForm({...programForm, category: e.target.value})}
                                  required
                              >
                                  <option value="" disabled>Select category</option>
                                  <option value="Wellness">Wellness</option>
                                  <option value="Fitness">Fitness</option>
                                  <option value="Medical">Medical</option>
                                  <option value="Academic">Academic</option>
                                  <option value="Social">Social</option>
                              </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             {/* Start Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                                    value={programForm.startDate}
                                    onChange={(e) => setProgramForm({...programForm, startDate: e.target.value})}
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                                    value={programForm.endDate}
                                    onChange={(e) => setProgramForm({...programForm, endDate: e.target.value})}
                                />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             {/* Time */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                                    value={programForm.time}
                                    onChange={(e) => setProgramForm({...programForm, time: e.target.value})}
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="E.g. Student Center"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                                    value={programForm.location}
                                    onChange={(e) => setProgramForm({...programForm, location: e.target.value})}
                                />
                            </div>
                          </div>
                      </div>

                      {/* Description */}
                      <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                          <textarea 
                              rows={3}
                              placeholder="Enter program description"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 resize-none text-sm"
                              value={programForm.description}
                              onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                          />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4 pt-2">
                          <button 
                              type="submit"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
                          >
                              Add Program
                          </button>
                          <button 
                              type="button"
                              onClick={() => setProgramForm({
                                  title: '', category: '', startDate: '', endDate: '', time: '', location: '', description: ''
                              })}
                              className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                          >
                              Clear
                          </button>
                      </div>
                  </form>
                </div>

                {/* EXISTING PROGRAMS LIST */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                   <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                      <CalendarDays size={24} className="text-indigo-600"/> Current Programs
                   </h3>
                   <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px]">
                      {events.length === 0 ? (
                        <p className="text-slate-400 text-sm italic">No active programs.</p>
                      ) : (
                        events.map(event => {
                          const eventRegs = registrations.filter(r => r.eventId === event.id);
                          return (
                          <div key={event.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-indigo-200 transition-colors">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                   <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{event.category}</span>
                                   <h4 className="font-bold text-slate-800 mt-1">{event.title}</h4>
                                </div>
                                <button 
                                  onClick={() => deleteEvent(event.id)}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                                >
                                  <Trash2 size={16}/>
                                </button>
                             </div>
                             <div className="text-xs text-slate-500 space-y-1 mb-3">
                                <p className="flex items-center gap-2"><Calendar size={12}/> {event.startDate}</p>
                                <p className="flex items-center gap-2"><MapPin size={12}/> {event.location || 'TBA'}</p>
                             </div>
                             
                             {/* Registration List Inside Admin View */}
                             <details className="text-xs border-t pt-2 border-slate-200">
                                <summary className="cursor-pointer font-bold text-indigo-600 hover:text-indigo-800 select-none flex items-center gap-1">
                                   <User size={12}/> Registered Members ({eventRegs.length})
                                </summary>
                                <div className="mt-2 bg-white rounded border border-slate-100 overflow-hidden">
                                   {eventRegs.length === 0 ? (
                                      <p className="p-2 text-slate-400 italic">No registrations yet.</p>
                                   ) : (
                                      <table className="w-full text-left">
                                         <thead className="bg-slate-50 text-slate-500">
                                            <tr>
                                               <th className="p-2 font-medium">Name</th>
                                               <th className="p-2 font-medium">Date</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-50">
                                            {eventRegs.map(reg => (
                                               <tr key={reg.id}>
                                                  <td className="p-2">
                                                     <p className="font-medium text-slate-700">{reg.userName}</p>
                                                     <p className="text-[10px] text-slate-400">{reg.userEmail}</p>
                                                  </td>
                                                  <td className="p-2 text-slate-500">{reg.timestamp}</td>
                                               </tr>
                                            ))}
                                         </tbody>
                                      </table>
                                   )}
                                </div>
                             </details>
                          </div>
                        )})
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
