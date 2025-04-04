import React, { useState, useEffect } from 'react';

interface HealthStatusProps {
  className?: string;
}

interface HealthEndpoint {
  status: string;
  port?: number;
  url?: string;
  error?: string;
}

const HealthStatus: React.FC<HealthStatusProps> = ({ className = '' }) => {
  const [healthEndpoint, setHealthEndpoint] = useState<HealthEndpoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthEndpoint();
  }, []);

  const fetchHealthEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = await window.electronAPI.getHealthEndpoint();
      setHealthEndpoint(endpoint);
    } catch (err) {
      setError(`Failed to fetch health endpoint: ${err}`);
      console.error('Error fetching health endpoint:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Health Endpoint</h2>
        <button 
          className="px-3 py-1 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
          onClick={fetchHealthEndpoint}
        >
          Refresh
        </button>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : healthEndpoint ? (
        <div>
          <p>Status: <span className={healthEndpoint.status === 'ok' ? 'text-green-500' : 'text-red-500'}>
            {healthEndpoint.status}
          </span></p>
          {healthEndpoint.port && <p>Port: {healthEndpoint.port}</p>}
          {healthEndpoint.url && (
            <p className="mt-2">
              <a 
                href={healthEndpoint.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {healthEndpoint.url}
              </a>
            </p>
          )}
        </div>
      ) : (
        <div>No health endpoint information available.</div>
      )}
    </div>
  );
};

export default HealthStatus; 