import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle, Plus, X, Paperclip, Send, Search, User,
    Filter, Archive, Settings, PieChart, TrendingUp,
    AlertTriangle, ArrowRight, Box, Trash2, ShoppingCart,
    RefreshCw, Layers, Package, ChevronLeft, Pencil,
    MoreHorizontal, Download, Copy, Bell, CornerUpLeft,
    ChevronDown, DollarSign, Printer, Users, Hash,
    CreditCard, Link, Flame, Clock, Mail, Ban, CheckCircle2,
    Inbox as InboxIcon, Tag, Info, ChevronRight, Layout,
    MessageSquare, FileSignature, Bot, Shield, Calendar,
    Reply, ReplyAll, AlarmClock, CircleDashed, ExternalLink,
    UserPlus, Image as ImageIcon, Quote
} from 'lucide-react';

// --- 1. MOCK DATA & TYPES ---

const MOCK_CRM_DATA = {
    "Acme Aerospace": {
        accountNumber: "AA-9901",
        domains: ["acme-aerospace.com"],
        tier: "Platinum",
        ytdSpend: "$452,120",
        creditStatus: "Good ($1M Limit)",
        openQuotes: 4,
        notes: "Requires certs for all Cut Piece orders."
    },
    "Acme Plastics": {
        accountNumber: "AP-5500",
        domains: ["acmeplastics.com"],
        tier: "Gold",
        ytdSpend: "$155,000",
        creditStatus: "Net 30",
        openQuotes: 2,
        notes: "HQ Location. Bob is the main buyer for Northeast region."
    },
    "BuildIt Construction": {
        accountNumber: "BC-2234",
        domains: ["buildit.com"],
        tier: "Gold",
        ytdSpend: "$120,500",
        creditStatus: "Good",
        openQuotes: 1,
        notes: "Price sensitive on shipping."
    },
    "Precision Machining": {
        accountNumber: "PM-1001",
        domains: ["precision-machining.net"],
        tier: "Silver",
        ytdSpend: "$45,000",
        creditStatus: "Hold (Overdue)",
        openQuotes: 0,
        notes: "Strict tolerances on Rods."
    },
    "Global Tech": {
        accountNumber: "GT-8888",
        domains: ["globaltech.io"],
        tier: "Platinum",
        ytdSpend: "$890,000",
        creditStatus: "Good",
        openQuotes: 12,
        notes: "High volume washer consumer."
    },
    "AutoParts Co": {
        accountNumber: "AP-4420",
        domains: ["autoparts.com"],
        tier: "Gold",
        ytdSpend: "$210,000",
        creditStatus: "Good",
        openQuotes: 3,
        notes: "Uses Filament Wound tubes exclusively."
    },
    "Retro Fitters": {
        accountNumber: "RF-1985",
        domains: ["retrofitters.com"],
        tier: "Silver",
        ytdSpend: "$35,000",
        creditStatus: "Good",
        openQuotes: 2,
        notes: "Needs custom cut lengths often."
    }
};

const INITIAL_TAGS = [
    { id: 't1', name: 'CP Quote', color: 'bg-green-100 text-green-700', subtags: 1, available: 'Any inbox', lastUsed: 'Today', created: 'Jun 15, 2023' },
    { id: 't2', name: 'Customers', color: 'bg-blue-100 text-blue-700', subtags: 4, available: 'Any inbox', lastUsed: 'Today', created: 'May 03, 2023' },
    { id: 't3', name: 'Part Quote', color: 'bg-orange-100 text-orange-700', subtags: 1, available: 'Any inbox', lastUsed: 'Oct 23, 2025', created: 'May 02, 2023' },
    { id: 't4', name: 'PersonMetadata', color: 'bg-gray-100 text-gray-700', subtags: 1, available: 'Any inbox', lastUsed: '--', created: 'Apr 29, 2023' },
    { id: 't5', name: 'Recoverable Items', color: 'bg-gray-100 text-gray-700', subtags: 1, available: 'Any inbox', lastUsed: 'Aug 27, 2025', created: 'Feb 05, 2024' },
    { id: 't6', name: 'S&C', color: 'bg-teal-100 text-teal-700', subtags: 1, available: 'Any inbox', lastUsed: 'Dec 18, 2024', created: 'Apr 02, 2024' },
    { id: 't7', name: 'Shapes order', color: 'bg-orange-100 text-orange-700', subtags: 1, available: 'Any inbox', lastUsed: 'Nov 24, 2025', created: 'May 03, 2023' },
    { id: 't8', name: 'Urgent', color: 'bg-red-100 text-red-700', subtags: 0, available: 'Any inbox', lastUsed: 'Just now', created: 'Jan 01, 2023' }
];

const MOCK_THREADS = [
    {
        id: 8,
        subject: "Alro Steel RFQ# 8283011 Atlas Fibre Company LLC",
        customer: "Acme Plastics",
        customerInitials: "AP",
        timestamp: "10:00 AM",
        status: "Open",
        channel: "Quotes",
        assignee: "John Doe",
        tags: ["SLA Breach", "Distributor", "+1"],
        senderEmail: "bob@acmeplastics.com",
        to: ["bob@acmeplastics.com"],
        cc: ["sales@atlasfibre.com"],
        messages: [
            {
                id: 801,
                sender: "customer",
                name: "Bob Barker",
                text: "Attached is a Request for Quote - Please respond using the REPLY function in your E-MAIL system.",
                timestamp: "Today, 10:00 AM"
            }
        ],
        productContext: "Rod"
    },
    {
        id: 1,
        subject: "RFQ: Standard G10 Sheets",
        customer: "Acme Aerospace",
        customerInitials: "AA",
        timestamp: "10:30 AM",
        status: "Open",
        channel: "Quotes",
        assignee: "John Doe",
        tags: ["Sheet", "G10"],
        senderEmail: "sarah@acme-aerospace.com",
        to: ["sarah@acme-aerospace.com"],
        cc: [],
        messages: [
            {
                id: 101,
                sender: "customer",
                name: "Sarah Smith",
                text: "Hi Team, quote for 10 sheets of G10 FR4, 0.250\" x 36\" x 48\". Full sheets, no cutting needed.",
                timestamp: "Today, 10:30 AM"
            }
        ],
        productContext: "Sheet"
    },
    {
        id: 2,
        subject: "RFQ: Custom Cut Pieces (Sanded)",
        customer: "BuildIt Construction",
        customerInitials: "BC",
        timestamp: "11:15 AM",
        status: "Open",
        channel: "Quotes",
        assignee: "Mike Ross",
        tags: ["Cut Piece", "Fabrication"],
        senderEmail: "tom@buildit.com",
        to: ["tom@buildit.com"],
        cc: [],
        messages: [
            {
                id: 201,
                sender: "customer",
                name: "Tom Wilson",
                text: "Need 50 pieces of G10, cut to 12\" x 4\". Thickness .250\". Please Sand to remove gloss. Tolerance +/- .005.",
                timestamp: "Today, 11:15 AM"
            }
        ],
        productContext: "Cut Piece/Sand"
    }
];

// --- 2. UTILITY FUNCTIONS ---

const resolveCustomerFromEmail = (email) => {
    if (!email) return null;
    const domain = email.split('@')[1];
    const customerKey = Object.keys(MOCK_CRM_DATA).find(key =>
        MOCK_CRM_DATA[key].domains?.includes(domain)
    );
    if (customerKey) return { name: customerKey, ...MOCK_CRM_DATA[customerKey] };
    return null;
};

// Mock Spec Generator from previous versions
const getMockSpecs = (type) => {
    switch (type) {
        case 'Sheet': return { grade: 'G10 FR4', color: 'Natural', dims: '0.250" x 36" x 48"' };
        case 'Cut Piece/Sand': return { grade: 'G10 FR4', color: 'Natural', dims: '0.125" x 2" x 41"', ops: 'Sanded' };
        case 'Rod': return { grade: 'Phenolic LE', color: 'Natural', dims: '1.00" Dia x 48"' };
        case 'Tube': return { grade: 'G10', color: 'Natural', dims: '1.5" ID x 2.0" OD x 48"' };
        case 'Washer': return { grade: 'Nylon', color: 'White', dims: '#10 (0.200" ID x 0.500" OD)' };
        default: return { grade: 'G10', color: 'Natural', dims: 'Custom' };
    }
};

const getDescription = (type, specs) => {
    switch (type) {
        case 'Cut Piece/Sand': return `G10 ${specs.dims.split('"')[0]}" x ${specs.dims.split('x')[1]}" x ${specs.dims.split('x')[2]}"`;
        default: return `${specs.grade} ${specs.dims}`;
    }
}

// Helper Icon Component
const SmileIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
);

// --- 3. UI SUB-COMPONENTS ---

const FormInput = ({ label, suffix, placeholder, value, onChange }) => (
    <div className="flex flex-col">
        {label && <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>}
        <div className="flex shadow-sm">
            <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="flex-1 border border-gray-300 rounded-l px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-600 outline-none" />
            {suffix ? <div className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-2 py-1.5 text-xs text-gray-500 flex items-center font-medium">{suffix}</div> : <div className="w-1 border-t border-b border-r border-transparent"></div>}
        </div>
    </div>
);

const FormSelect = ({ label, options }) => (
    <div className="flex flex-col">
        {label && <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>}
        <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:ring-1 focus:ring-blue-600 outline-none shadow-sm">
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
    </div>
);

const Checkbox = ({ label }) => (
    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100">
        <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
        <span className="text-xs text-gray-700 font-medium">{label}</span>
    </label>
);

const ConfigForm = ({ type }) => {
    return (
        <div className="bg-white p-5 rounded-b border border-t-0 border-gray-200 shadow-sm animate-in fade-in duration-200">
            {/* --- DYNAMIC FORMS RESTORED --- */}
            {/* 1. SHEET & CUT PIECE */}
            {(type === 'Sheet' || type === 'Cut Piece/Sand') && (
                <div className="space-y-4">
                    {type === 'Cut Piece/Sand' && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pb-4 border-b border-gray-100">
                            <Checkbox label="Sanding Only" />
                            <Checkbox label="Customer Mat." />
                            <Checkbox label="Custom Mat." />
                            <Checkbox label="Masking Only" />
                            <Checkbox label="Remove Gloss" />
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                        <FormSelect label="Grade" options={["G10", "FR4", "G11", "Phenolic C", "Phenolic CE"]} />
                        <FormSelect label="Select Size" options={["48x96", "36x48", "Custom"]} />
                        <FormSelect label="Select Color" options={["Natural", "Black", "Yellow"]} />
                    </div>

                    {type === 'Cut Piece/Sand' ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                                <FormInput label="Length" placeholder="12.00" />
                                <FormInput label="Length (+)" placeholder="0.005" />
                                <FormInput label="Length (-)" placeholder="0.005" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                                <FormInput label="Width" placeholder="4.00" />
                                <FormInput label="Width (+)" placeholder="0.005" />
                                <FormInput label="Width (-)" placeholder="0.005" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Sanded Thickness" />
                                <FormInput label="Thick (+)" />
                                <FormInput label="Thick (-)" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Masking Sides" />
                                <FormInput label="# Sanded Sides" />
                                <FormInput label="Grain Direction" suffix="deg" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Kerf" placeholder="0.125" />
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="Thickness" />
                            <FormInput label="Length" />
                            <FormInput label="Width" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 pt-2">
                        <FormInput label="Quantity" placeholder="0" />
                    </div>
                </div>
            )}

            {/* 2. ROD & CUT ROD */}
            {(type === 'Rod' || type === 'Cut Rod') && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1">
                        <FormInput label="Input SKU (Optional):" placeholder="Scan or type..." />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <FormSelect label="Grade" options={["G10", "FR4", "Phenolic LE", "Phenolic CE", "Acetal"]} />
                        <FormSelect label="Color" options={["Natural", "Black"]} />
                        <FormInput label="Diameter" placeholder='1.0"' />
                    </div>
                    {type === 'Cut Rod' && (
                        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                            <FormInput label="Cut Length" placeholder="6.00" />
                            <FormInput label="Length (+)" placeholder="0.010" />
                            <FormInput label="Length (-)" placeholder="0.010" />
                        </div>
                    )}
                    <div className="grid grid-cols-1">
                        <FormInput label="Quantity" placeholder="e.g. 10 pcs or 200 ft" />
                    </div>
                </div>
            )}

            {/* 3. TUBE & CUT TUBE */}
            {(type === 'Tube' || type === 'Cut Tube') && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <FormSelect label="Grade" options={["G10", "FR4", "G11"]} />
                        <FormSelect label="Color" options={["Natural", "Black"]} />
                        <FormSelect label="Tube Type" options={["Rolled & Molded", "Filament Wound"]} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                        <FormInput label="Inner Dia (ID)" />
                        <FormInput label="ID (+)" />
                        <FormInput label="ID (-)" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                        <FormInput label="Outer Dia (OD)" />
                        <FormInput label="OD (+)" />
                        <FormInput label="OD (-)" />
                    </div>
                    {type === 'Cut Tube' ? (
                        <div className="grid grid-cols-3 gap-4 bg-blue-50 p-3 rounded border border-blue-100">
                            <FormInput label="Cut Length" />
                            <FormInput label="Length (+)" />
                            <FormInput label="Length (-)" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="Stock Length" placeholder="e.g. 48 inches" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect label="UOM" options={["Foot", "Inch", "Meter", "Piece"]} />
                        <FormInput label="Target Price" suffix="$" />
                    </div>
                    <div className="grid grid-cols-1">
                        <FormInput label="Quantity" />
                    </div>
                </div>
            )}

            {/* --- END DYNAMIC FORMS --- */}

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Extra Production Notes</label>
                    <textarea className="w-full border border-gray-300 rounded px-2 py-2 text-sm h-16 outline-none focus:ring-1 focus:ring-blue-600" placeholder="e.g. Certs required, package in bundles of 50..."></textarea>
                </div>
            </div>
        </div>
    )
};

// --- 4. MAJOR COMPONENTS ---

const SettingsView = ({ onClose, allTags }) => {
    return (
        <div className="p-8 bg-white h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <button onClick={onClose}><X /></button>
            </div>
            <p className="text-gray-500">Settings module placeholder</p>
        </div>
    );
};

const Sidebar = ({ activeChannel, setActiveChannel, onOpenSettings }) => (
    <div className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 font-sans">
        <div className="p-5 flex items-center gap-2">
            <img src="https://www.atlasfibre.com/wp-content/uploads/2023/03/logo.png" alt="Atlas Fibre" className="h-8 object-contain" />
        </div>

        <div className="px-4 mb-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
                <Plus size={18} /> Compose
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 px-2">
            {/* Personal Inbox */}
            <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Personal Inbox</div>
                <nav className="space-y-0.5">
                    {[{ id: 'Assigned Open', label: 'Assigned Open', icon: InboxIcon, count: 12 }, { id: 'Assigned Later', label: 'Assigned Later', icon: Clock }, { id: 'Assigned Done', label: 'Assigned Done', icon: CheckCircle2 }, { id: 'Sent', label: 'Sent', icon: Send }, { id: 'Trash', label: 'Trash', icon: Trash2 }, { id: 'Spam', label: 'Spam', icon: Ban }].map(item => (
                        <button key={item.id} onClick={() => setActiveChannel(item.id)} className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-3 transition-colors text-sm ${activeChannel === item.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                            <item.icon size={16} />
                            <span className="flex-1">{item.label}</span>
                            {item.count && <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">{item.count}</span>}
                        </button>
                    ))}
                </nav>
            </div>
            {/* Views */}
            <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Views</div>
                <nav className="space-y-0.5">
                    <button onClick={() => setActiveChannel('SLA Breach')} className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-3 transition-colors text-sm ${activeChannel === 'SLA Breach' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                        <Flame size={16} className="text-red-500" /><span className="flex-1">SLA Breach - Shapes</span><span className="text-red-500 font-bold text-xs">8</span>
                    </button>
                    <button onClick={() => setActiveChannel('SLA Warning')} className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-3 transition-colors text-sm ${activeChannel === 'SLA Warning' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                        <AlertTriangle size={16} className="text-yellow-500" /><span className="flex-1">SLA Warning - Shapes</span><span className="text-yellow-500 font-bold text-xs">2</span>
                    </button>
                </nav>
            </div>
            {/* Shared */}
            <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Shared Inboxes</div>
                <nav className="space-y-0.5">
                    {['Inbox', 'Triage'].map(ch => (
                        <button key={ch} onClick={() => setActiveChannel(ch)} className={`w-full text-left px-3 py-1.5 rounded-md flex justify-between items-center transition-colors text-sm ${activeChannel === ch ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                            <span>{ch}</span>{ch === 'Inbox' && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">3</span>}
                        </button>
                    ))}
                </nav>
            </div>
            {/* Shapes Group */}
            <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Shapes</div>
                <nav className="space-y-0.5">
                    {['Quotes', 'Order Entry', 'Certs', 'Status', 'RMA'].map(ch => (
                        <button key={`Shapes-${ch}`} onClick={() => setActiveChannel(`Shapes-${ch}`)} className={`w-full text-left px-3 py-1.5 rounded-md flex justify-between items-center transition-colors text-sm ${activeChannel === `Shapes-${ch}` ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                            <span>{ch}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {/* NEW GROUP: PARTS */}
            <div>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Parts</div>
                <nav className="space-y-0.5">
                    {['Quotes', 'Order Entry', 'Status', 'RMA'].map(ch => (
                        <button key={`Parts-${ch}`} onClick={() => setActiveChannel(`Parts-${ch}`)} className={`w-full text-left px-3 py-1.5 rounded-md flex justify-between items-center transition-colors text-sm ${activeChannel === `Parts-${ch}` ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                            <span>{ch}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-sm font-bold text-white border border-slate-600">JD</div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">John Doe</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sales Engineer</div>
                </div>
                <button onClick={onOpenSettings} className="text-slate-500 hover:text-white cursor-pointer p-1 rounded hover:bg-slate-800">
                    <Settings size={18} />
                </button>
            </div>
        </div>
    </div>
);

const ThreadList = ({ threads, activeThreadId, onSelectThread }) => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-gray-800 text-lg">Inbox</h2>
                <div className="flex gap-2 text-gray-400">
                    <Filter size={18} className="cursor-pointer hover:text-gray-600" />
                    <Archive size={18} className="cursor-pointer hover:text-gray-600" />
                </div>
            </div>
            <div className="relative group">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="Search threads..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none" />
            </div>
        </div>
        <div className="overflow-y-auto flex-1">
            {threads.map(thread => (
                <div key={thread.id} onClick={() => onSelectThread(thread.id)} className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeThreadId === thread.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                    <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`font-bold text-sm ${activeThreadId === thread.id ? 'text-gray-900' : 'text-gray-900'}`}>{thread.messages[0]?.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase whitespace-nowrap ml-2">{thread.timestamp}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1.5 truncate font-medium">{thread.customer}</div>
                    <div className={`font-medium text-sm truncate mb-1 ${activeThreadId === thread.id ? 'text-black' : 'text-gray-700'}`}>{thread.subject}</div>
                </div>
            ))}
        </div>
    </div>
);

const ThreadView = ({ thread, onOpenQuote, onViewQuote, onCloneQuote, pendingReply, setPendingReply, messages, setMessages, allTags, onUpdateTags }) => {
    const messagesEndRef = useRef(null);
    const [tagMenuOpen, setTagMenuOpen] = useState(false);
    const [replyMode, setReplyMode] = useState('replyAll');
    const [sendMenuOpen, setSendMenuOpen] = useState(false);
    const [sendStatus, setSendStatus] = useState('Resolved');
    const [subject, setSubject] = useState(thread?.subject || "");

    const [toField, setToField] = useState(thread?.to || []);
    const [ccField, setCcField] = useState(thread?.cc || []);

    const [chatMessages, setChatMessages] = useState([{ id: 1, user: "Mike Ross", text: "Did we confirm specs?", time: "10:30 AM" }]);
    const [newChatMsg, setNewChatMsg] = useState("");

    const crmInfo = thread ? resolveCustomerFromEmail(thread.senderEmail) : null;

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => {
        if (thread) {
            setSubject(thread.subject);
            setToField(thread.to || [thread.senderEmail]);
        }
    }, [thread]);

    if (!thread) return <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">Select a conversation</div>;

    const handleAddTag = (tagName) => {
        if (!thread.tags.includes(tagName)) {
            onUpdateTags([...thread.tags, tagName]);
        } else {
            onUpdateTags(thread.tags.filter(t => t !== tagName));
        }
    };

    const handleSendChat = () => {
        if (!newChatMsg.trim()) return;
        setChatMessages([...chatMessages, { id: Date.now(), user: "Me", text: newChatMsg, time: "Just now" }]);
        setNewChatMsg("");
    };

    return (
        <div className="flex-1 flex h-screen bg-white overflow-hidden">
            {/* CENTER COLUMN */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 flex-shrink-0">

                    {/* Top Context: Subject, Customer & Actions */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                            <div className="font-bold text-lg text-gray-900 leading-tight">{thread.subject}</div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1 font-medium text-gray-700"><InboxIcon size={12} /> Parts Quote Request</div>
                                <div className="flex items-center gap-1"><Hash size={12} /> ATLASFIBRE-117333</div>
                                <div className="flex items-center gap-1"><User size={12} /> {thread.messages[0]?.name}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onOpenQuote(thread.productContext)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm font-bold text-sm flex items-center gap-2 transition-colors"
                            >
                                <Plus size={16} /> Build Quote
                            </button>
                            <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded shadow-sm text-xs font-medium hover:bg-gray-50 flex items-center gap-1"><Archive size={12} /> Archive</button>
                        </div>
                    </div>

                    {/* TAGS BAR */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                        {thread.tags && thread.tags.map(tag => (
                            <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${tag.includes('Breach') ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                {tag.includes('Breach') && <Flame size={10} />}
                                {tag}
                            </span>
                        ))}
                        <button onClick={() => setTagMenuOpen(!tagMenuOpen)} className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"><Plus size={12} /></button>
                        {tagMenuOpen && (
                            <div className="absolute top-32 left-6 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-20 py-1">
                                {allTags.map(t => (
                                    <button key={t.id} onClick={() => handleAddTag(t.name)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${t.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>{t.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-cyan-50 border border-cyan-100 rounded px-3 py-2 flex justify-between items-center text-xs text-cyan-900">
                        <div className="flex items-center gap-2"><User size={14} /> <span className="font-bold">19 other conversations</span> with this customer in the last 7 days.</div>
                        <X size={14} className="cursor-pointer hover:text-cyan-700" />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-slate-50">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col w-full ${msg.sender === 'system' ? 'items-center' : 'items-start'}`}>
                            {msg.sender === 'system' ? (
                                <div className="bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-2 font-bold"><CheckCircle size={14} className="text-green-500" /> Quote #{msg.quoteId} Generated</div>
                                    <div className="h-4 w-px bg-gray-300"></div>
                                    <button onClick={() => onViewQuote(msg.quoteId)} className="text-blue-600 hover:underline font-medium">View Details</button>
                                    <button onClick={() => onCloneQuote(msg.quoteId)} className="text-blue-600 hover:underline font-medium flex items-center gap-1"><Copy size={10} /> Clone</button>
                                </div>
                            ) : (
                                <div className="w-full max-w-3xl">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs font-bold`}>{msg.name ? msg.name[0] : '?'}</div>
                                        <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                                        <span className="text-xs text-gray-400 ml-auto">{msg.timestamp}</span>
                                    </div>
                                    <div className="bg-white p-4 text-sm text-gray-800 border-l-2 border-gray-200 pl-4">
                                        {msg.text}
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-xs font-bold text-gray-500 mb-2">1 Attachment</div>
                                            <div className="w-24 h-32 border border-gray-200 rounded bg-gray-50 flex items-center justify-center text-xs text-gray-400">PDF</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* DRAFT & COMPOSER AREA */}
                <div className="bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">

                    {/* Editable Draft Header */}
                    <div className="bg-gray-50 border-b border-gray-200 p-3 px-4">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                            <Users size={10} /> <span className="font-bold text-gray-700">Shared draft</span>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <label className="w-8 text-xs text-gray-500">From:</label>
                                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded border border-purple-200 font-medium">sales@atlasfibre.com</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="w-8 text-xs text-gray-500">To:</label>
                                <div className="flex flex-wrap gap-1 flex-1">
                                    {toField.map((email, i) => (
                                        <div key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                            {email} <button onClick={() => setToField(toField.filter(e => e !== email))}><X size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[10px] text-gray-400 flex gap-2">
                                    <span className="cursor-pointer hover:text-gray-600">Cc</span>
                                    <span className="cursor-pointer hover:text-gray-600">Bcc</span>
                                    <span className="cursor-pointer hover:text-gray-600">Subject</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reply Editor */}
                    <div className="p-4">
                        <div className="flex flex-col gap-2">
                            <textarea className="w-full min-h-[100px] text-sm outline-none resize-none placeholder:text-gray-400" placeholder={`Type '/' to insert a message template`} value={pendingReply} onChange={(e) => setPendingReply(e.target.value)} />
                            <div className="flex justify-between items-center pt-2">
                                <div className="flex gap-3 text-gray-400">
                                    <span className="text-sm font-serif font-bold hover:text-gray-600 cursor-pointer">Aa</span>
                                    <Paperclip size={16} className="hover:text-gray-600 cursor-pointer" />
                                    <SmileIcon size={16} className="hover:text-gray-600 cursor-pointer" />
                                    <ImageIcon size={16} className="hover:text-gray-600 cursor-pointer" />
                                </div>
                                <div className="relative flex items-center">
                                    <button onClick={() => { if (!pendingReply) return; setMessages([...messages, { id: Date.now(), sender: 'user', name: 'Me', text: pendingReply }]); setPendingReply(""); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm font-medium flex items-center rounded-l border-r border-blue-700 transition-colors">Send & archive</button>
                                    <button onClick={() => setSendMenuOpen(!sendMenuOpen)} className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-1.5 rounded-r transition-colors"><ChevronDown size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full flex-shrink-0">
                <div className="flex-1 overflow-y-auto p-5 border-b border-gray-200">
                    <h3 className="font-bold text-gray-500 uppercase text-xs mb-4">Customer 360</h3>
                    {crmInfo ? (
                        <div className="space-y-6">
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                <div className="text-xs text-gray-500">YTD Spend</div>
                                <div className="text-xl font-bold text-gray-900">{crmInfo.ytdSpend}</div>
                            </div>
                        </div>
                    ) : <div className="text-sm text-gray-400 italic">No CRM data available.</div>}
                </div>
                <div className="h-[45%] flex flex-col bg-slate-50 border-t border-gray-200">
                    <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-blue-800 text-xs uppercase flex items-center gap-2"><Users size={14} /> Teams Chat</h3>
                        <span className="text-[10px] text-green-600 font-bold">● Online</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.user === 'Me' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1 mb-0.5"><span className="text-[10px] font-bold text-gray-700">{msg.user}</span></div>
                                <div className={`rounded px-2 py-1.5 text-xs max-w-[85%] ${msg.user === 'Me' ? 'bg-blue-100 text-blue-900' : 'bg-white border border-gray-200 text-gray-800'}`}>{msg.text}</div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 bg-white border-t border-gray-200 flex gap-1">
                        <input className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 outline-none" placeholder="Message..." value={newChatMsg} onChange={(e) => setNewChatMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} />
                        <button onClick={handleSendChat} className="bg-blue-700 text-white p-1.5 rounded"><Send size={12} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- QUOTE BUILDER & MAIN APP ---

const QuoteBuilder = ({ isOpen, onClose, initialStep = 1, productContext, activeThread, onSubmitQuote }) => {
    const [step, setStep] = useState(initialStep);
    const [activeType, setActiveType] = useState('Sheet');
    const [cart, setCart] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [contactName, setContactName] = useState("");
    const [isCrmResolved, setIsCrmResolved] = useState(false);

    const getMockSpecs = (type) => {
        switch (type) {
            case 'Sheet': return { grade: 'G10 FR4', color: 'Natural', dims: '0.250" x 36" x 48"' };
            case 'Cut Piece/Sand': return { grade: 'G10 FR4', color: 'Natural', dims: '0.125" x 2" x 41"', ops: 'Sanded' };
            default: return { grade: 'G10', color: 'Natural', dims: 'Custom' };
        }
    };

    const getDescription = (type, specs) => {
        if (type === 'Cut Piece/Sand') return `G10 ${specs.dims.split('"')[0]}" x ${specs.dims.split('x')[1]}" x ${specs.dims.split('x')[2]}"`;
        return `${specs.grade} ${specs.dims}`;
    }

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
            if (initialStep === 1 && cart.length === 0) {
                const initialSpecs = { grade: 'G10 / Natural', dims: '123" x 41"', mat: 'G10 / Natural' };
                setCart([{ id: 101, type: 'Cut Piece/Sand', desc: 'G10 2" x 41" x 123"', qty: 1, specs: initialSpecs }]);
            }

            if (productContext) setActiveType(productContext);

            if (activeThread && activeThread.senderEmail) {
                const crmData = resolveCustomerFromEmail(activeThread.senderEmail);
                if (crmData) {
                    setCustomerName(crmData.name);
                    setAccountNumber(crmData.accountNumber);
                    setContactName(activeThread.messages && activeThread.messages[0]?.name || "");
                    setIsCrmResolved(true);
                } else {
                    setCustomerName(activeThread.customer || "");
                    setAccountNumber("");
                    setContactName(activeThread.messages && activeThread.messages[0]?.name || "");
                    setIsCrmResolved(false);
                }
            }
        }
    }, [isOpen, productContext, activeThread, initialStep]);

    useEffect(() => {
        if (step === 2 && cart.length > 0 && !selectedItemId) {
            setSelectedItemId(cart[0].id);
        }
    }, [step, cart, selectedItemId]);

    const addToCart = () => {
        const specs = getMockSpecs(activeType);
        setCart([...cart, {
            id: Date.now(),
            type: activeType,
            desc: getDescription(activeType, specs),
            qty: 10,
            specs: { ...specs, mat: `${specs.grade} / ${specs.color}` }
        }]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                <div className="bg-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <img src="https://www.atlasfibre.com/wp-content/uploads/2023/03/logo.png" className="h-8 object-contain bg-slate-900 p-1 rounded" />
                            <span className="text-slate-800">Quote Builder</span>
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold ml-10">New Quote #1024 (Drafting)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-8">
                            {['Build Cart', 'Cost Analysis', 'Review'].map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-2 text-sm ${step >= i + 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{i + 1}</div> {s}
                                    </div>
                                    {i < 2 && <div className="w-8 h-0.5 bg-gray-200"></div>}
                                </React.Fragment>
                            ))}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-blue-600 p-2 rounded-full"><X size={24} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden bg-gray-50 flex relative">

                    {step === 1 && (
                        <div className="flex-1 flex flex-col h-full">
                            <div className="bg-white px-6 pt-4 pb-0 border-b border-gray-200 flex gap-1 overflow-x-auto flex-shrink-0">
                                {['Sheet', 'Cut Piece/Sand', 'Rod', 'Cut Rod', 'Tube', 'Cut Tube', 'Washer'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveType(t)}
                                        className={`px-4 py-3 text-sm font-bold border-t-4 transition-colors whitespace-nowrap ${activeType === t ? 'border-blue-600 bg-gray-50 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 overflow-hidden flex">
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm uppercase tracking-wide">
                                                    <User size={16} /> Customer Information
                                                    {isCrmResolved && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1"><CheckCircle size={10} /> Verified from CRM</span>}
                                                </div>
                                                <button className="text-xs text-blue-600 hover:underline flex items-center gap-1"><RefreshCw size={10} /> Reset lookup</button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <FormInput label="Account Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                                <FormInput label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter Acc #" />
                                                <FormInput label="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                                            </div>
                                        </div>
                                        <ConfigForm type={activeType} />
                                        <div className="mt-6 flex justify-end">
                                            <button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded font-bold shadow-lg flex items-center gap-2" onClick={addToCart}><Plus size={18} /> Add Line Item</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10">
                                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700 flex items-center gap-2"><ShoppingCart size={18} /> Current Cart</h3>
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{cart.length}</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                                        {cart.length === 0 && <div className="text-center py-10 text-gray-400 text-sm italic">Cart is empty.<br />Configure items to add.</div>}
                                        {cart.map((item, i) => (
                                            <div key={item.id} className="p-4 bg-white border border-gray-200 rounded shadow-sm relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-blue-600 uppercase cursor-pointer hover:underline">{item.type}</span>
                                                    <div className="flex gap-2"><Pencil size={14} className="text-gray-400 hover:text-blue-500 cursor-pointer" /><Trash2 size={14} onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-gray-400 hover:text-red-500 cursor-pointer" /></div>
                                                </div>
                                                <div className="font-bold text-gray-800 text-sm mb-3">{item.desc}</div>
                                                <div className="text-xs text-gray-500 space-y-1 border-l-2 border-gray-100 pl-2">
                                                    <div>Qty: {item.qty}</div>
                                                    {item.specs && <><div>Mat: {item.specs.mat}</div><div>Dims: {item.specs.dims}</div></>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex justify-between text-sm font-bold text-gray-700 mb-4"><span>Est. Total</span><span>--</span></div>
                                        <button onClick={() => setStep(2)} disabled={cart.length === 0} className={`w-full py-3 rounded font-bold shadow transition-all ${cart.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Calculate Costs <ArrowRight size={16} className="inline ml-1" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex-1 flex h-full bg-gray-50 overflow-hidden">
                            <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
                                <div className="p-4 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase tracking-wider flex-shrink-0">Cart Items ({cart.length})</div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {cart.map(item => {
                                        const isSelected = selectedItemId === item.id;
                                        return (
                                            <div key={item.id} onClick={() => setSelectedItemId(item.id)} className={`rounded-lg p-4 cursor-pointer transition-all relative border shadow-sm ${isSelected ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                                <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-600">{item.type}</span>{isSelected && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}</div>
                                                <div className="font-bold text-gray-800 text-sm mb-4">{item.desc}</div>
                                                <div className="flex justify-between items-end text-xs text-gray-500 border-t border-gray-100 pt-2">
                                                    <div><span className="block text-[10px] text-gray-400 uppercase">Qty</span><span className="font-mono text-gray-700 font-bold text-sm">{item.qty}</span></div>
                                                    <div className="text-right"><span className="block text-[10px] text-gray-400 uppercase">Grade</span><span className="text-gray-700 font-medium">{item.specs ? item.specs.mat.split('/')[0] : 'G10'}</span></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                                    <button onClick={() => setStep(1)} className="flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"><ChevronLeft size={16} /> Back to Cart</button>
                                </div>
                            </div>

                            <div className="flex-1 p-4 h-full overflow-hidden">
                                <div className="flex gap-4 h-full">
                                    <div className="flex-[1.2] bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 flex-shrink-0"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><PieChart size={20} className="text-blue-600" /> Cost Analysis</h3></div>
                                        <div className="p-4 overflow-y-auto flex-1 space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100"><span className="text-gray-600 font-medium text-sm">Raw Material Cost</span><span className="font-mono font-bold text-gray-900">$450.00</span></div>
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100"><span className="text-gray-600 font-medium text-sm">Labor / Machining</span><span className="font-mono font-bold text-gray-900">$125.00</span></div>
                                            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-100"><span className="text-green-700 font-medium text-sm flex items-center gap-2"><TrendingUp size={16} /> Waste Rebate (Remnant)</span><span className="font-mono font-bold text-green-700">-$35.00</span></div>
                                            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2"><span>Total Item Cost</span><span>$540.00</span></div>
                                            <div className="bg-slate-900 text-white p-4 rounded-lg mt-2 shadow-lg flex justify-between items-center">
                                                <div><div className="text-xs text-gray-400 uppercase font-bold mb-1">Rec. Price</div><div className="text-2xl font-bold text-green-400">$810.00</div></div>
                                                <div className="text-right"><div className="text-xs text-gray-400 uppercase font-bold mb-1">Margin</div><div className="text-xl font-bold">33%</div></div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Package size={14} /> Stock Used</h4>
                                                <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 text-xs mb-2"><span className="font-medium text-gray-700">2.0" OD x 1.5" ID Tube</span><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">In Stock</span></div>
                                                <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 text-xs"><span className="font-medium text-gray-700">1.0" OD Solid Rod</span><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-bold">Low Stock</span></div>
                                            </div>
                                            <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                                <div className="flex gap-2 items-start">
                                                    <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                                                    <div>
                                                        <h4 className="text-xs font-bold text-yellow-800">Manager Review Recommended</h4>
                                                        <p className="text-xs text-yellow-700 mt-0.5">Margin is below 35% target.</p>
                                                        <button className="mt-2 text-[10px] bg-white border border-yellow-300 text-yellow-800 px-3 py-1 rounded font-bold hover:bg-yellow-100 shadow-sm">Send to Teams</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
                                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0">
                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex-shrink-0">
                                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase"><Box size={16} className="text-blue-600" /> Cut Plan Optimization</h3>
                                                <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-300 relative rounded mb-3 flex flex-col">
                                                    <div className="flex-1 flex items-end w-full gap-1 p-3">
                                                        <div className="w-1/3 h-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold rounded-t shadow-sm">Part</div>
                                                        <div className="w-1/3 h-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold rounded-t shadow-sm">Part</div>
                                                        <div className="w-1/3 h-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold rounded-t shadow-sm">Part</div>
                                                        <div className="w-1/3 h-[30%] bg-green-500 text-white flex items-center justify-center text-[8px] font-bold rounded-t shadow-sm">Remnant</div>
                                                        <div className="w-[10%] h-[10%] bg-red-500 text-white flex items-center justify-center text-[6px] font-bold rounded-t shadow-sm">Scrap</div>
                                                    </div>
                                                    <div className="text-center text-[10px] text-gray-500 pb-1 font-mono">Stock Length: 120"</div>
                                                </div>
                                                <div className="flex justify-between text-xs font-bold text-gray-600 mt-2 border-t border-gray-100 pt-2">
                                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Yield: 85%</div>
                                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" />Waste: 15%</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <button onClick={() => onSubmitQuote({ id: 1024, amount: 810 })} className="w-full bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg uppercase tracking-wide flex justify-center items-center gap-2 text-sm">Finalize Quote <CheckCircle size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetalFlowApp = () => {
    const [activeChannel, setActiveChannel] = useState('Inbox');
    const [activeThreadId, setActiveThreadId] = useState(8);
    const [threads, setThreads] = useState(MOCK_THREADS);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [activeProductContext, setActiveProductContext] = useState(null);
    const [quoteStep, setQuoteStep] = useState(1);
    const [pendingReply, setPendingReply] = useState("");
    const [currentMessages, setCurrentMessages] = useState(MOCK_THREADS[0].messages);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const res = await fetch('/nylas');
                const data = await res.json();
                if (data.threads && data.threads.length > 0) {
                    const mappedThreads = data.threads.map(t => {
                        const sender = t.participants.find(p => p.email !== data.user) || t.participants[0];
                        return {
                            id: t.id,
                            subject: t.subject,
                            customer: resolveCustomerFromEmail(sender?.email)?.name || "Unknown Customer",
                            customerInitials: (sender?.name || "??").substring(0, 2).toUpperCase(),
                            timestamp: new Date(t.last_message_timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            status: "Open",
                            channel: "Inbox",
                            assignee: "Unassigned",
                            tags: t.unread ? ["Unread"] : [],
                            senderEmail: sender?.email,
                            to: t.participants.map(p => p.email),
                            cc: [],
                            messages: [{
                                id: t.id + "_msg",
                                sender: "customer",
                                name: sender?.name || sender?.email,
                                text: t.snippet,
                                timestamp: new Date(t.last_message_timestamp * 1000).toLocaleString()
                            }],
                            productContext: "General"
                        };
                    });
                    setThreads(mappedThreads);
                    if (mappedThreads.length > 0) {
                        setActiveThreadId(mappedThreads[0].id);
                        setCurrentMessages(mappedThreads[0].messages);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch Nylas threads", err);
            }
        };
        fetchThreads();
    }, []);

    return (
        <div className="flex h-screen w-full font-sans bg-slate-50 overflow-hidden text-slate-900">
            <Sidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel} onOpenSettings={() => { }} />
            <ThreadList threads={threads} activeThreadId={activeThreadId} onSelectThread={setActiveThreadId} />
            <ThreadView
                thread={MOCK_THREADS[0]}
                onOpenQuote={() => { setIsQuoteModalOpen(true) }}
                onViewQuote={() => { }}
                onCloneQuote={() => { }}
                pendingReply={pendingReply}
                setPendingReply={setPendingReply}
                messages={currentMessages}
                setMessages={setCurrentMessages}
                allTags={INITIAL_TAGS}
                onUpdateTags={() => { }}
            />
            <QuoteBuilder isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
        </div>
    );
};

export default MetalFlowApp;




