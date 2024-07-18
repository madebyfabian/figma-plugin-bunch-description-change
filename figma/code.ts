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
	transformVariableData,
	handleVariableDataChange,
} from './utils'

figma.showUI(__html__, {
	width: 456,
	height: 496,
	themeColors: true,
})

// --- Components ---
const onSelectionChangeHandleComponentsRequest = () => {
	const data = isDocumentWideMode ? findAllComponentsInDocument() : findAllComponentsInPage()
	const transformedData = transformComponentDataV2(data)

	figma.ui.postMessage({
		type: 'useNewComponentNodes',
		value: transformedData,
	})
}

// --- Styles ---
const handleStylesRequest = () => {
	const collectedStylesData = [
		transformStyleData(figma.getLocalTextStyles(), 'TEXT', '📝 Text Styles'),
		transformStyleData(figma.getLocalPaintStyles(), 'PAINT', '🎨 Paint Styles'),
		transformStyleData(figma.getLocalEffectStyles(), 'EFFECT', '🌈 Effect Styles'),
		transformStyleData(figma.getLocalGridStyles(), 'GRID', '🔲 Grid Styles'),
	]

	figma.ui.postMessage({
		type: 'useNewStyles',
		value: collectedStylesData,
	})
}

// --- Variables ---
const handleVariablesRequest = async () => {
	const collections = await figma.variables.getLocalVariableCollectionsAsync()
	const variables = await figma.variables.getLocalVariablesAsync()

	const collectedVariablesData = collections.map(collection => {
		const variablesInCollection = variables.filter(variable => variable.variableCollectionId === collection.id)
		return transformVariableData(variablesInCollection, collection.name)
	})

	figma.ui.postMessage({
		type: 'useNewVariables',
		value: collectedVariablesData,
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

		case 'requestVariablesData': {
			handleVariablesRequest()
			break
		}

		case 'changeBtnClicked': {
			if (!msgValue.componentData && !msgValue.styleData && !msgValue.variableData) {
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
			if (msgValue.variableData) {
				amountOfChanges = await handleVariableDataChange(msgValue.variableData)
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

				const getEditModeLabel = () => {
					if (msgValue.componentData) return 'component'
					if (msgValue.styleData) return 'style'
					if (msgValue.variableData) return 'variable'
				}
				const editModeLabel = getEditModeLabel()

				figma.notify(`👌 Changed the ${fieldTypeLabel} of ${pluralize(amountOfChanges, editModeLabel)}!`)

				if (msgValue.styleData) {
					// after we changed the styles, we need to update the ui also.
					handleStylesRequest()
				}

				if (msgValue.variableData) {
					// after we changed the variables, we need to update the ui also.
					handleVariablesRequest()
				}
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
