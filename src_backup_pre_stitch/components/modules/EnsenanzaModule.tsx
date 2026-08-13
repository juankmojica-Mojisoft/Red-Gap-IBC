import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  Download, 
  FileText,
  Video,
  Music,
  Image,
  Trash2,
  CheckCircle,
  Upload
} from 'lucide-react';
import { materialEnsenanzaMock, crearMaterialEnsenanza, usuariosMock } from '@/data/mockData';
import type { TipoMaterial } from '@/types';

interface EnsenanzaModuleProps {
  onVolver: () => void;
}

const EnsenanzaModule: React.FC<EnsenanzaModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [materiales, setMateriales] = useState(materialEnsenanzaMock);
  
  const [nuevoMaterial, setNuevoMaterial] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'PDF' as TipoMaterial,
    url: '',
    paraFrecuencia: 'Semanal' as 'Semanal' | 'Quincenal' | 'Ambas',
  });

  const tiposMaterial: { value: TipoMaterial; label: string; icon: React.ReactNode }[] = [
    { value: 'PDF', label: 'PDF', icon: <FileText className="w-4 h-4" /> },
    { value: 'Video', label: 'Video', icon: <Video className="w-4 h-4" /> },
    { value: 'Audio', label: 'Audio', icon: <Music className="w-4 h-4" /> },
    { value: 'Imagen', label: 'Imagen', icon: <Image className="w-4 h-4" /> },
    { value: 'Documento', label: 'Documento', icon: <FileText className="w-4 h-4" /> },
  ];

  const puedeSubir = usuario?.rol === 'pastor' || usuario?.rol === 'pastor_principal' || usuario?.rol === 'lider_mentor';
  const puedeDescargar = usuario?.rol === 'lider_gap' || usuario?.rol === 'timoteo' || puedeSubir;
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario && nuevoMaterial.titulo && nuevoMaterial.url) {
      const materialCreado = crearMaterialEnsenanza({
        ...nuevoMaterial,
        subidoPor: usuario.id,
        subidoPorNombre: `${usuario.nombre} ${usuario.apellidos}`,
        activo: true,
      });
      setMateriales([...materiales, materialCreado]);
      setNuevoMaterial({
        titulo: '',
        descripcion: '',
        tipo: 'PDF',
        url: '',
        paraFrecuencia: 'Semanal',
      });
      setMostrarFormulario(false);
    }
  };

  const eliminarMaterial = (id: string) => {
    setMateriales(materiales.filter(m => m.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Módulo De Enseñanza</h1>
        </div>
        {puedeSubir && (
          <Button 
            onClick={() => setMostrarFormulario(true)}
            className="text-white"
            style={{ backgroundColor: tema.primario }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Subir Material
          </Button>
        )}
      </div>

      {/* Formulario de nuevo material */}
      {mostrarFormulario && puedeSubir && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Subir Nuevo Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={nuevoMaterial.titulo}
                    onChange={(e) => setNuevoMaterial({...nuevoMaterial, titulo: e.target.value})}
                    placeholder="Ej: Lección 1 - El Poder De La Oración"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo De Material</Label>
                  <Select 
                    value={nuevoMaterial.tipo} 
                    onValueChange={(value) => setNuevoMaterial({...nuevoMaterial, tipo: value as TipoMaterial})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposMaterial.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={nuevoMaterial.descripcion}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, descripcion: e.target.value})}
                  placeholder="Descripción Del Material"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL Del Archivo *</Label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="url"
                      value={nuevoMaterial.url}
                      onChange={(e) => setNuevoMaterial({...nuevoMaterial, url: e.target.value})}
                      placeholder="https://ejemplo.com/archivo.pdf"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paraFrecuencia">Para Reuniones</Label>
                  <Select 
                    value={nuevoMaterial.paraFrecuencia} 
                    onValueChange={(value) => setNuevoMaterial({...nuevoMaterial, paraFrecuencia: value as 'Semanal' | 'Quincenal' | 'Ambas'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semanal">Semanales</SelectItem>
                      <SelectItem value="Quincenal">Quincenales</SelectItem>
                      <SelectItem value="Ambas">Ambas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="text-white"
                  style={{ backgroundColor: tema.primario }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Subir Material
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">
                {usuario?.rol === 'timoteo' 
                  ? 'No hay material disponible del Pastor' 
                  : 'No Hay Material Disponible'}
              </p>
            </CardContent>
          </Card>
        ) : (
          materialesFiltrados.map((material) => {
            const tipoInfo = tiposMaterial.find(t => t.value === material.tipo);
            return (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {tipoInfo?.icon}
                        <h3 className="font-semibold text-lg">{material.titulo}</h3>
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
                      <p className="text-gray-600 text-sm mb-2">{material.descripcion}</p>
                      <p className="text-xs text-gray-500">
                        Subido Por: {material.subidoPorNombre} | {new Date(material.fechaSubida).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {puedeDescargar && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(material.url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                      )}
                      {puedeSubir && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarMaterial(material.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EnsenanzaModule;
