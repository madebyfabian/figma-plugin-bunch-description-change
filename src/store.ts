import { reactive, computed } from 'vue'
import { TransformedComponentData, TransformedStyleData } from '../app.types'

export type EditMode = 'components' | 'styles'
export type FieldType = 'description' | 'documentationLinks'

const _initialState = {
	editMode: 'components' as EditMode,
	isDocumentWideMode: false,

	values: {
		match: '',
		replace: '',
		useRegexMatch: false,
	},

	useFieldType: 'description' as FieldType,
	useFieldTypeValues: [
		{ value: 'description', label: 'Change Description' },
		{ value: 'documentationLinks', label: 'Change Documentation Link' },
	],
}

export const store = reactive<typeof _initialState>(JSON.parse(JSON.stringify(_initialState)))

export const replaceMatchInsteadOfValue = computed(() => {
	return store.values.match !== ''
})

/**
 * Takes in an item and
 * @returns The Value of either the description or the documentationLinks field.
 */
export const getFieldValueOfData = (item: TransformedComponentData | TransformedStyleData | null) => {
	if (!item) return null
	if (store.useFieldType === 'documentationLinks')
		return item.documentationLinks && item.documentationLinks[0] ? item.documentationLinks[0].uri : null
	else return item.description
}

export const transformFieldValue = <ReturnType = TransformedComponentData | TransformedStyleData>(
	originalData: TransformedComponentData | TransformedStyleData,
	newDataItem: TransformedComponentData | TransformedStyleData,
	newDataItemKey: number,
	allNewDataItems: (TransformedComponentData | TransformedStyleData)[]
) => {
	// Holds the string with the field's value
	let fieldValue = ''

	const originalFieldValue = getFieldValueOfData(originalData) || ''

	if (!store.values.match.length) fieldValue = !store.values.replace.length ? originalFieldValue : store.values.replace
	else {
		let matchStr = store.values.match
		if (store.values.useRegexMatch)
			try {
				matchStr = String(new RegExp(store.values.match))
			} catch (error) {
				matchStr = ''
			}

		fieldValue = originalFieldValue.replace(matchStr, store.values.replace)
	}

	// Now replace all variables with their data
	fieldValue = fieldValue.replace(/\$&/gi, replaceMatchInsteadOfValue.value ? store.values.match : originalFieldValue)
	fieldValue = fieldValue.replace(/\$L/gi, originalData?.name || '')
	fieldValue = fieldValue.replace(/\$CLEAR/gi, '')

	const ascNumberMatches = fieldValue.match(/\$n+/g) || []
	for (const str of ascNumberMatches) {
		fieldValue = fieldValue.replace(str, String(newDataItemKey).padStart(str.length - 1, '0'))
	}
	const descNumberMatches = fieldValue.match(/\$N+/g) || []
	for (const str of descNumberMatches) {
		fieldValue = fieldValue.replace(
			str,
			String(allNewDataItems.length - newDataItemKey - 1).padStart(str.length - 1, '0')
		)
	}

	let returnData = { ...newDataItem }
	if (store.useFieldType === 'documentationLinks') {
		returnData.documentationLinks = [{ uri: fieldValue }]
	} else {
		returnData.description = fieldValue
	}

	return returnData as unknown as ReturnType
}

export const resetStore = () => {
	Object.assign(store.values, _initialState.values)
}
