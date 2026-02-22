/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPanel from './pages/AdminPanel';
import AnimatedShorts from './pages/AnimatedShorts';
import ComicViewer from './pages/ComicViewer';
import CoverGenerator from './pages/CoverGenerator';
import CreateComic from './pages/CreateComic';
import Home from './pages/Home';
import MyCharacters from './pages/MyCharacters';
import MyComics from './pages/MyComics';
import MyDrafts from './pages/MyDrafts';
import MyMedia from './pages/MyMedia';
import VideoProjects from './pages/VideoProjects';
import VideoStudio from './pages/VideoStudio';
import Create3DModel from './pages/Create3DModel';
import VoiceLibrary from './pages/VoiceLibrary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPanel": AdminPanel,
    "AnimatedShorts": AnimatedShorts,
    "ComicViewer": ComicViewer,
    "CoverGenerator": CoverGenerator,
    "CreateComic": CreateComic,
    "Home": Home,
    "MyCharacters": MyCharacters,
    "MyComics": MyComics,
    "MyDrafts": MyDrafts,
    "MyMedia": MyMedia,
    "VideoProjects": VideoProjects,
    "VideoStudio": VideoStudio,
    "Create3DModel": Create3DModel,
    "VoiceLibrary": VoiceLibrary,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};