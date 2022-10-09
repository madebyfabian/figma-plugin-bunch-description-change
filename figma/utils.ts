import type {
	PageComponentsDataTransformed,
	TransformedComponentData,
	StyleDataTypesCategory,
	StyleDataTypes,
	TransformedStyleData,
	StyleDataTypesCategoryLabel,
	CategoryStyleDataTransformed,
	ComponentNodeTypes,
} from '../app.types'

export const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`

export const notifyForNoChanges = () => figma.notify('😁 Nothing has changed!')

export let isDocumentWideMode = false

export const updateIsDocumentWideMode = (newVal: boolean) => {
	isDocumentWideMode = newVal
	figma.ui.postMessage({
		type: 'updateIsDocumentWideMode',
		value: newVal,
	})
}

type PageComponentsDataRaw = {
	pageId: string
	pageName: string
	components: (ComponentNode | ComponentSetNode)[]
}
/**
 * Used to transform the figma api data into the preferred format for UI.
 */
export const transformComponentDataV2 = (data: PageComponentsDataRaw[]) => {
	return data.map(item => {
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

	const preparedData: [PageComponentsDataRaw] = [
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
	const preparedDataArr: PageComponentsDataRaw[] = []
	for (const documentNode of figma.root.children) {
		const components = documentNode.findAll(node => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')
		if (!components.length) continue

		const preparedData: PageComponentsDataRaw = {
			pageId: documentNode.id,
			pageName: documentNode.name,
			components: <any[]>components,
		}
		preparedDataArr.push(preparedData)
	}
	return preparedDataArr
}

const updateNodeOrStyleData = (
	nodeOrStyle: ComponentNodeTypes | StyleDataTypes,
	newItem: TransformedComponentData | TransformedStyleData,
	useDocumentationLinksFieldType: boolean
) => {
	let hadDifference = false

	if (useDocumentationLinksFieldType) {
		const oldValue = nodeOrStyle.documentationLinks?.[0]?.uri || ''
		const newValue = newItem.documentationLinks?.[0]?.uri
		const hasDifference = oldValue != newValue
		if (!hasDifference) return hadDifference

		if (newValue === '')
			// hack because figma API is buggy
			newItem.documentationLinks = []

		nodeOrStyle.documentationLinks = newItem.documentationLinks
	} else {
		const hasDifference = nodeOrStyle.description != newItem.description
		if (!hasDifference) return hadDifference

		nodeOrStyle.description = newItem.description
	}

	hadDifference = true
	return hadDifference
}

export const handleComponentDataChange = (
	data: PageComponentsDataTransformed[],
	useDocumentationLinksFieldType: boolean
) => {
	let amountOfChanges = 0
	for (const page of data) {
		for (const item of page.transformedComponentDataArr) {
			// Find item on canvas
			const node = figma.getNodeById(item.id)
			if (!(node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET') || node?.removed) continue

			try {
				const hadDifference = updateNodeOrStyleData(node, item, useDocumentationLinksFieldType)
				if (hadDifference) amountOfChanges++
			} catch (error) {
				figma.notify(`😕 ${error.message}`)
				return -1
			}
		}
	}

	return amountOfChanges
}

// -- Styles
export const transformStyleData = (
	styleData: StyleDataTypes[],
	category: StyleDataTypesCategory,
	categoryLabel: StyleDataTypesCategoryLabel
) => {
	return <CategoryStyleDataTransformed>{
		category,
		categoryLabel,
		transformedStyleDataArr: styleData.map(style => {
			return <TransformedStyleData>{
				id: style.id,
				name: style.name,
				type: style.type,
				description: style.description,
				documentationLinks: style.documentationLinks,
			}
		}),
	}
}

export const handleStyleDataChange = (
	data: CategoryStyleDataTransformed[],
	useDocumentationLinksFieldType: boolean
) => {
	let amountOfChanges = 0

	for (const categoryData of data) {
		for (const item of categoryData.transformedStyleDataArr) {
			let style: StyleDataTypes | undefined

			switch (item.type) {
				case 'PAINT': {
					style = figma.getLocalPaintStyles().find(style => style.id === item.id)
					break
				}

				case 'TEXT': {
					style = figma.getLocalTextStyles().find(style => style.id === item.id)
					break
				}

				case 'EFFECT': {
					style = figma.getLocalEffectStyles().find(style => style.id === item.id)
					break
				}

				case 'GRID': {
					style = figma.getLocalGridStyles().find(style => style.id === item.id)
					break
				}
			}
			if (!style) continue

			try {
				const hadDifference = updateNodeOrStyleData(style, item, useDocumentationLinksFieldType)
				if (hadDifference) amountOfChanges++
			} catch (error) {
				figma.notify(`😕 ${error.message}`)
				return -1
			}
		}
	}

	return amountOfChanges
}
