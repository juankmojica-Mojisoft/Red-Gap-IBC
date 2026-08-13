import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  FileText,
  Video,
  Music,
  Image
} from 'lucide-react';
import { materialEnsenanzaMock, usuariosMock } from '@/data/mockData';
import type { TipoMaterial } from '@/types';
import { toast } from 'sonner';

interface EnsenanzaModuleProps {
  onVolver: () => void;
}

const EnsenanzaModule: React.FC<EnsenanzaModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [materiales] = useState(materialEnsenanzaMock);

  const tiposMaterial: { value: TipoMaterial; label: string; icon: React.ReactNode }[] = [
    { value: 'PDF', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
    { value: 'Video', label: 'Video', icon: <Video className="w-4 h-4" /> },
    { value: 'Audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
    { value: 'Imagen', label: 'Imagen', icon: <Image className="w-4 h-4" /> },
    { value: 'Documento', label: 'Documento', icon: <FileText className="w-4 h-4" /> },
  ];
  
  // Filtrar material para Timoteo (solo el cargado por Pastor o Pastor Principal)
  const materialesFiltrados = useMemo(() => {
    if (usuario?.rol !== 'timoteo') return materiales;
    return materiales.filter(m => 
      m.subidoPorNombre && (
        m.subidoPorNombre.toLowerCase().includes('pastor') ||
        usuariosMock.find(u => u.id === m.subidoPor)?.rol === 'pastor' ||
        usuariosMock.find(u => u.id === m.subidoPor)?.rol === 'pastor_principal'
      )
    );
  }, [materiales, usuario]);

  const handleDescargar = (url?: string) => {
    toast.success('Iniciando descarga del material...');
    if (url) {
      setTimeout(() => {
        window.open(url, '_blank');
      }, 1000);
    }
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto mt-gutter animate-fade-in pb-24 lg:pb-6 space-y-gutter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Módulo De Enseñanza</h1>
        </div>
      </div>

      {/* Lista de materiales */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Material Disponible
          {usuario?.rol === 'timoteo' && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Solo material del Pastor)
            </span>
          )}
        </h2>
        
        {materialesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">
                {usuario?.rol === 'timoteo' 
                  ? 'No hay material disponible del Pastor' 
                  : 'No Hay Material Disponible'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materialesFiltrados.map((material) => {
              const tipoInfo = tiposMaterial.find(t => t.value === material.tipo);
              return (
                <Card key={material.id}>
                  <CardContent>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {tipoInfo?.icon}
                          <h3 className="font-semibold text-lg">{material.titulo}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {tipoInfo?.label || material.tipo}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: tema.primario, color: tema.primario }}
                          >
                            {material.paraFrecuencia === 'Ambas' ? 'Semanal Y Quincenal' : `Reuniones ${material.paraFrecuencia}es`}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{material.descripcion}</p>
                        <p className="text-xs text-gray-500 mb-4">
                          Subido Por: {material.subidoPorNombre} <br/> {new Date(material.fechaSubida).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDescargar(material.url)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnsenanzaModule;
