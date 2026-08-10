import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Video, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff,
  Users,
  Monitor,
  MessageSquare,
  Crown,
  Sparkles,
  User,
  UserPlus,
  Plus,
  Copy,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { gapsMock, usuariosMock } from '@/data/mockData';

interface VideollamadaPastorPrincipalModuleProps {
  onVolver: () => void;
}

interface Participante {
  id: string;
  nombre: string;
  rol: string;
  imagen?: string;
  audio: boolean;
  video: boolean;
  conectado: boolean;
}

const VideollamadaPastorPrincipalModule: React.FC<VideollamadaPastorPrincipalModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [enLlamada, setEnLlamada] = useState(false);
  const [audioActivado, setAudioActivado] = useState(true);
  const [videoActivado, setVideoActivado] = useState(true);
  const [idSala, setIdSala] = useState('');
  const [tipoLlamada, setTipoLlamada] = useState<'gap' | 'rol' | 'personal'>('gap');
  const [seleccionGAP, setSeleccionGAP] = useState('');
  const [seleccionRol, setSeleccionRol] = useState('');
  const [seleccionUsuario, setSeleccionUsuario] = useState('');
  const [dialogoInvitarAbierto, setDialogoInvitarAbierto] = useState(false);
  const [participantes, setParticipantes] = useState<Participante[]>([
    { id: '1', nombre: 'Carlos Martínez', rol: 'Pastor Principal', audio: true, video: true, conectado: true },
  ]);

  // Obtener usuarios por rol
  const usuariosPorRol = (rol: string) => {
    return usuariosMock.filter(u => u.rol === rol);
  };

  const iniciarLlamada = () => {
    if (tipoLlamada === 'gap' && !seleccionGAP) {
      toast.error('Selecciona un GAP');
      return;
    }
    if (tipoLlamada === 'rol' && !seleccionRol) {
      toast.error('Selecciona un rol');
      return;
    }
    if (tipoLlamada === 'personal' && !seleccionUsuario) {
      toast.error('Selecciona un usuario');
      return;
    }

    // Generar ID de sala
    const nuevoIdSala = `IBC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setIdSala(nuevoIdSala);
    setEnLlamada(true);
    
    // Agregar participantes según la selección
    let nuevosParticipantes: Participante[] = [
      { id: usuario?.id || '1', nombre: usuario?.nombre || 'Pastor', rol: 'Pastor Principal', audio: true, video: true, conectado: true }
    ];

    if (tipoLlamada === 'gap') {
      const gap = gapsMock.find(g => g.id === seleccionGAP);
      if (gap) {
        nuevosParticipantes.push(
          { id: 'lider', nombre: gap.liderGapNombre, rol: 'Líder GAP', audio: true, video: true, conectado: true },
          { id: 'timoteo', nombre: gap.timoteoNombre, rol: 'Timoteo', audio: true, video: true, conectado: true }
        );
      }
    } else if (tipoLlamada === 'rol') {
      const usuarios = usuariosPorRol(seleccionRol).slice(0, 3);
      nuevosParticipantes.push(...usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        rol: u.rol === 'lider_gap' ? 'Líder GAP' : u.rol === 'lider_mentor' ? 'Líder Mentor' : u.rol === 'pastor' ? 'Pastor' : u.rol,
        audio: true,
        video: true,
        conectado: true
      })));
    } else if (tipoLlamada === 'personal') {
      const user = usuariosMock.find(u => u.id === seleccionUsuario);
      if (user) {
        nuevosParticipantes.push({
          id: user.id,
          nombre: user.nombre,
          rol: user.rol === 'lider_gap' ? 'Líder GAP' : user.rol === 'lider_mentor' ? 'Líder Mentor' : user.rol === 'pastor' ? 'Pastor' : user.rol,
          audio: true,
          video: true,
          conectado: true
        });
      }
    }

    setParticipantes(nuevosParticipantes);
    toast.success('Videollamada iniciada');
  };

  const finalizarLlamada = () => {
    setEnLlamada(false);
    setParticipantes([]);
    setIdSala('');
    toast.info('Videollamada finalizada');
  };

  const copiarIdSala = () => {
    navigator.clipboard.writeText(idSala);
    toast.success('ID de sala copiado al portapapeles');
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'Pastor Principal':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'Pastor':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'Líder Mentor':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'Líder GAP':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'Timoteo':
        return <User className="w-4 h-4 text-cyan-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRolBadgeColor = (rol: string) => {
    switch (rol) {
      case 'Pastor Principal':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pastor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Líder Mentor':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Líder GAP':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Timoteo':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (enLlamada) {
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header de la llamada */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-medium">En llamada</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{participantes.length} participantes</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sala:</span>
            <code className="bg-gray-700 text-white px-2 py-1 rounded text-sm font-mono">{idSala}</code>
            <Button variant="ghost" size="sm" onClick={copiarIdSala} className="text-gray-400 hover:text-white">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Área de video */}
        <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto">
          {participantes.map((participante, index) => (
            <div key={participante.id} className={`relative rounded-xl overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <div className={`w-full h-full flex items-center justify-center ${participante.video ? 'bg-gray-700' : 'bg-gray-800'}`}>
                {!participante.video ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2" style={{ backgroundColor: tema.primario }}>
                      {participante.nombre.charAt(0)}
                    </div>
                    <p className="text-white font-medium">{participante.nombre}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                      <VideoIcon className="w-16 h-16 text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Info del participante */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${getRolBadgeColor(participante.rol)} text-xs`}>
                    {getRolIcon(participante.rol)}
                    <span className="ml-1">{participante.rol}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {!participante.audio && <MicOff className="w-4 h-4 text-red-500" />}
                  {!participante.video && <VideoOff className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            </div>
          ))}
          
          {/* Botón para agregar participante */}
          <button 
            onClick={() => setDialogoInvitarAbierto(true)}
            className="rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-300 transition-colors"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm">Invitar</span>
          </button>
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
          <Button
            variant={audioActivado ? "outline" : "destructive"}
            size="lg"
            onClick={() => setAudioActivado(!audioActivado)}
            className="rounded-full w-14 h-14"
          >
            {audioActivado ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          
          <Button
            variant={videoActivado ? "outline" : "destructive"}
            size="lg"
            onClick={() => setVideoActivado(!videoActivado)}
            className="rounded-full w-14 h-14"
          >
            {videoActivado ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <Monitor className="w-6 h-6" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={finalizarLlamada}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        {/* Diálogo para invitar */}
        <Dialog open={dialogoInvitarAbierto} onOpenChange={setDialogoInvitarAbierto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Participante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Compartir ID de sala</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={idSala} readOnly className="font-mono" />
                  <Button onClick={copiarIdSala}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Comparte este ID con los participantes para que se unan a la llamada.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="w-6 h-6" style={{ color: tema.primario }} />
          Videollamada
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Tipo de llamada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: tema.primario }} />
              Iniciar Nueva Llamada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base">Tipo de llamada</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  onClick={() => setTipoLlamada('gap')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    tipoLlamada === 'gap' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: tipoLlamada === 'gap' ? tema.primario : '#9ca3af' }} />
                  <p className="font-medium">GAP Completo</p>
                  <p className="text-xs text-gray-500 mt-1">Líder + Timoteo</p>
                </button>
                <button
                  onClick={() => setTipoLlamada('rol')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    tipoLlamada === 'rol' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-6 h-6 mx-auto mb-2" style={{ color: tipoLlamada === 'rol' ? '#8b5cf6' : '#9ca3af' }} />
                  <p className="font-medium">Por Rol</p>
                  <p className="text-xs text-gray-500 mt-1">Todos de un rol</p>
                </button>
                <button
                  onClick={() => setTipoLlamada('personal')}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    tipoLlamada === 'personal' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" style={{ color: tipoLlamada === 'personal' ? '#22c55e' : '#9ca3af' }} />
                  <p className="font-medium">Personal</p>
                  <p className="text-xs text-gray-500 mt-1">Una persona</p>
                </button>
              </div>
            </div>

            {/* Selector según tipo */}
            {tipoLlamada === 'gap' && (
              <div>
                <Label>Seleccionar GAP</Label>
                <Select value={seleccionGAP} onValueChange={setSeleccionGAP}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona un GAP" />
                  </SelectTrigger>
                  <SelectContent>
                    {gapsMock.map(gap => (
                      <SelectItem key={gap.id} value={gap.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {gap.codigo} - {gap.barrio}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoLlamada === 'rol' && (
              <div>
                <Label>Seleccionar Rol</Label>
                <Select value={seleccionRol} onValueChange={setSeleccionRol}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pastor">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        Pastores
                      </div>
                    </SelectItem>
                    <SelectItem value="lider_mentor">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Líderes Mentor
                      </div>
                    </SelectItem>
                    <SelectItem value="lider_gap">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-green-500" />
                        Líderes GAP
                      </div>
                    </SelectItem>
                    <SelectItem value="timoteo">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-500" />
                        Timoteos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipoLlamada === 'personal' && (
              <div>
                <Label>Seleccionar Persona</Label>
                <Select value={seleccionUsuario} onValueChange={setSeleccionUsuario}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecciona una persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosMock.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          {getRolIcon(user.rol === 'lider_gap' ? 'Líder GAP' : user.rol === 'lider_mentor' ? 'Líder Mentor' : user.rol === 'pastor' ? 'Pastor' : user.rol)}
                          {user.nombre} {user.apellidos}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={iniciarLlamada}
              className="w-full text-white"
              style={{ backgroundColor: tema.primario }}
              size="lg"
            >
              <Video className="w-5 h-5 mr-2" />
              Iniciar Videollamada
            </Button>
          </CardContent>
        </Card>

        {/* Unirse a sala existente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: tema.primario }} />
              Unirse a Sala Existente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input 
                placeholder="Ingresa el ID de la sala" 
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={() => {
                  toast.success('Uniéndose a la sala...');
                  setEnLlamada(true);
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                Unirse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Llamadas recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Llamadas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'IBC-A1B2C3', nombre: 'GAP-1 - Reunión Semanal', fecha: 'Hoy, 10:30 AM', participantes: 5 },
                { id: 'IBC-D4E5F6', nombre: 'Pastores - Reunión Mensual', fecha: 'Ayer, 7:00 PM', participantes: 3 },
                { id: 'IBC-G7H8I9', nombre: 'Líderes Mentor - Capacitación', fecha: '15 Mar, 3:00 PM', participantes: 4 },
              ].map((llamada, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{llamada.nombre}</p>
                      <p className="text-sm text-gray-500">{llamada.fecha} • {llamada.participantes} participantes</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Reunirse
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideollamadaPastorPrincipalModule;
