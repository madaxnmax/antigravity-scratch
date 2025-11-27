import React, { useState, useEffect } from 'react';
import { Download, Upload, RefreshCw, Save } from 'lucide-react';

const TABS = ['Sheet', 'Rod', 'Tube', 'FilamentTube'];

const COLUMNS = {
    Sheet: [
        { key: 'sku', label: 'SKU' },
        { key: 'grade', label: 'Grade' },
        { key: 'length', label: 'Length' },
        { key: 'width', label: 'Width' },
        { key: 'thickness', label: 'Thickness' },
        { key: 'thickness_plus', label: 'Thickness +' },
        { key: 'thickness_minus', label: 'Thickness -' },
        { key: 'kerf', label: 'Kerf' },
        { key: 'price_st_st', label: 'Price ST/ST' },
        { key: 'price_st_plus_5', label: 'Price ST + 5%' },
        { key: 'price_ds_ds', label: 'Price DS/DS' },
        { key: 'price_fab', label: 'Price FAB' },
        { key: 'price_oem', label: 'Price OEM' },
        { key: 'price_retail', label: 'Price Retail' }
    ],
    Rod: [
        { key: 'sku', label: 'SKU' },
        { key: 'grade', label: 'Grade' },
        { key: 'length', label: 'Length' },
        { key: 'diameter', label: 'Diameter' },
        { key: 'kerf', label: 'Kerf' },
        { key: 'price_st_st', label: 'Price ST/ST' },
        { key: 'price_st_plus_5', label: 'Price ST + 5%' },
        { key: 'price_ds_ds', label: 'Price DS/DS' },
        { key: 'price_fab', label: 'Price FAB' },
        { key: 'price_oem', label: 'Price OEM' },
        { key: 'price_retail', label: 'Price Retail' }
    ],
    Tube: [
        { key: 'grade', label: 'Grade' },
        { key: 'cost_per_kg', label: 'Cost per Kg' },
        { key: 'cost_per_batch', label: 'Cost per Batch' },
        { key: 'cost_per_setup', label: 'Cost per Setup' }
    ],
    FilamentTube: [
        { key: 'grade', label: 'Grade' },
        { key: 'cost_per_kg', label: 'Cost per Kg' },
        { key: 'cost_per_batch', label: 'Cost per Batch' },
        { key: 'cost_per_setup', label: 'Cost per Setup' }
    ]
};

const MaterialManager = () => {
    const [activeTab, setActiveTab] = useState('Sheet');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/materials?type=${activeTab}`);
            const json = await res.json();
            setData(json || []);
        } catch (err) {
            console.error("Failed to fetch materials", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!data.length) return;
        const cols = COLUMNS[activeTab];
        const header = cols.map(c => c.label).join(',');
        const rows = data.map(row => cols.map(c => row[c.key] || '').join(','));
        const csv = [header, ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_materials.csv`;
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 2) return;

            const header = lines[0].split(',').map(h => h.trim());
            const cols = COLUMNS[activeTab];

            // Map CSV headers to keys
            const keyMap = {};
            header.forEach((h, i) => {
                const col = cols.find(c => c.label === h);
                if (col) keyMap[i] = col.key;
            });

            const newItems = lines.slice(1).map(line => {
                const values = line.split(',');
                const item = { type: activeTab };
                values.forEach((v, i) => {
                    if (keyMap[i]) item[keyMap[i]] = v.trim();
                });
                return item;
            });

            setImporting(true);
            try {
                await fetch('/api/materials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ materials: newItems })
                });
                fetchData();
                alert(`Successfully imported ${newItems.length} items.`);
            } catch (err) {
                console.error("Import failed", err);
                alert("Import failed.");
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="p-2 text-gray-500 hover:bg-gray-100 rounded"><RefreshCw size={18} /></button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                        <Download size={16} /> Export
                    </button>
                    <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 cursor-pointer">
                        <Upload size={16} /> Import
                        <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={importing} />
                    </label>
                </div>
            </div>

            <div className="flex-1 overflow-auto border border-gray-200 rounded">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                        <tr>
                            {COLUMNS[activeTab].map(col => (
                                <th key={col.key} className="px-4 py-2 border-b border-gray-200 whitespace-nowrap">{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={COLUMNS[activeTab].length} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={COLUMNS[activeTab].length} className="p-8 text-center text-gray-400">No data found. Import CSV to populate.</td></tr>
                        ) : (
                            data.map((row, i) => (
                                <tr key={row.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                                    {COLUMNS[activeTab].map(col => (
                                        <td key={col.key} className="px-4 py-2 whitespace-nowrap">{row[col.key]}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaterialManager;
