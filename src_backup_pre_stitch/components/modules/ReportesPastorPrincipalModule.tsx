import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Loader2,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  BookOpen,
  Crown,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  gapsMock, 
  miembrosMock, 
  escalamientosMock, 
  getEstadisticas,
  usuariosMock 
} from '@/data/mockData';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { formatearHora12 } from '@/lib/utils';
import { getAllGAPs, getAllMiembros, getAllUsuarios, getAllEscalamientos } from '@/services/dataService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Line,
  AreaChart,
  Area
} from 'recharts';

interface ReportesPastorPrincipalModuleProps {
  onVolver: () => void;
}

const ReportesPastorPrincipalModule: React.FC<ReportesPastorPrincipalModuleProps> = ({ onVolver }) => {
  const { tema } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [generando, setGenerando] = useState(false);
  const [generandoExcel, setGenerandoExcel] = useState(false);
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
      doc.text(`Solicitado por: Pastor Principal`, 14, 39);
      
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
        
      } else if (tipo === 'Integrantes') {
        // --- DETALLE DE INTEGRANTES ---
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

  const handleDescargarExcel = async () => {
    setGenerandoExcel(true);
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
      console.warn('Usando datos de sesión locales debido a error de red o de base de datos:', e);
    }

    try {
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen General
      const resumenData = [
        { 'Métrica': 'Total Usuarios', 'Valor': usuarios.length },
        { 'Métrica': 'GAPs Activos', 'Valor': gaps.filter(g => g.activo).length },
        { 'Métrica': 'Total Integrantes', 'Valor': miembros.length },
        { 'Métrica': 'Casos Urgentes', 'Valor': escalamientos.filter(e => e.prioridad === 'Urgente' && e.estado !== 'Cerrado').length },
        { 'Métrica': 'Asistencia Promedio (%)', 'Valor': `${estadisticas.asistenciaPromedio}%` },
      ];
      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');
      
      // Hoja 2: Lista de GAPs
      const gapsData = gaps.map(g => ({
        'Código': g.codigo,
        'Estado': g.activo ? 'Activo' : 'Inactivo',
        'Barrio': g.barrio,
        'Departamento': g.departamento,
        'Dirección': g.direccion,
        'Día Reunión': g.diaReunion,
        'Hora Reunión': g.horaReunion,
        'Modalidad': g.modalidad,
        'Frecuencia': g.frecuencia,
        'Líder GAP': g.liderGapNombre,
        'Timoteo': g.timoteoNombre,
        'Pastor Asignado': g.pastorNombre,
        'Líder Mentor': g.liderMentorNombre,
        'Número de Integrantes': g.miembros.length,
      }));
      const wsGaps = XLSX.utils.json_to_sheet(gapsData);
      XLSX.utils.book_append_sheet(wb, wsGaps, 'Lista de GAPs');
      
      // Hoja 3: Lista de Integrantes
      const miembrosData = miembros.map(m => {
        const gap = gaps.find(g => g.id === m.gapId);
        return {
          'Nombres': m.nombres,
          'Apellidos': m.apellidos,
          'Tipo Doc': m.tipoDocumento,
          'Documento': m.numeroDocumento,
          'Teléfono': m.telefono,
          'WhatsApp': m.numeroWhatsApp || 'No',
          'Correo': m.correo || 'No registrado',
          'Dirección': m.direccion,
          'Barrio': m.barrio,
          'Departamento': m.departamento,
          'Profesión': m.profesion || 'No registrada',
          'Miembro IBC': m.esMiembroIBC ? 'Sí' : 'No',
          'Bautizado': m.esBautizado ? 'Sí' : 'No',
          'Escuela Formación (EFC)': m.escuelaFormacion,
          'Módulo EFC': m.moduloEFC || 'Ninguno',
          'GAP Perteneciente': gap ? gap.codigo : 'No asignado',
          'Ministerios': m.ministerios.join(', '),
          'Franja Generacional': m.franjaGeneracional || 'Ninguna',
          'Área Servidores': m.areaServidores || 'Ninguna',
        };
      });
      const wsMiembros = XLSX.utils.json_to_sheet(miembrosData);
      XLSX.utils.book_append_sheet(wb, wsMiembros, 'Integrantes');
      
      // Hoja 4: Escalamientos
      const casosData = escalamientos.map(e => {
        const gap = gaps.find(g => g.id === e.gapId);
        return {
          'Título': e.titulo,
          'Descripción': e.descripcion,
          'Clasificación': e.clasificacion,
          'Prioridad': e.prioridad,
          'Estado': e.estado,
          'Fecha Creación': e.fechaCreacion,
          'Creador': e.creadorNombre,
          'Creador Rol': e.creadorRol,
          'Asignado A': e.asignadoANombre || 'No asignado',
          'GAP': gap ? gap.codigo : (e.gapId || 'No asignado'),
        };
      });
      const wsCasos = XLSX.utils.json_to_sheet(casosData);
      XLSX.utils.book_append_sheet(wb, wsCasos, 'Escalamientos');

      // Hoja 5: Líderes y Timoteos
      const lideresYTimoteosData = usuarios
        .filter(u => u.rol === 'lider_gap' || u.rol === 'timoteo')
        .map(u => {
          const gap = gaps.find(g => g.liderGapId === u.id || g.timoteoId === u.id);
          const mentor = usuarios.find(m => m.id === u.liderMentorId);
          return {
            'Nombres': u.nombre,
            'Apellidos': u.apellidos,
            'Rol': u.rol === 'lider_gap' ? 'Líder GAP' : 'Timoteo',
            'Documento': u.numeroDocumento,
            'Teléfono': u.telefono,
            'Correo': u.correo,
            'GAP Asignado': gap ? gap.codigo : 'Ninguno',
            'Mentor Asignado': mentor ? `${mentor.nombre} ${mentor.apellidos}` : 'Ninguno',
            'EFC Estado': u.escuelaFormacion,
            'EFC Módulo': u.moduloEFC || 'Ninguno',
          };
        });
      const wsLideres = XLSX.utils.json_to_sheet(lideresYTimoteosData);
      XLSX.utils.book_append_sheet(wb, wsLideres, 'Líderes y Timoteos');
      
      // Descargar archivo
      XLSX.writeFile(wb, `Reporte_General_GAP_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Reporte General en Excel descargado exitosamente');
    } catch (err) {
      console.error('Error generando Excel:', err);
      toast.error('Ocurrió un error al generar el archivo Excel');
    } finally {
      setGenerandoExcel(false);
    }
  };

  // Datos para gráficos
  const datosCrecimiento = [
    { mes: 'Ene', miembros: 45, bautizos: 3, nuevos: 5 },
    { mes: 'Feb', miembros: 48, bautizos: 2, nuevos: 4 },
    { mes: 'Mar', miembros: 52, bautizos: 4, nuevos: 6 },
    { mes: 'Abr', miembros: 55, bautizos: 1, nuevos: 3 },
    { mes: 'May', miembros: 58, bautizos: 3, nuevos: 5 },
    { mes: 'Jun', miembros: 62, bautizos: 5, nuevos: 7 },
  ];

  const gapsPorPastor = usuariosMock
    .filter(u => u.rol === 'pastor')
    .map(pastor => ({
      nombre: `${pastor.nombre} ${pastor.apellidos.split(' ')[0]}`,
      gaps: gapsMock.filter(g => g.pastorId === pastor.id).length,
      miembros: miembrosMock.filter(m => {
        const gap = gapsMock.find(g => g.id === m.gapId);
        return gap?.pastorId === pastor.id;
      }).length,
    }));

  const escalamientosPorEstado = [
    { estado: 'Abiertos', cantidad: escalamientosMock.filter(e => e.estado === 'Abierto').length, color: '#3b82f6' },
    { estado: 'En Tratamiento', cantidad: escalamientosMock.filter(e => e.estado === 'En Tratamiento').length, color: '#8b5cf6' },
    { estado: 'Cerrados', cantidad: escalamientosMock.filter(e => e.estado === 'Cerrado').length, color: '#10b981' },
    { estado: 'Escalados', cantidad: escalamientosMock.filter(e => e.estado === 'Escalado').length, color: '#f59e0b' },
  ];

  const escalamientosPorClasificacion = [
    { clasificacion: 'Doctrinal', cantidad: escalamientosMock.filter(e => e.clasificacion === 'Doctrinal').length, color: '#6366f1' },
    { clasificacion: 'Moral', cantidad: escalamientosMock.filter(e => e.clasificacion === 'Moral').length, color: '#f43f5e' },
    { clasificacion: 'Relacional', cantidad: escalamientosMock.filter(e => e.clasificacion === 'Relacional').length, color: '#14b8a6' },
  ];

  const miembrosPorEstado = [
    { estado: 'Miembros IBC', cantidad: miembrosMock.filter(m => m.esMiembroIBC).length, color: '#3b82f6' },
    { estado: 'Bautizados', cantidad: miembrosMock.filter(m => m.esBautizado).length, color: '#06b6d4' },
    { estado: 'Cursando EFC', cantidad: miembrosMock.filter(m => m.escuelaFormacion === 'Cursando').length, color: '#f59e0b' },
    { estado: 'Graduados EFC', cantidad: miembrosMock.filter(m => m.escuelaFormacion === 'Graduado').length, color: '#8b5cf6' },
    { estado: 'No Bautizados', cantidad: miembrosMock.filter(m => !m.esBautizado).length, color: '#9ca3af' },
  ];

  const asistenciaPorGAP = gapsMock.map(gap => ({
    nombre: gap.codigo,
    asistencia: Math.floor(Math.random() * 30) + 70, // Simulado 70-100%
    miembros: gap.miembros.length + 2,
  }));

  const IndicadorCard = ({ titulo, valor, tendencia, descripcion, color }: any) => (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{titulo}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold">{valor}</h3>
              {tendencia && (
                <span className={`text-xs font-medium flex items-center ${tendencia > 0 ? 'text-green-600' : tendencia < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {tendencia > 0 ? <ArrowUpRight className="w-3 h-3" /> : tendencia < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {Math.abs(tendencia)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{descripcion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" style={{ color: tema.primario }} />
            Centro de Monitoreo y Reportes
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-44">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marzo-2026">Marzo 2026</SelectItem>
              <SelectItem value="febrero-2026">Febrero 2026</SelectItem>
              <SelectItem value="enero-2026">Enero 2026</SelectItem>
              <SelectItem value="ultimo-trimestre">Último Trimestre</SelectItem>
              <SelectItem value="ultimo-semestre">Último Semestre</SelectItem>
              <SelectItem value="ultimo-ano">Último Año</SelectItem>
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
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Integrantes</span>
          </TabsTrigger>
          <TabsTrigger value="lideres" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Liderazgo</span>
          </TabsTrigger>
        </TabsList>

        {/* Reporte General */}
        <TabsContent value="general" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IndicadorCard 
              titulo="Total Usuarios" 
              valor={estadisticas.totalUsuarios} 
              tendencia={12}
              descripcion="+2 vs mes anterior"
              color={tema.primario}
            />
            <IndicadorCard 
              titulo="GAPs Activos" 
              valor={estadisticas.gruposActivos} 
              tendencia={0}
              descripcion="Sin cambios"
              color={tema.secundario}
            />
            <IndicadorCard 
              titulo="Total Integrantes" 
              valor={estadisticas.totalMiembros} 
              tendencia={8}
              descripcion="+4 vs mes anterior"
              color={tema.exito}
            />
            <IndicadorCard 
              titulo="Casos Urgentes" 
              valor={estadisticas.escalamientosUrgentes} 
              tendencia={-25}
              descripcion="-1 vs mes anterior"
              color={tema.error}
            />
          </div>

          {/* Gráfico de Crecimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: tema.primario }} />
                Tendencia de Crecimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={datosCrecimiento}>
                    <defs>
                      <linearGradient id="colorMiembros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tema.primario} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={tema.primario} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBautizos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="miembros" stroke={tema.primario} fillOpacity={1} fill="url(#colorMiembros)" name="Total Integrantes" />
                    <Area type="monotone" dataKey="bautizos" stroke="#06b6d4" fillOpacity={1} fill="url(#colorBautizos)" name="Bautizos" />
                    <Line type="monotone" dataKey="nuevos" stroke="#f59e0b" strokeWidth={2} name="Nuevos" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resumen General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: tema.primario }} />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{estadisticas.totalZonas}</p>
                  <p className="text-sm text-gray-600">Zonas</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{estadisticas.asistenciaPromedio}%</p>
                  <p className="text-sm text-gray-600">Asistencia Promedio</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{estadisticas.bautizosMes}</p>
                  <p className="text-sm text-gray-600">Bautizos del Mes</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-amber-600">{estadisticas.miembrosNuevosMes}</p>
                  <p className="text-sm text-gray-600">Nuevos Integrantes</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDescargarExcel}
                  disabled={generandoExcel}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: tema.primario }}
                >
                  {generandoExcel ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando Excel...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Reporte General (Excel)
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleGenerarReporte('General')}
                  disabled={generando}
                  className="flex-1 font-semibold"
                >
                  {generando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Reporte Ejecutivo (PDF)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de GAPs */}
        <TabsContent value="gaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GAPs por Pastor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: tema.primario }} />
                  GAPs e Integrantes por Pastor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gapsPorPastor} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" />
                      <YAxis dataKey="nombre" type="category" width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Legend />
                      <Bar dataKey="gaps" fill={tema.primario} name="GAPs" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="miembros" fill={tema.secundario} name="Integrantes" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asistencia por GAP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: tema.primario }} />
                  Asistencia por GAP (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={asistenciaPorGAP}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="nombre" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: any) => [`${value}%`, 'Asistencia']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Bar dataKey="asistencia" fill={tema.primario} name="Asistencia %" radius={[4, 4, 0, 0]}>
                        {asistenciaPorGAP.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.asistencia >= 80 ? '#10b981' : entry.asistencia >= 60 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de GAPs */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de GAPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gapsMock.map((gap) => (
                  <div key={gap.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{gap.codigo}</p>
                      <Badge className={gap.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {gap.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{gap.pastorNombre}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{gap.miembros.length + 2} integrantes</span>
                      <span>{gap.diaReunion}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => handleGenerarReporte('GAPs')}
                disabled={generando}
                className="w-full text-white mt-4"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de GAPs (PDF)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Escalamientos */}
        <TabsContent value="escalamientos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escalamientos por Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" style={{ color: tema.primario }} />
                  Escalamientos por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={escalamientosPorEstado}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="cantidad"
                      >
                        {escalamientosPorEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Escalamientos por Clasificación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: tema.primario }} />
                  Escalamientos por Clasificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={escalamientosPorClasificacion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="clasificacion" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Bar dataKey="cantidad" name="Casos" radius={[4, 4, 0, 0]}>
                        {escalamientosPorClasificacion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Escalamientos */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Escalamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escalamientosMock.slice(0, 5).map((caso) => (
                  <div key={caso.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{caso.titulo}</p>
                      <p className="text-sm text-gray-500">{caso.creadorNombre}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={
                        caso.prioridad === 'Urgente' ? 'bg-red-100 text-red-700' :
                        caso.prioridad === 'Importante' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {caso.prioridad}
                      </Badge>
                      <Badge variant="outline">{caso.estado}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => handleGenerarReporte('Escalamientos')}
                disabled={generando}
                className="w-full text-white mt-4"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de Escalamientos (PDF)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reporte de Integrantes */}
        <TabsContent value="miembros" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de Integrantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" style={{ color: tema.primario }} />
                  Distribución de Integrantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={miembrosPorEstado}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="cantidad"
                        label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                      >
                        {miembrosPorEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas por Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: tema.primario }} />
                  Estado de los Integrantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {miembrosPorEstado.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${item.color}15` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.estado}</span>
                      </div>
                      <span className="font-bold" style={{ color: item.color }}>{item.cantidad}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Integrantes:</span>
                    <span className="font-medium">{miembrosMock.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <Button
                onClick={() => handleGenerarReporte('Integrantes')}
                disabled={generando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Reporte de Integrantes (PDF)
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
                      <linearGradient id="colorLideres" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tema.primario} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={tema.primario} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTimoteos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={tema.secundario} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={tema.secundario} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    <Area type="monotone" dataKey="lideres" stroke={tema.primario} fillOpacity={1} fill="url(#colorLideres)" name="Líderes de GAP" />
                    <Area type="monotone" dataKey="timoteos" stroke={tema.secundario} fillOpacity={1} fill="url(#colorTimoteos)" name="Timoteos Activos" />
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
                      <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4 font-sans text-slate-800">
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

export default ReportesPastorPrincipalModule;
