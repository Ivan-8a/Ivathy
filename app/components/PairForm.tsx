// app/components/PairForm.tsx
'use client';

import { useState } from 'react';

interface PairFormProps {
  userId: string;
  onPaired: (partner: any) => void;
}

export default function PairForm({ userId, onPaired }: PairFormProps) {
  const [mode, setMode] = useState<'select' | 'generate' | 'join'>('select');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'generate' })
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.pairCode);
        setMessage(data.message);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error al generar código');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      console.log('Submitting code:', code); // Debug log
      const response = await fetch('/api/pair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          code: code.toUpperCase(), // Asegurarse de que el código esté en mayúsculas
          userId
        })
      });

      const data = await response.json();
      console.log('Pair response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Error al emparejar');
      }

      onPaired(data.partner);
    } catch (error) {
      console.error('Pair error:', error);
      alert(error instanceof Error ? error.message : 'Error al emparejar');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Emparejar con tu pareja</h2>
        <div className="space-y-4">
          <button
            onClick={() => setMode('generate')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600"
          >
            Generar código
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600"
          >
            Tengo un código
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'generate') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Generar código</h2>
        {!generatedCode ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar código'}
          </button>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Comparte este código con tu pareja:</p>
              <div className="text-3xl font-bold text-blue-600 bg-blue-50 p-4 rounded-lg">
                {generatedCode}
              </div>
            </div>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        )}
        <button
          onClick={() => setMode('select')}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Ingresar código</h2>
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Código de tu pareja
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="XXXXXX"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Conectando...' : 'Conectar'}
        </button>
      </form>
      <button
        onClick={() => setMode('select')}
        className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
      >
        Volver
      </button>
      {message && (
        <p className="mt-4 text-center text-green-600">{message}</p>
      )}
    </div>
  );
}