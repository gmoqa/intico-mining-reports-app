'use client'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {useEffect, useState} from "react";
import { Badge } from "@/components/ui/badge"
import {CheckCircle2Icon, ChevronRight} from "lucide-react"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Button } from "@/components/ui/button";
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Santiago")
import { DataTable } from "@/components/data-table";

import data from "./data.json"

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer"
import {ScrollArea} from "@/components/ui/scroll-area";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Calendar, Download, GalleryVerticalEnd, TrendingDownIcon, TrendingUpIcon} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import * as React from "react";

export default function Inactivity() {
	const [reports, setReports] = useState([])
	const [open, setOpen] = useState(false)
	const [openReport, setOpenReport] = useState(false)
	const [selectedReport, setSelectedReport] = useState(null)

	useEffect(() => {
		fetch('https://fenec.duckdns.org/api/reports?populate=*&sort=date:desc')
			.then(response => response.json())
			.then(data => setReports(data));
	}, []);

	const handleOpenDialog = (report) => {
		setSelectedReport(report);
		setOpen(true);
	};

	const handleOpenReportDialog = () => {
		setOpen(false);
		setOpenReport(true);
	};

	function formatSecondsToHHMMSS(seconds) {
		// evito devolver NAN
		if (typeof seconds !== 'number') return '--'
		const hours = Math.floor(seconds / 3600); // Calcular las horas
		const minutes = Math.floor((seconds % 3600) / 60); // Calcular los minutos restantes
		const remainingSeconds = seconds % 60; // Calcular los segundos restantes

		// Asegurarse de que las horas, minutos y segundos tengan dos dígitos
		const formattedHours = String(hours).padStart(2, '0');
		const formattedMinutes = String(minutes).padStart(2, '0');

		return `${formattedHours}:${formattedMinutes}`; // Formato "HH:mm:ss"
	}

	return (
	  <div className="w-full overflow-auto whitespace-nowrap">
		  <Table>
			  <TableHeader>
				  <TableRow>
					  <TableHead className="pl-8 hidden md:table-cell w-[100px]">ID</TableHead>
					  <TableHead className="w-[100px]">Contratista</TableHead>
					  <TableHead className="w-[100px]">Turno</TableHead>
					  <TableHead className="hidden md:table-cell w-[60px]">Navixy ID</TableHead>
					  <TableHead className="hidden md:table-cell w-[50px]">Vehiculos</TableHead>
					  <TableHead className="text-right pr-12 w-[100px]">Reporte</TableHead>
				  </TableRow>
			  </TableHeader>
			  <TableBody>
				  {reports && reports?.data?.map(report => (
					  <TableRow key={report?.id}>
						  <TableCell className="pl-8 hidden md:table-cell">{report?.id}</TableCell>
						  <TableCell>{report?.contractor?.name}</TableCell>
						  <TableCell>
							  <Badge
								  variant="outline"
								  className="flex gap-1 px-1.5 [&_svg]:size-3"
							  >
								  <Calendar className="text-green-500 dark:text-green-400" />
								  {dayjs(report?.date, "YYYY-MM-DD").format("DD/MM/YY")} - {report?.shift?.type}
							  </Badge>
						  </TableCell>
						  <TableCell className="hidden md:table-cell"><Badge variant={'outline'}>{report?.navixy_id}</Badge></TableCell>
						  <TableCell className="hidden md:table-cell">{report?.vehicles?.length}</TableCell>
						  <TableCell className={'text-right pr-8'}>
							  <Button variant={'outline'} onClick={() => handleOpenDialog(report)}>
								  Reporte
							  </Button>
						  </TableCell>
					  </TableRow>
				  ))}
			  </TableBody>
		  </Table>
		  <Drawer open={open} onOpenChange={setOpen}>
			  <DrawerContent>
				  <div className="mx-auto w-full max-w-sm pb-8">
					  <DrawerHeader>
						  <Badge> Navixy {selectedReport?.navixy_id}</Badge>
						  <DrawerTitle>Reporte de Inactividad</DrawerTitle>
						  <DrawerDescription>{dayjs(selectedReport?.date).format('DD/MM/YYYY')}</DrawerDescription>
						  <DrawerTitle>{selectedReport?.contractor?.name.toUpperCase()}</DrawerTitle>
						  <DrawerDescription>TURNO {selectedReport?.shift?.type}</DrawerDescription>
						  <Badge variant={'outline'} className={'mt-2'}>{selectedReport?.vehicles?.length} Vehículos</Badge>
					  </DrawerHeader>
					  <ScrollArea className="h-72">
						  <Table className={''}>
							  <TableHeader>
								  <TableRow>
									  <TableHead className="w-[100px]">Vehículo</TableHead>
									  <TableHead className="text-right">Inactividad</TableHead>
								  </TableRow>
							  </TableHeader>
							  <TableBody>
								  {selectedReport?.navixy_response?.report?.sheets?.map((vehicle) => (
									  <TableRow key={vehicle.header}>
										  <TableCell className="font-medium text-xs">{vehicle.header}</TableCell>
										  <TableCell className="text-right text-xs">{vehicle.sections[0].text === 'Sin tiempo de inactividad en el período especificado.' ? 'Sin Inactividad' : vehicle.sections[1].rows.find(row => row.name === 'Duración inactivo').v}</TableCell>
										  <TableCell>
										  </TableCell>
									  </TableRow>
								  ))}
							  </TableBody>
						  </Table>
					  </ScrollArea>
					  <DrawerFooter>
						  <Button onClick={() => handleOpenReportDialog()}>Ver reporte completo</Button>
						  <DrawerClose asChild>
							  <Button variant="outline">Volver</Button>
						  </DrawerClose>
					  </DrawerFooter>
				  </div>
			  </DrawerContent>
		  </Drawer>
		  <Dialog open={openReport} onOpenChange={setOpenReport}>
			  <DialogContent className={'sm:max-w-[90%]'}>
				  <DialogHeader>
					  <DialogTitle>Reporte de Inactividad</DialogTitle>
					  <DialogDescription>
						  {selectedReport?.contractor?.name.toUpperCase()} - {dayjs(selectedReport?.date).format('DD/MM/YYYY')}
					  </DialogDescription>
				  </DialogHeader>
				  <Table>
					  <TableHeader>
						  <TableRow>
							  <TableHead>Vehículo</TableHead>
							  <TableHead className="text-right">NO OP</TableHead>
							  <TableHead className="text-right">{'OP > 5'}</TableHead>
							  <TableHead className="text-right">{'OP < 5'}</TableHead>
							  <TableHead className="text-right">GEN</TableHead>
							  <TableHead className="text-right">FUERA</TableHead>
							  <TableHead className="text-right">EFECT.</TableHead>
						  </TableRow>
					  </TableHeader>
					  <TableBody>
						  {selectedReport?.navixy_response?.report?.sheets?.map((vehicle) => (
							  <TableRow key={vehicle.header}>
								  <TableCell>{vehicle.header}</TableCell>
								  <TableCell className="text-right">
									  {formatSecondsToHHMMSS(vehicle.sections[0]?.data?.flatMap(item => item.rows || [])
										  .filter(row => {
											  const addresses = row.address.v.split(']')[0].slice(1).split(',').map(item => item.trim());
											  return addresses.some(address => address.startsWith(vehicle?.header.split('-').slice(0, 2).join('-')  + '-NOP'));
										  })
										  .reduce((total, row) => total + (row.idle_duration?.raw || 0), 0))}
								  </TableCell>
								  <TableCell className="text-right">
									  {formatSecondsToHHMMSS(vehicle.sections[0]?.data?.flatMap(item => item.rows || [])
										  .filter(row => {
											  const addresses = row.address.v.split(']')[0].slice(1).split(',').map(item => item.trim());
											  return addresses.some(address => address.startsWith(vehicle?.header.split('-').slice(0, 2).join('-')  + '-OP'));
										  })
										  .filter(row => row.idle_duration?.raw > 300)
										  .reduce((total, row) => total + (row.idle_duration?.raw || 0), 0))}
								  </TableCell>
								  <TableCell className="text-right">
									  {formatSecondsToHHMMSS(vehicle.sections[0]?.data?.flatMap(item => item.rows || [])
										  .filter(row => {
											  const addresses = row.address.v.split(']')[0].slice(1).split(',').map(item => item.trim());
											  return addresses.some(address => address.startsWith(vehicle?.header.split('-').slice(0, 2).join('-')  + '-GEN'));
										  })
										  .reduce((total, row) => total + (row.idle_duration?.raw || 0), 0))}
								  </TableCell>
								  <TableCell className="text-right">
									  {formatSecondsToHHMMSS(vehicle.sections[0]?.data?.flatMap(item => item.rows || [])
										  .filter(row => {
											  const addresses = row.address.v.split(']')[0].slice(1).split(',').map(item => item.trim());
											  return addresses.some(address => address.startsWith(vehicle?.header.split('-').slice(0, 2).join('-')  + '-OP'));
										  })
										  .filter(row => row.idle_duration?.raw < 300)
										  .reduce((total, row) => total + (row.idle_duration?.raw || 0), 0))}
								  </TableCell>
								  <TableCell className="text-right">
									  {formatSecondsToHHMMSS(vehicle.sections[0]?.data?.flatMap(item => item.rows || [])
										  .filter(row => {
											  const addresses = row.address.v.split(']')[0].slice(1).split(',').map(item => item.trim());
											  return addresses.length === 0;
										  })
										  .reduce((total, row) => total + (row.idle_duration?.raw || 0), 0))}
								  </TableCell>
								  <TableCell className="text-right">
									  --
								  </TableCell>
							  </TableRow>
						  ))}
					  </TableBody>
				  </Table>
			  </DialogContent>
		  </Dialog>
	  </div>
	);
}