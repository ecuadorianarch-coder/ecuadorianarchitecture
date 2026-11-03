import React from 'react';
import { Search, Mic, Camera, CheckCircle2, AlertTriangle, Sparkles, Globe, Layers, Image as ImageIcon } from 'lucide-react';
import { EditorialArticle } from '../../types/editorial';
import { compileArchitectureSeo } from '../../services/architectureSeo';

interface GoogleSearchPreviewProps {
  article: EditorialArticle;
  device?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
  onApplyOptimizedSeo?: () => void;
}

export const GoogleSearchPreview: React.FC<GoogleSearchPreviewProps> = ({
  article,
  device = 'desktop',
  className = '',
  onApplyOptimizedSeo,
}) => {
  const seo = compileArchitectureSeo(article);
  const searchQuery = article.title ? article.title.trim() : 'Arquitectura Ecuatoriana';

  return (
    <div className={`w-full bg-[#f8f9fa] text-[#202124] font-sans antialiased ${className}`}>
      {/* 1. Google Top Search Bar Simulation */}
      <div className="bg-white border-b border-[#dadce0] px-4 sm:px-8 py-3.5 flex flex-col gap-3">
        <div className="flex items-center gap-4 sm:gap-6 w-full max-w-4xl">
          {/* Google Logo */}
          <div className="flex items-center text-xl sm:text-2xl font-bold tracking-tight select-none shrink-0 font-sans">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>

          {/* Search Input Box */}
          <div className="flex-1 max-w-2xl bg-white border border-[#dfe1e5] hover:border-transparent hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] rounded-full px-4 py-2.5 flex items-center gap-3 transition-shadow">
            <span className="text-sm text-[#202124] flex-1 truncate font-normal">
              {searchQuery}
            </span>
            <div className="flex items-center gap-2.5 text-[#5f6368] shrink-0">
              <Mic className="w-4 h-4 cursor-pointer hover:text-[#4285F4]" />
              <Camera className="w-4 h-4 cursor-pointer hover:text-[#4285F4]" />
              <Search className="w-4 h-4 text-[#4285F4] ml-0.5" />
            </div>
          </div>
        </div>

        {/* Google Filter Tabs (All, Images, News, etc.) */}
        <div className="flex items-center gap-6 text-xs text-[#5f6368] font-medium border-t border-[#f1f3f4] pt-2 max-w-4xl overflow-x-auto no-scrollbar">
          <span className="text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1.5 font-medium flex items-center gap-1">
            Todo (All)
          </span>
          <span className="pb-1.5 hover:text-[#202124] cursor-pointer">Imágenes</span>
          <span className="pb-1.5 hover:text-[#202124] cursor-pointer">Noticias</span>
          <span className="pb-1.5 hover:text-[#202124] cursor-pointer">Maps</span>
          <span className="pb-1.5 hover:text-[#202124] cursor-pointer">Videos</span>
          <span className="pb-1.5 hover:text-[#202124] cursor-pointer">Herramientas</span>
        </div>
      </div>

      {/* 2. Google Search Results Body */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 text-xs text-[#70757a] border-b border-[#dadce0]/60 pb-2">
          <span>Aproximadamente 48.200 resultados (0,34 segundos)</span>
          {onApplyOptimizedSeo && (
            <button
              type="button"
              onClick={onApplyOptimizedSeo}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded text-xs font-medium shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimizar al Estilo Arquitectura Viva</span>
            </button>
          )}
        </div>

        {/* 3. The Canonical Google Architecture Result Card (Matches screenshot media_1793133234350_d95b462e.png) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#dfe1e5] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            {/* Left Column: Breadcrumb, Title & Rich Snippet */}
            <div className="flex-1 min-w-0 pr-0 sm:pr-4">
              {/* Site Favicon & Breadcrumb */}
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white font-anton text-[10px] tracking-wider shrink-0 shadow-xs">
                  EA
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-normal text-[#202124] leading-tight truncate">
                    Ecuadorian Architecture
                  </span>
                  <span className="text-[12px] text-[#4d5156] truncate flex items-center gap-1 leading-tight font-mono">
                    https://ecuadorianarchitecture.com › {article.type || 'proyectos'} › {article.slug || 'obra'}
                  </span>
                </div>
              </div>

              {/* Clickable Blue/Purple Title (Google SERP Title) */}
              <h3 className="text-[18px] sm:text-[20px] text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug mt-1.5 break-words">
                {seo.metaTitle}
              </h3>

              {/* Snippet Description */}
              <p className="text-[13.5px] sm:text-[14px] text-[#4d5156] leading-relaxed mt-1 font-normal break-words">
                {seo.metaDescription}
              </p>

              {/* Architectural Sitelinks / Metadata badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#f1f3f4] text-xs">
                <span className="px-2 py-0.5 bg-[#f1f3f4] text-[#3c4043] rounded text-[11px] font-medium">
                  {article.category || 'Arquitectura Contemporánea'}
                </span>
                <span className="px-2 py-0.5 bg-[#f1f3f4] text-[#3c4043] rounded text-[11px] font-medium">
                  📍 {article.location || 'Ecuador'}
                </span>
                <span className="px-2 py-0.5 bg-[#f1f3f4] text-[#3c4043] rounded text-[11px] font-medium">
                  🗓️ {article.year || '2026'}
                </span>
                {article.superficie && (
                  <span className="px-2 py-0.5 bg-[#f1f3f4] text-[#3c4043] rounded text-[11px] font-medium">
                    📐 {article.superficie}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Google Rich Thumbnail (The exact feature seen in the user's screenshot) */}
            <div className="w-[104px] h-[104px] sm:w-[124px] sm:h-[124px] rounded-[16px] overflow-hidden bg-[#e8eaed] border border-[#dadce0] shrink-0 shadow-xs self-start sm:self-center">
              {article.heroImage ? (
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#70757a] text-[10px] p-2 text-center">
                  <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
                  <span>Sin foto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Google Quality & Rich Snippet Diagnostics Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#dfe1e5] space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f3f4] pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3c4043] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Diagnóstico de Posicionamiento en Google</span>
            </span>
            <span className="text-[11px] font-medium text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#137333]" />
              <span>Estándar ArchDaily & Arquitectura Viva</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Title metric */}
            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
              <span className="text-[#70757a] block text-[11px]">Título para Google</span>
              <span className="font-semibold text-sm text-[#202124]">
                {seo.score.titleLength} / 60 letras
              </span>
              <span className={`block text-[10.5px] font-medium mt-0.5 ${
                seo.score.titleStatus === 'optimal' ? 'text-[#137333]' : 'text-[#b06000]'
              }`}>
                {seo.score.titleStatus === 'optimal' ? '✓ Longitud perfecta' : '⚠️ Algo extenso para móvil'}
              </span>
            </div>

            {/* Description metric */}
            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
              <span className="text-[#70757a] block text-[11px]">Descripción Snippet</span>
              <span className="font-semibold text-sm text-[#202124]">
                {seo.score.descLength} / 160 letras
              </span>
              <span className={`block text-[10.5px] font-medium mt-0.5 ${
                seo.score.descStatus === 'optimal' ? 'text-[#137333]' : 'text-[#b06000]'
              }`}>
                {seo.score.descStatus === 'optimal' ? '✓ No se recortará' : '⚠️ Ajustar a ~155 letras'}
              </span>
            </div>

            {/* Image Thumbnail */}
            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
              <span className="text-[#70757a] block text-[11px]">Miniatura en Google</span>
              <span className="font-semibold text-sm text-[#202124]">
                {seo.score.hasImage ? 'Activada' : 'Faltante'}
              </span>
              <span className="block text-[10.5px] text-[#137333] font-medium mt-0.5">
                ✓ Rich Snippet con foto
              </span>
            </div>

            {/* Schema.org */}
            <div className="p-2.5 bg-[#f8f9fa] rounded-lg border border-[#e8eaed]">
              <span className="text-[#70757a] block text-[11px]">Marcado Estructurado</span>
              <span className="font-semibold text-sm text-[#202124]">
                JSON-LD Activo
              </span>
              <span className="block text-[10.5px] text-[#137333] font-medium mt-0.5">
                ✓ Article + Breadcrumbs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
