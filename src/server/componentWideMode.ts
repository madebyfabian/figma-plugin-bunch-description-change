export let isDocumentWideMode = false

export const updateIsDocumentWideMode = (newVal: boolean) => {
	isDocumentWideMode = newVal
	figma.ui.postMessage({
		type: 'updateIsDocumentWideMode',
		value: newVal,
	})
}
