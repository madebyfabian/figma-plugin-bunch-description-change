import {
	pluralize,
	notifyForNoChanges,
	transformComponentDataV2,
	findAllComponentsInPage,
	findAllComponentsInDocument,
	isDocumentWideMode,
	updateIsDocumentWideMode,
	transformStyleData,
	handleComponentDataChange,
	handleStyleDataChange,
} from './utils'

figma.showUI(__html__, {
	width: 456,
	height: 496,
	themeColors: true,
})

const onSelectionChangeHandleComponentsRequest = () => {
	const data = isDocumentWideMode ? findAllComponentsInDocument() : findAllComponentsInPage()
	const transformedData = transformComponentDataV2(data)

	figma.ui.postMessage({
		type: 'useNewComponentNodes',
		value: transformedData,
	})
}

const handleStylesRequest = () => {
	const collectedStylesData = [
		transformStyleData(figma.getLocalPaintStyles(), 'PAINT', '🎨 Paint'),
		transformStyleData(figma.getLocalTextStyles(), 'TEXT', '📝 Text'),
		transformStyleData(figma.getLocalEffectStyles(), 'EFFECT', '🌈 Effect'),
		transformStyleData(figma.getLocalGridStyles(), 'GRID', '🔲 Grid'),
	]

	figma.ui.postMessage({
		type: 'useNewStyles',
		value: collectedStylesData,
	})
}

const doInit = async ({ initial = false } = {}) => {
	if (initial) {
		updateIsDocumentWideMode(false)
	}

	onSelectionChangeHandleComponentsRequest()
}

doInit({ initial: true })

figma.on('selectionchange', () => {
	doInit()
})

figma.ui.onmessage = async msg => {
	const { type: msgType, value: msgValue } = msg

	switch (msgType) {
		case 'requestComponentsData': {
			onSelectionChangeHandleComponentsRequest()
			break
		}

		case 'requestStylesData': {
			handleStylesRequest()
			break
		}

		case 'changeBtnClicked': {
			if (!msgValue.componentData && !msgValue.styleData) {
				return notifyForNoChanges()
			}

			await figma.clientStorage.setAsync('lastUsedValues', msgValue.values)

			let amountOfChanges = 0
			if (msgValue.componentData) {
				amountOfChanges = handleComponentDataChange(msgValue.componentData, msgValue.useDocumentationLinksFieldType)
			}
			if (msgValue.styleData) {
				amountOfChanges = handleStyleDataChange(msgValue.styleData, msgValue.useDocumentationLinksFieldType)
			}

			figma.ui.postMessage({
				type: 'resetValues',
				value: null,
			})

			doInit()

			if (amountOfChanges === -1) {
				// Error was thrown.
			} else if (amountOfChanges === 0) {
				notifyForNoChanges()
			} else {
				const fieldTypeLabel = msgValue.useDocumentationLinksFieldType ? 'documentation link' : 'description'
				const editModeLabel = msgValue.componentData ? 'component' : 'style'
				figma.notify(`👌 Changed the ${fieldTypeLabel} of ${pluralize(amountOfChanges, editModeLabel)}!`)
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
