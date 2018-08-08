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
		showForm() {
			this.showingPreview = false
			this.showingForm = true
			this.previewHeight = 0
		},
		objectToGetParamString(obj) {
			return Object.keys(obj).map(function (key) {
				return key + '=' + obj[key];
			}).join('&');
		},
		onPreviewLoaded(event) {
			this.previewHeight = event.detail.height
			this.showingForm = false
		}
	},
	mounted() {
		console.log(this.pageUid)
		console.log(this.pageId)
		this.$nextTick(function () {
			this.pending = false
		});
		if (this.block.preview && this.showingPreview) {
			this.showPreview(this.block.preview)
		}
	},
	data() {
		return {
			pending: true,
			showingPreview: false,
			showingForm: true,
			previewFrameContent: null,
			previewHeight: 0,
			previewStored: false,
			expanded: true
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
				<k-dropdown class="kBuilder__blockActions">
					<k-button 
						v-if="block.preview"
						icon="preview" 
						@click="showPreview()"
						class="kBuilder__blockActionsButton" 
						:class="{'kBuilder__blockActionsButton--inactive': showingPreview}"
					></k-button>
					<k-button 
						v-if="block.preview"
						icon="edit" 
						@click="showForm()"
						class="kBuilder__blockActionsButton"
						:class="{'kBuilder__blockActionsButton--inactive': !showingPreview}"
					></k-button>
					<k-button 
						icon="dots" 
						@click="$refs['blockActions' + block.uniqueKey].toggle()"
						class="kBuilder__blockActionsButton"
					></k-button>
					<k-button 
						icon="angle-down" 
						@click="toggleExpand"
						class="kBuilder__blockActionsButton"
					></k-button>
					<k-dropdown-content :ref="'blockActions' + block.uniqueKey">
						<k-dropdown-item icon="copy" @click="$emit('cloneBlock', index)">Clone</k-dropdown-item>
						<k-dropdown-item icon="trash" @click="$emit('deleteBlock', index)">Delete</k-dropdown-item>
					</k-dropdown-content>
				</k-dropdown>
			</div>
			<iframe 
				ref="frame" 
				class="kBuilder__previewFrame" 
				@loaded="onPreviewLoaded"
				:style="{height: previewHeight + 'px'}"
				:src="previewUrl"
				v-if="block.preview && showingPreview && expanded"></iframe>
			<k-fieldset 
				class="kBuilder__blockForm"
				v-model="block.content" 
				:fields="block.fieldDefinition" 
				v-on="$listeners"
				v-if="showingForm && expanded"
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
			let newBlock = {
				fieldDefinition: this.fieldsets[key].fields,
				blockKey: key,
				content: this.getBlankContent(key, this.fieldsets[key].fields),
				label: this.fieldsets[key].label,
				uniqueKey: this.lastUniqueKey++,
				preview: this.fieldsets[key].preview
			}
			this.blocks.splice(position, 0, JSON.parse(JSON.stringify(newBlock)))
			this.$refs.dialog.close()
			this.addPosition = null
		},
		getBlankContent(key, fields) {
			let content = {'_key': key}
			Object.keys(fields).forEach(fieldName => {
				content[fieldName] = ''
			})
			return content
		},
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
			fieldDefinition: {},
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
		if(this.value){
			this.value.forEach((block, index) => {
				this.blocks.push(
					{
						fieldDefinition: this.fieldsets[block._key].fields,
						blockKey: block._key,
						content: block,
						label: this.fieldsets[block._key].label,
						uniqueKey: index,
						preview: this.fieldsets[block._key].preview
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