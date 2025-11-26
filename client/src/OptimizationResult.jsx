import React, { useMemo } from 'react';

const getOffcutColor = (width, length) => {
    // Generate a consistent pastel color based on dimensions
    const hue = (parseFloat(width) * parseFloat(length) * 137) % 360;
    return `hsl(${hue}, 70%, 85%)`;
};

const OptimizationResult = ({ result }) => {
    // Normalize result structure
    const solution = result?.solution || result;
    const layouts = solution?.layouts || [];

    const calculatedYield = useMemo(() => {
        if (!solution) return 0;
        if (solution.yield) return solution.yield;

        let totalStockArea = 0;
        let totalPartsArea = 0;

        if (layouts.length > 0) {
            layouts.forEach(layout => {
                const stockL = parseFloat(layout.stock.length);
                const stockW = parseFloat(layout.stock.width);
                const stockArea = stockL * stockW;
                totalStockArea += stockArea * layout.count;

                if (layout.panels) {
                    let layoutPartsArea = 0;
                    layout.panels.forEach(panel => {
                        layoutPartsArea += (parseFloat(panel.length) * parseFloat(panel.width));
                    });
                    totalPartsArea += layoutPartsArea * layout.count;
                }
            });
        }

        return totalStockArea > 0 ? totalPartsArea / totalStockArea : 0;
    }, [solution, layouts]);

    if (!result) {
        return (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                No optimization run
            </div>
        );
    }

    if (layouts.length === 0) {
        return (
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-xs font-bold mb-2 text-red-500">No Layouts Found</div>
                <pre className="text-[10px] bg-gray-50 p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-xs font-bold mb-2">Solution Found</div>
                {layouts.map((layout, i) => (
                    <div key={i} className="mb-4 bg-white p-2 border border-gray-200 rounded">
                        <div className="text-[10px] text-gray-500 mb-1">Stock: {layout.stock.length}" x {layout.stock.width}" (Qty: {layout.count})</div>
                        <div className="relative bg-gray-100 border border-gray-300 w-full" style={{ aspectRatio: `${layout.stock.length}/${layout.stock.width}` }}>
                            {/* Render Used Panels */}
                            {layout.panels && layout.panels.map((panel, pIndex) => (
                                <div
                                    key={`p-${pIndex}`}
                                    className="absolute bg-blue-500 border border-white opacity-80 flex items-center justify-center text-[8px] text-white font-bold overflow-hidden"
                                    style={{
                                        left: `${(parseFloat(panel.x) / parseFloat(layout.stock.length)) * 100}%`,
                                        top: `${(parseFloat(panel.y) / parseFloat(layout.stock.width)) * 100}%`,
                                        width: `${(parseFloat(panel.length) / parseFloat(layout.stock.length)) * 100}%`,
                                        height: `${(parseFloat(panel.width) / parseFloat(layout.stock.width)) * 100}%`
                                    }}
                                    title={`${panel.length}" x ${panel.width}"`}
                                >
                                    {panel.length}x{panel.width}
                                </div>
                            ))}
                            {/* Render Offcuts (Remainders) */}
                            {layout.remainders && layout.remainders.map((remainder, rIndex) => {
                                const color = getOffcutColor(remainder.width, remainder.length);
                                return (
                                    <div
                                        key={`r-${rIndex}`}
                                        className="absolute border border-white opacity-80 flex items-center justify-center text-[8px] text-gray-800 font-bold overflow-hidden"
                                        style={{
                                            backgroundColor: color,
                                            left: `${(parseFloat(remainder.x) / parseFloat(layout.stock.length)) * 100}%`,
                                            top: `${(parseFloat(remainder.y) / parseFloat(layout.stock.width)) * 100}%`,
                                            width: `${(parseFloat(remainder.length) / parseFloat(layout.stock.length)) * 100}%`,
                                            height: `${(parseFloat(remainder.width) / parseFloat(layout.stock.width)) * 100}%`
                                        }}
                                        title={`Offcut: ${remainder.length}" x ${remainder.width}"`}
                                    >
                                        {remainder.length}x{remainder.width}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Offcut Summary */}
                        {layout.remainders && layout.remainders.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wide">Offcuts Generated</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(layout.remainders.reduce((acc, r) => {
                                        const key = `${r.length}" x ${r.width}"`;
                                        if (!acc[key]) acc[key] = { count: 0, width: r.width, length: r.length };
                                        acc[key].count++;
                                        return acc;
                                    }, {})).map(([size, data]) => (
                                        <div key={size} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded border border-gray-100">
                                            <div
                                                className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                                                style={{ backgroundColor: getOffcutColor(data.width, data.length) }}
                                            />
                                            <div className="flex-1 flex justify-between items-center">
                                                <span className="text-[10px] font-medium text-gray-700">{size}</span>
                                                <span className="text-[10px] font-bold bg-white px-1.5 rounded border border-gray-200 text-gray-600">x{data.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-600 mt-2 border-t border-gray-100 pt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Yield: {calculatedYield ? (calculatedYield * 100).toFixed(1) : '--'}%</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" />Waste: {calculatedYield ? (100 - (calculatedYield * 100)).toFixed(1) : '--'}%</div>
            </div>
        </div>
    );
};

export default OptimizationResult;
