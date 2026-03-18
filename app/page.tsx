'use client';

import { motion, Variants, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Brain, Code, Briefcase, GraduationCap, Play, Eye, Terminal, MessageCircle, Instagram, Mail, Folder, X, Pause, Volume2, VolumeX } from 'lucide-react';

// --- Audio Hook ---
function useCyberSounds() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const hoverAudio = useRef<HTMLAudioElement | null>(null);
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const transitionAudio = useRef<HTMLAudioElement | null>(null);
  const ambientAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      hoverAudio.current = new Audio('/sounds/hover.mp3');
      hoverAudio.current.volume = 0.3;

      clickAudio.current = new Audio('/sounds/click.mp3');
      clickAudio.current.volume = 0.5;

      transitionAudio.current = new Audio('/sounds/transition.mp3');
      transitionAudio.current.volume = 0.4;
      
      ambientAudio.current = new Audio('/sounds/ambient.mp3');
      ambientAudio.current.volume = 0.15;
      ambientAudio.current.loop = true;
    }
    
    return () => {
      if (ambientAudio.current) {
        ambientAudio.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (isAudioEnabled && ambientAudio.current) {
      ambientAudio.current.play().catch(() => {
        // Handle autoplay restrictions if any
        setIsAudioEnabled(false);
      });
    } else if (!isAudioEnabled && ambientAudio.current) {
      ambientAudio.current.pause();
    }
  }, [isAudioEnabled]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
  }, []);

  const turnOnAudio = useCallback(() => {
    setIsAudioEnabled(true);
    if (ambientAudio.current) {
      ambientAudio.current.play().catch(() => {});
    }
  }, []);

  const playHover = useCallback(() => {
    if (isAudioEnabled && hoverAudio.current) {
      hoverAudio.current.currentTime = 0;
      hoverAudio.current.play().catch(() => {});
    }
  }, [isAudioEnabled]);

  const playClick = useCallback(() => {
    if (isAudioEnabled && clickAudio.current) {
      clickAudio.current.currentTime = 0;
      clickAudio.current.play().catch(() => {});
    }
  }, [isAudioEnabled]);

  const playTransition = useCallback(() => {
    if (isAudioEnabled && transitionAudio.current) {
      transitionAudio.current.currentTime = 0;
      transitionAudio.current.play().catch(() => {});
    }
  }, [isAudioEnabled]);

  return { isAudioEnabled, toggleAudio, turnOnAudio, playHover, playClick, playTransition };
}

const navItems = [
  { id: 'HOME', label: '00. ACCUEIL' },
  { id: 'PROJETS', label: '01. PROJETS' },
  { id: 'COMPETENCES', label: '02. COMPÉTENCES' },
  { id: 'TRANSMISSION', label: '03. TRANSMISSION' }
];

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || '';
const FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || '';

async function fetchDriveFolder(folderId: string) {
  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)&pageSize=100`;
    const res = await fetch(url);
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error("Drive Sync Error:", error);
    return [];
  }
}

const skillsData = [
  {
    id: 'ai',
    title: 'INTELLIGENCE ARTIFICIELLE & CRÉATION DIGITALE',
    icon: Brain,
    items: [
      { label: 'Génération Vidéo & Image', desc: 'Conception de scénarios, CGI, production de visuels ultra-réalistes et création de contenu viral (Instagram/TikTok).' },
      { label: 'Prompt Engineering Expert', desc: 'Structuration avancée de requêtes, contrôle précis du style visuel et des voix (adaptations linguistiques : français, arabe, dialecte).' },
      { label: 'Création de Personnages Virtuels', desc: 'Développement complet (identité visuelle, personnalité narrative, storytelling) pour le marketing digital et le branding.' },
      { label: 'Vision IA', desc: 'Exploiter les modèles génératifs comme leviers de création et d\'entrepreneuriat digital.' }
    ]
  },
  {
    id: 'dev',
    title: 'DÉVELOPPEMENT LOGICIEL & AUTOMATISATION',
    icon: Code,
    items: [
      { label: 'Logiciel de Gestion de Stock (Python)', desc: 'Création d\'une application hors ligne. Dashboard complet, gestion des flux (entrées/sorties), inventaire automatisé, analyse des données.' },
      { label: 'Écosystème Web Restaurant', desc: 'Développement d\'une plateforme avec réservation, commandes, et système de fidélité gamifié (HTML, CSS, JS, Firebase).' }
    ]
  },
  {
    id: 'management',
    title: 'MANAGEMENT OPÉRATIONNEL & FINANCE',
    icon: Briefcase,
    items: [
      { label: 'Directeur de l\'Approvisionnement & Gestionnaire', desc: '(Al Afia Catering, depuis Nov. 2025).' },
      { label: 'Gestionnaire des Stocks', desc: '(Hicham Cook, Juin-Nov 2025) : Pilotage logistique et contrôle financier.' },
      { label: 'Terrain (6+ ans)', desc: 'Contrôleur de gestion, caissier, chef de rang (Al Boustan). Excellente gestion de la pression et optimisation des processus.' }
    ]
  },
  {
    id: 'academic',
    title: 'FORMATION ACADÉMIQUE',
    icon: GraduationCap,
    items: [
      { label: 'Master Finance et Économie d\'Entreprise', desc: '(En cours).' },
      { label: 'Licence Économie et Gestion des Entreprises', desc: '(2024).' },
      { label: 'Manager d\'Entreprise', desc: '(Diplôme CEEF, accrédité OIT Genève, 2022).' },
      { label: 'Certifications', desc: 'Superviseur HSE, GRH, Création d\'entreprise, PNL.' }
    ]
  }
];

// --- 3D Components ---

function NeuralNetwork() {
  const count = 3000;
  const mesh = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorWhite = new THREE.Color('#ffffff');
    const colorCyan = new THREE.Color('#00d1ff');

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line react-hooks/purity
      positions[i * 3] = (Math.random() - 0.5) * 40; // X
      // eslint-disable-next-line react-hooks/purity
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // Y
      // eslint-disable-next-line react-hooks/purity
      positions[i * 3 + 2] = 5 - Math.random() * 60; // Z

      // eslint-disable-next-line react-hooks/purity
      const mixedColor = Math.random() > 0.7 ? colorCyan : colorWhite;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return [positions, colors];
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.z += 0.0005;

    const container = document.getElementById('projects-scroll-container');
    let scrollProgress = 0;
    if (container && container.scrollHeight > container.clientHeight) {
      scrollProgress = container.scrollTop / (container.scrollHeight - container.clientHeight);
    }

    const targetZ = 5 - scrollProgress * 55;
    // eslint-disable-next-line react-hooks/immutability
    camera.position.z += (targetZ - camera.position.z) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" count={count} args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function MediaFile({ file, onClick, playHover }: { file: any, onClick: () => void, playHover: () => void }) {
  const [hasError, setHasError] = useState(false);
  const isVideo = file.mimeType && file.mimeType.startsWith('video/');
  
  // Use lh3.googleusercontent.com for both image and video thumbnails to bypass 403
  const previewSrc = `https://lh3.googleusercontent.com/u/0/d/${file.id}=w1000?authuser=0`;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border border-[#00d1ff]/30 bg-black/50 group cursor-pointer w-full h-full min-h-[200px]`}
      onMouseEnter={playHover}
      onClick={onClick}
    >
      {/* CCTV Effect Overlay - ONLY on the thumbnail */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-70 mix-blend-overlay bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,209,255,0.3)_2px,rgba(0,209,255,0.3)_4px)]" />
      <div className="absolute inset-0 z-10 pointer-events-none opacity-30 bg-noise mix-blend-screen" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-blue-900/20 mix-blend-color" />

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <span className="text-red-500 font-mono tracking-widest animate-pulse text-xl drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
            [ DATA_CORRUPTED ]
          </span>
        </div>
      ) : (
        <img 
          src={previewSrc} 
          alt={file.name} 
          onError={() => setHasError(true)}
          className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 contrast-125 brightness-75 hue-rotate-180" 
        />
      )}
      
      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
        {isVideo ? <Play size={48} className="text-[#00d1ff] drop-shadow-[0_0_15px_rgba(0,209,255,0.8)]" /> : <Eye size={48} className="text-[#00d1ff] drop-shadow-[0_0_15px_rgba(0,209,255,0.8)]" />}
      </div>
    </div>
  );
}

function Portal({ direction, onClick, onHover }: { direction: 'left' | 'right', onClick: () => void, onHover: () => void }) {
  const isLeft = direction === 'left';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} w-16 md:w-24 h-full z-50 cursor-pointer group flex items-center justify-center`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => { onHover(); setIsHovered(true); }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Neon Line */}
      <div className={`absolute ${isLeft ? 'left-0' : 'right-0'} top-0 w-[2px] h-full bg-[#00d1ff]/20 group-hover:bg-[#00d1ff] transition-colors duration-300 shadow-[0_0_15px_rgba(0,209,255,0.8)]`} />
      
      {/* Glitch Effect on Line */}
      <motion.div 
        animate={isHovered ? { y: [0, 200, -100, 300, 0], opacity: [0, 1, 0, 1, 0] } : { opacity: 0 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
        className={`absolute ${isLeft ? 'left-0' : 'right-0'} top-1/2 w-[2px] h-32 bg-white`} 
      />

      {/* Chevron (Particles simulation) */}
      <div className="relative flex flex-col items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
        {[...Array(7)].map((_, i) => (
          <motion.div 
            key={i} 
            animate={isHovered ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 1 - Math.abs(3 - i) * 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#00d1ff] rounded-full shadow-[0_0_10px_rgba(0,209,255,1)]"
            style={{
              transform: `translateX(${isLeft ? Math.abs(3 - i) * 6 : -Math.abs(3 - i) * 6}px)`,
            }}
          />
        ))}
      </div>

      {/* Data Stream Wave */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ x: 0, opacity: 0, scaleX: 0 }}
            animate={{ x: isLeft ? 200 : -200, opacity: [0, 1, 0], scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
            className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-8 origin-left' : 'right-8 origin-right'} w-64 h-[1px] bg-gradient-to-r ${isLeft ? 'from-[#00d1ff] to-transparent' : 'from-transparent to-[#00d1ff]'}`} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NexusVideoPlayer({ fileId, playHover, playClick }: { fileId: string, playHover: () => void, playClick: () => void }) {
  const src = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
  const [isBuffering, setIsBuffering] = useState(true);
  const [hdMode, setHdMode] = useState(false);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 group pointer-events-auto">
      {/* Tech Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 md:w-16 md:h-16 border-t-2 border-l-2 border-[#00d1ff] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-8 h-8 md:w-16 md:h-16 border-t-2 border-r-2 border-[#00d1ff] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-8 h-8 md:w-16 md:h-16 border-b-2 border-l-2 border-[#00d1ff] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 right-0 w-8 h-8 md:w-16 md:h-16 border-b-2 border-r-2 border-[#00d1ff] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Video Container */}
      <div className="relative w-full h-full bg-black overflow-hidden shadow-[0_0_30px_rgba(0,209,255,0.2)]">
        <video
          key={fileId}
          src={src}
          autoPlay
          muted={true}
          loop
          playsInline
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
        />
        
        {/* CCTV Overlay */}
        {!hdMode && (
          <>
            <div className="absolute inset-0 z-10 pointer-events-none opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,209,255,0.3)_2px,rgba(0,209,255,0.3)_4px)]" />
            <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-noise mix-blend-screen" />
          </>
        )}

        {/* Buffering State */}
        {isBuffering && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="font-mono text-sm tracking-widest text-[#00d1ff] animate-pulse">
              [ DECRYPTING_DATA_STREAM... ]
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center z-30">
          <div className="font-mono text-[10px] text-[#00d1ff] animate-pulse">
            [ DATA_STREAM: {isBuffering ? 'DECRYPTING' : 'ACTIVE'} ]
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); playClick(); setHdMode(!hdMode); }}
            onMouseEnter={playHover}
            className={`font-mono text-xs px-3 py-1 border transition-colors ${hdMode ? 'border-white text-white bg-white/20' : 'border-[#00d1ff] text-[#00d1ff] hover:bg-[#00d1ff]/20'}`}
          >
            [ HD_MODE: {hdMode ? 'ON' : 'OFF'} ]
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectsUI({ 
  contents, 
  isSyncing, 
  currentFolderName, 
  isRoot, 
  onFolderClick, 
  onBackClick, 
  playHover, 
  playClick, 
  playTransition 
}: { 
  contents: any[], 
  isSyncing: boolean, 
  currentFolderName: string, 
  isRoot: boolean, 
  onFolderClick: (id: string, name: string) => void, 
  onBackClick: () => void, 
  playHover: () => void, 
  playClick: () => void, 
  playTransition: () => void 
}) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const folders = contents.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const files = contents.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

  const handleMediaClick = (index: number) => {
    playClick();
    setDirection(0);
    setFullscreenIndex(index);
  };

  const closeFullscreen = () => {
    playClick();
    setFullscreenIndex(null);
  };

  const handleNext = useCallback(() => {
    if (fullscreenIndex === null) return;
    playClick();
    setDirection(1);
    setFullscreenIndex((prev) => (prev! + 1) % files.length);
  }, [fullscreenIndex, files.length, playClick]);

  const handlePrev = useCallback(() => {
    if (fullscreenIndex === null) return;
    playClick();
    setDirection(-1);
    setFullscreenIndex((prev) => (prev! - 1 + files.length) % files.length);
  }, [fullscreenIndex, files.length, playClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeFullscreen();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex, handleNext, handlePrev]);

  const glitchSlideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : direction < 0 ? -200 : 0,
      opacity: 0,
      filter: 'blur(8px) contrast(150%) grayscale(100%)',
      clipPath: direction > 0 ? 'inset(0 100% 0 0)' : direction < 0 ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px) contrast(100%) grayscale(0%)',
      clipPath: 'inset(0 0% 0 0)',
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as any
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : direction > 0 ? -200 : 0,
      opacity: 0,
      filter: 'blur(8px) contrast(150%) grayscale(100%)',
      clipPath: direction < 0 ? 'inset(0 100% 0 0)' : direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)',
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as any
      }
    })
  };

  const renderFullscreenMedia = (file: any) => {
    if (!file) return null;
    const isVideo = file.mimeType && file.mimeType.startsWith('video/');
    const imgSrc = `https://lh3.googleusercontent.com/u/0/d/${file.id}=w1000?authuser=0`;

    return (
      <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
        {isVideo ? (
          <NexusVideoPlayer fileId={file.id} playHover={playHover} playClick={playClick} />
        ) : (
          <img src={imgSrc} alt={file.name} className="max-w-full max-h-full object-contain rounded-2xl border border-[#00d1ff]/50 shadow-[0_0_50px_rgba(0,209,255,0.3)] animate-pulse" />
        )}
        {/* Scanline overlay for the transition effect (fades out) */}
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,209,255,0.2)_2px,rgba(0,209,255,0.2)_4px)] mix-blend-overlay rounded-2xl"
        />
      </div>
    );
  };

  return (
    <motion.div
      key="PROJETS"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      id="projects-scroll-container"
      className="fixed inset-0 z-20 w-full h-full overflow-y-auto pointer-events-auto scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#00d1ff]/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#00d1ff]/80"
    >
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 pt-[20vh] pb-[20vh] min-h-screen">
        
        {isSyncing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#00d1ff] font-mono tracking-widest text-lg drop-shadow-[0_0_8px_rgba(0,209,255,0.8)] mt-[20vh]"
          >
            [ SYNCHRONIZING WITH NEURAL_DRIVE... ]
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {isRoot && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#00d1ff] font-mono tracking-widest text-xl md:text-3xl drop-shadow-[0_0_8px_rgba(0,209,255,0.8)] mb-16 text-center"
              >
                NEURAL_DRIVE // ROOT
              </motion.div>
            )}

            {!isRoot && (
              <div className="flex items-center justify-between mb-8 w-full z-30 relative">
                <button
                  onMouseEnter={playHover}
                  onClick={onBackClick}
                  className="flex items-center gap-2 text-[#00d1ff] font-mono tracking-widest hover:text-white transition-colors group relative bg-black/40 px-4 py-2 rounded-lg border border-[#00d1ff]/30 hover:border-[#00d1ff] hover:shadow-[0_0_15px_rgba(0,209,255,0.5)]"
                >
                  <span className="text-xl group-hover:-translate-x-2 transition-transform">←</span>
                  <span className="relative inline-block group-hover:animate-pulse group-hover:before:content-['[_GO_BACK_TO_PREVIOUS_LEVEL_]'] group-hover:before:absolute group-hover:before:left-[2px] group-hover:before:text-red-500 group-hover:before:opacity-70 group-hover:after:content-['[_GO_BACK_TO_PREVIOUS_LEVEL_]'] group-hover:after:absolute group-hover:after:-left-[2px] group-hover:after:text-blue-500 group-hover:after:opacity-70">
                    [ GO_BACK_TO_PREVIOUS_LEVEL ]
                  </span>
                </button>
                <h2 className="font-mono text-2xl text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                  /{currentFolderName}
                </h2>
              </div>
            )}
            
            {folders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 w-full mb-12">
                {folders.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: [0, -10, 0],
                      rotate: [-2, 2, -2]
                    }}
                    transition={{ 
                      opacity: { duration: 0.5, delay: idx * 0.1 },
                      scale: { duration: 0.5, delay: idx * 0.1 },
                      y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                      rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                    }}
                    whileHover={{ 
                      scale: 1.2, 
                      x: [0, -2, 2, 0],
                      transition: { x: { repeat: Infinity, duration: 0.2 } }
                    }}
                    onMouseEnter={playHover}
                    onClick={() => onFolderClick(item.id, item.name)}
                    className="flex flex-col items-center gap-4 cursor-pointer group"
                  >
                    <div className="relative p-8 rounded-2xl bg-[#00d1ff]/5 border border-[#00d1ff]/20 group-hover:bg-[#00d1ff]/20 group-hover:border-[#00d1ff]/60 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,209,255,0.4)]">
                      <Folder size={64} className="text-[#00d1ff] opacity-80 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_0_10px_rgba(0,209,255,0.5)]" />
                      <div className="absolute inset-0 bg-[#00d1ff]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <span className="font-mono text-sm text-gray-300 group-hover:text-white text-center tracking-wider transition-colors">
                      {item.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className={`grid gap-6 w-full ${files.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'} h-[70vh]`}>
                {files.map((file, index) => {
                  const isVideo = file.mimeType && file.mimeType.startsWith('video/');
                  
                  return (
                    <MediaFile 
                      key={file.id} 
                      file={file} 
                      onClick={() => handleMediaClick(index)} 
                      playHover={playHover} 
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN MEDIA PLAYER */}
      <AnimatePresence>
        {fullscreenIndex !== null && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 overflow-hidden"
            onClick={closeFullscreen}
          >
            {/* Portails de Transfert */}
            <Portal direction="left" onClick={handlePrev} onHover={playHover} />
            <Portal direction="right" onClick={handleNext} onHover={playHover} />

            {/* Close Button */}
            <button 
              className="absolute top-8 right-8 text-[#00d1ff] font-mono text-sm tracking-widest hover:text-white transition-colors z-[1050] group flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); closeFullscreen(); }}
              onMouseEnter={playHover}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <X size={20} className="relative z-10" />
                <div className="absolute inset-0 border border-[#00d1ff] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[spin_2s_linear_infinite] border-dashed" />
              </div>
              [ CLOSE_INTERFACE ]
            </button>

            {/* Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.3em] text-[#00d1ff] z-[1050] drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]">
              [ DATA_STREAM_UNIT: {fullscreenIndex + 1} / {files.length} ]
            </div>

            {/* Media Container */}
            <div 
              className="relative w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center pointer-events-none px-20"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={fullscreenIndex}
                  custom={direction}
                  variants={glitchSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {renderFullscreenMedia(files[fullscreenIndex])}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Scene({ activeSection }: { activeSection: string }) {
  const { camera } = useThree();

  useEffect(() => {
    if (activeSection !== 'PROJETS') {
      camera.position.set(0, 0, 5);
      camera.rotation.set(0, 0, 0);
    }
  }, [activeSection, camera]);

  const isProjets = activeSection === 'PROJETS';

  return (
    <>
      {isProjets ? (
        <NeuralNetwork />
      ) : (
        <>
          <Particles />
          <Core />
        </>
      )}
    </>
  );
}

function Particles() {
  const count = 800;
  const mesh = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorWhite = new THREE.Color('#ffffff');
    const colorCyan = new THREE.Color('#00d1ff');

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line react-hooks/purity
      positions[i * 3] = (Math.random() - 0.5) * 25;
      // eslint-disable-next-line react-hooks/purity
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      // eslint-disable-next-line react-hooks/purity
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;

      // eslint-disable-next-line react-hooks/purity
      const mixedColor = Math.random() > 0.7 ? colorCyan : colorWhite;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return [positions, colors];
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    // Slow rotation
    mesh.current.rotation.y += 0.0005;
    mesh.current.rotation.x += 0.0002;

    // Mouse parallax
    const targetX = mouse.current.x * 2;
    const targetY = mouse.current.y * 2;
    
    mesh.current.position.x += (targetX - mesh.current.position.x) * 0.02;
    mesh.current.position.y += (targetY - mesh.current.position.y) * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" count={count} args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.x += 0.002;
    mesh.current.rotation.y += 0.005;
  });

  // Position it on the left, slightly behind the menu
  const xPos = -viewport.width / 4;

  return (
    <mesh ref={mesh} position={[xPos, 0, -2]}>
      <icosahedronGeometry args={[2.5, 1]} />
      <meshBasicMaterial color="#00d1ff" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

// --- UI Components ---

function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative w-fit"
    >
      {children}
    </motion.div>
  );
}

export default function NexusPortfolio() {
  const [isBooted, setIsBooted] = useState(false);
  const [activeSection, setActiveSection] = useState('HOME');
  const { isAudioEnabled, toggleAudio, turnOnAudio, playHover, playClick, playTransition } = useCyberSounds();
  const [isSyncing, setIsSyncing] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState(FOLDER_ID);
  const [folderHistory, setFolderHistory] = useState<{id: string, name: string}[]>([]);
  const [currentContents, setCurrentContents] = useState<any[]>([]);
  const [currentFolderName, setCurrentFolderName] = useState('ROOT');

  useEffect(() => {
    let isMounted = true;
    setIsSyncing(true);
    fetchDriveFolder(currentFolderId).then(files => {
      if (isMounted) {
        setCurrentContents(files);
        setIsSyncing(false);
      }
    });
    return () => { isMounted = false; };
  }, [currentFolderId]);

  const handleFolderClick = (folderId: string, folderName: string) => {
    playClick();
    playTransition();
    setFolderHistory(prev => [...prev, { id: currentFolderId, name: currentFolderName }]);
    setCurrentFolderId(folderId);
    setCurrentFolderName(folderName);
  };

  const handleBackClick = () => {
    if (folderHistory.length === 0) return;
    playClick();
    playTransition();
    const newHistory = [...folderHistory];
    const prevFolder = newHistory.pop();
    setFolderHistory(newHistory);
    if (prevFolder) {
      setCurrentFolderId(prevFolder.id);
      setCurrentFolderName(prevFolder.name);
    }
  };

  // Trigger transition sound on section change
  useEffect(() => {
    playTransition();
  }, [activeSection, playTransition]);

  // Staggered fade-in for the main layout
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: 'easeOut' } 
    },
  };

  // Cybernetic entry/exit animations for sections
  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: 40, filter: 'blur(8px)', scale: 0.98 },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { 
      opacity: 0, 
      x: -40, 
      filter: 'blur(8px)',
      scale: 0.98,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5 } }
  };

  return (
    <main className="relative h-screen w-full overflow-hidden font-sans text-white">
      {/* SPLASH SCREEN */}
      <AnimatePresence>
        {!isBooted && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px) contrast(200%)', scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-12 font-mono text-5xl md:text-7xl font-bold text-[#00d1ff] tracking-widest drop-shadow-[0_0_20px_rgba(0,209,255,0.8)]"
            >
              NEXUS_OS
            </motion.div>
            <button
              onClick={() => {
                turnOnAudio();
                playClick();
                setIsBooted(true);
                // Preload videos
                currentContents.filter(f => f.mimeType?.startsWith('video/')).forEach(file => {
                  const v = document.createElement('video');
                  v.src = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
                  v.preload = 'auto';
                  v.load();
                });
              }}
              onMouseEnter={playHover}
              className="group relative overflow-hidden border border-[#00d1ff]/50 bg-[#00d1ff]/10 px-8 py-4 font-mono text-sm tracking-widest text-[#00d1ff] transition-all hover:bg-[#00d1ff]/20 hover:shadow-[0_0_30px_rgba(0,209,255,0.6)]"
            >
              <span className="relative z-10">[ INITIALIZE_SYSTEM ]</span>
              <div className="absolute inset-0 h-full w-0 bg-[#00d1ff]/20 transition-all duration-300 ease-out group-hover:w-full" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src="/nexus-bg.mp4"
      />
      {/* Dark Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

      {/* 3D Canvas Layer */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Scene activeSection={activeSection} />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <motion.div
        className="relative z-20 flex h-full w-full p-8 md:p-16 pointer-events-none"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column: Header, Nav, Footer */}
        <div className="flex h-full flex-col justify-between w-full md:w-1/3 min-w-[280px] relative z-[100] pointer-events-none">
          {/* Header (Top Left) */}
          <motion.header variants={itemVariants} className="pointer-events-auto w-fit">
            <h1 className="font-mono text-xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,209,255,0.8)]">
              SI FODIL TAKFARINAS // NEXUS OS
            </h1>
          </motion.header>

          {/* Navigation (Middle Left) */}
          <motion.nav variants={itemVariants} className="flex flex-col gap-8 pointer-events-auto w-fit">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onMouseEnter={playHover}
                  onClick={() => {
                    playClick();
                    setActiveSection(item.id);
                  }}
                  className="group relative flex flex-col items-start text-left font-mono text-sm tracking-[0.2em] text-gray-400 transition-colors duration-300 hover:text-[#00d1ff] hover:drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]"
                  whileHover="hover"
                  initial="initial"
                  animate="initial"
                >
                  <span className={isActive ? 'text-[#00d1ff] drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]' : ''}>
                    {item.label}
                  </span>
                  <motion.div
                    variants={{
                      initial: { width: isActive ? 40 : 0 },
                      hover: { width: 40 },
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-2 h-[2px] bg-[#00d1ff] shadow-[0_0_8px_rgba(0,209,255,0.8)]"
                  />
                </motion.button>
              );
            })}
          </motion.nav>

          {/* Footer (Bottom Left) */}
          <motion.footer variants={itemVariants} className="flex items-center gap-3 font-mono text-xs tracking-wider text-gray-400 pointer-events-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isSyncing ? 'bg-yellow-400' : 'bg-green-400'} opacity-75`}></span>
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isSyncing ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            </span>
            SYSTEM_STATUS: ONLINE // DRIVE_SYNC: {isSyncing ? 'IN_PROGRESS' : 'OK'}
          </motion.footer>
        </div>

        {/* Contact Dock (Bottom Center) */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 pointer-events-auto"
        >
          <a href="https://wa.me/213776371454" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00d1ff] transition-all duration-300 hover:scale-110 hover:animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_10px_rgba(0,209,255,0.8)]">
            <MessageCircle size={24} />
          </a>
          <a href="https://instagram.com/Takfa015" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00d1ff] transition-all duration-300 hover:scale-110 hover:animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_10px_rgba(0,209,255,0.8)]">
            <Instagram size={24} />
          </a>
          <a href="mailto:sif.takfa@gmail.com" className="text-white hover:text-[#00d1ff] transition-all duration-300 hover:scale-110 hover:animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_10px_rgba(0,209,255,0.8)]">
            <Mail size={24} />
          </a>
        </motion.div>

        {/* Audio Toggle (Bottom Right) */}
        <motion.button
          variants={itemVariants}
          onClick={toggleAudio}
          className="fixed bottom-8 right-8 md:bottom-16 md:right-16 z-[9999] flex items-center gap-2 font-mono text-xs tracking-widest text-gray-400 hover:text-[#00d1ff] transition-colors pointer-events-auto bg-black/50 px-4 py-2 rounded-full border border-white/10 hover:border-[#00d1ff]/50 backdrop-blur-md"
        >
          <span className={`h-2 w-2 rounded-full ${isAudioEnabled ? 'bg-[#00d1ff] shadow-[0_0_8px_rgba(0,209,255,0.8)]' : 'bg-gray-600'}`} />
          AUDIO: {isAudioEnabled ? 'ON' : 'OFF'}
        </motion.button>

        {/* Central Zone (Content) */}
        {/* Central Zone (Content) - DESKTOP UNIQUEMENT */}
        <div className="hidden md:flex flex-1 flex-col justify-center pl-8 lg:pl-16 pointer-events-none" style={{ perspective: 1000 }}>
          <AnimatePresence mode="wait">

            {/* HOME SECTION */}
            {activeSection === 'HOME' && (
              <motion.div key="HOME" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl pointer-events-auto">
                <TiltCard>
                  <h1 className="mb-6 font-sans text-5xl lg:text-7xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,209,255,0.8)] leading-tight uppercase">
                    SI FODIL TAKFARINAS
                  </h1>
                </TiltCard>
                <TiltCard>
                  <h2 className="mb-6 font-sans text-3xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg leading-tight">
                    ARCHITECTE DE<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">SOLUTIONS AUGMENTÉES</span>
                  </h2>
                </TiltCard>
                <TiltCard>
                  <p className="font-mono text-lg lg:text-xl text-[#00d1ff] drop-shadow-[0_0_8px_rgba(0,209,255,0.5)] max-w-2xl leading-relaxed mt-6">
                    Spécialiste en économie, gestion et intelligence artificielle
                  </p>
                </TiltCard>
              </motion.div>
            )}

            {/* PROJETS SECTION */}
            {activeSection === 'PROJETS' && (
              <ProjectsUI contents={currentContents} isSyncing={isSyncing} currentFolderName={currentFolderName} isRoot={currentFolderId === FOLDER_ID} onFolderClick={handleFolderClick} onBackClick={handleBackClick} playHover={playHover} playClick={playClick} playTransition={playTransition} />
            )}

            {/* COMPETENCES SECTION */}
            {activeSection === 'COMPETENCES' && (
              <motion.div key="COMPETENCES" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="w-full h-full max-h-[80vh] pointer-events-auto flex flex-col gap-6 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#00d1ff]/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#00d1ff]/80">
                <h2 className="font-mono text-2xl text-white mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] shrink-0">BASE DE DONNÉES // COMPÉTENCES & PARCOURS</h2>
                <motion.div variants={listVariants} initial="hidden" animate="visible" className="flex flex-col gap-6 pb-8">
                  {skillsData.map((category) => {
                    const Icon = category.icon;
                    return (
                      <motion.div key={category.id} variants={cardVariants} className="group rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md transition-all duration-500 hover:border-[#00d1ff]/50 hover:bg-black/60 hover:shadow-[0_0_15px_rgba(0,209,255,0.15)]">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 rounded-lg bg-white/5 text-[#00d1ff] group-hover:bg-[#00d1ff]/20 transition-all duration-300"><Icon size={24} /></div>
                          <h3 className="font-mono text-lg font-bold text-white tracking-wider group-hover:text-[#00d1ff] transition-all duration-300">{category.title}</h3>
                        </div>
                        <ul className="flex flex-col gap-3 pl-2">
                          {category.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00d1ff]/50 group-hover:bg-[#00d1ff] transition-colors duration-300" />
                              <p className="font-sans text-sm text-gray-300 leading-relaxed">
                                <strong className="text-white font-medium">{item.label}</strong>
                                {item.desc ? ` : ${item.desc}` : ''}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </motion.div>
                <motion.div variants={cardVariants} className="mt-4 pb-12">
                  <h3 className="font-mono text-xl text-white mb-6">TECHNOLOGIES_LOG //</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Python', 'Next.js', 'Tailwind CSS', 'Firebase', 'AI Video Generation (Runway/Luma)', 'Prompt Engineering', 'Office 365'].map((tech, idx) => (
                      <span key={idx} className="font-mono text-xs text-gray-300 border border-white/20 bg-black/40 px-4 py-2 rounded-sm transition-all duration-300 hover:border-[#00d1ff]/80 hover:text-[#00d1ff] cursor-default">{tech}</span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* TRANSMISSION SECTION */}
            {activeSection === 'TRANSMISSION' && (
              <motion.div key="TRANSMISSION" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-2xl pointer-events-auto rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-[#00d1ff]/50" />
                <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-[#00d1ff]/50" />
                <h2 className="font-mono text-2xl text-white mb-6">CANAL DE TRANSMISSION</h2>
                <div className="mb-8 flex flex-col gap-4 font-mono text-sm text-gray-300">
                  <a href="https://wa.me/213776371454" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#00d1ff] transition-colors w-fit"><MessageCircle size={18} className="text-[#00d1ff]"/> +213 776 37 14 54</a>
                  <a href="mailto:sif.takfa@gmail.com" className="flex items-center gap-3 hover:text-[#00d1ff] transition-colors w-fit"><Mail size={18} className="text-[#00d1ff]"/> sif.takfa@gmail.com</a>
                  <a href="https://instagram.com/Takfa015" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#00d1ff] transition-colors w-fit"><Instagram size={18} className="text-[#00d1ff]"/> @Takfa015</a>
                </div>
                <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <input type="text" placeholder="IDENTIFIANT (Nom)" className="peer w-full rounded-none border-b border-white/20 bg-transparent py-3 font-mono text-sm text-white placeholder-transparent focus:border-[#00d1ff] focus:outline-none focus:ring-0 transition-colors" />
                    <label className="absolute left-0 -top-3.5 font-mono text-[10px] text-[#00d1ff] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#00d1ff]">IDENTIFIANT (Nom)</label>
                  </div>
                  <div className="relative mt-2">
                    <input type="text" placeholder="RÉSEAU / EMAIL" className="peer w-full rounded-none border-b border-white/20 bg-transparent py-3 font-mono text-sm text-white placeholder-transparent focus:border-[#00d1ff] focus:outline-none focus:ring-0 transition-colors" />
                    <label className="absolute left-0 -top-3.5 font-mono text-[10px] text-[#00d1ff] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#00d1ff]">RÉSEAU / EMAIL</label>
                  </div>
                  <div className="relative mt-2">
                    <textarea placeholder="MESSAGE_PAYLOAD" rows={4} className="peer w-full rounded-none border-b border-white/20 bg-transparent py-3 font-mono text-sm text-white placeholder-transparent focus:border-[#00d1ff] focus:outline-none focus:ring-0 transition-colors resize-none" />
                    <label className="absolute left-0 -top-3.5 font-mono text-[10px] text-[#00d1ff] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#00d1ff]">MESSAGE_PAYLOAD</label>
                  </div>
                  <button onMouseEnter={playHover} onClick={playClick} className="group relative mt-6 overflow-hidden border border-[#00d1ff]/50 bg-[#00d1ff]/10 py-4 font-mono text-sm tracking-widest text-[#00d1ff] transition-all hover:bg-[#00d1ff]/20 hover:shadow-[0_0_20px_rgba(0,209,255,0.6)]">
                    <span className="relative z-10">INITIALISER LE TRANSFERT</span>
                    <div className="absolute inset-0 h-full w-0 bg-[#00d1ff]/20 transition-all duration-300 ease-out group-hover:w-full" />
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* ===================================================== */}
      {/* MOBILE LAYOUT — visible uniquement en dessous de md   */}
      {/* ===================================================== */}
      <AnimatePresence>
        {isBooted && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:hidden fixed inset-0 z-30 overflow-y-auto pointer-events-auto"
          >
            {/* Barre de navigation mobile sticky */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-black/85 backdrop-blur-md border-b border-[#00d1ff]/20">
              <span className="font-mono text-xs text-[#00d1ff] tracking-widest">NEXUS_OS</span>
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { playClick(); setActiveSection(item.id); }}
                    className={`px-2 py-1 font-mono text-[9px] tracking-widest rounded transition-all ${
                      activeSection === item.id
                        ? 'bg-[#00d1ff]/20 text-[#00d1ff] border border-[#00d1ff]/60'
                        : 'text-gray-400 border border-transparent'
                    }`}
                  >
                    {item.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu des sections */}
            <div className="px-4 pt-6 pb-32 min-h-screen">
              <AnimatePresence mode="wait">

                {/* HOME MOBILE */}
                {activeSection === 'HOME' && (
                  <motion.div key="HOME-mobile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5 pt-2">
                    <h1 className="font-sans text-3xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,209,255,0.8)] leading-tight uppercase">
                      SI FODIL<br />TAKFARINAS
                    </h1>
                    <h2 className="font-sans text-xl font-bold text-white leading-tight">
                      ARCHITECTE DE<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">SOLUTIONS AUGMENTÉES</span>
                    </h2>
                    <p className="font-mono text-sm text-[#00d1ff] leading-relaxed">
                      Spécialiste en économie, gestion et intelligence artificielle
                    </p>
                    <div className="flex flex-col gap-3 mt-3 pt-4 border-t border-white/10">
                      <p className="font-mono text-[10px] text-gray-500 tracking-widest">CONTACTS DIRECTS</p>
                      <a href="https://wa.me/213776371454" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-[#00d1ff] transition-colors font-mono text-sm">
                        <MessageCircle size={16} className="text-[#00d1ff]" /> +213 776 37 14 54
                      </a>
                      <a href="mailto:sif.takfa@gmail.com" className="flex items-center gap-3 text-gray-300 hover:text-[#00d1ff] transition-colors font-mono text-sm">
                        <Mail size={16} className="text-[#00d1ff]" /> sif.takfa@gmail.com
                      </a>
                      <a href="https://instagram.com/Takfa015" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-[#00d1ff] transition-colors font-mono text-sm">
                        <Instagram size={16} className="text-[#00d1ff]" /> @Takfa015
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* PROJETS MOBILE */}
                {activeSection === 'PROJETS' && (
                  <motion.div key="PROJETS-mobile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                    <ProjectsUI contents={currentContents} isSyncing={isSyncing} currentFolderName={currentFolderName} isRoot={currentFolderId === FOLDER_ID} onFolderClick={handleFolderClick} onBackClick={handleBackClick} playHover={playHover} playClick={playClick} playTransition={playTransition} />
                  </motion.div>
                )}

                {/* COMPETENCES MOBILE */}
                {activeSection === 'COMPETENCES' && (
                  <motion.div key="COMPETENCES-mobile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4">
                    <h2 className="font-mono text-sm text-white tracking-widest">COMPÉTENCES & PARCOURS</h2>
                    {skillsData.map((category) => {
                      const Icon = category.icon;
                      return (
                        <div key={category.id} className="rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-1.5 rounded-lg bg-white/5 text-[#00d1ff]"><Icon size={18} /></div>
                            <h3 className="font-mono text-xs font-bold text-white tracking-wider leading-tight">{category.title}</h3>
                          </div>
                          <ul className="flex flex-col gap-2 pl-2">
                            {category.items.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00d1ff]/60" />
                                <p className="font-sans text-xs text-gray-300 leading-relaxed">
                                  <strong className="text-white">{item.label}</strong>
                                  {item.desc ? ` : ${item.desc}` : ''}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                    <div className="mt-2 pb-4">
                      <h3 className="font-mono text-xs text-white mb-3 tracking-widest">TECHNOLOGIES_LOG //</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Python', 'Next.js', 'Tailwind CSS', 'Firebase', 'AI Video Generation', 'Prompt Engineering', 'Office 365'].map((tech, idx) => (
                          <span key={idx} className="font-mono text-[10px] text-gray-300 border border-white/20 bg-black/40 px-3 py-1 rounded-sm">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TRANSMISSION MOBILE */}
                {activeSection === 'TRANSMISSION' && (
                  <motion.div key="TRANSMISSION-mobile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col gap-5">
                    <h2 className="font-mono text-sm text-white tracking-widest">CANAL DE TRANSMISSION</h2>
                    <div className="flex flex-col gap-3 font-mono text-sm text-gray-300 p-4 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md">
                      <a href="https://wa.me/213776371454" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#00d1ff] transition-colors">
                        <MessageCircle size={16} className="text-[#00d1ff]" /> +213 776 37 14 54
                      </a>
                      <a href="mailto:sif.takfa@gmail.com" className="flex items-center gap-3 hover:text-[#00d1ff] transition-colors">
                        <Mail size={16} className="text-[#00d1ff]" /> sif.takfa@gmail.com
                      </a>
                      <a href="https://instagram.com/Takfa015" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#00d1ff] transition-colors">
                        <Instagram size={16} className="text-[#00d1ff]" /> @Takfa015
                      </a>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-[#00d1ff]/50" />
                      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#00d1ff]/50" />
                      <div className="flex flex-col gap-5">
                        <div className="relative">
                          <input type="text" placeholder="IDENTIFIANT (Nom)" className="peer w-full rounded-none border-b border-white/20 bg-transparent py-3 font-mono text-sm text-white placeholder-transparent focus:border-[#00d1ff] focus:outline-none transition-colors" />
                          <label className="absolute left-0 -top-3.5 font-mono text-[10px] text-[#00d1ff] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#00d1ff]">IDENTIFIANT (Nom)</label>
                        </div>
                        <div className="relative mt-2">
                          <input type="text" placeholder="RÉSEAU / EMAIL" className="peer w-full rounded-none border-b border-white/20 bg-transparent py-3 font-mono text-sm text-white placeholder-transparent focus:border-[#00d1ff] focus:outline-none transition-colors" />
                          <label className="absolute left-0 -top-3.5 font-mono text-[10px] text-[#00d1ff] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#00d1ff]">RÉSEAU / EMAIL</label>
                        </div>
                        <div className="relative mt-2">
                          <textarea placeholder="MESSAGE_PAYLOAD" rows={4} className="peer w-full rounded-none border-b border-white/20 bg-transparent py-3 font-mono text-sm text-white placeholder-transparent focus:border-[#00d1ff] focus:outline-none transition-colors resize-none" />
                          <label className="absolute left-0 -top-3.5 font-mono text-[10px] text-[#00d1ff] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#00d1ff]">MESSAGE_PAYLOAD</label>
                        </div>
                        <button onClick={playClick} className="group relative mt-4 overflow-hidden border border-[#00d1ff]/50 bg-[#00d1ff]/10 py-3 font-mono text-xs tracking-widest text-[#00d1ff] transition-all active:bg-[#00d1ff]/20">
                          <span className="relative z-10">INITIALISER LE TRANSFERT</span>
                          <div className="absolute inset-0 h-full w-0 bg-[#00d1ff]/20 transition-all duration-300 ease-out group-hover:w-full" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
