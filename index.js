let BuilderBlock = {
	props: ['block', 'index', 'columnsCount'],
	methods: {
		onBlockInput(event) {
			this.$emit("input", this.val)
		},
		showPreview() {
			this.showingPreview = true
			this.$nextTick(function () {
				let postData = {
					preview: this.block.preview,
					blockcontent: this.block.content
				}
				this.$api.post('kirby-builder/preview', postData)
				.then((r) => {
					this.previewFrameContent = r
					this.drawPreviewFrameContent(this.previewFrameContent)
				})
			});
		},
		drawPreviewFrameContent(content) {
			let previewFrame = this.$refs.frame
			let previewDoc = previewFrame.contentWindow.document
			previewDoc.open()
			previewDoc.write(content)
			previewDoc.close()

			previewDoc.body.style.padding = 0
			previewDoc.body.style.margin = 0
			previewDoc.documentElement.style.padding = 0
			previewDoc.documentElement.style.margin = 0

			setTimeout(() => {
				previewFrame.style.height =
					Math.max(previewDoc.body.scrollHeight, previewDoc.body.offsetHeight, previewDoc.documentElement.clientHeight, previewDoc.documentElement.scrollHeight, previewDoc.documentElement.offsetHeight) + 'px'
				this.showingForm = false
			}, 30);
		},
		showForm() {
			this.showingPreview = false
			this.showingForm = true
		}
	},
	watch: {
		index() {
			if (this.showingPreview) {
				this.drawPreviewFrameContent(this.previewFrameContent)
			}
		}
	},
	mounted() {
		this.$nextTick(function () {
			this.pending = false
		});
		if (this.block.preview && this.showingPreview) {
			this.showPreview(this.block.preview)
		}
		if (this.previewFrameContent) {
			this.drawPreviewFrameContent(this.previewFrameContent)
		}
	},
	data() {
		return {
			pending: true,
			showingPreview: false,
			showingForm: true,
			previewFrameContent: null
		}
	},
	template: `
		<div 
			class="kBuilder__block"
			:class="{'kBuilder__block--pending': pending}"
		>
			<div class="kBuilder__blockHeader">
				<k-icon 
					type="sort" 
					:class="'kBuilder__dragDropHandle kBuilder__dragDropHandle--col-' + columnsCount" 
				/>
				{{block.label}}
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
					<k-dropdown-content :ref="'blockActions' + block.uniqueKey">
						<k-dropdown-item icon="copy" @click="$emit('cloneBlock', index)">Clone</k-dropdown-item>
						<k-dropdown-item icon="trash" @click="$emit('deleteBlock', index)">Delete</k-dropdown-item>
					</k-dropdown-content>
				</k-dropdown>
			</div>
			<iframe 
				ref="frame" 
				class="kBuilder__previewFrame" 
				src=""
				v-if="block.preview && showingPreview"></iframe>
			<k-fieldset 
				class="kBuilder__blockForm"
				v-model="block.content" 
				:fields="block.fieldDefinition" 
				v-on="$listeners"
				v-if="showingForm"
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
		preview: Object
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
		console.log('1', this.fieldsets)
		if(this.value){
			this.value.forEach((block, index) => {
				console.log(block, this.fieldsets[block._key])
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