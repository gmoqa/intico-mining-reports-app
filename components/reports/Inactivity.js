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
import {TrendingDownIcon, TrendingUpIcon} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

export default function Inactivity() {
	const [reports, setReports] = useState([])
	const [open, setOpen] = useState(false)
	const [openReport, setOpenReport] = useState(false)
	const [selectedReport, setSelectedReport] = useState(null)

	useEffect(() => {
		fetch('https://fenec.duckdns.org/api/reports?populate=*')
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

	return (
	  <div className="flex flex-1 flex-col gap-4 p-1">
		  <Table>
			  <TableHeader>
				  <TableRow>
					  <TableHead className="hidden md:table-cell w-[100px]">#ID</TableHead>
					  <TableHead className="w-[100px]">Contratista</TableHead>
					  <TableHead className="w-[100px]">Fecha</TableHead>
					  <TableHead className="w-[50px]">Turno</TableHead>
					  <TableHead className="hidden md:table-cell w-[60px]">Navixy ID</TableHead>
					  <TableHead className="hidden md:table-cell w-[100px]">Vehiculos</TableHead>
					  <TableHead className="w-[100px]">Reporte</TableHead>
				  </TableRow>
			  </TableHeader>
			  <TableBody>
				  {reports && reports?.data?.map(report => (
					  <TableRow key={report?.id}>
						  <TableCell className="hidden md:table-cell">#{report?.id}</TableCell>
						  <TableCell className={'text-xs'}>{report?.contractor?.name}</TableCell>
						  <TableCell className={'text-xs'}>{dayjs(report?.date, "YYYY-MM-DD").format("DD/MM/YYYY")}</TableCell>
						  <TableCell>{report?.shift?.type}</TableCell>
						  <TableCell className="hidden md:table-cell"><Badge variant={'outline'}>{report?.navixy_id}</Badge></TableCell>
						  <TableCell className="hidden md:table-cell">{report?.vehicles?.length}</TableCell>
						  <TableCell>
							  <Button variant={'outline'} onClick={() => handleOpenDialog(report)}>
								  Ver reporte
							  </Button>
						  </TableCell>
					  </TableRow>
				  ))}
			  </TableBody>
		  </Table>
		  <Drawer open={open} onOpenChange={setOpen}>
			  <DrawerContent>
				  <div className="mx-auto w-full max-w-sm">
					  <DrawerHeader>
						  <Badge> Navixy {selectedReport?.navixy_id}</Badge>
						  <DrawerTitle>Reporte de Inactividad</DrawerTitle>
						  <DrawerDescription>{dayjs(selectedReport?.date).format('DD/MM/YYYY')}</DrawerDescription>
						  <DrawerTitle>{selectedReport?.contractor?.name.toUpperCase()}</DrawerTitle>
						  <DrawerDescription>TURNO {selectedReport?.shift?.type}</DrawerDescription>
						  <Badge variant={'outline'} className={'mt-2'}>{selectedReport?.vehicles?.length} Vehículos</Badge>
					  </DrawerHeader>
					  <ScrollArea className="h-72 px-2">
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
			  <DialogContent className="sm:max-w-[90%] h-[90%]">
				  <DialogHeader>
					  <DialogTitle>Reporte de Inactividad</DialogTitle>
					  <DialogDescription>
						  {selectedReport?.contractor?.name.toUpperCase()} - {dayjs(selectedReport?.date).format('DD/MM/YYYY')}
					  </DialogDescription>
				  </DialogHeader>
				  <Table>
					  <TableHeader>
						  <TableRow>
							  <TableHead className="w-[100px]">Vehículo</TableHead>
							  <TableHead className="w-[100px] text-right">Períodos ociosos</TableHead>
							  <TableHead className="w-[100px] text-right">Duración inactivo</TableHead>
							  <TableHead className="w-[100px] text-right">Ingnición ON</TableHead>
							  <TableHead className="w-[100px] text-right">Ingnición ON %</TableHead>
						  </TableRow>
					  </TableHeader>
					  <TableBody>
						  {selectedReport?.navixy_response?.report?.sheets?.map((vehicle) => (
							  <TableRow key={vehicle.header}>
								  <TableCell className="font-medium text-xs">{vehicle.header}</TableCell>
								  <TableCell className="text-right text-xs">{vehicle.sections[0].text === 'Sin tiempo de inactividad en el período especificado.' ? '---' : vehicle.sections[1].rows.find(row => row.name === 'Duración inactivo').v}</TableCell>
								  <TableCell className="text-right text-xs">{vehicle.sections[1]?.rows.find(row => row.name === 'Períodos ociosos').v || '---'}</TableCell>
								  <TableCell className="text-right text-xs">{vehicle.sections[1]?.rows.find(row => row.name === 'Duración inactivo').v || '---'}</TableCell>
								  <TableCell className="text-right text-xs">{vehicle.sections[1]?.rows.find(row => row.name === "\"Ingnición ON\" porcentaje, %").v || '---'}</TableCell>
							  </TableRow>
						  ))}
					  </TableBody>
				  </Table>
			  </DialogContent>
		  </Dialog>
	  </div>
	);
}