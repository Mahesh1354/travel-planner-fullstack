import React, { useState } from 'react';
import { testAPIIntegration } from '../../utils/apiTest';

const APITest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const runTests = async () => {
    setTesting(true);
    try {
      const testResults = await testAPIIntegration();
      setResults(testResults);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">API Integration Test</h2>
          <button
            onClick={runTests}
            disabled={testing}
            className="btn-primary"
          >
            {testing ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-green-600 font-semibold">✅ Passed: {passed}</span>
                <span className="text-red-600 font-semibold">❌ Failed: {failed}</span>
                <span className="text-gray-600 font-semibold">Total: {results.length}</span>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                {expanded ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
        )}

        {expanded && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  result.status === '✅ PASS' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.api}</span>
                  <span className={result.status === '✅ PASS' ? 'text-green-600' : 'text-red-600'}>
                    {result.status}
                  </span>
                </div>
                {result.error && (
                  <p className="text-sm text-red-600 mt-1">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default APITest;