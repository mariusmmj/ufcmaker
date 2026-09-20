import React from 'react';
import { useStore } from '../store/useStore';

export const SavedCardsModal: React.FC = () => {
  const { savedCards, setHistoryModalOpen, loadCard, deleteCard } = useStore();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={() => setHistoryModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-main)',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 900,
              fontSize: '2rem',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            Saved Cards
          </h2>
          <button
            onClick={() => setHistoryModalOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{
              background: 'var(--bg-card-hover)',
              color: 'var(--text-primary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {savedCards.length === 0 ? (
            <div className="text-center py-10 text-stone-500">
              No saved cards yet. Build a card and click "Save" to see it here!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex justify-between items-center p-4 rounded-xl border"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-main)'
                  }}
                >
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-condensed)', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                      {card.name}
                    </h3>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(card.dateSaved).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadCard(card.id)}
                      className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors uppercase"
                      style={{ fontFamily: 'var(--font-condensed)' }}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="px-3 py-2 rounded-lg text-sm transition-colors uppercase font-bold"
                      style={{ 
                        fontFamily: 'var(--font-condensed)',
                        background: 'var(--bg-card-hover)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-main)'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
