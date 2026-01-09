
import React from 'react';
import { BlogSettings } from '../types';
import { Save, Globe, Palette, Monitor, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: BlogSettings;
  onUpdate: (newSettings: BlogSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 mt-1">Configurez l'apparence et les informations générales de votre blog.</p>
      </div>

      <div className="grid gap-6">
        
        {/* General Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Informations Générales</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Blog</label>
              <input 
                type="text"
                value={settings.name}
                onChange={(e) => onUpdate({...settings, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                rows={3}
                value={settings.description}
                onChange={(e) => onUpdate({...settings, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-400 mt-1">Sera affiché dans le pied de page et les méta-données.</p>
            </div>
          </div>
        </div>
        
        {/* Domain Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Configuration du Domaine</h2>
          </div>
          
          <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="pt-1"><AlertTriangle size={16} className="text-amber-500" /></div>
                  <div className="text-sm text-slate-600">
                      <p className="font-bold text-slate-800 mb-1">Mode Sous-domaines (Avancé)</p>
                      <p className="mb-2">Activer cette option change les liens de votre blog de <code>monsite.com/?blog=slug</code> vers <code>slug.monsite.com</code>.</p>
                      <p className="text-xs text-slate-500">Nécessite une configuration DNS Wildcard (*.monsite.com) chez votre hébergeur. Si vos liens ne fonctionnent plus après activation, désactivez cette option.</p>
                  </div>
              </div>

              <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                      <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={settings.useSubdomains}
                            onChange={(e) => onUpdate({...settings, useSubdomains: e.target.checked})}
                          />
                          <div className={`block w-14 h-8 rounded-full transition-colors ${settings.useSubdomains ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.useSubdomains ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <div className="ml-3 text-sm font-medium text-slate-700">
                          {settings.useSubdomains ? 'Sous-domaines activés' : 'Sous-domaines désactivés'}
                      </div>
                  </label>
              </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Palette className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Apparence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-3">Thème Principal</label>
               <div className="flex space-x-3">
                 {['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'].map(color => (
                   <button 
                    key={color}
                    onClick={() => onUpdate({...settings, themeColor: color})}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${settings.themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                   />
                 ))}
               </div>
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-3">Langue du site</label>
                <select 
                  value={settings.language}
                  onChange={(e) => onUpdate({...settings, language: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
           <button className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
             <Save size={18} />
             <span>Enregistrer les modifications</span>
           </button>
        </div>
      </div>
    </div>
  );
};
