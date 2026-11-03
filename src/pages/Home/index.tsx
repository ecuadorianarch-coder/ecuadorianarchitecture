import React, { useState, useEffect, useMemo } from 'react';
import { Hero } from './Hero';
import { PhysicalCardDeck } from '../../components/home/PhysicalCardDeck';
import { useContent } from '../../context/ContentContext';
import { getDeckProjectsForTab } from '../../data/projectDeckData';

interface HomePageProps {
  onSelectProject?: (projectId: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToSection?: (section: string) => void;
  initialTab?: 'proyectos' | 'academia' | 'territorios' | 'acerca';
  onTabChange?: (tab: 'proyectos' | 'academia' | 'territorios') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProject,
  onNavigateToCatalog,
  onNavigateToSection,
  initialTab = 'proyectos',
  onTabChange,
}) => {
  const [activeDestacadosTab, setActiveDestacadosTab] = useState<'proyectos' | 'academia' | 'territorios'>(
    initialTab === 'acerca' ? 'proyectos' : initialTab
  );

  const { getAllEditorialArticles } = useContent();
  const allArticles = useMemo(() => {
    try {
      return getAllEditorialArticles ? getAllEditorialArticles() : [];
    } catch {
      return [];
    }
  }, [getAllEditorialArticles]);

  const activeDeckProjects = useMemo(() => {
    return getDeckProjectsForTab(activeDestacadosTab, allArticles);
  }, [activeDestacadosTab, allArticles]);

  useEffect(() => {
    if (initialTab && initialTab !== 'acerca') {
      setActiveDestacadosTab(initialTab);
      onTabChange?.(initialTab);
    }
  }, [initialTab, onTabChange]);

  const handleNavigateToSection = (section: string) => {
    if (section === 'acerca' || section === 'acerca-de-ea') {
      if (onNavigateToSection) {
        onNavigateToSection('acerca');
      } else {
        window.location.hash = '#acerca-de-ea';
      }
      return;
    }
    if (section === 'proyectos' || section === 'territorios' || section === 'academia') {
      const validTab = section as 'proyectos' | 'territorios' | 'academia';
      setActiveDestacadosTab(validTab);
      onTabChange?.(validTab);
      const el = document.getElementById('destacados');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById(section) || document.getElementById('destacados');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="w-full min-h-screen bg-white">
      {/* 1. Monumental Centered Editorial Portal (1:1 with Figma) */}
      <Hero
        onNavigateToCatalog={onNavigateToCatalog}
        onNavigateToSection={handleNavigateToSection}
        onSelectProject={onSelectProject}
        onSearch={(_q) => {
          if (onNavigateToCatalog) onNavigateToCatalog();
        }}
      />

      {/* 2. Destacados Editorial Section: Mazo Físico Unificado (Proyectos, Territorios y Academia) */}
      <PhysicalCardDeck
        projects={activeDeckProjects}
        activeTab={activeDestacadosTab}
        onTabChange={(tab) => {
          const validTab = (tab === 'acerca' ? 'proyectos' : tab) as 'proyectos' | 'academia' | 'territorios';
          setActiveDestacadosTab(validTab);
          onTabChange?.(validTab);
        }}
        onSelectProject={onSelectProject}
        onNavigateToCatalog={onNavigateToCatalog}
        onNavigateToSection={handleNavigateToSection}
      />
    </main>
  );
};

export default HomePage;

