import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle, 
  Loader2,
  Send,
  MessageSquare,
  Clock,
  User,
  BookOpen,
  AlertTriangle,
  Users
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PrioridadEscalamiento, ClasificacionProblema, EscalaEvaluacion } from '@/types';
import { escalamientosMock, usuariosMock } from '@/data/mockData';

interface EscalamientoFormProps {
  onVolver: () => void;
  onExito: () => void;
  escalamientoEditar?: typeof escalamientosMock[0];
}

const EscalamientoForm: React.FC<EscalamientoFormProps> = ({ onVolver, onExito, escalamientoEditar }) => {
  const { usuario, cargando, tema } = useAuth();
  const [enviado, setEnviado] = useState(false);
  const [nuevaRespuesta, setNuevaRespuesta] = useState('');
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: escalamientoEditar?.titulo || '',
    descripcion: escalamientoEditar?.descripcion || '',
    clasificacion: (escalamientoEditar?.clasificacion || 'Relacional') as ClasificacionProblema,
    prioridad: (escalamientoEditar?.prioridad || 'Normal') as PrioridadEscalamiento,
    evaluacion: (escalamientoEditar?.evaluacion || 'Regular') as EscalaEvaluacion,
    asignadoAId: escalamientoEditar?.asignadoAId || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEnviado(true);
    setTimeout(() => {
      onExito();
    }, 2000);
  };

  const enviarRespuesta = async () => {
    if (!nuevaRespuesta.trim()) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    setNuevaRespuesta('');
    setMostrarRespuesta(false);
  };

  const getColorPrioridad = (prioridad: PrioridadEscalamiento) => {
    switch (prioridad) {
      case 'Normal': return 'bg-green-100 text-green-700 border-green-300';
      case 'Importante': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Urgente': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'Abierto': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'En Tratamiento': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Cerrado': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Escalado': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColorClasificacion = (clasificacion: ClasificacionProblema) => {
    switch (clasificacion) {
      case 'Doctrinal': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'Moral': return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'Relacional': return 'bg-teal-100 text-teal-700 border-teal-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIconoClasificacion = (clasificacion: ClasificacionProblema) => {
    switch (clasificacion) {
      case 'Doctrinal': return <BookOpen className="w-4 h-4" />;
      case 'Moral': return <AlertTriangle className="w-4 h-4" />;
      case 'Relacional': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Obtener usuarios a los que se puede asignar según el rol
  const getUsuariosAsignables = () => {
    if (!usuario) return [];
    
    switch (usuario.rol) {
      case 'timoteo':
      case 'lider_gap':
        return usuariosMock.filter(u => u.rol === 'lider_mentor');
      case 'lider_mentor':
        return usuariosMock.filter(u => u.rol === 'pastor');
      case 'pastor':
        return usuariosMock.filter(u => u.rol === 'pastor_principal');
      case 'pastor_principal':
        // Pastor Principal puede asignar a otros pastores
        return usuariosMock.filter(u => u.rol === 'pastor');
      default:
        return [];
    }
  };

  if (enviado) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Card className="text-center py-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${tema.exito}20` }}>
            <CheckCircle className="w-10 h-10" style={{ color: tema.exito }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {escalamientoEditar ? '¡Respuesta Enviada!' : '¡Caso Creado!'}
          </h2>
          <p className="text-gray-600">
            {escalamientoEditar 
              ? 'Su respuesta ha sido registrada exitosamente.' 
              : 'El caso ha sido creado y asignado para su atención.'}
          </p>
        </Card>
      </div>
    );
  }

  // Modo ver/respuesta si es edición
  if (escalamientoEditar) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Caso</h1>
        </div>

        <div className="space-y-6">
          {/* Información del caso */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{escalamientoEditar.titulo}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    Creado por: {escalamientoEditar.creadorNombre}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Badge variant="outline" className={getColorClasificacion(escalamientoEditar.clasificacion)}>
                    {getIconoClasificacion(escalamientoEditar.clasificacion)}
                    <span className="ml-1">{escalamientoEditar.clasificacion}</span>
                  </Badge>
                  <Badge variant="outline" className={getColorPrioridad(escalamientoEditar.prioridad)}>
                    {escalamientoEditar.prioridad}
                  </Badge>
                  <Badge variant="outline" className={getColorEstado(escalamientoEditar.estado)}>
                    {escalamientoEditar.estado}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-500">Descripción</Label>
                <p className="mt-1">{escalamientoEditar.descripcion}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Creado: {new Date(escalamientoEditar.fechaCreacion).toLocaleDateString('es-ES')}
              </div>
            </CardContent>
          </Card>

          {/* Historial de respuestas */}
          {escalamientoEditar.respuestas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" style={{ color: tema.primario }} />
                  Historial de Respuestas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-64">
                  <div className="space-y-4">
                    {escalamientoEditar.respuestas.map((respuesta) => (
                      <div key={respuesta.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                              style={{ backgroundColor: tema.primario }}
                            >
                              {respuesta.usuarioNombre.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{respuesta.usuarioNombre}</p>
                              <p className="text-xs text-gray-500">{respuesta.usuarioRol}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(respuesta.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-gray-700">{respuesta.mensaje}</p>
                        <Badge variant="outline" className="mt-2">
                          {respuesta.accion}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Formulario de respuesta */}
          {!mostrarRespuesta ? (
            <Button
              type="button"
              onClick={() => setMostrarRespuesta(true)}
              className="w-full text-white"
              style={{ backgroundColor: tema.primario }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Responder
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nueva Respuesta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={nuevaRespuesta}
                  onChange={(e) => setNuevaRespuesta(e.target.value)}
                  placeholder="Escriba su respuesta..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrarRespuesta(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={enviarRespuesta}
                    disabled={!nuevaRespuesta.trim()}
                    className="text-white"
                    style={{ backgroundColor: tema.primario }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Respuesta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Modo crear nuevo caso
  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Caso de Escalamiento</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: tema.primario }} />
              Información del Caso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del Caso *</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Solicitud de oración por enfermedad"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción Detallada *</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describa la situación con el mayor detalle posible..."
                rows={5}
                required
              />
            </div>

            {/* Clasificación del problema */}
            <div className="space-y-2">
              <Label htmlFor="clasificacion">Clasificación del Problema *</Label>
              <Select 
                value={formData.clasificacion} 
                onValueChange={(value) => handleSelectChange('clasificacion', value as ClasificacionProblema)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctrinal">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Doctrinal - Dudas o confusiones sobre la fe
                    </div>
                  </SelectItem>
                  <SelectItem value="Moral">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Moral - Conducta o comportamiento
                    </div>
                  </SelectItem>
                  <SelectItem value="Relacional">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-500" />
                      Relacional - Conflictos interpersonales
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridad">Nivel de Prioridad *</Label>
                <Select 
                  value={formData.prioridad} 
                  onValueChange={(value) => handleSelectChange('prioridad', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Normal
                      </div>
                    </SelectItem>
                    <SelectItem value="Importante">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Importante
                      </div>
                    </SelectItem>
                    <SelectItem value="Urgente">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Urgente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evaluacion">Evaluación del Caso</Label>
                <Select 
                  value={formData.evaluacion} 
                  onValueChange={(value) => handleSelectChange('evaluacion', value as EscalaEvaluacion)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Espiritual">Espiritual</SelectItem>
                    <SelectItem value="Muy buena">Muy buena</SelectItem>
                    <SelectItem value="Buena">Buena</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Mala">Mala</SelectItem>
                    <SelectItem value="Muy Mala">Muy Mala</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asignadoAId">Asignar a</Label>
              <Select 
                value={formData.asignadoAId} 
                onValueChange={(value) => handleSelectChange('asignadoAId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {getUsuariosAsignables().map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre} {u.apellidos} ({u.rol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Si no asigna, el caso irá a su supervisor directo. Solo los casos <strong>Urgentes</strong> llegan al Pastor Principal.
              </p>
            </div>

            {/* Leyenda de colores */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Clasificación de Problemas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span><strong>Doctrinal:</strong> Dudas sobre la fe</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span><strong>Moral:</strong> Conducta o comportamiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-500" />
                  <span><strong>Relacional:</strong> Conflictos entre personas</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onVolver}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={cargando || !formData.titulo || !formData.descripcion}
                className="text-white"
                style={{ backgroundColor: tema.primario }}
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Crear Caso
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EscalamientoForm;
