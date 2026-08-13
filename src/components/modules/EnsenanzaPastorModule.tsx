import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { 
  BookOpen, 
  Search, 
  FileText, 
  Video, 
  Music, 
  Image, 
  File,
  Download,
  Trash2,
  Upload,
  Calendar,
  User,
  CheckCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para material de enseñanza
type TipoMaterial = 'PDF' | 'Video' | 'Audio' | 'Imagen' | 'Documento' | 'Presentacion';

interface MaterialEnsenanza {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoMaterial;
  categoria: string;
  archivoNombre: string;
  archivoSize: string;
  subidoPor: string;
  subidoPorNombre: string;
  fechaSubida: string;
  paraRoles: string[];
  descargas: number;
  url?: string;
}

// Mock data para materiales
const materialesMock: MaterialEnsenanza[] = [
  {
    id: 'mat1',
    titulo: 'Lección 1: Fundamentos de la Fe',
    descripcion: 'Material completo sobre los fundamentos básicos de la fe cristiana.',
    tipo: 'PDF',
    categoria: 'Escuela de Formación',
    archivoNombre: 'fundamentos_fe_leccion1.pdf',
    archivoSize: '2.5 MB',
    subidoPor: '3',
    subidoPorNombre: 'Pedro Sánchez',
    fechaSubida: '2026-03-01',
    paraRoles: ['lider_gap', 'timoteo', 'miembro'],
    descargas: 45,
  },
  {
    id: 'mat2',
    titulo: 'Enseñanza: El Poder de la Oración',
    descripcion: 'Video sobre la importancia de la oración en la vida del creyente.',
    tipo: 'Video',
    categoria: 'Enseñanza General',
    archivoNombre: 'poder_oracion.mp4',
    archivoSize: '156 MB',
    subidoPor: '3',
    subidoPorNombre: 'Pedro Sánchez',
    fechaSubida: '2026-02-25',
    paraRoles: ['todos'],
    descargas: 128,
  },
  {
    id: 'mat3',
    titulo: 'Guía del Líder GAP',
    descripcion: 'Manual completo para líderes de grupos de amistad y propósito.',
    tipo: 'PDF',
    categoria: 'Liderazgo',
    archivoNombre: 'guia_lider_gap.pdf',
    archivoSize: '5.8 MB',
    subidoPor: '1',
    subidoPorNombre: 'Carlos Martínez',
    fechaSubida: '2026-02-15',
    paraRoles: ['lider_gap', 'lider_mentor'],
    descargas: 67,
  },
  {
    id: 'mat4',
    titulo: 'Canciones de Adoración - Marzo',
    descripcion: 'Playlist de canciones para las reuniones de marzo.',
    tipo: 'Audio',
    categoria: 'Música',
    archivoNombre: 'adoracion_marzo.zip',
    archivoSize: '89 MB',
    subidoPor: '3',
    subidoPorNombre: 'Pedro Sánchez',
    fechaSubida: '2026-03-05',
    paraRoles: ['lider_gap', 'timoteo'],
    descargas: 34,
  },
  {
    id: 'mat5',
    titulo: 'Presentación: Panorama Bíblico',
    descripcion: 'Presentación completa del curso Panorama Bíblico del Antiguo Testamento.',
    tipo: 'Presentacion',
    categoria: 'Escuela de Formación',
    archivoNombre: 'panorama_biblico_at.pptx',
    archivoSize: '12.4 MB',
    subidoPor: '3',
    subidoPorNombre: 'Pedro Sánchez',
    fechaSubida: '2026-02-20',
    paraRoles: ['lider_gap', 'lider_mentor', 'timoteo'],
    descargas: 89,
  },
];

const categorias = [
  'Todas',
  'Escuela de Formación',
  'Liderazgo',
  'Enseñanza General',
  'Música',
  'Discipulado',
  'Eventos Especiales',
  'Otros',
];

const EnsenanzaPastorModule: React.FC = () => {
  const { usuario, tema } = useAuth();
  const [materiales, setMateriales] = useState<MaterialEnsenanza[]>(() => {
    const saved = localStorage.getItem('materiales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing materiales from localStorage', e);
      }
    }
    return materialesMock;
  });

  useEffect(() => {
    localStorage.setItem('materiales', JSON.stringify(materiales));
  }, [materiales]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [dialogoSubirAbierto, setDialogoSubirAbierto] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nuevoMaterial, setNuevoMaterial] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'Enseñanza General',
    paraRoles: ['todos'],
  });

  const [materialAEliminar, setMaterialAEliminar] = useState<string | null>(null);

  // Filtrar materiales
  const materialesFiltrados = materiales.filter(m => {
    const coincideBusqueda = m.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            m.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === 'Todas' || m.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  const getTipoIcon = (tipo: TipoMaterial) => {
    switch (tipo) {
      case 'PDF': return <FileText className="w-6 h-6 text-red-500" />;
      case 'Video': return <Video className="w-6 h-6 text-purple-500" />;
      case 'Audio': return <Music className="w-6 h-6 text-blue-500" />;
      case 'Imagen': return <Image className="w-6 h-6 text-green-500" />;
      case 'Presentacion': return <FileText className="w-6 h-6 text-orange-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: TipoMaterial) => {
    switch (tipo) {
      case 'PDF': return 'bg-red-100 text-red-800';
      case 'Video': return 'bg-purple-100 text-purple-800';
      case 'Audio': return 'bg-blue-100 text-blue-800';
      case 'Imagen': return 'bg-green-100 text-green-800';
      case 'Presentacion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoSeleccionado(file);
      // Auto-completar título con nombre del archivo
      if (!nuevoMaterial.titulo) {
        const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '');
        setNuevoMaterial(prev => ({ ...prev, titulo: nombreSinExtension }));
      }
    }
  };

  const detectarTipo = (nombre: string): TipoMaterial => {
    const extension = nombre.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm': return 'Video';
      case 'mp3':
      case 'wav':
      case 'ogg': return 'Audio';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Imagen';
      case 'ppt':
      case 'pptx':
      case 'key': return 'Presentacion';
      default: return 'Documento';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const subirMaterial = () => {
    if (!archivoSeleccionado || !nuevoMaterial.titulo.trim()) return;

    const nuevo: MaterialEnsenanza = {
      id: Date.now().toString(),
      ...nuevoMaterial,
      tipo: detectarTipo(archivoSeleccionado.name),
      archivoNombre: archivoSeleccionado.name,
      archivoSize: `${(archivoSeleccionado.size / (1024 * 1024)).toFixed(2)} MB`,
      subidoPor: usuario?.id || '',
      subidoPorNombre: `${usuario?.nombre} ${usuario?.apellidos || ''}`,
      fechaSubida: new Date().toISOString(),
      descargas: 0,
      url: URL.createObjectURL(archivoSeleccionado),
    };

    setMateriales([nuevo, ...materiales]);
    setDialogoSubirAbierto(false);
    setArchivoSeleccionado(null);
    setNuevoMaterial({
      titulo: '',
      descripcion: '',
      categoria: 'Enseñanza General',
      paraRoles: ['todos'],
    });
    toast.success('Material publicado exitosamente');
  };

  const eliminarMaterial = (id: string) => {
    setMaterialAEliminar(id);
  };

  const confirmarEliminacion = () => {
    if (materialAEliminar) {
      setMateriales(materiales.filter(m => m.id !== materialAEliminar));
      toast.success('El material ha sido eliminado de forma definitiva del sistema.');
      setMaterialAEliminar(null);
    }
  };

  const descargarMaterial = (id: string) => {
    setMateriales(materiales.map(m => 
      m.id === id ? { ...m, descargas: m.descargas + 1 } : m
    ));
    toast.success('Iniciando descarga del material...');
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Material de Enseñanza</h2>
          <p className="text-gray-500">Gestiona y comparte material de estudio</p>
        </div>
        <Button 
          style={{ backgroundColor: tema.primario }}
          className="text-white"
          onClick={() => setDialogoSubirAbierto(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir Material
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Materiales</p>
                <p className="text-2xl font-bold">{materiales.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">PDFs</p>
                <p className="text-2xl font-bold text-red-600">
                  {materiales.filter(m => m.tipo === 'PDF').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Videos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {materiales.filter(m => m.tipo === 'Video').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Descargas</p>
                <p className="text-2xl font-bold text-green-600">
                  {materiales.reduce((acc, m) => acc + m.descargas, 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar materiales..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiales */}
      <div className="grid gap-4">
        {materialesFiltrados.map((material) => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Icono */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center">
                    {getTipoIcon(material.tipo)}
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{material.titulo}</h3>
                    <Badge className={getTipoColor(material.tipo)}>{material.tipo}</Badge>
                    <Badge variant="outline">{material.categoria}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{material.descripcion}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <File className="w-4 h-4" />
                      {material.archivoNombre}
                    </span>
                    <span>{material.archivoSize}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(material.fechaSubida), 'dd MMM yyyy', { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {material.subidoPorNombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {material.descargas} descargas
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex sm:flex-col gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => descargarMaterial(material.id)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                  {(material.subidoPor === usuario?.id || usuario?.rol === 'pastor_principal') && (
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => eliminarMaterial(material.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {materialesFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">No se encontraron materiales</p>
              <p className="text-sm text-gray-400">Sube tu primer material de enseñanza</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de subir material */}
      <Dialog open={dialogoSubirAbierto} onOpenChange={setDialogoSubirAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Subir Material de Enseñanza</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Área de carga de archivo */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.mp4,.mp3,.wav,.jpg,.jpeg,.png,.ppt,.pptx,.doc,.docx"
              />
              {archivoSeleccionado ? (
                <div className="space-y-2">
                  <CheckCircle className="w-10 h-10 mx-auto text-green-500" />
                  <p className="font-medium text-gray-900">{archivoSeleccionado.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(archivoSeleccionado.size)}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArchivoSeleccionado(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="font-medium text-gray-700">Haz clic para seleccionar un archivo</p>
                  <p className="text-sm text-gray-500">
                    PDF, Video, Audio, Imagen, Presentación (máx. 500MB)
                  </p>
                </div>
              )}
            </div>

            {/* Campos del formulario */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
              <Input
                value={nuevoMaterial.titulo}
                onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, titulo: e.target.value })}
                placeholder="Título del material"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
              <Textarea
                value={nuevoMaterial.descripcion}
                onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, descripcion: e.target.value })}
                placeholder="Describe el contenido del material..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Categoría</label>
              <Select 
                value={nuevoMaterial.categoria} 
                onValueChange={(v) => setNuevoMaterial({ ...nuevoMaterial, categoria: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.filter(c => c !== 'Todas').map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Visible para</label>
              <Select 
                value={nuevoMaterial.paraRoles[0]} 
                onValueChange={(v) => setNuevoMaterial({ ...nuevoMaterial, paraRoles: [v] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="lider_gap">Líderes GAP</SelectItem>
                  <SelectItem value="lider_mentor">Líderes Mentor</SelectItem>
                  <SelectItem value="timoteo">Timoteos</SelectItem>
                  <SelectItem value="miembro">Miembros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogoSubirAbierto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={subirMaterial}
                style={{ backgroundColor: tema.primario }}
                className="text-white"
                disabled={!archivoSeleccionado || !nuevoMaterial.titulo.trim()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Material
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={!!materialAEliminar} onOpenChange={(open) => !open && setMaterialAEliminar(null)}>
        <AlertDialogContent className="glass-card border border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800">¿Eliminar este archivo definitivamente?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Esta acción no se puede deshacer. Esto borrará de manera permanente el archivo del sistema y ya no estará disponible para ningún usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarEliminacion}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sí, eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnsenanzaPastorModule;
