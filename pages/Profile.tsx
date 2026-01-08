import React, { useState } from 'react';
import { User, Mail, Lock, Camera, Save, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const [user, setUser] = useState({
    name: 'Admin User',
    email: 'admin@newsai.com',
    role: 'Administrateur Principal',
    bio: 'Passionné par l\'intelligence artificielle et le journalisme numérique.',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff&bold=true'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Simulation d'appel API
    setTimeout(() => {
      setIsLoading(false);
      alert('Profil mis à jour avec succès !');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
        <p className="text-slate-500 mt-1">Gérez vos informations personnelles et vos accès.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-4">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-indigo-50 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-indigo-600 font-medium text-sm mb-4">{user.role}</p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <User size={20} className="mr-2 text-indigo-600" /> Informations Personnelles
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                  <div className="relative">
                     <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                      type="text" 
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                     />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                   <div className="relative">
                     <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                      type="email" 
                      value={user.email}
                      onChange={(e) => setUser({...user, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                     />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea 
                  rows={4}
                  value={user.bio}
                  onChange={(e) => setUser({...user, bio: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Shield size={20} className="mr-2 text-indigo-600" /> Sécurité
            </h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                   <div className="relative">
                     <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer mot de passe</label>
                   <div className="relative">
                     <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                     />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end">
             <button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-md shadow-indigo-100 disabled:opacity-70"
             >
               <Save size={18} />
               <span>{isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};