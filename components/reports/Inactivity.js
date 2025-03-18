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

export default function Inactivity() {
	const [reports, setReports] = useState([])
	const [open, setOpen] = useState(false)
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
							  <Button className={'text-xs'} size={'xs'} variant={'outline'} onClick={() => handleOpenDialog(report)}>
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
						  <DrawerDescription>Turno {selectedReport?.shift?.tipo} {selectedReport?.shift?.name}</DrawerDescription>
					  </DrawerHeader>
					  <ScrollArea className="h-72">
						  <div className="p-4 pb-2">
							  <div className="h-[200px] font-semibold">
								  Vehículos ({ selectedReport?.vehicles?.length })
								  <div className="pt-2 pb-2 flex flex-wrap gap-2">
									  {selectedReport?.vehicles?.map(vehicle => (
										  <Badge className={'text-xs'} key={vehicle?.id}>{vehicle?.name}</Badge>
									  ))}
								  </div>
							  </div>
						  </div>
					  </ScrollArea>
					  <DrawerFooter>
						  <Button variant="">Mas información</Button>
						  <DrawerClose asChild>
							  <Button variant="outline">Volver</Button>
						  </DrawerClose>
					  </DrawerFooter>
				  </div>
			  </DrawerContent>
		  </Drawer>
	  </div>
	);
}