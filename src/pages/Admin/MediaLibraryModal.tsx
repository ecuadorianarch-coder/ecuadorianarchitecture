import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Link as LinkIcon, Check, Search, Trash2, Loader2, Sparkles, Camera, Compass } from 'lucide-react';
import { MediaAsset } from '../../types/editorial';
import { uploadImageFile } from '../../utils/mediaUpload';
import { detectImageCategory } from '../../components/editorial/ImageCarouselLightbox';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (media: {
    url: string;
    caption?: string;
    credit?: string;
    alt?: string;
    focalPoint?: 'top' | 'center' | 'bottom';
    category?: 'fotografia' | 'planimetria';
  }) => void;
  currentImageUrl?: string;
}

// Curated architectural library of projects
const DEFAULT_ASSETS: MediaAsset[] = [
  {
    id: 'ea-med-1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    name: 'Atrium — Vacío Central',
    alt: 'Edificio Atrium vacío central y hormigón visto',
    category: 'Hormigón',
    uploadedAt: '2026-01-10',
    credit: 'Bicubik Photography',
    caption: 'Vacío central bioclimático en Quito',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-2',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    name: 'Casa Entre Árboles',
    alt: 'Casa entre árboles en Puembo arquitectura de tierra',
    category: 'Tierra',
    uploadedAt: '2026-02-14',
    credit: 'Jag Studio',
    caption: 'Tapial y madera nativa en Puembo',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-3',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    name: 'Plaza y Teatro',
    alt: 'Plaza y Teatro Centro Histórico',
    category: 'Público',
    uploadedAt: '2026-02-20',
    credit: 'Diego Guayasamín',
    caption: 'Espacio público y memoria vecinal',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-4',
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    name: 'Bambú Estructural',
    alt: 'Estructuras de bambú costa ecuatoriana',
    category: 'Bambú',
    uploadedAt: '2026-03-01',
    credit: 'Facultad Arq UG',
    caption: 'Estudio de vulnerabilidad sísmica en Guayas',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-5',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    name: 'Estuario Fluvial Guayas',
    alt: 'Río Guayas y borde litoral',
    category: 'Territorio',
    uploadedAt: '2026-03-05',
    credit: 'Estudio Urbano Litoral',
    caption: 'Mareas y dinámica hidráulica en Guayaquil',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-6',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    name: 'Quebradas y Laderas',
    alt: 'Laderas del Pichincha quebradas Quito',
    category: 'Territorio',
    uploadedAt: '2026-03-11',
    credit: 'PUCE FADA',
    caption: 'Cartografía de asentamientos en quebradas',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-7',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    name: 'Arquitectura Vernácula Austro',
    alt: 'Adobe y sistemas tradicionales Cuenca',
    category: 'Tierra',
    uploadedAt: '2026-03-12',
    credit: 'Universidad de Cuenca',
    caption: 'Memoria constructiva tradicional del Austro',
    dimensions: '1600x1066',
  },
  {
    id: 'ea-med-8',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    name: 'Chimborazo y Callejón Andino',
    alt: 'Paisajes agrícolas del Chimborazo',
    category: 'Territorio',
    uploadedAt: '2026-03-14',
    credit: 'Colectivo Andino',
    caption: 'Huellas prehispánicas y terrazas de cultivo',
    dimensions: '1600x1066',
  },
];

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isUploading, setIsUploading] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem('ea_media_library');
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...parsed, ...DEFAULT_ASSETS.filter((d) => !parsed.some((p: any) => p.id === d.id))];
      }
      return DEFAULT_ASSETS;
    } catch {
      return DEFAULT_ASSETS;
    }
  });

  // Selected media metadata
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImageUrl || assets[0]?.url || '');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [alt, setAlt] = useState('');
  const [focalPoint, setFocalPoint] = useState<'top' | 'center' | 'bottom'>('center');
  const [categoryType, setCategoryType] = useState<'fotografia' | 'planimetria'>('fotografia');
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (currentImageUrl) {
      setSelectedUrl(currentImageUrl);
      const match = assets.find((a) => a.url === currentImageUrl);
      if (match) {
        setCaption(match.caption || '');
        setCredit(match.credit || '');
        setAlt(match.alt || '');
        setFocalPoint(match.focalPoint || 'center');
        setCategoryType(match.imageType || detectImageCategory(match.url, match.name, match.caption));
      } else {
        setCategoryType(detectImageCategory(currentImageUrl));
      }
    }
  }, [currentImageUrl, assets]);

  if (!isOpen) return null;

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const resultUrl = await uploadImageFile(file);
      const newAsset: MediaAsset = {
        id: `upload-${Date.now()}`,
        url: resultUrl,
        name: file.name.replace(/\.[^/.]+$/, ''),
        alt: file.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        category: 'Subidas',
        size: `${(file.size / 1024).toFixed(0)} KB`,
      };

      const updated = [newAsset, ...assets];
      setAssets(updated);
      setSelectedUrl(resultUrl);
      setAlt(newAsset.name);
      setActiveTab('library');
      try {
        localStorage.setItem('ea_media_library', JSON.stringify(updated.slice(0, 50)));
      } catch (err) {
        console.warn('Storage limit for local media reached', err);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Add external URL handler
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newAsset: MediaAsset = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      name: 'Imagen Externa',
      alt: 'Fotografía arquitectónica',
      uploadedAt: new Date().toISOString().split('T')[0],
      category: 'Enlace Web',
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    setSelectedUrl(urlInput.trim());
    setUrlInput('');
    setActiveTab('library');
    try {
      localStorage.setItem('ea_media_library', JSON.stringify(updated.slice(0, 30)));
    } catch {}
  };

  const handleConfirmSelection = () => {
    if (!selectedUrl) return;
    onSelectImage({
      url: selectedUrl,
      caption: caption.trim() || undefined,
      credit: credit.trim() || undefined,
      alt: alt.trim() || undefined,
      focalPoint,
      category: categoryType,
    });
    onClose();
  };

  const categories = ['todos', 'Hormigón', 'Tierra', 'Bambú', 'Territorio', 'Público', 'Subidas'];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchQuery === '' ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.credit && asset.credit.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.caption && asset.caption.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'todos' || asset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-inter text-white">
      <div className="w-full max-w-5xl h-[85vh] bg-[#161616] border border-white/20 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-[#1f1f1f] border-b border-white/10 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-anton text-lg tracking-wider text-white">BIBLIOTECA MULTIMEDIA</span>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest border-l border-white/20 pl-3 hidden sm:inline">
              Gestor de Recursos Gráficos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                activeTab === 'library' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Explorar Medios
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                activeTab === 'upload' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Subir Archivo
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                activeTab === 'url' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              Desde URL
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Grid View */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-white/10">
            {/* Filter Bar */}
            {activeTab === 'library' && (
              <div className="p-4 bg-[#1a1a1a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, fotógrafo o pie..."
                    className="w-full bg-[#252525] border border-white/15 pl-9 pr-3 py-1.5 text-xs rounded-none text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LIBRARY */}
            {activeTab === 'library' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedUrl === asset.url;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setSelectedUrl(asset.url);
                          setCaption(asset.caption || '');
                          setCredit(asset.credit || '');
                          setAlt(asset.alt || '');
                          setFocalPoint(asset.focalPoint || 'center');
                          setCategoryType(asset.imageType || detectImageCategory(asset.url, asset.name, asset.caption));
                        }}
                        className={`relative aspect-[4/3] bg-black border-2 cursor-pointer group overflow-hidden transition-all ${
                          isSelected ? 'border-white ring-2 ring-white/50' : 'border-white/15 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={asset.url}
                          alt={asset.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-white text-black p-1 rounded-full shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-[10px] font-mono text-white/80 truncate">
                          {asset.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: UPLOAD */}
            {activeTab === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md w-full border-2 border-dashed border-white/20 p-10 hover:border-white/50 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-white/50 mb-4" />
                  <h3 className="font-anton text-lg uppercase tracking-wider mb-2">
                    SUBIR ARCHIVO LOCAL
                  </h3>
                  <p className="text-xs text-white/50 mb-3">
                    Soporta imágenes JPG, PNG, WEBP.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded mb-6">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Optimización automática: se procesa a WebP 2560px de alta fidelidad sin pérdida visual.</span>
                  </div>
                  <label className={`bg-white text-black hover:bg-white/90 px-6 py-2.5 font-anton text-xs uppercase tracking-widest cursor-pointer inline-flex items-center gap-2 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? 'Subiendo imagen...' : 'Seleccionar Archivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB: URL */}
            {activeTab === 'url' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <form onSubmit={handleAddUrl} className="max-w-md w-full space-y-4">
                  <div className="text-center mb-6">
                    <LinkIcon className="w-10 h-10 mx-auto text-white/50 mb-3" />
                    <h3 className="font-anton text-lg uppercase tracking-wider mb-1">
                      AGREGAR DESDE URL EXTERNA
                    </h3>
                    <p className="text-xs text-white/50">
                      Pega un enlace directo de Unsplash, CDN o servidor multimedia.
                    </p>
                  </div>
                  <div>
                    <input
                      type="url"
                      required
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#202020] border border-white/20 p-3 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-white/90 py-2.5 font-anton text-xs uppercase tracking-widest"
                  >
                    Cargar e Insertar
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Inspector & Details Sidebar */}
          <aside className="w-72 sm:w-80 bg-[#191919] p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <span className="font-anton text-xs tracking-wider uppercase text-white/60 block border-b border-white/10 pb-2">
                DETALLES DEL RECURSO
              </span>

              {selectedUrl ? (
                <div className="space-y-4">
                  {/* Preview Container */}
                  <div className="aspect-[16/10] bg-black border border-white/20 overflow-hidden relative">
                    <img
                      src={selectedUrl}
                      alt={alt || 'Vista previa'}
                      className={`w-full h-full object-cover ${
                        focalPoint === 'top'
                          ? 'object-top'
                          : focalPoint === 'bottom'
                          ? 'object-bottom'
                          : 'object-center'
                      }`}
                    />
                  </div>

                  {/* Focal point selector */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 block mb-1">
                      Punto Focal del Recorte
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top', 'center', 'bottom'] as const).map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setFocalPoint(pt)}
                          className={`py-1 text-[10px] font-mono uppercase border transition-colors ${
                            focalPoint === pt
                              ? 'bg-white text-black border-white'
                              : 'border-white/15 text-white/60 hover:text-white'
                          }`}
                        >
                          {pt === 'top' ? 'Arriba' : pt === 'center' ? 'Centro' : 'Abajo'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categoría en Carrusel */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 block mb-1">
                      Categoría en Carrusel
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCategoryType('fotografia')}
                        className={`py-1.5 px-2 text-[11px] font-anton uppercase border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          categoryType === 'fotografia'
                            ? 'bg-white text-black border-white font-bold'
                            : 'border-white/15 text-white/60 hover:text-white'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        <span>Fotografía</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryType('planimetria')}
                        className={`py-1.5 px-2 text-[11px] font-anton uppercase border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          categoryType === 'planimetria'
                            ? 'bg-amber-400 text-black border-amber-400 font-bold'
                            : 'border-white/15 text-white/60 hover:text-white'
                        }`}
                      >
                        <Compass className="w-3 h-3" />
                        <span>Planimetría</span>
                      </button>
                    </div>
                  </div>

                  {/* Photo credit */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 block mb-1">
                      Crédito Fotográfico
                    </label>
                    <input
                      type="text"
                      value={credit}
                      onChange={(e) => setCredit(e.target.value)}
                      placeholder="ej. Bicubik Photography"
                      className="w-full bg-[#252525] border border-white/15 px-2.5 py-1.5 text-xs text-white rounded-none focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 block mb-1">
                      Pie de Foto
                    </label>
                    <textarea
                      rows={2}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Descripción de la envolvente o detalle..."
                      className="w-full bg-[#252525] border border-white/15 px-2.5 py-1.5 text-xs text-white rounded-none focus:outline-none focus:border-white resize-none"
                    />
                  </div>

                  {/* Alt text */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/60 block mb-1">
                      Texto Alternativo (Accesibilidad)
                    </label>
                    <input
                      type="text"
                      value={alt}
                      onChange={(e) => setAlt(e.target.value)}
                      placeholder="Descripción para lectores de pantalla..."
                      className="w-full bg-[#252525] border border-white/15 px-2.5 py-1.5 text-xs text-white rounded-none focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-white/40">
                  Selecciona una imagen de la biblioteca para configurar sus datos.
                </div>
              )}
            </div>

            {/* Bottom Confirm Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleConfirmSelection}
                disabled={!selectedUrl}
                className="w-full bg-white text-black hover:bg-white/90 disabled:bg-white/40 py-2.5 font-anton text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>SELECCIONAR IMAGEN</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
