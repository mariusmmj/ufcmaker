import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export const SaveCardModal: React.FC = () => {
  const { setSaveModalOpen, saveCurrentCard, setToastMessage, eventName } = useStore();
  const [name, setName] = useState(eventName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    const success = saveCurrentCard(name.trim());
    if (success) {
      setToastMessage('Card successfully saved!');
      setSaveModalOpen(false);
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        useStore.getState().setToastMessage(null);
      }, 3000);
    } else {
      setError('A card with this name already exists.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setSaveModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl flex flex-col p-6 shadow-2xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-main)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: 'var(--font-condensed)',
            fontWeight: 900,
            fontSize: '1.8rem',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}
        >
          Save Card
        </h2>

        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            Card Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            className="w-full px-4 py-2 rounded-lg outline-none transition-colors"
            style={{
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-main)',
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: 16,
            }}
          />
          {error && <div className="text-red-500 text-sm mt-2 font-bold">{error}</div>}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setSaveModalOpen(false)}
            className="px-4 py-2 rounded-lg text-sm transition-colors uppercase font-bold"
            style={{ 
              fontFamily: 'var(--font-condensed)',
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-main)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors uppercase"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
