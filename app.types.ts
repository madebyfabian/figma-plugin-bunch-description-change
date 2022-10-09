/// <reference types="@figma/plugin-typings" />

// Components
export type ComponentNodeTypes = ComponentNode | ComponentSetNode
export type TransformedComponentData = Pick<ComponentNodeTypes, 'id' | 'name' | 'description' | 'documentationLinks'>
export type PageComponentsDataTransformed = {
	pageId: string
	pageName: string
	transformedComponentDataArr: TransformedComponentData[]
}

// Styles
export type StyleDataTypes = TextStyle | PaintStyle | EffectStyle | GridStyle
export type StyleDataTypesCategory = StyleDataTypes['type']
export type StyleDataTypesCategoryLabel = '📝 Text Styles' | '🎨 Paint Styles' | '🌈 Effect Styles' | '🔲 Grid Styles'
export type TransformedStyleData = Pick<StyleDataTypes, 'id' | 'name' | 'type' | 'description' | 'documentationLinks'>
export type CategoryStyleDataTransformed = {
	category: StyleDataTypesCategory
	categoryLabel: StyleDataTypesCategoryLabel
	transformedStyleDataArr: TransformedStyleData[]
}
