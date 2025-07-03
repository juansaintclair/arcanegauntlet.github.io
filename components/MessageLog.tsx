import React, { useEffect, useRef } from 'react';

interface MessageLogProps {
  messages: string[];
}

const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md flex-1 min-h-0 border border-slate-700 overflow-y-auto">
      <h3 className="text-lg font-bold text-slate-400 mb-2 sticky top-0 bg-slate-800">Event Log</h3>
      <div className="flex flex-col space-y-1">
        {messages.map((msg, index) => (
          <p key={index} className="text-sm font-mono leading-tight">{msg}</p>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default MessageLog;