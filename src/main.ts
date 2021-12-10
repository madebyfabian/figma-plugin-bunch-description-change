type PageComponentsData = { 
	pageId: string, 
	pageName: string, 
	components: ( ComponentNode | ComponentSetNode )[] 
}

type PageComponentsDataTransformed = {
	pageId: string,
	pageName: string,
	transformedComponentDataArr: TransformedComponentData[]
}

type TransformedComponentData = {
	id: string,
	name: string,
	description: string,
	documentationLinks: DocumentationLink[]
}


figma.showUI(__html__, { 
	width: 456, 
	height: 416
})


let isDocumentWideMode = false


const pluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;

const transformComponentDataV2 = ( data: PageComponentsData[] ) => {
	return data.map(( item: PageComponentsData ) => {
		return <PageComponentsDataTransformed>{
			pageId: item.pageId,
			pageName: item.pageName,
			transformedComponentDataArr: item.components.map(( node ) => {
				return <TransformedComponentData>{
					id: node.id,
					name: node.name,
					description: node.description,
					documentationLinks: node.documentationLinks
				}
			})
		}
	})
}

const updateIsDocumentWideMode = ( newVal: boolean ) => {
	isDocumentWideMode = newVal

	figma.ui.postMessage({
		type: 'updateIsDocumentWideMode',
		value: newVal
	})
}


const onSelectionChange = async () => {
	let data : PageComponentsDataTransformed[] = []

	if (!isDocumentWideMode) {
		// First, check if the current selection has any none-component nodes in it.
		const filteredSel = figma.currentPage.selection.filter(selectionItem => selectionItem.type === 'COMPONENT' || selectionItem.type === 'COMPONENT_SET')

		const preparedDataObj: PageComponentsData = { 
			pageId: figma.currentPage.id,
			pageName: figma.currentPage.name,
			components: <any[]>filteredSel
		}

		data = transformComponentDataV2([ preparedDataObj ])
	}

	figma.ui.postMessage({
		type: 'useNewComponentNodes',
		value: data
	})
}


const getAllComponentsInDocument = () => {
	// Find all documents in all pages & even the ones nested inside frames.
	const preparedDataArr: PageComponentsData[] = []
	for (const documentNode of figma.root.children) {
		const components = documentNode.findAll(node => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')
		if (!components.length)
			continue

		const preparedData : PageComponentsData = {
			pageId: documentNode.id,
			pageName: documentNode.name,
			components: <any[]>components
		}
		preparedDataArr.push(preparedData)
	}

	const data = transformComponentDataV2(preparedDataArr)

	figma.ui.postMessage({
		type: 'useNewComponentNodes',
		value: data
	})
}


const doInit = async ({ initial = false } = {}) => {
	if (initial) {		
		updateIsDocumentWideMode(false)
	}

	if (isDocumentWideMode)
		getAllComponentsInDocument()
	else
		onSelectionChange()
}
	

doInit({ initial: true })

figma.on('selectionchange', () => { doInit() })


figma.ui.onmessage = async msg => {
	const { type: msgType, value: msgValue } = msg

	switch (msgType) {
		case 'changeBtnClicked': {
			if (!msgValue.data)
				return figma.notify('😁 Nothing has changed!')

			await figma.clientStorage.setAsync('lastUsedValues', msgValue.values)

			const data : PageComponentsDataTransformed[] = msgValue.data
			let amountOfChanges = 0

			for (const page of data) {
				for (const item of page.transformedComponentDataArr) {
					// Find item on canvas
					const node = figma.getNodeById(item.id)
					if (!(node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET') || node?.removed)
						continue

					try {
						if (msgValue.useDocumentationLinksFieldType) {
							if (item.documentationLinks[0].uri === '')
								item.documentationLinks = []

								node.documentationLinks = item.documentationLinks
						} else
							node.description = item.description

						amountOfChanges++
					} catch (error) {
						return figma.notify(`😕 ${ error.message }`)
					}
				}
			}

			figma.ui.postMessage({ 
				type: 'resetValues',
				value: null
			})

			doInit()

			const label = msgValue.useDocumentationLinksFieldType ? 'documentation link' : 'description'
			figma.notify(`👌 Changed the ${ label } of ${ pluralize(amountOfChanges, 'Component') }!`)

			break
		}

		case 'clickUseLastChanges': {
			const values = await figma.clientStorage.getAsync('lastUsedValues')
			if (!values)
				return figma.notify('😌 No recent values found!')

			figma.ui.postMessage({
				type: 'clickUseLastChanges',
				value: values
			})

			break
		}

		case 'updateIsDocumentWideMode': {
			updateIsDocumentWideMode(msgValue.isDocumentWideMode)
			doInit()
		}
	}
}


