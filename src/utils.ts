import type {
	CategoryStyleDataTransformed,
	CollectionVariableDataTransformed,
	PageComponentsDataTransformed,
} from '../app.types'
import { store, resetStore } from './store'

export const postMsg = (type: string, value: unknown) => {
	parent.postMessage({ pluginMessage: { type, value } }, '*')
}

export const updateIsDocumentWideMode = (newVal: boolean) => {
	postMsg('updateIsDocumentWideMode', { isDocumentWideMode: newVal })
}

export const defaultOnmessageHandler = (event: MessageEvent<any>) => {
	const msg = event.data.pluginMessage
	if (!msg) return

	switch (msg.type) {
		case 'clickUseLastChanges': {
			store.values = msg.value
			break
		}

		case 'updateIsDocumentWideMode': {
			store.isDocumentWideMode = msg.value
			break
		}

		case 'resetValues': {
			resetStore()
			break
		}
	}
}

export type ComponentData = {
	curr: PageComponentsDataTransformed[] | null
	original: PageComponentsDataTransformed[] | null
}

export type StyleData = {
	curr: CategoryStyleDataTransformed[] | null
	original: CategoryStyleDataTransformed[] | null
}

export type VariableData = {
	curr: CollectionVariableDataTransformed[] | null
	original: CollectionVariableDataTransformed[] | null
}
