import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Loader2,
  BookOpen,
  Crown,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { gapsMock, miembrosMock, escalamientosMock, getEstadisticas, usuariosMock } from '@/data/mockData';
import { jsPDF } from 'jspdf';
import { formatearHora12 } from '@/lib/utils';
import { getAllGAPs, getAllMiembros, getAllUsuarios, getAllEscalamientos } from '@/services/dataService';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';


interface ReportesModuleProps {
  onVolver: () => void;
}

const ReportesModule: React.FC<ReportesModuleProps> = ({ onVolver }) => {
  const { tema } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [generando, setGenerando] = useState(false);
  const [periodo, setPeriodo] = useState('marzo-2026');
  
  const estadisticas = getEstadisticas();

  const handleGenerarReporte = async (tipo: string) => {
    setGenerando(true);
    toast.info('Conectando a la base de datos Supabase...');
    
    let gaps = gapsMock;
    let miembros = miembrosMock;
    let usuarios = usuariosMock;
    let escalamientos = escalamientosMock;
    
    try {
      const dbGaps = await getAllGAPs();
      if (dbGaps && dbGaps.length > 0) gaps = dbGaps;
      
      const dbMiembros = await getAllMiembros();
      if (dbMiembros && dbMiembros.length > 0) miembros = dbMiembros;
      
      const dbUsuarios = await getAllUsuarios();
      if (dbUsuarios && dbUsuarios.length > 0) usuarios = dbUsuarios;
      
      const dbEscalamientos = await getAllEscalamientos();
      if (dbEscalamientos && dbEscalamientos.length > 0) escalamientos = dbEscalamientos;
      
      console.log('Datos obtenidos de Supabase.');
    } catch (e) {
      console.warn('Usando datos locales debido a error de base de datos o de red:', e);
    }

    try {
      const doc = new jsPDF();
      let pageNum = 1;
      
      // Parsear tema color primario
      const hex = tema.primario;
      let r = 59, g = 130, b = 246; // fallback blue
      try {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      } catch (err) {
        console.error('Error parsing color:', err);
      }
      
      const colorPrimario = { r, g, b };
      
      const applyHeaderFooter = (activeDoc: any, page: number) => {
        // Linea decorativa arriba
        activeDoc.setFillColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
        activeDoc.rect(0, 0, 210, 4, 'F');
        
        // Header
        activeDoc.setFont('helvetica', 'normal');
        activeDoc.setFontSize(8);
        activeDoc.setTextColor(100, 116, 139);
        activeDoc.text('IGLESIA BAUTISTA CENTRAL - PORTAL G.A.P', 14, 10);
        activeDoc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 196, 10, { align: 'right' });
        activeDoc.setDrawColor(226, 232, 240);
        activeDoc.line(14, 12, 196, 12);
        
        // Footer
        activeDoc.line(14, 282, 196, 282);
        activeDoc.text('Reporte Oficial Generado Directamente desde la Base de Datos', 14, 287);
        activeDoc.text(`Página ${page}`, 196, 287, { align: 'right' });
      };

      // Portada/Header de la primera página
      applyHeaderFooter(doc, pageNum);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
      doc.text('REPORTE EJECUTIVO DE G.A.P', 14, 28);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tipo de Reporte: ${tipo === 'General' ? 'Resumen Ejecutivo General' : `Detalle de ${tipo}`}`, 14, 34);
      doc.text(`Solicitado por: Panel de Liderazgo y Pastores`, 14, 39);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 44, 196, 44);

      if (tipo === 'General') {
        // --- REPORTE GENERAL ---
        // Caja de KPIs
        doc.setFillColor(248, 250, 252); // Gris muy claro
        doc.rect(14, 50, 182, 35, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, 50, 182, 35, 'S');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text('INDICADORES GENERALES', 20, 56);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Total Usuarios del Sistema: ${usuarios.length}`, 20, 64);
        doc.text(`Total Grupos G.A.P Activos: ${gaps.filter(g => g.activo).length}`, 20, 70);
        doc.text(`Total Integrantes Registrados: ${miembros.length}`, 20, 76);
        
        doc.text(`Asistencia Promedio: ${estadisticas.asistenciaPromedio}%`, 110, 64);
        doc.text(`Casos Urgentes Activos: ${escalamientos.filter(e => e.prioridad === 'Urgente' && e.estado !== 'Cerrado').length}`, 110, 70);
        doc.text(`Bautizos Registrados (Mes): ${estadisticas.bautizosMes}`, 110, 76);

        // Sección de GAPs
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
        doc.text('RESUMEN DE GRUPOS G.A.P', 14, 98);
        
        let y = 106;
        // Dibujar tabla de GAPs
        doc.setFillColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
        doc.rect(14, y, 182, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('CÓDIGO', 18, y + 5);
        doc.text('LÍDER GAP', 42, y + 5);
        doc.text('PASTOR ASIGNADO', 92, y + 5);
        doc.text('MODALIDAD', 142, y + 5);
        doc.text('MIEMBROS', 174, y + 5);
        
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        y += 7;
        
        gaps.forEach((gap, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, 182, 7, 'F');
          }
          doc.text(gap.codigo, 18, y + 5);
          doc.text(gap.liderGapNombre.length > 25 ? gap.liderGapNombre.slice(0, 23) + '..' : gap.liderGapNombre, 42, y + 5);
          doc.text(gap.pastorNombre.length > 25 ? gap.pastorNombre.slice(0, 23) + '..' : gap.pastorNombre, 92, y + 5);
          doc.text(gap.modalidad, 142, y + 5);
          doc.text(`${gap.miembros.length}`, 174, y + 5);
          y += 7;
        });

        // Sección de Casos Críticos
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
        doc.text('SEGUIMIENTO DE CASOS CRÍTICOS / URGENTES', 14, y);
        y += 6;
        
        const urgentes = escalamientos.filter(e => e.prioridad === 'Urgente' || e.prioridad === 'Importante');
        if (urgentes.length === 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text('No se reportan casos con prioridad Urgente o Importante pendientes.', 14, y + 5);
        } else {
          doc.setFillColor(15, 23, 42);
          doc.rect(14, y, 182, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text('CASO / TÍTULO', 18, y + 5);
          doc.text('CLASIFICACIÓN', 75, y + 5);
          doc.text('PRIORIDAD', 115, y + 5);
          doc.text('ESTADO', 145, y + 5);
          doc.text('CREADOR', 170, y + 5);
          
          doc.setTextColor(15, 23, 42);
          doc.setFont('helvetica', 'normal');
          y += 7;
          
          urgentes.forEach((e, idx) => {
            if (idx % 2 === 0) {
              doc.setFillColor(248, 250, 252);
              doc.rect(14, y, 182, 7, 'F');
            }
            doc.text(e.titulo.length > 30 ? e.titulo.slice(0, 28) + '..' : e.titulo, 18, y + 5);
            doc.text(e.clasificacion, 75, y + 5);
            doc.text(e.prioridad, 115, y + 5);
            doc.text(e.estado, 145, y + 5);
            doc.text(e.creadorNombre.split(' ')[0], 170, y + 5);
            y += 7;
          });
        }
        
      } else if (tipo === 'GAPs') {
        // --- DETALLE DE GAPs ---
        let y = 50;
        gaps.forEach((gap) => {
          if (y > 230) {
            doc.addPage();
            pageNum++;
            applyHeaderFooter(doc, pageNum);
            y = 25;
          }
          
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 40, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.rect(14, y, 182, 40, 'S');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
          doc.text(`${gap.codigo} - Barrio: ${gap.barrio}`, 18, y + 6);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`Líder: ${gap.liderGapNombre}`, 18, y + 14);
          doc.text(`Timoteo: ${gap.timoteoNombre}`, 18, y + 20);
          doc.text(`Pastor asignado: ${gap.pastorNombre}`, 18, y + 26);
          doc.text(`Líder Mentor: ${gap.liderMentorNombre}`, 18, y + 32);
          
          doc.text(`Día/Hora: ${gap.diaReunion} a las ${formatearHora12(gap.horaReunion)}`, 110, y + 14);
          doc.text(`Frecuencia/Modalidad: ${gap.frecuencia} / ${gap.modalidad}`, 110, y + 20);
          doc.text(`Dirección: ${gap.direccion.length > 35 ? gap.direccion.slice(0, 33) + '..' : gap.direccion}`, 110, y + 26);
          doc.text(`Total Integrantes: ${gap.miembros.length + 2}`, 110, y + 32);
          
          y += 45;
        });
        
      } else if (tipo === 'Escalamientos') {
        // --- DETALLE DE ESCALAMIENTOS ---
        let y = 50;
        escalamientos.forEach((e) => {
          if (y > 230) {
            doc.addPage();
            pageNum++;
            applyHeaderFooter(doc, pageNum);
            y = 25;
          }
          
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 40, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.rect(14, y, 182, 40, 'S');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.setTextColor(e.prioridad === 'Urgente' ? 239 : colorPrimario.r, e.prioridad === 'Urgente' ? 68 : colorPrimario.g, e.prioridad === 'Urgente' ? 68 : colorPrimario.b);
          doc.text(`${e.titulo} [Prioridad: ${e.prioridad}]`, 18, y + 6);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`Descripción: ${e.descripcion.length > 90 ? e.descripcion.slice(0, 87) + '...' : e.descripcion}`, 18, y + 14);
          doc.text(`Clasificación: ${e.clasificacion} | Estado: ${e.estado}`, 18, y + 20);
          doc.text(`Creador: ${e.creadorNombre} (${e.creadorRol})`, 18, y + 26);
          doc.text(`Asignado a: ${e.asignadoANombre || 'Sin asignar'}`, 18, y + 32);
          
          doc.text(`Fecha Creación: ${e.fechaCreacion}`, 130, y + 20);
          doc.text(`Fecha Límite: ${e.fechaLimite || 'No establecida'}`, 130, y + 26);
          doc.text(`Acciones/Respuestas: ${e.respuestas.length} comentarios`, 130, y + 32);
          
          y += 45;
        });
        
      } else if (tipo === 'Miembros') {
        // --- DETALLE DE MIEMBROS ---
        let y = 50;
        
        doc.setFillColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
        doc.rect(14, y, 182, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('NOMBRE COMPLETO', 18, y + 5);
        doc.text('TELÉFONO', 75, y + 5);
        doc.text('CORREO ELECTRÓNICO', 105, y + 5);
        doc.text('CURSO EFC', 152, y + 5);
        doc.text('BAUTIZADO', 180, y + 5);
        
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        y += 7;
        
        miembros.forEach((m, idx) => {
          if (y > 270) {
            doc.addPage();
            pageNum++;
            applyHeaderFooter(doc, pageNum);
            y = 20;
            
            doc.setFillColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
            doc.rect(14, y, 182, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text('NOMBRE COMPLETO', 18, y + 5);
            doc.text('TELÉFONO', 75, y + 5);
            doc.text('CORREO ELECTRÓNICO', 105, y + 5);
            doc.text('CURSO EFC', 152, y + 5);
            doc.text('BAUTIZADO', 180, y + 5);
            
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'normal');
            y += 7;
          }
          
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, 182, 7, 'F');
          }
          
          doc.text(`${m.nombres} ${m.apellidos}`, 18, y + 5);
          doc.text(m.telefono, 75, y + 5);
          doc.text(m.correo || 'No registrado', 105, y + 5);
          doc.text(m.escuelaFormacion, 152, y + 5);
          doc.text(m.esBautizado ? 'Sí' : 'No', 180, y + 5);
          y += 7;
        });
      } else if (tipo === 'Lideres') {
        // --- DETALLE DE LÍDERES Y TIMOTEOS ---
        let y = 50;
        
        doc.setFillColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
        doc.rect(14, y, 182, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('NOMBRE COMPLETO', 18, y + 5);
        doc.text('ROL', 75, y + 5);
        doc.text('GAP', 100, y + 5);
        doc.text('MENTOR', 125, y + 5);
        doc.text('EFC ESTADO', 165, y + 5);
        
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        y += 7;
        
        const lideresYTimoteos = usuarios.filter(u => u.rol === 'lider_gap' || u.rol === 'timoteo');
        
        lideresYTimoteos.forEach((u, idx) => {
          if (y > 270) {
            doc.addPage();
            pageNum++;
            applyHeaderFooter(doc, pageNum);
            y = 20;
            
            doc.setFillColor(colorPrimario.r, colorPrimario.g, colorPrimario.b);
            doc.rect(14, y, 182, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text('NOMBRE COMPLETO', 18, y + 5);
            doc.text('ROL', 75, y + 5);
            doc.text('GAP', 100, y + 5);
            doc.text('MENTOR', 125, y + 5);
            doc.text('EFC ESTADO', 165, y + 5);
            
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'normal');
            y += 7;
          }
          
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, y, 182, 7, 'F');
          }
          
          const gap = gaps.find(g => g.liderGapId === u.id || g.timoteoId === u.id);
          const mentor = usuarios.find(m => m.id === u.liderMentorId);
          
          doc.text(`${u.nombre} ${u.apellidos}`, 18, y + 5);
          doc.text(u.rol === 'lider_gap' ? 'Líder GAP' : 'Timoteo', 75, y + 5);
          doc.text(gap ? gap.codigo : 'Ninguno', 100, y + 5);
          doc.text(mentor ? mentor.nombre : 'Ninguno', 125, y + 5);
          doc.text(u.escuelaFormacion, 165, y + 5);
          y += 7;
        });
      }

      doc.save(`Reporte_Ejecutivo_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Reporte Ejecutivo (${tipo}) en PDF descargado exitosamente`);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      toast.error('Ocurrió un error al generar el archivo PDF');
    } finally {
      setGenerando(false);
    }
  };

  // Datos para gráficos
  const gapsPorZona = [
    { zona: 'Zona Norte', gaps: 2, color: '#3b82f6' },
    { zona: 'Zona Sur', gaps: 1, color: '#10b981' },
    { zona: 'Zona Occidente', gaps: 0, color: '#f59e0b' },
  ];

  const escalamientosPorClasificacion = [
    { clasificacion: 'Doctrinal', cantidad: 2, color: '#6366f1' },
    { clasificacion: 'Moral', cantidad: 0, color: '#f43f5e' },
    { clasificacion: 'Relacional', cantidad: 3, color: '#14b8a6' },
  ];

  const miembrosPorMinisterio = [
    { ministerio: 'Forjados', cantidad: 1 },
    { ministerio: 'Mujer Real', cantidad: 1 },
    { ministerio: 'Sin ministerio', cantidad: 1 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Reportes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marzo-2026">Marzo 2026</SelectItem>
              <SelectItem value="febrero-2026">Febrero 2026</SelectItem>
              <SelectItem value="enero-2026">Enero 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">GAPs</span>
          </TabsTrigger>
          <TabsTrigger value="escalamientos" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Escalamientos</span>
          </TabsTrigger>
          <TabsTrigger value="miembros" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Miembros</span>
          </TabsTrigger>
          <TabsTrigger value="lideres" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Liderazgo</span>
          </TabsTrigger>
        </TabsList>

        {/* Reporte General */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total GAPs</p>
                    <p className="text-2xl font-bold" style={{ color: tema.primario }}>
                      {estadisticas.totalGAPs}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tema.primario}20` }}>
                    <Users className="w-5 h-5" style={{ color: tema.primario }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Miembros</p>
                    <p className="text-2xl font-bold" style={{ color: tema.secundario }}>
                      {estadisticas.totalMiembros}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tema.secundario}20` }}>
                    <Users className="w-5 h-5" style={{ color: tema.secundario }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Escalamientos Abiertos</p>
                    <p className="text-2xl font-bold" style={{ color: tema.advertencia }}>
                      {estadisticas.escalamientosAbiertos}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tema.advertencia}20` }}>
                    <TrendingUp className="w-5 h-5" style={{ color: tema.advertencia }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Casos Urgentes</p>
                    <p className="text-2xl font-bold" style={{ color: tema.error }}>
                      {estadisticas.escalamientosUrgentes}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tema.error}20` }}>
                    <Activity className="w-5 h-5" style={{ color: tema.error }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: tema.primario }} />
                Reporte General del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total de Usuarios</Label>
                  <p className="text-lg font-medium">{estadisticas.totalUsuarios}</p>
                </div>
                <div className="space-y-2">
                  <Label>Total de Zonas</Label>
                  <p className="text-lg font-medium">{estadisticas.totalZonas}</p>
                </div>
                <div className="space-y-2">
                  <Label>Grupos Activos</Label>
                  <p className="text-lg font-medium">{estadisticas.gruposActivos}</p>
                </div>
                <div className="space-y-2">
                  <Label>Grupos Inactivos</Label>
                  <p className="text-lg font-medium">{estadisticas.gruposInactivos}</p>
                </div>
              </div>

              <Button
                onClick={() => handleGenerarReporte('General')}
                disabled={generando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                {generando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Reporte General
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de GAPs */}
        <TabsContent value="gaps">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" style={{ color: tema.primario }} />
                  GAPs por Zona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gapsPorZona.map((zona, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: zona.color }}
                      />
                      <span className="flex-1">{zona.zona}</span>
                      <span className="font-medium">{zona.gaps} GAPs</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total GAPs:</span>
                    <span className="font-medium">{gapsMock.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: tema.primario }} />
                  Detalle de GAPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gapsMock.map((gap) => (
                    <div key={gap.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{gap.codigo}</p>
                          <p className="text-sm text-gray-500">
                            {gap.pastorNombre} | {gap.frecuencia} | {gap.modalidad}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${gap.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {gap.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Indicadores de GAPs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.asistenciaPromedio}</p>
                  <p className="text-sm text-gray-600">Asistencia Promedio</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{estadisticas.bautizosMes}</p>
                  <p className="text-sm text-gray-600">Bautizos del Mes</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{estadisticas.graduadosEFC}</p>
                  <p className="text-sm text-gray-600">Graduados EFC</p>
                </div>
              </div>
              <Button
                onClick={() => handleGenerarReporte('GAPs')}
                disabled={generando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de GAPs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Escalamientos */}
        <TabsContent value="escalamientos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" style={{ color: tema.primario }} />
                  Escalamientos por Clasificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {escalamientosPorClasificacion.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="flex-1">{item.clasificacion}</span>
                      <span className="font-medium">{item.cantidad} casos</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Casos:</span>
                    <span className="font-medium">{escalamientosMock.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{ color: tema.primario }} />
                  Estado de Escalamientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Abiertos</span>
                    <span className="font-medium text-blue-600">
                      {escalamientosMock.filter(e => e.estado === 'Abierto').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span>En Tratamiento</span>
                    <span className="font-medium text-purple-600">
                      {escalamientosMock.filter(e => e.estado === 'En Tratamiento').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Cerrados</span>
                    <span className="font-medium text-gray-600">
                      {escalamientosMock.filter(e => e.estado === 'Cerrado').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <Button
                onClick={() => handleGenerarReporte('Escalamientos')}
                disabled={generando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de Escalamientos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Miembros */}
        <TabsContent value="miembros">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: tema.primario }} />
                  Miembros por Ministerio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {miembrosPorMinisterio.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{item.ministerio}</span>
                      <span className="font-medium">{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: tema.primario }} />
                  Estado de los Miembros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span>Miembros IBC</span>
                    <span className="font-medium text-green-600">
                      {miembrosMock.filter(m => m.esMiembroIBC).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Bautizados</span>
                    <span className="font-medium text-blue-600">
                      {miembrosMock.filter(m => m.esBautizado).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span>Cursando EFC</span>
                    <span className="font-medium text-yellow-600">
                      {miembrosMock.filter(m => m.escuelaFormacion === 'Cursando').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span>Graduados EFC</span>
                    <span className="font-medium text-purple-600">
                      {miembrosMock.filter(m => m.escuelaFormacion === 'Graduado').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <Button
                onClick={() => handleGenerarReporte('Miembros')}
                disabled={generando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de Miembros
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Líderes y Timoteos */}
        <TabsContent value="lideres" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4" style={{ borderLeftColor: tema.primario }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Líderes GAP</p>
                    <p className="text-2xl font-bold">{usuariosMock.filter(u => u.rol === 'lider_gap').length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tema.primario}20` }}>
                    <Crown className="w-5 h-5" style={{ color: tema.primario }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4" style={{ borderLeftColor: tema.secundario }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Timoteos</p>
                    <p className="text-2xl font-bold">{usuariosMock.filter(u => u.rol === 'timoteo').length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tema.secundario}20` }}>
                    <Users className="w-5 h-5" style={{ color: tema.secundario }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Graduados EFC</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {usuariosMock.filter(u => (u.rol === 'lider_gap' || u.rol === 'timoteo') && u.escuelaFormacion === 'Graduado').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">En Formación (EFC)</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {usuariosMock.filter(u => (u.rol === 'lider_gap' || u.rol === 'timoteo') && u.escuelaFormacion === 'Cursando').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Crecimiento de Liderazgo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: tema.primario }} />
                Crecimiento Histórico de Liderazgo (Líderes y Timoteos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { mes: 'Ene', lideres: 8, timoteos: 5 },
                    { mes: 'Feb', lideres: 9, timoteos: 6 },
                    { mes: 'Mar', lideres: 11, timoteos: 7 },
                    { mes: 'Abr', lideres: 12, timoteos: 8 },
                    { mes: 'May', lideres: 14, timoteos: 9 },
                    { mes: 'Jun', lideres: 15, timoteos: 11 },
                  ]}>
                    <defs>
                      <linearGradient id="colorLideres2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tema.primario} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={tema.primario} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTimoteos2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tema.secundario} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={tema.secundario} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Area type="monotone" dataKey="lideres" stroke={tema.primario} fillOpacity={1} fill="url(#colorLideres2)" name="Líderes de GAP" />
                    <Area type="monotone" dataKey="timoteos" stroke={tema.secundario} fillOpacity={1} fill="url(#colorTimoteos2)" name="Timoteos Activos" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Listado y Detalles de Liderazgo */}
          <Card>
            <CardHeader>
              <CardTitle>Listado General de Liderazgo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuariosMock
                  .filter(u => u.rol === 'lider_gap' || u.rol === 'timoteo')
                  .map((u) => {
                    const gap = gapsMock.find(g => g.liderGapId === u.id || g.timoteoId === u.id);
                    const mentor = usuariosMock.find(m => m.id === u.liderMentorId);
                    const miembroCount = gap ? miembrosMock.filter(m => m.gapId === gap.id).length : 0;
                    return (
                      <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4 font-sans text-slate-850">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: u.rol === 'lider_gap' ? tema.primario : tema.secundario }}>
                            {u.nombre.charAt(0)}{u.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.nombre} {u.apellidos}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge className={u.rol === 'lider_gap' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'}>
                                {u.rol === 'lider_gap' ? 'Líder GAP' : 'Timoteo'}
                              </Badge>
                              <Badge variant="outline" className="bg-white text-gray-500">
                                {gap ? gap.codigo : 'No asignado'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 text-xs text-gray-500">
                          <div>
                            <p className="text-[10px] text-gray-400">Mentor Asignado</p>
                            <p className="font-medium text-gray-700 mt-0.5">{mentor ? `${mentor.nombre} ${mentor.apellidos.split(' ')[0]}` : 'Ninguno'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Escuela de Formación (EFC)</p>
                            <p className="font-medium text-gray-700 mt-0.5">{u.escuelaFormacion} {u.moduloEFC ? `(${u.moduloEFC})` : ''}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Teléfono</p>
                            <p className="font-medium text-gray-700 mt-0.5">{u.telefono}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Miembros Activos</p>
                            <p className="font-medium text-gray-700 mt-0.5">{miembroCount} miembros</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Button
                onClick={() => handleGenerarReporte('Lideres')}
                disabled={generando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de Líderes y Timoteos (PDF)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportesModule;
