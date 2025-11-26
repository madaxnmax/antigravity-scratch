import React from 'react';
import OptimizationResult from './OptimizationResult';

const MOCK_RESULT = {
    solution: {
        yield: 0.85,
        layouts: [
            {
                count: 1,
                stock: { length: "96", width: "48" },
                panels: [
                    { x: "0", y: "0", length: "10", width: "10" },
                    { x: "10", y: "0", length: "10", width: "10" },
                    { x: "20", y: "0", length: "10", width: "10" },
                    { x: "0", y: "10", length: "10", width: "10" },
                    { x: "10", y: "10", length: "10", width: "10" }
                ]
            }
        ]
    }
};

const TestPage = () => {
    return (
        <div className="p-10 bg-gray-50 min-h-screen flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6">Optimization Result Test Harness</h1>
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-lg font-bold mb-4">Mock 2D Result</h2>
                <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-300 relative rounded mb-3 flex flex-col">
                    <OptimizationResult result={MOCK_RESULT} />
                </div>
            </div>
        </div>
    );
};

export default TestPage;
