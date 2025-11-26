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
    UserPlus, Image as ImageIcon, Quote, FileText, Upload
} from 'lucide-react';
import OptimizationResult from './OptimizationResult';

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

const ConfigForm = ({ type, formState, onChange }) => {
    // Helper to handle change safely
    const handleChange = (field, e) => {
        if (onChange) onChange(field, e.target ? e.target.value : e);
    };

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
                        <FormSelect label="Grade" options={["G10", "FR4", "G11", "Phenolic C", "Phenolic CE"]} value={formState?.grade} onChange={(e) => handleChange('grade', e)} />
                        <FormSelect label="Select Size" options={["48x96", "36x48", "Custom"]} />
                        <FormSelect label="Select Color" options={["Natural", "Black", "Yellow"]} value={formState?.color} onChange={(e) => handleChange('color', e)} />
                    </div>

                    {type === 'Cut Piece/Sand' ? (
                        <>
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                                <FormInput label="Length" placeholder="12.00" value={formState?.length} onChange={(e) => handleChange('length', e)} />
                                <FormInput label="Length (+)" placeholder="0.005" />
                                <FormInput label="Length (-)" placeholder="0.005" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                                <FormInput label="Width" placeholder="4.00" value={formState?.width} onChange={(e) => handleChange('width', e)} />
                                <FormInput label="Width (+)" placeholder="0.005" />
                                <FormInput label="Width (-)" placeholder="0.005" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Sanded Thickness" value={formState?.thickness} onChange={(e) => handleChange('thickness', e)} />
                                <FormInput label="Thick (+)" />
                                <FormInput label="Thick (-)" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormSelect label="Stock Size" options={["48x96", "48x120", "36x48", "Custom"]} value={formState?.stockSize} onChange={(e) => handleChange('stockSize', e)} />
                                <FormInput label="Kerf (Blade)" placeholder="0.125" value={formState?.kerf} onChange={(e) => handleChange('kerf', e)} />
                                <FormInput label="Edge Trim" placeholder="0.25" value={formState?.trim} onChange={(e) => handleChange('trim', e)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormInput label="Masking Sides" />
                                <FormInput label="# Sanded Sides" />
                                <FormInput label="Grain Direction" suffix="deg" />
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="Thickness" value={formState?.thickness} onChange={(e) => handleChange('thickness', e)} />
                            <FormInput label="Length" value={formState?.length} onChange={(e) => handleChange('length', e)} />
                            <FormInput label="Width" value={formState?.width} onChange={(e) => handleChange('width', e)} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 pt-2">
                        <FormInput label="Quantity" placeholder="0" value={formState?.quantity} onChange={(e) => handleChange('quantity', e)} />
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
                        <FormSelect label="Grade" options={["G10", "FR4", "Phenolic LE", "Phenolic CE", "Acetal"]} value={formState?.grade} onChange={(e) => handleChange('grade', e)} />
                        <FormSelect label="Color" options={["Natural", "Black"]} value={formState?.color} onChange={(e) => handleChange('color', e)} />
                        <FormInput label="Diameter" placeholder='1.0"' value={formState?.diameter} onChange={(e) => handleChange('diameter', e)} />
                    </div>
                    {type === 'Cut Rod' && (
                        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                            <FormInput label="Cut Length" placeholder="6.00" value={formState?.length} onChange={(e) => handleChange('length', e)} />
                            <FormInput label="Length (+)" placeholder="0.010" />
                            <FormInput label="Length (-)" placeholder="0.010" />
                        </div>
                    )}
                    <div className="grid grid-cols-1">
                        <FormInput label="Quantity" placeholder="e.g. 10 pcs or 200 ft" value={formState?.quantity} onChange={(e) => handleChange('quantity', e)} />
                    </div>
                </div>
            )}

            {/* 3. TUBE & CUT TUBE */}
            {(type === 'Tube' || type === 'Cut Tube') && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <FormSelect label="Grade" options={["G10", "FR4", "G11"]} value={formState?.grade} onChange={(e) => handleChange('grade', e)} />
                        <FormSelect label="Color" options={["Natural", "Black"]} value={formState?.color} onChange={(e) => handleChange('color', e)} />
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
                            <FormInput label="Cut Length" value={formState?.length} onChange={(e) => handleChange('length', e)} />
                            <FormInput label="Length (+)" />
                            <FormInput label="Length (-)" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="Stock Length" placeholder="e.g. 48 inches" value={formState?.length} onChange={(e) => handleChange('length', e)} />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect label="UOM" options={["Foot", "Inch", "Meter", "Piece"]} />
                        <FormInput label="Target Price" suffix="$" />
                    </div>
                    <div className="grid grid-cols-1">
                        <FormInput label="Quantity" value={formState?.quantity} onChange={(e) => handleChange('quantity', e)} />
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

const Sidebar = ({ activeChannel, setActiveChannel, onOpenSettings, onCompose, newCount, onMoveThread }) => {
    const [dragOverChannel, setDragOverChannel] = useState(null);

    const handleDrop = (e, targetChannel) => {
        e.preventDefault();
        setDragOverChannel(null);

        try {
            const data = e.dataTransfer.getData("application/json");
            if (data) {
                const threadIds = JSON.parse(data);
                if (Array.isArray(threadIds) && onMoveThread) {
                    threadIds.forEach(id => onMoveThread(id, targetChannel));
                    return;
                }
            }
        } catch (err) {
            console.error("Failed to parse drop data", err);
        }

        const threadId = e.dataTransfer.getData("text/plain");
        if (threadId && onMoveThread) {
            onMoveThread(threadId, targetChannel);
        }
    };

    const handleDragOver = (e, channelId) => {
        e.preventDefault();
        if (dragOverChannel !== channelId) {
            setDragOverChannel(channelId);
        }
    };

    const handleDragLeave = () => {
        setDragOverChannel(null);
    };

    const getChannelClass = (id) => {
        const isActive = activeChannel === id;
        const isDragOver = dragOverChannel === id;

        if (isDragOver) return 'w-full text-left px-3 py-1.5 rounded-md flex items-center gap-3 transition-colors text-sm bg-blue-600/50 text-white ring-2 ring-blue-500 z-10 relative';
        if (isActive) return 'w-full text-left px-3 py-1.5 rounded-md flex items-center gap-3 transition-colors text-sm bg-slate-800 text-white';
        return 'w-full text-left px-3 py-1.5 rounded-md flex items-center gap-3 transition-colors text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white';
    };

    const getSimpleChannelClass = (id) => {
        const isActive = activeChannel === id;
        const isDragOver = dragOverChannel === id;

        if (isDragOver) return 'w-full text-left px-3 py-1.5 rounded-md flex justify-between items-center transition-colors text-sm bg-blue-600/50 text-white ring-2 ring-blue-500 z-10 relative';
        if (isActive) return 'w-full text-left px-3 py-1.5 rounded-md flex justify-between items-center transition-colors text-sm bg-slate-800 text-white';
        return 'w-full text-left px-3 py-1.5 rounded-md flex justify-between items-center transition-colors text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white';
    };

    return (
        <div className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 font-sans">
            <div className="p-5 flex items-center gap-2">
                <img src="https://www.atlasfibre.com/wp-content/uploads/2023/03/logo.png" alt="Atlas Fibre" className="h-8 object-contain" />
            </div>

            <div className="px-4 mb-4">
                <button onClick={onCompose} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 shadow-sm transition-all text-sm">
                    <Plus size={18} /> Compose
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 px-2">
                {/* Personal Inbox */}
                <div>
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Personal Inbox</div>
                    <nav className="space-y-0.5">
                        {[{ id: 'Assigned Open', label: 'Assigned Open', icon: InboxIcon, count: 12 }, { id: 'Assigned Later', label: 'Assigned Later', icon: Clock }, { id: 'Assigned Done', label: 'Assigned Done', icon: CheckCircle2 }, { id: 'Sent', label: 'Sent', icon: Send }, { id: 'Trash', label: 'Trash', icon: Trash2 }, { id: 'Spam', label: 'Spam', icon: Ban }].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveChannel(item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, item.id)}
                                className={getChannelClass(item.id)}
                            >
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
                            <button
                                key={ch}
                                onClick={() => setActiveChannel(ch)}
                                onDragOver={(e) => handleDragOver(e, ch)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, ch)}
                                className={getSimpleChannelClass(ch)}
                            >
                                <span>{ch}</span>{ch === 'Inbox' && newCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{newCount}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
                {/* Shapes Group */}
                <div>
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Shapes</div>
                    <nav className="space-y-0.5">
                        {['Quotes', 'Order Entry', 'Certs', 'Status', 'RMA'].map(ch => (
                            <button
                                key={`Shapes-${ch}`}
                                onClick={() => setActiveChannel(`Shapes-${ch}`)}
                                onDragOver={(e) => handleDragOver(e, `Shapes-${ch}`)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, `Shapes-${ch}`)}
                                className={getSimpleChannelClass(`Shapes-${ch}`)}
                            >
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
                            <button
                                key={`Parts-${ch}`}
                                onClick={() => setActiveChannel(`Parts-${ch}`)}
                                onDragOver={(e) => handleDragOver(e, `Parts-${ch}`)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, `Parts-${ch}`)}
                                className={getSimpleChannelClass(`Parts-${ch}`)}
                            >
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
};

const ThreadList = ({ threads, activeThreadId, selectedThreadIds, onSelectThread, onRefresh, onSync, onArchive }) => (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-gray-800 text-lg">Inbox</h2>
                <div className="flex gap-2 text-gray-400">
                    <RefreshCw size={18} className="cursor-pointer hover:text-blue-600 transition-colors" onClick={onRefresh} />
                    <button onClick={onSync} className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-200">Sync</button>
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
            {threads.map(thread => {
                const isSelected = selectedThreadIds?.has(thread.id);
                const isActive = activeThreadId === thread.id;
                return (
                    <div
                        key={thread.id}
                        draggable="true"
                        onDragStart={(e) => {
                            const ids = selectedThreadIds?.has(thread.id)
                                ? Array.from(selectedThreadIds)
                                : [thread.id];
                            e.dataTransfer.setData("application/json", JSON.stringify(ids));
                            e.dataTransfer.setData("text/plain", thread.id);
                        }}
                        onClick={(e) => onSelectThread(thread.id, e)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors group relative ${isSelected ? 'bg-blue-100 border-l-4 border-l-blue-600' :
                            isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-600' :
                                'hover:bg-gray-50 border-l-4 border-l-transparent'
                            }`}
                    >
                        <div>
                            <div className="flex justify-between items-baseline mb-0.5">
                                <div className="flex items-center">
                                    {thread.is_new && <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0" title="New Message"></div>}
                                    <span className={`font-bold text-sm ${isActive || isSelected ? 'text-gray-900' : 'text-gray-900'}`}>{thread.messages[0]?.name}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium uppercase whitespace-nowrap ml-2">
                                    {thread.fullDate ? new Date(thread.fullDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : thread.timestamp}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1.5 truncate font-medium">{thread.customer}</div>
                            <div className={`font-medium text-sm truncate mb-1 ${isActive || isSelected ? 'text-black' : 'text-gray-700'}`}>{thread.subject}</div>
                        </div>
                        {/* Archive Action on Hover */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onArchive(thread.id); }}
                            className="absolute right-2 bottom-2 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 text-gray-500"
                            title="Archive"
                        >
                            <Archive size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
);

const ThreadView = ({ thread, onOpenQuote, onViewQuote, onCloneQuote, pendingReply, setPendingReply, messages, setMessages, allTags, onUpdateTags, grants = [], defaultGrantId, onArchive, onMarkAsNew }) => {
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

    // Mention State
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionCursorIndex, setMentionCursorIndex] = useState(null);

    const crmInfo = thread ? resolveCustomerFromEmail(thread.senderEmail) : null;

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => {
        if (thread) {
            setSubject(thread.subject);
            setToField(thread.to || (thread.senderEmail ? [thread.senderEmail] : []));
        }
    }, [thread]);

    // Auto-mark as read timer
    useEffect(() => {
        if (thread && thread.is_new) {
            const timer = setTimeout(() => {
                console.log("Auto-marking as read:", thread.id);
                onMarkAsNew(thread.id, false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [thread, onMarkAsNew]);

    if (!thread) return <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">Select a conversation</div>;

    const handleAddTag = (tagName) => {
        if (!thread.tags.includes(tagName)) {
            onUpdateTags([...thread.tags, tagName]);
        } else {
            onUpdateTags(thread.tags.filter(t => t !== tagName));
        }
    };

    const handleChatInput = (e) => {
        const val = e.target.value;
        setNewChatMsg(val);

        // Simple mention detection
        const lastChar = val.slice(-1);
        if (lastChar === '@') {
            setMentionQuery('');
            setMentionCursorIndex(val.length);
        } else if (mentionQuery !== null) {
            if (lastChar === ' ') {
                setMentionQuery(null);
            } else {
                setMentionQuery(val.slice(mentionCursorIndex));
            }
        }
    };

    const insertMention = (name) => {
        if (mentionCursorIndex === null) return;
        const before = newChatMsg.slice(0, mentionCursorIndex);
        const after = newChatMsg.slice(mentionCursorIndex + (mentionQuery || '').length);
        setNewChatMsg(`${before}${name} ${after}`);
        setMentionQuery(null);
        setMentionCursorIndex(null);
    };

    // Teams Chat Send Logic (Restored)
    const handleSendChat = () => {
        if (!newChatMsg.trim()) return;

        // Determine user name from defaultGrantId
        let userName = "Me";
        if (defaultGrantId && grants.length > 0) {
            const grant = grants.find(g => g.id === defaultGrantId);
            if (grant) {
                userName = grant.name || grant.email.split('@')[0];
            }
        }

        setChatMessages([...chatMessages, { id: Date.now(), user: userName, text: newChatMsg, time: "Just now" }]);
        setNewChatMsg("");
    };

    // Send Email Logic
    const handleSendReply = async () => {
        if (!pendingReply.trim()) return;
        setSendStatus('Sending...');

        try {
            // Use defaultGrantId or the first available grant if not set
            const grantIdToSend = defaultGrantId || (grants.length > 0 ? grants[0].id : null);

            if (!grantIdToSend) {
                alert("No connected account found to send from.");
                setSendStatus('Error');
                return;
            }

            const res = await fetch('/nylas/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grantId: grantIdToSend,
                    to: toField,
                    cc: ccField,
                    subject: subject,
                    body: pendingReply,
                    replyToMessageId: messages.length > 0 ? messages[messages.length - 1].id : undefined // Simplified reply logic
                })
            });

            if (!res.ok) throw new Error("Failed to send email");

            const data = await res.json();

            // Optimistically add message
            setMessages([...messages, {
                id: Date.now(),
                sender: 'user',
                name: 'Me',
                text: pendingReply,
                timestamp: new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            }]);
            setPendingReply("");
            setSendStatus('Sent');
            setTimeout(() => setSendStatus('Resolved'), 2000);

        } catch (err) {
            console.error("Error sending email:", err);
            setSendStatus('Error');
            alert("Failed to send email. Check console for details.");
        }
    };

    return (
        <div className="flex-1 flex h-screen bg-white overflow-hidden">
            {/* CENTER COLUMN */}
            <div className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 flex-shrink-0">

                    {/* Top Context: Subject, Customer & Actions */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1 flex-1 mr-4">
                            {/* Editable Subject */}
                            <input
                                className="font-bold text-lg text-gray-900 leading-tight border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none bg-transparent transition-colors w-full"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
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
                            <button onClick={() => onMarkAsNew(thread.id, true)} className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded shadow-sm text-xs font-medium hover:bg-gray-50 flex items-center gap-1"><Mail size={12} /> Mark as New</button>
                            <button onClick={onArchive} className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded shadow-sm text-xs font-medium hover:bg-gray-50 flex items-center gap-1"><Archive size={12} /> Archive</button>
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
                                    <div className="mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs font-bold`}>{msg.name ? msg.name[0] : '?'}</div>
                                            <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                                            {/* Full Timestamp */}
                                            <span className="text-xs text-gray-400 ml-auto" title={msg.rawDate ? new Date(msg.rawDate * 1000).toLocaleString() : ''}>
                                                {msg.rawDate
                                                    ? new Date(msg.rawDate * 1000).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : msg.timestamp}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-0.5 pl-8 border-l-2 border-gray-100 ml-3">
                                            <div><span className="font-bold">Subject:</span> {msg.subject}</div>
                                            <div><span className="font-bold">From:</span> {msg.from?.map(f => f.name ? `${f.name} <${f.email}>` : f.email).join(', ')}</div>
                                            <div><span className="font-bold">To:</span> {msg.to?.map(t => t.name ? `${t.name} <${t.email}>` : t.email).join(', ')}</div>
                                            {msg.cc && msg.cc.length > 0 && <div><span className="font-bold">Cc:</span> {msg.cc.map(c => c.name ? `${c.name} <${c.email}>` : c.email).join(', ')}</div>}
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 text-sm text-gray-800 border-l-2 border-gray-200 pl-4 shadow-sm rounded-r-lg">
                                        <div dangerouslySetInnerHTML={{ __html: msg.text }} className="prose prose-sm max-w-none" />
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
                            {/* From Selector */}
                            <div className="flex items-center gap-2">
                                <label className="w-8 text-xs text-gray-500">From:</label>
                                <select
                                    className="bg-white border border-gray-300 text-gray-700 text-xs px-2 py-0.5 rounded outline-none focus:border-blue-500"
                                    value={defaultGrantId || ""}
                                    onChange={(e) => { /* Logic to update default grant locally or just for this draft could go here */ }}
                                >
                                    {grants.map(g => (
                                        <option key={g.id} value={g.id}>{g.email}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Editable To */}
                            <div className="flex items-center gap-2">
                                <label className="w-8 text-xs text-gray-500">To:</label>
                                <div className="flex flex-wrap gap-1 flex-1 items-center">
                                    {toField.map((email, i) => (
                                        <div key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                            {email} <button onClick={() => setToField(toField.filter(e => e !== email))}><X size={10} /></button>
                                        </div>
                                    ))}
                                    <input
                                        className="text-xs bg-transparent outline-none min-w-[100px] flex-1"
                                        placeholder="Add recipient..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                setToField([...toField, e.target.value]);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="text-[10px] text-gray-400 flex gap-2">
                                    <span className="cursor-pointer hover:text-gray-600" onClick={() => { /* Toggle Cc logic */ }}>Cc</span>
                                    <span className="cursor-pointer hover:text-gray-600">Bcc</span>
                                </div>
                            </div>

                            {/* Editable Cc (Always visible for now as per request to be modifiable) */}
                            <div className="flex items-center gap-2">
                                <label className="w-8 text-xs text-gray-500">Cc:</label>
                                <div className="flex flex-wrap gap-1 flex-1 items-center">
                                    {ccField.map((email, i) => (
                                        <div key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                            {email} <button onClick={() => setCcField(ccField.filter(e => e !== email))}><X size={10} /></button>
                                        </div>
                                    ))}
                                    <input
                                        className="text-xs bg-transparent outline-none min-w-[100px] flex-1"
                                        placeholder="Add Cc..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                setCcField([...ccField, e.target.value]);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
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
                                    <button onClick={handleSendReply} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm font-medium flex items-center rounded-l border-r border-blue-700 transition-colors">
                                        {sendStatus === 'Sending...' ? 'Sending...' : 'Send & archive'}
                                    </button>
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
                <div className="h-[45%] flex flex-col bg-slate-50 border-t border-gray-200 relative">
                    <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-blue-800 text-xs uppercase flex items-center gap-2"><Users size={14} /> Teams Chat</h3>
                        <span className="text-[10px] text-green-600 font-bold">● Online</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.user === 'Me' || (grants.find(g => g.name === msg.user || g.email.startsWith(msg.user))) ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-1 mb-0.5"><span className="text-[10px] font-bold text-gray-700">{msg.user}</span></div>
                                <div className={`rounded px-2 py-1.5 text-xs max-w-[85%] ${msg.user === 'Me' || (grants.find(g => g.name === msg.user || g.email.startsWith(msg.user))) ? 'bg-blue-100 text-blue-900' : 'bg-white border border-gray-200 text-gray-800'}`}>{msg.text}</div>
                            </div>
                        ))}
                    </div>

                    {/* Mention Popover */}
                    {mentionQuery !== null && filteredGrants.length > 0 && (
                        <div className="absolute bottom-12 left-2 right-2 bg-white border border-gray-200 shadow-lg rounded-md z-20 max-h-40 overflow-y-auto">
                            {filteredGrants.map(g => (
                                <button key={g.id} onClick={() => insertMention(g.name || g.email)} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">{g.email[0].toUpperCase()}</div>
                                    <div>
                                        <div className="font-bold text-gray-900">{g.name || g.email}</div>
                                        <div className="text-[10px] text-gray-500">{g.email}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="p-2 bg-white border-t border-gray-200 flex gap-1">
                        <input className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 outline-none" placeholder="Message... (@ to mention)" value={newChatMsg} onChange={handleChatInput} onKeyDown={(e) => e.key === 'Enter' && handleSendChat()} />
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
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Form State for ConfigForm
    const [formState, setFormState] = useState({
        grade: 'G10',
        color: 'Natural',
        thickness: '',
        width: '',
        length: '',
        diameter: '',
        quantity: ''
    });

    const handleFormChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    // AI Import State
    const [emailContent, setEmailContent] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const handleImportEmail = async () => {
        if (!emailContent.trim()) return;
        setIsImporting(true);
        try {
            const res = await fetch('/api/ai/parse-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: emailContent })
            });
            const data = await res.json();

            // Convert AI response to cart items
            const newItems = [];
            let idCounter = Date.now();

            const processItems = (items, type) => {
                if (!items) return;
                items.forEach(item => {
                    newItems.push({
                        id: idCounter++,
                        type: type,
                        desc: `${item.Grade} ${item.Color} ${type}`,
                        qty: parseInt(item.Quantity) || 1,
                        specs: {
                            mat: `${item.Grade}/${item.Color}`,
                            dims: formatDims(item, type)
                        }
                    });
                });
            };

            processItems(data.sheet_value, 'Sheet');
            processItems(data.rod_value, 'Rod');
            processItems(data.tube_value, 'Tube');
            processItems(data.ring_value, 'Ring');

            setCart([...cart, ...newItems]);
            setShowImportModal(false);
            setEmailContent('');
        } catch (err) {
            console.error("Import failed", err);
            alert("Failed to parse email. Please try again.");
        } finally {
            setIsImporting(false);
        }
    };

    const formatDims = (item, type) => {
        if (type === 'Sheet') return `${item.Thickness}" x ${item.Width}" x ${item.Length}"`;
        if (type === 'Rod') return `${item.Diameter}" OD x ${item.Length}"`;
        if (type === 'Tube') return `${item.Outer_Diameter}" OD x ${item.Inner_Diameter}" ID x ${item.Length}"`;
        if (type === 'Ring') return `${item.Outer_Diameter}" OD x ${item.Inner_Diameter}" ID x ${item.Thickness}" Thk`;
        return '';
    };

    const handleOptimize = async (itemId = selectedItemId) => {
        if (!itemId) return;

        const targetItems = cart.filter(i => i.id === itemId);
        if (targetItems.length === 0) return;

        setIsOptimizing(true);
        try {
            console.log(`Preparing optimization for item ${itemId} (Paranoid Mode - QuoteBuilder)...`);

            // --- PARANOID STOCK PARSING ---
            let stocks = [];
            try {
                const stockSizes = new Set();
                targetItems.forEach(item => {
                    if (item.specs?.stockSize) stockSizes.add(item.specs.stockSize);
                });

                if (stockSizes.size > 0) {
                    stocks = Array.from(stockSizes).map(sizeStr => {
                        try {
                            if (!sizeStr || sizeStr.toLowerCase().includes('custom')) {
                                return { length: 96, width: 48, count: 100 };
                            }
                            const parts = sizeStr.toLowerCase().split('x').map(p => parseFloat(p.trim()));
                            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                                return { width: Number(parts[0]), length: Number(parts[1]), count: 100 };
                            }
                        } catch (e) { console.error("Stock parse error:", e); }
                        return { length: 96, width: 48, count: 100 }; // Fallback
                    });
                } else {
                    stocks = [{ length: 96, width: 48, count: 100 }];
                }
            } catch (e) {
                console.error("Stock generation error:", e);
                stocks = [{ length: 96, width: 48, count: 100 }];
            }

            // --- PARANOID REQUIREMENTS PARSING ---
            let requirements = [];
            try {
                requirements = targetItems
                    .filter(item => item.type === 'Cut Piece/Sand' || item.type === 'Sheet')
                    .map(item => {
                        try {
                            let w = 12, l = 12, c = 1; // Safe defaults

                            // Try Raw
                            if (item.specs?.rawDims?.width) w = item.specs.rawDims.width;
                            if (item.specs?.rawDims?.length) l = item.specs.rawDims.length;

                            // Try String
                            if ((w === 12 || l === 12) && item.specs?.dims) {
                                const parts = item.specs.dims.split('x').map(p => parseFloat(p.replace('"', '').trim()));
                                if (parts.length >= 2) {
                                    if (parts.length === 3) { w = parts[1]; l = parts[2]; }
                                    else { w = parts[0]; l = parts[1]; }
                                }
                            }

                            // Validate & Cast
                            w = Number(w);
                            l = Number(l);
                            c = Number(item.qty);

                            if (isNaN(w) || w <= 0) w = 12;
                            if (isNaN(l) || l <= 0) l = 12;
                            if (isNaN(c) || c <= 0) c = 1;

                            return { width: w, length: l, count: c };
                        } catch (e) {
                            console.error("Item parse error:", e);
                            return { width: 12, length: 12, count: 1 };
                        }
                    });
            } catch (e) {
                console.error("Requirements generation error:", e);
            }

            const payload = {
                stocks: stocks,
                requirements: requirements,
                kerf: 0.125
            };

            console.log("PARANOID PAYLOAD (QuoteBuilder):", JSON.stringify(payload, null, 2));

            if (payload.requirements.length === 0) {
                // alert("No valid items to optimize."); // Don't alert on auto-run
                setOptimizationResult(null);
                setIsOptimizing(false);
                return;
            }

            const res = await fetch('/opticutter/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Optimization request failed");

            const data = await res.json();
            console.log("Optimization result:", data);
            setOptimizationResult(data);
        } catch (err) {
            console.error("Optimization failed:", err);
            alert("Optimization failed. Check console.");
        } finally {
            setIsOptimizing(false);
        }
    };





    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
            if (initialStep === 1 && cart.length === 0) {
                // Empty cart initialization
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
    }, [isOpen]); // Only run on open to prevent resets during polling

    useEffect(() => {
        if (step === 2 && cart.length > 0 && !selectedItemId) {
            setSelectedItemId(cart[0].id);
        }
    }, [step, cart, selectedItemId]);

    // Auto-optimize when selected item changes
    useEffect(() => {
        if (step === 2 && selectedItemId) {
            handleOptimize(selectedItemId);
        }
    }, [step, selectedItemId]);

    const addToCart = async () => {
        // Parse dimensions for API
        let width = 0, length = 0, thickness = 0, diameter = 0;

        if (activeType === 'Sheet' || activeType === 'Cut Piece/Sand') {
            thickness = parseFloat(formState.thickness) || 0;
            width = parseFloat(formState.width) || 0;
            length = parseFloat(formState.length) || 0;
        } else if (activeType === 'Rod' || activeType === 'Cut Rod') {
            diameter = parseFloat(formState.diameter) || 0;
            length = parseFloat(formState.length) || 0;
        }

        console.log("AddToCart Debug:", { activeType, thickness, width, length, formState });

        const itemForDims = {
            Thickness: thickness,
            Width: width,
            Length: length,
            Diameter: diameter,
            Outer_Diameter: diameter, // Fallback
            Inner_Diameter: 0 // Fallback
        };

        try {
            const res = await fetch('/api/pricing/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: (activeType === 'Cut Piece/Sand') ? 'Sheet' : activeType.split('/')[0].replace('Cut ', ''), // Normalize type
                    specs: {
                        grade: formState.grade,
                        color: formState.color,
                        thickness, width, length, diameter
                    },
                    quantity: parseInt(formState.quantity) || 1
                })
            });

            const pricingData = await res.json();

            if (!res.ok) {
                console.error("Pricing failed", pricingData);
                // Fallback to mock if API fails (or for types not yet supported)
                setCart([...cart, {
                    id: Date.now(),
                    type: activeType,
                    desc: `${formState.grade} ${formState.color} ${activeType}`,
                    qty: parseInt(formState.quantity) || 1,
                    specs: {
                        mat: `${formState.grade}/${formState.color}`,
                        dims: `${thickness}" x ${width}" x ${length}"`
                    },
                    price: 0
                }]);
                return;
            }

            setCart([...cart, {
                id: Date.now(),
                type: activeType,
                desc: (activeType === 'Cut Piece/Sand')
                    ? `${formState.grade} ${formState.color} ${formatDims(itemForDims, activeType)}`
                    : (pricingData.description || `${formState.grade} ${formState.color} ${activeType}`),
                qty: parseInt(formState.quantity, 10) || 1,
                specs: {
                    mat: `${formState.grade}/${formState.color}`,
                    dims: formatDims(itemForDims, activeType),
                    stockSize: formState.stockSize, // Save selected stock size
                    rawDims: { width, length, thickness } // Save raw dimensions for optimization
                },
                price: pricingData.unitPrice,
                total: pricingData.totalPrice,
                itemNumber: pricingData.itemNumber
            }]);

        } catch (err) {
            console.error("Add to cart error", err);
        }
    };

    const handleMarkAsNew = async (threadId, isNew) => {
        try {
            // Optimistic update
            setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_new: isNew } : t));

            // If marking as read (isNew=false), decrement count immediately for responsiveness
            if (!isNew) {
                setNewCount(prev => Math.max(0, prev - 1));
            } else {
                setNewCount(prev => prev + 1);
            }

            const res = await fetch(`/api/threads/${threadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_new: isNew })
            });

            if (!res.ok) {
                // Revert if failed (simplified, usually we'd re-fetch)
                refreshThreads();
            } else {
                fetchNewCount(); // Ensure accurate count
            }
        } catch (err) {
            console.error("Mark as new error:", err);
            refreshThreads();
        }
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
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-lg font-bold text-gray-800">Add Items to Quote</h2>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-all"><FileText size={16} /> Import from Email</button>
                                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm shadow-sm"><Upload size={16} /> Upload CSV</button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <FormInput label="Account Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                                <FormInput label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter Acc #" />
                                                <FormInput label="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                                            </div>
                                        </div>
                                        <ConfigForm type={activeType} formState={formState} onChange={handleFormChange} />
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
                                        <button onClick={() => { setStep(2); }} disabled={cart.length === 0} className={`w-full py-3 rounded font-bold shadow transition-all ${cart.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Calculate Costs <ArrowRight size={16} className="inline ml-1" /></button>
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
                                                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase"><Box size={16} className="text-blue-600" /> Cut Plan Optimization {isOptimizing && <span className="text-xs text-blue-500 animate-pulse">Running...</span>}</h3>
                                                <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-300 relative rounded mb-3 flex flex-col">
                                                    <OptimizationResult result={optimizationResult} />
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

// --- 0. ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-screen flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <p className="mb-4">Please check the console for more details.</p>
                    <pre className="bg-white p-4 rounded border border-red-200 text-xs overflow-auto max-w-2xl">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// --- 4. SETTINGS MODAL ---
const TeammatesSettings = () => {
    const [teammates, setTeammates] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTeammate, setNewTeammate] = useState({ name: '', email: '', role: 'Member' });

    useEffect(() => {
        fetch('/api/teammates').then(res => res.json()).then(setTeammates).catch(console.error);
    }, []);

    const handleAdd = async () => {
        const res = await fetch('/api/teammates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTeammate)
        });
        if (res.ok) {
            const added = await res.json();
            setTeammates([...teammates, added]);
            setIsAdding(false);
            setNewTeammate({ name: '', email: '', role: 'Member' });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Teammates</h2>
                <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">Add teammate</button>
            </div>

            {isAdding && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <input placeholder="Name" className="border p-2 rounded" value={newTeammate.name} onChange={e => setNewTeammate({ ...newTeammate, name: e.target.value })} />
                        <input placeholder="Email" className="border p-2 rounded" value={newTeammate.email} onChange={e => setNewTeammate({ ...newTeammate, email: e.target.value })} />
                        <select className="border p-2 rounded" value={newTeammate.role} onChange={e => setNewTeammate({ ...newTeammate, role: e.target.value })}>
                            <option>Member</option>
                            <option>Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        <button onClick={handleAdd} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Team role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date invited</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {teammates.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{t.name}</div>
                                    <div className="text-gray-500 text-xs">{t.email}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{t.role}</td>
                                <td className="px-6 py-4 text-gray-700">{t.status}</td>
                                <td className="px-6 py-4 text-gray-500">{t.date_invited ? new Date(t.date_invited).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TagsSettings = () => {
    const [tags, setTags] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTag, setNewTag] = useState({ name: '', description: '', color: '#6366f1', show_in_list: true, available_everywhere: true });

    useEffect(() => {
        fetch('/api/tags').then(res => res.json()).then(setTags).catch(console.error);
    }, []);

    const handleCreate = async () => {
        const res = await fetch('/api/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTag)
        });
        if (res.ok) {
            const added = await res.json();
            setTags([...tags, added]);
            setIsCreating(false);
            setNewTag({ name: '', description: '', color: '#6366f1', show_in_list: true, available_everywhere: true });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
                <button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">Create tag</button>
            </div>

            {isCreating && (
                <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Create tag</h3>
                    <div className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Name *</label>
                            <input className="w-full border border-gray-300 rounded-md p-2" value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea className="w-full border border-gray-300 rounded-md p-2" value={newTag.description} onChange={e => setNewTag({ ...newTag, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Color</label>
                            <div className="flex gap-2">
                                {['#6366f1', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6'].map(c => (
                                    <div key={c} onClick={() => setNewTag({ ...newTag, color: c })} className={`w-6 h-6 rounded-full cursor-pointer ${newTag.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Show in conversation list</span>
                            <input type="checkbox" checked={newTag.show_in_list} onChange={e => setNewTag({ ...newTag, show_in_list: e.target.checked })} className="toggle" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                            <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Create</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Available in</th>
                            <th className="px-6 py-3">Date created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tags.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <Tag size={16} color={t.color} />
                                    <span className="font-bold text-gray-900">{t.name}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{t.available_everywhere ? 'Any inbox' : 'Restricted'}</td>
                                <td className="px-6 py-4 text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SettingsModal = ({ isOpen, onClose, grants, defaultGrantId, setDefaultGrantId }) => {
    const [activeTab, setActiveTab] = useState('Teammates');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="font-bold text-xl text-gray-800">Settings</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Team management</h3>
                            <div className="space-y-1">
                                <button onClick={() => setActiveTab('Teammates')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'Teammates' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <Users size={18} /> Teammates
                                </button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Resources</h3>
                            <div className="space-y-1">
                                <button onClick={() => setActiveTab('Tags')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'Tags' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <Tag size={18} /> Tags
                                </button>
                                <button onClick={() => setActiveTab('Connected Accounts')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'Connected Accounts' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <Mail size={18} /> Connected Accounts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <div className="flex justify-end p-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 pb-8">
                        {activeTab === 'Teammates' && <TeammatesSettings />}
                        {activeTab === 'Tags' && <TagsSettings />}
                        {activeTab === 'Connected Accounts' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected Accounts</h2>
                                <div className="space-y-3 mb-6">
                                    {grants.map(grant => (
                                        <div key={grant.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {grant.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{grant.email}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{grant.provider}</div>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="defaultGrant"
                                                    checked={defaultGrantId === grant.id}
                                                    onChange={() => setDefaultGrantId(grant.id)}
                                                    className="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-xs font-medium text-gray-600">Default</span>
                                            </label>
                                        </div>
                                    ))}
                                    {grants.length === 0 && <div className="text-sm text-gray-500 italic">No accounts connected.</div>}
                                </div>
                                <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                    <Plus size={16} /> Connect Another Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 5. MAIN APP COMPONENT ---

const MetalFlowApp = () => {
    const [activeChannel, setActiveChannel] = useState('Inbox');
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [selectedThreadIds, setSelectedThreadIds] = useState(new Set());
    const [lastSelectedThreadId, setLastSelectedThreadId] = useState(null);
    const [threads, setThreads] = useState([]);
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Settings Modal State
    const [isComposeOpen, setIsComposeOpen] = useState(false); // Compose Modal State
    const [activeProductContext, setActiveProductContext] = useState('Sheet');
    const [quoteStep, setQuoteStep] = useState(1);
    const [pendingReply, setPendingReply] = useState("");
    const [currentMessages, setCurrentMessages] = useState([]);
    const [allTags, setAllTags] = useState(INITIAL_TAGS);
    const [grants, setGrants] = useState([]);
    const [defaultGrantId, setDefaultGrantId] = useState(localStorage.getItem('defaultGrantId') || null);
    const [newCount, setNewCount] = useState(0);


    // Fetch grants on mount
    useEffect(() => {
        const fetchGrants = async () => {
            try {
                const res = await fetch('/nylas/grants');
                if (res.ok) {
                    const data = await res.json();
                    setGrants(data);
                    // Set default if not set
                    if (data.length > 0 && !defaultGrantId) {
                        setDefaultGrantId(data[0].id);
                    }
                }
            } catch (err) {
                console.error("Error fetching grants:", err);
            }
        };
        fetchGrants();
    }, []);

    // Persist default grant
    useEffect(() => {
        if (defaultGrantId) {
            localStorage.setItem('defaultGrantId', defaultGrantId);
        }
    }, [defaultGrantId]);

    // Logging for debugging
    useEffect(() => {
        console.log("MetalFlowApp Mounted - Version: 2025-11-26 13:30 (Custom Stock Fix)");
    }, []);

    useEffect(() => {
        console.log("State Update - Active Thread:", activeThreadId);
    }, [activeThreadId]);

    useEffect(() => {
        console.log("State Update - Quote Modal Open:", isQuoteModalOpen);
    }, [isQuoteModalOpen]);

    // --- DATA FETCHING (SUPABASE) ---
    const refreshThreads = async () => {
        try {
            // Determine status filter based on activeChannel
            let statusFilter = 'inbox'; // Default
            let channelFilter = activeChannel; // Default to active channel name

            if (activeChannel === 'Assigned Done') {
                statusFilter = 'done';
                channelFilter = null; // Show all done
            } else if (activeChannel === 'Assigned Open') {
                statusFilter = 'inbox'; // Show all inbox? Or specific? Let's assume 'inbox' status for now.
                channelFilter = null; // Maybe show all inbox?
            } else if (activeChannel === 'Inbox') {
                statusFilter = 'inbox';
                channelFilter = 'Inbox';
            } else {
                // For Shapes-Quotes etc.
                statusFilter = 'inbox';
                channelFilter = activeChannel;
            }

            const res = await fetch(`/api/threads?status=${statusFilter}${channelFilter ? `&channel=${encodeURIComponent(channelFilter)}` : ''}`);
            if (res.ok) {
                const data = await res.json();

                // Map DB threads to UI format (adding 'messages' array for preview)
                const mappedThreads = data.map(t => ({
                    ...t,
                    messages: [{
                        id: 'latest', // Placeholder
                        sender: 'customer', // Assume customer for preview
                        name: t.participants?.[0]?.name || 'Unknown',
                        text: t.snippet || '',
                        timestamp: t.last_message_timestamp ? new Date(t.last_message_timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                    }],
                    // Add full date object for sorting/display if needed
                    fullDate: t.last_message_timestamp ? new Date(t.last_message_timestamp * 1000) : null
                }));

                setThreads(mappedThreads);
                fetchNewCount(); // Update count whenever threads refresh
            }
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };

    const fetchNewCount = async () => {
        try {
            const res = await fetch(`/api/threads/count?channel=${encodeURIComponent(activeChannel)}`);
            if (res.ok) {
                const data = await res.json();
                setNewCount(data.count);
            }
        } catch (err) {
            console.error("Error fetching new count:", err);
        }
    };

    useEffect(() => {
        fetchNewCount();
    }, [activeChannel]);

    const handleSync = async (silent = false) => {
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            if (res.ok) {
                if (!silent) alert("Sync started. Refreshing...");
                setTimeout(refreshThreads, 2000); // Wait for sync
            } else {
                if (!silent) alert("Sync failed to start.");
            }
        } catch (err) {
            console.error("Sync error:", err);
            if (!silent) alert("Sync error.");
        }
    };

    const handleArchive = async (threadId) => {
        try {
            const res = await fetch(`/api/threads/${threadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'done' })
            });
            if (res.ok) {
                // Remove from current view if we are in Inbox
                if (activeChannel === 'Inbox' || activeChannel === 'Assigned Open') {
                    setThreads(threads.filter(t => t.id !== threadId));
                    if (activeThreadId === threadId) setActiveThreadId(null);
                }
                // Refresh to be sure
                setTimeout(refreshThreads, 500);
            } else {
                alert("Failed to archive thread.");
            }
        } catch (err) {
            console.error("Error archiving thread:", err);
            alert("Error archiving thread.");
        }
    };

    useEffect(() => {
        refreshThreads();
        // Auto-sync every 15s (silent)
        const interval = setInterval(() => handleSync(true), 15000);
        return () => clearInterval(interval);
    }, [activeChannel]); // Refresh when channel changes

    // Fetch messages for active thread from Supabase
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeThreadId) return;

            // Check if it's a mock thread
            const mockThread = MOCK_THREADS.find(t => t.id === activeThreadId);
            if (mockThread) {
                setCurrentMessages(mockThread.messages);
                return;
            }

            try {
                console.log(`Fetching messages for thread ${activeThreadId}...`);
                const res = await fetch(`/api/threads/${activeThreadId}/messages`);
                if (!res.ok) throw new Error("Failed to fetch messages");

                const data = await res.json();

                // Map DB messages to UI format
                const mappedMessages = data.map(m => ({
                    id: m.id,
                    sender: m.from?.[0]?.email === 'me' ? 'user' : 'customer', // Simplified check
                    name: m.from?.[0]?.name || m.from?.[0]?.email || 'Unknown',
                    text: m.body,
                    timestamp: m.date ? new Date(m.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    rawDate: m.date,
                    subject: m.subject,
                    from: m.from,
                    to: m.to,
                    cc: m.cc
                }));

                setCurrentMessages(mappedMessages);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setCurrentMessages([]);
            }
        };

        fetchMessages();
    }, [activeThreadId, threads]);


    const activeThread = activeThreadId === 'new'
        ? { id: 'new', subject: '', to: [], messages: [], tags: [], senderEmail: '', status: 'New' }
        : (threads.find(t => t.id === activeThreadId) || threads[0]);

    const handleOpenQuote = (context) => {
        console.log("Opening Quote Modal with context:", context);
        setActiveProductContext(context || 'Sheet');
        setIsQuoteModalOpen(true);
    };

    const handleViewQuote = (id) => {
        console.log("Viewing Quote:", id);
        alert(`View Quote ${id} (Placeholder)`);
    };

    const handleCloneQuote = (id) => {
        console.log("Cloning Quote:", id);
        alert(`Clone Quote ${id} (Placeholder)`);
    };

    const handleUpdateTags = (newTags) => {
        const updatedThreads = threads.map(t =>
            t.id === activeThreadId ? { ...t, tags: newTags } : t
        );
        setThreads(updatedThreads);
    };

    const handleCompose = () => {
        console.log("Composing new message...");
        setActiveThreadId('new');
        setCurrentMessages([]);
        setActiveChannel('Inbox');
    };

    const handleMoveThread = async (threadId, targetChannel) => {
        try {
            // Optimistic update: Remove from current list if we are filtering by channel
            setThreads(prev => prev.filter(t => t.id !== threadId));

            let payload = {};
            const specialChannels = ['Assigned Open', 'Assigned Later', 'Assigned Done', 'Sent', 'Trash', 'Spam', 'Inbox'];

            if (specialChannels.includes(targetChannel)) {
                // Handle special status views
                if (targetChannel === 'Assigned Done') payload.status = 'done';
                else if (targetChannel === 'Assigned Open') payload.status = 'inbox';
                else if (targetChannel === 'Trash') payload.status = 'trash';
                else if (targetChannel === 'Spam') payload.status = 'spam';
                else if (targetChannel === 'Assigned Later') payload.status = 'snoozed';
                else if (targetChannel === 'Inbox') {
                    payload.status = 'inbox';
                    payload.channel = 'Inbox';
                }
            } else {
                // It's a Shared Inbox
                payload.channel = targetChannel;
                payload.status = 'inbox'; // Ensure it's visible (unarchive if needed)
            }

            const res = await fetch(`/api/threads/${threadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                refreshThreads(); // Revert on failure
                alert("Failed to move thread.");
            } else {
                // Success
                console.log(`Moved thread ${threadId} to ${targetChannel}`, payload);
                // If we moved to a shared inbox, we might want to refresh counts or similar
                fetchNewCount();
            }
        } catch (err) {
            console.error("Move thread error:", err);
            refreshThreads();
        }
    };

    const handleThreadClick = (threadId, e) => {
        if (e.shiftKey && lastSelectedThreadId) {
            const currentIndex = threads.findIndex(t => t.id === threadId);
            const lastIndex = threads.findIndex(t => t.id === lastSelectedThreadId);
            if (currentIndex !== -1 && lastIndex !== -1) {
                const start = Math.min(currentIndex, lastIndex);
                const end = Math.max(currentIndex, lastIndex);
                const newSelection = new Set(selectedThreadIds);
                for (let i = start; i <= end; i++) {
                    newSelection.add(threads[i].id);
                }
                setSelectedThreadIds(newSelection);
            }
        } else if (e.metaKey || e.ctrlKey) {
            const newSelection = new Set(selectedThreadIds);
            if (newSelection.has(threadId)) {
                newSelection.delete(threadId);
            } else {
                newSelection.add(threadId);
            }
            setSelectedThreadIds(newSelection);
            setLastSelectedThreadId(threadId);
        } else {
            setSelectedThreadIds(new Set([threadId]));
            setLastSelectedThreadId(threadId);
            setActiveThreadId(threadId);
        }
    };

    const handleMarkAsNew = async (threadId, isNew) => {
        try {
            // Optimistic update
            setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_new: isNew } : t));

            // If marking as read (isNew=false), decrement count immediately for responsiveness
            if (!isNew) {
                setNewCount(prev => Math.max(0, prev - 1));
            } else {
                setNewCount(prev => prev + 1);
            }

            const res = await fetch(`/api/threads/${threadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_new: isNew })
            });

            if (!res.ok) {
                // Revert if failed (simplified, usually we'd re-fetch)
                refreshThreads();
            } else {
                fetchNewCount(); // Ensure accurate count
            }
        } catch (err) {
            console.error("Mark as new error:", err);
            refreshThreads();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel} onOpenSettings={() => setIsSettingsOpen(true)} onCompose={() => setIsComposeOpen(true)} newCount={newCount} onMoveThread={handleMoveThread} />

            {/* Thread List with Archive Action passed */}
            <ThreadList
                threads={threads}
                activeThreadId={activeThreadId}
                selectedThreadIds={selectedThreadIds}
                onSelectThread={handleThreadClick}
                onRefresh={refreshThreads}
                onSync={() => handleSync(false)}
                onArchive={handleArchive}
            />

            <ThreadView
                thread={activeThread}
                onOpenQuote={handleOpenQuote}
                onViewQuote={(id) => alert(`View Quote ${id}`)}
                onCloneQuote={(id) => alert(`Clone Quote ${id}`)}
                pendingReply={pendingReply}
                setPendingReply={setPendingReply}
                messages={currentMessages}
                setMessages={setCurrentMessages}
                allTags={INITIAL_TAGS}
                onUpdateTags={(newTags) => {
                    const updated = { ...activeThread, tags: newTags };
                    setThreads(threads.map(t => t.id === activeThread.id ? updated : t));
                }}
                grants={grants}
                defaultGrantId={defaultGrantId}
                onArchive={() => handleArchive(activeThreadId)}
                onMarkAsNew={handleMarkAsNew}
            />

            {/* Modals */}
            {/* Modals */}
            <QuoteBuilder
                isOpen={isQuoteModalOpen}
                onClose={() => setIsQuoteModalOpen(false)}
                productContext={activeProductContext}
                activeThread={activeThread}
                onSubmitQuote={(quote) => {
                    console.log("Quote Submitted:", quote);
                    setIsQuoteModalOpen(false);
                    // Optionally refresh threads or add a message
                }}
            />

            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
                    <div className="w-[600px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300">
                        <SettingsView onClose={() => setIsSettingsOpen(false)} allTags={INITIAL_TAGS} />
                    </div>
                </div>
            )}

            {isComposeOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-700">New Message</h3>
                            <button onClick={() => setIsComposeOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <input className="w-full border-b border-gray-200 py-2 outline-none text-sm" placeholder="To" />
                            <input className="w-full border-b border-gray-200 py-2 outline-none text-sm" placeholder="Subject" />
                            <textarea className="w-full h-64 outline-none resize-none text-sm" placeholder="Write your message..."></textarea>
                        </div>
                        <div className="p-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
                            <button onClick={() => setIsComposeOpen(false)} className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200 rounded">Discard</button>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 flex items-center gap-2"><Send size={16} /> Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    return (
        <ErrorBoundary>
            <MetalFlowApp />
        </ErrorBoundary>
    );
}
