let BuilderBlock = {
	props: [
		'block', 
		'index', 
		'columnsCount', 
		'pageUid', 
		'pageId',
		'showPreview'
	],
	mounted() {
		this.$nextTick(function () {
			this.pending = false
		});
		if (this.block.preview && this.showPreview) {
			this.displayPreview(this.block.preview)
		} else {
			this.showFieldSet(this.fieldSets[0].key)
		}
	},
	data() {
		return {
			pending: true,
			activeFieldSet: null,
			expanded: true,
			previewFrameContent: null,
			previewHeight: 0,
			previewStored: false,
			// showPreview: false
		}
	},
	computed: {
		extendedUid() {
			return this.paged + '-' + this._uid
		},
		previewUrl() {
			if (this.previewStored) {
				return '/kirby-builder-preview/' + this.extendedUid + '?' + this.objectToGetParams(this.block.preview) + '&pageid=' + this.pageId
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
				fieldSets.push(this.newFieldSet(this.block, 'content', this.block.content, 'edit'))
			}
			return fieldSets
		},
	},
	methods: {
		onBlockInput(event) {
			this.$emit("input", this.val)
		},
		displayPreview() {
			this.$emit('update:showPreview', true)
			// this.showPreview = true
			let previewData = {
				preview: this.block.preview,
				blockcontent: this.block.content,
				blockUid: this.extendedUid
			}
			this.$api.post('kirby-builder/preview', previewData)
				.then( () => {
					this.previewStored = true
				})
		},
		onPreviewLoaded(event) {
			this.previewHeight = event.detail.height
			this.activeFieldSet = null
		},
		toggleExpand() {
			this.expanded = (this.expanded) ? false : true
		},
		showFieldSet(fieldSetKey) {
			this.$emit('update:showPreview', false)
			// this.showPreview = false
			this.activeFieldSet = fieldSetKey
			this.previewHeight = 0
		},
		newFieldSet(fieldSet, key, model, icon) {
			let newFieldSet =  {
				fields: fieldSet.fields,
				key: key,
				model: model,
				icon: icon || null,
			}
			return newFieldSet
		},
		objectToGetParams(obj) {
			return Object.keys(obj).map(function (key) {
				return key + '=' + obj[key];
			}).join('&');
		}
	},
	template: `
		<div :class="['kBuilder__block', 'kBuilder__block--col-' + columnsCount, {'kBuilder__block--pending': pending }]">
			<div :class="'kBuilder__blockHeader kBuilder__blockHeader--col-' + columnsCount" >
				<k-icon 
					type="sort" 
					:class="'kBuilder__dragDropHandle kBuilder__dragDropHandle--col-' + columnsCount" 
				/>
				{{block.label}} ||| {{_uid}}
					<div class="kBuilder__blockActions">
						<k-button 
							v-if="block.preview"
							icon="preview" 
							@click="displayPreview()"
							class="kBuilder__blockActionsButton" 
							:class="{'kBuilder__blockActionsButton--active': showPreview}"
						></k-button>
						<k-button 
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
									<k-dropdown-item 
										icon="copy" 
										@click="$emit('cloneBlock', index)"
									>Clone</k-dropdown-item>
									<k-dropdown-item 
										icon="trash" 
										@click="$emit('deleteBlock', index)"
									>Delete</k-dropdown-item>
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
			<div 
				class="kBuilder__blockContent"
				v-show="expanded"
			>
				<iframe 
					v-if="block.preview && showPreview"
					class="kBuilder__previewFrame" 
					@loaded="onPreviewLoaded"
					:style="{height: previewHeight + 'px'}"
					:src="previewUrl"
				></iframe>
				<k-fieldset 
					v-if="(activeFieldSet === fieldSet.key)" 
					v-for="fieldSet in fieldSets"
					class="kBuilder__blockForm"
					v-model="fieldSet.model" 
					:value="{}" 
					:fields="fieldSet.fields" 
					v-on="$listeners"
					:key="fieldSet.key + _uid" 
				/>
			</div>
		</div>
	`
}

let BuilderField = {
	props: {
		value: String,
		fieldsets: Object,
		columns: Number,
		limit: Number,
		label: String,
		preview: Object,
		pageId: String,
		pageUid: String,
	},
	components: { BuilderBlock },
	mounted() {
		console.log('mounted blocks', this.blocks.length);

		if(this.value){
			this.value.forEach((block, index) => {
				let fieldSet = this.fieldsets[block._key]
				this.blocks.push( this.newBlock(fieldSet, block._key, block, index))
			});
			console.log('blocks', this.blocks);
			this.lastUniqueKey = this.value.length
		}
		console.log('mounted blocks2', this.blocks.length);
	},
	data () {
		return {
			// fieldDefinition: {},
			blocks: [],
			toggle: true,
			targetPosition: null,
			lastUniqueKey: 0,
			dataField: {
				label: 'date label',
				type: 'date'
			},
			dateValue: null
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
		},
	},
	methods: {
		onBlockInput(event) {
			this.$emit("input", this.val);
		},
		onBlockMoved(event) {
			this.$emit("input", this.val);
		},
		onMove(event) {
			//Prevent sorting behind last element that contains the add button
			return event.relatedContext.index != this.blocks.length + 1
		},
		openBlockSelection(position) {
			this.$refs.dialog.open()
			this.targetPosition = position
		},
		addBlock(key) {
			let position = this.targetPosition || this.blocks.length 
			let fieldSet = this.fieldsets[key]
			let newBlock = this.newBlock(fieldSet, key, this.getBlankContent(key, fieldSet), this.lastUniqueKey++)
			this.blocks.splice(position, 0, JSON.parse(JSON.stringify(newBlock)))
			this.$refs.dialog.close()
			this.targetPosition = null
			this.$emit("input", this.val);
		},
		getBlankContent(key, fieldSet) {
			let content = {'_key': key}
			if (fieldSet.fields) {
				Object.keys(fieldSet.fields).forEach(fieldName => {
					content[fieldName] = fieldSet.fields[fieldName].value || ''
				})
			} else if (fieldSet.tabs) {
				for (const tabName in fieldSet.tabs) {
					content[tabName] = {}
					if (fieldSet.tabs.hasOwnProperty(tabName)) {
						const tab = fieldSet.tabs[tabName];
						Object.keys(tab.fields).forEach(fieldName => {
							content[tabName][fieldName] = tab.fields[fieldName].value || ''
						})
					}
				}
			}
			return content
		},
		cloneBlock(index) {
			const clone = JSON.parse(JSON.stringify(this.blocks[index]))
			this.blocks.splice(index + 1, 0, clone)
			this.blocks[index + 1].uniqueKey = this.lastUniqueKey++
			this.$emit("input", this.val);
		},
		deleteBlock(index) {
			this.blocks.splice(index, 1);
			this.$emit("input", this.val);
		},
		newBlock(fieldSet, key, content, uniqueKey){
			return {
				fields: fieldSet.fields ? fieldSet.fields : null,
				tabs: fieldSet.tabs ? fieldSet.tabs : null,
				blockKey: key,
				content: content,
				label: fieldSet.label,
				uniqueKey: uniqueKey,
				preview: fieldSet.preview,
				showPreview: false
			}
		}
	},
	template: `
	<k-field 
		:label="label"	
		class="kBuilder"
		:class="'kBuilder--col-' + columnsCount">
		<k-draggable 
			class="kBuilder__blocks k-grid" 
			@end="drag=false" 
			v-model="blocks"
			@update="onBlockMoved"
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
					:showPreview.sync="block.showPreview" 
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
				@click="addBlock(key)"
				:text="value.label" />
			</k-list>
		</k-dialog>
	</k-field>
	`
}

panel.plugin("timoetting/k-builder", {
	fields: {
		builder: BuilderField
	}
});