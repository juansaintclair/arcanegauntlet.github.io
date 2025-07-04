import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

        const fetchLeaderboard = async () => {
            setStatus('loading');
            try {
                const response = await fetch('/api/leaderboard', { signal: controller.signal });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error || 'Failed to fetch leaderboard data.');
                }
                const data = await response.json();
                setLeaderboard(data);
                setStatus('success');
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'An unknown error occurred.');
                    setStatus('error');
                }
            }
        };
        
        fetchLeaderboard();

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, []);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xl text-slate-300 animate-pulse">Loading scores...</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xl text-red-400">{error}</p>
                    </div>
                );
            case 'success':
                if (leaderboard.length === 0) {
                    return (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xl text-slate-300">No one has braved the gauntlet yet. Be the first!</p>
                        </div>
                    );
                }
                return (
                    <table className="w-full text-left font-mono">
                        <thead>
                            <tr className="border-b border-slate-600 text-slate-400 sticky top-0 bg-slate-800/50 backdrop-blur-sm">
                                <th className="p-2 md:p-3 w-16 text-center">Rank</th>
                                <th className="p-2 md:p-3">Name</th>
                                <th className="p-2 md:p-3 text-center">Floor</th>
                                <th className="p-2 md:p-3 text-center">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={entry.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                                    <td className="p-2 md:p-3 text-center font-bold text-yellow-400">{index + 1}</td>
                                    <td className="p-2 md:p-3 text-lg text-slate-200">{entry.name}</td>
                                    <td className="p-2 md:p-3 text-center text-lg text-sky-300">{entry.floor}</td>
                                    <td className="p-2 md:p-3 text-center text-lg text-slate-300">{formatTime(entry.time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-center p-4">
            <h1 className="text-5xl font-bold text-sky-400 mb-6 tracking-wider">Top 50 Adventurers</h1>
            <div className="w-full max-w-4xl bg-slate-800/50 border-2 border-sky-500/50 rounded-lg p-4">
                <div className="h-[60vh] overflow-y-auto pr-2">
                    {renderContent()}
                </div>
            </div>
            <button
                onClick={onBack}
                className="mt-6 px-8 py-3 bg-slate-600 text-white font-bold text-xl rounded-lg hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105"
            >
                Back to Main Menu
            </button>
        </div>
    );
};

export default LeaderboardScreen;