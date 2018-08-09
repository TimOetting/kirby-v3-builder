let BuilderBlock = {
	props: ['block', 'index', 'columnsCount', 'pageUid', 'pageId'],
	methods: {
		onBlockInput(event) {
			this.$emit("input", this.val)
		},
		showPreview() {
			this.showingPreview = true
			let postData = {
				preview: this.block.preview,
				blockcontent: this.block.content,
				blockUid: this.extendedUid
			}
			this.$api.post('kirby-builder/preview', postData)
			.then((r) => {
				this.previewStored = true
			})
		},
		toggleExpand() {
			this.expanded = (this.expanded) ? false : true
		},
		showFieldSet(fieldSetKey) {
			this.showingPreview = false
			this.activeFieldSet = fieldSetKey
			this.previewHeight = 0
		},
		objectToGetParamString(obj) {
			return Object.keys(obj).map(function (key) {
				return key + '=' + obj[key];
			}).join('&');
		},
		onPreviewLoaded(event) {
			this.previewHeight = event.detail.height
			this.activeFieldSet = null
		},
		newFieldSet(fieldSet, key, model, icon) {
			return {
				fields: fieldSet.fields,
				key: key,
				model: model,
				icon: (icon) ? icon : null,
			}
		}
	},
	mounted() {
		this.$nextTick(function () {
			this.pending = false
		});
		if (this.block.preview && this.showingPreview) {
			this.showPreview(this.block.preview)
		} else {
			this.showFieldSet(this.fieldSets[0].key)
			console.log(this.activeFieldSet)
		}
	},
	data() {
		return {
			pending: true,
			showingPreview: false,
			activeFieldSet: null,
			previewFrameContent: null,
			previewHeight: 0,
			previewStored: false,
			expanded: true,
		}
	},
	computed: {
		extendedUid() {
			return this.pageUid + '-' + this._uid
		},
		previewUrl() {
			if (this.previewStored) {
				return '/kirby-builder-preview/' + this.extendedUid + '?' + this.objectToGetParamString(this.block.preview) + '&pageid=' + this.pageId
			} else {
				return ''
			}
		},
		fieldSets() {
			let fieldSets = []
			if (this.block.tabs) {
				for (const tabKey in this.block.tabs) {
					if (this.block.tabs.hasOwnProperty(tabKey)) {
						const tab = this.block.tabs[tabKey];
						fieldSets.push(this.newFieldSet(tab, tabKey, this.block.content[tabKey], tab.icon))
					}
				}
			} else if (this.block.fields) {
				fieldSets.push(this.newFieldSet(this.block, 'conty', this.block.content, 'edit'))
			}
			return fieldSets
		}
	},
	template: `
		<div 
			class="kBuilder__block"
			:class="[{'kBuilder__block--pending': pending }, 'kBuilder__block--col-' + columnsCount]"
		>
			<div 
				:class="'kBuilder__blockHeader kBuilder__blockHeader--col-' + columnsCount" 
			>
				<k-icon 
					type="sort" 
					:class="'kBuilder__dragDropHandle kBuilder__dragDropHandle--col-' + columnsCount" 
				/>
				{{block.label}} {{_uid}}
					<div class="kBuilder__blockActions">
						<k-button 
							v-if="block.preview"
							icon="preview" 
							@click="showPreview()"
							class="kBuilder__blockActionsButton" 
							:class="{'kBuilder__blockActionsButton--active': showingPreview}"
							></k-button>
						<k-button 
						v-if="block.preview"
						v-for="fieldSet in fieldSets"
						:key="'showFierldSetButton-' + _uid + fieldSet.key"
						:icon="fieldSet.icon" 
						@click="showFieldSet(fieldSet.key)"
						class="kBuilder__blockActionsButton"
							:class="{'kBuilder__blockActionsButton--active': (activeFieldSet == fieldSet.key )}"
							></k-button>
						<div class="kBuilder__blockControl">
							<k-dropdown class="kBuilder__blockActionsDropDown">
								<k-button 
									icon="dots" 
									@click="$refs['blockActions' + block.uniqueKey].toggle()"
									class="kBuilder__blockActionsButton"
									></k-button>
								<k-dropdown-content :ref="'blockActions' + block.uniqueKey">
									<k-dropdown-item icon="copy" @click="$emit('cloneBlock', index)">Clone</k-dropdown-item>
									<k-dropdown-item icon="trash" @click="$emit('deleteBlock', index)">Delete</k-dropdown-item>
								</k-dropdown-content>
							</k-dropdown>	
							<k-button 
								icon="angle-down" 
								@click="toggleExpand"
								class="kBuilder__blockActionsButton"
							></k-button>
						</div>
					</div>
			</div>
			<iframe 
				ref="frame" 
				class="kBuilder__previewFrame" 
				@loaded="onPreviewLoaded"
				:style="{height: previewHeight + 'px'}"
				:src="previewUrl"
				v-if="block.preview && showingPreview && expanded"></iframe>
			<k-fieldset 
				v-for="fieldSet in fieldSets"
				v-if="expanded && (activeFieldSet == fieldSet.key)" 
				class="kBuilder__blockForm"
				v-model="fieldSet.model" 
				:fields="fieldSet.fields" 
				v-on="$listeners"
				:key="fieldSet.key + _uid" 
			/>
		</div>
	`
}

let Builder = {
	props: {
		value: String,
		additional: String,
		fieldsets: Object,
		columns: Number,
		limit: Number,
		label: String,
		preview: Object,
		pageId: String,
		pageUid: String
	},
	components: { BuilderBlock },
	methods: {
		onBlockInput(event) {
			this.$emit("input", this.val);
		},
		onMoveBlock(event) {
			this.$emit("input", this.val);
		},
		onMove(event) {
			//Prevent sorting behind last element that contains the add button
			return event.relatedContext.index != this.blocks.length + 1
		},
		onDragStart(event) {
			this.drag = true
			let itemPreviewFrames = event.item.querySelectorAll('.kBuilder__previewFrame')
			let clonePreviewFrames = document.querySelectorAll('.sortable-drag .kBuilder__previewFrame')
			itemPreviewFrames.forEach((itemPreviewFrame, index) => {
				let itemPreviewFrameContent = itemPreviewFrame.contentWindow.document.documentElement.innerHTML
				let clonePreviewFrameDocument = clonePreviewFrames[index].contentWindow.document
				clonePreviewFrameDocument.open()
				clonePreviewFrameDocument.write(itemPreviewFrameContent)
				clonePreviewFrameDocument.close()
			});
		},
		openBlockSelection(position) {
			this.$refs.dialog.open()
			this.addPosition = position
		},
		addElement(key) {
			let position = (this.addPosition != null) ? this.addPosition : this.blocks.length 
			let fieldSet = this.fieldsets[key]
			let newBlock = {
				fields: fieldSet.fields ? fieldSet.fields : null,
				tabs: fieldSet.tabs ? fieldSet.tabs : null,
				blockKey: key,
				tabbed: typeof fieldSet.tabs != undefined,
				content: this.getBlankContent(key, fieldSet),
				label: fieldSet.label,
				uniqueKey: this.lastUniqueKey++,
				preview: fieldSet.preview
			}
			this.blocks.splice(position, 0, JSON.parse(JSON.stringify(newBlock)))
			this.$refs.dialog.close()
			this.addPosition = null
		},
		getBlankContent(key, fieldSet) {
			let content = {'_key': key}
			if (fieldSet.fields) {
				Object.keys(fieldSet.fields).forEach(fieldName => {
					content[fieldName] = ''
				})
			} else if (fieldSet.tabs) {
				for (const tabName in fieldSet.tabs) {
					content[tabName] = {}
					// if (fieldSet.tabs.hasOwnProperty(tabName)) {
					// 	const tab = fieldSet.tabs[tabName];

						// Object.keys(tab.fields).forEach(fieldName => {
						// 	tab.fields[fieldName] = ''
						// })
						// Object.keys(fields).forEach(fieldName => {
						// 	content[tabName][fieldName] = ''
						// })
					// }
				}
			}
			return content
		},
		// getFieldDefinition(fieldSet) {
		// 	return (fieldSet.fields) ? fieldSet.fields : fieldSet.tabs
		// },
		cloneBlock(index) {
			this.blocks.splice(index + 1, 0, JSON.parse(JSON.stringify(this.blocks[index])))
			this.blocks[index + 1].uniqueKey = this.lastUniqueKey++
			this.$emit("input", this.val);
		},
		deleteBlock(index) {
			this.blocks.splice(index, 1);
			this.$emit("input", this.val);
		}
	},
	computed: {
		val () {
			return this.blocks.map( block => block.content )
		},
		columnsCount() {
			return this.columns ? this.columns : '1'
		},
		columnWidth() {
			return this.columns ? '1/' + this.columns : '1/1'
		},
		blockCount () {
			return this.blocks.length
		}
	},
	data () {
		return {
			// fieldDefinition: {},
			blocks: [],
			toggle: true,
			addPosition: null,
			lastUniqueKey: 0,
			dataField: {
				label: 'date label',
				type: 'date'
			},
			dateValue: null
		}
	},
	mounted () {
		console.log('mounty mound')
		if(this.value){
			this.value.forEach((block, index) => {
				let fieldSet = this.fieldsets[block._key]
				this.blocks.push(
					{
						fields: fieldSet.fields ? fieldSet.fields : null,
						tabs: fieldSet.tabs ? fieldSet.tabs : null,
						// fieldDefinition: this.getFieldDefinition(fieldSet),
						blockKey: block._key,
						content: block,
						label: fieldSet.label,
						uniqueKey: index,
						tabbed: typeof fieldSet.tabs != "undefined",
						preview: fieldSet.preview
					}
				)
			});
			this.lastUniqueKey = this.value.length
		}
	},
	template: `
	<k-field 
		:label="label"	
		class="kBuilder"
		:class="'kBuilder--col-' + columnsCount">
		<k-draggable 
			class="kBuilder__blocks k-grid" 
			@start="onDragStart" 
			@end="drag=false" 
			v-model="blocks"
			@update="onMoveBlock"
			:move="onMove"
			:options="{ clone: true, forceFallback: true, handle: '.kBuilder__dragDropHandle', scroll: true }"
		>
			<k-column 
				class="kBuilder__column"
				:width="columnWidth"
				v-for="(block, index) in blocks" 
				:key="block.uniqueKey" 
			>
				<div 
				class="kBuilder__inlineAddButton"
				:class="{'kBuilder__inlineAddButton--horizontal': (columnsCount == 1), 'kBuilder__inlineAddButton--vertical': (columnsCount > 1)}"
				@click="openBlockSelection(index)"></div>
				<builder-block 
					:block="block" 
					:index="index"
					:columnsCount="columnsCount"
					:pageUid="pageUid" 
					:pageId="pageId" 
					@input="onBlockInput" 
					@cloneBlock="cloneBlock"
					@deleteBlock="deleteBlock"/>
				<div 
				v-if="(columnsCount % index == 0 && columnsCount > 1)"
				class="kBuilder__inlineAddButton kBuilder__inlineAddButton--vertical kBuilder__inlineAddButton--after"
				@click="openBlockSelection(index + 1)"></div>
				
				
			</k-column >
			<k-column :width="columnWidth" v-if="!limit || blockCount < limit">
				<k-button 
					icon="add" 
					@click="openBlockSelection()"
					class="kBuilder__addButton"
				>
					Add
				</k-button>
			</k-column>
		</k-draggable>

		<k-dialog 
			ref="dialog" >
			<k-list>
				<k-list-item
				class="kBuilder__addBlockButton"
				v-for="(value, key) in fieldsets" 
				:key="key" 
				@click="addElement(key)"
				:text="value.label" />
			</k-list>
		</k-dialog>
	</k-field>
	`
}

panel.plugin("timoetting/k-builder", {
	fields: {
		builder: Builder
	}
});