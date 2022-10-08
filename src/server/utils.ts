export const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`

export const notifyForNoChanges = () => figma.notify('😁 Nothing has changed!')

/**
 * Used to transform the figma api data into the preferred format for UI.
 */
export const transformComponentDataV2 = (data: PageComponentsData[]) => {
	return data.map((item: PageComponentsData) => {
		return <PageComponentsDataTransformed>{
			pageId: item.pageId,
			pageName: item.pageName,
			transformedComponentDataArr: item.components.map(node => {
				return <TransformedComponentData>{
					id: node.id,
					name: node.name,
					description: node.description,
					documentationLinks: node.documentationLinks,
				}
			}),
		}
	})
}

export const findAllComponentsInPage = () => {
	// First, check if the current selection has any none-component nodes in it.
	const filteredSel = figma.currentPage.selection.filter(
		selectionItem => selectionItem.type === 'COMPONENT' || selectionItem.type === 'COMPONENT_SET'
	)

	const preparedData: [PageComponentsData] = [
		{
			pageId: figma.currentPage.id,
			pageName: figma.currentPage.name,
			components: <any[]>filteredSel,
		},
	]

	return preparedData
}

/**
 * Find all documents in all pages & even the ones nested inside frames.
 */
export const findAllComponentsInDocument = () => {
	const preparedDataArr: PageComponentsData[] = []
	for (const documentNode of figma.root.children) {
		const components = documentNode.findAll(node => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')
		if (!components.length) continue

		const preparedData: PageComponentsData = {
			pageId: documentNode.id,
			pageName: documentNode.name,
			components: <any[]>components,
		}
		preparedDataArr.push(preparedData)
	}
	return preparedDataArr
}
