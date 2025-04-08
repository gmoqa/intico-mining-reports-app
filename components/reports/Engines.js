'use client'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import useSWR from 'swr'
import { es } from 'date-fns/locale'

import {CalendarIcon, SunIcon, MoonIcon, Car, Truck, LoaderIcon, Loader2} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle
} from '@/components/ui/drawer'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

import { useState } from 'react'
import {Calendar} from "@/components/ui/calendar";

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("America/Santiago")

const fetcher = (url) => fetch(url).then((res) => res.json());

function buildReportsURL({ page, shiftType, contractorFilter, selectedDate }) {
	let url = `https://fenec.duckdns.org/api/reports?pagination[page]=${page}&pagination[pageSize]=10`
	url += `&fields[0]=id&fields[1]=date&fields[2]=navixy_id`
	url += `&populate[contractor][fields][0]=name&populate[contractor][fields][1]=code`
	url += `&populate[shift][fields][0]=type&populate[shift][fields][1]=start_time&populate[shift][fields][2]=end_time&populate[report_type][fields][3]=id`

	if (shiftType) {
		url += `&filters[shift][type][$eq]=${shiftType}`
	}

	url += `&sort[0]=date:desc`

	if (contractorFilter) {
		url += `&filters[contractor][id][$eq]=${contractorFilter}`
	}
	if (selectedDate) {
		const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD")
		url += `&filters[date][$eq]=${formattedDate}`
	}

	url += `&filters[report_type][id][$eq]=2`

	return url;
}

export default function Engines() {
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

	const handleOpenDialog = async (report) => {
		setOpen(true);
		setSelectedReport(null);
		try {
			const detailedReport = await fetchReportDetail(report.id);
			setSelectedReport(detailedReport);
		} catch (err) {
			console.error(err);
		}
	};

	async function fetchReportDetail(reportId) {
		const res = await fetch(`https://fenec.duckdns.org/api/reports?filters[id][$eq]=${reportId}&populate=*`)
		if (!res.ok) throw new Error("No se pudo obtener el detalle del reporte");
		const json = await res.json();
		return json.data[0];
	}

	const handleOpenReportDialog = () => {
		setOpen(false);
		setOpenReport(true);
	};

	function formatSecondsToHHMMSS(seconds) {
		if (typeof seconds !== 'number') return '--'
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const seconds2 = Math.floor(seconds % 60);
		return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds2).padStart(2, '0')}`;
	}

	return (<>
		{/* Filtros */}
		<div className="w-full flex flex-wrap gap-2 px-4 py-3 sm:flex-nowrap sm:gap-4">
			{/* Filtro por fecha */}
			<div className="flex-1 min-w-[150px]">
				<Popover modal>
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
							locale={es}
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
							<TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
						</TableRow>
					))
				) : (
					reports?.data?.map((report) => (
						<TableRow key={report.id}>
							<TableCell className="hidden md:table-cell">#{report.id}</TableCell>
							{/* Mobile + Desktop: Contratista + Fecha/Turno */}
							<TableCell className="md:hidden py-4">
								<div className="flex flex-col gap-1.5">
									{/* Nombre del contratista */}
									<span className="text-sm font-semibold text-foreground tracking-tight leading-tight">
								      {report.contractor?.name.toUpperCase()}
								    </span>

									<div className="flex flex-wrap items-center gap-2 mt-2">
										<Badge variant="outline" className="text-xs">
											<CalendarIcon className="w-3 h-3 mr-1" />
											{dayjs(report.date).format("DD/MM/YY")}
										</Badge>
										<Badge   className={`text-xs text-white ${
											report.shift?.type === "DIA"
												? "bg-yellow-500"
												: report.shift?.type === "NOCHE"
													? "bg-slate-700"
													: "bg-gray-400"
										}`}>
											{report.shift?.type === 'DIA' ? (
												<SunIcon className="w-3 h-3 mr-1" />
											) : (
												<MoonIcon className="w-3 h-3 mr-1" />
											)}
											{report.shift?.type}
										</Badge>
										<Badge className="text-xs bg-amber-300 text-foreground">
											<Truck className="w-3 h-3 mr-1" />
											{report.vehicles?.length}
										</Badge>
									</div>
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
				<DrawerTitle className="hidden">Reporte de Horas Motor</DrawerTitle>
				{!selectedReport ? (
					<div className="flex h-64 flex-col items-center justify-center gap-2">
						<Loader2 className="w-12 h-12 animate-spin text-orange-500" />
						<p className="text-muted-foreground">Cargando reporte</p>
					</div>
				) : (
					<div className="mx-auto w-full  max-w-sm pb-8">
						<DrawerHeader>
							<Badge> Navixy {selectedReport?.navixy_id}</Badge>
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
										<TableHead className="text-right">Horas Motors</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selectedReport?.navixy_response?.report?.sheets?.filter((v) => v.header !== 'Período Resumen').map((vehicle) => (
										<TableRow key={vehicle.header}>
											<TableCell className="font-medium text-xs">{vehicle.header}</TableCell>
											<TableCell className="text-right text-xs">
												{formatSecondsToHHMMSS(
													vehicle.sections[3]?.data[0]?.total?.duration.raw || 0
												)}
											</TableCell>
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
				)}
			</DrawerContent>
		</Drawer>
		<Dialog open={openReport} onOpenChange={setOpenReport}>
			<DialogContent className={'sm:max-w-[90%]'}>
				<DialogHeader>
					<DialogTitle className="text-xl text-left font-bold text-gray-800">
						Reporte de Horas Motor
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground text-left gap-2">
						<span className="font-medium text-gray-700">
							{selectedReport?.contractor?.name.toUpperCase()}
						</span>
					</DialogDescription>
					<p className="text-left text-sm text-gray-600 flex items-center gap-2 font-medium">
						<CalendarIcon className="w-4 h-4 text-muted-foreground" />
						{dayjs(selectedReport?.date).format('DD/MM/YYYY')} - Turno: {selectedReport?.shift?.type.charAt(0).toUpperCase() + selectedReport?.shift?.type.slice(1).toLowerCase()}
					</p>
					<p className="text-left text-xs text-gray-600 font-medium">
						Ejecución:{' '}
						<span className="font-mono">{dayjs(selectedReport?.createdAt).format('DD/MM/YYYY HH:mm')}</span>
					</p>
				</DialogHeader>
				<div className="overflow-x-auto rounded-md border border-gray-200">
					<Table className="min-w-[700px]">
						<TableHeader>
							<TableRow className="bg-gray-100">
								<TableHead className="sticky left-0 z-10 bg-gray-100 font-bold text-gray-700 shadow-md">
									Vehículo
								</TableHead>
								<TableHead className="text-right font-semibold text-gray-600">Horas Motor</TableHead>
								<TableHead className="text-right font-semibold text-gray-600">Horas Movimiento</TableHead>
								<TableHead className="text-right font-semibold text-gray-600">Horas Ralentí</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{selectedReport?.navixy_response?.report?.sheets?.map((vehicle) => (
								<TableRow
									key={vehicle.header}
									className="group hover:bg-muted transition-colors"
								>
									<TableCell className="sticky left-0 z-10 bg-white group-hover:bg-muted font-medium text-sm shadow-md transition-colors">
										{vehicle.header}
									</TableCell>
									<TableCell className="text-right sticky left-0 z-10 bg-white group-hover:bg-muted font-medium text-sm shadow-md transition-colors">
										{formatSecondsToHHMMSS(
											vehicle.sections[3]?.data?.flatMap(item => item.rows || [])
												.reduce((total, row) => total + (row.duration?.raw || 0), 0)
										)}
									</TableCell>
									<TableCell className="text-right sticky left-0 z-10 bg-white group-hover:bg-muted font-medium text-sm shadow-md transition-colors">
										{formatSecondsToHHMMSS(
											vehicle.sections[3]?.data?.flatMap(item => item.rows || [])
												.reduce((total, row) => total + (row.in_movement?.raw || 0), 0)
										)}
									</TableCell>
									<TableCell className="text-right sticky left-0 z-10 bg-white group-hover:bg-muted font-medium text-sm shadow-md transition-colors">
										{formatSecondsToHHMMSS(
											vehicle.sections[3]?.data?.flatMap(item => item.rows || [])
												.reduce((total, row) => total + (row.idle?.raw || 0), 0)
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

			</DialogContent>
		</Dialog>
	</>)
}
