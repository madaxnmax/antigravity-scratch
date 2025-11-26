import React, { useMemo } from 'react';

const OptimizationResult = ({ result }) => {
    const calculatedYield = useMemo(() => {
        if (!result?.solution) return 0;
        if (result.solution.yield) return result.solution.yield;

        let totalStockArea = 0;
        let totalPartsArea = 0;

        if (result.solution.layouts) {
            result.solution.layouts.forEach(layout => {
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
    }, [result]);

    if (!result) {
        return (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                No optimization run
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-xs font-bold mb-2">Solution Found</div>
                {result.solution && result.solution.layouts && result.solution.layouts.map((layout, i) => (
                    <div key={i} className="mb-4 bg-white p-2 border border-gray-200 rounded">
                        <div className="text-[10px] text-gray-500 mb-1">Stock: {layout.stock.length}" x {layout.stock.width}" (Qty: {layout.count})</div>
                        <div className="relative bg-gray-100 border border-gray-300 w-full" style={{ aspectRatio: `${layout.stock.length}/${layout.stock.width}` }}>
                            {layout.panels && layout.panels.map((panel, pIndex) => (
                                <div
                                    key={pIndex}
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
                        </div>
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
