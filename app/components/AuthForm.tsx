// app/components/AuthForm.tsx
'use client';

import { useState } from 'react';

interface AuthFormProps {
  onAuth: (userData: { id: string; name: string }) => void;
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const userData = await response.json();
      onAuth(userData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrarse. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Ingresa tu nombre</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4"
          placeholder="Tu nombre"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}