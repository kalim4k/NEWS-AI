import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION SUPABASE
// Remplacez les valeurs ci-dessous par celles de votre projet Supabase
// (Disponibles dans Project Settings > API)
// ------------------------------------------------------------------

export const SUPABASE_URL = 'https://qyincixgisskkirnmqif.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_lxCsfm-1kaX6GqFCCvUZ9w_RNP26lfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tables nécessaires dans Supabase pour que cela fonctionne :
// 1. table 'posts' avec les colonnes : id (text/uuid), title (text), content (text), status (text), author (text), date (text), views (int), category (text), tags (array text), imageUrl (text)
// 2. table 'pages' avec les colonnes : id (text/uuid), title (text), slug (text), content (text), status (text), lastModified (text)