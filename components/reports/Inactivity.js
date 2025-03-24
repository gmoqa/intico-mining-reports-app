'use client'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { useState } from "react";
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
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, SearchX, FileX2, MoonIcon, SunIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink, PaginationNext,
	PaginationPrevious
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function buildReportsURL({ page, shiftType, contractorFilter, selectedDate }) {
	let url = `https://fenec.duckdns.org/api/reports?pagination[page]=${page}&pagination[pageSize]=10`
	url += `&fields[0]=id&fields[1]=date&fields[2]=navixy_id&fields[3]=navixy_response`
	url += `&populate[vehicles][fields][0]=id`
	url += `&populate[contractor][fields][0]=name&populate[contractor][fields][1]=code`
	url += `&populate[shift][fields][0]=type&populate[shift][fields][1]=start_time&populate[shift][fields][2]=end_time`

	if (shiftType) {
		url += `&filters[shift][type][$eq]=${shiftType}`
	}
	if (contractorFilter) {
		url += `&filters[contractor][id][$eq]=${contractorFilter}`
	}
	if (selectedDate) {
		const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
		url += `&filters[date][$eq]=${formattedDate}`
	}

	return url;
}

export default function Inactivity() {
	const [page, setPage] = useState(1);
	const [shiftType, setShiftType] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [contractorFilter, setContractorFilter] = useState(null);
	const [open, setOpen] = useState(false);
	const [openReport, setOpenReport] = useState(false);
	const [selectedReport, setSelectedReport] = useState(null);

	const reportsUrl = buildReportsURL({ page, shiftType, contractorFilter, selectedDate });
	const { data: reports, isLoading: loading } = useSWR(reportsUrl, fetcher);

	const { data: contractorData } = useSWR(
		"https://fenec.duckdns.org/api/contractors?fields[0]=id&fields[1]=name&sort=name",
		fetcher
	);
	const contractors = contractorData?.data || [];

	const pageCount = reports?.meta?.pagination?.pageCount || 1;

	const handleOpenDialog = (report) => {
		setSelectedReport(report);
		setOpen(true);
	};

	const handleOpenReportDialog = () => {
		setOpen(false);
		setOpenReport(true);
	};

	function formatSecondsToHHMMSS(seconds) {
		if (typeof seconds !== 'number') return '--'
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
	}

	return (<>
		{/* Filtros */}
		<div className="w-full flex flex-wrap gap-2 px-4 py-3 sm:flex-nowrap sm:gap-4">
			{/* Filtro por fecha */}
			<div className="flex-1 min-w-[150px]">
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" className="w-full justify-start text-left font-normal">
							<CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
							<span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
            {selectedDate
	            ? dayjs(selectedDate).format("DD/MM/YYYY")
	            : "Fecha"}
          </span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={(date) => {
								setPage(1);
								setSelectedDate(date);
							}}
							disabled={(date) => date > new Date()}
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* Filtro por turno */}
			<div className="flex-1 min-w-[150px]">
				<Select onValueChange={(value) => {
					setPage(1);
					setShiftType(value === "ALL" ? null : value);
				}}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Tipo turno" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Todos</SelectItem>
						<SelectItem value="DIA">Día</SelectItem>
						<SelectItem value="NOCHE">Noche</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Filtro por contratista */}
			<div className="flex-1 min-w-[150px]">
				<Select onValueChange={(value) => {
					setPage(1);
					setContractorFilter(value === "ALL" ? null : value);
				}}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Contratista" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Todos</SelectItem>
						{contractors.map((c) => (
							<SelectItem key={c.id} value={c.id.toString()}>{c.name.toUpperCase()}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>


		{/* Tabla */}
		<Table className="border">
			<TableHeader>
				<TableRow>
					<TableHead className="hidden md:table-cell">ID</TableHead>
					<TableHead>Contratista</TableHead>
					<TableHead className="hidden md:table-cell">Turno</TableHead>
					<TableHead className="hidden md:table-cell">Navixy ID</TableHead>
					<TableHead className="hidden md:table-cell">Vehículos</TableHead>
					<TableHead className="text-right">Reporte</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading ? (
					Array.from({ length: 10 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell><Skeleton className="h-4 w-12" /></TableCell>
							<TableCell><Skeleton className="h-4 w-24" /></TableCell>
							<TableCell><Skeleton className="h-4 w-24" /></TableCell>
							<TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
							<TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-10" /></TableCell>
							<TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
						</TableRow>
					))
				) : (
					reports?.data?.map((report) => (
						<TableRow key={report.id}>
							<TableCell className="hidden md:table-cell">#{report.id}</TableCell>
							{/* Mobile + Desktop: Contratista + Fecha/Turno */}
							<TableCell className="md:hidden">
								<div className="flex flex-col">
									<span className={'text-gray-900'}>{report.contractor?.name.toUpperCase()}</span>
									<Badge variant={'outline'}>{dayjs(report.date).format("DD/MM/YY")} - TURNO {report.shift?.type}</Badge>
								</div>
							</TableCell>

							{/* Desktop only: Contratista */}
							<TableCell className="hidden md:table-cell">
								{report.contractor?.name.toUpperCase()}
							</TableCell>

							{/* Desktop only: Turno */}
							<TableCell className="hidden md:table-cell">
								<Badge
									variant="outline"
									className="flex gap-1 px-1.5 [&_svg]:size-3"
								>
									<CalendarIcon className="text-green-500 dark:text-green-400" />
									{dayjs(report.date).format("DD/MM/YY")} - {report.shift?.type}
								</Badge>
							</TableCell>

							{/* Desktop only: Navixy ID */}
							<TableCell className="hidden md:table-cell">
								<Badge variant="outline">{report.navixy_id}</Badge>
							</TableCell>

							{/* Desktop only: Vehículos */}
							<TableCell className="hidden md:table-cell">
								{report.vehicles?.length}
							</TableCell>

							{/* Botón Reporte (siempre visible) */}
							<TableCell className="text-right">
								<Button variant="outline" onClick={() => handleOpenDialog(report)}>
									Reporte
								</Button>
							</TableCell>
						</TableRow>
					))
				)}
				{!loading && reports?.data?.length === 0 && (
					<TableRow>
						<TableCell colSpan={6} className="text-center py-10">
							<div className="flex flex-col items-center gap-2 text-muted-foreground">
								<p className="text-sm">No se encontraron reportes para los filtros seleccionados.</p>
							</div>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>

		{/* Paginación */}
		<div className="border p-2">
			<Pagination>
				<PaginationContent>
					{page > 1 && (
						<PaginationItem>
							<PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (!loading) setPage(page - 1); }} />
						</PaginationItem>
					)}
					{Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
						<PaginationItem key={p}>
							<PaginationLink href="#" isActive={p === page} onClick={() => setPage(p)}>
								{p}
							</PaginationLink>
						</PaginationItem>
					))}
					{page < pageCount && (
						<PaginationItem>
							<PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (!loading) setPage(page + 1); }} />
						</PaginationItem>
					)}
				</PaginationContent>
			</Pagination>
		</div>

		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent>
				<div className="mx-auto w-full  max-w-sm pb-8">
					<DrawerHeader>
						<Badge> Navixy {selectedReport?.navixy_id}</Badge>
						<DrawerTitle>Reporte de Inactividad</DrawerTitle>
						<DrawerDescription>{dayjs(selectedReport?.date).format('DD/MM/YYYY')}</DrawerDescription>
						<DrawerTitle>{selectedReport?.contractor?.name.toUpperCase()}</DrawerTitle>
						<DrawerDescription>TURNO {selectedReport?.shift?.type} - {selectedReport?.shift?.start_time.slice(0, 5) } / {selectedReport?.shift?.end_time.slice(0, 5)}</DrawerDescription>
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
	</>)
}
