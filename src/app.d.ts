declare global {
	type PageComponentsData = {
		pageId: string
		pageName: string
		components: (ComponentNode | ComponentSetNode)[]
	}

	type PageComponentsDataTransformed = {
		pageId: string
		pageName: string
		transformedComponentDataArr: TransformedComponentData[]
	}

	type TransformedComponentData = {
		id: string
		name: string
		description: string
		documentationLinks: DocumentationLink[]
	}
}

export {}
