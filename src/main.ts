figma.showUI(__html__, { 
	width: 400, 
	height: 400
})

const onSelectionChange = () => {
	// First, check if the current selection has any none-component nodes in it.
	const filteredSel = figma.currentPage.selection.filter(selectionItem => selectionItem.type === 'COMPONENT')
	const data = filteredSel.map((selectionItem: ComponentNode) => {
		return {
			id: selectionItem.id,
			name: selectionItem.name,
			description: selectionItem.description
		}
	})

	figma.ui.postMessage({
		type: 'selectionchange',
		value: data
	})
}



const pluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;


figma.ui.onmessage = msg => {
	const { type: msgType, value: msgValue } = msg

	switch (msgType) {
		case 'changeBtnClicked': {
			const selectionItems = []

			for (const item of msgValue) {
				const foundNodeOnCanvas = figma.currentPage.findOne(node => {
					return node.type === 'COMPONENT' && node.id === item.id
				})

				foundNodeOnCanvas['description'] = item.description
				selectionItems.push(foundNodeOnCanvas)
			}

			figma.currentPage.selection = selectionItems
			
			figma.notify(`👌 Changed the description of ${ pluralize(figma.currentPage.selection.length, 'node') }!`)

			onSelectionChange()

			break
		}
	
		default:
			break;
	}
}


onSelectionChange()

figma.on('selectionchange', () => {
	onSelectionChange()
})