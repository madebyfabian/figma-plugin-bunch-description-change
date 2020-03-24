const pluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;


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
	


figma.showUI(__html__, { 
	width: 408, 
	height: 376
})


onSelectionChange()

figma.on('selectionchange', () => { onSelectionChange() })


figma.ui.onmessage = async msg => {
	const { type: msgType, value: msgValue } = msg

	switch (msgType) {
		case 'changeBtnClicked': {
			const currSel = figma.currentPage.selection

			if (!msgValue.data)
				return figma.notify('😁 Nothing has changed!')

			await figma.clientStorage.setAsync('lastUsedValues', msgValue.values)

			for (const item of msgValue.data) {
				let foundSelNode: ComponentNode
				for (const currSelNode of currSel) {
					if (currSelNode.type === 'COMPONENT' && item.id === currSelNode.id) {
						foundSelNode = currSelNode
						break
					}
				}

				foundSelNode.description = item.description
			}

			figma.ui.postMessage({ 
				type: 'resetValues',
				value: null
			})

			onSelectionChange()

			figma.notify(`👌 Changed the description of ${ pluralize(msgValue.data.length, 'Component') }!`)

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
	}
}


