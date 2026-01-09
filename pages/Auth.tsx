
import React, { useState } from 'react';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import { Mail, Lock, Zap, ArrowRight, Loader2, AlertCircle, PlayCircle, User, Globe } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [slug, setSlug] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Transforme le texte en slug url-friendly (minuscules, tirets, pas de caractères spéciaux)
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(val);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification : Empêcher l'appel réseau si l'URL est celle par défaut
    if (SUPABASE_URL.includes('votre-projet')) {
        setError("La base de données n'est pas connectée. Configurez le fichier lib/supabase.ts ou utilisez le mode démo.");
        setLoading(false);
        return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // Validation basique
        if (!slug || !username) {
            throw new Error("Veuillez choisir un nom d'utilisateur et une adresse pour votre blog.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              blog_slug: slug
            }
          }
        });
        if (error) throw error;
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
     // Permet de passer outre l'auth pour tester l'interface
     onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="text-white w-7 h-7 fill-current" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-serif">
          {isLogin ? 'Connexion à NEWS AI' : 'Créer votre Blog AI'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isLogin ? 'Gérez votre contenu et analysez votre audience.' : 'Configurez votre sous-domaine et commencez à écrire.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start">
                <AlertCircle size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p>{error}</p>
                  {SUPABASE_URL.includes('votre-projet') && (
                     <p className="mt-1 text-xs">Utilisez le bouton "Mode Démo" ci-dessous pour tester sans configuration.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Champs spécifiques à l'inscription */}
            {!isLogin && (
                <>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Nom d'utilisateur</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Jean Dupont"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-slate-700">Adresse du blog (Slug)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="slug"
                                type="text"
                                required
                                value={slug}
                                onChange={handleSlugChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="mon-super-blog"
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Votre blog sera accessible via ce slug.</p>
                    </div>
                </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Adresse Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    {isLogin ? 'Se connecter' : "Créer mon blog"} <ArrowRight size={16} className="ml-2" />
                  </span>
                )}
              </button>
            </div>
          </form>

           {/* Bouton Mode Démo (Visible uniquement si Supabase mal configuré) */}
           {SUPABASE_URL.includes('votre-projet') && (
              <div className="mt-4">
                  <button
                    onClick={handleDemoLogin}
                    className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-indigo-300 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <PlayCircle size={16} className="mr-2" />
                    Essayer le Mode Démo
                  </button>
              </div>
            )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {isLogin ? "Créer un blog gratuitement" : "Se connecter à mon compte"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} NEWS AI Platform. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
