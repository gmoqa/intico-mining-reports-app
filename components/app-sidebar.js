import * as React from "react"

import { VersionSwitcher } from "@/components/version-switcher"
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
	versions: ["Minera Centinela", "Los Pelambres Mauro"],
	navMain: [
		{
			title: "Reportes",
			url: "#",
			items: [
				{
					title: "Inactividad",
					url: "/reportes/inactividad",
				},
				{
					title: "Horas de motor",
					url: "/reportes/horas-motor",
				},
				{
					title: "Viajes y paradas",
					url: "/reportes/viajes-paradas",
				},
				{
					title: "Reporte de geocercas",
					url: "/reportes/geocercas",
				},
			],
		},
	],
}

export function AppSidebar({ ...props }) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<VersionSwitcher
					versions={data.versions}
					defaultVersion={data.versions[0]}
				/>
			</SidebarHeader>
			<SidebarContent>
				{/* We create a SidebarGroup for each parent. */}
				{data.navMain.map((item) => (
					<SidebarGroup key={item.title}>
						<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{item.items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={item.isActive}>
											<a href={item.url}>{item.title}</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
