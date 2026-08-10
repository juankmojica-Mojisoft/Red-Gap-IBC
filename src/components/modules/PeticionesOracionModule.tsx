import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  HandHeart, 
  Plus, 
  CheckCircle,
  Clock,
  User,
  Trash2
} from 'lucide-react';
import { peticionesOracionMock, crearPeticionOracion, marcarOracionRecibida } from '@/data/mockData';

interface PeticionesOracionModuleProps {
  onVolver: () => void;
}

const PeticionesOracionModule: React.FC<PeticionesOracionModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [peticiones, setPeticiones] = useState(peticionesOracionMock);
  const [comentarioOracion, setComentarioOracion] = useState('');
  const [peticionSeleccionada, setPeticionSeleccionada] = useState<string | null>(null);
  
  const [nuevaPeticion, setNuevaPeticion] = useState({
    titulo: '',
    descripcion: '',
  });

  const puedeCrear = usuario?.rol === 'lider_mentor' || usuario?.rol === 'lider_gap' || usuario?.rol === 'timoteo';
  const esPastor = usuario?.rol === 'pastor' || usuario?.rol === 'pastor_principal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario && nuevaPeticion.titulo) {
      const peticionCreada = crearPeticionOracion({
        ...nuevaPeticion,
        creadorId: usuario.id,
        creadorNombre: `${usuario.nombre} ${usuario.apellidos}`,
        creadorRol: usuario.rol,
        pastorId: usuario.pastorId || usuario.id,
        oracionRecibida: false,
      });
      setPeticiones([...peticiones, peticionCreada]);
      setNuevaPeticion({ titulo: '', descripcion: '' });
      setMostrarFormulario(false);
    }
  };

  const handleMarcarOracionRecibida = (peticionId: string) => {
    if (marcarOracionRecibida(peticionId, comentarioOracion)) {
      setPeticiones(peticiones.map(p => 
        p.id === peticionId 
          ? { ...p, oracionRecibida: true, fechaOracionRecibida: new Date().toISOString().split('T')[0], comentarios: comentarioOracion }
          : p
      ));
      setPeticionSeleccionada(null);
      setComentarioOracion('');
    }
  };

  const eliminarPeticion = (id: string) => {
    setPeticiones(peticiones.filter(p => p.id !== id));
  };

  // Filtrar peticiones según el rol
  const peticionesFiltradas = esPastor 
    ? peticiones.filter(p => p.pastorId === usuario?.id)
    : peticiones.filter(p => p.creadorId === usuario?.id);

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Peticiones De Oración</h1>
        </div>
        {puedeCrear && (
          <Button 
            onClick={() => setMostrarFormulario(true)}
            className="text-white"
            style={{ backgroundColor: tema.primario }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Petición
          </Button>
        )}
      </div>

      {/* Formulario de nueva petición */}
      {mostrarFormulario && puedeCrear && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Crear Nueva Petición</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={nuevaPeticion.titulo}
                  onChange={(e) => setNuevaPeticion({...nuevaPeticion, titulo: e.target.value})}
                  placeholder="Ej: Oración Por Sanidad"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={nuevaPeticion.descripcion}
                  onChange={(e) => setNuevaPeticion({...nuevaPeticion, descripcion: e.target.value})}
                  placeholder="Describa La Situación Que Requiere Oración"
                  rows={4}
                />
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
                  <HandHeart className="w-4 h-4 mr-2" />
                  Enviar Petición
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de peticiones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {esPastor ? 'Peticiones Para Su Oración' : 'Mis Peticiones'}
        </h2>
        
        {peticionesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <HandHeart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No Hay Peticiones Registradas</p>
            </CardContent>
          </Card>
        ) : (
          peticionesFiltradas.map((peticion) => (
            <Card key={peticion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{peticion.titulo}</h3>
                      {peticion.oracionRecibida ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Oración Recibida
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{peticion.descripcion}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" style={{ color: tema.primario }} />
                        <span>Creado Por: {peticion.creadorNombre}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" style={{ color: tema.primario }} />
                        <span>{new Date(peticion.fechaCreacion).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    {peticion.oracionRecibida && peticion.comentarios && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Comentarios Del Pastor:</strong> {peticion.comentarios}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Oración Recibida El: {new Date(peticion.fechaOracionRecibida!).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {esPastor && !peticion.oracionRecibida && (
                      <>
                        {peticionSeleccionada === peticion.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Agregue Un Comentario (Opcional)"
                              value={comentarioOracion}
                              onChange={(e) => setComentarioOracion(e.target.value)}
                              className="w-48"
                              rows={2}
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPeticionSeleccionada(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMarcarOracionRecibida(peticion.id)}
                                className="text-white bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setPeticionSeleccionada(peticion.id)}
                            className="text-white"
                            style={{ backgroundColor: tema.primario }}
                          >
                            <HandHeart className="w-4 h-4 mr-1" />
                            Marcar Oración Recibida
                          </Button>
                        )}
                      </>
                    )}
                    {(peticion.creadorId === usuario?.id || esPastor) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarPeticion(peticion.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PeticionesOracionModule;
