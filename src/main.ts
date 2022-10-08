import {
	pluralize,
	notifyForNoChanges,
	transformComponentDataV2,
	findAllComponentsInPage,
	findAllComponentsInDocument,
} from './server/utils'
import { isDocumentWideMode, updateIsDocumentWideMode } from './server/componentWideMode'

figma.showUI(__html__, {
	width: 456,
	height: 416,
	themeColors: true,
})

const onSelectionChangeV2HandleComponents = () => {
	const data = isDocumentWideMode ? findAllComponentsInDocument() : findAllComponentsInPage()
	const transformedData = transformComponentDataV2(data)

	figma.ui.postMessage({
		type: 'useNewComponentNodes',
		value: transformedData,
	})
}

const onSelectionChangeV2 = () => {
	onSelectionChangeV2HandleComponents()
}

const doInit = async ({ initial = false } = {}) => {
	if (initial) {
		updateIsDocumentWideMode(false)
	}

	onSelectionChangeV2()
}

doInit({ initial: true })

figma.on('selectionchange', () => {
	doInit()
})

figma.ui.onmessage = async msg => {
	const { type: msgType, value: msgValue } = msg

	switch (msgType) {
		case 'changeBtnClicked': {
			if (!msgValue.data) return notifyForNoChanges()

			await figma.clientStorage.setAsync('lastUsedValues', msgValue.values)

			const data: PageComponentsDataTransformed[] = msgValue.data
			let amountOfChanges = 0

			for (const page of data) {
				for (const item of page.transformedComponentDataArr) {
					// Find item on canvas
					const node = figma.getNodeById(item.id)
					if (!(node?.type === 'COMPONENT' || node?.type === 'COMPONENT_SET') || node?.removed) continue

					try {
						if (msgValue.useDocumentationLinksFieldType) {
							const oldValue = node.documentationLinks?.[0]?.uri || ''
							const newValue = item.documentationLinks?.[0]?.uri
							const hasDifference = oldValue != newValue
							if (!hasDifference) continue

							if (newValue === '')
								// hack because figma API is buggy
								item.documentationLinks = []

							node.documentationLinks = item.documentationLinks
							amountOfChanges++
						} else {
							const hasDifference = node.description != item.description
							if (!hasDifference) continue

							node.description = item.description
							amountOfChanges++
						}
					} catch (error) {
						return figma.notify(`😕 ${error.message}`)
					}
				}
			}

			figma.ui.postMessage({
				type: 'resetValues',
				value: null,
			})

			doInit()

			if (amountOfChanges === 0) {
				notifyForNoChanges()
			} else {
				const label = msgValue.useDocumentationLinksFieldType ? 'documentation link' : 'description'
				figma.notify(`👌 Changed the ${label} of ${pluralize(amountOfChanges, 'Component')}!`)
			}

			break
		}

		case 'clickUseLastChanges': {
			const values = await figma.clientStorage.getAsync('lastUsedValues')
			if (!values) return figma.notify('😌 No recent values found!')

			figma.ui.postMessage({
				type: 'clickUseLastChanges',
				value: values,
			})

			break
		}

		case 'updateIsDocumentWideMode': {
			updateIsDocumentWideMode(msgValue.isDocumentWideMode)
			doInit()
		}
	}
}
